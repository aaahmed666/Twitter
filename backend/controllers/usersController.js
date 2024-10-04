import { response } from "express";
import Notification from "../models/notificationModel.js";
import User from "../models/userModel.js";
import bcryptjs from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";

export const getUserProfile = async (req, res) => {
  const username = req.params;
  try {
    const user = await User.findOne({ username }).select("-password");
    if (!user) return res.status(404).json({ message: "User Not Found" });
    res.status(200).json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const followUnfollowUser = async (req, res) => {
  try {
    const { id } = req.params;
    const modifyUser = await User.findById(id);
    const currentUser = await User.findById(req.user._id);

    if (id === req.user._id.toString())
      return res
        .status(400)
        .json({ message: "You Can't Follow/unFollow Your Profile" });
    if (!modifyUser || !currentUser)
      return res.status(400).json({ message: "User does not exist" });

    const isFollowing = modifyUser.followers.includes(id);

    await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
    await User.findByIdAndUpdate(req.user._id, {
      $push: { following: id },
    });
    if (isFollowing) {
      res.status(200).json({ message: "User unfollowed Scucessfully" });
    } else {
      const notification = new Notification({
        type: "follower",
        from: req.user._id,
        to: modifyUser._id,
      });
      await notification.save();
      res.status(200).json({ message: "User followed Scucessfully" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const suggestedUser = async (req, res) => {
  try {
    const userId = req.user._id;
    const usersFollowingByMe = await User.findById(userId).select("following");

    const users = await User.aggregate([
      { $match: { _id: { $ne: userId } } },
      { $sample: { size: 10 } },
    ]);

    const filteredUsers = users.filter(
      (user) => !usersFollowingByMe.following.includes(user._id)
    );

    const suggestedUsers = filteredUsers.slice(0, 4);
    suggestedUsers.forEach((user) => (user.password = null));

    response.status(200).json(suggestedUsers);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const { fullName, name, email, bio, link, currentPassword, newPassword } =
      req.body;
    let { profileImg, coverImg } = req.body;

    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (
      (!currentPassword && newPassword) ||
      (!newPassword && currentPassword)
    ) {
      return res.status(404).json({
        message: "Please Provied Both new Password and Current Password",
      });
    }

    if (currentPassword && newPassword) {
      const isMatch = await bcryptjs.compare(currentPassword, user.password);
      if (!isMatch)
        return res.status(404).json({ message: "Invalid Password" });

      const salt = await bcryptjs.genSalt(10);
      user.password = await bcryptjs.hash(newPassword, salt);
    }

    if (profileImg) {
      if (user.profileImg) {
        await cloudinary.destroy(
          user.profileImg.split("/").pop().split(".")[0]
        );
      }

      const uploadedResponse = await cloudinary.uploader.upload(profileImg);
      profileImg = uploadedResponse.secure_url;
    }

    if (coverImg) {
      if (user.coverImg) {
        await cloudinary.destroy(user.coverImg.split("/").pop().split(".")[0]);
      }

      const uploadedResponse = await cloudinary.uploader.upload(coverImg);
      coverImg = uploadedResponse.secure_url;
    }

    user.fullName = fullName || user.fullName;
    user.name = name || user.name;
    user.email = email || user.email;
    user.profileImg = profileImg || user.profileImg;
    user.coverImg = coverImg || user.coverImg;
    user.bio = bio || user.bio;
    user.link = link || user.link;

    user = await user.save();
    user.password = null;
    return res.status(200).json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

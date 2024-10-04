import Post from "../models/postModel.js";
import User from "../models/userModel.js";
import { v2 as cloudinary } from "cloudinary";
import Notification from "../models/notificationModel.js";

export const createPost = async (req, res) => {
  try {
    const { text } = req.body;
    let { img } = req.body;
    const userId = req.user._id.toString();

    const user = await User.findById(userId);
    if (!user) res.status(404).json({ message: "User not found" });

    if (!text && !img) {
      return res.status(400).json({ message: "Post must have image or text" });
    }

    if (img) {
      const uploadedResponse = await cloudinary.uploader.upload(img);
      img = uploadedResponse.secure_url;
    }

    const newPost = await Post({
      user: userId,
      text,
      img,
    });

    await newPost.save();

    return res
      .status(201)
      .json({ data: newPost, message: "new post saved successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) res.status(404).json({ message: "Post not found" });
    if (post.img) {
      await cloudinary.destroy(post.img.split("/").pop().split(".")[0]);
    }

    await Post.findByIdAndDelete(req.params.id);
    return res.status(201).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
export const commentPost = async (req, res) => {
  try {
    const { text } = req.body;
    const postId = req.params.id;
    const userId = req.user._id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Not Found" });
    }

    const comment = { text, userId };
    post.comments.push(comment);
    post.save();
    return res.status(200).json({
      data: post,
      message: "Comment added successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
export const likeUnLikePost = async (req, res) => {
  try {
    const userId = req.user._id;
    const postId = req.params.id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const userLikePost = post.likes.includes(userId);
    if (userLikePost) {
      await Post.updateOne({ _id: postId }, { $pull: { like: userId } });
      await User.updateOne({ _id: userId }, { $pull: { likedPosts: postId } });
      res.status(200).json({ message: "Post Unliked Successfully" });
    } else {
      post.likes.push(userId);
      await User.updateOne({ _id: userId }, { $push: { likedPosts: postId } });
      await post.save();
      const notification = new Notification({
        from: userId,
        to: post.user,
        type: "like",
      });
      await notification.save();
      res.status(200).json({ message: "Post liked Successfully" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate({ path: "username", select: "-password" })
      .populate({ path: "comments.user", select: "-password" });
    if (posts.length === 0) {
      return res.status(200).json([]);
    }
    return res.status(200).json(posts);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getLikedPosts = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const likedPosts = await User.find({ _id: { $in: user.likedPosts } })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({ path: "comments.user", select: "-password" });

    res.status(200).json(likedPosts);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getFollowingPosts = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) res.status(404).json({ message: "User not found" });

    const following = user.following;
    const feedPosts = await Post.find({ user: { $in: following } })
      .sort({
        createdAt: -1,
      })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({ path: "comments.user", select: "-password" });
    res.status(200).json(feedPosts);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getUserPosts = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "User not found" });

    const posts = await Post.find({ user: user._id })
      .sort({
        createdAt: -1,
      })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({ path: "comments.user", select: "-password" });

    res.status(200).json(posts);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

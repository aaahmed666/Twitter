import User from "../models/userModel.js";
import bycrypt from "bcryptjs";
import { generateTokenAndSetCookie } from "../utils/genrateToken.js";
export const signup = async (req, res) => {
  try {
    const { fullName, username, email, password } = req.body;

    const existingName = await User.findOne({ username });
    if (existingName) {
      return res.status(400).json({ message: "existing username" });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "existing email" });
    }

    const salt = await bycrypt.genSalt(10);
    const hashedPassword = await bycrypt.hash(password, salt);

    const newUser = new User({
      username,
      fullName,
      email,
      password: hashedPassword,
    });

    if (newUser) {
      generateTokenAndSetCookie(newUser._id, res);
      await newUser.save();
      return res.status(200).json({ message: "created", data: newUser });
    } else {
      return res.status(400).json({ message: "wrong user" });
    }
  } catch (error) {
    console.log(error);
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    const isPasswordCorrect = bycrypt.compare(password, user.password);
    if (!user || !isPasswordCorrect) {
      return res.status(404).json({ message: "not found" });
    }
    generateTokenAndSetCookie(user._id, res);
    res.status(200).json({ message: "login", data: user });
  } catch (error) {
    console.log(error);
  }
};

export const logout = async (req, res) => {
  res.json({ data: "you hit logout button" });
};

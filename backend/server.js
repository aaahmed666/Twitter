import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import authRoute from "./routes/authRoute.js";
import usersRoute from "./routes/usersRoutes.js";
import postsRoute from "./routes/postsRoute.js";
import notificationRoute from "./routes/notificationRoute.js";

import connectMongoDB from "./db/connectMongoDB.js";
import { v2 as cloudinary } from "cloudinary";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDNAIRY_NAME,
  api_key: process.env.CLOUDNAIRY_API_KEY,
  api_secret: process.env.CLOUDNAIRY_API_SECRET,
});

const app = express();
const port = process.env.PORT || 5001;

console.log(
  process.env.MONGO_URI,
  process.env.CLOUDNAIRY_NAME,
  process.env.CLOUDNAIRY_API_KEY,
  process.env.CLOUDNAIRY_API_SECRET
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use("/api/auth", authRoute);
app.use("/api/users", usersRoute);
app.use("/api/posts", postsRoute);
app.use("/api/notification", notificationRoute);

connectMongoDB();
app.listen(port);

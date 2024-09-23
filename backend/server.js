import express from "express";
import dotenv from "dotenv";
import authRoute from "./routes/authRoute.js";
import connectMongoDB from "./db/connectMongoDB.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 8000;

console.log(process.env.MONGO_URI);

app.use("/api/auth", authRoute);

app.listen(port, () => connectMongoDB());

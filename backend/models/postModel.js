import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "User",
    },
    text: {
      type: String,
    },
    img: {
      type: String,
    },
    likes: [
      {
        type: mongoose.Types.ObjectId,
        ref: "User",
      },
    ],
    comments: [
      {
        text: {
          type: String,
          required: true,
        },
        user: {
          type: mongoose.Types.ObjectId,
          required: true,
          ref: "User",
        },
      },
    ],
  },
  { timestamps: true }
);

const Post = mongoose.model("Post", postSchema);

export default Post;

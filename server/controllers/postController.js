import fs from "fs";
import imagekit from "../configs/imageKit.js";
import Post from "../models/Post.js";
import User from "../models/User.js";
import Message from "../models/Message.js"; // ✅ Message model for chat

// SSE connections store
const connections = {}; // This will store { userId: res }

// Add Post
export const addPost = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { content, post_type } = req.body;
    const images = req.files || [];

    let image_urls = [];

    if (images.length) {
      image_urls = await Promise.all(
        images.map(async (image) => {
          const fileBuffer = fs.readFileSync(image.path);
          const response = await imagekit.upload({
            file: fileBuffer,
            fileName: image.originalname,
            folder: "posts",
          });
          return imagekit.url({
            path: response.filePath,
            transformation: [
              { quality: "auto" },
              { format: "webp" },
              { width: "1280" },
            ],
          });
        })
      );
    }

    await Post.create({ user: userId, content, image_urls, post_type });
    res.json({ success: true, message: "Post created successfully" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Get Feed Posts
export const getFeedPosts = async (req, res) => {
  try {
    const { userId } = req.auth();
    const user = await User.findById(userId);
    if (!user) return res.json({ success: false, message: "User not found" });

    const userIds = [userId, ...(user.connections || []), ...(user.following || [])];
    const posts = await Post.find({ user: { $in: userIds } })
      .populate({ path: "user", select: "_id full_name username profile_picture" })
      .populate({ path: "comments.user", select: "_id full_name username profile_picture" })
      .sort({ createdAt: -1 });

    res.json({ success: true, posts });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Like/Unlike Post
export const likePost = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { postId } = req.body;

    const post = await Post.findById(postId);
    if (!post) return res.json({ success: false, message: "Post not found" });

    if (post.likes_count.includes(userId)) {
      post.likes_count = post.likes_count.filter(id => id !== userId);
      await post.save();
      return res.json({ success: true, message: "Post unliked" });
    } else {
      post.likes_count.push(userId);
      await post.save();
      return res.json({ success: true, message: "Post liked" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Add Comment
export const commentPost = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { postId, text } = req.body;

    if (!text?.trim()) return res.json({ success: false, message: "Comment cannot be empty" });

    const post = await Post.findById(postId);
    if (!post) return res.json({ success: false, message: "Post not found" });

    const comment = { user: userId, text, createdAt: new Date() };
    post.comments.push(comment);
    await post.save({ validateBeforeSave: false });

    const populatedPost = await Post.findById(post._id)
      .populate({ path: "comments.user", select: "_id full_name username profile_picture" });
    const lastComment = populatedPost.comments[populatedPost.comments.length - 1];

    res.json({ success: true, comment: lastComment });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Get Comments
export const getPostComments = async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await Post.findById(postId)
      .populate({ path: "comments.user", select: "_id full_name username profile_picture" });
    if (!post) return res.json({ success: false, message: "Post not found" });

    res.json({ success: true, comments: post.comments });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Delete Comment
export const deleteComment = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { postId, commentId } = req.body;

    if (!postId || !commentId)
      return res.json({ success: false, message: "Missing postId or commentId" });

    const post = await Post.findById(postId);
    if (!post) return res.json({ success: false, message: "Post not found" });

    const comment = post.comments.find(c => c._id.toString() === commentId);
    if (!comment) return res.json({ success: false, message: "Comment not found" });

    if (comment.user.toString() !== userId)
      return res.json({ success: false, message: "Not authorized" });

    post.comments = post.comments.filter(c => c._id.toString() !== commentId);
    await post.save({ validateBeforeSave: false });

    res.json({ success: true, message: "Comment deleted" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// ✅ Share Post to Chat (Real-time via SSE)
export const sharePost = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { postId, to_user_id } = req.body;

    const post = await Post.findById(postId);
    if (!post) return res.json({ success: false, message: "Post not found" });

    // Create shared message
    const sharedMessage = await Message.create({
      from_user_id: userId,
      to_user_id,
      isShared: true,
      originalPostId: postId,
      message_type: "text",
      text: "Shared a post",
    });

    // Real-time SSE push if the recipient is connected
    if (connections[to_user_id]) {
      const messageWithUser = await Message.findById(sharedMessage._id).populate("from_user_id");
      connections[to_user_id].write(`data: ${JSON.stringify(messageWithUser)}\n\n`);
    }

    res.json({ success: true, message: sharedMessage });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

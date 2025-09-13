import mongoose from 'mongoose';

// Schema for a comment embedded inside a post
const commentSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true }, // Unique ID for each comment
    user: { type: String, ref: 'User', required: true },       // Use string for Clerk ID
    text: { type: String, required: true, trim: true },
    createdAt: { type: Date, default: Date.now }
}, { _id: true });

// Main Post schema
const postSchema = new mongoose.Schema({
    user: { type: String, ref: 'User', required: true },      // String ID
    content: { type: String },
    image_urls: [{ type: String }],
    post_type: { type: String, enum: ['text', 'image', 'text_with_image'], required: true },
    likes_count: [{ type: String, ref: 'User' }],            // String IDs
    comments: [commentSchema] // Array of embedded comments
}, { timestamps: true, minimize: false });

const Post = mongoose.model('Post', postSchema);

export default Post;

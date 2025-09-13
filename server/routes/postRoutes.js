import express from 'express';
import { upload } from '../configs/multer.js';
import { protect } from '../middleware/auth.js';
import { 
    addPost, 
    getFeedPosts, 
    likePost, 
    commentPost, 
    getPostComments, 
    deleteComment 
} from '../controllers/postController.js';

const postRouter = express.Router();

// Routes
postRouter.post('/add', upload.array('images', 4), protect, addPost);      // Add a new post
postRouter.get('/feed', protect, getFeedPosts);                            // Get feed posts
postRouter.post('/like', protect, likePost);                               // Like/unlike a post
postRouter.post('/comment', protect, commentPost);                         // Add a comment
postRouter.get('/comments/:postId', protect, getPostComments);             // Get comments for a post
postRouter.post('/delete-comment', protect, deleteComment);                // Delete a comment (POST)

export default postRouter;

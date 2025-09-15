import express from 'express';
import {
  acceptConnectionRequest,
  discoverUsers,
  followUser,
  getUserConnections,
  getUserData,
  getUserProfiles,
  sendConnectionRequest,
  unfollowUser,
  updateUserData,
  getFollowersFollowing
} from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../configs/multer.js';
import { getUserRecentMessages } from '../controllers/messageController.js';

const userRouter = express.Router();

// User data routes
userRouter.get('/data', protect, getUserData);
userRouter.post(
  '/update',
  upload.fields([{ name: 'profile', maxCount: 1 }, { name: 'cover', maxCount: 1 }]),
  protect,
  updateUserData
);

// Discovery & connections
userRouter.post('/discover', protect, discoverUsers);
userRouter.post('/follow', protect, followUser);
userRouter.post('/unfollow', protect, unfollowUser);
userRouter.post('/connect', protect, sendConnectionRequest);
userRouter.post('/accept', protect, acceptConnectionRequest);

// Get user connections / followers
userRouter.get('/connections', protect, getUserConnections);
userRouter.get('/followers-following', protect, getFollowersFollowing);

// User profiles
userRouter.post('/profiles', getUserProfiles);

// ✅ Recent messages route (sent + received)
userRouter.get('/recent-messages', protect, getUserRecentMessages);

export default userRouter;

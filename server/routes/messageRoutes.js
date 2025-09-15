import express from 'express';
import { 
  getChatMessages, 
  sendMessage, 
  sseController, 
  sharePostController // ✅ Added
} from '../controllers/messageController.js';
import { upload } from '../configs/multer.js';
import { protect } from '../middleware/auth.js';

const messageRouter = express.Router();

// SSE connection
messageRouter.get('/:userId', sseController);

// Send normal text/image message
messageRouter.post('/send', upload.single('image'), protect, sendMessage);

// Get chat messages
messageRouter.post('/get', protect, getChatMessages);

// ✅ Share a post as a chat message
messageRouter.post('/share', protect, sharePostController);

export default messageRouter;

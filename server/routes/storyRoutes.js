import  express from 'express'
import { upload } from '../configs/multer.js'
import { protect } from '../middleware/auth.js'
import { adduserStory, getStories } from '../controllers/storyController.js'


const storyRouter = express.Router()

storyRouter.post('/create',upload.single('media'),protect,adduserStory)
storyRouter.get('/get',protect,getStories)


export default storyRouter
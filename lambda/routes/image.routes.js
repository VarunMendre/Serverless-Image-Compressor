import { Router } from 'express';
import { uploadImage, checkStatus } from '../controllers/image.controller.js';
import { upload } from '../middlewares/multer.middleware.js';

const router = Router();

// Routes
router.route('/upload').post(upload.single('image'), uploadImage);
router.route('/status/:key').get(checkStatus);

export default router;

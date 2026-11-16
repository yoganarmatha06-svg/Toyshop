import express from 'express';
import {
  registerUser,
  loginUser,
  adminLogin,
  getUserProfile,
  updateUserProfile,
  uploadAvatar,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/admin-login', adminLogin);
router.post('/upload-avatar', protect, upload.single('avatar'), uploadAvatar);
router.route('/profile').get(protect, getUserProfile).put(protect, updateUserProfile);

export default router;


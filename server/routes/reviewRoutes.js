import express from 'express';
import {
  getProductReviews,
  createProductReview,
  getAllReviews,
  deleteReview,
} from '../controllers/reviewController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/product/:productId').get(getProductReviews).post(protect, createProductReview);
router.route('/').get(protect, admin, getAllReviews);
router.route('/:id').delete(protect, admin, deleteReview);

export default router;


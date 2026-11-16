import express from 'express';
import {
  getWishlist,
  toggleWishlistItem,
  removeFromWishlist,
} from '../controllers/wishlistController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getWishlist);
router.route('/:productId').post(toggleWishlistItem).delete(removeFromWishlist);

export default router;


import express from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from '../controllers/cartController.js';
import { protect, optionalProtect } from '../middleware/authMiddleware.js';

const router = express.Router();

// POST /api/cart: Supports both authenticated users and guest users with required details
router.post('/', optionalProtect, addToCart);

// Other cart routes require authentication
router.get('/', protect, getCart);
router.delete('/', protect, clearCart);
router.route('/:productId').put(protect, updateCartItem).delete(protect, removeFromCart);

export default router;

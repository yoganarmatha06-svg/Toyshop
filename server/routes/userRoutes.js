import express from 'express';
import {
  getUserAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// User address routes
router.use('/addresses', protect);
router.route('/addresses').get(getUserAddresses).post(addAddress);
router.route('/addresses/:id').put(updateAddress).delete(deleteAddress);
router.put('/addresses/:id/default', setDefaultAddress);

// Admin user management routes
router.route('/').get(protect, admin, getAllUsers);
router
  .route('/:id')
  .get(protect, admin, getUserById)
  .put(protect, admin, updateUser)
  .delete(protect, admin, deleteUser);

export default router;


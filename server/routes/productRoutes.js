import express from 'express';
import {
  getProducts,
  getFeaturedProducts,
  getBestSellers,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadImages,
  getProductFilterMeta,
} from '../controllers/productController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.route('/').get(getProducts).post(protect, admin, createProduct);
router.get('/featured', getFeaturedProducts);
router.get('/bestsellers', getBestSellers);
router.get('/meta/filters', getProductFilterMeta);
router.post('/upload', upload.array('images', 50), uploadImages);
router
  .route('/:id')
  .get(getProductById)
  .put(protect, admin, updateProduct)
  .delete(protect, admin, deleteProduct);

export default router;


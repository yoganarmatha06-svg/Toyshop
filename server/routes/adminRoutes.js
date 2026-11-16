import express from 'express';
import { getDashboardStats, getSalesReports } from '../controllers/adminController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, admin);

router.get('/dashboard-stats', getDashboardStats);
router.get('/sales-reports', getSalesReports);

export default router;


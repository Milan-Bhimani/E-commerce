import express from 'express';
import {
  createOrder,
  getOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus
} from '../controllers/orderController.js';
import { authenticate as protect, isAdmin as admin } from '../middleware/auth.js';

const router = express.Router();

// Protected routes
router.route('/')
  .post(protect, createOrder)
  .get(protect, admin, getAllOrders);

router.get('/my-orders', protect, getMyOrders);
router.get('/:id', protect, getOrder);
router.put('/:id/status', protect, admin, updateOrderStatus);

export default router; 
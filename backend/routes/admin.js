import express from 'express';
import { authenticate, isAdmin } from '../middleware/auth.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Order from '../models/Order.js';
import Activity from '../models/Activity.js'; // Import Activity model

const router = express.Router();

// Get admin dashboard statistics
router.get('/stats', authenticate, isAdmin, async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalUsers = await User.countDocuments();
    
    // Assuming you have an Order model with a 'totalPrice' field
    const totalOrders = await Order.countDocuments();
    const result = await Order.aggregate([{ $group: { _id: null, totalRevenue: { $sum: '$totalPrice' } } }]);
    const totalRevenue = result.length > 0 ? result[0].totalRevenue : 0;

    // Mock data for Orders and Revenue if Order model is not available (REMOVE THIS AFTER IMPLEMENTING ORDER CREATION)
    // const totalOrders = 0;
    // const totalRevenue = 0;
    
    res.json({
      totalProducts,
      totalUsers,
      totalOrders,
      totalRevenue
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get recent activities (admin only)
router.get('/recent-activity', authenticate, isAdmin, async (req, res) => {
  try {
    const recentActivities = await Activity.find()
      .populate('user', 'name') // Populate user name for user_registered activity
      .populate('product', 'name') // Populate product name for product_stock_updated activity
      .sort({ createdAt: -1 })
      .limit(10); // Get the 10 most recent activities
    
    res.json(recentActivities);
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// REMOVE THESE ENDPOINTS AS WE NOW HAVE A GENERAL ACTIVITY ENDPOINT
// router.get('/recent-users', authenticate, isAdmin, async (req, res) => { ... });
// router.get('/recent-orders', authenticate, isAdmin, async (req, res) => { ... });

// Get all users (admin only)
router.get('/users', authenticate, isAdmin, async (req, res) => {
  try {
    // Exclude password when fetching users
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a user by ID (admin only)
router.delete('/users/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Optionally log activity for user deletion
    // await Activity.create({
    //   type: 'user_deleted',
    //   description: `User ${user.name || user.email} deleted`,
    //   user: user._id,
    //   // Consider adding actor field if you log who performed the action
    // });
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all orders (admin only)
router.get('/orders', authenticate, isAdmin, async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'id name email') // Populate user details
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single order by ID (admin only)
router.get('/orders/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'id name email') // Populate user details
      .populate('items.product', 'id name price image'); // Populate product details for each item

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update order status (e.g., isPaid, isDelivered) (admin only)
router.put('/orders/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Update fields based on request body (e.g., { isPaid: true, isDelivered: true })
    if (req.body.isPaid !== undefined && req.body.isPaid !== order.isPaid) {
        order.isPaid = req.body.isPaid;
        order.paidAt = req.body.isPaid ? new Date() : undefined;
        // Log activity for payment status update (optional)
        // await Activity.create({
        //   type: 'order_status_updated',
        //   description: `Order ${order._id.slice(-6)} payment status updated to ${order.isPaid ? 'Paid' : 'Not Paid'}`,
        //   order: order._id,
        //   user: req.user.id
        // });
    }

     if (req.body.isDelivered !== undefined && req.body.isDelivered !== order.isDelivered) {
        order.isDelivered = req.body.isDelivered;
        order.deliveredAt = req.body.isDelivered ? new Date() : undefined;
         // Log activity for delivery status update (optional)
        // await Activity.create({
        //   type: 'order_status_updated',
        //   description: `Order ${order._id.slice(-6)} delivery status updated to ${order.isDelivered ? 'Delivered' : 'Not Delivered'}`,
        //   order: order._id,
        //   user: req.user.id
        // });
    }

    // Add more updateable fields as needed

    const updatedOrder = await order.save();

    res.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Optional: Delete an order (admin only)
// router.delete('/orders/:id', authenticate, isAdmin, async (req, res) => { ... });

export default router; 
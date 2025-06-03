import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Authenticate middleware
export const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Fetch the complete user data
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Set user data in request
    req.user = {
      _id: user._id,
      isAdmin: user.role === 'admin',
      role: user.role,
      shopkeeperStatus: user.shopkeeperStatus
    };
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Admin middleware
export const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Shopkeeper middleware
export const isShopkeeper = (req, res, next) => {
  if (req.user.role !== 'shopkeeper' || req.user.shopkeeperStatus !== 'approved') {
    return res.status(403).json({ message: 'Approved shopkeeper access required' });
  }
  next();
};
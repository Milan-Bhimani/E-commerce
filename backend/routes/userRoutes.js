import express from 'express';
import User from '../models/User.js';
import { authenticate as auth } from '../middleware/auth.js';
import { isAdmin as admin } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

console.log('userRoutes.js loaded');

// Configure multer for document uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/documents';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    const allowedTypes = ['.pdf', '.jpg', '.jpeg', '.png'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, JPG, JPEG, and PNG files are allowed.'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Get user profile
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    
    // Ensure user can only update their own profile
    if (req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ message: 'Not authorized to update this profile' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update profile using the model method
    await user.updateProfile({ name, phone, address });
    
    // Fetch updated user without password
    const updatedUser = await User.findById(req.params.id).select('-password');
    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Request to become shopkeeper
router.post('/:id/become-shopkeeper', auth, upload.array('documents'), async (req, res) => {
  try {
    const {
      businessName,
      businessType,
      businessAddress,
      businessPhone,
      businessEmail,
      gstNumber,
      shopDescription,
      openingHours
    } = req.body;

    // Ensure user can only update their own profile
    if (req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ message: 'Not authorized to update this profile' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Process uploaded documents
    const documents = req.files ? req.files.map(file => ({
      filename: file.originalname,
      path: file.path,
      uploadedAt: new Date()
    })) : [];

    // Update shopkeeper details
    user.isShopkeeper = true;
    user.shopkeeperStatus = 'pending';
    user.shopkeeperDetails = {
      businessName,
      businessType,
      businessAddress,
      businessPhone,
      businessEmail,
      gstNumber,
      shopDescription,
      openingHours,
      documents
    };

    await user.save();
    res.json({ message: 'Shopkeeper request submitted successfully' });
  } catch (error) {
    console.error('Error submitting shopkeeper request:', error);
    // If there's an error, delete any uploaded files
    if (req.files) {
      req.files.forEach(file => {
        fs.unlink(file.path, (err) => {
          if (err) console.error('Error deleting file:', err);
        });
      });
    }
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Admin: Get all shopkeeper requests
router.get('/shopkeeper/requests', [auth, admin], async (req, res) => {
  try {
    console.log('GET /api/users/shopkeeper/requests hit');
    const requests = await User.find({
      isShopkeeper: true,
      shopkeeperStatus: 'pending'
    }).select('-password');
    res.json(requests);
  } catch (error) {
    console.error('Error in GET /api/users/shopkeeper/requests:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Approve/Reject shopkeeper request
router.put('/shopkeeper/:id/status', [auth, admin], async (req, res) => {
  try {
    console.log('PUT /api/users/shopkeeper/:id/status hit');
    const { status, rejectionReason } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    user.shopkeeperStatus = status;
    if (status === 'approved') {
      // Use the new updateRole method
      await user.updateRole('shopkeeper');
    } else if (status === 'rejected') {
      user.rejectionReason = rejectionReason;
      // Delete uploaded documents if request is rejected
      if (user.shopkeeperDetails?.documents) {
        user.shopkeeperDetails.documents.forEach(doc => {
          fs.unlink(doc.path, (err) => {
            if (err) console.error('Error deleting file:', err);
          });
        });
      }
    }

    await user.save();

    // If approved, generate a new token with updated role and send it back
    if (user.shopkeeperStatus === 'approved') {
      const token = jwt.sign(
        { id: user._id, isAdmin: user.isAdmin, role: user.role }, // Include the updated role
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '30d' } // Match your usual token expiration
      );

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development', // Use secure cookies in production
        sameSite: 'Strict', // Prevent CSRF attacks
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
      });
    }

    res.json(user);

  } catch (error) {
    console.error('Error in PUT /api/users/shopkeeper/:id/status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Get all users
router.get('/admin/users', [auth, admin], async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Update user role
router.put('/admin/users/:id/role', [auth, admin], async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!['user', 'admin', 'shopkeeper'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    await user.updateRole(role);
    res.json(user);
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Update user status
router.put('/admin/users/:id/status', [auth, admin], async (req, res) => {
  try {
    const { status } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    user.status = status;
    await user.save();
    res.json(user);
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Delete user
router.delete('/admin/users/:id', [auth, admin], async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent deleting the last admin
    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({ message: 'Cannot delete the last admin user' });
      }
    }

    await user.remove();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 
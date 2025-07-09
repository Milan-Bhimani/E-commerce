import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';
import dotenv from 'dotenv';
import Activity from '../models/Activity.js';

dotenv.config();

const router = express.Router();

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Create new user
    const user = new User({
      name,
      email,
      password,
      isAdmin: false, // Default to regular user
      role: 'user' // Explicitly set role
    });
    
    await user.save();
    
    // Log user registration activity
    await Activity.create({
      type: 'user_registered',
      description: `${user.name} created an account`,
      user: user._id
    });

    // Create JWT token
    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin, role: user.role }, // Include role
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );
    
    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/'
    });
    
    // Return user info (without password)
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        role: user.role // Include role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if admin credentials are configured
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    
    // Check if credentials match admin credentials from .env
    if (adminEmail && adminPassword && email === adminEmail && password === adminPassword) {
      // Create admin user if it doesn't exist
      let adminUser = await User.findOne({ email });
      if (!adminUser) {
        adminUser = new User({
          name: 'Admin',
          email: adminEmail,
          password: adminPassword,
          isAdmin: true,
          role: 'admin' // Set role for admin
        });
        await adminUser.save();
      } else if (!adminUser.isAdmin) {
        // Update existing user to admin if needed
        adminUser.isAdmin = true;
        adminUser.role = 'admin'; // Set role for admin
        await adminUser.save();
      }

      // Create JWT token
      const token = jwt.sign(
        { id: adminUser._id, isAdmin: true, role: 'admin' }, // Include role
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );
      
      // Set cookie
      res.cookie('token', token, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/'
      });
      
      return res.json({
        message: 'Admin login successful',
        user: {
          _id: adminUser._id,
          name: adminUser.name,
          email: adminUser.email,
          isAdmin: true,
          role: 'admin' // Include role
        }
      });
    }
    
    // Regular user login flow
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Create JWT token
    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin, role: user.role }, // Include role
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );
    
    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/'
    });
    
    // Return user info
    res.json({
      message: 'Login successful',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        role: user.role // Include role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Logout user
router.post('/logout', (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/'
  });
  
  res.json({ message: 'Logged out successfully' });
});

// Get current user
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Log the user object to check isAdmin
    console.log('Fetched user in /api/auth/me:', user);

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
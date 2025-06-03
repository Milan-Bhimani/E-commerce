import express from 'express';
import Product from '../models/Product.js';
import { authenticate as auth } from '../middleware/auth.js';
import { isAdmin as admin } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Save to the uploads directory at the backend root
    const uploadDir = path.join(__dirname, '..', 'uploads', 'products');
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
    const allowedTypes = ['.jpg', '.jpeg', '.png', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPG, JPEG, PNG, and WEBP files are allowed.'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Get all products
router.get('/', async (req, res) => {
  try {
    const { category, search, sort, page = 1, limit = 10 } = req.query;
    const query = {};

    // Add category filter if provided
    if (category) {
      query.category = category;
    }

    // Add search filter if provided
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    let sortObj = {};
    if (sort) {
      const [field, order] = sort.split(':');
      sortObj[field] = order === 'desc' ? -1 : 1;
    } else {
      sortObj = { createdAt: -1 }; // Default sort by newest
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const total = await Product.countDocuments(query);

    // Get products with pagination
    const products = await Product.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      products,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalProducts: total
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create product (admin only)
router.post('/', [auth, admin, upload.array('images', 5)], async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      stock,
      specifications
    } = req.body;

    // Process uploaded images
    const images = req.files.map(file => ({
      filename: file.originalname,
      path: `/uploads/products/${path.basename(file.path)}`,
      uploadedAt: new Date()
    }));

    const product = new Product({
      name,
      description,
      price,
      category,
      stock,
      specifications: JSON.parse(specifications || '{}'),
      images
    });

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    // If there's an error, delete any uploaded files
    if (req.files) {
      req.files.forEach(file => {
        fs.unlink(file.path, (err) => {
          if (err) console.error('Error deleting file:', err);
        });
      });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Update product (admin only)
router.put('/:id', [auth, admin, upload.array('images', 5)], async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      stock,
      specifications
    } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Process new images if uploaded
    if (req.files && req.files.length > 0) {
      // Delete old images
      product.images.forEach(image => {
        fs.unlink(image.path, (err) => {
          if (err) console.error('Error deleting old image:', err);
        });
      });

      // Add new images
      product.images = req.files.map(file => ({
        filename: file.originalname,
        path: `/uploads/products/${path.basename(file.path)}`,
        uploadedAt: new Date()
      }));
    }

    // Update other fields
    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price || product.price;
    product.category = category || product.category;
    product.stock = stock || product.stock;
    if (specifications) {
      product.specifications = JSON.parse(specifications);
    }

    await product.save();
    res.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    // If there's an error, delete any uploaded files
    if (req.files) {
      req.files.forEach(file => {
        fs.unlink(file.path, (err) => {
          if (err) console.error('Error deleting file:', err);
        });
      });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete product (admin only)
router.delete('/:id', [auth, admin], async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Delete product images
    product.images.forEach(image => {
      fs.unlink(image.path, (err) => {
        if (err) console.error('Error deleting image:', err);
      });
    });

    await product.deleteOne();
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 
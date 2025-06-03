import express from 'express';
import Product from '../models/Product.js';
import { authenticate, isAdmin, isShopkeeper } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import Activity from '../models/Activity.js';

const router = express.Router();

// Middleware to check if user is admin or approved shopkeeper
const isAdminOrApprovedShopkeeper = (req, res, next) => {
  if (req.user.role === 'admin' || (req.user.role === 'shopkeeper' && req.user.shopkeeperStatus === 'approved')) {
    next();
  } else {
    res.status(403).json({ message: 'Admin or approved shopkeeper privileges required' });
  }
};

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../public/images');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max size
  fileFilter: function(req, file, cb) {
    const filetypes = /jpeg|jpg|png|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    
    cb(new Error('Only image files are allowed'));
  }
});

// Get all products with filtering and pagination
router.get('/', async (req, res) => {
  try {
    const { 
      category, 
      minPrice, 
      maxPrice, 
      search,
      page = 1,
      limit = 10,
      sort = '-createdAt'
    } = req.query;

    const query = {};
    
    // Apply filters
    if (category) query.category = category;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    
    const [products, total] = await Promise.all([
      Product.find(query)
        .sort(sort)
        .skip(skip)
        .limit(Number(limit)),
      Product.countDocuments(query)
    ]);

    res.json({
      products,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
      totalProducts: total
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single product by ID
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

// Create new product with image upload
router.post('/', authenticate, isAdminOrApprovedShopkeeper, upload.single('image'), async (req, res) => {
  try {
    const { name, price, description, stock, category } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ message: 'Product image is required' });
    }

    // Validate required fields
    if (!name || !price || !description || !stock || !category) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const product = new Product({
      name,
      price: Number(price),
      description,
      stock: Number(stock),
      image: `/images/${req.file.filename}`,
      category: category.toLowerCase(),
      shopkeeperId: req.user._id
    });
    
    await product.save();
    
    // Log product creation activity
    await Activity.create({
      type: 'product_created',
      description: `${product.name} was added`,
      product: product._id,
      user: req.user._id
    });

    res.status(201).json({
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    // If there's an error, remove the uploaded file
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting uploaded file:', unlinkError);
      }
    }

    console.error('Error creating product:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => ({
          field: err.path,
          message: err.message
        }))
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({
        message: 'A product with this name already exists'
      });
    }

    // Handle other errors
    res.status(500).json({ 
      message: 'Error creating product',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update product with image upload (admin only)
router.put('/:id', authenticate, isAdmin, upload.single('image'), async (req, res) => {
  try {
    const { name, price, description, stock, category } = req.body;
    
    // Get the existing product before updating to check for stock changes
    const oldProduct = await Product.findById(req.params.id);
    if (!oldProduct) {
      // If product not found, remove the uploaded file
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({ message: 'Product not found' });
    }

    const updateData = {
      name,
      price: Number(price),
      description,
      stock: Number(stock),
      category
    };

    // If new image is uploaded, update the image path and delete the old one
    if (req.file) {
      if (oldProduct.image) {
        const oldImagePath = path.join(__dirname, '../public', oldProduct.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      updateData.image = `/images/${req.file.filename}`;
    }
    
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    
    // Log activity if stock changed
    if (oldProduct.stock !== updatedProduct.stock) {
      await Activity.create({
        type: 'product_stock_updated',
        description: `${updatedProduct.name} stock updated from ${oldProduct.stock} to ${updatedProduct.stock} units`,
        product: updatedProduct._id,
        user: req.user.id // Assuming req.user.id is set by authenticate middleware
      });
    }

    res.json(updatedProduct);
  } catch (error) {
    // If there's an error, remove the uploaded file
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete product (admin or product owner)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user is admin or the product owner
    if (req.user.role !== 'admin' && product.shopkeeperId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this product' });
    }

    // Delete the product image
    if (product.image) {
      const imagePath = path.join(__dirname, '../public', product.image);
      try {
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      } catch (err) {
        console.error('Error deleting product image:', err);
        // Continue with product deletion even if image deletion fails
      }
    }
    
    await product.deleteOne();
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error in product deletion route:', error);
    res.status(500).json({ message: 'Server error during product deletion' });
  }
});

// Get products by shopkeeper ID
router.get('/shopkeeper/:shopkeeperId', async (req, res) => {
  try {
    const products = await Product.find({ shopkeeperId: req.params.shopkeeperId });
    res.json(products);
  } catch (error) {
    console.error('Error fetching products by shopkeeper ID:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'shopkeeper'],
    default: 'user'
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  isShopkeeper: {
    type: Boolean,
    default: false
  },
  shopkeeperStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: null
  },
  shopkeeperDetails: {
    businessName: {
      type: String,
      required: function() { return this.isShopkeeper; }
    },
    businessType: {
      type: String,
      enum: ['retail', 'wholesale', 'manufacturing', 'service', 'other'],
      required: function() { return this.isShopkeeper; }
    },
    businessAddress: {
      type: String,
      required: function() { return this.isShopkeeper; }
    },
    businessPhone: {
      type: String,
      required: function() { return this.isShopkeeper; }
    },
    businessEmail: {
      type: String,
      required: function() { return this.isShopkeeper; }
    },
    gstNumber: {
      type: String,
      required: function() { return this.isShopkeeper; }
    },
    shopDescription: {
      type: String,
      required: function() { return this.isShopkeeper; }
    },
    openingHours: {
      type: String,
      required: function() { return this.isShopkeeper; }
    },
    documents: [{
      filename: String,
      path: String,
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  rejectionReason: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to update profile
userSchema.methods.updateProfile = async function(updates) {
  const allowedUpdates = ['name', 'phone', 'address'];
  Object.keys(updates).forEach(key => {
    if (allowedUpdates.includes(key)) {
      this[key] = updates[key];
    }
  });
  return await this.save();
};

// Method to update role
userSchema.methods.updateRole = async function(newRole) {
  if (['user', 'admin', 'shopkeeper'].includes(newRole)) {
    this.role = newRole;
    return await this.save();
  }
  throw new Error('Invalid role');
};

const User = mongoose.model('User', userSchema);

export default User;
import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['user_registered', 'order_created', 'product_stock_updated', 'product_created'] // Define possible activity types
  },
  description: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  },
  // You could add more fields here like 'actor' if you want to track who performed the action
}, { timestamps: true });

const Activity = mongoose.model('Activity', activitySchema);

export default Activity; 
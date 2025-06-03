const User = require('../models/User');

const shopkeeper = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user.isShopkeeper || user.shopkeeperStatus !== 'approved') {
      return res.status(403).json({ message: 'Access denied. Shopkeeper privileges required.' });
    }
    
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = shopkeeper; 
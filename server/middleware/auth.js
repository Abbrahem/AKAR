const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT token
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'No token, authorization denied' 
      });
    }

    // Check if token is malformed (empty, null, or invalid format)
    if (!token || token === 'null' || token === 'undefined' || token.length < 10) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid token format' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is deactivated' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    // Clear malformed tokens
    res.status(401).json({ 
      success: false,
      message: 'Token is not valid',
      clearToken: true 
    });
  }
};

// Check if user has required role
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Role ${req.user.role} is not authorized to access this resource` 
      });
    }

    next();
  };
};

// Check if user owns the resource or is admin
const ownerOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  // Admin can access everything
  if (req.user.role === 'admin') {
    return next();
  }

  // Check if user owns the resource (resourceUserId should be set in route)
  if (req.resourceUserId && req.resourceUserId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Access denied' });
  }

  next();
};

module.exports = { auth, authorize, ownerOrAdmin };

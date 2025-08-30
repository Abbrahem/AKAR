const express = require('express');
const User = require('../models/User');
const Property = require('../models/Property');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users/dashboard
// @desc    Get user dashboard data
// @access  Private
router.get('/dashboard', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    let dashboardData = {
      user: req.user,
      stats: {}
    };

    switch (userRole) {
      case 'buyer':
        // Get favorite properties
        const favoriteProperties = await Property.find({
          favorites: userId,
          status: 'approved',
          isActive: true
        }).populate('owner', 'name phone').select('-images.data').limit(10);

        // Get recent conversations
        const recentChats = await Property.aggregate([
          {
            $lookup: {
              from: 'messages',
              let: { propertyId: '$_id' },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ['$property', '$$propertyId'] },
                        { $or: [{ $eq: ['$sender', userId] }, { $eq: ['$receiver', userId] }] }
                      ]
                    }
                  }
                },
                { $sort: { createdAt: -1 } },
                { $limit: 1 }
              ],
              as: 'lastMessage'
            }
          },
          {
            $match: { 'lastMessage.0': { $exists: true } }
          },
          {
            $sort: { 'lastMessage.createdAt': -1 }
          },
          { $limit: 5 }
        ]);

        dashboardData.stats = {
          favoriteCount: favoriteProperties.length,
          conversationsCount: recentChats.length
        };
        dashboardData.favoriteProperties = favoriteProperties;
        dashboardData.recentChats = recentChats;
        break;

      case 'seller':
      case 'agent':
        // Get user's properties
        const myProperties = await Property.find({ owner: userId })
          .select('-images.data')
          .sort({ createdAt: -1 })
          .limit(10);

        // Get properties stats
        const propertiesStats = await Property.aggregate([
          { $match: { owner: userId } },
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 },
              totalViews: { $sum: '$views' }
            }
          }
        ]);

        // Get messages count
        const messagesCount = await require('../models/Message').countDocuments({
          $or: [{ sender: userId }, { receiver: userId }]
        });

        dashboardData.stats = {
          totalProperties: myProperties.length,
          totalViews: propertiesStats.reduce((sum, stat) => sum + stat.totalViews, 0),
          messagesCount,
          propertiesByStatus: propertiesStats.reduce((acc, stat) => {
            acc[stat._id] = stat.count;
            return acc;
          }, {})
        };
        dashboardData.myProperties = myProperties;
        break;

      case 'admin':
        // Get admin stats
        const totalUsers = await User.countDocuments();
        const totalProperties = await Property.countDocuments();
        const pendingProperties = await Property.countDocuments({ status: 'pending' });
        const approvedProperties = await Property.countDocuments({ status: 'approved' });

        // Get recent properties for approval
        const pendingPropertiesList = await Property.find({ status: 'pending' })
          .populate('owner', 'name email')
          .select('-images.data')
          .sort({ createdAt: -1 })
          .limit(10);

        dashboardData.stats = {
          totalUsers,
          totalProperties,
          pendingProperties,
          approvedProperties
        };
        dashboardData.pendingProperties = pendingPropertiesList;
        break;
    }

    res.json({
      success: true,
      dashboard: dashboardData
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/my-properties
// @desc    Get user's properties
// @access  Private
router.get('/my-properties', auth, async (req, res) => {
  try {
    const { page = 1, limit = 12, status } = req.query;

    const filter = { owner: req.user._id };
    if (status) filter.status = status;

    const properties = await Property.find(filter)
      .select('-images.data')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Property.countDocuments(filter);

    res.json({
      success: true,
      properties,
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / limit),
        total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get my properties error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/favorites
// @desc    Get user's favorite properties
// @access  Private
router.get('/favorites', auth, async (req, res) => {
  try {
    const { page = 1, limit = 12 } = req.query;

    const properties = await Property.find({
      favorites: req.user._id,
      status: 'approved',
      isActive: true
    })
    .populate('owner', 'name phone')
    .select('-images.data')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

    const total = await Property.countDocuments({
      favorites: req.user._id,
      status: 'approved',
      isActive: true
    });

    res.json({
      success: true,
      properties,
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / limit),
        total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users (Admin only)
// @desc    Get all users
// @access  Private (Admin)
router.get('/', auth, authorize('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;

    const filter = {};
    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') }
      ];
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      users,
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / limit),
        total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/:id/status (Admin only)
// @desc    Update user status
// @access  Private (Admin)
router.put('/:id/status', auth, authorize('admin'), async (req, res) => {
  try {
    const { isActive } = req.body;
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = isActive;
    await user.save();

    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

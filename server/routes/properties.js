const express = require('express');
const multer = require('multer');
const { body, validationResult } = require('express-validator');
const Property = require('../models/Property');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { auth, authorize, ownerOrAdmin } = require('../middleware/auth');

const router = express.Router();

// Configure multer for image upload
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 10 // Maximum 10 files
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// @route   GET /api/properties
// @desc    Get all properties with filtering and pagination
// @access  Public
router.get('/', async (req, res) => {
  try {
    console.log('Get properties request:', req.query);
    
    const {
      page = 1,
      limit = 12,
      propertyType,
      listingType,
      minPrice,
      maxPrice,
      city,
      country,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      featured
    } = req.query;

    // Build filter object - show all properties for now
    const filter = {};

    if (propertyType) filter.propertyType = propertyType;
    if (listingType) filter.listingType = listingType;
    if (city) filter['location.city'] = new RegExp(city, 'i');
    if (country) filter['location.country'] = new RegExp(country, 'i');
    if (featured === 'true') filter.featured = true;

    // Price range filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // Sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const skip = (Number(page) - 1) * Number(limit);
    
    const [properties, total] = await Promise.all([
      Property.find(filter)
        .populate('owner', 'name email phone role')
        .sort(sort)
        .skip(skip)
        .limit(Number(limit))
        .select('-images.data'), // Exclude image data for performance
      Property.countDocuments(filter)
    ]);

    console.log(`Found ${properties.length} properties`);

    res.json({
      success: true,
      properties,
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / Number(limit)),
        total,
        hasNext: skip + Number(limit) < total,
        hasPrev: Number(page) > 1
      }
    });
  } catch (error) {
    console.error('Get properties error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/properties/:id
// @desc    Get single property by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('owner', 'name email phone avatar location')
      .select('-images.data'); // Exclude image data initially

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Increment views
    await property.incrementViews();

    res.json({
      success: true,
      property
    });
  } catch (error) {
    console.error('Get property error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/properties/:id/images/:imageId
// @desc    Get property image
// @access  Public
router.get('/:id/images/:imageId', async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    const image = property.images.id(req.params.imageId);
    
    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }

    res.set('Content-Type', image.contentType);
    res.send(image.data);
  } catch (error) {
    console.error('Get image error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/properties
// @desc    Create new property
// @access  Private (Seller, Agent, Admin)
router.post('/', auth, authorize('seller', 'agent', 'admin'), upload.array('images', 10), async (req, res) => {
  try {
    console.log('Property creation request:', {
      body: req.body,
      files: req.files?.length || 0,
      user: req.user?._id
    });

    // Process images if provided
    const images = req.files ? req.files.map(file => ({
      data: file.buffer,
      contentType: file.mimetype,
      filename: file.originalname,
      size: file.size
    })) : [];

    // Create property data using actual user input with defaults
    const propertyData = {
      title: req.body.title || 'عقار جديد',
      description: req.body.description || 'وصف العقار',
      price: Number(req.body.price) || 100000,
      propertyType: req.body.propertyType || 'apartment',
      listingType: req.body.listingType || 'sale',
      location: {
        address: req.body['location.address'] || req.body.location?.address || 'العنوان',
        city: req.body['location.city'] || req.body.location?.city || 'القاهرة',
        country: req.body['location.country'] || req.body.location?.country || 'مصر',
        detailedAddress: req.body['location.detailedAddress'] || req.body.location?.detailedAddress
      },
      area: {
        value: req.body['area.value'] || req.body.area?.value ? Number(req.body['area.value'] || req.body.area?.value) : undefined,
        unit: req.body['area.unit'] || req.body.area?.unit || 'sqm'
      },
      bedrooms: req.body.bedrooms ? Number(req.body.bedrooms) : 2,
      bathrooms: req.body.bathrooms ? Number(req.body.bathrooms) : 1,
      currency: req.body.currency || 'EGP',
      owner: req.user._id,
      images,
      features: {},
      status: 'pending'
    };

    // Parse features if provided
    try {
      if (req.body.features) {
        propertyData.features = typeof req.body.features === 'string' 
          ? JSON.parse(req.body.features) 
          : req.body.features;
      }
    } catch (e) {
      propertyData.features = [];
    }

    const property = new Property(propertyData);
    await property.save();

    // Notify admin for approval
    const admins = await User.find({ role: 'admin' });
    const notifications = admins.map(admin => ({
      recipient: admin._id,
      sender: req.user._id,
      type: 'property_approval_needed',
      title: 'New Property Pending Approval',
      message: `${req.user.name} has submitted a new property for approval`,
      relatedProperty: property._id,
      actionUrl: `/admin/properties/${property._id}`
    }));

    await Notification.insertMany(notifications);

    // Emit real-time notification to admins
    const io = req.app.get('io');
    admins.forEach(admin => {
      io.to(admin._id.toString()).emit('receive_notification', {
        type: 'property_approval_needed',
        title: 'New Property Pending Approval',
        message: `${req.user.name} has submitted a new property for approval`
      });
    });

    res.status(201).json({
      success: true,
      property: await Property.findById(property._id).populate('owner', 'name email phone').select('-images.data')
    });
  } catch (error) {
    console.error('Create property error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/properties/:id
// @desc    Update property
// @access  Private (Owner, Admin)
router.put('/:id', auth, upload.array('images', 10), async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Check ownership
    if (property.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this property' });
    }

    // Update fields
    const updateFields = ['title', 'description', 'price', 'propertyType', 'listingType', 'bedrooms', 'bathrooms', 'area', 'location'];
    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        property[field] = req.body[field];
      }
    });

    // Update features if provided
    if (req.body.features) {
      property.features = JSON.parse(req.body.features);
    }

    // Add new images if provided
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => ({
        data: file.buffer,
        contentType: file.mimetype,
        filename: file.originalname,
        size: file.size
      }));
      property.images.push(...newImages);
    }

    // Reset status to pending if significant changes made
    if (req.user.role !== 'admin') {
      property.status = 'pending';
    }

    await property.save();

    res.json({
      success: true,
      property: await Property.findById(property._id).populate('owner', 'name email phone').select('-images.data')
    });
  } catch (error) {
    console.error('Update property error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/properties/:id
// @desc    Delete property
// @access  Private (Owner, Admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Check ownership
    if (property.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this property' });
    }

    await Property.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Property deleted successfully'
    });
  } catch (error) {
    console.error('Delete property error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/properties/:id/favorite
// @desc    Toggle property favorite
// @access  Private
router.post('/:id/favorite', auth, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    const isFavorited = property.favorites.includes(req.user._id);
    
    if (isFavorited) {
      property.favorites.pull(req.user._id);
    } else {
      property.favorites.push(req.user._id);
    }

    await property.save();

    res.json({
      success: true,
      isFavorited: !isFavorited,
      favoritesCount: property.favorites.length
    });
  } catch (error) {
    console.error('Toggle favorite error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/properties/:id/approve
// @desc    Approve property (Admin only)
// @access  Private (Admin)
router.put('/:id/approve', auth, authorize('admin'), async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate('owner');
    
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    property.status = 'approved';
    property.approvedBy = req.user._id;
    property.approvedAt = new Date();
    await property.save();

    // Notify property owner
    const notification = new Notification({
      recipient: property.owner._id,
      sender: req.user._id,
      type: 'property_approved',
      title: 'Property Approved',
      message: `Your property "${property.title}" has been approved and is now live`,
      relatedProperty: property._id
    });
    await notification.save();

    // Emit real-time notification
    const io = req.app.get('io');
    io.to(property.owner._id.toString()).emit('receive_notification', {
      type: 'property_approved',
      title: 'Property Approved',
      message: `Your property "${property.title}" has been approved and is now live`
    });

    res.json({
      success: true,
      message: 'Property approved successfully'
    });
  } catch (error) {
    console.error('Approve property error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/properties/:id/reject
// @desc    Reject property (Admin only)
// @access  Private (Admin)
router.put('/:id/reject', auth, authorize('admin'), [
  body('reason').notEmpty().withMessage('Rejection reason is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const property = await Property.findById(req.params.id).populate('owner');
    
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    property.status = 'rejected';
    property.rejectionReason = req.body.reason;
    await property.save();

    // Notify property owner
    const notification = new Notification({
      recipient: property.owner._id,
      sender: req.user._id,
      type: 'property_rejected',
      title: 'Property Rejected',
      message: `Your property "${property.title}" has been rejected. Reason: ${req.body.reason}`,
      relatedProperty: property._id
    });
    await notification.save();

    // Emit real-time notification
    const io = req.app.get('io');
    io.to(property.owner._id.toString()).emit('receive_notification', {
      type: 'property_rejected',
      title: 'Property Rejected',
      message: `Your property "${property.title}" has been rejected`
    });

    res.json({
      success: true,
      message: 'Property rejected successfully'
    });
  } catch (error) {
    console.error('Reject property error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Property title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Property description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'EGP', 'SAR', 'AED']
  },
  propertyType: {
    type: String,
    required: [true, 'Property type is required'],
    enum: ['apartment', 'house', 'villa', 'office', 'shop', 'warehouse', 'land']
  },
  listingType: {
    type: String,
    required: [true, 'Listing type is required'],
    enum: ['sale', 'rent']
  },
  bedrooms: {
    type: Number,
    min: [0, 'Bedrooms cannot be negative'],
    max: [20, 'Bedrooms cannot exceed 20']
  },
  bathrooms: {
    type: Number,
    min: [0, 'Bathrooms cannot be negative'],
    max: [20, 'Bathrooms cannot exceed 20']
  },
  area: {
    value: {
      type: Number,
      required: [true, 'Area is required'],
      min: [1, 'Area must be at least 1']
    },
    unit: {
      type: String,
      enum: ['sqm', 'sqft'],
      default: 'sqm'
    }
  },
  location: {
    address: {
      type: String,
      required: [true, 'Address is required']
    },
    city: {
      type: String,
      required: [true, 'City is required']
    },
    state: String,
    country: { type: String, default: 'Saudi Arabia' },
    zipCode: String
  },
  images: [{
    data: {
      type: Buffer,
      required: true
    },
    contentType: {
      type: String,
      required: true
    },
    filename: String,
    size: Number,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  features: {
    parking: { type: Boolean, default: false },
    garden: { type: Boolean, default: false },
    pool: { type: Boolean, default: false },
    elevator: { type: Boolean, default: false },
    balcony: { type: Boolean, default: false },
    furnished: { type: Boolean, default: false },
    airConditioning: { type: Boolean, default: false },
    heating: { type: Boolean, default: false },
    security: { type: Boolean, default: false },
    gym: { type: Boolean, default: false }
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'sold', 'rented'],
    default: 'pending'
  },
  views: {
    type: Number,
    default: 0
  },
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,
  rejectionReason: String
}, {
  timestamps: true
});

// Index for search optimization
propertySchema.index({ 'location.city': 1, propertyType: 1, listingType: 1 });
propertySchema.index({ price: 1 });
propertySchema.index({ createdAt: -1 });
propertySchema.index({ status: 1 });

// Virtual for image count
propertySchema.virtual('imageCount').get(function() {
  return this.images.length;
});

// Method to increment views
propertySchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

module.exports = mongoose.model('Property', propertySchema);

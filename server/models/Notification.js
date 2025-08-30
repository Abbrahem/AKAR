const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  type: {
    type: String,
    required: true,
    enum: [
      'new_message',
      'property_approved',
      'property_rejected',
      'new_property_match',
      'offer_received',
      'offer_accepted',
      'offer_rejected',
      'property_sold',
      'property_rented'
    ]
  },
  title: {
    type: String,
    required: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  message: {
    type: String,
    required: true,
    maxlength: [500, 'Message cannot exceed 500 characters']
  },
  relatedProperty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property'
  },
  relatedMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: Date,
  actionUrl: String,
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  }
}, {
  timestamps: true
});

// Index for notification optimization
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ isRead: 1 });
notificationSchema.index({ type: 1 });

module.exports = mongoose.model('Notification', notificationSchema);

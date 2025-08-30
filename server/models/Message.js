const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Message content is required'],
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'offer'],
    default: 'text'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: Date,
  attachments: [{
    data: Buffer,
    contentType: String,
    filename: String
  }],
  offer: {
    amount: Number,
    currency: String,
    expiresAt: Date,
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'expired'],
      default: 'pending'
    }
  }
}, {
  timestamps: true
});

// Index for chat optimization
messageSchema.index({ sender: 1, receiver: 1, property: 1 });
messageSchema.index({ createdAt: -1 });
messageSchema.index({ isRead: 1 });

module.exports = mongoose.model('Message', messageSchema);

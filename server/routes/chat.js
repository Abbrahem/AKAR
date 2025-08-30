const express = require('express');
const { body, validationResult } = require('express-validator');
const Message = require('../models/Message');
const Property = require('../models/Property');
const Notification = require('../models/Notification');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/chat/conversations
// @desc    Get user's conversations
// @access  Private
router.get('/conversations', auth, async (req, res) => {
  try {
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: req.user._id },
            { receiver: req.user._id }
          ]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            property: '$property',
            participants: {
              $cond: {
                if: { $eq: ['$sender', req.user._id] },
                then: ['$sender', '$receiver'],
                else: ['$receiver', '$sender']
              }
            }
          },
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: {
                if: {
                  $and: [
                    { $eq: ['$receiver', req.user._id] },
                    { $eq: ['$isRead', false] }
                  ]
                },
                then: 1,
                else: 0
              }
            }
          }
        }
      },
      {
        $lookup: {
          from: 'properties',
          localField: '_id.property',
          foreignField: '_id',
          as: 'property'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'lastMessage.sender',
          foreignField: '_id',
          as: 'sender'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'lastMessage.receiver',
          foreignField: '_id',
          as: 'receiver'
        }
      },
      {
        $project: {
          property: { $arrayElemAt: ['$property', 0] },
          lastMessage: 1,
          unreadCount: 1,
          sender: { $arrayElemAt: ['$sender', 0] },
          receiver: { $arrayElemAt: ['$receiver', 0] },
          otherParticipant: {
            $cond: {
              if: { $eq: ['$lastMessage.sender', req.user._id] },
              then: { $arrayElemAt: ['$receiver', 0] },
              else: { $arrayElemAt: ['$sender', 0] }
            }
          }
        }
      },
      {
        $project: {
          'property.title': 1,
          'property._id': 1,
          'property.images': { $slice: ['$property.images', 1] },
          'lastMessage.content': 1,
          'lastMessage.createdAt': 1,
          'lastMessage.messageType': 1,
          'otherParticipant.name': 1,
          'otherParticipant._id': 1,
          'otherParticipant.avatar': 1,
          unreadCount: 1
        }
      },
      {
        $sort: { 'lastMessage.createdAt': -1 }
      }
    ]);

    res.json({
      success: true,
      conversations
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/chat/:propertyId/:otherUserId
// @desc    Get messages between users for a property
// @access  Private
router.get('/:propertyId/:otherUserId', auth, async (req, res) => {
  try {
    const { propertyId, otherUserId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Verify property exists
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    const messages = await Message.find({
      property: propertyId,
      $or: [
        { sender: req.user._id, receiver: otherUserId },
        { sender: otherUserId, receiver: req.user._id }
      ]
    })
    .populate('sender', 'name avatar')
    .populate('receiver', 'name avatar')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

    // Mark messages as read
    await Message.updateMany({
      property: propertyId,
      sender: otherUserId,
      receiver: req.user._id,
      isRead: false
    }, {
      isRead: true,
      readAt: new Date()
    });

    const total = await Message.countDocuments({
      property: propertyId,
      $or: [
        { sender: req.user._id, receiver: otherUserId },
        { sender: otherUserId, receiver: req.user._id }
      ]
    });

    res.json({
      success: true,
      messages: messages.reverse(),
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / limit),
        total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/chat/send
// @desc    Send a message
// @access  Private
router.post('/send', auth, [
  body('receiver').isMongoId().withMessage('Invalid receiver ID'),
  body('property').isMongoId().withMessage('Invalid property ID'),
  body('content').trim().isLength({ min: 1, max: 1000 }).withMessage('Message content must be between 1-1000 characters'),
  body('messageType').optional().isIn(['text', 'image', 'offer']).withMessage('Invalid message type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { receiver, property, content, messageType = 'text', offer } = req.body;

    // Verify property exists
    const propertyDoc = await Property.findById(property);
    if (!propertyDoc) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Create message
    const message = new Message({
      sender: req.user._id,
      receiver,
      property,
      content,
      messageType,
      offer
    });

    await message.save();

    // Populate message for response
    await message.populate('sender', 'name avatar');
    await message.populate('receiver', 'name avatar');

    // Create notification for receiver
    const notification = new Notification({
      recipient: receiver,
      sender: req.user._id,
      type: 'new_message',
      title: 'New Message',
      message: `${req.user.name} sent you a message about "${propertyDoc.title}"`,
      relatedProperty: property,
      relatedMessage: message._id,
      actionUrl: `/chat/${property}/${req.user._id}`
    });
    await notification.save();

    // Emit real-time message and notification
    const io = req.app.get('io');
    io.to(receiver).emit('receive_message', {
      message,
      property: {
        _id: propertyDoc._id,
        title: propertyDoc.title
      }
    });

    io.to(receiver).emit('receive_notification', {
      type: 'new_message',
      title: 'New Message',
      message: `${req.user.name} sent you a message`,
      actionUrl: `/chat/${property}/${req.user._id}`
    });

    res.status(201).json({
      success: true,
      message
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/chat/mark-read/:messageId
// @desc    Mark message as read
// @access  Private
router.put('/mark-read/:messageId', auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (message.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    message.isRead = true;
    message.readAt = new Date();
    await message.save();

    res.json({
      success: true,
      message: 'Message marked as read'
    });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/chat/unread-count
// @desc    Get unread messages count
// @access  Private
router.get('/unread-count', auth, async (req, res) => {
  try {
    const count = await Message.countDocuments({
      receiver: req.user._id,
      isRead: false
    });

    res.json({
      success: true,
      count
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

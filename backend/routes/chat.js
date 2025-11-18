const express = require('express');
const { body, validationResult } = require('express-validator');
const Chat = require('../models/Chat');
const Message = require('../models/Message');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

// @route   GET /api/chat
// @desc    Get all chats for the current user
// @access  Private
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const chats = await Chat.find({
      'participants.user': req.user._id,
      isActive: true
    })
    .populate('participants.user', 'name email')
    .populate('product', 'name images price')
    .populate('lastMessageBy', 'name')
    .sort({ lastMessageAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

    const total = await Chat.countDocuments({
      'participants.user': req.user._id,
      isActive: true
    });

    res.json({
      success: true,
      data: {
        chats,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalChats: total,
          hasNext: parseInt(page) < Math.ceil(total / parseInt(limit)),
          hasPrev: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Get chats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching chats'
    });
  }
});

// @route   POST /api/chat
// @desc    Start a new chat (or get existing one)
// @access  Private
router.post('/', [
  body('productId').isMongoId().withMessage('Invalid product ID'),
  body('sellerId').isMongoId().withMessage('Invalid seller ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { productId, sellerId } = req.body;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if chat already exists
    let chat = await Chat.findOne({
      'participants.user': { $all: [req.user._id, sellerId] },
      product: productId
    })
    .populate('participants.user', 'name email')
    .populate('product', 'name images price');

    if (chat) {
      return res.json({
        success: true,
        message: 'Chat already exists',
        data: { chat }
      });
    }

    // Create new chat
    chat = new Chat({
      participants: [
        { user: req.user._id, role: 'buyer' },
        { user: sellerId, role: 'seller' }
      ],
      product: productId
    });

    await chat.save();
    await chat.populate('participants.user', 'name email');
    await chat.populate('product', 'name images price');

    res.status(201).json({
      success: true,
      message: 'Chat created successfully',
      data: { chat }
    });
  } catch (error) {
    console.error('Create chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating chat'
    });
  }
});

// @route   GET /api/chat/:chatId
// @desc    Get chat details and messages
// @access  Private
router.get('/:chatId', async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Check if chat exists and user is a participant
    const chat = await Chat.findOne({
      _id: req.params.chatId,
      'participants.user': req.user._id,
      isActive: true
    })
    .populate('participants.user', 'name email')
    .populate('product', 'name images price');

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Get messages
    const messages = await Message.find({
      chat: req.params.chatId,
      isDeleted: false
    })
    .populate('sender', 'name email')
    .sort({ createdAt: 1 })
    .skip(skip)
    .limit(parseInt(limit));

    // Mark messages as read
    await Message.updateMany(
      {
        chat: req.params.chatId,
        sender: { $ne: req.user._id },
        'readBy.user': { $ne: req.user._id }
      },
      {
        $push: { readBy: { user: req.user._id } }
      }
    );

    // Reset unread count for this user
    chat.unreadCount.set(req.user._id.toString(), 0);
    await chat.save();

    const total = await Message.countDocuments({
      chat: req.params.chatId,
      isDeleted: false
    });

    res.json({
      success: true,
      data: {
        chat,
        messages,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalMessages: total,
          hasNext: parseInt(page) < Math.ceil(total / parseInt(limit)),
          hasPrev: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Get chat details error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching chat details'
    });
  }
});

// @route   POST /api/chat/:chatId/messages
// @desc    Send a message in a chat
// @access  Private
router.post('/:chatId/messages', [
  body('content').trim().isLength({ min: 1, max: 1000 }).withMessage('Message must be between 1 and 1000 characters'),
  body('type').optional().isIn(['text', 'image', 'product_inquiry']).withMessage('Invalid message type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { content, type = 'text' } = req.body;

    // Check if chat exists and user is a participant
    const chat = await Chat.findOne({
      _id: req.params.chatId,
      'participants.user': req.user._id,
      isActive: true
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Create message
    const message = new Message({
      chat: req.params.chatId,
      sender: req.user._id,
      content,
      type
    });

    await message.save();
    await message.populate('sender', 'name email');

    // Update chat last message
    chat.lastMessage = content;
    chat.lastMessageAt = new Date();
    chat.lastMessageBy = req.user._id;

    // Increment unread count for other participants
    await chat.incrementUnreadCount(req.user._id);

    await chat.save();

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: { message }
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while sending message'
    });
  }
});

// @route   PUT /api/chat/:chatId/read
// @desc    Mark chat as read
// @access  Private
router.put('/:chatId/read', async (req, res) => {
  try {
    // Check if chat exists and user is a participant
    const chat = await Chat.findOne({
      _id: req.params.chatId,
      'participants.user': req.user._id,
      isActive: true
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Mark all messages as read
    await Message.updateMany(
      {
        chat: req.params.chatId,
        sender: { $ne: req.user._id },
        'readBy.user': { $ne: req.user._id }
      },
      {
        $push: { readBy: { user: req.user._id } }
      }
    );

    // Reset unread count
    chat.unreadCount.set(req.user._id.toString(), 0);
    await chat.save();

    res.json({
      success: true,
      message: 'Chat marked as read'
    });
  } catch (error) {
    console.error('Mark chat as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while marking chat as read'
    });
  }
});

// @route   DELETE /api/chat/:chatId
// @desc    Delete/deactivate a chat
// @access  Private
router.delete('/:chatId', async (req, res) => {
  try {
    // Check if chat exists and user is a participant
    const chat = await Chat.findOne({
      _id: req.params.chatId,
      'participants.user': req.user._id,
      isActive: true
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Deactivate chat
    chat.isActive = false;
    await chat.save();

    res.json({
      success: true,
      message: 'Chat deleted successfully'
    });
  } catch (error) {
    console.error('Delete chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting chat'
    });
  }
});

module.exports = router;

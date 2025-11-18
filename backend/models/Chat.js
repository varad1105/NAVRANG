const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['buyer', 'seller'],
      required: true
    }
  }],
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  lastMessage: {
    type: String,
    default: ''
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  unreadCount: {
    type: Map,
    of: Number,
    default: new Map()
  }
}, {
  timestamps: true
});

// Index for efficient queries
chatSchema.index({ 'participants.user': 1, product: 1 });
chatSchema.index({ lastMessageAt: -1 });

// Method to get unread count for a specific user
chatSchema.methods.getUnreadCount = function(userId) {
  return this.unreadCount.get(userId.toString()) || 0;
};

// Method to mark messages as read for a user
chatSchema.methods.markAsRead = function(userId) {
  this.unreadCount.set(userId.toString(), 0);
  return this.save();
};

// Method to increment unread count for all participants except sender
chatSchema.methods.incrementUnreadCount = function(senderId) {
  this.participants.forEach(participant => {
    const participantId = participant.user.toString();
    if (participantId !== senderId.toString()) {
      const currentCount = this.unreadCount.get(participantId) || 0;
      this.unreadCount.set(participantId, currentCount + 1);
    }
  });
  return this.save();
};

module.exports = mongoose.model('Chat', chatSchema);

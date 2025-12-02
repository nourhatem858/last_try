/**
 * Notification Model
 * Mongoose schema for Notifications collection
 */

const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  message: {
    type: String,
    required: true,
    maxlength: 500
  },
  type: {
    type: String,
    enum: ['info', 'success', 'warning', 'error', 'system', 'like', 'bookmark', 'comment'],
    default: 'info'
  },
  related_card_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'KnowledgeCard'
  },
  related_user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  read: {
    type: Boolean,
    default: false,
    index: true
  },
  created_at: {
    type: Date,
    default: Date.now,
    immutable: true,
    index: true
  }
});

// Compound indexes for optimized queries
notificationSchema.index({ user_id: 1, read: 1, created_at: -1 });
notificationSchema.index({ user_id: 1, created_at: -1 });

// TTL index to auto-delete old read notifications after 30 days
notificationSchema.index({ created_at: 1 }, { 
  expireAfterSeconds: 2592000,
  partialFilterExpression: { read: true }
});

module.exports = mongoose.model('Notification', notificationSchema);

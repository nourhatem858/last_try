/**
 * BookmarksLikes Collection Schema
 * Tracks user interactions (bookmarks and likes) with knowledge cards
 */

const mongoose = require('mongoose');

const bookmarksLikesSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  card_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'KnowledgeCard',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['bookmark', 'like'],
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now,
    immutable: true
  }
});

// Compound indexes for optimized queries
bookmarksLikesSchema.index({ user_id: 1, card_id: 1, type: 1 }, { unique: true });
bookmarksLikesSchema.index({ card_id: 1, type: 1 });
bookmarksLikesSchema.index({ user_id: 1, type: 1, created_at: -1 });

module.exports = mongoose.model('BookmarkLike', bookmarksLikesSchema);

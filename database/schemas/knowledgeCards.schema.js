/**
 * KnowledgeCards Collection Schema
 * Stores knowledge content created by users
 */

const mongoose = require('mongoose');

const knowledgeCardSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    maxlength: 10000
  },
  author_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  category: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  visibility: {
    type: String,
    enum: ['public', 'private', 'shared'],
    default: 'public'
  },
  view_count: {
    type: Number,
    default: 0
  },
  like_count: {
    type: Number,
    default: 0
  },
  bookmark_count: {
    type: Number,
    default: 0
  },
  created_at: {
    type: Date,
    default: Date.now,
    immutable: true
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Compound indexes for optimized queries
knowledgeCardSchema.index({ tags: 1, category: 1 });
knowledgeCardSchema.index({ author_id: 1, created_at: -1 });
knowledgeCardSchema.index({ category: 1, created_at: -1 });
knowledgeCardSchema.index({ view_count: -1, like_count: -1 });

// Text index for full-text search
knowledgeCardSchema.index({ title: 'text', content: 'text', tags: 'text' });

module.exports = mongoose.model('KnowledgeCard', knowledgeCardSchema);

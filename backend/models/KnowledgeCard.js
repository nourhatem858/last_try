/**
 * KnowledgeCard Model
 * Mongoose schema for KnowledgeCards collection
 */

const mongoose = require('mongoose');

const knowledgeCardSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    maxlength: [10000, 'Content cannot exceed 10000 characters']
  },
  author_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author is required'],
    index: true
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  category: {
    type: String,
    required: [true, 'Category is required'],
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
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
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

// Virtual for related cards (can be populated later)
knowledgeCardSchema.virtual('author', {
  ref: 'User',
  localField: 'author_id',
  foreignField: '_id',
  justOne: true
});

// Ensure virtuals are included in JSON
knowledgeCardSchema.set('toJSON', { virtuals: true });
knowledgeCardSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('KnowledgeCard', knowledgeCardSchema);

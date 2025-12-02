/**
 * AnalyticsLogs Collection Schema
 * Tracks user actions for analytics and AI recommendations
 */

const mongoose = require('mongoose');

const analyticsLogSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  action_type: {
    type: String,
    enum: ['view', 'like', 'bookmark', 'search', 'create', 'update', 'delete', 'share'],
    required: true,
    index: true
  },
  card_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'KnowledgeCard'
  },
  metadata: {
    search_query: String,
    duration_seconds: Number,
    device_type: String,
    ip_address: String,
    user_agent: String
  },
  timestamp: {
    type: Date,
    default: Date.now,
    immutable: true,
    index: true
  }
});

// Compound indexes for analytics queries
analyticsLogSchema.index({ user_id: 1, action_type: 1, timestamp: -1 });
analyticsLogSchema.index({ card_id: 1, action_type: 1, timestamp: -1 });
analyticsLogSchema.index({ action_type: 1, timestamp: -1 });
analyticsLogSchema.index({ timestamp: -1 });

// TTL index to auto-delete logs older than 1 year
analyticsLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 31536000 });

module.exports = mongoose.model('AnalyticsLog', analyticsLogSchema);

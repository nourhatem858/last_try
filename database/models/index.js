/**
 * Central export for all database models
 */

module.exports = {
  User: require('../schemas/users.schema'),
  KnowledgeCard: require('../schemas/knowledgeCards.schema'),
  BookmarkLike: require('../schemas/bookmarksLikes.schema'),
  Notification: require('../schemas/notifications.schema'),
  AnalyticsLog: require('../schemas/analyticsLogs.schema')
};

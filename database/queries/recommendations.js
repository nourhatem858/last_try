/**
 * AI Recommendation Query Helpers
 * Pre-built queries for recommendation engine
 */

const { KnowledgeCard, BookmarkLike, AnalyticsLog, User } = require('../models');

class RecommendationQueries {
  /**
   * Content-based recommendations using tags and categories
   */
  static async getContentBasedRecommendations(userId, limit = 10) {
    const user = await User.findById(userId);
    const favoriteTags = user.preferences.favorite_topics || [];

    return await KnowledgeCard.find({
      tags: { $in: favoriteTags },
      author_id: { $ne: userId }
    })
    .sort({ view_count: -1, like_count: -1 })
    .limit(limit)
    .populate('author_id', 'name');
  }

  /**
   * Collaborative filtering - users who liked this also liked
   */
  static async getCollaborativeRecommendations(cardId, limit = 10) {
    return await BookmarkLike.aggregate([
      { $match: { card_id: cardId, type: 'like' } },
      { 
        $lookup: {
          from: 'bookmarklikes',
          localField: 'user_id',
          foreignField: 'user_id',
          as: 'userLikes'
        }
      },
      { $unwind: '$userLikes' },
      { $match: { 'userLikes.card_id': { $ne: cardId } } },
      { 
        $group: {
          _id: '$userLikes.card_id',
          score: { $sum: 1 }
        }
      },
      { $sort: { score: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'knowledgecards',
          localField: '_id',
          foreignField: '_id',
          as: 'card'
        }
      },
      { $unwind: '$card' }
    ]);
  }

  /**
   * Trending cards based on recent activity
   */
  static async getTrendingCards(days = 7, limit = 10) {
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);

    return await AnalyticsLog.aggregate([
      {
        $match: {
          timestamp: { $gte: dateThreshold },
          action_type: { $in: ['view', 'like', 'bookmark'] }
        }
      },
      {
        $group: {
          _id: '$card_id',
          views: { $sum: { $cond: [{ $eq: ['$action_type', 'view'] }, 1, 0] } },
          likes: { $sum: { $cond: [{ $eq: ['$action_type', 'like'] }, 1, 0] } },
          bookmarks: { $sum: { $cond: [{ $eq: ['$action_type', 'bookmark'] }, 1, 0] } },
          score: { $sum: 1 }
        }
      },
      { $sort: { score: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'knowledgecards',
          localField: '_id',
          foreignField: '_id',
          as: 'card'
        }
      },
      { $unwind: '$card' }
    ]);
  }

  /**
   * Personalized recommendations based on user behavior
   */
  static async getPersonalizedRecommendations(userId, limit = 10) {
    // Get user's recent interactions
    const recentLogs = await AnalyticsLog.find({
      user_id: userId,
      action_type: { $in: ['view', 'like', 'bookmark'] }
    })
    .sort({ timestamp: -1 })
    .limit(50)
    .populate('card_id');

    // Extract tags and categories from viewed cards
    const interestTags = new Set();
    const interestCategories = new Set();

    recentLogs.forEach(log => {
      if (log.card_id) {
        log.card_id.tags?.forEach(tag => interestTags.add(tag));
        if (log.card_id.category) interestCategories.add(log.card_id.category);
      }
    });

    // Find similar cards
    return await KnowledgeCard.find({
      $or: [
        { tags: { $in: Array.from(interestTags) } },
        { category: { $in: Array.from(interestCategories) } }
      ],
      author_id: { $ne: userId }
    })
    .sort({ view_count: -1, like_count: -1 })
    .limit(limit)
    .populate('author_id', 'name');
  }
}

module.exports = RecommendationQueries;

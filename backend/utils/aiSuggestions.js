/**
 * AI Suggestions Utility
 * Generate AI-powered recommendations and suggestions
 */

const KnowledgeCard = require('../models/KnowledgeCard');
const AnalyticsLog = require('../models/AnalyticsLog');
const User = require('../models/User');

/**
 * Get personalized card recommendations for a user
 */
const getPersonalizedRecommendations = async (userId, limit = 10) => {
  try {
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

    // Get user's favorite topics from preferences
    const user = await User.findById(userId);
    if (user?.preferences?.favorite_topics) {
      user.preferences.favorite_topics.forEach(topic => interestTags.add(topic.toLowerCase()));
    }

    // Find similar cards
    const recommendations = await KnowledgeCard.find({
      author_id: { $ne: userId },
      visibility: 'public',
      $or: [
        { tags: { $in: Array.from(interestTags) } },
        { category: { $in: Array.from(interestCategories) } }
      ]
    })
      .populate('author_id', 'name')
      .sort({ view_count: -1, like_count: -1 })
      .limit(limit)
      .lean();

    return recommendations;
  } catch (error) {
    console.error('Error generating personalized recommendations:', error);
    return [];
  }
};

/**
 * Get trending cards based on recent activity
 */
const getTrendingCards = async (days = 7, limit = 10) => {
  try {
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);

    const trending = await AnalyticsLog.aggregate([
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
      { $unwind: '$card' },
      {
        $lookup: {
          from: 'users',
          localField: 'card.author_id',
          foreignField: '_id',
          as: 'card.author'
        }
      },
      { $unwind: '$card.author' }
    ]);

    return trending.map(item => item.card);
  } catch (error) {
    console.error('Error getting trending cards:', error);
    return [];
  }
};

/**
 * Suggest tags based on content analysis
 */
const suggestTags = (title, content) => {
  // Simple keyword extraction (can be enhanced with NLP)
  const text = `${title} ${content}`.toLowerCase();
  const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those']);
  
  const words = text.match(/\b[a-z]{3,}\b/g) || [];
  const wordFreq = {};
  
  words.forEach(word => {
    if (!commonWords.has(word)) {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    }
  });
  
  // Get top 5 most frequent words as suggested tags
  const suggestedTags = Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word);
  
  return suggestedTags;
};

/**
 * Suggest category based on content
 */
const suggestCategory = (title, content, tags = []) => {
  const text = `${title} ${content} ${tags.join(' ')}`.toLowerCase();
  
  const categories = {
    'AI & ML': ['ai', 'artificial intelligence', 'machine learning', 'deep learning', 'neural network', 'model', 'algorithm'],
    'Web Development': ['web', 'html', 'css', 'javascript', 'react', 'vue', 'angular', 'frontend', 'backend', 'api'],
    'Database': ['database', 'sql', 'mongodb', 'postgresql', 'mysql', 'nosql', 'query', 'schema'],
    'DevOps': ['devops', 'docker', 'kubernetes', 'ci/cd', 'deployment', 'cloud', 'aws', 'azure'],
    'Programming': ['programming', 'code', 'function', 'class', 'variable', 'syntax', 'python', 'java', 'c++'],
    'Data Science': ['data', 'analytics', 'visualization', 'statistics', 'pandas', 'numpy', 'analysis'],
    'Security': ['security', 'encryption', 'authentication', 'authorization', 'vulnerability', 'penetration'],
    'Mobile Development': ['mobile', 'ios', 'android', 'react native', 'flutter', 'app development']
  };
  
  let maxScore = 0;
  let suggestedCategory = 'General';
  
  for (const [category, keywords] of Object.entries(categories)) {
    let score = 0;
    keywords.forEach(keyword => {
      if (text.includes(keyword)) {
        score++;
      }
    });
    
    if (score > maxScore) {
      maxScore = score;
      suggestedCategory = category;
    }
  }
  
  return suggestedCategory;
};

module.exports = {
  getPersonalizedRecommendations,
  getTrendingCards,
  suggestTags,
  suggestCategory
};

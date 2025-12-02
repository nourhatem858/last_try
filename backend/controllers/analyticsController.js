/**
 * Analytics Controller
 * Handle analytics log operations
 */

const AnalyticsLog = require('../models/AnalyticsLog');
const KnowledgeCard = require('../models/KnowledgeCard');

/**
 * @desc    Create analytics log
 * @route   POST /api/analytics/logs
 * @access  Protected
 */
const createLog = async (req, res, next) => {
  try {
    const { action_type, card_id, metadata } = req.body;

    // Validate card exists if card_id provided
    if (card_id) {
      const card = await KnowledgeCard.findById(card_id);
      if (!card) {
        return res.status(404).json({
          success: false,
          message: 'Knowledge card not found',
          code: 'CARD_NOT_FOUND'
        });
      }
    }

    // Create log
    const log = await AnalyticsLog.create({
      user_id: req.user._id,
      action_type,
      card_id,
      metadata: metadata || {}
    });

    res.status(201).json({
      success: true,
      message: 'Analytics log created successfully',
      data: { log }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user's analytics logs
 * @route   GET /api/analytics/logs
 * @access  Protected
 */
const getUserLogs = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 50,
      action_type,
      start_date,
      end_date
    } = req.query;

    const skip = (page - 1) * limit;

    // Build query
    const query = { user_id: req.user._id };

    // Filter by action type
    if (action_type) {
      query.action_type = action_type;
    }

    // Filter by date range
    if (start_date || end_date) {
      query.timestamp = {};
      if (start_date) {
        query.timestamp.$gte = new Date(start_date);
      }
      if (end_date) {
        query.timestamp.$lte = new Date(end_date);
      }
    }

    // Get logs
    const logs = await AnalyticsLog.find(query)
      .populate('card_id', 'title category')
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .lean();

    const total = await AnalyticsLog.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        logs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get analytics summary for user
 * @route   GET /api/analytics/summary
 * @access  Protected
 */
const getUserSummary = async (req, res, next) => {
  try {
    const { days = 30 } = req.query;
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - parseInt(days));

    const summary = await AnalyticsLog.aggregate([
      {
        $match: {
          user_id: req.user._id,
          timestamp: { $gte: dateThreshold }
        }
      },
      {
        $group: {
          _id: '$action_type',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Get total actions
    const totalActions = summary.reduce((sum, item) => sum + item.count, 0);

    // Get most viewed cards
    const mostViewedCards = await AnalyticsLog.aggregate([
      {
        $match: {
          user_id: req.user._id,
          action_type: 'view',
          card_id: { $exists: true },
          timestamp: { $gte: dateThreshold }
        }
      },
      {
        $group: {
          _id: '$card_id',
          view_count: { $sum: 1 }
        }
      },
      {
        $sort: { view_count: -1 }
      },
      {
        $limit: 5
      },
      {
        $lookup: {
          from: 'knowledgecards',
          localField: '_id',
          foreignField: '_id',
          as: 'card'
        }
      },
      {
        $unwind: '$card'
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        period_days: parseInt(days),
        total_actions: totalActions,
        actions_by_type: summary,
        most_viewed_cards: mostViewedCards
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get global analytics (admin only)
 * @route   GET /api/analytics/global
 * @access  Protected (Admin)
 */
const getGlobalAnalytics = async (req, res, next) => {
  try {
    const { days = 7 } = req.query;
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - parseInt(days));

    // Total actions
    const totalActions = await AnalyticsLog.countDocuments({
      timestamp: { $gte: dateThreshold }
    });

    // Actions by type
    const actionsByType = await AnalyticsLog.aggregate([
      {
        $match: { timestamp: { $gte: dateThreshold } }
      },
      {
        $group: {
          _id: '$action_type',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Most active users
    const mostActiveUsers = await AnalyticsLog.aggregate([
      {
        $match: { timestamp: { $gte: dateThreshold } }
      },
      {
        $group: {
          _id: '$user_id',
          action_count: { $sum: 1 }
        }
      },
      {
        $sort: { action_count: -1 }
      },
      {
        $limit: 10
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          user_id: '$_id',
          action_count: 1,
          'user.name': 1,
          'user.email': 1
        }
      }
    ]);

    // Most popular cards
    const mostPopularCards = await AnalyticsLog.aggregate([
      {
        $match: {
          timestamp: { $gte: dateThreshold },
          card_id: { $exists: true }
        }
      },
      {
        $group: {
          _id: '$card_id',
          views: { $sum: { $cond: [{ $eq: ['$action_type', 'view'] }, 1, 0] } },
          likes: { $sum: { $cond: [{ $eq: ['$action_type', 'like'] }, 1, 0] } },
          bookmarks: { $sum: { $cond: [{ $eq: ['$action_type', 'bookmark'] }, 1, 0] } },
          total_interactions: { $sum: 1 }
        }
      },
      {
        $sort: { total_interactions: -1 }
      },
      {
        $limit: 10
      },
      {
        $lookup: {
          from: 'knowledgecards',
          localField: '_id',
          foreignField: '_id',
          as: 'card'
        }
      },
      {
        $unwind: '$card'
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        period_days: parseInt(days),
        total_actions: totalActions,
        actions_by_type: actionsByType,
        most_active_users: mostActiveUsers,
        most_popular_cards: mostPopularCards
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createLog,
  getUserLogs,
  getUserSummary,
  getGlobalAnalytics
};

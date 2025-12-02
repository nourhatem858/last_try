/**
 * Interaction Controller
 * Handle likes, bookmarks, and ratings
 */

const KnowledgeCard = require('../models/KnowledgeCard');
const BookmarkLike = require('../models/BookmarkLike');
const Rating = require('../models/Rating');
const AnalyticsLog = require('../models/AnalyticsLog');

/**
 * @desc    Like a knowledge card
 * @route   POST /api/cards/:id/like
 * @access  Protected
 */
const likeCard = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if card exists
    const card = await KnowledgeCard.findById(id).populate('author_id', 'name');
    if (!card) {
      return res.status(404).json({
        success: false,
        message: 'Knowledge card not found',
        code: 'CARD_NOT_FOUND'
      });
    }

    // Check if already liked
    const existingLike = await BookmarkLike.findOne({
      user_id: req.user._id,
      card_id: id,
      type: 'like'
    });

    if (existingLike) {
      return res.status(400).json({
        success: false,
        message: 'You have already liked this card',
        code: 'ALREADY_LIKED'
      });
    }

    // Create like
    await BookmarkLike.create({
      user_id: req.user._id,
      card_id: id,
      type: 'like'
    });

    // Increment like count
    card.like_count += 1;
    await card.save();

    // Log analytics
    await AnalyticsLog.create({
      user_id: req.user._id,
      action_type: 'like',
      card_id: id
    }).catch(err => console.error('Analytics log error:', err));

    // Notify card author (if not liking own card)
    if (card.author_id._id.toString() !== req.user._id.toString()) {
      const { notifyCardLiked } = require('../utils/notificationHelper');
      await notifyCardLiked(card.author_id._id, req.user.name, card.title, card._id);
    }

    res.status(200).json({
      success: true,
      message: 'Card liked successfully',
      data: {
        like_count: card.like_count
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Unlike a knowledge card
 * @route   DELETE /api/cards/:id/like
 * @access  Protected
 */
const unlikeCard = async (req, res, next) => {
  try {
    const { id } = req.params;

    const like = await BookmarkLike.findOneAndDelete({
      user_id: req.user._id,
      card_id: id,
      type: 'like'
    });

    if (!like) {
      return res.status(400).json({
        success: false,
        message: 'You have not liked this card',
        code: 'NOT_LIKED'
      });
    }

    // Decrement like count
    const card = await KnowledgeCard.findById(id);
    if (card) {
      card.like_count = Math.max(0, card.like_count - 1);
      await card.save();
    }

    res.status(200).json({
      success: true,
      message: 'Card unliked successfully',
      data: {
        like_count: card.like_count
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Bookmark a knowledge card
 * @route   POST /api/cards/:id/bookmark
 * @access  Protected
 */
const bookmarkCard = async (req, res, next) => {
  try {
    const { id } = req.params;

    const card = await KnowledgeCard.findById(id).populate('author_id', 'name');
    if (!card) {
      return res.status(404).json({
        success: false,
        message: 'Knowledge card not found',
        code: 'CARD_NOT_FOUND'
      });
    }

    const existingBookmark = await BookmarkLike.findOne({
      user_id: req.user._id,
      card_id: id,
      type: 'bookmark'
    });

    if (existingBookmark) {
      return res.status(400).json({
        success: false,
        message: 'You have already bookmarked this card',
        code: 'ALREADY_BOOKMARKED'
      });
    }

    await BookmarkLike.create({
      user_id: req.user._id,
      card_id: id,
      type: 'bookmark'
    });

    card.bookmark_count += 1;
    await card.save();

    // Log analytics
    await AnalyticsLog.create({
      user_id: req.user._id,
      action_type: 'bookmark',
      card_id: id
    }).catch(err => console.error('Analytics log error:', err));

    // Notify card author (if not bookmarking own card)
    if (card.author_id._id.toString() !== req.user._id.toString()) {
      const { notifyCardBookmarked } = require('../utils/notificationHelper');
      await notifyCardBookmarked(card.author_id._id, req.user.name, card.title, card._id);
    }

    res.status(200).json({
      success: true,
      message: 'Card bookmarked successfully',
      data: {
        bookmark_count: card.bookmark_count
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove bookmark from a knowledge card
 * @route   DELETE /api/cards/:id/bookmark
 * @access  Protected
 */
const unbookmarkCard = async (req, res, next) => {
  try {
    const { id } = req.params;

    const bookmark = await BookmarkLike.findOneAndDelete({
      user_id: req.user._id,
      card_id: id,
      type: 'bookmark'
    });

    if (!bookmark) {
      return res.status(400).json({
        success: false,
        message: 'You have not bookmarked this card',
        code: 'NOT_BOOKMARKED'
      });
    }

    const card = await KnowledgeCard.findById(id);
    if (card) {
      card.bookmark_count = Math.max(0, card.bookmark_count - 1);
      await card.save();
    }

    res.status(200).json({
      success: true,
      message: 'Bookmark removed successfully',
      data: {
        bookmark_count: card.bookmark_count
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user's bookmarked cards
 * @route   GET /api/interactions/bookmarks
 * @access  Protected
 */
const getBookmarkedCards = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const bookmarks = await BookmarkLike.find({
      user_id: req.user._id,
      type: 'bookmark'
    })
      .populate({
        path: 'card_id',
        populate: { path: 'author_id', select: 'name email' }
      })
      .sort({ created_at: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await BookmarkLike.countDocuments({
      user_id: req.user._id,
      type: 'bookmark'
    });

    const cards = bookmarks.map(b => b.card_id).filter(card => card !== null);

    res.status(200).json({
      success: true,
      data: {
        cards,
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
 * @desc    Get user's liked cards
 * @route   GET /api/interactions/likes
 * @access  Protected
 */
const getLikedCards = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const likes = await BookmarkLike.find({
      user_id: req.user._id,
      type: 'like'
    })
      .populate({
        path: 'card_id',
        populate: { path: 'author_id', select: 'name email' }
      })
      .sort({ created_at: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await BookmarkLike.countDocuments({
      user_id: req.user._id,
      type: 'like'
    });

    const cards = likes.map(l => l.card_id).filter(card => card !== null);

    res.status(200).json({
      success: true,
      data: {
        cards,
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
 * @desc    Get card statistics (likes and bookmarks count)
 * @route   GET /api/interactions/stats/:id
 * @access  Public
 */
const getCardStats = async (req, res, next) => {
  try {
    const { id } = req.params;

    const card = await KnowledgeCard.findById(id);
    if (!card) {
      return res.status(404).json({
        success: false,
        message: 'Knowledge card not found',
        code: 'CARD_NOT_FOUND'
      });
    }

    // Get counts from database
    const likeCount = await BookmarkLike.countDocuments({
      card_id: id,
      type: 'like'
    });

    const bookmarkCount = await BookmarkLike.countDocuments({
      card_id: id,
      type: 'bookmark'
    });

    // Check if current user has liked/bookmarked (if authenticated)
    let userInteraction = {
      hasLiked: false,
      hasBookmarked: false
    };

    if (req.user) {
      const interactions = await BookmarkLike.find({
        user_id: req.user._id,
        card_id: id
      });

      userInteraction.hasLiked = interactions.some(i => i.type === 'like');
      userInteraction.hasBookmarked = interactions.some(i => i.type === 'bookmark');
    }

    res.status(200).json({
      success: true,
      data: {
        card_id: id,
        like_count: likeCount,
        bookmark_count: bookmarkCount,
        view_count: card.view_count,
        ...userInteraction
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete bookmark by ID
 * @route   DELETE /api/interactions/bookmarks/:id
 * @access  Protected
 */
const deleteBookmarkById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const bookmark = await BookmarkLike.findById(id);

    if (!bookmark) {
      return res.status(404).json({
        success: false,
        message: 'Bookmark not found',
        code: 'BOOKMARK_NOT_FOUND'
      });
    }

    // Check if user owns this bookmark
    if (bookmark.user_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this bookmark',
        code: 'FORBIDDEN'
      });
    }

    // Delete bookmark
    await bookmark.deleteOne();

    // Decrement bookmark count on card
    const card = await KnowledgeCard.findById(bookmark.card_id);
    if (card) {
      card.bookmark_count = Math.max(0, card.bookmark_count - 1);
      await card.save();
    }

    res.status(200).json({
      success: true,
      message: 'Bookmark deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete like by ID
 * @route   DELETE /api/interactions/likes/:id
 * @access  Protected
 */
const deleteLikeById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const like = await BookmarkLike.findById(id);

    if (!like) {
      return res.status(404).json({
        success: false,
        message: 'Like not found',
        code: 'LIKE_NOT_FOUND'
      });
    }

    // Check if user owns this like
    if (like.user_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this like',
        code: 'FORBIDDEN'
      });
    }

    // Delete like
    await like.deleteOne();

    // Decrement like count on card
    const card = await KnowledgeCard.findById(like.card_id);
    if (card) {
      card.like_count = Math.max(0, card.like_count - 1);
      await card.save();
    }

    res.status(200).json({
      success: true,
      message: 'Like deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  likeCard,
  unlikeCard,
  bookmarkCard,
  unbookmarkCard,
  getBookmarkedCards,
  getLikedCards,
  getCardStats,
  deleteBookmarkById,
  deleteLikeById
};

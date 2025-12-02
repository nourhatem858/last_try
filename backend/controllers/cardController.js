/**
 * Knowledge Card Controller
 * Handle CRUD operations for knowledge cards
 */

const KnowledgeCard = require('../models/KnowledgeCard');
const AnalyticsLog = require('../models/AnalyticsLog');

/**
 * @desc    Get all knowledge cards with filtering and pagination
 * @route   GET /api/cards
 * @access  Public
 */
const getAllCards = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      tag,
      author_id,
      search,
      sort = 'newest',
      visibility = 'public'
    } = req.query;

    // Build query
    const query = {};

    // Filter by visibility (only show public cards for non-authenticated users)
    if (!req.user) {
      query.visibility = 'public';
    } else if (visibility) {
      query.visibility = visibility;
    }

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by tag
    if (tag) {
      query.tags = tag;
    }

    // Filter by author
    if (author_id) {
      query.author_id = author_id;
    }

    // Search in title and content
    if (search) {
      query.$text = { $search: search };
    }

    // Sort options
    let sortOption = {};
    switch (sort) {
      case 'oldest':
        sortOption = { created_at: 1 };
        break;
      case 'popular':
        sortOption = { like_count: -1, view_count: -1 };
        break;
      case 'trending':
        sortOption = { view_count: -1, created_at: -1 };
        break;
      case 'newest':
      default:
        sortOption = { created_at: -1 };
    }

    // Pagination
    const skip = (page - 1) * limit;

    // Execute query
    const cards = await KnowledgeCard.find(query)
      .populate('author_id', 'name email')
      .sort(sortOption)
      .limit(parseInt(limit))
      .skip(skip)
      .lean();

    // Get total count for pagination
    const total = await KnowledgeCard.countDocuments(query);

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
 * @desc    Get single knowledge card by ID
 * @route   GET /api/cards/:id
 * @access  Public
 */
const getCardById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const card = await KnowledgeCard.findById(id)
      .populate('author_id', 'name email role');

    if (!card) {
      return res.status(404).json({
        success: false,
        message: 'Knowledge card not found',
        code: 'CARD_NOT_FOUND'
      });
    }

    // Check visibility
    if (card.visibility === 'private' && (!req.user || req.user._id.toString() !== card.author_id._id.toString())) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this card',
        code: 'FORBIDDEN'
      });
    }

    // Increment view count
    card.view_count += 1;
    await card.save();

    // Log analytics (if user is authenticated)
    if (req.user) {
      await AnalyticsLog.create({
        user_id: req.user._id,
        action_type: 'view',
        card_id: card._id
      }).catch(err => console.error('Analytics log error:', err));
    }

    res.status(200).json({
      success: true,
      data: { card }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new knowledge card
 * @route   POST /api/cards
 * @access  Protected
 */
const createCard = async (req, res, next) => {
  try {
    const { title, content, tags, category, visibility } = req.body;

    // Create card with authenticated user as author
    const card = await KnowledgeCard.create({
      title,
      content,
      tags: tags || [],
      category,
      visibility: visibility || 'public',
      author_id: req.user._id
    });

    // Populate author info
    await card.populate('author_id', 'name email');

    // Log analytics
    await AnalyticsLog.create({
      user_id: req.user._id,
      action_type: 'create',
      card_id: card._id
    }).catch(err => console.error('Analytics log error:', err));

    res.status(201).json({
      success: true,
      message: 'Knowledge card created successfully',
      data: { card }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update knowledge card
 * @route   PATCH /api/cards/:id
 * @access  Protected (Author or Admin)
 */
const updateCard = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, content, tags, category, visibility } = req.body;

    const card = await KnowledgeCard.findById(id);

    if (!card) {
      return res.status(404).json({
        success: false,
        message: 'Knowledge card not found',
        code: 'CARD_NOT_FOUND'
      });
    }

    // Check authorization (only author or admin can update)
    if (card.author_id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this card',
        code: 'FORBIDDEN'
      });
    }

    // Update fields
    if (title) card.title = title;
    if (content) card.content = content;
    if (tags) card.tags = tags;
    if (category) card.category = category;
    if (visibility) card.visibility = visibility;

    await card.save();
    await card.populate('author_id', 'name email');

    // Log analytics
    await AnalyticsLog.create({
      user_id: req.user._id,
      action_type: 'update',
      card_id: card._id
    }).catch(err => console.error('Analytics log error:', err));

    res.status(200).json({
      success: true,
      message: 'Knowledge card updated successfully',
      data: { card }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete knowledge card
 * @route   DELETE /api/cards/:id
 * @access  Protected (Author or Admin)
 */
const deleteCard = async (req, res, next) => {
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

    // Check authorization
    if (card.author_id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this card',
        code: 'FORBIDDEN'
      });
    }

    await card.deleteOne();

    // Log analytics
    await AnalyticsLog.create({
      user_id: req.user._id,
      action_type: 'delete',
      card_id: card._id
    }).catch(err => console.error('Analytics log error:', err));

    res.status(200).json({
      success: true,
      message: 'Knowledge card deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user's own cards
 * @route   GET /api/cards/my-cards
 * @access  Protected
 */
const getMyCards = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const cards = await KnowledgeCard.find({ author_id: req.user._id })
      .sort({ created_at: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .lean();

    const total = await KnowledgeCard.countDocuments({ author_id: req.user._id });

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
 * @desc    Get related cards based on tags and category
 * @route   GET /api/cards/:id/related
 * @access  Public
 */
const getRelatedCards = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { limit = 5 } = req.query;

    const card = await KnowledgeCard.findById(id);

    if (!card) {
      return res.status(404).json({
        success: false,
        message: 'Knowledge card not found',
        code: 'CARD_NOT_FOUND'
      });
    }

    // Find cards with similar tags or same category
    const relatedCards = await KnowledgeCard.find({
      _id: { $ne: id },
      visibility: 'public',
      $or: [
        { tags: { $in: card.tags } },
        { category: card.category }
      ]
    })
      .populate('author_id', 'name')
      .sort({ view_count: -1, like_count: -1 })
      .limit(parseInt(limit))
      .lean();

    res.status(200).json({
      success: true,
      data: { cards: relatedCards }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllCards,
  getCardById,
  createCard,
  updateCard,
  deleteCard,
  getMyCards,
  getRelatedCards
};

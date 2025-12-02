/**
 * Recommendation Controller
 * AI-powered recommendations and suggestions
 */

const {
  getPersonalizedRecommendations,
  getTrendingCards,
  suggestTags,
  suggestCategory
} = require('../utils/aiSuggestions');

/**
 * @desc    Get personalized recommendations for user
 * @route   GET /api/recommendations/personalized
 * @access  Protected
 */
const getPersonalized = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;
    
    const recommendations = await getPersonalizedRecommendations(
      req.user._id,
      parseInt(limit)
    );

    res.status(200).json({
      success: true,
      data: {
        cards: recommendations,
        count: recommendations.length
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get trending cards
 * @route   GET /api/recommendations/trending
 * @access  Public
 */
const getTrending = async (req, res, next) => {
  try {
    const { days = 7, limit = 10 } = req.query;
    
    const trending = await getTrendingCards(
      parseInt(days),
      parseInt(limit)
    );

    res.status(200).json({
      success: true,
      data: {
        cards: trending,
        count: trending.length
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get AI suggestions for tags and category
 * @route   POST /api/recommendations/suggest
 * @access  Protected
 */
const getSuggestions = async (req, res, next) => {
  try {
    const { title, content, tags } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required',
        code: 'MISSING_FIELDS'
      });
    }

    const suggestedTags = suggestTags(title, content);
    const suggestedCategory = suggestCategory(title, content, tags);

    res.status(200).json({
      success: true,
      data: {
        suggested_tags: suggestedTags,
        suggested_category: suggestedCategory
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPersonalized,
  getTrending,
  getSuggestions
};

/**
 * Notification Controller
 * Handle notification operations
 */

const Notification = require('../models/Notification');

/**
 * @desc    Get all notifications for a user
 * @route   GET /api/notifications
 * @access  Protected
 */
const getUserNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, read } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    const query = { user_id: req.user._id };
    
    // Filter by read status if provided
    if (read !== undefined) {
      query.read = read === 'true';
    }

    // Get notifications
    const notifications = await Notification.find(query)
      .populate('related_card_id', 'title category')
      .populate('related_user_id', 'name')
      .sort({ created_at: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .lean();

    // Get total count
    const total = await Notification.countDocuments(query);

    // Get unread count
    const unreadCount = await Notification.countDocuments({
      user_id: req.user._id,
      read: false
    });

    res.status(200).json({
      success: true,
      data: {
        notifications,
        unread_count: unreadCount,
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
 * @desc    Mark notification as read
 * @route   PATCH /api/notifications/:id/read
 * @access  Protected
 */
const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
        code: 'NOTIFICATION_NOT_FOUND'
      });
    }

    // Check if user owns this notification
    if (notification.user_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this notification',
        code: 'FORBIDDEN'
      });
    }

    // Mark as read
    notification.read = true;
    await notification.save();

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: { notification }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark all notifications as read
 * @route   PATCH /api/notifications/read-all
 * @access  Protected
 */
const markAllAsRead = async (req, res, next) => {
  try {
    const result = await Notification.updateMany(
      { user_id: req.user._id, read: false },
      { read: true }
    );

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} notifications marked as read`,
      data: {
        modified_count: result.modifiedCount
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a notification
 * @route   DELETE /api/notifications/:id
 * @access  Protected
 */
const deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
        code: 'NOTIFICATION_NOT_FOUND'
      });
    }

    // Check ownership
    if (notification.user_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this notification',
        code: 'FORBIDDEN'
      });
    }

    await notification.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete all read notifications
 * @route   DELETE /api/notifications/read
 * @access  Protected
 */
const deleteReadNotifications = async (req, res, next) => {
  try {
    const result = await Notification.deleteMany({
      user_id: req.user._id,
      read: true
    });

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} read notifications deleted`,
      data: {
        deleted_count: result.deletedCount
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a notification (internal use)
 * @access  Internal
 */
const createNotification = async (userId, message, type = 'info', relatedCardId = null, relatedUserId = null) => {
  try {
    const notification = await Notification.create({
      user_id: userId,
      message,
      type,
      related_card_id: relatedCardId,
      related_user_id: relatedUserId
    });
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

module.exports = {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteReadNotifications,
  createNotification
};

/**
 * Notification Helper Functions
 * Utility functions for creating notifications
 */

const { createNotification } = require('../controllers/notificationController');

/**
 * Notify user when their card is liked
 */
const notifyCardLiked = async (cardAuthorId, likerName, cardTitle, cardId) => {
  const message = `${likerName} liked your card "${cardTitle}"`;
  await createNotification(cardAuthorId, message, 'like', cardId);
};

/**
 * Notify user when their card is bookmarked
 */
const notifyCardBookmarked = async (cardAuthorId, bookmarkerName, cardTitle, cardId) => {
  const message = `${bookmarkerName} bookmarked your card "${cardTitle}"`;
  await createNotification(cardAuthorId, message, 'bookmark', cardId);
};

/**
 * Notify user of system message
 */
const notifySystem = async (userId, message) => {
  await createNotification(userId, message, 'system');
};

/**
 * Notify user of success
 */
const notifySuccess = async (userId, message, cardId = null) => {
  await createNotification(userId, message, 'success', cardId);
};

/**
 * Notify user of warning
 */
const notifyWarning = async (userId, message) => {
  await createNotification(userId, message, 'warning');
};

/**
 * Notify user of error
 */
const notifyError = async (userId, message) => {
  await createNotification(userId, message, 'error');
};

module.exports = {
  notifyCardLiked,
  notifyCardBookmarked,
  notifySystem,
  notifySuccess,
  notifyWarning,
  notifyError
};

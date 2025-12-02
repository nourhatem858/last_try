/**
 * Database Setup Script
 * Initializes collections, indexes, and validation rules
 */

const dbConnection = require('./connection');
const User = require('./schemas/users.schema');
const KnowledgeCard = require('./schemas/knowledgeCards.schema');
const BookmarkLike = require('./schemas/bookmarksLikes.schema');
const Notification = require('./schemas/notifications.schema');
const AnalyticsLog = require('./schemas/analyticsLogs.schema');

async function setupDatabase() {
  try {
    console.log('Starting database setup...');

    // Connect to database
    await dbConnection.connect();

    // Create collections and indexes
    console.log('Creating collections and indexes...');
    
    await User.createIndexes();
    console.log('✓ Users collection and indexes created');

    await KnowledgeCard.createIndexes();
    console.log('✓ KnowledgeCards collection and indexes created');

    await BookmarkLike.createIndexes();
    console.log('✓ BookmarksLikes collection and indexes created');

    await Notification.createIndexes();
    console.log('✓ Notifications collection and indexes created');

    await AnalyticsLog.createIndexes();
    console.log('✓ AnalyticsLogs collection and indexes created');

    console.log('\nDatabase setup completed successfully!');
    console.log('\nCollection Summary:');
    console.log('- Users: Authentication, profiles, preferences');
    console.log('- KnowledgeCards: Content storage with full-text search');
    console.log('- BookmarksLikes: User interactions tracking');
    console.log('- Notifications: User notification system');
    console.log('- AnalyticsLogs: Action tracking for AI recommendations');

  } catch (error) {
    console.error('Database setup failed:', error);
    throw error;
  } finally {
    await dbConnection.disconnect();
  }
}

// Run setup if executed directly
if (require.main === module) {
  setupDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = setupDatabase;

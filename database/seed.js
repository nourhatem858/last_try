/**
 * Database Seed Script
 * Populates database with sample data for development
 */

const bcrypt = require('bcryptjs');
const dbConnection = require('./connection');
const User = require('./schemas/users.schema');
const KnowledgeCard = require('./schemas/knowledgeCards.schema');
const BookmarkLike = require('./schemas/bookmarksLikes.schema');
const Notification = require('./schemas/notifications.schema');
const AnalyticsLog = require('./schemas/analyticsLogs.schema');

async function seedDatabase() {
  try {
    console.log('Starting database seeding...');

    await dbConnection.connect();

    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await KnowledgeCard.deleteMany({});
    await BookmarkLike.deleteMany({});
    await Notification.deleteMany({});
    await AnalyticsLog.deleteMany({});

    // Create users
    console.log('Creating users...');
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const users = await User.insertMany([
      {
        name: 'Admin User',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin',
        preferences: {
          theme: 'dark',
          favorite_topics: ['AI', 'Machine Learning', 'Data Science']
        }
      },
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: hashedPassword,
        role: 'user',
        preferences: {
          theme: 'light',
          favorite_topics: ['Web Development', 'JavaScript']
        }
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: hashedPassword,
        role: 'user',
        preferences: {
          theme: 'auto',
          favorite_topics: ['Python', 'DevOps']
        }
      }
    ]);
    console.log(`✓ Created ${users.length} users`);

    // Create knowledge cards
    console.log('Creating knowledge cards...');
    const cards = await KnowledgeCard.insertMany([
      {
        title: 'Introduction to Machine Learning',
        content: 'Machine learning is a subset of artificial intelligence that enables systems to learn and improve from experience without being explicitly programmed.',
        author_id: users[0]._id,
        tags: ['machine-learning', 'ai', 'beginner'],
        category: 'AI & ML',
        view_count: 150,
        like_count: 45
      },
      {
        title: 'React Hooks Best Practices',
        content: 'Learn the best practices for using React Hooks including useState, useEffect, and custom hooks to build efficient React applications.',
        author_id: users[1]._id,
        tags: ['react', 'javascript', 'web-development'],
        category: 'Web Development',
        view_count: 200,
        like_count: 67
      },
      {
        title: 'MongoDB Indexing Strategies',
        content: 'Optimize your MongoDB queries with proper indexing strategies. Learn about compound indexes, text indexes, and performance tuning.',
        author_id: users[2]._id,
        tags: ['mongodb', 'database', 'performance'],
        category: 'Database',
        view_count: 89,
        like_count: 23
      }
    ]);
    console.log(`✓ Created ${cards.length} knowledge cards`);

    // Create bookmarks and likes
    console.log('Creating bookmarks and likes...');
    const interactions = await BookmarkLike.insertMany([
      { user_id: users[1]._id, card_id: cards[0]._id, type: 'like' },
      { user_id: users[1]._id, card_id: cards[0]._id, type: 'bookmark' },
      { user_id: users[2]._id, card_id: cards[1]._id, type: 'like' },
      { user_id: users[0]._id, card_id: cards[2]._id, type: 'bookmark' }
    ]);
    console.log(`✓ Created ${interactions.length} interactions`);

    // Create notifications
    console.log('Creating notifications...');
    const notifications = await Notification.insertMany([
      {
        user_id: users[0]._id,
        message: 'Your knowledge card received 10 new likes!',
        type: 'success',
        related_card_id: cards[0]._id,
        read: false
      },
      {
        user_id: users[1]._id,
        message: 'Welcome to Adaptive AI Knowledge Workspace!',
        type: 'info',
        read: true
      }
    ]);
    console.log(`✓ Created ${notifications.length} notifications`);

    // Create analytics logs
    console.log('Creating analytics logs...');
    const logs = await AnalyticsLog.insertMany([
      {
        user_id: users[1]._id,
        action_type: 'view',
        card_id: cards[0]._id,
        metadata: { duration_seconds: 120, device_type: 'desktop' }
      },
      {
        user_id: users[2]._id,
        action_type: 'search',
        metadata: { search_query: 'machine learning' }
      },
      {
        user_id: users[1]._id,
        action_type: 'like',
        card_id: cards[0]._id
      }
    ]);
    console.log(`✓ Created ${logs.length} analytics logs`);

    console.log('\nDatabase seeding completed successfully!');

  } catch (error) {
    console.error('Database seeding failed:', error);
    throw error;
  } finally {
    await dbConnection.disconnect();
  }
}

if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = seedDatabase;

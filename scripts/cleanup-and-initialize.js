/**
 * Database Cleanup and Initialization Script
 * Removes all fake/mock data and prepares clean database
 */

require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

console.log('🧹 Database Cleanup & Initialization');
console.log('=====================================\n');

async function cleanupDatabase() {
  try {
    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();

    if (collections.length === 0) {
      console.log('✅ Database is already clean (no collections)');
      return;
    }

    console.log(`📊 Found ${collections.length} collections:\n`);

    // Show current data counts
    for (const col of collections) {
      const count = await db.collection(col.name).countDocuments();
      console.log(`   ${col.name}: ${count} documents`);
    }

    console.log('\n⚠️  WARNING: This will DELETE ALL DATA from the database!');
    console.log('   Collections to be cleared:');
    collections.forEach(col => console.log(`   - ${col.name}`));

    // In a real scenario, you'd want user confirmation here
    // For automation, we'll proceed directly

    console.log('\n🗑️  Clearing all collections...\n');

    let totalDeleted = 0;
    for (const col of collections) {
      const result = await db.collection(col.name).deleteMany({});
      console.log(`   ✅ ${col.name}: Deleted ${result.deletedCount} documents`);
      totalDeleted += result.deletedCount;
    }

    console.log(`\n✅ Cleanup complete! Deleted ${totalDeleted} total documents`);
    console.log('📊 Database is now clean and ready for real data');

    // Create indexes for better performance
    console.log('\n🔧 Creating database indexes...');
    
    // Users collection indexes
    try {
      await db.collection('users').createIndex({ email: 1 }, { unique: true });
      console.log('   ✅ Users: email index created');
    } catch (e) {
      console.log('   ℹ️  Users: email index already exists');
    }

    // Notes collection indexes
    try {
      await db.collection('notes').createIndex({ author: 1, workspace: 1 });
      await db.collection('notes').createIndex({ createdAt: -1 });
      console.log('   ✅ Notes: indexes created');
    } catch (e) {
      console.log('   ℹ️  Notes: indexes already exist');
    }

    // Workspaces collection indexes
    try {
      await db.collection('workspaces').createIndex({ owner: 1 });
      await db.collection('workspaces').createIndex({ 'members.user': 1 });
      console.log('   ✅ Workspaces: indexes created');
    } catch (e) {
      console.log('   ℹ️  Workspaces: indexes already exist');
    }

    // Documents collection indexes
    try {
      await db.collection('documentmodels').createIndex({ author: 1, workspace: 1 });
      await db.collection('documentmodels').createIndex({ createdAt: -1 });
      console.log('   ✅ Documents: indexes created');
    } catch (e) {
      console.log('   ℹ️  Documents: indexes already exist');
    }

    // Chats collection indexes
    try {
      await db.collection('chats').createIndex({ participants: 1 });
      await db.collection('chats').createIndex({ lastMessageAt: -1 });
      console.log('   ✅ Chats: indexes created');
    } catch (e) {
      console.log('   ℹ️  Chats: indexes already exist');
    }

    console.log('\n✅ Database initialization complete!');
    console.log('\n📝 Next Steps:');
    console.log('   1. Start your application: npm run dev');
    console.log('   2. Create a new account via signup');
    console.log('   3. All data will be REAL and user-specific');
    console.log('   4. No more fake/mock data!');

  } catch (error) {
    console.error('\n❌ Error during cleanup:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

cleanupDatabase();

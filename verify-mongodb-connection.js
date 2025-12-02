/**
 * MongoDB Connection Verification Script
 * Tests connection and provides detailed diagnostics
 */

require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

console.log('🔍 MongoDB Connection Verification');
console.log('=====================================\n');

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in .env.local');
  process.exit(1);
}

// Mask password in URI for display
const maskedURI = MONGODB_URI.replace(/:([^@]+)@/, ':****@');
console.log('📡 Connection String:', maskedURI);
console.log('🌐 Your IP: 196.128.225.174');
console.log('\n⏳ Attempting connection...\n');

async function verifyConnection() {
  try {
    // Connect with timeout
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    console.log('✅ SUCCESS! MongoDB connection established\n');
    
    // Get connection details
    const db = mongoose.connection.db;
    const dbName = db.databaseName;
    const collections = await db.listCollections().toArray();
    
    console.log('📊 Database Information:');
    console.log('   Database Name:', dbName);
    console.log('   Collections:', collections.length);
    
    if (collections.length > 0) {
      console.log('\n📁 Existing Collections:');
      for (const col of collections) {
        const count = await db.collection(col.name).countDocuments();
        console.log(`   - ${col.name}: ${count} documents`);
      }
    } else {
      console.log('\n📁 No collections yet (database is empty)');
    }
    
    console.log('\n✅ All checks passed! Your MongoDB connection is working.');
    console.log('💡 You can now run the application.');
    
  } catch (error) {
    console.error('❌ CONNECTION FAILED\n');
    console.error('Error:', error.message);
    console.error('\n🔧 Troubleshooting Steps:');
    
    if (error.message.includes('authentication failed')) {
      console.error('   1. Check username and password in connection string');
      console.error('   2. Verify database user exists in MongoDB Atlas');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
      console.error('   1. Check cluster hostname in connection string');
      console.error('   2. Verify cluster is running in MongoDB Atlas');
    } else if (error.message.includes('IP') || error.message.includes('not authorized') || error.message.includes('timeout')) {
      console.error('   1. ⚠️  IP WHITELIST ISSUE DETECTED');
      console.error('   2. Go to MongoDB Atlas → Network Access');
      console.error('   3. Add IP: 196.128.225.174');
      console.error('   4. OR allow 0.0.0.0/0 (all IPs) for testing');
      console.error('   5. Wait 2-3 minutes for changes to propagate');
    }
    
    console.error('\n📖 MongoDB Atlas Dashboard:');
    console.error('   https://cloud.mongodb.com/');
    
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

verifyConnection();

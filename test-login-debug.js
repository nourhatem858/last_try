/**
 * Login Debug Test Script
 * Tests database connection and user authentication
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = 'mongodb+srv://nourhatem522082_db_user:dJlfReZEr0fRH4do@cluster0.dvzqg3m.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0';

// User Schema
const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function testLogin() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // List all users
    console.log('📋 Fetching all users...');
    const users = await User.find({}).select('-password');
    console.log(`Found ${users.length} users:\n`);
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email}) - Role: ${user.role}`);
    });

    if (users.length === 0) {
      console.log('\n⚠️  No users found in database!');
      console.log('💡 Please sign up first at: http://localhost:3000/signup\n');
      await mongoose.disconnect();
      return;
    }

    // Test login with first user
    console.log('\n🔐 Testing login...');
    const testEmail = users[0].email;
    console.log(`Testing with email: ${testEmail}`);

    // Get user with password
    const userWithPassword = await User.findOne({ email: testEmail });
    
    if (!userWithPassword) {
      console.log('❌ User not found');
      await mongoose.disconnect();
      return;
    }

    console.log('\n📝 User details:');
    console.log('- Name:', userWithPassword.name);
    console.log('- Email:', userWithPassword.email);
    console.log('- Password Hash:', userWithPassword.password.substring(0, 20) + '...');
    console.log('- Role:', userWithPassword.role);

    // Test password comparison
    console.log('\n🔑 Testing password verification...');
    console.log('Note: You need to know the actual password to test this');
    
    // Try common test passwords
    const testPasswords = ['password123', 'test123', '123456', 'password'];
    
    for (const testPassword of testPasswords) {
      const isMatch = await bcrypt.compare(testPassword, userWithPassword.password);
      if (isMatch) {
        console.log(`✅ Password match found: "${testPassword}"`);
        break;
      }
    }

    console.log('\n✅ Test complete!');
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');

  } catch (error) {
    console.error('❌ Error:', error.message);
    await mongoose.disconnect();
  }
}

testLogin();

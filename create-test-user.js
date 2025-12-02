/**
 * Create Test User Script
 * Creates a test user in the database for testing login
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

async function createTestUser() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Test user credentials
    const testUser = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'user'
    };

    console.log('👤 Creating test user...');
    console.log('📧 Email:', testUser.email);
    console.log('🔑 Password:', testUser.password);
    console.log('');

    // Check if user already exists
    const existingUser = await User.findOne({ email: testUser.email });
    
    if (existingUser) {
      console.log('⚠️  User already exists!');
      console.log('Deleting existing user...\n');
      await User.deleteOne({ email: testUser.email });
    }

    // Hash password
    console.log('🔐 Hashing password...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(testUser.password, salt);
    console.log('✅ Password hashed\n');

    // Create user
    const user = await User.create({
      name: testUser.name,
      email: testUser.email.toLowerCase(),
      password: hashedPassword,
      role: testUser.role,
    });

    console.log('✅ Test user created successfully!\n');
    console.log('📋 User Details:');
    console.log('- ID:', user._id.toString());
    console.log('- Name:', user.name);
    console.log('- Email:', user.email);
    console.log('- Role:', user.role);
    console.log('');
    console.log('🎯 You can now login with:');
    console.log('   Email: test@example.com');
    console.log('   Password: password123');
    console.log('');

    // Verify password works
    console.log('🔍 Verifying password...');
    const isValid = await bcrypt.compare(testUser.password, hashedPassword);
    console.log(isValid ? '✅ Password verification successful!' : '❌ Password verification failed!');

    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');

  } catch (error) {
    console.error('❌ Error:', error.message);
    await mongoose.disconnect();
  }
}

createTestUser();

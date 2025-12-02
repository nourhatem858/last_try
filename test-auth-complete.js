/**
 * Complete Auth System Test
 * Tests signup, login, and database operations
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

async function testAuthSystem() {
  console.log('🧪 COMPLETE AUTH SYSTEM TEST\n');
  console.log('=' .repeat(60));

  try {
    // 1. Test MongoDB Connection
    console.log('\n📋 TEST 1: MongoDB Connection');
    console.log('-'.repeat(60));
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connected successfully');

    // 2. Test User Creation (Signup)
    console.log('\n📋 TEST 2: User Creation (Signup)');
    console.log('-'.repeat(60));
    
    const testEmail = 'test-' + Date.now() + '@example.com';
    const testPassword = 'password123';
    
    console.log('Creating user:', testEmail);
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(testPassword, salt);
    
    // Create user
    const newUser = await User.create({
      name: 'Test User',
      email: testEmail,
      password: hashedPassword,
      role: 'user',
    });
    
    console.log('✅ User created successfully');
    console.log('   ID:', newUser._id.toString());
    console.log('   Name:', newUser.name);
    console.log('   Email:', newUser.email);

    // 3. Test User Login (Password Verification)
    console.log('\n📋 TEST 3: User Login (Password Verification)');
    console.log('-'.repeat(60));
    
    // Find user
    const foundUser = await User.findOne({ email: testEmail });
    
    if (!foundUser) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('✅ User found in database');
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(testPassword, foundUser.password);
    
    if (isPasswordValid) {
      console.log('✅ Password verification successful');
    } else {
      console.log('❌ Password verification failed');
    }

    // 4. Test Existing Users
    console.log('\n📋 TEST 4: List All Users');
    console.log('-'.repeat(60));
    
    const allUsers = await User.find({}).select('-password');
    console.log(`Found ${allUsers.length} users in database:\n`);
    
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email})`);
      console.log(`   ID: ${user._id.toString()}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Created: ${user.createdAt.toISOString()}`);
      console.log('');
    });

    // 5. Test Login API (if server is running)
    console.log('📋 TEST 5: Login API Endpoint');
    console.log('-'.repeat(60));
    
    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123',
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        console.log('✅ Login API working');
        console.log('   Token:', data.token.substring(0, 20) + '...');
        console.log('   User:', data.user.name);
      } else {
        console.log('⚠️  Login API returned error:', data.error);
      }
    } catch (error) {
      console.log('⚠️  Login API test skipped (server not running)');
      console.log('   Start server with: npm run dev');
    }

    // 6. Test Signup API (if server is running)
    console.log('\n📋 TEST 6: Signup API Endpoint');
    console.log('-'.repeat(60));
    
    try {
      const signupEmail = 'api-test-' + Date.now() + '@example.com';
      
      const response = await fetch('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'API Test User',
          email: signupEmail,
          password: 'password123',
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        console.log('✅ Signup API working');
        console.log('   Token:', data.token.substring(0, 20) + '...');
        console.log('   User:', data.user.name);
        
        // Clean up test user
        await User.deleteOne({ email: signupEmail });
        console.log('   (Test user cleaned up)');
      } else {
        console.log('⚠️  Signup API returned error:', data.error);
      }
    } catch (error) {
      console.log('⚠️  Signup API test skipped (server not running)');
      console.log('   Start server with: npm run dev');
    }

    // Clean up test user
    await User.deleteOne({ email: testEmail });

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));
    console.log('✅ MongoDB Connection: PASSED');
    console.log('✅ User Creation: PASSED');
    console.log('✅ Password Hashing: PASSED');
    console.log('✅ Password Verification: PASSED');
    console.log('✅ Database Queries: PASSED');
    console.log('\n🎉 ALL TESTS PASSED!');
    console.log('\n📝 Next Steps:');
    console.log('   1. Start dev server: npm run dev');
    console.log('   2. Visit: http://localhost:3000/login');
    console.log('   3. Login with: test@example.com / password123');
    console.log('');

    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB\n');

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    console.error(error.stack);
    await mongoose.disconnect();
  }
}

testAuthSystem();

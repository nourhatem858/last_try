/**
 * MongoDB Connection Troubleshooter
 * Diagnoses and helps fix MongoDB connection issues
 */

const mongoose = require('mongoose');
const dns = require('dns').promises;

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(70));
  log(title, 'cyan');
  console.log('='.repeat(70) + '\n');
}

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

async function checkEnvironmentVariables() {
  logSection('1. Checking Environment Variables');

  if (!MONGODB_URI) {
    log('❌ MONGODB_URI not found in .env.local', 'red');
    log('\n📝 Fix:', 'yellow');
    log('   1. Create or edit .env.local file', 'blue');
    log('   2. Add: MONGODB_URI=your_mongodb_connection_string', 'blue');
    return false;
  }

  log('✅ MONGODB_URI found', 'green');
  log(`   ${MONGODB_URI.substring(0, 50)}...`, 'blue');

  // Parse connection string
  try {
    const url = new URL(MONGODB_URI.replace('mongodb+srv://', 'https://'));
    log(`\n📊 Connection Details:`, 'cyan');
    log(`   Protocol: mongodb+srv`, 'blue');
    log(`   Host: ${url.hostname}`, 'blue');
    log(`   Database: ${url.pathname.split('/')[1]?.split('?')[0] || 'default'}`, 'blue');
    return true;
  } catch (error) {
    log('⚠️  Could not parse connection string', 'yellow');
    return true; // Continue anyway
  }
}

async function checkDNSResolution() {
  logSection('2. Checking DNS Resolution');

  try {
    const url = new URL(MONGODB_URI.replace('mongodb+srv://', 'https://'));
    const hostname = url.hostname;

    log(`🔍 Resolving: ${hostname}`, 'blue');

    const addresses = await dns.resolve4(hostname);
    log(`✅ DNS resolution successful`, 'green');
    log(`   IP addresses: ${addresses.join(', ')}`, 'blue');
    return true;
  } catch (error) {
    log(`❌ DNS resolution failed: ${error.message}`, 'red');
    log('\n📝 Possible causes:', 'yellow');
    log('   1. No internet connection', 'blue');
    log('   2. Firewall blocking DNS', 'blue');
    log('   3. Invalid hostname in connection string', 'blue');
    return false;
  }
}

async function checkInternetConnection() {
  logSection('3. Checking Internet Connection');

  try {
    log('🌐 Testing connection to Google DNS...', 'blue');
    await dns.resolve4('google.com');
    log('✅ Internet connection working', 'green');
    return true;
  } catch (error) {
    log('❌ No internet connection', 'red');
    log('\n📝 Fix:', 'yellow');
    log('   1. Check your network connection', 'blue');
    log('   2. Try disabling VPN if using one', 'blue');
    log('   3. Check firewall settings', 'blue');
    return false;
  }
}

async function testMongoDBConnection() {
  logSection('4. Testing MongoDB Connection');

  log('🔌 Attempting to connect to MongoDB...', 'blue');
  log('   This may take 10-30 seconds...', 'yellow');

  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 10000,
    });

    log('✅ MongoDB connection successful!', 'green');
    log(`   Connected to: ${mongoose.connection.name}`, 'blue');
    log(`   Ready state: ${mongoose.connection.readyState}`, 'blue');

    await mongoose.disconnect();
    return true;
  } catch (error) {
    log('❌ MongoDB connection failed', 'red');
    log(`   Error: ${error.message}`, 'red');

    // Diagnose specific errors
    if (error.message.includes('IP') || error.message.includes('whitelist')) {
      log('\n🔥 ISSUE IDENTIFIED: IP Not Whitelisted', 'magenta');
      log('\n📝 Fix (CRITICAL):', 'yellow');
      log('   1. Go to https://cloud.mongodb.com/', 'blue');
      log('   2. Select your cluster', 'blue');
      log('   3. Click "Network Access" in left sidebar', 'blue');
      log('   4. Click "Add IP Address"', 'blue');
      log('   5. Choose one:', 'blue');
      log('      a) Add Current IP Address (recommended)', 'blue');
      log('      b) Allow Access from Anywhere (0.0.0.0/0) - dev only', 'blue');
      log('   6. Click "Confirm"', 'blue');
      log('   7. Wait 1-2 minutes for changes to apply', 'blue');
      log('   8. Run this script again', 'blue');
    } else if (error.message.includes('authentication')) {
      log('\n🔥 ISSUE IDENTIFIED: Authentication Failed', 'magenta');
      log('\n📝 Fix:', 'yellow');
      log('   1. Check username and password in connection string', 'blue');
      log('   2. Verify database user exists in MongoDB Atlas', 'blue');
      log('   3. Check user has correct permissions', 'blue');
    } else if (error.message.includes('timeout')) {
      log('\n🔥 ISSUE IDENTIFIED: Connection Timeout', 'magenta');
      log('\n📝 Possible causes:', 'yellow');
      log('   1. Firewall blocking connection', 'blue');
      log('   2. VPN interfering', 'blue');
      log('   3. Network issues', 'blue');
      log('   4. MongoDB cluster down (rare)', 'blue');
    } else {
      log('\n🔥 ISSUE IDENTIFIED: Unknown Error', 'magenta');
      log('\n📝 Try:', 'yellow');
      log('   1. Check MongoDB Atlas status', 'blue');
      log('   2. Verify connection string is correct', 'blue');
      log('   3. Try creating a new database user', 'blue');
    }

    return false;
  }
}

async function checkMongoDBAtlasStatus() {
  logSection('5. Additional Checks');

  log('📊 MongoDB Atlas Checklist:', 'cyan');
  log('   [ ] Cluster is running (not paused)', 'blue');
  log('   [ ] Database user exists', 'blue');
  log('   [ ] User has read/write permissions', 'blue');
  log('   [ ] IP address is whitelisted', 'blue');
  log('   [ ] Connection string is correct', 'blue');
  log('   [ ] No special characters in password (or URL encoded)', 'blue');
}

async function provideSolution() {
  logSection('🎯 Quick Fix Guide');

  log('Most common issue: IP not whitelisted', 'yellow');
  log('\n🚀 Quick Fix (2 minutes):', 'green');
  log('   1. Open: https://cloud.mongodb.com/', 'blue');
  log('   2. Login to your account', 'blue');
  log('   3. Select your cluster (Cluster0)', 'blue');
  log('   4. Click "Network Access" (left sidebar)', 'blue');
  log('   5. Click "Add IP Address" button', 'blue');
  log('   6. Click "Allow Access from Anywhere"', 'blue');
  log('   7. Click "Confirm"', 'blue');
  log('   8. Wait 1-2 minutes', 'blue');
  log('   9. Run: npm run dev', 'blue');
  log('   10. Test: http://localhost:3000/signup', 'blue');

  log('\n🔐 For Production:', 'yellow');
  log('   Use "Add Current IP Address" instead of "Anywhere"', 'blue');

  log('\n📞 Still not working?', 'yellow');
  log('   1. Check MongoDB Atlas status page', 'blue');
  log('   2. Try creating a new database user', 'blue');
  log('   3. Verify cluster is not paused', 'blue');
  log('   4. Check firewall/antivirus settings', 'blue');
}

async function runDiagnostics() {
  console.clear();
  log('🔧 MongoDB Connection Troubleshooter', 'cyan');
  log('Diagnosing connection issues...', 'blue');

  const results = {
    envVars: false,
    internet: false,
    dns: false,
    mongodb: false,
  };

  // Run checks
  results.envVars = await checkEnvironmentVariables();
  if (!results.envVars) {
    await provideSolution();
    return;
  }

  results.internet = await checkInternetConnection();
  if (!results.internet) {
    await provideSolution();
    return;
  }

  results.dns = await checkDNSResolution();
  if (!results.dns) {
    await provideSolution();
    return;
  }

  results.mongodb = await testMongoDBConnection();

  await checkMongoDBAtlasStatus();

  // Summary
  logSection('📊 Diagnostic Summary');

  log(`Environment Variables: ${results.envVars ? '✅' : '❌'}`, results.envVars ? 'green' : 'red');
  log(`Internet Connection: ${results.internet ? '✅' : '❌'}`, results.internet ? 'green' : 'red');
  log(`DNS Resolution: ${results.dns ? '✅' : '❌'}`, results.dns ? 'green' : 'red');
  log(`MongoDB Connection: ${results.mongodb ? '✅' : '❌'}`, results.mongodb ? 'green' : 'red');

  if (results.mongodb) {
    log('\n🎉 SUCCESS! MongoDB connection is working!', 'green');
    log('\n✅ Next steps:', 'cyan');
    log('   1. Run: npm run dev', 'blue');
    log('   2. Test signup: http://localhost:3000/signup', 'blue');
    log('   3. Test login: http://localhost:3000/login', 'blue');
    log('   4. Run tests: node test-auth-complete-system.js', 'blue');
  } else {
    log('\n⚠️  MongoDB connection failed', 'yellow');
    await provideSolution();
  }
}

// Run diagnostics
runDiagnostics().catch(error => {
  log(`\n❌ Diagnostic script crashed: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});

/**
 * System Verification Script
 * Checks all critical components before starting the dev server
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 AI Knowledge Workspace - System Verification\n');
console.log('='.repeat(60));

let allChecksPass = true;

// Check 1: .env.local exists
console.log('\n📋 Check 1: Environment Variables');
if (fs.existsSync('.env.local')) {
  console.log('✅ .env.local exists');
  
  // Read and check for required variables
  const envContent = fs.readFileSync('.env.local', 'utf-8');
  const requiredVars = ['MONGODB_URI', 'JWT_SECRET'];
  const missingVars = [];
  
  requiredVars.forEach(varName => {
    if (!envContent.includes(varName + '=') || envContent.includes(varName + '=<')) {
      missingVars.push(varName);
    }
  });
  
  if (missingVars.length > 0) {
    console.log('⚠️  Missing or incomplete variables:', missingVars.join(', '));
    console.log('   Please configure these in .env.local');
    allChecksPass = false;
  } else {
    console.log('✅ Required environment variables configured');
  }
} else {
  console.log('❌ .env.local NOT found');
  console.log('   Copy .env.local.example to .env.local and configure it');
  allChecksPass = false;
}

// Check 2: node_modules
console.log('\n📦 Check 2: Dependencies');
if (fs.existsSync('node_modules')) {
  console.log('✅ node_modules exists');
  
  // Check critical packages
  const criticalPackages = [
    'next',
    'react',
    'mongoose',
    'pdf-parse',
    'mammoth',
    'jsonwebtoken',
    'bcryptjs',
    'openai'
  ];
  
  const missingPackages = [];
  criticalPackages.forEach(pkg => {
    if (!fs.existsSync(path.join('node_modules', pkg))) {
      missingPackages.push(pkg);
    }
  });
  
  if (missingPackages.length > 0) {
    console.log('⚠️  Missing packages:', missingPackages.join(', '));
    console.log('   Run: npm install');
    allChecksPass = false;
  } else {
    console.log('✅ All critical packages installed');
  }
} else {
  console.log('❌ node_modules NOT found');
  console.log('   Run: npm install');
  allChecksPass = false;
}

// Check 3: .next folder (should be clean)
console.log('\n🏗️  Check 3: Build Cache');
if (fs.existsSync('.next')) {
  console.log('⚠️  .next folder exists (old build cache)');
  console.log('   Recommended: Remove-Item -Recurse -Force .next');
} else {
  console.log('✅ No old build cache (clean state)');
}

// Check 4: Critical files
console.log('\n📄 Check 4: Critical Files');
const criticalFiles = [
  'next.config.ts',
  'package.json',
  'tsconfig.json',
  'lib/mongodb.ts',
  'lib/document-processor.ts',
  'app/api/auth/login/route.ts',
  'app/api/auth/signup/route.ts',
  'app/profile/page.tsx'
];

const missingFiles = [];
criticalFiles.forEach(file => {
  if (!fs.existsSync(file)) {
    missingFiles.push(file);
  }
});

if (missingFiles.length > 0) {
  console.log('❌ Missing files:', missingFiles.join(', '));
  allChecksPass = false;
} else {
  console.log('✅ All critical files present');
}

// Check 5: Port availability
console.log('\n🔌 Check 5: Port Availability');
const net = require('net');
const server = net.createServer();

server.once('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log('⚠️  Port 3000 is in use');
    console.log('   Kill the process or use a different port');
  }
  server.close();
});

server.once('listening', () => {
  console.log('✅ Port 3000 is available');
  server.close();
});

server.listen(3000);

// Check 6: TypeScript configuration
console.log('\n⚙️  Check 6: TypeScript Configuration');
if (fs.existsSync('tsconfig.json')) {
  try {
    const tsconfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf-8'));
    console.log('✅ tsconfig.json is valid');
  } catch (error) {
    console.log('❌ tsconfig.json has syntax errors');
    allChecksPass = false;
  }
} else {
  console.log('❌ tsconfig.json NOT found');
  allChecksPass = false;
}

// Check 7: Next.js configuration
console.log('\n⚙️  Check 7: Next.js Configuration');
if (fs.existsSync('next.config.ts')) {
  console.log('✅ next.config.ts exists');
  const configContent = fs.readFileSync('next.config.ts', 'utf-8');
  
  if (configContent.includes('turbopack:')) {
    console.log('✅ Turbopack configuration present');
  } else {
    console.log('⚠️  Turbopack config not found (may see warnings)');
  }
  
  if (configContent.includes('webpack:')) {
    console.log('✅ Webpack configuration present (for pdf-parse)');
  }
} else {
  console.log('❌ next.config.ts NOT found');
  allChecksPass = false;
}

// Summary
console.log('\n' + '='.repeat(60));
console.log('\n📊 VERIFICATION SUMMARY\n');

if (allChecksPass) {
  console.log('✅ All checks passed! System is ready.');
  console.log('\n🚀 Start the dev server with:');
  console.log('   npm run dev');
  console.log('\n📍 Then visit:');
  console.log('   http://localhost:3000');
  console.log('\n🧪 Test pages:');
  console.log('   - http://localhost:3000/login');
  console.log('   - http://localhost:3000/signup');
  console.log('   - http://localhost:3000/profile (after login)');
  console.log('   - http://localhost:3000/dashboard (after login)');
  console.log('   - http://localhost:3000/test-pdf (PDF upload test)');
} else {
  console.log('⚠️  Some checks failed. Please fix the issues above.');
  console.log('\n📝 Quick fixes:');
  console.log('   1. Copy .env.local.example to .env.local');
  console.log('   2. Configure MONGODB_URI and JWT_SECRET');
  console.log('   3. Run: npm install');
  console.log('   4. Remove .next: Remove-Item -Recurse -Force .next');
}

console.log('\n' + '='.repeat(60));

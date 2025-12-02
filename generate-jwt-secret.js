/**
 * JWT Secret Generator
 * Generates a secure random JWT secret for your .env.local file
 */

const crypto = require('crypto');

console.log('\n========================================');
console.log('  JWT Secret Generator');
console.log('========================================\n');

// Generate 64-byte random secret
const secret = crypto.randomBytes(64).toString('hex');

console.log('✅ Generated JWT Secret:\n');
console.log(secret);
console.log('\n📋 Copy this secret to your .env.local file:\n');
console.log(`JWT_SECRET=${secret}`);
console.log('\n⚠️  IMPORTANT:');
console.log('   - Keep this secret safe');
console.log('   - Never commit it to Git');
console.log('   - Use a different secret for production');
console.log('   - This secret is 128 characters long (very secure)\n');

console.log('========================================\n');

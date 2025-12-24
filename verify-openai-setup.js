/**
 * OpenAI Setup Verification Script
 * Checks API key validity and quota status
 */

require('dotenv').config({ path: '.env.local' });
const OpenAI = require('openai');

async function verifyOpenAI() {
  console.log('🔍 Verifying OpenAI Setup...\n');

  // Check 1: API Key exists
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('❌ OPENAI_API_KEY not found in .env.local');
    console.log('\n📝 Add your API key to .env.local:');
    console.log('   OPENAI_API_KEY=sk-your-key-here\n');
    process.exit(1);
  }

  console.log('✓ API key found');
  console.log(`  Length: ${apiKey.length} characters`);
  console.log(`  Prefix: ${apiKey.substring(0, 10)}...`);

  // Check 2: API Key format
  if (!apiKey.startsWith('sk-')) {
    console.error('\n❌ Invalid API key format (should start with "sk-")');
    process.exit(1);
  }
  console.log('✓ API key format valid\n');

  // Check 3: Test API connection
  console.log('🔌 Testing API connection...');
  const openai = new OpenAI({ apiKey });

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'Say "OK"' }],
      max_tokens: 5,
    });

    console.log('✅ API connection successful!');
    console.log(`   Response: ${response.choices[0].message.content}`);
    console.log(`   Model: ${response.model}`);
    console.log(`   Tokens used: ${response.usage.total_tokens}\n`);

    console.log('🎉 OpenAI is configured correctly!\n');
    return true;

  } catch (error) {
    console.error('\n❌ API Error:', error.message);
    
    if (error.code === 'insufficient_quota') {
      console.log('\n💰 QUOTA EXCEEDED - Action Required:');
      console.log('   1. Visit: https://platform.openai.com/account/billing');
      console.log('   2. Add payment method or purchase credits');
      console.log('   3. Check usage: https://platform.openai.com/usage');
      console.log('\n   OR use a different API key with available credits\n');
    } else if (error.code === 'invalid_api_key') {
      console.log('\n🔑 INVALID API KEY:');
      console.log('   1. Get a new key: https://platform.openai.com/api-keys');
      console.log('   2. Update .env.local with the new key\n');
    } else if (error.status === 429) {
      console.log('\n⏱️ RATE LIMIT / QUOTA ISSUE:');
      console.log('   - You may have exceeded your quota or rate limit');
      console.log('   - Check billing: https://platform.openai.com/account/billing');
      console.log('   - Wait a few minutes and try again\n');
    } else {
      console.log('\n🔧 Troubleshooting:');
      console.log('   - Check internet connection');
      console.log('   - Verify API key is active');
      console.log('   - Check OpenAI status: https://status.openai.com\n');
    }
    
    return false;
  }
}

verifyOpenAI().catch(console.error);

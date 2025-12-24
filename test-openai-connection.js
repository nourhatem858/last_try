/**
 * Test OpenAI Connection
 * Run: node test-openai-connection.js
 */

require('dotenv').config({ path: '.env.local' });
const OpenAI = require('openai');

async function testOpenAI() {
  console.log('🔍 Testing OpenAI Connection...\n');

  // Check API Key
  const apiKey = process.env.OPENAI_API_KEY;
  console.log('1️⃣ Checking API Key:');
  console.log('   - Present:', !!apiKey);
  console.log('   - Length:', apiKey?.length || 0);
  console.log('   - Starts with sk-:', apiKey?.startsWith('sk-') || false);
  console.log('   - Value preview:', apiKey ? apiKey.substring(0, 20) + '...' : 'MISSING');
  console.log('');

  if (!apiKey || apiKey === 'sk-your-openai-api-key-here') {
    console.error('❌ ERROR: OpenAI API key is not configured!');
    console.log('\n📝 Fix:');
    console.log('   1. Open .env.local');
    console.log('   2. Replace OPENAI_API_KEY with your actual key');
    console.log('   3. Restart the server');
    process.exit(1);
  }

  // Test API Connection
  console.log('2️⃣ Testing API Connection...');
  try {
    const openai = new OpenAI({ apiKey });

    console.log('   📤 Sending test request to OpenAI...');
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant. Respond in one short sentence.',
        },
        {
          role: 'user',
          content: 'Say "Hello! I am working correctly." in Arabic and English.',
        },
      ],
      max_tokens: 100,
    });

    const response = completion.choices[0]?.message?.content;
    console.log('   ✅ SUCCESS! OpenAI is working!\n');
    console.log('   🤖 AI Response:');
    console.log('   ' + response);
    console.log('');
    console.log('✨ Your OpenAI API key is valid and working!');
    console.log('');
    console.log('📊 Usage:');
    console.log('   - Model:', completion.model);
    console.log('   - Tokens used:', completion.usage?.total_tokens || 'N/A');
    console.log('');
    console.log('🎉 You can now use AI features in your app!');
    console.log('   Just restart your dev server: npm run dev');

  } catch (error) {
    console.error('   ❌ FAILED!\n');
    console.error('📛 Error Details:');
    console.error('   - Message:', error.message);
    console.error('   - Type:', error.type || 'Unknown');
    console.error('   - Code:', error.code || 'Unknown');
    console.error('   - Status:', error.status || 'Unknown');
    console.log('');

    if (error.code === 'invalid_api_key') {
      console.log('🔧 Fix:');
      console.log('   Your API key is invalid. Please:');
      console.log('   1. Go to: https://platform.openai.com/api-keys');
      console.log('   2. Create a new API key');
      console.log('   3. Replace the key in .env.local');
      console.log('   4. Run this test again');
    } else if (error.code === 'insufficient_quota') {
      console.log('🔧 Fix:');
      console.log('   Your OpenAI account has no credits. Please:');
      console.log('   1. Go to: https://platform.openai.com/account/billing');
      console.log('   2. Add payment method or credits');
      console.log('   3. Try again');
    } else if (error.message?.includes('fetch')) {
      console.log('🔧 Fix:');
      console.log('   Network connection issue. Please:');
      console.log('   1. Check your internet connection');
      console.log('   2. Check if you can access openai.com');
      console.log('   3. Try again');
    } else {
      console.log('🔧 Possible fixes:');
      console.log('   1. Check your API key is correct');
      console.log('   2. Ensure you have internet connection');
      console.log('   3. Visit: https://platform.openai.com/account/api-keys');
    }

    process.exit(1);
  }
}

// Run test
testOpenAI().catch(console.error);

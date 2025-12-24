/**
 * AI Service - OpenAI Integration
 * Handles all AI-powered features with context management
 */

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

const MODEL = process.env.OPENAI_MODEL || 'gpt-4-turbo-preview';

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIResponse {
  content: string;
  sources?: Array<{
    type: string;
    id: string;
    title: string;
    excerpt: string;
  }>;
}

/**
 * Ask AI a question with context
 */
export async function askAI(
  question: string,
  context?: string,
  conversationHistory?: Message[]
): Promise<AIResponse> {
  try {
    console.log('🤖 AI Service - Starting request:', {
      question: question.substring(0, 100),
      hasContext: !!context,
      historyLength: conversationHistory?.length || 0,
      apiKey: process.env.OPENAI_API_KEY ? 'Present (length: ' + process.env.OPENAI_API_KEY.length + ')' : 'Missing',
      model: MODEL,
    });

    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'sk-your-openai-api-key-here') {
      throw new Error('OpenAI API key is not configured. Please add a valid API key to .env.local');
    }

    const messages: Message[] = [
      {
        role: 'system',
        content: `You are an intelligent multilingual AI assistant for a Knowledge Workspace application.

LANGUAGE HANDLING:
- Automatically detect and respond in the SAME language the user uses
- Support Arabic (العربية), English, and any other language seamlessly
- If user writes in Arabic, respond in Arabic
- If user writes in English, respond in English
- If user mixes languages, respond in the primary language used
- Never mention language detection - just respond naturally

YOUR CAPABILITIES:
- Help users manage notes, documents, and workspaces
- Answer questions about their content
- Summarize documents and notes
- Create and organize content
- Provide smart recommendations
- Search and retrieve information

RESPONSE STYLE:
- Be concise, helpful, and actionable
- Use natural, conversational tone
- Provide specific, practical answers
- Format responses clearly with bullet points when helpful
${context ? `\n\nContext from user's workspace:\n${context}` : ''}`,
      },
      ...(conversationHistory || []),
      {
        role: 'user',
        content: question,
      },
    ];

    console.log('📤 Sending request to OpenAI...');
    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: messages as any,
      temperature: 0.7,
      max_tokens: 1000,
    });

    console.log('✅ OpenAI response received');
    const content = completion.choices[0]?.message?.content || 'I apologize, but I could not generate a response.';

    return {
      content,
      sources: [],
    };
  } catch (error: any) {
    console.error('❌ AI Service Error:', {
      message: error.message,
      type: error.type,
      code: error.code,
      status: error.status,
    });
    
    if (error.code === 'invalid_api_key') {
      throw new Error('Invalid OpenAI API key. Please check your API key in .env.local');
    }
    
    if (error.code === 'insufficient_quota') {
      throw new Error('OpenAI API quota exceeded. Please check your billing at platform.openai.com');
    }
    
    throw new Error(`AI service failed: ${error.message}`);
  }
}

/**
 * Summarize document content
 */
export async function summarizeDocument(
  title: string,
  content: string,
  language: 'en' | 'ar' = 'en'
): Promise<{
  summary: string;
  keyPoints: string[];
  topics: string[];
  sentiment: string;
}> {
  try {
    const prompt = language === 'ar'
      ? `قم بتلخيص المستند التالي باللغة العربية:\n\nالعنوان: ${title}\n\nالمحتوى:\n${content}\n\nقدم:\n1. ملخص شامل\n2. النقاط الرئيسية (5-7 نقاط)\n3. المواضيع الرئيسية\n4. التوجه العام (إيجابي/محايد/سلبي)`
      : `Summarize the following document:\n\nTitle: ${title}\n\nContent:\n${content}\n\nProvide:\n1. A comprehensive summary\n2. Key points (5-7 bullet points)\n3. Main topics\n4. Overall sentiment (positive/neutral/negative)`;

    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are an expert document analyzer. Provide clear, structured summaries.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.5,
      max_tokens: 800,
    });

    const response = completion.choices[0]?.message?.content || '';

    const lines = response.split('\n').filter(line => line.trim());
    const summary = lines.slice(0, 3).join(' ');
    const keyPoints = lines.filter(line => line.match(/^[\d\-\•]/)).slice(0, 7);
    const topics = extractTopics(response);

    return {
      summary,
      keyPoints,
      topics,
      sentiment: detectSentiment(response),
    };
  } catch (error: any) {
    console.error('Document Summarization Error:', error);
    throw new Error(`Summarization failed: ${error.message}`);
  }
}

/**
 * Generate content based on prompt
 */
export async function generateContent(
  prompt: string,
  category?: string,
  language: 'en' | 'ar' = 'en'
): Promise<{
  title: string;
  content: string;
  tags: string[];
}> {
  try {
    // Auto-detect language from prompt if not specified
    const detectedLang = language || detectLanguage(prompt);
    
    const systemPrompt = detectedLang === 'ar'
      ? `أنت كاتب محتوى خبير متعدد اللغات. قم بإنشاء محتوى عالي الجودة باللغة العربية بناءً على الطلب. اكتب بأسلوب احترافي وواضح.`
      : `You are an expert multilingual content writer. Create high-quality, informative content based on the user's request. Write in a professional and clear style.`;

    const userPrompt = detectedLang === 'ar'
      ? `أنشئ محتوى حول: ${prompt}${category ? `\nالفئة: ${category}` : ''}\n\nقدم:\n1. عنوان جذاب ومناسب\n2. محتوى شامل ومنظم بشكل احترافي\n3. وسوم ذات صلة (5-7 وسوم)`
      : `Create content about: ${prompt}${category ? `\nCategory: ${category}` : ''}\n\nProvide:\n1. An engaging and appropriate title\n2. Comprehensive, professionally structured content\n3. Relevant tags (5-7 tags)`;

    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.8,
      max_tokens: 1500,
    });

    const response = completion.choices[0]?.message?.content || '';
    const lines = response.split('\n');

    const title = lines.find(line => line.trim())?.replace(/^#+\s*/, '') || 'Generated Content';
    const content = lines.slice(1).join('\n').trim();
    const tags = await generateTags(title + ' ' + content);

    return { title, content, tags };
  } catch (error: any) {
    console.error('Content Generation Error:', error);
    throw new Error(`Content generation failed: ${error.message}`);
  }
}

/**
 * Generate tags from content (multilingual)
 */
export async function generateTags(content: string): Promise<string[]> {
  try {
    const lang = detectLanguage(content);
    const systemPrompt = lang === 'ar' 
      ? 'استخرج 5-7 وسوم ذات صلة من المحتوى. أرجع الوسوم فقط، مفصولة بفواصل.'
      : 'Extract 5-7 relevant tags from the content. Return only the tags, comma-separated. Respond in the same language as the content.';
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: content.substring(0, 1000),
        },
      ],
      temperature: 0.3,
      max_tokens: 100,
    });

    const response = completion.choices[0]?.message?.content || '';
    return response.split(',').map(tag => tag.trim().toLowerCase()).filter(tag => tag.length > 0);
  } catch (error) {
    console.error('Tag Generation Error:', error);
    return [];
  }
}

/**
 * Detect language of text
 */
export function detectLanguage(text: string): 'en' | 'ar' | 'mixed' {
  const arabicPattern = /[\u0600-\u06FF]/;
  const englishPattern = /[a-zA-Z]/;

  const hasArabic = arabicPattern.test(text);
  const hasEnglish = englishPattern.test(text);

  if (hasArabic && hasEnglish) return 'mixed';
  if (hasArabic) return 'ar';
  return 'en';
}

/**
 * Perform semantic search using embeddings
 */
export async function semanticSearch(
  query: string,
  documents: Array<{ id: string; content: string; title: string }>
): Promise<Array<{ id: string; score: number; title: string }>> {
  try {
    const queryEmbedding = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: query,
    });

    const queryVector = queryEmbedding.data[0].embedding;

    const results = await Promise.all(
      documents.map(async (doc) => {
        const docEmbedding = await openai.embeddings.create({
          model: 'text-embedding-3-small',
          input: doc.content.substring(0, 8000),
        });

        const docVector = docEmbedding.data[0].embedding;
        const similarity = cosineSimilarity(queryVector, docVector);

        return {
          id: doc.id,
          title: doc.title,
          score: similarity,
        };
      })
    );

    return results.sort((a, b) => b.score - a.score);
  } catch (error) {
    console.error('Semantic Search Error:', error);
    return [];
  }
}

// Helper functions
function extractTopics(text: string): string[] {
  const topicKeywords = text.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g) || [];
  return [...new Set(topicKeywords)].slice(0, 5);
}

function detectSentiment(text: string): string {
  const positiveWords = ['good', 'great', 'excellent', 'positive', 'success', 'achieve'];
  const negativeWords = ['bad', 'poor', 'negative', 'fail', 'problem', 'issue'];

  const lowerText = text.toLowerCase();
  const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
  const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;

  if (positiveCount > negativeCount) return 'positive';
  if (negativeCount > positiveCount) return 'negative';
  return 'neutral';
}

function cosineSimilarity(vecA: number[], vecB: number[]): number {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

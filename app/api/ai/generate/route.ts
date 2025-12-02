/**
 * AI Generate API Route - REAL AI IMPLEMENTATION
 * POST /api/ai/generate - Generate content using AI
 */

import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/mongodb';
import { generateContent, detectLanguage } from '@/lib/ai-service';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function POST(request: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify token
    jwt.verify(token, JWT_SECRET);

    const body = await request.json();
    const { prompt, category } = body;

    if (!prompt) {
      return NextResponse.json(
        { success: false, error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Detect language
    const language = detectLanguage(prompt);

    // Generate content using AI
    const result = await generateContent(
      prompt,
      category,
      language === 'ar' ? 'ar' : 'en'
    );

    return NextResponse.json({
      success: true,
      title: result.title,
      content: result.content,
      tags: result.tags,
      message: 'Content generated successfully',
    });
  } catch (error: any) {
    console.error('❌ AI generate error:', error);

    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate content' },
      { status: 500 }
    );
  }
}

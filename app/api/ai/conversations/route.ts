/**
 * AI Conversations API Route
 * GET /api/ai/conversations - Get all AI conversations
 */

import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/mongodb';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function GET(request: NextRequest) {
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
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const userId = decoded.id;

    // Connect to database
    await connectDB();

    // TODO: Replace with actual database query
    // For now, returning mock data
    const conversations = [
      {
        id: '1',
        title: 'Project Planning Discussion',
        messages: [
          {
            id: '1',
            role: 'user',
            content: 'What are the key milestones for Q1?',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          },
          {
            id: '2',
            role: 'assistant',
            content: 'Based on your documents, the key Q1 milestones are: 1) Product launch in January, 2) Marketing campaign in February, 3) User feedback analysis in March.',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
            sources: [
              {
                type: 'document',
                id: '1',
                title: 'Q1 Planning Document',
                excerpt: 'Key milestones and deliverables for Q1 2025...',
              },
            ],
          },
        ],
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      },
      {
        id: '2',
        title: 'Marketing Strategy Questions',
        messages: [
          {
            id: '1',
            role: 'user',
            content: 'Summarize our marketing strategy',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
          },
          {
            id: '2',
            role: 'assistant',
            content: 'Your marketing strategy focuses on three main channels: social media, content marketing, and email campaigns. The target audience is professionals aged 25-45.',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
          },
        ],
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      },
    ];

    return NextResponse.json(
      {
        success: true,
        data: conversations,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('AI Conversations GET error:', error);

    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}

/**
 * Cards API Routes
 * GET /api/cards - Get all cards
 * POST /api/cards - Create new card
 */

import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/mongodb';
import Card from '@/models/Card';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Helper function to get user from token
async function getUserFromToken(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return decoded;
  } catch (error) {
    return null;
  }
}

// GET /api/cards - Get all cards
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    // Build query
    const query: any = { isDraft: false };

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
      ];
    }

    // Calculate skip
    const skip = (page - 1) * limit;

    // Execute query
    const [cards, total] = await Promise.all([
      Card.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Card.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limit);

    console.log(`✅ Retrieved ${cards.length} cards`);

    return NextResponse.json(
      {
        success: true,
        cards,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('❌ Get cards error:', error.stack || error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch cards',
      },
      { status: 500 }
    );
  }
}

// POST /api/cards - Create new card
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Get user from token
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required',
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, content, category, tags = [], isDraft = false } = body;

    // Validation
    if (!title || !content || !category) {
      return NextResponse.json(
        {
          success: false,
          error: 'Title, content, and category are required',
        },
        { status: 400 }
      );
    }

    // Get user details
    const userDoc = await User.findById(user.id).select('name');
    if (!userDoc) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found',
        },
        { status: 404 }
      );
    }

    // Create card
    const card = await Card.create({
      title: title.trim(),
      content: content.trim(),
      category: category.trim(),
      tags: Array.isArray(tags) ? tags.map((tag: string) => tag.trim()).filter(Boolean) : [],
      author: user.id,
      authorName: userDoc.name,
      isDraft,
    });

    console.log('✅ Card created:', card._id);

    return NextResponse.json(
      {
        success: true,
        message: isDraft ? 'Card saved as draft' : 'Card created successfully',
        card,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('❌ Create card error:', error.stack || error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        {
          success: false,
          error: messages.join(', '),
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create card',
      },
      { status: 500 }
    );
  }
}

/**
 * Single Card API Routes
 * GET /api/cards/[id] - Get single card
 * PUT /api/cards/[id] - Update card
 * DELETE /api/cards/[id] - Delete card
 */

import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/mongodb';
import Card from '@/models/Card';
import Like from '@/models/Like';
import Bookmark from '@/models/Bookmark';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

async function getUserFromToken(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return null;
    
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return decoded;
  } catch (error) {
    return null;
  }
}

// GET /api/cards/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const card = await Card.findById(id).lean();

    if (!card) {
      return NextResponse.json(
        { success: false, error: 'Card not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, card });
  } catch (error: any) {
    console.error('❌ Get card error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch card' },
      { status: 500 }
    );
  }
}

// PUT /api/cards/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const card = await Card.findById(id);
    if (!card) {
      return NextResponse.json(
        { success: false, error: 'Card not found' },
        { status: 404 }
      );
    }

    // Check ownership
    if (card.author.toString() !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Not authorized to update this card' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, content, category, tags, isDraft } = body;

    // Update fields
    if (title !== undefined) card.title = title.trim();
    if (content !== undefined) card.content = content.trim();
    if (category !== undefined) card.category = category.trim();
    if (tags !== undefined) {
      card.tags = Array.isArray(tags) ? tags.map((tag: string) => tag.trim()).filter(Boolean) : [];
    }
    if (isDraft !== undefined) card.isDraft = isDraft;

    await card.save();

    console.log('✅ Card updated:', card._id);

    return NextResponse.json({
      success: true,
      message: 'Card updated successfully',
      card,
    });
  } catch (error: any) {
    console.error('❌ Update card error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { success: false, error: messages.join(', ') },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update card' },
      { status: 500 }
    );
  }
}

// DELETE /api/cards/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const card = await Card.findById(id);
    if (!card) {
      return NextResponse.json(
        { success: false, error: 'Card not found' },
        { status: 404 }
      );
    }

    // Check ownership
    if (card.author.toString() !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Not authorized to delete this card' },
        { status: 403 }
      );
    }

    // Delete card and associated likes/bookmarks
    await Promise.all([
      Card.findByIdAndDelete(id),
      Like.deleteMany({ cardId: id }),
      Bookmark.deleteMany({ cardId: id }),
    ]);

    console.log('✅ Card deleted:', id);

    return NextResponse.json({
      success: true,
      message: 'Card deleted successfully',
    });
  } catch (error: any) {
    console.error('❌ Delete card error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete card' },
      { status: 500 }
    );
  }
}

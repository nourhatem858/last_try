/**
 * Bookmark API Route
 * POST /api/cards/[id]/bookmark - Toggle bookmark on card
 */

import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/mongodb';
import Card from '@/models/Card';
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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await connectDB();

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

    // Check if already bookmarked
    const existingBookmark = await Bookmark.findOne({
      userId: user.id,
      cardId: id,
    });

    let isBookmarked = false;

    if (existingBookmark) {
      // Remove bookmark
      await Bookmark.deleteOne({ _id: existingBookmark._id });
      card.bookmarks = Math.max(0, card.bookmarks - 1);
      await card.save();
      console.log('🔖 Bookmark removed:', id);
    } else {
      // Add bookmark
      await Bookmark.create({
        userId: user.id,
        cardId: id,
      });
      card.bookmarks += 1;
      await card.save();
      isBookmarked = true;
      console.log('🔖 Card bookmarked:', id);
    }

    return NextResponse.json({
      success: true,
      isBookmarked,
      bookmarks: card.bookmarks,
    });
  } catch (error: any) {
    console.error('❌ Bookmark toggle error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to toggle bookmark' },
      { status: 500 }
    );
  }
}

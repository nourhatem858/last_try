/**
 * Like API Route
 * POST /api/cards/[id]/like - Toggle like on card
 */

import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/mongodb';
import Card from '@/models/Card';
import Like from '@/models/Like';

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

    // Check if already liked
    const existingLike = await Like.findOne({
      userId: user.id,
      cardId: id,
    });

    let isLiked = false;

    if (existingLike) {
      // Unlike
      await Like.deleteOne({ _id: existingLike._id });
      card.likes = Math.max(0, card.likes - 1);
      await card.save();
      console.log('👎 Card unliked:', id);
    } else {
      // Like
      await Like.create({
        userId: user.id,
        cardId: id,
      });
      card.likes += 1;
      await card.save();
      isLiked = true;
      console.log('👍 Card liked:', id);
    }

    return NextResponse.json({
      success: true,
      isLiked,
      likes: card.likes,
    });
  } catch (error: any) {
    console.error('❌ Like toggle error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to toggle like' },
      { status: 500 }
    );
  }
}

/**
 * Member Details API Route
 * GET /api/members/[id] - Get member details
 * PUT /api/members/[id] - Update member role
 * DELETE /api/members/[id] - Remove member
 */

import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/mongodb';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// GET - Member details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: memberId } = await params;
    
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

    // Connect to database
    await connectDB();

    // TODO: Replace with actual database query
    const member = {
      id: memberId,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'owner',
      avatar: null,
      status: 'active',
      joinedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90).toISOString(),
      lastActive: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      permissions: ['read', 'write', 'delete', 'invite'],
    };

    return NextResponse.json(
      {
        success: true,
        data: member,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Member GET error:', error);

    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Member not found' },
      { status: 404 }
    );
  }
}

// PUT - Update member
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: memberId } = await params;
    
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

    // Parse request body
    const body = await request.json();
    const { role } = body;

    // Validate role
    const validRoles = ['admin', 'editor', 'viewer'];
    if (!role || !validRoles.includes(role)) {
      return NextResponse.json(
        { success: false, error: 'Invalid role' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // TODO: Replace with actual database update

    return NextResponse.json(
      {
        success: true,
        message: 'Member role updated successfully',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Member PUT error:', error);

    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update member' },
      { status: 500 }
    );
  }
}

// DELETE - Remove member
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: memberId } = await params;
    
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

    // Connect to database
    await connectDB();

    // TODO: Replace with actual database delete

    return NextResponse.json(
      {
        success: true,
        message: 'Member removed successfully',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Member DELETE error:', error);

    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to remove member' },
      { status: 500 }
    );
  }
}

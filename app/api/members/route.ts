/**
 * Members API Route
 * GET /api/members - List all members for workspace
 * POST /api/members - Add new member to workspace
 */

import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/mongodb';
import mongoose from 'mongoose';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// GET - List members
export async function GET(request: NextRequest) {
  try {
    console.log('👥 Fetching members list');
    
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'No authentication token provided' },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const userId = decoded.id;
    console.log('✅ User authenticated:', userId);

    // Get workspace ID from query params
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspaceId');

    if (!workspaceId) {
      return NextResponse.json(
        { success: false, error: 'Workspace ID is required' },
        { status: 400 }
      );
    }

    // Validate workspace ID format
    if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid workspace ID format' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    const Workspace = (await import('@/models/Workspace')).default;
    const User = (await import('@/models/User')).default;

    // Find workspace and verify user has access
    const workspace = await Workspace.findOne({
      _id: workspaceId,
      $or: [{ owner: userId }, { 'members.user': userId }],
    }).populate('members.user', 'name email avatar');

    if (!workspace) {
      return NextResponse.json(
        { success: false, error: 'Workspace not found or access denied' },
        { status: 403 }
      );
    }

    console.log(`✅ Found workspace: ${workspace.name} with ${workspace.members.length} members`);

    // Format members data
    const members = workspace.members.map((member: any) => ({
      id: member.user._id.toString(),
      userId: member.user._id.toString(),
      name: member.user.name || 'Unknown',
      email: member.user.email || '',
      role: member.role,
      avatar: member.user.avatar || null,
      status: 'active',
      joinedAt: member.joinedAt.toISOString(),
      lastActive: member.user.updatedAt?.toISOString() || null,
    }));

    return NextResponse.json(
      {
        success: true,
        data: members,
        count: members.length,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('❌ Members GET error:', error);

    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { success: false, error: 'Invalid authentication token' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to fetch members' },
      { status: 500 }
    );
  }
}

// POST - Add member
export async function POST(request: NextRequest) {
  try {
    console.log('👥 Adding new member');
    
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'No authentication token provided' },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const userId = decoded.id;
    console.log('✅ User authenticated:', userId);

    // Parse request body
    const body = await request.json();
    const { email, role, workspaceId } = body;

    console.log('📝 Add member request:', { email, role, workspaceId });

    // Validate required fields
    if (!workspaceId) {
      return NextResponse.json(
        { success: false, error: 'Workspace ID is required' },
        { status: 400 }
      );
    }

    if (!email || !email.trim()) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = ['admin', 'member', 'viewer'];
    if (!role || !validRoles.includes(role)) {
      return NextResponse.json(
        { success: false, error: 'Invalid role. Must be admin, member, or viewer' },
        { status: 400 }
      );
    }

    // Validate workspace ID format
    if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid workspace ID format' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    const Workspace = (await import('@/models/Workspace')).default;
    const User = (await import('@/models/User')).default;

    // Find workspace and verify user is owner or admin
    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      return NextResponse.json(
        { success: false, error: 'Workspace not found' },
        { status: 404 }
      );
    }

    // Check if user has permission to add members (owner or admin)
    const isOwner = workspace.owner.toString() === userId;
    const memberEntry = workspace.members.find(
      (m: any) => m.user.toString() === userId
    );
    const isAdmin = memberEntry && memberEntry.role === 'admin';

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Only workspace owner or admin can add members' },
        { status: 403 }
      );
    }

    console.log('✅ User has permission to add members');

    // Find user by email
    const newMemberUser = await User.findOne({ email: email.trim().toLowerCase() });

    if (!newMemberUser) {
      return NextResponse.json(
        { success: false, error: 'User with this email not found. They need to sign up first.' },
        { status: 404 }
      );
    }

    console.log('✅ Found user:', newMemberUser.email);

    // Check if user is already a member
    const alreadyMember = workspace.members.some(
      (m: any) => m.user.toString() === newMemberUser._id.toString()
    );

    if (alreadyMember) {
      return NextResponse.json(
        { success: false, error: 'User is already a member of this workspace' },
        { status: 409 }
      );
    }

    // Add member to workspace
    workspace.members.push({
      user: newMemberUser._id,
      role: role,
      joinedAt: new Date(),
    });

    await workspace.save();

    console.log('✅ Member added to workspace');

    // Create notification for the new member (optional)
    try {
      const Notification = (await import('@/models/Notification')).default;
      const inviter = await User.findById(userId);
      
      await Notification.create({
        user: newMemberUser._id,
        type: 'workspace_invite',
        title: 'Added to Workspace',
        message: `You have been added to "${workspace.name}" by ${inviter?.name || 'a user'}`,
        data: {
          workspaceId: workspace._id.toString(),
          workspaceName: workspace.name,
          inviterId: userId,
          inviterName: inviter?.name || 'Unknown',
        },
        read: false,
      });
      
      console.log('✅ Notification created');
    } catch (notifError) {
      console.log('⚠️  Notification creation failed (non-critical):', notifError);
    }

    // Return the new member data
    const newMember = {
      id: newMemberUser._id.toString(),
      userId: newMemberUser._id.toString(),
      name: newMemberUser.name,
      email: newMemberUser.email,
      role: role,
      avatar: newMemberUser.avatar || null,
      status: 'active',
      joinedAt: new Date().toISOString(),
      lastActive: newMemberUser.updatedAt?.toISOString() || null,
    };

    return NextResponse.json(
      {
        success: true,
        message: 'Member added successfully',
        data: newMember,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('❌ Members POST error:', error);

    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { success: false, error: 'Invalid authentication token' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to add member' },
      { status: 500 }
    );
  }
}

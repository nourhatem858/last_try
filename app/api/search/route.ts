/**
 * Smart Search API Route
 * GET /api/search?q=query
 * Real-time search across Notes, Documents, Members, Workspaces
 */

import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/mongodb';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function GET(request: NextRequest) {
  try {
    // Get token
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

    // Get search query
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim() || '';

    // If empty query, return empty results
    if (!query || query.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          notes: [],
          documents: [],
          members: [],
          workspaces: [],
        },
      });
    }

    // Validate and sanitize query (max 60 chars, prevent XSS)
    const sanitizedQuery = query.substring(0, 60).replace(/[<>]/g, '');

    // Connect to MongoDB
    await connectDB();

    // Import models
    const Note = (await import('@/models/Note')).default;
    const DocumentModel = (await import('@/models/DocumentModel')).default;
    const User = (await import('@/models/User')).default;
    const Workspace = (await import('@/models/Workspace')).default;

    // Search in parallel for performance
    const [notes, documents, members, workspaces] = await Promise.all([
      // Search Notes (title + content)
      Note.find({
        author: userId,
        isArchived: false,
        $or: [
          { title: { $regex: sanitizedQuery, $options: 'i' } },
          { content: { $regex: sanitizedQuery, $options: 'i' } },
        ],
      })
        .select('title content workspace createdAt')
        .populate('workspace', 'name')
        .limit(5)
        .lean(),

      // Search Documents (title + fileName)
      DocumentModel.find({
        author: userId,
        isArchived: false,
        $or: [
          { title: { $regex: sanitizedQuery, $options: 'i' } },
          { fileName: { $regex: sanitizedQuery, $options: 'i' } },
        ],
      })
        .select('title fileName fileType fileSize createdAt')
        .limit(5)
        .lean(),

      // Search Members (name + email) - from workspaces user has access to
      Workspace.find({
        $or: [{ owner: userId }, { 'members.user': userId }],
      })
        .populate({
          path: 'members.user',
          select: 'name email avatar',
          match: {
            $or: [
              { name: { $regex: sanitizedQuery, $options: 'i' } },
              { email: { $regex: sanitizedQuery, $options: 'i' } },
            ],
          },
        })
        .limit(10)
        .lean()
        .then((workspaces) => {
          const uniqueMembers = new Map();
          workspaces.forEach((workspace: any) => {
            workspace.members?.forEach((member: any) => {
              if (member.user && member.user._id) {
                const userId = member.user._id.toString();
                if (!uniqueMembers.has(userId)) {
                  uniqueMembers.set(userId, {
                    id: userId,
                    name: member.user.name,
                    email: member.user.email,
                    avatar: member.user.avatar,
                    role: member.role,
                  });
                }
              }
            });
          });
          return Array.from(uniqueMembers.values()).slice(0, 5);
        }),

      // Search Workspaces (name)
      Workspace.find({
        $or: [{ owner: userId }, { 'members.user': userId }],
        name: { $regex: sanitizedQuery, $options: 'i' },
      })
        .select('name description owner createdAt')
        .limit(5)
        .lean(),
    ]);

    // Format results
    const formattedNotes = notes.map((note: any) => ({
      id: note._id.toString(),
      title: note.title,
      content: note.content?.substring(0, 100) || '',
      workspace: (note.workspace as any)?.name || 'Unknown',
      createdAt: note.createdAt.toISOString(),
      type: 'note',
    }));

    const formattedDocuments = documents.map((doc: any) => ({
      id: doc._id.toString(),
      title: doc.title,
      fileName: doc.fileName,
      fileType: doc.fileType,
      fileSize: doc.fileSize,
      createdAt: doc.createdAt.toISOString(),
      type: 'document',
    }));

    const formattedWorkspaces = workspaces.map((workspace: any) => ({
      id: workspace._id.toString(),
      name: workspace.name,
      description: workspace.description,
      isOwner: workspace.owner.toString() === userId,
      createdAt: workspace.createdAt.toISOString(),
      type: 'workspace',
    }));

    return NextResponse.json({
      success: true,
      data: {
        notes: formattedNotes,
        documents: formattedDocuments,
        members: members,
        workspaces: formattedWorkspaces,
      },
      query: sanitizedQuery,
    });
  } catch (error: any) {
    console.error('Search error:', error);

    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Search failed' },
      { status: 500 }
    );
  }
}

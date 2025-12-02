/**
 * Single Document API Route
 * GET /api/documents/[id] - Get document details
 * PATCH /api/documents/[id] - Update document
 * DELETE /api/documents/[id] - Delete document
 */

import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/mongodb';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// GET - Get document details
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const params = await Promise.resolve(context.params);
    const documentId = params.id;
    
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

    // Import models
    const DocumentModel = (await import('@/models/DocumentModel')).default;
    const Workspace = (await import('@/models/Workspace')).default;
    const mongoose = await import('mongoose');

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(documentId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid document ID' },
        { status: 400 }
      );
    }

    // Fetch document
    const document = await DocumentModel.findById(documentId)
      .populate('workspace', 'name')
      .populate('author', 'name email')
      .lean();

    if (!document) {
      return NextResponse.json(
        { success: false, error: 'Document not found' },
        { status: 404 }
      );
    }

    // Verify user has access via workspace
    const workspace = await Workspace.findOne({
      _id: document.workspace,
      $or: [
        { owner: userId },
        { 'members.user': userId },
      ],
    });

    if (!workspace) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
    }

    // Increment view count
    await DocumentModel.findByIdAndUpdate(documentId, {
      $inc: { viewCount: 1 },
    });

    return NextResponse.json(
      {
        success: true,
        document: {
          id: document._id.toString(),
          title: document.title,
          description: document.description,
          fileName: document.fileName,
          fileType: document.fileType,
          size: document.fileSize,
          uploadedAt: document.createdAt.toISOString(),
          updatedAt: document.updatedAt.toISOString(),
          url: document.fileUrl,
          tags: document.tags || [],
          workspace: (document.workspace as any)?.name || 'Unknown',
          workspaceId: document.workspace.toString(),
          uploadedBy: (document.author as any)?.name || 'Unknown',
          extractedText: document.extractedText,
          viewCount: document.viewCount,
          downloadCount: document.downloadCount,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Document GET error:', error);

    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to fetch document' },
      { status: 500 }
    );
  }
}

// PATCH - Update document
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const params = await Promise.resolve(context.params);
    const documentId = params.id;
    
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

    // Parse request body
    const body = await request.json();
    const { title, tags, description } = body;

    // Connect to database
    await connectDB();

    // Import models
    const DocumentModel = (await import('@/models/DocumentModel')).default;
    const Workspace = (await import('@/models/Workspace')).default;
    const mongoose = await import('mongoose');

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(documentId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid document ID' },
        { status: 400 }
      );
    }

    // Fetch document
    const document = await DocumentModel.findById(documentId);

    if (!document) {
      return NextResponse.json(
        { success: false, error: 'Document not found' },
        { status: 404 }
      );
    }

    // Verify user has access via workspace
    const workspace = await Workspace.findOne({
      _id: document.workspace,
      $or: [
        { owner: userId },
        { 'members.user': userId },
      ],
    });

    if (!workspace) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
    }

    // Update document
    const updateData: any = {};
    if (title !== undefined) updateData.title = title.trim();
    if (tags !== undefined) updateData.tags = tags;
    if (description !== undefined) updateData.description = description.trim();

    const updatedDocument = await DocumentModel.findByIdAndUpdate(
      documentId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).lean();

    return NextResponse.json(
      {
        success: true,
        message: 'Document updated successfully',
        document: {
          id: updatedDocument._id.toString(),
          title: updatedDocument.title,
          tags: updatedDocument.tags,
          description: updatedDocument.description,
          updatedAt: updatedDocument.updatedAt.toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Document PATCH error:', error);

    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update document' },
      { status: 500 }
    );
  }
}

// DELETE - Delete document
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const params = await Promise.resolve(context.params);
    const documentId = params.id;
    
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

    // Import models
    const DocumentModel = (await import('@/models/DocumentModel')).default;
    const Workspace = (await import('@/models/Workspace')).default;
    const mongoose = await import('mongoose');

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(documentId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid document ID' },
        { status: 400 }
      );
    }

    // Fetch document
    const document = await DocumentModel.findById(documentId);

    if (!document) {
      return NextResponse.json(
        { success: false, error: 'Document not found' },
        { status: 404 }
      );
    }

    // Verify user has access via workspace
    const workspace = await Workspace.findOne({
      _id: document.workspace,
      $or: [
        { owner: userId },
        { 'members.user': userId },
      ],
    });

    if (!workspace) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
    }

    // Delete file from storage
    try {
      const { fileUploadService } = await import('@/lib/file-upload');
      await fileUploadService.deleteFile(document.fileUrl);
    } catch (fileError) {
      console.error('File deletion error:', fileError);
      // Continue with database deletion even if file deletion fails
    }

    // Delete from database
    await DocumentModel.findByIdAndDelete(documentId);

    // Delete from search index
    try {
      const { searchService } = await import('@/lib/search-service');
      await searchService.deleteDocument(documentId);
    } catch (searchError) {
      console.error('Search index deletion error:', searchError);
      // Continue even if search deletion fails
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Document deleted successfully',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Document DELETE error:', error);

    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to delete document' },
      { status: 500 }
    );
  }
}

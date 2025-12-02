/**
 * Documents API Route
 * GET /api/documents - List all documents for user/workspace
 * POST /api/documents - Upload new document
 */

import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/mongodb';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// GET - List documents
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

    // Get workspace ID from query params
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspaceId');

    // Connect to database
    await connectDB();

    // Import models
    const DocumentModel = (await import('@/models/DocumentModel')).default;
    const Workspace = (await import('@/models/Workspace')).default;

    // Build query
    const query: any = { author: userId };
    
    if (workspaceId) {
      // Verify user has access to workspace
      const workspace = await Workspace.findOne({
        _id: workspaceId,
        $or: [
          { owner: userId },
          { 'members.user': userId },
        ],
      });

      if (!workspace) {
        return NextResponse.json(
          { success: false, error: 'Workspace not found or access denied' },
          { status: 403 }
        );
      }

      query.workspace = workspaceId;
    }

    // Fetch documents from database
    const documents = await DocumentModel.find(query)
      .populate('workspace', 'name')
      .sort({ createdAt: -1 })
      .lean();

    console.log(`✅ [API] Found ${documents.length} documents for user ${userId}`);

    // Format response
    const formattedDocs = documents.map(doc => {
      // Safety check for _id
      if (!doc._id) {
        console.error('❌ [API] Document missing _id:', doc);
        return null;
      }

      return {
        id: doc._id.toString(), // ✅ Convert MongoDB _id to string id
        title: doc.title,
        fileName: doc.fileName,
        fileType: doc.fileType,
        fileSize: doc.fileSize,
        tags: doc.tags || [],
        workspace: (doc.workspace as any)?.name || 'Unknown',
        workspaceId: doc.workspace.toString(),
        uploadedAt: doc.createdAt.toISOString(),
        updatedAt: doc.updatedAt.toISOString(),
        uploadedBy: doc.author.toString(),
        url: doc.fileUrl,
        description: doc.description,
        color: 'cyan', // ✅ Default color for documents
      };
    }).filter(Boolean); // Remove any null entries

    console.log(`✅ [API] Returning ${formattedDocs.length} formatted documents`);

    return NextResponse.json(
      {
        success: true,
        data: formattedDocs,
        count: formattedDocs.length,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Documents GET error:', error);

    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}

// POST - Upload document
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
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const userId = decoded.id;

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    let workspaceId = formData.get('workspaceId') as string;
    const tags = formData.get('tags') ? JSON.parse(formData.get('tags') as string) : [];
    const description = formData.get('description') as string;

    // Validate required fields
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'File is required' },
        { status: 400 }
      );
    }

    if (!title || !title.trim()) {
      return NextResponse.json(
        { success: false, error: 'Document title is required' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Import models and services
    const DocumentModel = (await import('@/models/DocumentModel')).default;
    const Workspace = (await import('@/models/Workspace')).default;
    const { fileUploadService } = await import('@/lib/file-upload');
    const { documentProcessor } = await import('@/lib/document-processor');
    const { searchService } = await import('@/lib/search-service');

    // If no workspaceId provided, find or create Personal workspace
    let workspace;
    if (!workspaceId) {
      workspace = await Workspace.findOne({ 
        owner: userId, 
        name: 'Personal' 
      });

      if (!workspace) {
        workspace = await Workspace.create({
          name: 'Personal',
          description: 'Personal workspace',
          owner: userId,
          members: [{ user: userId, role: 'owner' }],
        });
      }
      workspaceId = workspace._id.toString();
    } else {
      workspace = await Workspace.findOne({
        _id: workspaceId,
        $or: [
          { owner: userId },
          { 'members.user': userId },
        ],
      });

      if (!workspace) {
        return NextResponse.json(
          { success: false, error: 'Workspace not found or access denied' },
          { status: 403 }
        );
      }
    }

    try {
      // 1. Upload file
      const uploadResult = await fileUploadService.uploadFile(file);

      // 2. Extract text from file
      const buffer = Buffer.from(await file.arrayBuffer());
      const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
      const extracted = await documentProcessor.extractText(buffer, fileExt);

      // 3. Save to database
      const newDocument = new DocumentModel({
        title: title.trim(),
        description: description?.trim(),
        workspace: workspaceId,
        author: userId,
        fileUrl: uploadResult.fileUrl,
        fileName: uploadResult.fileName,
        fileType: uploadResult.fileType,
        fileSize: uploadResult.fileSize,
        extractedText: extracted.text,
        tags: tags || [],
        isPinned: false,
        isArchived: false,
        collaborators: [],
        viewCount: 0,
        downloadCount: 0,
      });

      await newDocument.save();

      // 4. Index for search
      await searchService.indexDocument({
        id: newDocument._id.toString(),
        type: 'document',
        title: newDocument.title,
        content: extracted.text || '',
        workspaceId: workspaceId,
        userId: userId,
        tags: tags,
        createdAt: newDocument.createdAt,
      });

      // 5. TODO: Emit realtime event (when socket.io is set up)
      // io.to(workspaceId).emit('document:created', { document: newDocument });

      return NextResponse.json(
        {
          success: true,
          message: 'Document uploaded successfully',
          data: {
            id: newDocument._id.toString(),
            title: newDocument.title,
            fileName: newDocument.fileName,
            fileType: newDocument.fileType,
            fileSize: newDocument.fileSize,
            tags: newDocument.tags,
            workspace: workspace.name,
            workspaceId: workspaceId,
            uploadedAt: newDocument.createdAt.toISOString(),
            updatedAt: newDocument.updatedAt.toISOString(),
            uploadedBy: userId,
            url: newDocument.fileUrl,
            description: newDocument.description,
            color: 'cyan',
          },
        },
        { status: 201 }
      );
    } catch (error: any) {
      console.error('Document upload error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to upload document: ' + error.message },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Documents POST error:', error);

    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to upload document' },
      { status: 500 }
    );
  }
}

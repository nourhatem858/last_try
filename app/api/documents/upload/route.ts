/**
 * Document Upload API Route - REAL FILE PROCESSING
 * POST /api/documents/upload - Upload and process PDF/DOCX files
 */

import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/mongodb';
import { processDocument } from '@/lib/document-processor';
import { summarizeDocument, generateTags, detectLanguage } from '@/lib/ai-service';
import DocumentModel from '@/models/DocumentModel';
import Workspace from '@/models/Workspace';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

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

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const workspaceId = formData.get('workspaceId') as string;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'File is required' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Only PDF and DOCX files are supported' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File size must be less than 10MB' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Verify workspace
    let workspace = null;
    if (workspaceId) {
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
          { status: 404 }
        );
      }
    } else {
      // Use personal workspace
      workspace = await Workspace.findOne({ owner: userId, name: 'Personal' });
      if (!workspace) {
        workspace = await Workspace.create({
          name: 'Personal',
          description: 'Personal workspace',
          owner: userId,
          members: [{ user: userId, role: 'owner' }],
        });
      }
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Process document (extract text)
    const processed = await processDocument(buffer, file.type);

    // Generate AI summary
    const language = detectLanguage(processed.text);
    const summary = await summarizeDocument(
      title || file.name,
      processed.text,
      language === 'ar' ? 'ar' : 'en'
    );

    // Generate tags
    const tags = await generateTags(processed.text);

    // In production, upload file to cloud storage (S3, etc.)
    // For now, we'll store a placeholder URL
    const fileUrl = `/uploads/${Date.now()}-${file.name}`;

    // Create document in database
    const document = await DocumentModel.create({
      title: title || file.name.replace(/\.[^/.]+$/, ''),
      description: description || '',
      workspace: workspace._id,
      author: userId,
      fileUrl,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      extractedText: processed.text,
      summary,
      tags,
      isPinned: false,
      isArchived: false,
      collaborators: [],
      viewCount: 0,
      downloadCount: 0,
    });

    // Populate references
    await document.populate('workspace', 'name');
    await document.populate('author', 'name email');

    return NextResponse.json(
      {
        success: true,
        message: 'Document uploaded and processed successfully',
        data: {
          id: document._id.toString(),
          title: document.title,
          description: document.description,
          workspace: document.workspace.name,
          workspaceId: document.workspace._id.toString(),
          fileName: document.fileName,
          fileType: document.fileType,
          fileSize: document.fileSize,
          summary: document.summary,
          tags: document.tags,
          createdAt: document.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Document Upload error:', error);

    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to upload document' },
      { status: 500 }
    );
  }
}

// Note: bodyParser config is deprecated in App Router
// File uploads are handled directly in the route handler

/**
 * AI Document Summarization API Route - REAL AI IMPLEMENTATION
 * GET /api/ai/summarize-document?id={documentId}
 */

import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/mongodb';
import { summarizeDocument, detectLanguage } from '@/lib/ai-service';
import DocumentModel from '@/models/DocumentModel';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

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

    // Get document ID from query params
    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('id');

    if (!documentId) {
      return NextResponse.json(
        { success: false, error: 'Document ID is required' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Get document
    const document = await DocumentModel.findById(documentId);

    if (!document) {
      return NextResponse.json(
        { success: false, error: 'Document not found' },
        { status: 404 }
      );
    }

    // Check if summary already exists
    if (document.summary) {
      return NextResponse.json(
        {
          success: true,
          summary: document.summary,
        },
        { status: 200 }
      );
    }

    // Generate summary if not exists
    if (!document.extractedText) {
      return NextResponse.json(
        { success: false, error: 'Document text not extracted yet' },
        { status: 400 }
      );
    }

    // Detect language
    const language = detectLanguage(document.extractedText);

    // Generate AI summary
    const summary = await summarizeDocument(
      document.title,
      document.extractedText,
      language === 'ar' ? 'ar' : 'en'
    );

    // Calculate reading time
    const wordCount = document.extractedText.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200); // Average reading speed

    const summaryData = {
      ...summary,
      readingTime: `${readingTime} minute${readingTime > 1 ? 's' : ''}`,
    };

    // Save summary to document
    document.summary = summaryData;
    await document.save();

    return NextResponse.json(
      {
        success: true,
        summary: summaryData,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('AI Summarize Document GET error:', error);

    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate summary' },
      { status: 500 }
    );
  }
}

/**
 * Document Summarize API
 * POST /api/documents/[id]/summarize - AI-powered document summarization with file extraction
 */

import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/mongodb';
import mongoose from 'mongoose';
import OpenAI from 'openai';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

// Basic summarization function (fallback when OpenAI is not available)
function generateBasicSummary(content: string, title: string) {
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
  const words = content.toLowerCase().split(/\s+/);
  
  // Generate summary (first 3 sentences)
  const summary = sentences.slice(0, 3).join('. ').trim() + '.';
  
  // Generate key points (extract sentences with important keywords)
  const importantKeywords = ['important', 'key', 'must', 'should', 'required', 'essential', 'critical', 'main', 'primary'];
  const keyPoints = sentences
    .filter(s => importantKeywords.some(kw => s.toLowerCase().includes(kw)))
    .slice(0, 7)
    .map(s => s.trim());
  
  // If not enough key points, use first sentences
  if (keyPoints.length < 3) {
    keyPoints.push(...sentences.slice(0, 7 - keyPoints.length).map(s => s.trim()));
  }
  
  // Generate keywords (most frequent words)
  const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those'];
  const wordFreq: Record<string, number> = {};
  
  words.forEach(word => {
    const cleaned = word.replace(/[^a-z0-9]/g, '');
    if (cleaned.length > 3 && !stopWords.includes(cleaned)) {
      wordFreq[cleaned] = (wordFreq[cleaned] || 0) + 1;
    }
  });
  
  const keywords = Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([word]) => word);
  
  return {
    summary: summary || `This document titled "${title}" contains ${sentences.length} sentences and ${words.length} words.`,
    points: keyPoints.length > 0 ? keyPoints : [
      `Document: ${title}`,
      `Total length: ${content.length} characters`,
      `Contains ${sentences.length} sentences`,
      `Word count: ${words.length}`,
    ],
    keywords: keywords.length > 0 ? keywords : ['document', 'content', 'text', 'information'],
  };
}

async function extractTextFromFile(fileUrl: string, fileType: string, fileName: string): Promise<string> {
  try {
    console.log('📥 Downloading file from:', fileUrl);
    
    // Check if it's a local file path or URL
    let buffer: Buffer;
    
    if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
      // Remote file - download it
      const response = await fetch(fileUrl);
      if (!response.ok) {
        throw new Error(`Failed to download file: ${response.status} ${response.statusText}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
      console.log('✅ File downloaded, size:', buffer.length, 'bytes');
    } else {
      // Local file - read from filesystem
      const fs = require('fs').promises;
      const path = require('path');
      const filePath = path.join(process.cwd(), 'public', fileUrl);
      console.log('📂 Reading local file:', filePath);
      buffer = await fs.readFile(filePath);
      console.log('✅ File read, size:', buffer.length, 'bytes');
    }

    if (buffer.length === 0) {
      throw new Error('File is empty');
    }

    console.log('🔍 Extracting text from file type:', fileType);

    // Extract based on file type
    const lowerFileType = fileType.toLowerCase();
    const lowerFileName = fileName.toLowerCase();

    if (lowerFileType.includes('pdf') || lowerFileName.endsWith('.pdf')) {
      console.log('📄 Extracting PDF...');
      const data = await pdfParse(buffer);
      console.log('✅ PDF extracted:', data.text.length, 'characters,', data.numpages, 'pages');
      return data.text;
    } else if (
      lowerFileType.includes('word') ||
      lowerFileType.includes('docx') ||
      lowerFileType.includes('doc') ||
      lowerFileName.endsWith('.docx') ||
      lowerFileName.endsWith('.doc')
    ) {
      console.log('📝 Extracting DOCX...');
      const result = await mammoth.extractRawText({ buffer });
      console.log('✅ DOCX extracted:', result.value.length, 'characters');
      return result.value;
    } else if (
      lowerFileType.includes('text') ||
      lowerFileType.includes('txt') ||
      lowerFileName.endsWith('.txt')
    ) {
      console.log('📃 Reading TXT...');
      const text = buffer.toString('utf-8');
      console.log('✅ TXT read:', text.length, 'characters');
      return text;
    } else {
      console.warn('⚠️ Unsupported file type, trying as text...');
      const text = buffer.toString('utf-8');
      if (text.length > 0) {
        console.log('✅ Read as text:', text.length, 'characters');
        return text;
      }
      throw new Error(`Unsupported file type: ${fileType}`);
    }
  } catch (error: any) {
    console.error('❌ File extraction error:', {
      error: error.message,
      stack: error.stack,
      fileUrl,
      fileType,
      fileName,
    });
    throw new Error(`Failed to extract text: ${error.message}`);
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  const startTime = Date.now();
  
  try {
    const params = await Promise.resolve(context.params);
    const documentId = params.id;

    console.log('📩 Incoming summarize request:', {
      documentId,
      timestamp: new Date().toISOString(),
    });

    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      console.error('❌ No auth token provided');
      return NextResponse.json(
        { success: false, error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      );
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
      console.log('✅ Token verified for user:', decoded.id);
    } catch (jwtError) {
      console.error('❌ JWT verification failed:', jwtError);
      return NextResponse.json(
        { success: false, error: 'Invalid token', message: 'Session expired' },
        { status: 401 }
      );
    }

    const userId = decoded.id;

    if (!mongoose.Types.ObjectId.isValid(documentId)) {
      console.error('❌ Invalid ObjectId format:', documentId);
      return NextResponse.json(
        { success: false, error: 'Invalid document ID', message: 'Document ID format is invalid' },
        { status: 400 }
      );
    }

    console.log('🔌 Connecting to MongoDB...');
    await connectDB();
    console.log('✅ MongoDB connected');

    const DocumentModel = (await import('@/models/DocumentModel')).default;
    const Workspace = (await import('@/models/Workspace')).default;

    console.log('🔍 Finding document:', documentId);
    const document = await DocumentModel.findById(documentId).lean();

    if (!document) {
      console.error('❌ Document not found:', documentId);
      return NextResponse.json(
        { success: false, error: 'Document not found', message: 'This document does not exist' },
        { status: 404 }
      );
    }

    console.log('✅ Document found:', {
      title: document.title,
      fileType: document.fileType,
      fileUrl: document.fileUrl,
      hasExtractedText: !!document.extractedText,
      extractedTextLength: document.extractedText?.length || 0,
    });

    console.log('🔐 Checking workspace access...');
    const workspace = await Workspace.findOne({
      _id: document.workspace,
      $or: [{ owner: userId }, { 'members.user': userId }],
    });

    if (!workspace) {
      console.error('❌ Access denied for user:', userId);
      return NextResponse.json(
        { success: false, error: 'Access denied', message: 'You do not have permission to access this document' },
        { status: 403 }
      );
    }

    console.log('✅ Access granted');

    let content = document.extractedText || '';
    console.log('📄 Initial content length:', content.length);

    if (!content || content.trim().length < 10) {
      console.log('⚠️ No extracted text found, extracting from file...');
      console.log('📥 File details:', {
        url: document.fileUrl,
        type: document.fileType,
        name: document.fileName,
        size: document.fileSize,
      });

      try {
        content = await extractTextFromFile(document.fileUrl, document.fileType, document.fileName);
        console.log('✅ Text extracted successfully:', {
          length: content.length,
          words: content.split(/\s+/).length,
          preview: content.substring(0, 150) + '...',
        });
        
        if (content && content.trim().length >= 10) {
          console.log('💾 Saving extracted text to database for future use...');
          await DocumentModel.findByIdAndUpdate(documentId, {
            extractedText: content,
          });
          console.log('✅ Extracted text saved to database');
        } else {
          console.warn('⚠️ Extracted text too short:', content.length, 'characters');
        }
      } catch (extractError: any) {
        console.error('❌ Text extraction failed:', {
          error: extractError.message,
          stack: extractError.stack,
          fileUrl: document.fileUrl,
          fileType: document.fileType,
          fileName: document.fileName,
        });
        
        // Try alternative: use document description or title as fallback
        if (document.description && document.description.length > 50) {
          console.log('⚠️ Using document description as fallback');
          content = `${document.title}\n\n${document.description}`;
        }
      }
    }

    if (!content || content.trim().length < 10) {
      console.error('❌ No readable content found:', {
        contentLength: content?.length || 0,
        fileType: document.fileType,
        fileUrl: document.fileUrl,
      });
      return NextResponse.json(
        {
          success: false,
          error: 'No readable content found in this file',
          message: `Unable to extract text from ${document.fileType} file. The file may be empty, corrupted, or in an unsupported format.`,
          fileType: document.fileType,
        },
        { status: 400 }
      );
    }

    console.log('🤖 Preparing summarization...');
    console.log('📊 Content stats:', {
      totalLength: content.length,
      sendingLength: Math.min(content.length, 8000),
      words: content.split(/\s+/).length,
    });

    let parsed: any;

    // Check if OpenAI API key is available
    const hasOpenAI = process.env.OPENAI_API_KEY && 
                      process.env.OPENAI_API_KEY !== 'sk-your-openai-api-key-here' &&
                      process.env.OPENAI_API_KEY.startsWith('sk-');

    if (hasOpenAI) {
      console.log('🤖 Using OpenAI for summarization...');
      try {
        const completion = await openai.chat.completions.create({
          model: 'gpt-4-turbo-preview',
          messages: [
            {
              role: 'system',
              content: 'You are an expert document analyzer. Provide clear, structured summaries in JSON format with keys: summary, points, keywords.',
            },
            {
              role: 'user',
              content: `Summarize this professional document into:
1. "summary": Short summary (2-3 sentences)
2. "points": Main bullet points (5-7 points as array)
3. "keywords": Important keywords (5-8 words as array)

DOCUMENT TITLE: ${document.title}

TEXT:
${content.substring(0, 8000)}`,
            },
          ],
          temperature: 0.5,
          max_tokens: 1000,
          response_format: { type: 'json_object' },
        });

        const response = completion.choices[0]?.message?.content || '{}';
        console.log('✅ AI response received:', response.substring(0, 200));
        parsed = JSON.parse(response);
      } catch (aiError: any) {
        console.error('❌ OpenAI error:', aiError.message);
        console.log('⚠️ Falling back to basic summarization...');
        parsed = generateBasicSummary(content, document.title);
      }
    } else {
      console.log('⚠️ OpenAI API key not configured, using basic summarization...');
      parsed = generateBasicSummary(content, document.title);
    }

    console.log('✅ Summary generated:', {
      hasSummary: !!parsed.summary,
      pointsCount: parsed.points?.length || 0,
      keywordsCount: parsed.keywords?.length || 0,
    });

    const duration = Date.now() - startTime;
    console.log(`✅ Summarization complete in ${duration}ms`);

    return NextResponse.json({
      success: true,
      summary: parsed.summary || 'Summary not available',
      points: Array.isArray(parsed.points) ? parsed.points : [],
      keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
    });
  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error('❌ Document summarize error:', {
      error: error.message,
      stack: error.stack,
      name: error.name,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
    });
    
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { success: false, error: 'Invalid token', message: 'Your session has expired' },
        { status: 401 }
      );
    }

    if (error.message?.includes('API key') || error.message?.includes('OpenAI')) {
      return NextResponse.json(
        { success: false, error: 'AI service not configured', message: 'AI service is temporarily unavailable' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to summarize document', message: error.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

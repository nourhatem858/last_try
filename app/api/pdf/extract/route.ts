/**
 * PDF Text Extraction API Route
 * POST /api/pdf/extract
 * 
 * Accepts a PDF file upload and extracts text content
 */

import { NextRequest, NextResponse } from 'next/server';

// Type definitions for pdf-parse
interface PDFInfo {
  PDFFormatVersion?: string;
  IsAcroFormPresent?: boolean;
  IsXFAPresent?: boolean;
  Title?: string;
  Author?: string;
  Subject?: string;
  Creator?: string;
  Producer?: string;
  CreationDate?: string;
  ModDate?: string;
}

interface PDFMetadata {
  _metadata?: any;
}

interface PDFParseResult {
  numpages: number;
  numrender: number;
  info: PDFInfo;
  metadata: PDFMetadata;
  text: string;
  version: string;
}

type PDFParseFunction = (
  dataBuffer: Buffer,
  options?: {
    pagerender?: (pageData: any) => string;
    max?: number;
    version?: string;
  }
) => Promise<PDFParseResult>;

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: NextRequest) {
  try {
    console.log('📄 PDF extraction request received');

    // Get the uploaded file from FormData
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: 'No file provided. Please upload a PDF file.',
        },
        { status: 400 }
      );
    }
    
    console.log('📄 File received:', {
      name: file.name,
      type: file.type,
      size: file.size,
    });
    
    // Validate file type
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid file type. Please upload a PDF file.',
        },
        { status: 400 }
      );
    }
    
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB.`,
        },
        { status: 400 }
      );
    }
    
    // Convert file to buffer
    console.log('🔄 Converting file to buffer...');
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    console.log(`✅ Buffer created: ${buffer.length} bytes`);
    
    // Import pdf-parse with proper handling for CommonJS/ESM
    console.log('📦 Loading pdf-parse module...');
    const pdfParseModule = await import('pdf-parse');
    const pdfParse = (pdfParseModule.default || pdfParseModule) as PDFParseFunction;
    
    // Verify it's a function
    if (typeof pdfParse !== 'function') {
      console.error('❌ pdf-parse import failed. Module structure:', Object.keys(pdfParseModule));
      return NextResponse.json(
        {
          success: false,
          error: 'PDF processing module failed to load. Please contact support.',
        },
        { status: 500 }
      );
    }
    
    console.log('✅ pdf-parse loaded successfully');
    
    // Extract text from PDF with timeout
    console.log('🔍 Extracting text from PDF...');
    const extractionPromise = pdfParse(buffer);
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('PDF processing timeout (30s)')), 30000)
    );
    
    const data = await Promise.race([extractionPromise, timeoutPromise]) as PDFParseResult;
    
    console.log('✅ Text extracted successfully:', {
      pages: data.numpages,
      textLength: data.text.length,
      title: data.info?.Title || 'N/A',
    });
    
    // Return extracted text and metadata
    return NextResponse.json({
      success: true,
      text: data.text,
      metadata: {
        pages: data.numpages,
        wordCount: data.text.trim().split(/\s+/).filter(w => w.length > 0).length,
        title: data.info?.Title || file.name,
        author: data.info?.Author || 'Unknown',
        creationDate: data.info?.CreationDate || null,
        producer: data.info?.Producer || 'Unknown',
      },
    });
    
  } catch (error: any) {
    console.error('❌ PDF extraction error:', error);
    
    // Handle specific errors
    let errorMessage = 'Failed to extract text from PDF';
    
    if (error.message.includes('encrypted') || error.message.includes('password')) {
      errorMessage = 'PDF is password protected. Please provide an unencrypted version.';
    } else if (error.message.includes('timeout')) {
      errorMessage = 'PDF processing timeout. File may be too large or complex.';
    } else if (error.message.includes('Invalid PDF')) {
      errorMessage = 'Invalid or corrupted PDF file.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

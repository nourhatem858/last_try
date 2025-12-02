/**
 * Document Processor Service - FIXED VERSION
 * Handles text extraction from PDF, DOCX, and TXT files
 * Production-ready with proper error handling and CommonJS/ESM compatibility
 */

import mammoth from 'mammoth';

// Type definitions for pdf-parse
interface PDFParseResult {
  numpages: number;
  numrender: number;
  info: any;
  metadata: any;
  text: string;
  version: string;
}

type PDFParseFunction = (dataBuffer: Buffer, options?: any) => Promise<PDFParseResult>;

export interface ExtractedContent {
  text: string;
  metadata?: {
    pages?: number;
    wordCount?: number;
    language?: string;
  };
}

/**
 * Extract text from PDF file
 * @param buffer - PDF file buffer
 * @returns Extracted text and metadata
 * @throws Error if PDF parsing fails
 */
export async function extractTextFromPDF(buffer: Buffer): Promise<{ text: string }> {
  try {
    // Use our wrapper module that properly handles CommonJS require
    const pdfParse: PDFParseFunction = require('./pdf-parser.js');
    
    if (typeof pdfParse !== 'function') {
      throw new Error('pdf-parse module did not export a function. Please reinstall: npm install pdf-parse');
    }
    
    console.log('✅ pdf-parse loaded successfully');
    
    const data = await pdfParse(buffer);
    
    if (!data || !data.text) {
      throw new Error('Failed to extract text from PDF');
    }
    
    console.log(`✅ PDF text extracted: ${data.text.length} characters, ${data.numpages} pages`);
    
    return {
      text: data.text.trim(),
    };
  } catch (error: any) {
    console.error('❌ PDF extraction error:', error);
    
    // Provide helpful error messages
    if (error.message && error.message.includes('encrypted')) {
      throw new Error('PDF is password protected. Please provide an unencrypted version.');
    }
    
    if (error.message && error.message.includes('not a function')) {
      throw new Error('PDF parser initialization failed. Please reinstall pdf-parse: npm install pdf-parse');
    }
    
    throw new Error(`Failed to extract text from PDF: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Extract text from DOCX file
 * @param buffer - DOCX file buffer
 * @returns Extracted text
 * @throws Error if DOCX parsing fails
 */
export async function extractTextFromDOCX(buffer: Buffer): Promise<{ text: string }> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    
    if (!result || result.value === undefined) {
      throw new Error('Failed to extract text from DOCX');
    }
    
    console.log(`✅ DOCX text extracted: ${result.value.length} characters`);
    
    return {
      text: result.value.trim(),
    };
  } catch (error: any) {
    console.error('❌ DOCX extraction error:', error);
    throw new Error(`Failed to extract text from DOCX: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Extract text from plain text file
 * @param buffer - Text file buffer
 * @returns Extracted text
 */
function extractTextFromTXT(buffer: Buffer): { text: string } {
  try {
    const text = buffer.toString('utf-8');
    console.log(`✅ TXT text extracted: ${text.length} characters`);
    return { text: text.trim() };
  } catch (error: any) {
    console.error('❌ TXT extraction error:', error);
    throw new Error(`Failed to extract text from TXT: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Document Processor Class
 * Handles text extraction from various file types
 */
export class DocumentProcessor {
  /**
   * Extract text from uploaded file based on file type
   * @param fileBuffer - File buffer
   * @param fileType - MIME type or file extension
   * @returns Extracted content with metadata
   */
  async extractText(fileBuffer: Buffer, fileType: string): Promise<ExtractedContent> {
    try {
      const normalizedType = fileType.toLowerCase();
      
      console.log(`📄 Processing file type: ${normalizedType}`);
      
      // Handle PDF files
      if (normalizedType === 'pdf' || normalizedType === 'application/pdf') {
        const result = await extractTextFromPDF(fileBuffer);
        return {
          text: result.text,
          metadata: {
            wordCount: this.countWords(result.text),
          },
        };
      }
      
      // Handle DOCX files
      if (
        normalizedType === 'docx' ||
        normalizedType === 'doc' ||
        normalizedType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        normalizedType === 'application/msword'
      ) {
        const result = await extractTextFromDOCX(fileBuffer);
        return {
          text: result.text,
          metadata: {
            wordCount: this.countWords(result.text),
          },
        };
      }
      
      // Handle plain text files
      if (normalizedType === 'txt' || normalizedType === 'text/plain') {
        const result = extractTextFromTXT(fileBuffer);
        return {
          text: result.text,
          metadata: {
            wordCount: this.countWords(result.text),
          },
        };
      }
      
      // For unsupported file types, return empty text (don't throw error)
      console.log(`⚠️ Unsupported file type: ${fileType} - skipping text extraction`);
      return {
        text: '',
        metadata: {
          wordCount: 0,
        },
      };
    } catch (error: any) {
      console.error('❌ Text extraction error:', error);
      
      // Don't throw error for extraction failures - just return empty text
      // This allows the document to still be uploaded even if text extraction fails
      console.log('⚠️ Text extraction failed, continuing with empty text');
      return {
        text: '',
        metadata: {
          wordCount: 0,
        },
      };
    }
  }

  /**
   * Count words in text
   * @param text - Text to count words in
   * @returns Word count
   */
  private countWords(text: string): number {
    if (!text || text.trim().length === 0) return 0;
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }
}

/**
 * Process document and extract text
 * Legacy function for backward compatibility
 * @param buffer - File buffer
 * @param fileType - MIME type or file extension
 * @returns Extracted content
 */
export async function processDocument(buffer: Buffer, fileType: string): Promise<ExtractedContent> {
  const processor = new DocumentProcessor();
  return processor.extractText(buffer, fileType);
}

// Export singleton instance
export const documentProcessor = new DocumentProcessor();

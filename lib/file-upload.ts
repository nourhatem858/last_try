/**
 * File Upload Service
 * Handles file uploads (local storage for dev, cloud storage for production)
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface UploadResult {
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
}

class FileUploadService {
  private uploadDir: string;

  constructor() {
    // Use public/uploads for development
    this.uploadDir = path.join(process.cwd(), 'public', 'uploads');
    
    // Ensure upload directory exists
    this.ensureUploadDirectory();
  }

  /**
   * Ensure upload directory exists
   */
  private ensureUploadDirectory(): void {
    try {
      if (!fs.existsSync(this.uploadDir)) {
        fs.mkdirSync(this.uploadDir, { recursive: true });
        console.log('✅ Created uploads directory:', this.uploadDir);
      }
    } catch (error: any) {
      console.error('❌ Failed to create uploads directory:', error);
      throw new Error(`Failed to create uploads directory: ${error.message}`);
    }
  }

  /**
   * Upload file to storage
   * @param file - File to upload
   * @returns Upload result with file URL
   */
  async uploadFile(file: File): Promise<UploadResult> {
    try {
      // Ensure directory exists before upload
      this.ensureUploadDirectory();

      // Validate file
      if (!file || file.size === 0) {
        throw new Error('Invalid file: file is empty or undefined');
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop() || 'bin';
      const uniqueName = `${crypto.randomBytes(16).toString('hex')}.${fileExt}`;
      const filePath = path.join(this.uploadDir, uniqueName);

      // Convert file to buffer
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Validate buffer
      if (buffer.length === 0) {
        throw new Error('Invalid file: buffer is empty');
      }

      // Save file to disk
      fs.writeFileSync(filePath, buffer);

      // Verify file was written
      if (!fs.existsSync(filePath)) {
        throw new Error('File was not saved successfully');
      }

      console.log('✅ File saved:', uniqueName, `(${file.size} bytes)`);

      return {
        fileUrl: `/uploads/${uniqueName}`,
        fileName: file.name,
        fileType: file.type || this.getFileType(fileExt),
        fileSize: file.size,
      };
    } catch (error: any) {
      console.error('❌ File upload error:', error);
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  /**
   * Get MIME type from file extension
   */
  private getFileType(ext: string): string {
    const types: Record<string, string> = {
      pdf: 'application/pdf',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      txt: 'text/plain',
    };
    return types[ext.toLowerCase()] || 'application/octet-stream';
  }

  /**
   * Delete file from storage
   * @param fileUrl - File URL to delete
   */
  async deleteFile(fileUrl: string): Promise<void> {
    try {
      const fileName = fileUrl.split('/').pop();
      if (!fileName) return;

      const filePath = path.join(this.uploadDir, fileName);
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log('✅ File deleted:', fileName);
      }
    } catch (error: any) {
      console.error('❌ File delete error:', error);
    }
  }
}

export const fileUploadService = new FileUploadService();

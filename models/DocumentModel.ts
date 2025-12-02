/**
 * Document Model
 * MongoDB schema for Documents with file metadata
 */

import mongoose, { Schema, Document as MongooseDocument } from 'mongoose';

export interface IDocument extends MongooseDocument {
  title: string;
  description?: string;
  workspace: mongoose.Types.ObjectId;
  author: mongoose.Types.ObjectId;
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  extractedText?: string;
  summary?: {
    content: string;
    keyPoints: string[];
    topics: string[];
    sentiment: string;
  };
  tags: string[];
  category?: string;
  isPinned: boolean;
  isArchived: boolean;
  collaborators: mongoose.Types.ObjectId[];
  viewCount: number;
  downloadCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const DocumentSchema = new Schema<IDocument>(
  {
    title: {
      type: String,
      required: [true, 'Document title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    workspace: {
      type: Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    extractedText: {
      type: String,
    },
    summary: {
      content: String,
      keyPoints: [String],
      topics: [String],
      sentiment: String,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    category: {
      type: String,
      trim: true,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    collaborators: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    viewCount: {
      type: Number,
      default: 0,
    },
    downloadCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
DocumentSchema.index({ workspace: 1, author: 1 });
DocumentSchema.index({ title: 'text', description: 'text', extractedText: 'text' });
DocumentSchema.index({ tags: 1 });
DocumentSchema.index({ createdAt: -1 });

export default mongoose.models.DocumentModel || mongoose.model<IDocument>('DocumentModel', DocumentSchema);

/**
 * Note Model
 * MongoDB schema for Notes
 */

import mongoose, { Schema, Document as MongooseDocument } from 'mongoose';

export interface INote extends MongooseDocument {
  title: string;
  content: string;
  workspace: mongoose.Types.ObjectId;
  author: mongoose.Types.ObjectId;
  tags: string[];
  category?: string;
  isPinned: boolean;
  isArchived: boolean;
  collaborators: mongoose.Types.ObjectId[];
  version: number;
  aiGenerated: boolean;
  aiSuggestions?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const NoteSchema = new Schema<INote>(
  {
    title: {
      type: String,
      required: [true, 'Note title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    content: {
      type: String,
      required: [true, 'Note content is required'],
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
    version: {
      type: Number,
      default: 1,
    },
    aiGenerated: {
      type: Boolean,
      default: false,
    },
    aiSuggestions: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes
NoteSchema.index({ workspace: 1, author: 1 });
NoteSchema.index({ title: 'text', content: 'text' });
NoteSchema.index({ tags: 1 });
NoteSchema.index({ createdAt: -1 });

export default mongoose.models.Note || mongoose.model<INote>('Note', NoteSchema);

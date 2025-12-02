/**
 * AI Conversation Model
 * MongoDB schema for AI chat conversations with context
 */

import mongoose, { Schema, Document as MongooseDocument } from 'mongoose';

export interface IMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  sources?: Array<{
    type: string;
    id: string;
    title: string;
    excerpt: string;
  }>;
}

export interface IAIConversation extends MongooseDocument {
  user: mongoose.Types.ObjectId;
  workspace?: mongoose.Types.ObjectId;
  title: string;
  messages: IMessage[];
  context: {
    relatedNotes: mongoose.Types.ObjectId[];
    relatedDocuments: mongoose.Types.ObjectId[];
    tags: string[];
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    sources: [
      {
        type: {
          type: String,
          required: true,
        },
        id: {
          type: String,
          required: true,
        },
        title: {
          type: String,
          required: true,
        },
        excerpt: {
          type: String,
        },
      },
    ],
  },
  { _id: false }
);

const AIConversationSchema = new Schema<IAIConversation>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    workspace: {
      type: Schema.Types.ObjectId,
      ref: 'Workspace',
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    messages: [MessageSchema],
    context: {
      relatedNotes: [
        {
          type: Schema.Types.ObjectId,
          ref: 'Note',
        },
      ],
      relatedDocuments: [
        {
          type: Schema.Types.ObjectId,
          ref: 'DocumentModel',
        },
      ],
      tags: [String],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
AIConversationSchema.index({ user: 1, createdAt: -1 });
AIConversationSchema.index({ workspace: 1 });
AIConversationSchema.index({ isActive: 1 });

export default mongoose.models.AIConversation || mongoose.model<IAIConversation>('AIConversation', AIConversationSchema);

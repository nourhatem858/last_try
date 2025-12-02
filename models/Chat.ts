/**
 * Chat Model
 * MongoDB schema for Chat conversations
 */

import mongoose, { Schema, Document as MongooseDocument } from 'mongoose';

export interface IMessage {
  sender: mongoose.Types.ObjectId;
  content: string;
  type: 'user' | 'ai' | 'system';
  metadata?: {
    confidence?: number;
    sources?: Array<{
      type: string;
      id: string;
      title: string;
      relevance: number;
    }>;
    suggestions?: string[];
  };
  timestamp: Date;
}

export interface IChat extends MongooseDocument {
  title: string;
  workspace?: mongoose.Types.ObjectId;
  participants: mongoose.Types.ObjectId[];
  messages: IMessage[];
  context: {
    workspaceId?: string;
    noteId?: string;
    documentId?: string;
  };
  isAIConversation: boolean;
  lastMessageAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>({
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['user', 'ai', 'system'],
    default: 'user',
  },
  metadata: {
    confidence: Number,
    sources: [{
      type: String,
      id: String,
      title: String,
      relevance: Number,
    }],
    suggestions: [String],
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const ChatSchema = new Schema<IChat>(
  {
    title: {
      type: String,
      required: [true, 'Chat title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    workspace: {
      type: Schema.Types.ObjectId,
      ref: 'Workspace',
    },
    participants: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    messages: [MessageSchema],
    context: {
      workspaceId: String,
      noteId: String,
      documentId: String,
    },
    isAIConversation: {
      type: Boolean,
      default: false,
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
ChatSchema.index({ participants: 1 });
ChatSchema.index({ workspace: 1 });
ChatSchema.index({ lastMessageAt: -1 });
ChatSchema.index({ 'messages.content': 'text' });

export default mongoose.models.Chat || mongoose.model<IChat>('Chat', ChatSchema);

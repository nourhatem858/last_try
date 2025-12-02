/**
 * Workspace Model
 * MongoDB schema for Workspaces
 */

import mongoose, { Schema, Document as MongooseDocument } from 'mongoose';

export interface IWorkspace extends MongooseDocument {
  name: string;
  description?: string;
  owner: mongoose.Types.ObjectId;
  members: Array<{
    user: mongoose.Types.ObjectId;
    role: 'owner' | 'admin' | 'member' | 'viewer';
    joinedAt: Date;
  }>;
  settings: {
    visibility: 'private' | 'team' | 'public';
    allowMemberInvites: boolean;
    defaultNotePermission: 'edit' | 'view';
  };
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const WorkspaceSchema = new Schema<IWorkspace>(
  {
    name: {
      type: String,
      required: [true, 'Workspace name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        role: {
          type: String,
          enum: ['owner', 'admin', 'member', 'viewer'],
          default: 'member',
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    settings: {
      visibility: {
        type: String,
        enum: ['private', 'team', 'public'],
        default: 'private',
      },
      allowMemberInvites: {
        type: Boolean,
        default: false,
      },
      defaultNotePermission: {
        type: String,
        enum: ['edit', 'view'],
        default: 'edit',
      },
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes
WorkspaceSchema.index({ owner: 1 });
WorkspaceSchema.index({ 'members.user': 1 });
WorkspaceSchema.index({ name: 'text', description: 'text' });

export default mongoose.models.Workspace || mongoose.model<IWorkspace>('Workspace', WorkspaceSchema);

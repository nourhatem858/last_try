/**
 * Activity Model
 * MongoDB schema for tracking user activity and recent actions
 */

import mongoose, { Schema, Document as MongooseDocument } from 'mongoose';

export interface IActivity extends MongooseDocument {
  user: mongoose.Types.ObjectId;
  workspace?: mongoose.Types.ObjectId;
  action: 'create' | 'update' | 'delete' | 'view' | 'share' | 'comment';
  resourceType: 'note' | 'document' | 'workspace' | 'chat' | 'member';
  resourceId: mongoose.Types.ObjectId;
  resourceTitle: string;
  metadata?: {
    changes?: string[];
    previousValue?: any;
    newValue?: any;
  };
  createdAt: Date;
}

const ActivitySchema = new Schema<IActivity>(
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
    action: {
      type: String,
      enum: ['create', 'update', 'delete', 'view', 'share', 'comment'],
      required: true,
    },
    resourceType: {
      type: String,
      enum: ['note', 'document', 'workspace', 'chat', 'member'],
      required: true,
    },
    resourceId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    resourceTitle: {
      type: String,
      required: true,
    },
    metadata: {
      changes: [String],
      previousValue: Schema.Types.Mixed,
      newValue: Schema.Types.Mixed,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Indexes
ActivitySchema.index({ user: 1, createdAt: -1 });
ActivitySchema.index({ workspace: 1, createdAt: -1 });
ActivitySchema.index({ resourceType: 1, resourceId: 1 });

export default mongoose.models.Activity || mongoose.model<IActivity>('Activity', ActivitySchema);

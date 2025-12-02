/**
 * Notification Model
 * MongoDB schema for user notifications
 */

import mongoose, { Schema, Document as MongooseDocument } from 'mongoose';

export interface INotification extends MongooseDocument {
  user: mongoose.Types.ObjectId;
  type: 'workspace_invite' | 'member_added' | 'note_shared' | 'comment' | 'mention' | 'system';
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['workspace_invite', 'member_added', 'note_shared', 'comment', 'mention', 'system'],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
    },
    data: {
      type: Schema.Types.Mixed,
      default: {},
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
NotificationSchema.index({ user: 1, read: 1 });
NotificationSchema.index({ createdAt: -1 });

export default mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);

/**
 * Database Service Layer
 * Centralized database operations with error handling and optimization
 */

import { connectDB } from './mongodb';
import User from '@/models/User';
import Workspace from '@/models/Workspace';
import Note from '@/models/Note';
import DocumentModel from '@/models/DocumentModel';
import Chat from '@/models/Chat';
import Activity from '@/models/Activity';
import mongoose from 'mongoose';

export class DatabaseService {
  /**
   * Ensure database connection
   */
  static async ensureConnection() {
    await connectDB();
  }

  /**
   * Create activity log
   */
  static async logActivity(data: {
    userId: string;
    workspaceId?: string;
    action: string;
    resourceType: string;
    resourceId: string;
    resourceTitle: string;
    metadata?: any;
  }) {
    try {
      await this.ensureConnection();
      await Activity.create({
        user: data.userId,
        workspace: data.workspaceId,
        action: data.action,
        resourceType: data.resourceType,
        resourceId: data.resourceId,
        resourceTitle: data.resourceTitle,
        metadata: data.metadata,
      });
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  }

  /**
   * Get recent activity for user
   */
  static async getRecentActivity(userId: string, limit: number = 20) {
    await this.ensureConnection();
    return Activity.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('workspace', 'name')
      .lean();
  }

  /**
   * Get dashboard summary for user
   */
  static async getDashboardSummary(userId: string) {
    await this.ensureConnection();

    const [workspaceCount, noteCount, documentCount, chatCount, recentActivity] = await Promise.all([
      Workspace.countDocuments({
        $or: [
          { owner: userId },
          { 'members.user': userId }
        ]
      }),
      Note.countDocuments({ author: userId }),
      DocumentModel.countDocuments({ author: userId }),
      Chat.countDocuments({ participants: userId }),
      this.getRecentActivity(userId, 10),
    ]);

    return {
      workspaces: workspaceCount,
      notes: noteCount,
      documents: documentCount,
      aiChats: chatCount,
      recentActivity: recentActivity.map(activity => ({
        id: activity._id.toString(),
        type: activity.resourceType,
        title: activity.resourceTitle,
        timestamp: activity.createdAt.toISOString(),
        action: activity.action,
      })),
    };
  }

  /**
   * Workspace Operations
   */
  static async createWorkspace(data: {
    name: string;
    description?: string;
    ownerId: string;
    color?: string;
  }) {
    await this.ensureConnection();
    
    const workspace = await Workspace.create({
      name: data.name,
      description: data.description,
      owner: data.ownerId,
      members: [{
        user: data.ownerId,
        role: 'owner',
        joinedAt: new Date(),
      }],
      tags: data.color ? [data.color] : [],
    });

    await this.logActivity({
      userId: data.ownerId,
      workspaceId: workspace._id.toString(),
      action: 'create',
      resourceType: 'workspace',
      resourceId: workspace._id.toString(),
      resourceTitle: workspace.name,
    });

    return workspace;
  }

  static async getWorkspaces(userId: string) {
    await this.ensureConnection();
    
    const workspaces = await Workspace.find({
      $or: [
        { owner: userId },
        { 'members.user': userId }
      ]
    })
    .populate('owner', 'name email')
    .populate('members.user', 'name email')
    .sort({ updatedAt: -1 })
    .lean();

    // Get counts for each workspace
    const workspacesWithCounts = await Promise.all(
      workspaces.map(async (workspace) => {
        const [noteCount, documentCount, memberCount] = await Promise.all([
          Note.countDocuments({ workspace: workspace._id }),
          DocumentModel.countDocuments({ workspace: workspace._id }),
          workspace.members.length,
        ]);

        return {
          id: workspace._id.toString(),
          name: workspace.name,
          description: workspace.description || '',
          members: memberCount,
          documents: documentCount,
          notes: noteCount,
          createdAt: workspace.createdAt.toISOString(),
          updatedAt: workspace.updatedAt.toISOString(),
          color: workspace.tags[0] || 'cyan',
          owner: workspace.owner,
        };
      })
    );

    return workspacesWithCounts;
  }

  static async getWorkspaceById(workspaceId: string, userId: string) {
    await this.ensureConnection();
    
    const workspace = await Workspace.findOne({
      _id: workspaceId,
      $or: [
        { owner: userId },
        { 'members.user': userId }
      ]
    })
    .populate('owner', 'name email')
    .populate('members.user', 'name email')
    .lean();

    if (!workspace) return null;

    const [notes, documents] = await Promise.all([
      Note.find({ workspace: workspaceId }).sort({ updatedAt: -1 }).limit(10).lean(),
      DocumentModel.find({ workspace: workspaceId }).sort({ updatedAt: -1 }).limit(10).lean(),
    ]);

    return {
      ...workspace,
      id: workspace._id.toString(),
      recentNotes: notes,
      recentDocuments: documents,
    };
  }

  static async updateWorkspace(workspaceId: string, userId: string, updates: any) {
    await this.ensureConnection();
    
    const workspace = await Workspace.findOneAndUpdate(
      {
        _id: workspaceId,
        $or: [
          { owner: userId },
          { 'members.user': userId, 'members.role': { $in: ['owner', 'admin'] } }
        ]
      },
      { $set: updates },
      { new: true }
    );

    if (workspace) {
      await this.logActivity({
        userId,
        workspaceId: workspace._id.toString(),
        action: 'update',
        resourceType: 'workspace',
        resourceId: workspace._id.toString(),
        resourceTitle: workspace.name,
      });
    }

    return workspace;
  }

  static async deleteWorkspace(workspaceId: string, userId: string) {
    await this.ensureConnection();
    
    const workspace = await Workspace.findOneAndDelete({
      _id: workspaceId,
      owner: userId,
    });

    if (workspace) {
      // Delete associated notes and documents
      await Promise.all([
        Note.deleteMany({ workspace: workspaceId }),
        DocumentModel.deleteMany({ workspace: workspaceId }),
      ]);

      await this.logActivity({
        userId,
        action: 'delete',
        resourceType: 'workspace',
        resourceId: workspace._id.toString(),
        resourceTitle: workspace.name,
      });
    }

    return workspace;
  }

  /**
   * Note Operations
   */
  static async createNote(data: {
    title: string;
    content: string;
    workspaceId: string;
    authorId: string;
    tags?: string[];
    color?: string;
  }) {
    await this.ensureConnection();
    
    const note = await Note.create({
      title: data.title,
      content: data.content,
      workspace: data.workspaceId,
      author: data.authorId,
      tags: data.tags || [],
      category: data.color,
    });

    await this.logActivity({
      userId: data.authorId,
      workspaceId: data.workspaceId,
      action: 'create',
      resourceType: 'note',
      resourceId: note._id.toString(),
      resourceTitle: note.title,
    });

    return note;
  }

  static async getNotes(userId: string, workspaceId?: string) {
    await this.ensureConnection();
    
    const query: any = { author: userId };
    if (workspaceId) {
      query.workspace = workspaceId;
    }

    const notes = await Note.find(query)
      .populate('workspace', 'name')
      .populate('author', 'name email')
      .sort({ isPinned: -1, updatedAt: -1 })
      .lean();

    return notes.map(note => ({
      id: note._id.toString(),
      title: note.title,
      content: note.content,
      tags: note.tags,
      workspace: note.workspace?.name || 'Unknown',
      workspaceId: note.workspace?._id?.toString() || '',
      createdAt: note.createdAt.toISOString(),
      updatedAt: note.updatedAt.toISOString(),
      isPinned: note.isPinned,
      color: note.category || 'cyan',
    }));
  }

  static async getNoteById(noteId: string, userId: string) {
    await this.ensureConnection();
    
    const note = await Note.findOne({
      _id: noteId,
      $or: [
        { author: userId },
        { collaborators: userId }
      ]
    })
    .populate('workspace', 'name')
    .populate('author', 'name email')
    .lean();

    if (!note) return null;

    // Log view activity
    await this.logActivity({
      userId,
      workspaceId: note.workspace?._id?.toString(),
      action: 'view',
      resourceType: 'note',
      resourceId: note._id.toString(),
      resourceTitle: note.title,
    });

    return {
      ...note,
      id: note._id.toString(),
    };
  }

  static async updateNote(noteId: string, userId: string, updates: any) {
    await this.ensureConnection();
    
    const note = await Note.findOneAndUpdate(
      {
        _id: noteId,
        $or: [
          { author: userId },
          { collaborators: userId }
        ]
      },
      { 
        $set: updates,
        $inc: { version: 1 }
      },
      { new: true }
    );

    if (note) {
      await this.logActivity({
        userId,
        workspaceId: note.workspace.toString(),
        action: 'update',
        resourceType: 'note',
        resourceId: note._id.toString(),
        resourceTitle: note.title,
      });
    }

    return note;
  }

  static async deleteNote(noteId: string, userId: string) {
    await this.ensureConnection();
    
    const note = await Note.findOneAndDelete({
      _id: noteId,
      author: userId,
    });

    if (note) {
      await this.logActivity({
        userId,
        workspaceId: note.workspace.toString(),
        action: 'delete',
        resourceType: 'note',
        resourceId: note._id.toString(),
        resourceTitle: note.title,
      });
    }

    return note;
  }

/**
 * Notification Service
 * Smart notifications with priority and grouping
 */

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'ai';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: any;
}

export class NotificationService {
  private static listeners: Array<(notifications: Notification[]) => void> = [];

  /**
   * Subscribe to notification updates
   */
  static subscribe(callback: (notifications: Notification[]) => void): () => void {
    this.listeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  /**
   * Notify all listeners
   */
  private static notifyListeners(): void {
    const notifications = this.getAll();
    this.listeners.forEach(callback => callback(notifications));
  }

  /**
   * Create a notification
   */
  static create(
    type: Notification['type'],
    title: string,
    message: string,
    options: {
      priority?: Notification['priority'];
      actionUrl?: string;
      actionLabel?: string;
      metadata?: any;
    } = {}
  ): Notification {
    const notification: Notification = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      type,
      title,
      message,
      priority: options.priority || 'medium',
      timestamp: new Date(),
      read: false,
      actionUrl: options.actionUrl,
      actionLabel: options.actionLabel,
      metadata: options.metadata,
    };

    this.save(notification);
    this.notifyListeners();

    // Show browser notification if permitted
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(title, {
          body: message,
          icon: '/icon.png',
          badge: '/badge.png',
        });
      }
    }

    return notification;
  }

  /**
   * Save notification to storage
   */
  private static save(notification: Notification): void {
    if (typeof window === 'undefined') return;

    const notifications = this.getAll();
    notifications.unshift(notification);

    // Keep only last 50 notifications
    if (notifications.length > 50) {
      notifications.splice(50);
    }

    localStorage.setItem('notifications', JSON.stringify(notifications));
  }

  /**
   * Get all notifications
   */
  static getAll(): Notification[] {
    if (typeof window === 'undefined') return [];

    const stored = localStorage.getItem('notifications');
    if (!stored) return [];

    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }

  /**
   * Get unread notifications
   */
  static getUnread(): Notification[] {
    return this.getAll().filter(n => !n.read);
  }

  /**
   * Get unread count
   */
  static getUnreadCount(): number {
    return this.getUnread().length;
  }

  /**
   * Mark notification as read
   */
  static markAsRead(id: string): void {
    if (typeof window === 'undefined') return;

    const notifications = this.getAll();
    const notification = notifications.find(n => n.id === id);
    
    if (notification) {
      notification.read = true;
      localStorage.setItem('notifications', JSON.stringify(notifications));
      this.notifyListeners();
    }
  }

  /**
   * Mark all as read
   */
  static markAllAsRead(): void {
    if (typeof window === 'undefined') return;

    const notifications = this.getAll();
    notifications.forEach(n => (n.read = true));
    localStorage.setItem('notifications', JSON.stringify(notifications));
    this.notifyListeners();
  }

  /**
   * Delete notification
   */
  static delete(id: string): void {
    if (typeof window === 'undefined') return;

    const notifications = this.getAll().filter(n => n.id !== id);
    localStorage.setItem('notifications', JSON.stringify(notifications));
    this.notifyListeners();
  }

  /**
   * Clear all notifications
   */
  static clearAll(): void {
    if (typeof window === 'undefined') return;

    localStorage.removeItem('notifications');
    this.notifyListeners();
  }

  /**
   * Request browser notification permission
   */
  static async requestPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }

  /**
   * Smart notification helpers
   */
  static notifySuccess(title: string, message: string, actionUrl?: string): Notification {
    return this.create('success', title, message, { priority: 'medium', actionUrl });
  }

  static notifyError(title: string, message: string): Notification {
    return this.create('error', title, message, { priority: 'high' });
  }

  static notifyWarning(title: string, message: string): Notification {
    return this.create('warning', title, message, { priority: 'medium' });
  }

  static notifyInfo(title: string, message: string): Notification {
    return this.create('info', title, message, { priority: 'low' });
  }

  static notifyAI(title: string, message: string, actionUrl?: string): Notification {
    return this.create('ai', title, message, { 
      priority: 'medium', 
      actionUrl,
      actionLabel: 'View Response'
    });
  }

  /**
   * Context-aware notifications
   */
  static notifyNoteCreated(noteTitle: string, noteId: string): Notification {
    return this.notifySuccess(
      'Note Created',
      `"${noteTitle}" has been created successfully`,
      `/notes/${noteId}`
    );
  }

  static notifyDocumentUploaded(docTitle: string, docId: string): Notification {
    return this.notifySuccess(
      'Document Uploaded',
      `"${docTitle}" has been uploaded and is ready to view`,
      `/documents/${docId}`
    );
  }

  static notifyWorkspaceCreated(workspaceName: string, workspaceId: string): Notification {
    return this.notifySuccess(
      'Workspace Created',
      `"${workspaceName}" workspace is ready to use`,
      `/workspaces/${workspaceId}`
    );
  }

  static notifyAIInsight(insight: string, actionUrl?: string): Notification {
    return this.notifyAI(
      'AI Insight',
      insight,
      actionUrl
    );
  }

  static notifyCollaboratorJoined(name: string, workspaceName: string): Notification {
    return this.notifyInfo(
      'New Collaborator',
      `${name} joined "${workspaceName}" workspace`
    );
  }

  static notifyMentioned(mentionedBy: string, context: string, url: string): Notification {
    return this.create('info', 'You were mentioned', `${mentionedBy} mentioned you in ${context}`, {
      priority: 'high',
      actionUrl: url,
      actionLabel: 'View'
    });
  }
}

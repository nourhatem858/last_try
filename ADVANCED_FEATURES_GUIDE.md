# 🚀 Advanced Features Guide

## Overview
This guide covers the advanced features added to your AI Knowledge Workspace, including analytics, activity tracking, and smart notifications.

---

## 📊 Analytics & Insights

### Analytics Service
Track user behavior and generate intelligent insights.

#### Import
```typescript
import { AnalyticsService } from '@/lib/analytics-service';
```

#### Track Activity
```typescript
AnalyticsService.trackActivity({
  userId: user.id,
  action: 'create-note',
  resource: 'note',
  resourceId: 'note-123',
  timestamp: new Date(),
  metadata: { title: 'My Note' }
});
```

#### Generate Insights
```typescript
const activities = getStoredActivities();
const insights = AnalyticsService.generateInsights(activities);

// Returns array of insights:
// {
//   type: 'trend' | 'recommendation' | 'alert' | 'achievement',
//   title: string,
//   description: string,
//   data: any,
//   priority: 'low' | 'medium' | 'high'
// }
```

#### Get Statistics
```typescript
const stats = AnalyticsService.getStatistics(activities);

// Returns:
// {
//   totalActions: number,
//   uniqueDays: number,
//   mostActiveDay: string,
//   topActions: Array<{ action: string; count: number }>,
//   topResources: Array<{ resource: string; count: number }>
// }
```

### Analytics Insights Component

Add to your dashboard:

```typescript
import AnalyticsInsights from '@/components/dashboard/AnalyticsInsights';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Other components */}
      
      <AnalyticsInsights />
    </div>
  );
}
```

**Features:**
- 📈 Activity statistics (total actions, active days)
- 🔥 Streak tracking
- 💡 Smart recommendations
- ⚠️ Alerts for inactive resources
- 🏆 Achievement badges

---

## 🎯 Activity Tracking Hook

### useActivityTracking Hook

Easy-to-use hook for tracking user actions throughout your app.

#### Import
```typescript
import { useActivityTracking } from '@/hooks/useActivityTracking';
```

#### Basic Usage
```typescript
export default function NotesPage() {
  const { trackNoteCreated, trackNoteViewed } = useActivityTracking();

  const handleCreateNote = async (noteData) => {
    const note = await createNote(noteData);
    trackNoteCreated(note.id);
  };

  const handleViewNote = (noteId) => {
    trackNoteViewed(noteId);
    router.push(`/notes/${noteId}`);
  };

  return (
    // Your component JSX
  );
}
```

#### Available Methods

```typescript
const {
  // Generic tracking
  trackActivity,
  
  // Note tracking
  trackNoteCreated,
  trackNoteViewed,
  trackNoteEdited,
  
  // Document tracking
  trackDocumentUploaded,
  trackDocumentViewed,
  
  // Workspace tracking
  trackWorkspaceCreated,
  trackWorkspaceViewed,
  
  // Search tracking
  trackSearchPerformed,
  
  // AI tracking
  trackAIQuery,
  
  // Chat tracking
  trackChatStarted,
} = useActivityTracking();
```

#### Custom Tracking
```typescript
const { trackActivity } = useActivityTracking();

trackActivity(
  'custom-action',      // action name
  'custom-resource',    // resource type
  'resource-id',        // optional resource ID
  { key: 'value' }      // optional metadata
);
```

---

## 🔔 Smart Notifications

### Notification Service

Context-aware notifications with priority levels and actions.

#### Import
```typescript
import { NotificationService } from '@/lib/notification-service';
```

#### Create Notifications

**Basic:**
```typescript
NotificationService.create(
  'success',                    // type
  'Success!',                   // title
  'Operation completed',        // message
  {
    priority: 'medium',         // optional
    actionUrl: '/view',         // optional
    actionLabel: 'View',        // optional
    metadata: { key: 'value' }  // optional
  }
);
```

**Quick Methods:**
```typescript
// Success notification
NotificationService.notifySuccess(
  'Note Created',
  'Your note has been saved'
);

// Error notification
NotificationService.notifyError(
  'Upload Failed',
  'Could not upload document'
);

// Warning notification
NotificationService.notifyWarning(
  'Storage Almost Full',
  'You have used 90% of your storage'
);

// Info notification
NotificationService.notifyInfo(
  'New Feature',
  'Check out the new AI assistant'
);

// AI notification
NotificationService.notifyAI(
  'AI Suggestion',
  'I found 3 related documents',
  '/documents'
);
```

#### Context-Aware Notifications

```typescript
// Note created
NotificationService.notifyNoteCreated('My Note', 'note-123');

// Document uploaded
NotificationService.notifyDocumentUploaded('Report.pdf', 'doc-456');

// Workspace created
NotificationService.notifyWorkspaceCreated('Project X', 'ws-789');

// AI insight
NotificationService.notifyAIInsight(
  'Your most productive time is 9-11 AM',
  '/analytics'
);

// Collaborator joined
NotificationService.notifyCollaboratorJoined('John Doe', 'Marketing');

// Mentioned in note
NotificationService.notifyMentioned(
  'Jane Smith',
  'Project Planning',
  '/notes/123'
);
```

#### Manage Notifications

```typescript
// Get all notifications
const all = NotificationService.getAll();

// Get unread notifications
const unread = NotificationService.getUnread();

// Get unread count
const count = NotificationService.getUnreadCount();

// Mark as read
NotificationService.markAsRead('notification-id');

// Mark all as read
NotificationService.markAllAsRead();

// Delete notification
NotificationService.delete('notification-id');

// Clear all
NotificationService.clearAll();
```

#### Subscribe to Updates

```typescript
useEffect(() => {
  const unsubscribe = NotificationService.subscribe((notifications) => {
    console.log('Notifications updated:', notifications);
    setNotifications(notifications);
  });

  return unsubscribe;
}, []);
```

#### Browser Notifications

```typescript
// Request permission
const granted = await NotificationService.requestPermission();

if (granted) {
  // Browser notifications will now show automatically
  NotificationService.notifySuccess('Enabled', 'Browser notifications enabled');
}
```

---

## 🎨 Complete Example: Enhanced Dashboard

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { NotificationService } from '@/lib/notification-service';
import AnalyticsInsights from '@/components/dashboard/AnalyticsInsights';
import SmartSuggestions from '@/components/dashboard/SmartSuggestions';
import QuickActionsPanel from '@/components/dashboard/QuickActionsPanel';

export default function EnhancedDashboard() {
  const { user } = useAuth();
  const { trackActivity } = useActivityTracking();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Track page view
    trackActivity('view-dashboard', 'dashboard');

    // Subscribe to notifications
    const unsubscribe = NotificationService.subscribe(setNotifications);

    // Request notification permission
    NotificationService.requestPermission();

    return unsubscribe;
  }, []);

  const handleQuickAction = (action: string) => {
    trackActivity(`quick-action-${action}`, 'dashboard');
    
    // Show notification
    NotificationService.notifyInfo(
      'Action Started',
      `${action} has been initiated`
    );
  };

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Welcome Header */}
        <div className="bg-gradient-to-br from-[#0D1B2A] to-black border border-cyan-500/20 rounded-2xl p-6">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-gray-400">
            Here's what's happening in your workspace
          </p>
        </div>

        {/* Analytics Insights */}
        <AnalyticsInsights />

        {/* Smart Suggestions */}
        <SmartSuggestions
          context={{ workspaceId: 'current-workspace' }}
          recentActivity={[]}
        />

        {/* Quick Actions */}
        <QuickActionsPanel
          onActivityUpdate={() => {
            NotificationService.notifySuccess(
              'Updated',
              'Activity feed refreshed'
            );
          }}
        />

        {/* Notifications Panel */}
        <div className="bg-gradient-to-br from-[#0D1B2A] to-black border border-cyan-500/20 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">
              Notifications ({NotificationService.getUnreadCount()})
            </h3>
            <button
              onClick={() => NotificationService.markAllAsRead()}
              className="text-sm text-cyan-400 hover:text-cyan-300"
            >
              Mark all as read
            </button>
          </div>

          <div className="space-y-2">
            {notifications.slice(0, 5).map((notification) => (
              <div
                key={notification.id}
                className={`
                  p-4 rounded-lg border
                  ${notification.read 
                    ? 'bg-black/20 border-gray-500/20' 
                    : 'bg-cyan-500/10 border-cyan-500/30'
                  }
                `}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-white">
                      {notification.title}
                    </h4>
                    <p className="text-sm text-gray-400">
                      {notification.message}
                    </p>
                  </div>
                  {!notification.read && (
                    <button
                      onClick={() => NotificationService.markAsRead(notification.id)}
                      className="text-xs text-cyan-400 hover:text-cyan-300"
                    >
                      Mark read
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## 🎯 Best Practices

### Activity Tracking
1. ✅ Track meaningful user actions
2. ✅ Include relevant metadata
3. ✅ Track at the right granularity
4. ❌ Don't track every mouse move
5. ❌ Don't track sensitive data

### Notifications
1. ✅ Use appropriate priority levels
2. ✅ Provide actionable notifications
3. ✅ Group related notifications
4. ❌ Don't spam users
5. ❌ Don't use for debugging

### Analytics
1. ✅ Generate insights regularly
2. ✅ Act on user patterns
3. ✅ Respect user privacy
4. ❌ Don't store PII unnecessarily
5. ❌ Don't make assumptions

---

## 📊 Insight Types

### Trends
- Most used features
- Activity patterns
- Usage growth

### Recommendations
- Feature suggestions
- Organization tips
- Workflow improvements

### Alerts
- Inactive resources
- Storage warnings
- Security notices

### Achievements
- Streaks
- Milestones
- Productivity goals

---

## 🔧 Configuration

### Storage Limits
```typescript
// In analytics-service.ts
const MAX_ACTIVITIES = 100;  // Adjust as needed

// In notification-service.ts
const MAX_NOTIFICATIONS = 50;  // Adjust as needed
```

### Notification Priorities
```typescript
const PRIORITY_LEVELS = {
  low: 1,      // Info, tips
  medium: 2,   // Updates, suggestions
  high: 3,     // Warnings, mentions
  urgent: 4    // Errors, critical alerts
};
```

---

## 🚀 Next Steps

1. **Integrate with Backend**
   - Send analytics to server
   - Store notifications in database
   - Real-time notification delivery

2. **Add More Insights**
   - Productivity scores
   - Collaboration metrics
   - Content quality analysis

3. **Enhanced Notifications**
   - Push notifications
   - Email digests
   - Slack/Teams integration

4. **Advanced Analytics**
   - Custom dashboards
   - Export reports
   - Team analytics

---

**Generated by**: Kiro AI Assistant  
**Date**: November 29, 2025  
**Version**: 2.0.0

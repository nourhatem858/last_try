/**
 * Activity Tracking Hook
 * Easy-to-use hook for tracking user actions
 */

import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AnalyticsService } from '@/lib/analytics-service';

export function useActivityTracking() {
  const { user } = useAuth();

  const trackActivity = useCallback(
    (action: string, resource: string, resourceId?: string, metadata?: any) => {
      if (!user) return;

      AnalyticsService.trackActivity({
        userId: user.id,
        action,
        resource,
        resourceId,
        timestamp: new Date(),
        metadata,
      });
    },
    [user]
  );

  // Convenience methods for common actions
  const trackNoteCreated = useCallback(
    (noteId: string) => trackActivity('create-note', 'note', noteId),
    [trackActivity]
  );

  const trackNoteViewed = useCallback(
    (noteId: string) => trackActivity('view-note', 'note', noteId),
    [trackActivity]
  );

  const trackNoteEdited = useCallback(
    (noteId: string) => trackActivity('edit-note', 'note', noteId),
    [trackActivity]
  );

  const trackDocumentUploaded = useCallback(
    (documentId: string) => trackActivity('upload-document', 'document', documentId),
    [trackActivity]
  );

  const trackDocumentViewed = useCallback(
    (documentId: string) => trackActivity('view-document', 'document', documentId),
    [trackActivity]
  );

  const trackWorkspaceCreated = useCallback(
    (workspaceId: string) => trackActivity('create-workspace', 'workspace', workspaceId),
    [trackActivity]
  );

  const trackWorkspaceViewed = useCallback(
    (workspaceId: string) => trackActivity('view-workspace', 'workspace', workspaceId),
    [trackActivity]
  );

  const trackSearchPerformed = useCallback(
    (query: string, resultsCount: number) =>
      trackActivity('search', 'search', undefined, { query, resultsCount }),
    [trackActivity]
  );

  const trackAIQuery = useCallback(
    (question: string) => trackActivity('ai-query', 'ai', undefined, { question }),
    [trackActivity]
  );

  const trackChatStarted = useCallback(
    (chatId: string) => trackActivity('start-chat', 'chat', chatId),
    [trackActivity]
  );

  return {
    trackActivity,
    trackNoteCreated,
    trackNoteViewed,
    trackNoteEdited,
    trackDocumentUploaded,
    trackDocumentViewed,
    trackWorkspaceCreated,
    trackWorkspaceViewed,
    trackSearchPerformed,
    trackAIQuery,
    trackChatStarted,
  };
}

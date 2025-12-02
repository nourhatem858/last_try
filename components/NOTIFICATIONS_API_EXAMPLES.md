# Notifications API Integration Examples

## Complete Backend Implementation Guide

### Database Schema

```prisma
// schema.prisma
model Notification {
  id        String   @id @default(cuid())
  userId    String
  type      String   // comment, like, follow, system, mention
  title     String
  message   String
  read      Boolean  @default(false)
  actionUrl String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId, read])
  @@index([createdAt])
}
```

### API Routes (Next.js App Router)

#### GET /api/notifications

```typescript
// app/api/notifications/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const filter = searchParams.get('filter'); // 'all' or 'unread'
    const limit = parseInt(searchParams.get('limit') || '50');

    const where = {
      userId: session.user.id,
      ...(filter === 'unread' && { read: false })
    };

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await prisma.notification.deleteMany({
      where: { userId: session.user.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to clear notifications:', error);
    return NextResponse.json(
      { error: 'Failed to clear notifications' },
      { status: 500 }
    );
  }
}
```

#### PATCH /api/notifications/:id/read

```typescript
// app/api/notifications/[id]/read/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const notification = await prisma.notification.update({
      where: {
        id: params.id,
        userId: session.user.id // Ensure user owns notification
      },
      data: { read: true }
    });

    return NextResponse.json(notification);
  } catch (error) {
    console.error('Failed to mark as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark as read' },
      { status: 500 }
    );
  }
}
```

#### PATCH /api/notifications/read-all

```typescript
// app/api/notifications/read-all/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await prisma.notification.updateMany({
      where: {
        userId: session.user.id,
        read: false
      },
      data: { read: true }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to mark all as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark all as read' },
      { status: 500 }
    );
  }
}
```

#### DELETE /api/notifications/:id

```typescript
// app/api/notifications/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await prisma.notification.delete({
      where: {
        id: params.id,
        userId: session.user.id
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete notification:', error);
    return NextResponse.json(
      { error: 'Failed to delete notification' },
      { status: 500 }
    );
  }
}
```

### Notification Service

```typescript
// lib/notifications.ts
import { prisma } from './prisma';

export type NotificationType = 'comment' | 'like' | 'follow' | 'system' | 'mention';

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string;
}

export async function createNotification(params: CreateNotificationParams) {
  return await prisma.notification.create({
    data: params
  });
}

export async function getNotifications(userId: string, unreadOnly = false) {
  return await prisma.notification.findMany({
    where: {
      userId,
      ...(unreadOnly && { read: false })
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function getUnreadCount(userId: string) {
  return await prisma.notification.count({
    where: {
      userId,
      read: false
    }
  });
}

export async function markAsRead(notificationId: string, userId: string) {
  return await prisma.notification.update({
    where: {
      id: notificationId,
      userId
    },
    data: { read: true }
  });
}

export async function markAllAsRead(userId: string) {
  return await prisma.notification.updateMany({
    where: {
      userId,
      read: false
    },
    data: { read: true }
  });
}

export async function deleteNotification(notificationId: string, userId: string) {
  return await prisma.notification.delete({
    where: {
      id: notificationId,
      userId
    }
  });
}

export async function clearAllNotifications(userId: string) {
  return await prisma.notification.deleteMany({
    where: { userId }
  });
}
```

### Client-Side Hook

```typescript
// hooks/useNotifications.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Notification } from '@/components/Notifications';

export function useNotifications(enablePolling = false, interval = 30000) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setNotifications(data);
      setError(null);
    } catch (err) {
      setError('Failed to load notifications');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();

    if (enablePolling) {
      const intervalId = setInterval(fetchNotifications, interval);
      return () => clearInterval(intervalId);
    }
  }, [fetchNotifications, enablePolling, interval]);

  const markAsRead = async (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );

    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
    } catch (err) {
      console.error('Failed to mark as read:', err);
      fetchNotifications(); // Revert on error
    }
  };

  const markAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));

    try {
      await fetch('/api/notifications/read-all', { method: 'PATCH' });
    } catch (err) {
      console.error('Failed to mark all as read:', err);
      fetchNotifications();
    }
  };

  const deleteNotification = async (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));

    try {
      await fetch(`/api/notifications/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Failed to delete:', err);
      fetchNotifications();
    }
  };

  const clearAll = async () => {
    setNotifications([]);

    try {
      await fetch('/api/notifications', { method: 'DELETE' });
    } catch (err) {
      console.error('Failed to clear all:', err);
      fetchNotifications();
    }
  };

  return {
    notifications,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    refresh: fetchNotifications
  };
}
```

### Usage in Component

```typescript
// app/dashboard/page.tsx
'use client';

import { useNotifications } from '@/hooks/useNotifications';
import Notifications from '@/components/Notifications';
import LoadingSkeleton from '@/components/LoadingSkeleton';

export default function DashboardPage() {
  const {
    notifications,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll
  } = useNotifications(true, 30000); // Enable polling every 30s

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      {loading ? (
        <LoadingSkeleton variant="notification" count={5} />
      ) : (
        <Notifications
          notifications={notifications}
          onMarkAsRead={markAsRead}
          onMarkAllAsRead={markAllAsRead}
          onDelete={deleteNotification}
          onClearAll={clearAll}
        />
      )}
    </div>
  );
}
```

### WebSocket Implementation

#### Server (Node.js/Express)

```typescript
// server/websocket.ts
import { WebSocketServer } from 'ws';
import { createServer } from 'http';

const server = createServer();
const wss = new WebSocketServer({ server });

const clients = new Map<string, Set<WebSocket>>();

wss.on('connection', (ws, req) => {
  const userId = getUserIdFromRequest(req);
  
  if (!clients.has(userId)) {
    clients.set(userId, new Set());
  }
  clients.get(userId)!.add(ws);

  ws.on('close', () => {
    clients.get(userId)?.delete(ws);
  });
});

export function sendNotification(userId: string, notification: any) {
  const userClients = clients.get(userId);
  if (userClients) {
    userClients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(notification));
      }
    });
  }
}

server.listen(3001);
```

#### Client

```typescript
// hooks/useWebSocketNotifications.ts
'use client';

import { useEffect, useState } from 'react';
import { Notification } from '@/components/Notifications';

export function useWebSocketNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3001');

    ws.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.onmessage = (event) => {
      const notification = JSON.parse(event.data);
      setNotifications(prev => [notification, ...prev]);
      
      // Show browser notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/icon.png'
        });
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
    };

    return () => {
      ws.close();
    };
  }, []);

  return notifications;
}
```

### Triggering Notifications

```typescript
// When someone comments on a card
export async function handleNewComment(cardId: string, commenterId: string, cardOwnerId: string) {
  const commenter = await prisma.user.findUnique({
    where: { id: commenterId },
    select: { name: true }
  });

  const card = await prisma.card.findUnique({
    where: { id: cardId },
    select: { title: true }
  });

  await createNotification({
    userId: cardOwnerId,
    type: 'comment',
    title: 'New Comment',
    message: `${commenter.name} commented on your "${card.title}" card`,
    actionUrl: `/cards/${cardId}`
  });

  // If using WebSocket
  sendNotification(cardOwnerId, {
    id: 'new-id',
    type: 'comment',
    title: 'New Comment',
    message: `${commenter.name} commented on your "${card.title}" card`,
    timestamp: new Date().toISOString(),
    read: false,
    actionUrl: `/cards/${cardId}`
  });
}

// When someone likes a card
export async function handleCardLike(cardId: string, likerId: string, cardOwnerId: string) {
  const liker = await prisma.user.findUnique({
    where: { id: likerId },
    select: { name: true }
  });

  const card = await prisma.card.findUnique({
    where: { id: cardId },
    select: { title: true }
  });

  await createNotification({
    userId: cardOwnerId,
    type: 'like',
    title: 'Card Liked',
    message: `${liker.name} liked your "${card.title}" card`,
    actionUrl: `/cards/${cardId}`
  });
}

// When someone follows you
export async function handleNewFollower(followerId: string, followedId: string) {
  const follower = await prisma.user.findUnique({
    where: { id: followerId },
    select: { name: true }
  });

  await createNotification({
    userId: followedId,
    type: 'follow',
    title: 'New Follower',
    message: `${follower.name} started following you`,
    actionUrl: `/profile/${followerId}`
  });
}
```

### Rate Limiting

```typescript
// middleware/rateLimit.ts
import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!
});

export async function rateLimit(request: NextRequest, limit = 100, window = 60) {
  const ip = request.ip || 'unknown';
  const key = `rate-limit:${ip}`;

  const current = await redis.incr(key);
  
  if (current === 1) {
    await redis.expire(key, window);
  }

  if (current > limit) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }

  return null;
}

// Usage in API route
export async function GET(request: NextRequest) {
  const rateLimitResponse = await rateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  // Continue with normal logic
}
```

### Testing

```typescript
// __tests__/notifications.test.ts
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Notifications from '@/components/Notifications';

describe('Notifications', () => {
  const mockNotifications = [
    {
      id: '1',
      type: 'comment' as const,
      title: 'New Comment',
      message: 'Test message',
      timestamp: new Date().toISOString(),
      read: false
    }
  ];

  it('marks notification as read on click', async () => {
    const handleMarkAsRead = jest.fn();

    render(
      <Notifications
        notifications={mockNotifications}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={() => {}}
        onDelete={() => {}}
        onClearAll={() => {}}
      />
    );

    const notification = screen.getByText('New Comment');
    fireEvent.click(notification);

    await waitFor(() => {
      expect(handleMarkAsRead).toHaveBeenCalledWith('1');
    });
  });

  it('filters unread notifications', () => {
    render(
      <Notifications
        notifications={mockNotifications}
        onMarkAsRead={() => {}}
        onMarkAllAsRead={() => {}}
        onDelete={() => {}}
        onClearAll={() => {}}
      />
    );

    const filterButton = screen.getByRole('button', { name: /filter/i });
    fireEvent.click(filterButton);

    const unreadButton = screen.getByText(/unread/i);
    fireEvent.click(unreadButton);

    expect(screen.getByText('New Comment')).toBeInTheDocument();
  });
});
```

## Summary

This complete implementation provides:
- ✅ Full CRUD API endpoints
- ✅ Database schema
- ✅ Notification service
- ✅ Client-side hooks
- ✅ WebSocket support
- ✅ Rate limiting
- ✅ Testing examples
- ✅ Trigger functions

All ready for production use!

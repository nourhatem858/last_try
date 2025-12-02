# Notifications & Loading States Documentation

## Overview
Complete notification system and loading skeleton components for the Adaptive AI Knowledge Workspace built with React, Next.js, and Tailwind CSS.

## Features

### 🔔 Notifications Component
- **Read/Unread Status**: Visual distinction with cyan/blue accent
- **Type-Based Icons**: Different icons for comments, likes, follows, mentions, system
- **Filter Options**: All or unread notifications
- **Interactive Actions**: Mark as read, delete, clear all
- **Timestamp Formatting**: Relative time display (5m ago, 2h ago, etc.)
- **Hover Effects**: Subtle shadows and transitions
- **Empty States**: Friendly messages when no notifications
- **Badge Counts**: Unread notification counter
- **Smooth Animations**: Fade-in, slide-in effects
- **Dark Mode**: Full dark mode support

### ⏳ Loading Skeletons
- **Multiple Variants**: Card, Profile, Notification, List, Text
- **Shimmer Effect**: Smooth animated gradient
- **Customizable Count**: Display multiple skeletons
- **Dark Mode**: Adapts to theme
- **Reusable**: Works across different pages
- **Fade-in Transition**: Smooth content appearance
- **Neutral Tones**: Non-distracting light grey

### 🎯 Notification Center
- **Toolbar Integration**: Dropdown from bell icon
- **Badge Counter**: Shows unread count
- **Click Outside**: Auto-close dropdown
- **Real-time Updates**: Polling support
- **API Integration**: Ready for backend

## File Structure

```
components/
├── Notifications.tsx           # Main notifications component
├── NotificationCenter.tsx      # Toolbar-integrated dropdown
├── LoadingSkeleton.tsx         # Loading skeleton variants
└── NOTIFICATIONS_LOADING_README.md

app/
├── notifications-demo/
│   └── page.tsx               # Demo page
└── globals.css                # Shimmer animation
```

## Usage

### Notifications Component

```tsx
import Notifications, { Notification } from '@/components/Notifications';

const [notifications, setNotifications] = useState<Notification[]>([
  {
    id: '1',
    type: 'comment',
    title: 'New Comment',
    message: 'Sarah commented on your card',
    timestamp: new Date().toISOString(),
    read: false,
    actionUrl: '/cards/123'
  }
]);

<Notifications
  notifications={notifications}
  onMarkAsRead={(id) => handleMarkAsRead(id)}
  onMarkAllAsRead={() => handleMarkAllAsRead()}
  onDelete={(id) => handleDelete(id)}
  onClearAll={() => handleClearAll()}
  loading={false}
/>
```

### Notification Center (Toolbar Integration)

```tsx
import NotificationCenter from '@/components/NotificationCenter';

<NotificationCenter
  darkMode={darkMode}
  enablePolling={true}
  pollingInterval={30000}
/>
```

### Loading Skeletons

```tsx
import LoadingSkeleton, { LoadingGrid } from '@/components/LoadingSkeleton';

// Single skeleton
<LoadingSkeleton variant="card" />

// Multiple skeletons
<LoadingSkeleton variant="notification" count={5} />

// Grid of cards
<LoadingGrid count={6} />

// Different variants
<LoadingSkeleton variant="profile" />
<LoadingSkeleton variant="list" count={3} />
<LoadingSkeleton variant="text" />
```

## Props

### Notifications Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `notifications` | `Notification[]` | Yes | - | Array of notification objects |
| `onMarkAsRead` | `(id: string) => void` | Yes | - | Callback when marking as read |
| `onMarkAllAsRead` | `() => void` | Yes | - | Callback for mark all as read |
| `onDelete` | `(id: string) => void` | Yes | - | Callback when deleting |
| `onClearAll` | `() => void` | Yes | - | Callback for clear all |
| `loading` | `boolean` | No | `false` | Show loading state |
| `className` | `string` | No | `''` | Additional CSS classes |

### Notification Object

```typescript
interface Notification {
  id: string;
  type: 'comment' | 'like' | 'follow' | 'system' | 'mention';
  title: string;
  message: string;
  timestamp: string; // ISO string
  read: boolean;
  actionUrl?: string; // Optional URL to navigate
}
```

### NotificationCenter Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `darkMode` | `boolean` | No | `false` | Enable dark mode |
| `enablePolling` | `boolean` | No | `false` | Enable auto-refresh |
| `pollingInterval` | `number` | No | `30000` | Polling interval in ms |

### LoadingSkeleton Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `variant` | `'card' \| 'profile' \| 'notification' \| 'list' \| 'text'` | No | `'card'` | Skeleton type |
| `count` | `number` | No | `1` | Number of skeletons |
| `className` | `string` | No | `''` | Additional CSS classes |

## Integration with Backend

### API Endpoints

#### GET /api/notifications
Fetch user notifications

```typescript
// app/api/notifications/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

export async function GET(request: NextRequest) {
  const session = await getServerSession();
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const notifications = await getNotifications(session.user.id);
  return NextResponse.json(notifications);
}
```

#### PATCH /api/notifications/:id/read
Mark notification as read

```typescript
// app/api/notifications/[id]/read/route.ts
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession();
  
  await markNotificationAsRead(params.id, session.user.id);
  return NextResponse.json({ success: true });
}
```

#### DELETE /api/notifications/:id
Delete notification

```typescript
// app/api/notifications/[id]/route.ts
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession();
  
  await deleteNotification(params.id, session.user.id);
  return NextResponse.json({ success: true });
}
```

### Real-time Updates with WebSocket

```typescript
'use client';

import { useEffect } from 'react';

export function useNotifications() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const ws = new WebSocket('ws://your-server/notifications');
    
    ws.onmessage = (event) => {
      const newNotification = JSON.parse(event.data);
      setNotifications(prev => [newNotification, ...prev]);
    };

    return () => ws.close();
  }, []);

  return notifications;
}
```

### Polling Implementation

```typescript
useEffect(() => {
  const fetchNotifications = async () => {
    const response = await fetch('/api/notifications');
    const data = await response.json();
    setNotifications(data);
  };

  // Initial fetch
  fetchNotifications();

  // Poll every 30 seconds
  const interval = setInterval(fetchNotifications, 30000);

  return () => clearInterval(interval);
}, []);
```

## Customization

### Adding New Notification Types

```tsx
// In Notifications.tsx
type NotificationType = 'comment' | 'like' | 'follow' | 'system' | 'mention' | 'share';

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case 'share':
      return <ShareIcon className="w-5 h-5 text-blue-500" />;
    // ... other cases
  }
};
```

### Custom Skeleton Variant

```tsx
// In LoadingSkeleton.tsx
function CustomSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Your custom skeleton structure */}
    </div>
  );
}

// Add to main component
{variant === 'custom' && <CustomSkeleton />}
```

### Styling Customization

```tsx
// Custom colors for unread notifications
<div className={`${
  !notification.read
    ? 'bg-purple-50 dark:bg-purple-900/10'
    : 'hover:bg-gray-50'
}`}>
```

## Animations

### Shimmer Effect
Defined in `app/globals.css`:

```css
@keyframes shimmer {
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
}

.shimmer {
  animation: shimmer 2s infinite linear;
  background: linear-gradient(
    to right,
    #f0f0f0 0%,
    #f8f8f8 20%,
    #f0f0f0 40%,
    #f0f0f0 100%
  );
  background-size: 1000px 100%;
}
```

### Notification Arrival Animation

```tsx
// Staggered animation
style={{ animationDelay: `${index * 50}ms` }}
className="animate-in slide-in-from-top-2"
```

### Badge Pulse

```tsx
<span className="animate-pulse bg-gradient-to-r from-cyan-500 to-blue-500">
  {unreadCount}
</span>
```

## Responsive Design

### Mobile (< 768px)
- Full-width notifications dropdown
- Touch-optimized buttons
- Stacked layout
- Reduced padding

### Tablet (768px - 1024px)
- Optimized dropdown width
- Balanced spacing
- Readable text sizes

### Desktop (> 1024px)
- Fixed dropdown width (384px)
- Hover effects enabled
- Maximum content visibility

## Accessibility

### ARIA Labels
```tsx
<button aria-label="Notifications">
  <BellIcon />
</button>
```

### Keyboard Navigation
- Tab through notifications
- Enter to open/close
- Escape to close dropdown

### Screen Readers
- Descriptive labels
- Status announcements
- Semantic HTML

## Performance

### Optimization Tips

1. **Virtualization**: For large notification lists
```tsx
import { FixedSizeList } from 'react-window';
```

2. **Memoization**: Prevent unnecessary re-renders
```tsx
const NotificationItem = memo(({ notification }) => {
  // Component implementation
});
```

3. **Debounced Polling**: Reduce API calls
```tsx
const debouncedFetch = debounce(fetchNotifications, 1000);
```

4. **Lazy Loading**: Load notifications on demand
```tsx
const Notifications = dynamic(() => import('@/components/Notifications'), {
  loading: () => <LoadingSkeleton variant="notification" count={3} />
});
```

## Testing

### Unit Tests

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import Notifications from '@/components/Notifications';

describe('Notifications', () => {
  it('marks notification as read on click', () => {
    const handleMarkAsRead = jest.fn();
    const notifications = [{
      id: '1',
      type: 'comment',
      title: 'Test',
      message: 'Test message',
      timestamp: new Date().toISOString(),
      read: false
    }];

    render(
      <Notifications
        notifications={notifications}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={() => {}}
        onDelete={() => {}}
        onClearAll={() => {}}
      />
    );

    const notification = screen.getByText('Test');
    fireEvent.click(notification);

    expect(handleMarkAsRead).toHaveBeenCalledWith('1');
  });
});
```

## Troubleshooting

### Issue: Notifications not updating
**Solution**: Ensure state is properly managed

```tsx
const [notifications, setNotifications] = useState([]);

// Correct way to update
setNotifications(prev => prev.map(n => 
  n.id === id ? { ...n, read: true } : n
));
```

### Issue: Shimmer not animating
**Solution**: Check CSS is imported

```tsx
// In app/layout.tsx
import './globals.css';
```

### Issue: Dropdown not closing
**Solution**: Verify click-outside detection

```tsx
useEffect(() => {
  function handleClickOutside(event: MouseEvent) {
    if (ref.current && !ref.current.contains(event.target as Node)) {
      setShow(false);
    }
  }
  document.addEventListener('mousedown', handleClickOutside);
  return () => document.removeEventListener('mousedown', handleClickOutside);
}, []);
```

## Best Practices

1. **State Management**: Use Context for global notifications
2. **Error Handling**: Always wrap API calls in try-catch
3. **Loading States**: Show skeletons while fetching
4. **Optimistic Updates**: Update UI before API response
5. **Debouncing**: Debounce rapid actions
6. **Cleanup**: Clear intervals and close WebSockets
7. **Accessibility**: Test with keyboard and screen readers

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Dependencies

- `react` ^19.2.0
- `next` ^16.0.4
- `@heroicons/react` ^2.2.0
- `tailwindcss` ^4

## License

MIT

# Frontend-Backend Integration Guide

## 📦 Complete Integration Architecture

### File Structure

```
├── lib/
│   └── axios.ts                    # Axios configuration with interceptors
├── services/
│   ├── authService.ts              # Authentication API calls
│   ├── cardsService.ts             # Knowledge Cards CRUD
│   ├── bookmarksService.ts         # Bookmarks & Likes
│   ├── notificationsService.ts     # Notifications management
│   └── analyticsService.ts         # Analytics tracking
├── contexts/
│   └── AuthContext.tsx             # Global auth state
├── hooks/
│   ├── useCards.ts                 # Cards data fetching
│   ├── useBookmarks.ts             # Bookmark/Like management
│   └── useNotifications.ts         # Notifications fetching
├── components/
│   ├── ProtectedRoute.tsx          # Route authentication guard
│   └── KnowledgeCard.tsx           # Card component with actions
├── app/
│   ├── login/page.tsx              # Login page
│   ├── signup/page.tsx             # Signup page
│   └── dashboard/page.tsx          # Main dashboard
└── .env.local                      # Environment variables
```

## 🔧 Setup

### 1. Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 2. Install Dependencies

```bash
npm install axios
```

### 3. Wrap App with AuthProvider

```tsx
// app/layout.tsx
import { AuthProvider } from '@/contexts/AuthContext';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

## 🔐 Authentication Flow

### Login

```tsx
import { useAuth } from '@/contexts/AuthContext';

function LoginPage() {
  const { login } = useAuth();

  const handleLogin = async (email: string, password: string) => {
    try {
      await login(email, password);
      // Automatically redirects to /dashboard
    } catch (error) {
      console.error('Login failed:', error.message);
    }
  };
}
```

### Signup

```tsx
import { useAuth } from '@/contexts/AuthContext';

function SignupPage() {
  const { signup } = useAuth();

  const handleSignup = async (name: string, email: string, password: string) => {
    try {
      await signup(name, email, password);
      // Automatically redirects to /dashboard
    } catch (error) {
      console.error('Signup failed:', error.message);
    }
  };
}
```

### Protected Routes

```tsx
import ProtectedRoute from '@/components/ProtectedRoute';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

// Admin-only route
export default function AdminPage() {
  return (
    <ProtectedRoute requireAdmin>
      <AdminContent />
    </ProtectedRoute>
  );
}
```

### Logout

```tsx
import { useAuth } from '@/contexts/AuthContext';

function Header() {
  const { logout } = useAuth();

  return (
    <button onClick={logout}>
      Logout
    </button>
  );
}
```

## 📚 Services Usage

### Cards Service

```tsx
import cardsService from '@/services/cardsService';

// Get all cards
const response = await cardsService.getCards({
  page: 1,
  limit: 20,
  category: 'Machine Learning',
  search: 'neural networks',
  sortBy: 'createdAt',
  order: 'desc'
});

// Get single card
const card = await cardsService.getCard('card-id');

// Create card
const newCard = await cardsService.createCard({
  title: 'Neural Networks Basics',
  content: 'Introduction to neural networks...',
  category: 'Machine Learning',
  tags: ['AI', 'Deep Learning']
});

// Update card
const updated = await cardsService.updateCard('card-id', {
  title: 'Updated Title'
});

// Delete card
await cardsService.deleteCard('card-id');

// Search cards
const results = await cardsService.searchCards('machine learning');

// Get trending cards
const trending = await cardsService.getTrendingCards(10);
```

### Bookmarks & Likes Service

```tsx
import bookmarksService from '@/services/bookmarksService';

// Toggle bookmark
const result = await bookmarksService.toggleBookmark('card-id');
console.log(result.bookmarked); // true/false
console.log(result.bookmarksCount); // number

// Get bookmarked cards
const bookmarked = await bookmarksService.getBookmarkedCards(1, 20);

// Toggle like
const likeResult = await bookmarksService.toggleLike('card-id');

// Get liked cards
const liked = await bookmarksService.getLikedCards(1, 20);

// Get card stats
const stats = await bookmarksService.getCardStats('card-id');
```

### Notifications Service

```tsx
import notificationsService from '@/services/notificationsService';

// Get all notifications
const response = await notificationsService.getNotifications('all', 50);

// Get unread count
const count = await notificationsService.getUnreadCount();

// Mark as read
await notificationsService.markAsRead('notification-id');

// Mark all as read
await notificationsService.markAllAsRead();

// Delete notification
await notificationsService.deleteNotification('notification-id');

// Clear all
await notificationsService.clearAll();
```

### Analytics Service

```tsx
import analyticsService from '@/services/analyticsService';

// Log actions
await analyticsService.logView('card-id');
await analyticsService.logLike('card-id');
await analyticsService.logBookmark('card-id');
await analyticsService.logSearch('query', 10);

// Get analytics
const analytics = await analyticsService.getAnalytics();
const userAnalytics = await analyticsService.getUserAnalytics();
const cardAnalytics = await analyticsService.getCardAnalytics('card-id');
```

## 🎣 Custom Hooks Usage

### useCards Hook

```tsx
import { useCards } from '@/hooks/useCards';

function Dashboard() {
  const { 
    cards, 
    loading, 
    error, 
    page, 
    totalPages, 
    nextPage, 
    prevPage, 
    refresh 
  } = useCards({
    category: 'Machine Learning',
    limit: 12
  });

  if (loading) return <LoadingSkeleton />;
  if (error) return <Error message={error} />;

  return (
    <div>
      {cards.map(card => (
        <Card key={card.id} data={card} />
      ))}
      <button onClick={prevPage}>Previous</button>
      <button onClick={nextPage}>Next</button>
    </div>
  );
}
```

### useCard Hook

```tsx
import { useCard } from '@/hooks/useCards';

function CardDetail({ cardId }) {
  const { card, loading, error, refresh } = useCard(cardId);

  if (loading) return <LoadingSkeleton variant="card" />;
  if (error) return <Error message={error} />;

  return <CardView card={card} onUpdate={refresh} />;
}
```

### useBookmark & useLike Hooks

```tsx
import { useBookmark, useLike } from '@/hooks/useBookmarks';

function CardActions({ cardId }) {
  const { bookmarked, bookmarksCount, toggleBookmark, loading: bookmarkLoading } = useBookmark(cardId);
  const { liked, likesCount, toggleLike, loading: likeLoading } = useLike(cardId);

  return (
    <div>
      <button onClick={toggleBookmark} disabled={bookmarkLoading}>
        {bookmarked ? 'Unbookmark' : 'Bookmark'} ({bookmarksCount})
      </button>
      <button onClick={toggleLike} disabled={likeLoading}>
        {liked ? 'Unlike' : 'Like'} ({likesCount})
      </button>
    </div>
  );
}
```

### useNotifications Hook

```tsx
import { useNotifications } from '@/hooks/useNotifications';

function NotificationCenter() {
  const {
    notifications,
    loading,
    error,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    refresh
  } = useNotifications(true, 30000); // Enable polling every 30s

  return (
    <div>
      <h3>Notifications ({unreadCount})</h3>
      {notifications.map(notification => (
        <div key={notification.id}>
          <p>{notification.message}</p>
          <button onClick={() => markAsRead(notification.id)}>
            Mark as read
          </button>
          <button onClick={() => deleteNotification(notification.id)}>
            Delete
          </button>
        </div>
      ))}
      <button onClick={markAllAsRead}>Mark all as read</button>
      <button onClick={clearAll}>Clear all</button>
    </div>
  );
}
```

## 🔄 Error Handling

### Global Error Handling

Axios interceptor automatically handles:
- 401 Unauthorized → Redirects to login
- 403 Forbidden → Logs error
- 500 Server Error → Logs error

### Component-Level Error Handling

```tsx
try {
  await cardsService.createCard(data);
} catch (error) {
  // Error is already formatted by service
  setError(error.message);
  // Show toast notification
  toast.error(error.message);
}
```

### Retry Logic

```tsx
async function fetchWithRetry(fn, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}

// Usage
const cards = await fetchWithRetry(() => cardsService.getCards());
```

## 🎨 Loading States

### Skeleton Loaders

```tsx
import LoadingSkeleton, { LoadingGrid } from '@/components/LoadingSkeleton';

// Single card
{loading && <LoadingSkeleton variant="card" />}

// Multiple cards
{loading && <LoadingGrid count={6} />}

// Profile
{loading && <LoadingSkeleton variant="profile" />}

// Notifications
{loading && <LoadingSkeleton variant="notification" count={5} />}
```

### Optimistic Updates

```tsx
const { bookmarked, toggleBookmark } = useBookmark(cardId);

// Optimistic update happens automatically in the hook
// UI updates immediately, reverts on error
await toggleBookmark();
```

## 🔒 Security Best Practices

### JWT Token Management

```tsx
// Token is automatically added to all requests via axios interceptor
// Stored in localStorage
// Removed on logout or 401 error
```

### Protected API Calls

```tsx
// All services automatically include JWT token
// No need to manually add Authorization header
const cards = await cardsService.getCards(); // Token included automatically
```

### CSRF Protection

```tsx
// Add CSRF token to axios config if needed
axios.defaults.headers.common['X-CSRF-Token'] = getCsrfToken();
```

## 📊 Real-time Updates

### Polling

```tsx
// Notifications with polling
const { notifications } = useNotifications(true, 30000); // Poll every 30s
```

### WebSocket (Future Enhancement)

```tsx
useEffect(() => {
  const ws = new WebSocket('ws://localhost:5000');
  
  ws.onmessage = (event) => {
    const notification = JSON.parse(event.data);
    // Update state
  };

  return () => ws.close();
}, []);
```

## 🧪 Testing

### Service Testing

```typescript
import cardsService from '@/services/cardsService';
import axios from '@/lib/axios';

jest.mock('@/lib/axios');

describe('cardsService', () => {
  it('fetches cards successfully', async () => {
    const mockData = { cards: [], total: 0 };
    (axios.get as jest.Mock).mockResolvedValue({ data: mockData });

    const result = await cardsService.getCards();
    expect(result).toEqual(mockData);
  });
});
```

### Hook Testing

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { useCards } from '@/hooks/useCards';

describe('useCards', () => {
  it('fetches cards on mount', async () => {
    const { result } = renderHook(() => useCards());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.cards).toBeDefined();
    });
  });
});
```

## 🚀 Performance Optimization

### Debouncing

```tsx
// Search with debounce
const [query, setQuery] = useState('');
const { cards } = useSearchCards(query); // Automatically debounced in hook
```

### Caching

```tsx
// Use SWR or React Query for caching
import useSWR from 'swr';

const { data, error } = useSWR('/api/cards', () => cardsService.getCards());
```

### Lazy Loading

```tsx
import dynamic from 'next/dynamic';

const CardModal = dynamic(() => import('@/components/CardModal'), {
  loading: () => <LoadingSkeleton variant="card" />
});
```

## 📝 API Response Format

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error message",
  "details": { ... }
}
```

## 🔗 Backend API Endpoints

### Authentication
- POST `/api/auth/signup` - Register new user
- POST `/api/auth/login` - Login user
- GET `/api/auth/profile` - Get user profile
- PATCH `/api/auth/profile` - Update profile
- POST `/api/auth/upload-avatar` - Upload avatar

### Cards
- GET `/api/cards` - Get all cards
- GET `/api/cards/:id` - Get single card
- POST `/api/cards` - Create card
- PATCH `/api/cards/:id` - Update card
- DELETE `/api/cards/:id` - Delete card
- GET `/api/cards/search` - Search cards

### Bookmarks & Likes
- POST `/api/bookmarks/:cardId` - Toggle bookmark
- GET `/api/bookmarks` - Get bookmarked cards
- POST `/api/likes/:cardId` - Toggle like
- GET `/api/likes` - Get liked cards

### Notifications
- GET `/api/notifications` - Get notifications
- PATCH `/api/notifications/:id/read` - Mark as read
- DELETE `/api/notifications/:id` - Delete notification

### Analytics
- POST `/api/analytics/log` - Log action
- GET `/api/analytics` - Get analytics
- GET `/api/analytics/user` - Get user analytics

## ✅ Integration Checklist

- [x] Axios configured with base URL
- [x] JWT token interceptor
- [x] Auth service with login/signup
- [x] Cards service with CRUD
- [x] Bookmarks & Likes service
- [x] Notifications service
- [x] Analytics service
- [x] Auth context provider
- [x] Protected route component
- [x] Custom hooks for data fetching
- [x] Error handling
- [x] Loading states
- [x] Optimistic updates
- [x] Login page
- [x] Dashboard page
- [x] Documentation

## 🎉 Summary

You now have a complete, production-ready frontend-backend integration with:

- ✅ Clean services layer
- ✅ Global auth state
- ✅ Protected routes
- ✅ Custom hooks
- ✅ Error handling
- ✅ Loading states
- ✅ Optimistic updates
- ✅ JWT authentication
- ✅ Type safety
- ✅ Comprehensive documentation

All ready to connect to your backend API!

# Integration Quick Start Guide

## 🚀 5-Minute Setup

### 1. Environment Setup

Create `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 2. Wrap App with AuthProvider

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

### 3. Use in Components

```tsx
// Login
import { useAuth } from '@/contexts/AuthContext';

const { login } = useAuth();
await login(email, password);

// Fetch Cards
import { useCards } from '@/hooks/useCards';

const { cards, loading } = useCards();

// Bookmark/Like
import { useBookmark, useLike } from '@/hooks/useBookmarks';

const { bookmarked, toggleBookmark } = useBookmark(cardId);
const { liked, toggleLike } = useLike(cardId);

// Notifications
import { useNotifications } from '@/hooks/useNotifications';

const { notifications, unreadCount, markAsRead } = useNotifications(true);
```

## 📦 File Structure

```
├── lib/axios.ts                    # Axios config
├── services/
│   ├── authService.ts              # Auth API
│   ├── cardsService.ts             # Cards API
│   ├── bookmarksService.ts         # Bookmarks/Likes API
│   ├── notificationsService.ts     # Notifications API
│   └── analyticsService.ts         # Analytics API
├── contexts/AuthContext.tsx        # Auth state
├── hooks/
│   ├── useCards.ts                 # Cards hooks
│   ├── useBookmarks.ts             # Bookmark/Like hooks
│   └── useNotifications.ts         # Notifications hook
└── components/ProtectedRoute.tsx   # Route guard
```

## 🔐 Authentication

```tsx
// Login
const { login } = useAuth();
await login(email, password);

// Signup
const { signup } = useAuth();
await signup(name, email, password);

// Logout
const { logout } = useAuth();
logout();

// Check auth
const { isAuthenticated, user } = useAuth();
```

## 📚 API Services

```tsx
// Cards
import cardsService from '@/services/cardsService';

await cardsService.getCards({ page: 1, limit: 20 });
await cardsService.getCard(id);
await cardsService.createCard(data);
await cardsService.updateCard(id, data);
await cardsService.deleteCard(id);
await cardsService.searchCards(query);

// Bookmarks
import bookmarksService from '@/services/bookmarksService';

await bookmarksService.toggleBookmark(cardId);
await bookmarksService.getBookmarkedCards();
await bookmarksService.toggleLike(cardId);
await bookmarksService.getLikedCards();

// Notifications
import notificationsService from '@/services/notificationsService';

await notificationsService.getNotifications();
await notificationsService.markAsRead(id);
await notificationsService.markAllAsRead();
await notificationsService.deleteNotification(id);

// Analytics
import analyticsService from '@/services/analyticsService';

await analyticsService.logView(cardId);
await analyticsService.logLike(cardId);
await analyticsService.logBookmark(cardId);
await analyticsService.logSearch(query, count);
```

## 🎣 Custom Hooks

```tsx
// Fetch cards with pagination
const { cards, loading, error, page, totalPages, nextPage, prevPage } = useCards({
  category: 'Machine Learning',
  limit: 12
});

// Single card
const { card, loading, error, refresh } = useCard(cardId);

// My cards
const { cards, loading, error, refresh } = useMyCards();

// Search
const { cards, loading, error } = useSearchCards(query);

// Bookmark
const { bookmarked, bookmarksCount, toggleBookmark, loading } = useBookmark(cardId);

// Like
const { liked, likesCount, toggleLike, loading } = useLike(cardId);

// Notifications
const { 
  notifications, 
  loading, 
  unreadCount, 
  markAsRead, 
  markAllAsRead,
  deleteNotification,
  clearAll 
} = useNotifications(true, 30000); // Poll every 30s
```

## 🛡️ Protected Routes

```tsx
import ProtectedRoute from '@/components/ProtectedRoute';

// Regular protected route
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

## ⏳ Loading States

```tsx
import LoadingSkeleton, { LoadingGrid } from '@/components/LoadingSkeleton';

// Single skeleton
{loading && <LoadingSkeleton variant="card" />}

// Multiple skeletons
{loading && <LoadingGrid count={6} />}

// Different variants
<LoadingSkeleton variant="profile" />
<LoadingSkeleton variant="notification" count={5} />
<LoadingSkeleton variant="list" count={3} />
<LoadingSkeleton variant="text" />
```

## ❌ Error Handling

```tsx
// Automatic error handling in services
try {
  await cardsService.createCard(data);
} catch (error) {
  console.error(error.message); // User-friendly message
}

// Display errors
{error && (
  <div className="p-4 bg-red-50 rounded-lg">
    <p className="text-red-600">{error}</p>
  </div>
)}
```

## 🔄 Optimistic Updates

```tsx
// Automatically handled in hooks
const { bookmarked, toggleBookmark } = useBookmark(cardId);

// UI updates immediately, reverts on error
await toggleBookmark();
```

## 📊 Analytics Tracking

```tsx
import analyticsService from '@/services/analyticsService';

// Log user actions
await analyticsService.logView(cardId);
await analyticsService.logLike(cardId);
await analyticsService.logBookmark(cardId);
await analyticsService.logSearch(query, resultsCount);
await analyticsService.logCreate(cardId, category);
```

## 🎨 Complete Example

```tsx
'use client';

import { useCards } from '@/hooks/useCards';
import { useBookmark, useLike } from '@/hooks/useBookmarks';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  );
}

function Dashboard() {
  const { cards, loading, error, refresh } = useCards({ limit: 12 });

  if (loading) return <LoadingSkeleton variant="card" count={12} />;
  if (error) return <Error message={error} />;

  return (
    <div className="grid grid-cols-3 gap-6">
      {cards.map(card => (
        <CardComponent key={card.id} card={card} onUpdate={refresh} />
      ))}
    </div>
  );
}

function CardComponent({ card, onUpdate }) {
  const { bookmarked, toggleBookmark } = useBookmark(card.id, card.bookmarked);
  const { liked, toggleLike } = useLike(card.id, card.liked);

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg">
      <h3>{card.title}</h3>
      <p>{card.content}</p>
      <div className="flex gap-2 mt-4">
        <button onClick={toggleBookmark}>
          {bookmarked ? 'Unbookmark' : 'Bookmark'}
        </button>
        <button onClick={toggleLike}>
          {liked ? 'Unlike' : 'Like'}
        </button>
      </div>
    </div>
  );
}
```

## 🔗 Backend API Endpoints

```
POST   /api/auth/signup
POST   /api/auth/login
GET    /api/auth/profile
PATCH  /api/auth/profile

GET    /api/cards
GET    /api/cards/:id
POST   /api/cards
PATCH  /api/cards/:id
DELETE /api/cards/:id
GET    /api/cards/search

POST   /api/bookmarks/:cardId
GET    /api/bookmarks
POST   /api/likes/:cardId
GET    /api/likes

GET    /api/notifications
PATCH  /api/notifications/:id/read
DELETE /api/notifications/:id

POST   /api/analytics/log
GET    /api/analytics
```

## ✅ Checklist

- [ ] Set `NEXT_PUBLIC_API_URL` in `.env.local`
- [ ] Wrap app with `AuthProvider`
- [ ] Create login/signup pages
- [ ] Use `ProtectedRoute` for authenticated pages
- [ ] Use hooks for data fetching
- [ ] Add loading states
- [ ] Handle errors
- [ ] Test authentication flow
- [ ] Test CRUD operations
- [ ] Test bookmarks/likes
- [ ] Test notifications

## 📚 Documentation

- `FRONTEND_BACKEND_INTEGRATION.md` - Complete guide
- `INTEGRATION_QUICK_START.md` - This file
- Code comments in all files

## 🎉 You're Ready!

All services, hooks, and components are ready to use. Just connect to your backend API and start building!

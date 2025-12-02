# Quick Reference - AI Knowledge Workspace

## 🚀 Component Imports

```tsx
// Navigation
import Toolbar from '@/components/Toolbar';
import Sidebar from '@/components/Sidebar';

// Profile & Settings
import ProfileEditModal from '@/components/ProfileEditModal';
import ActivityCard from '@/components/ActivityCard';
import ToggleSwitch from '@/components/ToggleSwitch';
import ColorPicker from '@/components/ColorPicker';

// Notifications
import Notifications from '@/components/Notifications';
import NotificationCenter from '@/components/NotificationCenter';

// Loading
import LoadingSkeleton, { LoadingGrid } from '@/components/LoadingSkeleton';
```

## 📄 Pages

- `/profile` - User profile page
- `/settings` - Settings page
- `/notifications-demo` - Notifications demo

## 🎨 Common Patterns

### Layout with Navigation
```tsx
const [sidebarOpen, setSidebarOpen] = useState(true);
const [darkMode, setDarkMode] = useState(false);

<Toolbar
  onMenuClick={() => setSidebarOpen(!sidebarOpen)}
  onSearch={(q) => handleSearch(q)}
  darkMode={darkMode}
  onToggleDarkMode={() => setDarkMode(!darkMode)}
/>

<Sidebar
  isOpen={sidebarOpen}
  onToggle={() => setSidebarOpen(!sidebarOpen)}
  darkMode={darkMode}
/>
```

### Notifications
```tsx
<Notifications
  notifications={notifications}
  onMarkAsRead={(id) => markAsRead(id)}
  onMarkAllAsRead={() => markAllAsRead()}
  onDelete={(id) => deleteNotification(id)}
  onClearAll={() => clearAll()}
/>
```

### Loading States
```tsx
{loading ? (
  <LoadingSkeleton variant="card" count={3} />
) : (
  <YourContent />
)}
```

### Toggle Switch
```tsx
<ToggleSwitch
  label="Email Notifications"
  description="Receive updates via email"
  checked={enabled}
  onChange={(checked) => setEnabled(checked)}
/>
```

## 🎯 Skeleton Variants

- `variant="card"` - Knowledge cards
- `variant="profile"` - User profiles
- `variant="notification"` - Notifications
- `variant="list"` - List items
- `variant="text"` - Text content

## 🔔 Notification Types

- `type="comment"` - Blue chat icon
- `type="like"` - Red heart icon
- `type="follow"` - Green user icon
- `type="mention"` - Purple bell icon
- `type="system"` - Cyan sparkles icon

## 🎨 Color Classes

```tsx
// Gradients
className="bg-gradient-to-r from-cyan-500 to-blue-500"
className="bg-gradient-to-r from-purple-500 to-pink-500"

// Dark mode
className="bg-white dark:bg-gray-800"
className="text-gray-900 dark:text-white"

// Hover
className="hover:bg-gray-100 dark:hover:bg-gray-700"
```

## 📐 Responsive Classes

```tsx
// Mobile first
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"

// Hide on mobile
className="hidden lg:block"

// Show on mobile only
className="lg:hidden"
```

## ✨ Animation Classes

```tsx
// Fade in
className="animate-in fade-in duration-200"

// Slide in
className="animate-in slide-in-from-top-2 duration-200"

// Pulse
className="animate-pulse"

// Hover scale
className="transform hover:scale-105 transition-all"
```

## 🔧 Common Hooks

```tsx
// Click outside
useEffect(() => {
  function handleClickOutside(event: MouseEvent) {
    if (ref.current && !ref.current.contains(event.target as Node)) {
      setShow(false);
    }
  }
  document.addEventListener('mousedown', handleClickOutside);
  return () => document.removeEventListener('mousedown', handleClickOutside);
}, []);

// Polling
useEffect(() => {
  const interval = setInterval(fetchData, 30000);
  return () => clearInterval(interval);
}, []);

// Dark mode persistence
useEffect(() => {
  const saved = localStorage.getItem('darkMode') === 'true';
  setDarkMode(saved);
}, []);

useEffect(() => {
  localStorage.setItem('darkMode', darkMode.toString());
  document.documentElement.classList.toggle('dark', darkMode);
}, [darkMode]);
```

## 🌐 API Endpoints

```
GET    /api/profile
PATCH  /api/profile
POST   /api/upload/avatar
GET    /api/activity
GET    /api/settings
POST   /api/settings
GET    /api/notifications
PATCH  /api/notifications/:id/read
PATCH  /api/notifications/read-all
DELETE /api/notifications/:id
DELETE /api/notifications
```

## 📚 Documentation Files

- `TOOLBAR_SIDEBAR_README.md` - Navigation docs
- `INTEGRATION_GUIDE.md` - Integration guide
- `PROFILE_SETTINGS_README.md` - Profile/Settings docs
- `PROFILE_SETTINGS_API_GUIDE.md` - API guide
- `NOTIFICATIONS_LOADING_README.md` - Notifications docs
- `NOTIFICATIONS_API_EXAMPLES.md` - API examples
- `COMPLETE_WORKSPACE_FEATURES.md` - All features
- `QUICK_REFERENCE.md` - This file

## 🎯 TypeScript Types

```typescript
// Notification
interface Notification {
  id: string;
  type: 'comment' | 'like' | 'follow' | 'system' | 'mention';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

// User Profile
interface UserProfile {
  name: string;
  email: string;
  role: 'Admin' | 'User';
  avatar?: string;
  theme: 'light' | 'dark';
  favoriteTopics: string[];
  bio?: string;
}

// Settings
interface Settings {
  theme: 'light' | 'dark' | 'auto';
  accentColor: string;
  notifications: {
    email: boolean;
    push: boolean;
    weekly: boolean;
    mentions: boolean;
  };
  privacy: {
    profileVisible: boolean;
    activityVisible: boolean;
  };
  language: string;
}
```

## 🔥 Pro Tips

1. **Always use dark mode classes**: `dark:bg-gray-800`
2. **Use gradient backgrounds**: `from-cyan-500 to-blue-500`
3. **Add hover effects**: `hover:scale-105 transition-all`
4. **Include loading states**: Show skeletons while fetching
5. **Handle errors gracefully**: Try-catch all API calls
6. **Optimize images**: Use Next.js Image component
7. **Debounce search**: 300ms delay
8. **Clean up effects**: Return cleanup functions
9. **Use semantic HTML**: Proper heading hierarchy
10. **Test accessibility**: Keyboard navigation

## 🎨 Design System

### Spacing Scale
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px

### Font Sizes
- xs: 12px
- sm: 14px
- base: 16px
- lg: 18px
- xl: 20px
- 2xl: 24px
- 3xl: 30px

### Shadows
- sm: `shadow-sm`
- md: `shadow-md`
- lg: `shadow-lg`
- xl: `shadow-xl`

### Border Radius
- sm: 6px
- md: 8px
- lg: 12px
- xl: 16px
- full: 9999px

## ⚡ Performance Tips

```tsx
// Memoize components
const MemoizedComponent = memo(Component);

// Lazy load
const Component = dynamic(() => import('./Component'), {
  loading: () => <LoadingSkeleton variant="card" />
});

// Debounce
const debouncedSearch = debounce(search, 300);

// Virtualize long lists
import { FixedSizeList } from 'react-window';
```

## 🐛 Common Issues

### Modal not closing
```tsx
// Add click outside handler
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

### Dark mode flickering
```tsx
// Add script to root layout
<script dangerouslySetInnerHTML={{
  __html: `
    (function() {
      const darkMode = localStorage.getItem('darkMode') === 'true';
      if (darkMode) {
        document.documentElement.classList.add('dark');
      }
    })();
  `
}} />
```

### Shimmer not animating
```tsx
// Ensure globals.css is imported
import './globals.css';
```

---

**Quick access to everything you need!** 🚀

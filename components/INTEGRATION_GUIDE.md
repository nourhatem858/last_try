# Integration Guide - Toolbar & Sidebar

## Quick Start

### Step 1: Import Components

```tsx
import Toolbar from '@/components/Toolbar';
import Sidebar from '@/components/Sidebar';
```

### Step 2: Add to Your Layout

```tsx
'use client';

import { useState } from 'react';
import Toolbar from '@/components/Toolbar';
import Sidebar from '@/components/Sidebar';

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className={darkMode ? 'dark' : ''}>
      <Toolbar
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        onSearch={(query) => console.log('Search:', query)}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
      />
      
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        darkMode={darkMode}
      />
      
      <main className={`pt-16 transition-all ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
        {children}
      </main>
    </div>
  );
}
```

## Advanced Integration

### 1. Persistent Dark Mode

```tsx
'use client';

import { useState, useEffect } from 'react';

export default function Layout({ children }) {
  const [darkMode, setDarkMode] = useState(false);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('darkMode') === 'true';
    setDarkMode(saved);
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('darkMode', darkMode.toString());
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  return (
    // ... rest of layout
  );
}
```

### 2. API-Powered Search

```tsx
const handleSearch = async (query: string) => {
  try {
    const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    const results = await response.json();
    
    // Navigate to results or update state
    router.push(`/search?q=${query}`);
  } catch (error) {
    console.error('Search failed:', error);
  }
};
```

### 3. Real-time Notifications

```tsx
import { useState, useEffect } from 'react';

export default function Layout({ children }) {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // WebSocket connection
    const ws = new WebSocket('ws://your-server/notifications');
    
    ws.onmessage = (event) => {
      const notification = JSON.parse(event.data);
      setNotifications(prev => [notification, ...prev]);
    };

    // Polling fallback
    const interval = setInterval(async () => {
      const response = await fetch('/api/notifications');
      const data = await response.json();
      setNotifications(data);
    }, 30000); // Every 30 seconds

    return () => {
      ws.close();
      clearInterval(interval);
    };
  }, []);

  return (
    // Pass notifications to Toolbar
    <Toolbar notifications={notifications} />
  );
}
```

### 4. Custom Navigation Items

```tsx
// In Sidebar.tsx, modify navItems:

const navItems: NavItem[] = [
  { 
    name: 'Dashboard', 
    href: '/dashboard', 
    icon: HomeIcon 
  },
  { 
    name: 'Topics', 
    href: '/topics', 
    icon: TagIcon,
    badge: topicCount, // Dynamic badge
    children: categories.map(cat => ({
      name: cat.name,
      href: `/topics/${cat.slug}`,
      icon: FolderIcon
    }))
  },
  { 
    name: 'Favorites', 
    href: '/favorites', 
    icon: BookmarkIcon,
    badge: favoriteCount
  },
];
```

### 5. Protected Routes

```tsx
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function Layout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Toolbar user={user} />
    // ... rest of layout
  );
}
```

### 6. Responsive Sidebar State

```tsx
import { useState, useEffect } from 'react';

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Auto-close on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    // ... layout
  );
}
```

## API Endpoints

### Search Endpoint

```typescript
// app/api/search/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ error: 'Query required' }, { status: 400 });
  }

  // Search your database
  const results = await searchDatabase(query);

  return NextResponse.json({
    suggestions: results.map(r => ({
      id: r.id,
      title: r.title,
      type: r.type
    }))
  });
}
```

### Notifications Endpoint

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

export async function PATCH(request: NextRequest) {
  const { notificationId } = await request.json();
  
  await markNotificationAsRead(notificationId);
  
  return NextResponse.json({ success: true });
}
```

## Styling Customization

### Custom Colors

```tsx
// In your component or tailwind.config.js

// Tailwind config
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          500: '#06b6d4', // cyan
          600: '#0891b2',
        },
        secondary: {
          500: '#3b82f6', // blue
          600: '#2563eb',
        }
      }
    }
  }
}
```

### Custom Animations

```css
/* In globals.css */

@keyframes custom-slide {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
}

.custom-slide {
  animation: custom-slide 0.3s ease-out;
}
```

## Testing

### Unit Tests

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import Toolbar from '@/components/Toolbar';

describe('Toolbar', () => {
  it('renders search input', () => {
    render(
      <Toolbar 
        onMenuClick={() => {}} 
        onSearch={() => {}} 
      />
    );
    
    const searchInput = screen.getByPlaceholderText(/search/i);
    expect(searchInput).toBeInTheDocument();
  });

  it('calls onSearch when form is submitted', () => {
    const handleSearch = jest.fn();
    render(
      <Toolbar 
        onMenuClick={() => {}} 
        onSearch={handleSearch} 
      />
    );
    
    const searchInput = screen.getByPlaceholderText(/search/i);
    fireEvent.change(searchInput, { target: { value: 'test query' } });
    fireEvent.submit(searchInput.closest('form'));
    
    expect(handleSearch).toHaveBeenCalledWith('test query');
  });
});
```

## Performance Optimization

### Memoization

```tsx
import { memo, useCallback } from 'react';

const Toolbar = memo(({ onMenuClick, onSearch, darkMode }) => {
  const handleSearch = useCallback((query: string) => {
    onSearch(query);
  }, [onSearch]);

  return (
    // ... component
  );
});
```

### Lazy Loading

```tsx
import dynamic from 'next/dynamic';

const Sidebar = dynamic(() => import('@/components/Sidebar'), {
  loading: () => <div>Loading...</div>,
  ssr: false
});
```

## Troubleshooting

### Issue: Sidebar overlaps content on mobile
**Solution**: Ensure main content has proper margin/padding

```tsx
<main className="pt-16 lg:ml-64">
  {children}
</main>
```

### Issue: Dark mode flickers on page load
**Solution**: Use a script in your root layout

```tsx
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html>
      <head>
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
      </head>
      <body>{children}</body>
    </html>
  );
}
```

### Issue: Search suggestions not closing
**Solution**: Ensure click-outside detection is working

```tsx
useEffect(() => {
  function handleClickOutside(event: MouseEvent) {
    if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
      setShowSuggestions(false);
    }
  }
  document.addEventListener('mousedown', handleClickOutside);
  return () => document.removeEventListener('mousedown', handleClickOutside);
}, []);
```

## Best Practices

1. **State Management**: Use Context API or Zustand for global state
2. **Error Handling**: Always wrap API calls in try-catch
3. **Loading States**: Show skeletons while data loads
4. **Accessibility**: Test with keyboard navigation
5. **Performance**: Debounce search input
6. **Security**: Validate and sanitize all user input
7. **Mobile First**: Design for mobile, enhance for desktop

## Resources

- [Heroicons](https://heroicons.com/) - Icon library
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Next.js Docs](https://nextjs.org/docs) - Framework
- [React Hooks](https://react.dev/reference/react) - State management

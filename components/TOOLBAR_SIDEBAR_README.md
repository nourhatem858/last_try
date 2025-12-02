# Toolbar & Sidebar Components Documentation

## Overview
Modern, fully functional Toolbar and Sidebar components for the Adaptive AI Knowledge Workspace built with React, Next.js, and Tailwind CSS.

## Features

### 🎨 Toolbar Features
- **Live Search with Suggestions**: Dynamic search suggestions appear as you type
- **Smart Notifications**: Badge count with dropdown showing unread notifications
- **User Profile Menu**: Dropdown with Profile, Settings, and Logout options
- **Dark Mode Toggle**: Seamless theme switching
- **Responsive Design**: Mobile-friendly with hamburger menu
- **Smooth Animations**: Fade-in, slide-in effects for dropdowns
- **Hover Effects**: Interactive icons with scale transforms
- **Click-outside Detection**: Auto-close dropdowns when clicking outside

### 🎯 Sidebar Features
- **Collapsible Navigation**: Smooth slide animation for expand/collapse
- **Active Link Highlighting**: Cyan/blue gradient for active routes
- **Nested Submenus**: Expandable categories with children
- **Badge Counts**: Display notification counts on nav items
- **Responsive**: Collapses to hamburger menu on mobile
- **Dark Mode Support**: Adapts to light/dark themes
- **Smooth Transitions**: All interactions are animated
- **Active Indicators**: Visual bar on the left of active items

## Usage

### Basic Implementation

```tsx
'use client';

import { useState } from 'react';
import Toolbar from '@/components/Toolbar';
import Sidebar from '@/components/Sidebar';

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const handleSearch = (query: string) => {
    console.log('Searching for:', query);
    // Implement your search logic here
  };

  return (
    <div className={darkMode ? 'dark' : ''}>
      <Toolbar
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        onSearch={handleSearch}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
      />
      
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        darkMode={darkMode}
      />
      
      <main className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
        {children}
      </main>
    </div>
  );
}
```

## Props

### Toolbar Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `onMenuClick` | `() => void` | Yes | - | Callback when hamburger menu is clicked |
| `onSearch` | `(query: string) => void` | Yes | - | Callback when search is submitted |
| `darkMode` | `boolean` | No | `false` | Enable dark mode styling |
| `onToggleDarkMode` | `() => void` | No | - | Callback to toggle dark mode |

### Sidebar Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `isOpen` | `boolean` | Yes | - | Controls sidebar visibility |
| `onToggle` | `() => void` | Yes | - | Callback to toggle sidebar |
| `darkMode` | `boolean` | No | `false` | Enable dark mode styling |

## Customization

### Adding Navigation Items

Edit the `navItems` array in `Sidebar.tsx`:

```tsx
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
    badge: 5, // Optional badge count
    children: [ // Optional nested items
      { name: 'Machine Learning', href: '/topics/ml', icon: AcademicCapIcon },
      { name: 'Web Development', href: '/topics/web', icon: DocumentTextIcon },
    ]
  },
];
```

### Customizing Search Suggestions

Modify the search effect in `Toolbar.tsx`:

```tsx
useEffect(() => {
  if (searchQuery.length > 1) {
    const timer = setTimeout(async () => {
      // Replace with your API call
      const results = await fetch(`/api/search?q=${searchQuery}`);
      const data = await results.json();
      setSuggestions(data);
      setShowSuggestions(true);
    }, 300);
    return () => clearTimeout(timer);
  }
}, [searchQuery]);
```

### Customizing Notifications

Update the notifications state in `Toolbar.tsx`:

```tsx
// Fetch from API
useEffect(() => {
  const fetchNotifications = async () => {
    const response = await fetch('/api/notifications');
    const data = await response.json();
    setNotifications(data);
  };
  fetchNotifications();
}, []);
```

## Styling

### Color Scheme
- **Primary**: Cyan (`#06b6d4`) to Blue (`#3b82f6`) gradient
- **Background (Light)**: White (`#ffffff`)
- **Background (Dark)**: Gray-900 (`#111827`)
- **Text (Light)**: Black/Gray-900
- **Text (Dark)**: White/Gray-100
- **Accents**: Cyan-500, Blue-500

### Responsive Breakpoints
- **Mobile**: < 1024px (sidebar collapses to overlay)
- **Desktop**: ≥ 1024px (sidebar always visible)

## Animations

All animations are defined in `app/globals.css`:

- `fade-in`: Opacity and slight vertical movement
- `slide-in-from-top-2`: Dropdown animations
- `slide-in-from-left`: Sidebar text animations
- `slide-in-from-bottom`: Footer animations
- `animate-pulse`: Notification badge pulse

## Integration with Backend

### Search API
```typescript
// pages/api/search.ts
export default async function handler(req, res) {
  const { q } = req.query;
  const results = await searchDatabase(q);
  res.json(results);
}
```

### Notifications API
```typescript
// pages/api/notifications.ts
export default async function handler(req, res) {
  const notifications = await getNotifications(req.user.id);
  res.json(notifications);
}
```

### Real-time Updates (WebSocket)
```typescript
// In your component
useEffect(() => {
  const ws = new WebSocket('ws://your-server/notifications');
  
  ws.onmessage = (event) => {
    const notification = JSON.parse(event.data);
    setNotifications(prev => [notification, ...prev]);
  };
  
  return () => ws.close();
}, []);
```

## Accessibility

- All interactive elements have `aria-label` attributes
- Keyboard navigation supported
- Focus states clearly visible
- Color contrast meets WCAG AA standards
- Screen reader friendly

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

## Performance

- Components use React hooks efficiently
- Debounced search (300ms delay)
- Click-outside detection with cleanup
- Optimized re-renders with proper state management

## Future Enhancements

- [ ] Drag-and-drop reordering of sidebar links
- [ ] Keyboard shortcuts for navigation
- [ ] Search history
- [ ] Notification grouping
- [ ] Custom themes beyond dark/light
- [ ] Sidebar width customization
- [ ] Pin/unpin sidebar state persistence

## Troubleshooting

### Sidebar not showing on mobile
Ensure the z-index is higher than other components and the overlay is rendering.

### Search suggestions not appearing
Check that the `searchQuery` length is > 1 and the API is returning data.

### Dark mode not working
Verify that the `darkMode` prop is being passed and the parent has the `dark` class.

## License

MIT

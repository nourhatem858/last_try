# Profile & Settings Pages Documentation

## Overview
Modern, interactive Profile and Settings pages for the Adaptive AI Knowledge Workspace built with React, Next.js, and Tailwind CSS.

## Features

### 🎨 Profile Page Features
- **User Information Display**: Name, email, role, and bio
- **Avatar Upload**: Click camera icon to upload profile picture with preview
- **Activity Summary**: Recent viewed cards, bookmarks, and likes
- **Stats Dashboard**: Visual cards showing activity metrics
- **Favorite Topics**: Display and manage favorite topics with badges
- **Edit Profile Modal**: Smooth modal animation for updating profile
- **Responsive Design**: Mobile-friendly layout
- **Dark Mode Support**: Full dark mode compatibility

### ⚙️ Settings Page Features
- **Theme Switcher**: Light, Dark, and Auto modes
- **Accent Color Picker**: Choose from 6 preset colors
- **Notification Preferences**: Toggle email, push, weekly, and mention notifications
- **Privacy Controls**: Manage profile and activity visibility
- **Language Selection**: Multi-language support
- **Save Confirmation**: Visual feedback on save with success message
- **Smooth Animations**: Toggle switches with fluid transitions
- **Persistent Settings**: Saves to localStorage

## File Structure

```
app/
├── profile/
│   └── page.tsx              # Profile page
└── settings/
    └── page.tsx              # Settings page

components/
├── ProfileEditModal.tsx      # Edit profile modal
├── ActivityCard.tsx          # Activity item display
├── ToggleSwitch.tsx          # Animated toggle switch
└── ColorPicker.tsx           # Color selection component
```

## Usage

### Profile Page

```tsx
import ProfilePage from '@/app/profile/page';

// The page is self-contained and ready to use
// Navigate to /profile in your app
```

### Settings Page

```tsx
import SettingsPage from '@/app/settings/page';

// Navigate to /settings in your app
```

## Component APIs

### ProfileEditModal

```tsx
interface ProfileEditModalProps {
  profile: {
    name: string;
    bio?: string;
    favoriteTopics: string[];
  };
  onClose: () => void;
  onSave: (profile: any) => void;
}

<ProfileEditModal
  profile={userProfile}
  onClose={() => setShowModal(false)}
  onSave={(updated) => handleSave(updated)}
/>
```

### ActivityCard

```tsx
interface ActivityCardProps {
  activity: {
    id: string;
    title: string;
    type: 'viewed' | 'bookmarked' | 'liked';
    timestamp: string;
    category?: string;
  };
}

<ActivityCard activity={activityItem} />
```

### ToggleSwitch

```tsx
interface ToggleSwitchProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

<ToggleSwitch
  label="Email Notifications"
  description="Receive updates via email"
  checked={emailEnabled}
  onChange={(checked) => setEmailEnabled(checked)}
/>
```

### ColorPicker

```tsx
interface ColorPickerProps {
  colors: Array<{ name: string; value: string }>;
  selected: string;
  onChange: (color: string) => void;
}

<ColorPicker
  colors={accentColors}
  selected={currentColor}
  onChange={(color) => setColor(color)}
/>
```

## Integration with Backend

### Fetch User Profile

```typescript
// app/api/profile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

export async function GET(request: NextRequest) {
  const session = await getServerSession();
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const profile = await getUserProfile(session.user.id);
  return NextResponse.json(profile);
}

export async function PATCH(request: NextRequest) {
  const session = await getServerSession();
  const updates = await request.json();
  
  await updateUserProfile(session.user.id, updates);
  return NextResponse.json({ success: true });
}
```

### Fetch User Activity

```typescript
// app/api/activity/route.ts
export async function GET(request: NextRequest) {
  const session = await getServerSession();
  const activities = await getUserActivities(session.user.id);
  return NextResponse.json(activities);
}
```

### Save Settings

```typescript
// app/api/settings/route.ts
export async function POST(request: NextRequest) {
  const session = await getServerSession();
  const settings = await request.json();
  
  await saveUserSettings(session.user.id, settings);
  return NextResponse.json({ success: true });
}
```

## Customization

### Adding New Activity Types

```tsx
// In ActivityCard.tsx, extend the type union
type ActivityType = 'viewed' | 'bookmarked' | 'liked' | 'shared' | 'commented';

// Add corresponding icon and color
const getIcon = () => {
  switch (activity.type) {
    case 'shared':
      return <ShareIcon className="w-5 h-5" />;
    case 'commented':
      return <ChatBubbleIcon className="w-5 h-5" />;
    // ... existing cases
  }
};
```

### Adding More Accent Colors

```tsx
// In settings/page.tsx
const accentColors = [
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Violet', value: '#8b5cf6' },
  // Add more colors
];
```

### Custom Theme Options

```tsx
// Extend theme options
const themeOptions = [
  { value: 'light', label: 'Light', icon: SunIcon },
  { value: 'dark', label: 'Dark', icon: MoonIcon },
  { value: 'auto', label: 'Auto', icon: ComputerDesktopIcon },
  { value: 'sepia', label: 'Sepia', icon: BookOpenIcon },
];
```

## Advanced Features

### Profile Picture Upload with Compression

```tsx
const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  // Compress image
  const compressed = await compressImage(file, {
    maxWidth: 400,
    maxHeight: 400,
    quality: 0.8
  });

  // Upload to server
  const formData = new FormData();
  formData.append('avatar', compressed);
  
  const response = await fetch('/api/upload/avatar', {
    method: 'POST',
    body: formData
  });
  
  const { url } = await response.json();
  setProfile(prev => ({ ...prev, avatar: url }));
};
```

### Drag-and-Drop Topic Reordering

```tsx
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, arrayMove } from '@dnd-kit/sortable';

const handleDragEnd = (event) => {
  const { active, over } = event;
  
  if (active.id !== over.id) {
    setFormData(prev => {
      const oldIndex = prev.favoriteTopics.indexOf(active.id);
      const newIndex = prev.favoriteTopics.indexOf(over.id);
      return {
        ...prev,
        favoriteTopics: arrayMove(prev.favoriteTopics, oldIndex, newIndex)
      };
    });
  }
};
```

### Real-time Settings Sync

```tsx
import { useEffect } from 'react';

useEffect(() => {
  const ws = new WebSocket('ws://your-server/settings');
  
  ws.onmessage = (event) => {
    const updatedSettings = JSON.parse(event.data);
    setSettings(updatedSettings);
  };
  
  return () => ws.close();
}, []);
```

## Styling

### Color Scheme
- **Primary Gradient**: Cyan (#06b6d4) to Blue (#3b82f6)
- **Secondary Gradient**: Purple (#8b5cf6) to Pink (#ec4899)
- **Success**: Green (#10b981)
- **Warning**: Orange (#f59e0b)
- **Error**: Red (#ef4444)

### Animations
- Modal: `fade-in` + `zoom-in-95` + `slide-in-from-bottom-4`
- Toggle Switch: 200ms ease-in-out transition
- Hover Effects: `scale-105` transform
- Save Button: Pulse animation when saving

## Accessibility

- All interactive elements have proper ARIA labels
- Toggle switches use `role="switch"` and `aria-checked`
- Keyboard navigation fully supported
- Focus states clearly visible
- Color contrast meets WCAG AA standards
- Screen reader friendly descriptions

## Performance Optimization

### Lazy Loading

```tsx
import dynamic from 'next/dynamic';

const ProfileEditModal = dynamic(() => import('@/components/ProfileEditModal'), {
  loading: () => <LoadingSpinner />,
  ssr: false
});
```

### Memoization

```tsx
import { memo, useMemo } from 'react';

const ActivityCard = memo(({ activity }) => {
  // Component implementation
});

const sortedActivities = useMemo(() => {
  return activities.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}, [activities]);
```

## Testing

### Unit Tests

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import ToggleSwitch from '@/components/ToggleSwitch';

describe('ToggleSwitch', () => {
  it('toggles on click', () => {
    const handleChange = jest.fn();
    render(
      <ToggleSwitch
        label="Test"
        checked={false}
        onChange={handleChange}
      />
    );
    
    const toggle = screen.getByRole('switch');
    fireEvent.click(toggle);
    
    expect(handleChange).toHaveBeenCalledWith(true);
  });
});
```

## Troubleshooting

### Issue: Modal not closing on backdrop click
**Solution**: Ensure the backdrop div has the onClick handler

```tsx
<div 
  className="absolute inset-0 bg-black/50"
  onClick={onClose}
/>
```

### Issue: Settings not persisting
**Solution**: Check localStorage is available and working

```tsx
useEffect(() => {
  try {
    const saved = localStorage.getItem('userSettings');
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  } catch (error) {
    console.error('Failed to load settings:', error);
  }
}, []);
```

### Issue: Avatar upload not working
**Solution**: Verify file input accepts correct formats

```tsx
<input 
  type="file" 
  accept="image/jpeg,image/png,image/webp" 
  onChange={handleAvatarUpload}
/>
```

## Best Practices

1. **State Management**: Use Context API for global user state
2. **Error Handling**: Always wrap API calls in try-catch
3. **Loading States**: Show skeletons while data loads
4. **Validation**: Validate form inputs before submission
5. **Security**: Sanitize user inputs, validate file uploads
6. **Performance**: Debounce auto-save functionality
7. **UX**: Provide clear feedback for all actions

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

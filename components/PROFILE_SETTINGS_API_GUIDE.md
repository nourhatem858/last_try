# Profile & Settings API Integration Guide

## Overview
This guide shows how to integrate the Profile and Settings pages with your backend API.

## API Endpoints

### Profile Endpoints

#### GET /api/profile
Fetch user profile data

**Response:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "role": "User",
  "avatar": "https://example.com/avatar.jpg",
  "theme": "light",
  "favoriteTopics": ["Machine Learning", "Web Development"],
  "bio": "Passionate about AI"
}
```

#### PATCH /api/profile
Update user profile

**Request:**
```json
{
  "name": "Jane Doe",
  "bio": "Updated bio",
  "favoriteTopics": ["AI", "Data Science"]
}
```

**Response:**
```json
{
  "success": true,
  "profile": { /* updated profile */ }
}
```

#### POST /api/upload/avatar
Upload profile picture

**Request:** FormData with 'avatar' file

**Response:**
```json
{
  "success": true,
  "url": "https://example.com/avatars/user123.jpg"
}
```

### Activity Endpoints

#### GET /api/activity
Fetch user activity

**Query Parameters:**
- `limit`: Number of items (default: 20)
- `type`: Filter by type (viewed, bookmarked, liked)

**Response:**
```json
{
  "activities": [
    {
      "id": "1",
      "title": "Neural Networks Fundamentals",
      "type": "viewed",
      "timestamp": "2024-01-15T10:30:00Z",
      "category": "Machine Learning"
    }
  ],
  "total": 234
}
```

### Settings Endpoints

#### GET /api/settings
Fetch user settings

**Response:**
```json
{
  "theme": "dark",
  "accentColor": "#06b6d4",
  "notifications": {
    "email": true,
    "push": true,
    "weekly": false,
    "mentions": true
  },
  "privacy": {
    "profileVisible": true,
    "activityVisible": false
  },
  "language": "en"
}
```

#### POST /api/settings
Save user settings

**Request:**
```json
{
  "theme": "dark",
  "accentColor": "#3b82f6",
  "notifications": { /* ... */ }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Settings saved successfully"
}
```

## Implementation Examples

### Profile Page with API Integration

```tsx
'use client';

import { useState, useEffect } from 'react';
import ProfileEditModal from '@/components/ProfileEditModal';

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch profile on mount
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile');
      if (!response.ok) throw new Error('Failed to fetch profile');
      const data = await response.json();
      setProfile(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (updates) => {
    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      
      if (!response.ok) throw new Error('Failed to update profile');
      
      const data = await response.json();
      setProfile(data.profile);
      
      // Show success message
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error('Failed to update profile');
    }
  };

  const handleAvatarUpload = async (file) => {
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const response = await fetch('/api/upload/avatar', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) throw new Error('Upload failed');
      
      const { url } = await response.json();
      setProfile(prev => ({ ...prev, avatar: url }));
      
      toast.success('Avatar updated!');
    } catch (err) {
      toast.error('Failed to upload avatar');
    }
  };

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorMessage message={error} />;

  return (
    // ... profile page JSX
  );
}
```

### Settings Page with API Integration

```tsx
'use client';

import { useState, useEffect } from 'react';

export default function SettingsPage() {
  const [settings, setSettings] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      const data = await response.json();
      setSettings(data);
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      
      if (!response.ok) throw new Error('Failed to save');
      
      // Apply settings immediately
      applySettings(settings);
      
      toast.success('Settings saved!');
    } catch (err) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const applySettings = (settings) => {
    // Apply theme
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Apply accent color
    document.documentElement.style.setProperty('--accent-color', settings.accentColor);
    
    // Save to localStorage
    localStorage.setItem('userSettings', JSON.stringify(settings));
  };

  return (
    // ... settings page JSX
  );
}
```

### Activity Fetching with Pagination

```tsx
const [activities, setActivities] = useState([]);
const [page, setPage] = useState(1);
const [hasMore, setHasMore] = useState(true);

const fetchActivities = async (pageNum = 1) => {
  try {
    const response = await fetch(`/api/activity?page=${pageNum}&limit=20`);
    const data = await response.json();
    
    if (pageNum === 1) {
      setActivities(data.activities);
    } else {
      setActivities(prev => [...prev, ...data.activities]);
    }
    
    setHasMore(data.activities.length === 20);
  } catch (err) {
    console.error('Failed to fetch activities:', err);
  }
};

const loadMore = () => {
  const nextPage = page + 1;
  setPage(nextPage);
  fetchActivities(nextPage);
};
```

## Backend Implementation (Next.js API Routes)

### Profile API Route

```typescript
// app/api/profile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const session = await getServerSession();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const profile = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        name: true,
        email: true,
        role: true,
        avatar: true,
        bio: true,
        favoriteTopics: true,
        theme: true
      }
    });

    return NextResponse.json(profile);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const session = await getServerSession();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const updates = await request.json();
    
    // Validate updates
    const allowedFields = ['name', 'bio', 'favoriteTopics', 'theme'];
    const filteredUpdates = Object.keys(updates)
      .filter(key => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = updates[key];
        return obj;
      }, {});

    const profile = await prisma.user.update({
      where: { id: session.user.id },
      data: filteredUpdates
    });

    return NextResponse.json({ success: true, profile });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
```

### Avatar Upload API Route

```typescript
// app/api/upload/avatar/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import sharp from 'sharp';

export async function POST(request: NextRequest) {
  const session = await getServerSession();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('avatar') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    // Convert to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Resize and optimize with sharp
    const optimized = await sharp(buffer)
      .resize(400, 400, { fit: 'cover' })
      .jpeg({ quality: 80 })
      .toBuffer();

    // Save to file system or cloud storage
    const filename = `${session.user.id}-${Date.now()}.jpg`;
    const filepath = join(process.cwd(), 'public', 'avatars', filename);
    await writeFile(filepath, optimized);

    const url = `/avatars/${filename}`;

    // Update user record
    await prisma.user.update({
      where: { id: session.user.id },
      data: { avatar: url }
    });

    return NextResponse.json({ success: true, url });
  } catch (error) {
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
}
```

### Activity API Route

```typescript
// app/api/activity/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const session = await getServerSession();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const type = searchParams.get('type');

  try {
    const where = {
      userId: session.user.id,
      ...(type && { type })
    };

    const [activities, total] = await Promise.all([
      prisma.activity.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          card: {
            select: {
              title: true,
              category: true
            }
          }
        }
      }),
      prisma.activity.count({ where })
    ]);

    const formatted = activities.map(activity => ({
      id: activity.id,
      title: activity.card.title,
      type: activity.type,
      timestamp: formatTimestamp(activity.createdAt),
      category: activity.card.category
    }));

    return NextResponse.json({
      activities: formatted,
      total,
      page,
      hasMore: page * limit < total
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch activities' },
      { status: 500 }
    );
  }
}

function formatTimestamp(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours} hours ago`;
  
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} days ago`;
  
  return date.toLocaleDateString();
}
```

### Settings API Route

```typescript
// app/api/settings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const session = await getServerSession();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const settings = await prisma.userSettings.findUnique({
      where: { userId: session.user.id }
    });

    return NextResponse.json(settings || getDefaultSettings());
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const settings = await request.json();

    await prisma.userSettings.upsert({
      where: { userId: session.user.id },
      update: settings,
      create: {
        userId: session.user.id,
        ...settings
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to save settings' },
      { status: 500 }
    );
  }
}

function getDefaultSettings() {
  return {
    theme: 'light',
    accentColor: '#06b6d4',
    notifications: {
      email: true,
      push: true,
      weekly: false,
      mentions: true
    },
    privacy: {
      profileVisible: true,
      activityVisible: false
    },
    language: 'en'
  };
}
```

## Error Handling

### Client-Side Error Handling

```tsx
const handleApiCall = async (apiFunction) => {
  try {
    await apiFunction();
  } catch (error) {
    if (error.response?.status === 401) {
      // Redirect to login
      router.push('/login');
    } else if (error.response?.status === 403) {
      toast.error('You don\'t have permission to do that');
    } else if (error.response?.status === 500) {
      toast.error('Server error. Please try again later');
    } else {
      toast.error('Something went wrong');
    }
  }
};
```

## Security Best Practices

1. **Authentication**: Always verify user session
2. **Authorization**: Check user permissions
3. **Validation**: Validate all inputs
4. **Sanitization**: Sanitize user data
5. **Rate Limiting**: Implement rate limits
6. **File Upload**: Validate file types and sizes
7. **CSRF Protection**: Use CSRF tokens

## Testing

### API Testing with Jest

```typescript
import { GET, PATCH } from '@/app/api/profile/route';

describe('Profile API', () => {
  it('returns profile for authenticated user', async () => {
    const request = new NextRequest('http://localhost/api/profile');
    const response = await GET(request);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data).toHaveProperty('name');
  });

  it('returns 401 for unauthenticated user', async () => {
    // Mock unauthenticated session
    const request = new NextRequest('http://localhost/api/profile');
    const response = await GET(request);
    
    expect(response.status).toBe(401);
  });
});
```

## Performance Optimization

1. **Caching**: Cache profile data with SWR or React Query
2. **Debouncing**: Debounce auto-save in settings
3. **Lazy Loading**: Lazy load activity items
4. **Image Optimization**: Use Next.js Image component
5. **Code Splitting**: Split large components

## Resources

- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js](https://next-auth.js.org/)
- [Sharp Image Processing](https://sharp.pixelplumbing.com/)

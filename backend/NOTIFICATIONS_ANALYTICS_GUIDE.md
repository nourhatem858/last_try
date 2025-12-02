# Notifications & Analytics System - Complete Guide

## Overview
Complete backend system for managing user notifications and analytics logging in the Adaptive AI Knowledge Workspace. Includes real-time notifications, comprehensive analytics tracking, and AI-ready data aggregation.

## Features Implemented

### Notifications System
✅ **Core Features:**
- Get user notifications with pagination
- Filter by read/unread status
- Mark single notification as read
- Mark all notifications as read
- Delete single notification
- Delete all read notifications
- Auto-delete old read notifications (30 days TTL)

✅ **Notification Types:**
- `info` - General information
- `success` - Success messages
- `warning` - Warning messages
- `error` - Error messages
- `system` - System notifications
- `like` - Card liked notifications
- `bookmark` - Card bookmarked notifications
- `comment` - Comment notifications (future)

✅ **Auto Notifications:**
- Notify card author when someone likes their card
- Notify card author when someone bookmarks their card
- System notifications for important events

### Analytics System
✅ **Core Features:**
- Create analytics logs for user actions
- Get user's analytics logs with filtering
- Get user analytics summary
- Get global analytics (admin only)
- Auto-delete old logs (1 year TTL)

✅ **Action Types Tracked:**
- `view` - Card viewed
- `like` - Card liked
- `bookmark` - Card bookmarked
- `search` - Search performed
- `create` - Card created
- `update` - Card updated
- `delete` - Card deleted
- `share` - Card shared
- `login` - User logged in
- `signup` - User signed up

✅ **Analytics Features:**
- Actions by type aggregation
- Most viewed cards
- Most active users
- Popular cards analysis
- Date range filtering
- Metadata support (duration, device, IP, user agent)

## Database Schemas

### Notification Schema
```javascript
{
  _id: ObjectId,                    // Primary Key
  user_id: ObjectId,                // Reference to Users
  message: String,                  // Notification message
  type: String,                     // Type of notification
  related_card_id: ObjectId,        // Optional card reference
  related_user_id: ObjectId,        // Optional user reference
  read: Boolean,                    // Read status
  created_at: Date                  // Timestamp
}
```

**Indexes:**
- `{ user_id: 1, read: 1, created_at: -1 }` - Compound index
- `{ user_id: 1, created_at: -1 }` - User's notifications
- TTL index on `created_at` (30 days for read notifications)

### AnalyticsLog Schema
```javascript
{
  _id: ObjectId,                    // Primary Key
  user_id: ObjectId,                // Reference to Users
  action_type: String,              // Type of action
  card_id: ObjectId,                // Optional card reference
  metadata: {
    search_query: String,
    duration_seconds: Number,
    device_type: String,
    ip_address: String,
    user_agent: String
  },
  timestamp: Date                   // Timestamp
}
```

**Indexes:**
- `{ user_id: 1, action_type: 1, timestamp: -1 }` - User actions
- `{ card_id: 1, action_type: 1, timestamp: -1 }` - Card analytics
- `{ action_type: 1, timestamp: -1 }` - Global analytics
- TTL index on `timestamp` (1 year)

## API Endpoints

### Notifications

#### 1. Get User Notifications
```
GET /api/notifications
```

**Query Parameters:**
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 20)
- `read` (optional) - Filter by read status (true/false)

**Response:**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "user_id": "507f1f77bcf86cd799439012",
        "message": "John Doe liked your card \"React Hooks\"",
        "type": "like",
        "related_card_id": {
          "_id": "507f1f77bcf86cd799439013",
          "title": "React Hooks",
          "category": "Web Development"
        },
        "read": false,
        "created_at": "2024-01-20T10:30:00.000Z"
      }
    ],
    "unread_count": 5,
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 25,
      "pages": 2
    }
  }
}
```

#### 2. Mark Notification as Read
```
PATCH /api/notifications/:id/read
```

#### 3. Mark All as Read
```
PATCH /api/notifications/read-all
```

**Response:**
```json
{
  "success": true,
  "message": "5 notifications marked as read",
  "data": {
    "modified_count": 5
  }
}
```

#### 4. Delete Notification
```
DELETE /api/notifications/:id
```

#### 5. Delete All Read Notifications
```
DELETE /api/notifications/read
```

### Analytics

#### 1. Create Analytics Log
```
POST /api/analytics/logs
```

**Request Body:**
```json
{
  "action_type": "view",
  "card_id": "507f1f77bcf86cd799439011",
  "metadata": {
    "duration_seconds": 120,
    "device_type": "desktop"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Analytics log created successfully",
  "data": {
    "log": {
      "_id": "507f1f77bcf86cd799439020",
      "user_id": "507f1f77bcf86cd799439012",
      "action_type": "view",
      "card_id": "507f1f77bcf86cd799439011",
      "metadata": {
        "duration_seconds": 120,
        "device_type": "desktop"
      },
      "timestamp": "2024-01-20T10:30:00.000Z"
    }
  }
}
```

#### 2. Get User Analytics Logs
```
GET /api/analytics/logs
```

**Query Parameters:**
- `page` (optional) - Page number
- `limit` (optional) - Items per page (default: 50)
- `action_type` (optional) - Filter by action type
- `start_date` (optional) - Start date (ISO 8601)
- `end_date` (optional) - End date (ISO 8601)

#### 3. Get User Analytics Summary
```
GET /api/analytics/summary?days=30
```

**Response:**
```json
{
  "success": true,
  "data": {
    "period_days": 30,
    "total_actions": 150,
    "actions_by_type": [
      { "_id": "view", "count": 80 },
      { "_id": "like", "count": 35 },
      { "_id": "bookmark", "count": 20 },
      { "_id": "search", "count": 15 }
    ],
    "most_viewed_cards": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "view_count": 25,
        "card": {
          "title": "React Hooks",
          "category": "Web Development"
        }
      }
    ]
  }
}
```

#### 4. Get Global Analytics (Admin Only)
```
GET /api/analytics/global?days=7
```

**Response:**
```json
{
  "success": true,
  "data": {
    "period_days": 7,
    "total_actions": 5000,
    "actions_by_type": [...],
    "most_active_users": [
      {
        "user_id": "507f1f77bcf86cd799439012",
        "action_count": 250,
        "user": {
          "name": "John Doe",
          "email": "john@example.com"
        }
      }
    ],
    "most_popular_cards": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "views": 500,
        "likes": 120,
        "bookmarks": 80,
        "total_interactions": 700,
        "card": {
          "title": "React Hooks",
          "category": "Web Development"
        }
      }
    ]
  }
}
```

## Usage Examples

### JavaScript/React Examples

#### Get Notifications
```javascript
const getNotifications = async (page = 1, unreadOnly = false) => {
  const params = new URLSearchParams({
    page,
    limit: 20,
    ...(unreadOnly && { read: 'false' })
  });

  const response = await fetch(
    `http://localhost:5000/api/notifications?${params}`,
    {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    }
  );
  return response.json();
};
```

#### Mark Notification as Read
```javascript
const markAsRead = async (notificationId) => {
  const response = await fetch(
    `http://localhost:5000/api/notifications/${notificationId}/read`,
    {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    }
  );
  return response.json();
};
```

#### Create Analytics Log
```javascript
const logAction = async (actionType, cardId = null, metadata = {}) => {
  const response = await fetch('http://localhost:5000/api/analytics/logs', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      action_type: actionType,
      card_id: cardId,
      metadata
    })
  });
  return response.json();
};

// Usage
await logAction('view', cardId, { duration_seconds: 120 });
```

#### Get Analytics Summary
```javascript
const getAnalyticsSummary = async (days = 30) => {
  const response = await fetch(
    `http://localhost:5000/api/analytics/summary?days=${days}`,
    {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    }
  );
  return response.json();
};
```

## Notification Helper Functions

The system includes helper functions for creating notifications:

```javascript
const { 
  notifyCardLiked,
  notifyCardBookmarked,
  notifySystem,
  notifySuccess,
  notifyWarning,
  notifyError
} = require('../utils/notificationHelper');

// Notify card author when liked
await notifyCardLiked(authorId, likerName, cardTitle, cardId);

// Notify card author when bookmarked
await notifyCardBookmarked(authorId, bookmarkerName, cardTitle, cardId);

// System notification
await notifySystem(userId, 'System maintenance scheduled');

// Success notification
await notifySuccess(userId, 'Profile updated successfully');
```

## Auto-Notifications

The system automatically creates notifications for:

1. **Card Liked** - When someone likes a user's card
2. **Card Bookmarked** - When someone bookmarks a user's card

These are triggered automatically in the interaction controllers.

## Analytics Integration

Analytics are automatically logged for:
- Card views (in `getCardById`)
- Likes (in `likeCard`)
- Bookmarks (in `bookmarkCard`)
- Card creation (in `createCard`)
- Card updates (in `updateCard`)
- Card deletion (in `deleteCard`)

## Performance Optimizations

1. **Indexes** - Compound indexes for fast queries
2. **TTL Indexes** - Auto-cleanup of old data
3. **Aggregation** - Efficient data summarization
4. **Pagination** - Limit data transfer
5. **Lean Queries** - Return plain objects

## Security

- All endpoints require JWT authentication
- Ownership validation for updates/deletes
- Admin-only routes for global analytics
- Input validation on all endpoints

## Future Enhancements

- [ ] Real-time notifications with WebSockets
- [ ] Push notifications (Firebase/OneSignal)
- [ ] Email notifications
- [ ] Notification preferences
- [ ] Advanced analytics dashboard
- [ ] Export analytics data
- [ ] Custom date range reports
- [ ] AI-driven notification recommendations

## License
MIT

# Bookmarks & Likes System - Complete Guide

## Overview
Complete backend system for managing user interactions (bookmarks and likes) with Knowledge Cards. Includes duplicate prevention, ownership validation, and analytics tracking.

## Features Implemented

✅ **Bookmark System**
- Add/remove bookmarks
- Prevent duplicate bookmarks
- Get user's bookmarked cards
- Delete by bookmark ID with ownership check
- Auto-increment/decrement bookmark count

✅ **Like System**
- Add/remove likes
- Prevent duplicate likes
- Get user's liked cards
- Delete by like ID with ownership check
- Auto-increment/decrement like count

✅ **Statistics & Analytics**
- Get card interaction stats
- Track user's interaction status (hasLiked, hasBookmarked)
- Real-time count updates
- Analytics logging for AI recommendations

✅ **Security & Validation**
- JWT authentication required
- Ownership validation for deletions
- Card existence validation
- Duplicate prevention
- Proper error handling

## Database Schema

### BookmarkLike Collection
```javascript
{
  _id: ObjectId,              // Primary Key
  user_id: ObjectId,          // Reference to Users
  card_id: ObjectId,          // Reference to KnowledgeCards
  type: String,               // 'bookmark' or 'like'
  created_at: Date            // Timestamp
}
```

### Indexes
- `{ user_id: 1, card_id: 1, type: 1 }` - Unique compound index (prevents duplicates)
- `{ card_id: 1, type: 1 }` - Fast card stats lookup
- `{ user_id: 1, type: 1, created_at: -1 }` - User's interactions sorted

## API Endpoints

### Option 1: RESTful Routes (Recommended)

#### Bookmarks
```
POST   /api/bookmarks              - Create bookmark
GET    /api/bookmarks              - Get user's bookmarks
DELETE /api/bookmarks/:id          - Delete bookmark by ID
```

#### Likes
```
POST   /api/likes                  - Create like
GET    /api/likes                  - Get user's likes
DELETE /api/likes/:id              - Delete like by ID
```

### Option 2: Interaction Routes (Alternative)

```
POST   /api/interactions/:id/bookmark       - Bookmark card
DELETE /api/interactions/:id/bookmark       - Remove bookmark
POST   /api/interactions/:id/like           - Like card
DELETE /api/interactions/:id/like           - Unlike card
GET    /api/interactions/bookmarks          - Get bookmarks
GET    /api/interactions/likes              - Get likes
DELETE /api/interactions/bookmarks/:id      - Delete bookmark by ID
DELETE /api/interactions/likes/:id          - Delete like by ID
GET    /api/interactions/stats/:id          - Get card stats
```

## Usage Examples

### 1. Create Bookmark (RESTful)
```bash
curl -X POST "http://localhost:5000/api/bookmarks" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"card_id": "507f1f77bcf86cd799439011"}'
```

**Response:**
```json
{
  "success": true,
  "message": "Card bookmarked successfully",
  "data": {
    "bookmark_count": 21
  }
}
```

### 2. Create Like (RESTful)
```bash
curl -X POST "http://localhost:5000/api/likes" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"card_id": "507f1f77bcf86cd799439011"}'
```

**Response:**
```json
{
  "success": true,
  "message": "Card liked successfully",
  "data": {
    "like_count": 46
  }
}
```

### 3. Get User's Bookmarks
```bash
curl -X GET "http://localhost:5000/api/bookmarks?page=1&limit=10" \
  -H "Authorization: Bearer <token>"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "cards": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "title": "Introduction to Machine Learning",
        "content": "Machine learning is...",
        "category": "AI & ML",
        "author_id": {
          "_id": "507f1f77bcf86cd799439012",
          "name": "John Doe",
          "email": "john@example.com"
        },
        "tags": ["machine-learning", "ai"],
        "view_count": 150,
        "like_count": 45,
        "bookmark_count": 20
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 5,
      "pages": 1
    }
  }
}
```

### 4. Get User's Likes
```bash
curl -X GET "http://localhost:5000/api/likes?page=1&limit=10" \
  -H "Authorization: Bearer <token>"
```

### 5. Delete Bookmark by ID
```bash
curl -X DELETE "http://localhost:5000/api/bookmarks/507f1f77bcf86cd799439020" \
  -H "Authorization: Bearer <token>"
```

**Response:**
```json
{
  "success": true,
  "message": "Bookmark deleted successfully"
}
```

### 6. Delete Like by ID
```bash
curl -X DELETE "http://localhost:5000/api/likes/507f1f77bcf86cd799439021" \
  -H "Authorization: Bearer <token>"
```

### 7. Get Card Statistics
```bash
curl -X GET "http://localhost:5000/api/interactions/stats/507f1f77bcf86cd799439011" \
  -H "Authorization: Bearer <token>"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "card_id": "507f1f77bcf86cd799439011",
    "like_count": 45,
    "bookmark_count": 20,
    "view_count": 150,
    "hasLiked": true,
    "hasBookmarked": false
  }
}
```

### 8. Bookmark Card (Alternative Route)
```bash
curl -X POST "http://localhost:5000/api/interactions/507f1f77bcf86cd799439011/bookmark" \
  -H "Authorization: Bearer <token>"
```

### 9. Like Card (Alternative Route)
```bash
curl -X POST "http://localhost:5000/api/interactions/507f1f77bcf86cd799439011/like" \
  -H "Authorization: Bearer <token>"
```

## JavaScript/React Examples

### Create Bookmark
```javascript
const bookmarkCard = async (cardId) => {
  const response = await fetch('http://localhost:5000/api/bookmarks', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ card_id: cardId })
  });
  return response.json();
};
```

### Like Card
```javascript
const likeCard = async (cardId) => {
  const response = await fetch('http://localhost:5000/api/likes', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ card_id: cardId })
  });
  return response.json();
};
```

### Get User's Bookmarks
```javascript
const getBookmarks = async (page = 1, limit = 10) => {
  const response = await fetch(
    `http://localhost:5000/api/bookmarks?page=${page}&limit=${limit}`,
    {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    }
  );
  return response.json();
};
```

### Delete Bookmark
```javascript
const deleteBookmark = async (bookmarkId) => {
  const response = await fetch(
    `http://localhost:5000/api/bookmarks/${bookmarkId}`,
    {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    }
  );
  return response.json();
};
```

### Get Card Stats
```javascript
const getCardStats = async (cardId) => {
  const response = await fetch(
    `http://localhost:5000/api/interactions/stats/${cardId}`,
    {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    }
  );
  return response.json();
};
```

## Error Responses

All errors follow this format:
```json
{
  "success": false,
  "message": "Error description",
  "code": "ERROR_CODE"
}
```

### Common Error Codes

- `CARD_NOT_FOUND` - Card doesn't exist
- `ALREADY_LIKED` - User already liked this card
- `ALREADY_BOOKMARKED` - User already bookmarked this card
- `NOT_LIKED` - User hasn't liked this card
- `NOT_BOOKMARKED` - User hasn't bookmarked this card
- `BOOKMARK_NOT_FOUND` - Bookmark ID doesn't exist
- `LIKE_NOT_FOUND` - Like ID doesn't exist
- `FORBIDDEN` - User doesn't own this interaction
- `NO_TOKEN` - Missing authentication token
- `INVALID_TOKEN` - Invalid or expired token
- `MISSING_CARD_ID` - card_id not provided in request body

## Features Breakdown

### 1. Duplicate Prevention
The unique compound index `{ user_id: 1, card_id: 1, type: 1 }` ensures:
- A user can only like a card once
- A user can only bookmark a card once
- Database-level constraint prevents race conditions

### 2. Ownership Validation
When deleting by ID:
- System checks if the interaction belongs to the requesting user
- Returns 403 Forbidden if user doesn't own the interaction
- Prevents unauthorized deletions

### 3. Auto Count Management
- Like count auto-increments when liked
- Like count auto-decrements when unliked
- Bookmark count auto-increments when bookmarked
- Bookmark count auto-decrements when unbookmarked
- Counts never go below 0

### 4. Analytics Integration
Every interaction is logged to AnalyticsLog:
- Action type: 'like', 'bookmark'
- User ID and Card ID
- Timestamp
- Used for AI recommendations

### 5. Pagination Support
Both bookmark and like lists support:
- Page number
- Items per page (limit)
- Total count
- Total pages calculation

## Database Optimization

### Indexes for Performance
1. **Unique Compound Index**: Prevents duplicates and speeds up lookups
2. **Card Type Index**: Fast counting of likes/bookmarks per card
3. **User Type Index**: Fast retrieval of user's interactions

### Query Optimization
- Uses `.lean()` for read-only operations
- Populates only necessary fields
- Efficient counting with `countDocuments()`
- Sorted by `created_at` descending

## Integration with AI Recommendations

The system tracks all interactions for AI:

```javascript
// Logged to AnalyticsLog
{
  user_id: ObjectId,
  action_type: 'like' | 'bookmark',
  card_id: ObjectId,
  timestamp: Date
}
```

This data powers:
- Personalized recommendations
- Collaborative filtering
- Trending cards algorithm
- User preference learning

## Best Practices

1. **Always check card existence** before creating interactions
2. **Use pagination** for listing bookmarks/likes
3. **Handle duplicate errors** gracefully in UI
4. **Show loading states** during API calls
5. **Update UI optimistically** for better UX
6. **Cache card stats** to reduce API calls
7. **Use WebSockets** for real-time updates (future enhancement)

## Testing Checklist

- [ ] Create bookmark successfully
- [ ] Prevent duplicate bookmarks
- [ ] Delete bookmark by ID
- [ ] Only owner can delete bookmark
- [ ] Create like successfully
- [ ] Prevent duplicate likes
- [ ] Delete like by ID
- [ ] Only owner can delete like
- [ ] Get user's bookmarks with pagination
- [ ] Get user's likes with pagination
- [ ] Get card stats (authenticated)
- [ ] Get card stats (unauthenticated)
- [ ] Counts update correctly
- [ ] Analytics logs created

## Future Enhancements

- [ ] Real-time notifications when card is liked/bookmarked
- [ ] Batch operations (bookmark/like multiple cards)
- [ ] Export bookmarks to file
- [ ] Share bookmarked collections
- [ ] Bookmark folders/categories
- [ ] Like reactions (different types)
- [ ] Activity feed of likes/bookmarks
- [ ] Email digest of bookmarked content

## License
MIT

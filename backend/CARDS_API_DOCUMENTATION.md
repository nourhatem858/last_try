# Knowledge Cards API Documentation

Complete API documentation for managing Knowledge Cards in the Adaptive AI Knowledge Workspace.

## Base URL
```
http://localhost:5000/api
```

## Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Knowledge Cards Endpoints

### 1. Get All Cards
Fetch all knowledge cards with filtering, search, and pagination.

**Endpoint:** `GET /api/cards`

**Access:** Public (with optional authentication for personalization)

**Query Parameters:**
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 10, max: 100)
- `category` (optional) - Filter by category
- `tag` (optional) - Filter by tag
- `author_id` (optional) - Filter by author ID
- `search` (optional) - Full-text search in title and content
- `sort` (optional) - Sort order: `newest`, `oldest`, `popular`, `trending`
- `visibility` (optional) - Filter by visibility: `public`, `private`, `shared`

**Example Request:**
```bash
curl -X GET "http://localhost:5000/api/cards?category=AI%20%26%20ML&limit=5&sort=popular"
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
        "author_id": {
          "_id": "507f1f77bcf86cd799439012",
          "name": "John Doe",
          "email": "john@example.com"
        },
        "tags": ["machine-learning", "ai"],
        "category": "AI & ML",
        "visibility": "public",
        "view_count": 150,
        "like_count": 45,
        "bookmark_count": 20,
        "created_at": "2024-01-15T10:30:00.000Z",
        "updated_at": "2024-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 5,
      "total": 25,
      "pages": 5
    }
  }
}
```

---

### 2. Get Single Card
Fetch a specific knowledge card by ID.

**Endpoint:** `GET /api/cards/:id`

**Access:** Public (with optional authentication)

**Example Request:**
```bash
curl -X GET "http://localhost:5000/api/cards/507f1f77bcf86cd799439011"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "card": {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Introduction to Machine Learning",
      "content": "Machine learning is...",
      "author_id": {
        "_id": "507f1f77bcf86cd799439012",
        "name": "John Doe",
        "email": "john@example.com",
        "role": "user"
      },
      "tags": ["machine-learning", "ai"],
      "category": "AI & ML",
      "view_count": 151,
      "like_count": 45,
      "created_at": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

---

### 3. Create Card
Create a new knowledge card.

**Endpoint:** `POST /api/cards`

**Access:** Protected (requires authentication)

**Request Body:**
```json
{
  "title": "React Hooks Best Practices",
  "content": "Learn the best practices for using React Hooks...",
  "category": "Web Development",
  "tags": ["react", "javascript", "hooks"],
  "visibility": "public"
}
```

**Example Request:**
```bash
curl -X POST "http://localhost:5000/api/cards" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "React Hooks Best Practices",
    "content": "Learn the best practices...",
    "category": "Web Development",
    "tags": ["react", "javascript"]
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Knowledge card created successfully",
  "data": {
    "card": {
      "_id": "507f1f77bcf86cd799439013",
      "title": "React Hooks Best Practices",
      "content": "Learn the best practices...",
      "author_id": {
        "_id": "507f1f77bcf86cd799439012",
        "name": "John Doe"
      },
      "tags": ["react", "javascript", "hooks"],
      "category": "Web Development",
      "visibility": "public",
      "view_count": 0,
      "like_count": 0,
      "created_at": "2024-01-20T14:30:00.000Z"
    }
  }
}
```

---

### 4. Update Card
Update an existing knowledge card.

**Endpoint:** `PATCH /api/cards/:id`

**Access:** Protected (author or admin only)

**Request Body:**
```json
{
  "title": "Updated Title",
  "content": "Updated content...",
  "tags": ["new-tag"],
  "visibility": "private"
}
```

**Example Request:**
```bash
curl -X PATCH "http://localhost:5000/api/cards/507f1f77bcf86cd799439013" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"title": "Updated Title"}'
```

**Response:**
```json
{
  "success": true,
  "message": "Knowledge card updated successfully",
  "data": {
    "card": {
      "_id": "507f1f77bcf86cd799439013",
      "title": "Updated Title",
      "updated_at": "2024-01-21T10:00:00.000Z"
    }
  }
}
```

---

### 5. Delete Card
Delete a knowledge card.

**Endpoint:** `DELETE /api/cards/:id`

**Access:** Protected (author or admin only)

**Example Request:**
```bash
curl -X DELETE "http://localhost:5000/api/cards/507f1f77bcf86cd799439013" \
  -H "Authorization: Bearer <token>"
```

**Response:**
```json
{
  "success": true,
  "message": "Knowledge card deleted successfully"
}
```

---

### 6. Get My Cards
Get all cards created by the authenticated user.

**Endpoint:** `GET /api/cards/user/my-cards`

**Access:** Protected

**Query Parameters:**
- `page` (optional) - Page number
- `limit` (optional) - Items per page

**Example Request:**
```bash
curl -X GET "http://localhost:5000/api/cards/user/my-cards?page=1&limit=10" \
  -H "Authorization: Bearer <token>"
```

---

### 7. Get Related Cards
Get cards related to a specific card based on tags and category.

**Endpoint:** `GET /api/cards/:id/related`

**Access:** Public

**Query Parameters:**
- `limit` (optional) - Number of related cards (default: 5)

**Example Request:**
```bash
curl -X GET "http://localhost:5000/api/cards/507f1f77bcf86cd799439011/related?limit=5"
```

---

## Interaction Endpoints

### 8. Like Card
Like a knowledge card.

**Endpoint:** `POST /api/interactions/:id/like`

**Access:** Protected

**Example Request:**
```bash
curl -X POST "http://localhost:5000/api/interactions/507f1f77bcf86cd799439011/like" \
  -H "Authorization: Bearer <token>"
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

---

### 9. Unlike Card
Remove like from a card.

**Endpoint:** `DELETE /api/interactions/:id/like`

**Access:** Protected

---

### 10. Bookmark Card
Bookmark a knowledge card.

**Endpoint:** `POST /api/interactions/:id/bookmark`

**Access:** Protected

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

---

### 11. Remove Bookmark
Remove bookmark from a card.

**Endpoint:** `DELETE /api/interactions/:id/bookmark`

**Access:** Protected

---

### 12. Get Bookmarked Cards
Get all cards bookmarked by the user.

**Endpoint:** `GET /api/interactions/bookmarks`

**Access:** Protected

**Query Parameters:**
- `page` (optional)
- `limit` (optional)

---

## Recommendation Endpoints

### 13. Get Personalized Recommendations
Get AI-powered personalized card recommendations.

**Endpoint:** `GET /api/recommendations/personalized`

**Access:** Protected

**Query Parameters:**
- `limit` (optional) - Number of recommendations (default: 10)

**Example Request:**
```bash
curl -X GET "http://localhost:5000/api/recommendations/personalized?limit=5" \
  -H "Authorization: Bearer <token>"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "cards": [...],
    "count": 5
  }
}
```

---

### 14. Get Trending Cards
Get trending cards based on recent activity.

**Endpoint:** `GET /api/recommendations/trending`

**Access:** Public

**Query Parameters:**
- `days` (optional) - Time window in days (default: 7)
- `limit` (optional) - Number of cards (default: 10)

---

### 15. Get AI Suggestions
Get AI-generated suggestions for tags and category.

**Endpoint:** `POST /api/recommendations/suggest`

**Access:** Protected

**Request Body:**
```json
{
  "title": "Understanding Neural Networks",
  "content": "Neural networks are computational models...",
  "tags": ["ai"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "suggested_tags": ["neural", "networks", "computational", "models"],
    "suggested_category": "AI & ML"
  }
}
```

---

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

- `VALIDATION_ERROR` - Invalid input data
- `CARD_NOT_FOUND` - Card doesn't exist
- `NO_TOKEN` - Missing authentication token
- `INVALID_TOKEN` - Invalid or expired token
- `FORBIDDEN` - Insufficient permissions
- `ALREADY_LIKED` - Card already liked
- `NOT_LIKED` - Card not liked yet
- `ALREADY_BOOKMARKED` - Card already bookmarked
- `NOT_BOOKMARKED` - Card not bookmarked yet

---

## Features

✅ Full CRUD operations for knowledge cards
✅ Advanced filtering (category, tags, author)
✅ Full-text search
✅ Pagination support
✅ Like and bookmark system
✅ AI-powered recommendations
✅ Trending cards
✅ Related cards suggestions
✅ Auto-generated tags and categories
✅ Analytics tracking
✅ Role-based access control
✅ Private/public/shared visibility

---

## Database Indexes

Optimized queries with indexes on:
- `tags` + `category` (compound)
- `author_id` + `created_at` (compound)
- `view_count` + `like_count` (compound)
- Full-text search on `title`, `content`, `tags`

---

## Rate Limiting

- General API: 100 requests per 15 minutes
- No specific rate limit on card endpoints

---

## Best Practices

1. Always include pagination for list endpoints
2. Use search for finding specific content
3. Filter by category/tags for better performance
4. Cache frequently accessed cards
5. Use trending endpoint for homepage
6. Use personalized recommendations for logged-in users

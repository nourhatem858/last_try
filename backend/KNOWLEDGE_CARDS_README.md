# Knowledge Cards Backend - Complete Guide

## Overview
Complete backend system for managing Knowledge Cards with CRUD operations, interactions (likes/bookmarks), AI recommendations, and analytics tracking.

## Features Implemented

### Core Features
✅ **CRUD Operations** - Create, Read, Update, Delete knowledge cards
✅ **Advanced Filtering** - Filter by category, tags, author, visibility
✅ **Full-Text Search** - Search in title, content, and tags
✅ **Pagination** - Efficient data loading with page/limit
✅ **Authorization** - Only authors and admins can edit/delete
✅ **Analytics Tracking** - Track views, likes, bookmarks for AI

### Interaction Features
✅ **Like System** - Users can like/unlike cards
✅ **Bookmark System** - Save cards for later
✅ **View Tracking** - Auto-increment view count
✅ **Engagement Metrics** - Track likes, bookmarks, views

### AI Features
✅ **Personalized Recommendations** - Based on user behavior
✅ **Trending Cards** - Most active cards in time window
✅ **Related Cards** - Similar content suggestions
✅ **Auto Tag Suggestions** - AI-generated tags
✅ **Auto Category Detection** - Smart categorization

## Project Structure

```
backend/
├── controllers/
│   ├── cardController.js           # CRUD operations
│   ├── interactionController.js    # Likes & bookmarks
│   └── recommendationController.js # AI recommendations
├── models/
│   ├── KnowledgeCard.js           # Card schema
│   ├── BookmarkLike.js            # Interactions schema
│   └── AnalyticsLog.js            # Analytics schema
├── routes/
│   ├── cardRoutes.js              # Card endpoints
│   ├── interactionRoutes.js       # Interaction endpoints
│   └── recommendationRoutes.js    # Recommendation endpoints
├── middlewares/
│   ├── cardValidation.js          # Input validation
│   └── optionalAuth.js            # Optional JWT auth
└── utils/
    └── aiSuggestions.js           # AI algorithms
```

## API Endpoints Summary

### Knowledge Cards
- `GET /api/cards` - Get all cards (with filters)
- `GET /api/cards/:id` - Get single card
- `POST /api/cards` - Create card (protected)
- `PATCH /api/cards/:id` - Update card (protected)
- `DELETE /api/cards/:id` - Delete card (protected)
- `GET /api/cards/user/my-cards` - Get user's cards (protected)
- `GET /api/cards/:id/related` - Get related cards

### Interactions
- `POST /api/interactions/:id/like` - Like card (protected)
- `DELETE /api/interactions/:id/like` - Unlike card (protected)
- `POST /api/interactions/:id/bookmark` - Bookmark card (protected)
- `DELETE /api/interactions/:id/bookmark` - Remove bookmark (protected)
- `GET /api/interactions/bookmarks` - Get bookmarked cards (protected)

### Recommendations
- `GET /api/recommendations/personalized` - Personalized (protected)
- `GET /api/recommendations/trending` - Trending cards
- `POST /api/recommendations/suggest` - AI suggestions (protected)

## Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Environment Setup
Already configured in existing `.env` file.

### 3. Start Server
```bash
npm run dev
```

### 4. Test Endpoints
Import `POSTMAN_CARDS_COLLECTION.json` into Postman.

## Usage Examples

### Create a Card
```javascript
const response = await fetch('http://localhost:5000/api/cards', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: 'React Hooks Guide',
    content: 'Complete guide to React Hooks...',
    category: 'Web Development',
    tags: ['react', 'javascript', 'hooks'],
    visibility: 'public'
  })
});
```

### Search Cards
```javascript
const response = await fetch(
  'http://localhost:5000/api/cards?search=machine learning&category=AI & ML&limit=10'
);
```

### Like a Card
```javascript
const response = await fetch(
  `http://localhost:5000/api/interactions/${cardId}/like`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
);
```

### Get Personalized Recommendations
```javascript
const response = await fetch(
  'http://localhost:5000/api/recommendations/personalized?limit=5',
  {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
);
```

## Database Schema

### KnowledgeCard
```javascript
{
  title: String (required, 3-200 chars),
  content: String (required, 10-10000 chars),
  author_id: ObjectId (ref: User),
  tags: [String] (max 10 tags),
  category: String (required),
  visibility: String (public/private/shared),
  view_count: Number,
  like_count: Number,
  bookmark_count: Number,
  created_at: Date,
  updated_at: Date
}
```

### Indexes
- `tags` + `category` (compound)
- `author_id` + `created_at` (compound)
- `view_count` + `like_count` (compound)
- Full-text on `title`, `content`, `tags`

## Validation Rules

### Create/Update Card
- **Title**: 3-200 characters, required
- **Content**: 10-10000 characters, required
- **Category**: 2-50 characters, required
- **Tags**: Array, max 10 tags, each 2-30 characters
- **Visibility**: public, private, or shared

### Query Parameters
- **Page**: Positive integer
- **Limit**: 1-100
- **Sort**: newest, oldest, popular, trending

## Authorization

### Public Endpoints
- Get all cards (filtered by visibility)
- Get single card (if public or owned)
- Get related cards
- Get trending cards

### Protected Endpoints
- Create card
- Update card (author or admin only)
- Delete card (author or admin only)
- Like/unlike card
- Bookmark/unbookmark card
- Get personalized recommendations

## AI Recommendation System

### Personalized Recommendations
Based on:
- User's recent views, likes, bookmarks
- User's favorite topics (from profile)
- Similar tags and categories
- Popularity metrics

### Trending Algorithm
Calculates score based on:
- Views in time window
- Likes in time window
- Bookmarks in time window
- Recency factor

### Tag Suggestions
- Keyword extraction from title and content
- Frequency analysis
- Common word filtering
- Returns top 5 suggestions

### Category Detection
- Keyword matching against predefined categories
- Scoring system for best match
- Fallback to "General" if no match

## Analytics Tracking

Every action is logged:
- `view` - Card viewed
- `like` - Card liked
- `bookmark` - Card bookmarked
- `create` - Card created
- `update` - Card updated
- `delete` - Card deleted

Logs include:
- User ID
- Card ID
- Action type
- Timestamp
- Optional metadata

## Performance Optimizations

1. **Database Indexes** - Fast queries on common filters
2. **Pagination** - Limit data transfer
3. **Lean Queries** - Return plain objects when possible
4. **Compound Indexes** - Optimize multi-field queries
5. **Text Indexes** - Fast full-text search
6. **TTL Indexes** - Auto-cleanup old analytics (1 year)

## Error Handling

All errors return:
```json
{
  "success": false,
  "message": "Error description",
  "code": "ERROR_CODE"
}
```

Common codes:
- `CARD_NOT_FOUND`
- `VALIDATION_ERROR`
- `FORBIDDEN`
- `ALREADY_LIKED`
- `NOT_BOOKMARKED`

## Integration with Frontend

### React Example
```javascript
// Create card
const createCard = async (cardData) => {
  const response = await fetch('/api/cards', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(cardData)
  });
  return response.json();
};

// Get cards with filters
const getCards = async (filters) => {
  const params = new URLSearchParams(filters);
  const response = await fetch(`/api/cards?${params}`);
  return response.json();
};
```

## Testing

Use the provided Postman collection:
1. Import `POSTMAN_CARDS_COLLECTION.json`
2. Set `base_url` variable
3. Login to get token
4. Set `token` variable
5. Test all endpoints

## Future Enhancements

- [ ] Rich text/Markdown support
- [ ] Image uploads
- [ ] Comments system
- [ ] Card versions/history
- [ ] Collaborative editing
- [ ] Export to PDF
- [ ] Advanced AI with NLP
- [ ] Real-time notifications
- [ ] Card templates

## License
MIT

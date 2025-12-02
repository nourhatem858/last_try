# Adaptive AI Knowledge Workspace - MongoDB Database

## Overview
This database structure supports a scalable, AI-driven knowledge management system with comprehensive user interactions, analytics, and future recommendation capabilities.

## Collections

### 1. Users
Stores user authentication, profiles, and preferences.

**Fields:**
- `_id`: ObjectId (Primary Key)
- `name`: String
- `email`: String (unique, indexed)
- `password`: String (hashed)
- `role`: String (admin/user)
- `preferences`: Object (theme, favorite_topics, notifications_enabled, language)
- `created_at`: Date
- `updated_at`: Date

**Indexes:**
- `email` (unique)
- `role`
- `created_at`

### 2. KnowledgeCards
Stores knowledge content with full-text search capabilities.

**Fields:**
- `_id`: ObjectId (Primary Key)
- `title`: String
- `content`: String
- `author_id`: ObjectId (reference → Users)
- `tags`: Array of Strings
- `category`: String (indexed)
- `visibility`: String (public/private/shared)
- `view_count`: Number
- `like_count`: Number
- `bookmark_count`: Number
- `created_at`: Date
- `updated_at`: Date

**Indexes:**
- `tags` + `category` (compound)
- `author_id` + `created_at` (compound)
- `category` + `created_at` (compound)
- `view_count` + `like_count` (compound)
- Full-text search on `title`, `content`, `tags`

### 3. BookmarksLikes
Tracks user interactions with knowledge cards.

**Fields:**
- `_id`: ObjectId (Primary Key)
- `user_id`: ObjectId (reference → Users)
- `card_id`: ObjectId (reference → KnowledgeCards)
- `type`: String (bookmark/like)
- `created_at`: Date

**Indexes:**
- `user_id` + `card_id` + `type` (compound, unique)
- `card_id` + `type` (compound)
- `user_id` + `type` + `created_at` (compound)

### 4. Notifications
Manages user notifications with auto-cleanup.

**Fields:**
- `_id`: ObjectId (Primary Key)
- `user_id`: ObjectId (reference → Users)
- `message`: String
- `type`: String (info/success/warning/error/system)
- `related_card_id`: ObjectId (optional, reference → KnowledgeCards)
- `read`: Boolean
- `created_at`: Date

**Indexes:**
- `user_id` + `read` + `created_at` (compound)
- `user_id` + `created_at` (compound)
- TTL index on `created_at` (auto-delete read notifications after 30 days)

### 5. AnalyticsLogs
Tracks user actions for analytics and AI recommendations.

**Fields:**
- `_id`: ObjectId (Primary Key)
- `user_id`: ObjectId (reference → Users)
- `action_type`: String (view/like/bookmark/search/create/update/delete/share)
- `card_id`: ObjectId (optional, reference → KnowledgeCards)
- `metadata`: Object (search_query, duration_seconds, device_type, ip_address, user_agent)
- `timestamp`: Date

**Indexes:**
- `user_id` + `action_type` + `timestamp` (compound)
- `card_id` + `action_type` + `timestamp` (compound)
- `action_type` + `timestamp` (compound)
- `timestamp`
- TTL index on `timestamp` (auto-delete logs older than 1 year)

## Relationships

```
Users (1) ──────→ (Many) KnowledgeCards
Users (Many) ←──→ (Many) KnowledgeCards (via BookmarksLikes)
Users (1) ──────→ (Many) Notifications
Users (1) ──────→ (Many) AnalyticsLogs
KnowledgeCards (1) ──────→ (Many) BookmarksLikes
KnowledgeCards (1) ──────→ (Many) AnalyticsLogs
```

## Setup Instructions

### Prerequisites
- Node.js (v14+)
- MongoDB (v4.4+)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install mongoose bcryptjs dotenv
```

2. Create `.env` file:
```env
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/adaptive_ai_workspace
```

3. Run database setup:
```bash
node database/setup.js
```

4. (Optional) Seed with sample data:
```bash
node database/seed.js
```

## Usage

### Connect to Database
```javascript
const dbConnection = require('./database/connection');

await dbConnection.connect();
```

### Import Models
```javascript
const User = require('./database/schemas/users.schema');
const KnowledgeCard = require('./database/schemas/knowledgeCards.schema');
const BookmarkLike = require('./database/schemas/bookmarksLikes.schema');
const Notification = require('./database/schemas/notifications.schema');
const AnalyticsLog = require('./database/schemas/analyticsLogs.schema');
```

### Example Queries

**Find user with their knowledge cards:**
```javascript
const user = await User.findById(userId).populate('knowledgeCards');
```

**Search knowledge cards:**
```javascript
const cards = await KnowledgeCard.find({
  $text: { $search: 'machine learning' }
}).sort({ view_count: -1 });
```

**Get user's bookmarked cards:**
```javascript
const bookmarks = await BookmarkLike.find({
  user_id: userId,
  type: 'bookmark'
}).populate('card_id');
```

**Track user action:**
```javascript
await AnalyticsLog.create({
  user_id: userId,
  action_type: 'view',
  card_id: cardId,
  metadata: { duration_seconds: 120 }
});
```

## Scalability Features

1. **Indexed Fields**: All frequently queried fields are indexed for fast lookups
2. **Compound Indexes**: Optimized for common query patterns
3. **Full-Text Search**: Efficient content search across titles, content, and tags
4. **TTL Indexes**: Automatic cleanup of old data (notifications, logs)
5. **Connection Pooling**: Configured for high concurrency
6. **Sharding Ready**: Structure supports horizontal scaling

## AI Recommendation Engine Support

The database structure supports AI-driven recommendations through:

1. **AnalyticsLogs**: Tracks all user interactions for behavior analysis
2. **Tags & Categories**: Enable content-based filtering
3. **User Preferences**: Store favorite topics for personalization
4. **Engagement Metrics**: View counts, likes, bookmarks for popularity-based recommendations
5. **Temporal Data**: Timestamps enable trend analysis and recency-based recommendations

### Recommendation Query Examples

**Content-based (similar tags):**
```javascript
const similarCards = await KnowledgeCard.find({
  tags: { $in: userFavoriteTags },
  _id: { $ne: currentCardId }
}).sort({ view_count: -1 }).limit(10);
```

**Collaborative filtering (users who liked this also liked):**
```javascript
const recommendations = await BookmarkLike.aggregate([
  { $match: { card_id: currentCardId, type: 'like' } },
  { $lookup: { from: 'bookmarklikes', localField: 'user_id', foreignField: 'user_id', as: 'userLikes' } },
  { $unwind: '$userLikes' },
  { $group: { _id: '$userLikes.card_id', score: { $sum: 1 } } },
  { $sort: { score: -1 } },
  { $limit: 10 }
]);
```

## Maintenance

### Backup
```bash
mongodump --uri="mongodb://localhost:27017/adaptive_ai_workspace" --out=./backup
```

### Restore
```bash
mongorestore --uri="mongodb://localhost:27017/adaptive_ai_workspace" ./backup
```

### Monitor Indexes
```javascript
db.collection.getIndexes()
db.collection.stats()
```

## License
MIT

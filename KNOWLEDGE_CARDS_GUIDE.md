# 🎴 Knowledge Cards System - Complete Guide

## ✅ What's Included

A complete, modern Knowledge Cards system for your Adaptive AI Knowledge Workspace with:

- **3 MongoDB Models** (Card, Like, Bookmark)
- **7 API Routes** (CRUD operations + like/bookmark)
- **3 React Components** (KnowledgeCard, CardModal, CreateCardForm)
- **3 Pages** (Cards Dashboard, Create Card, Card Detail)
- **Full Features** (Search, filter, like, bookmark, edit, delete)

## 📁 File Structure

```
models/
├── Card.ts          # Card schema with validation
├── Like.ts          # User likes tracking
└── Bookmark.ts      # User bookmarks tracking

app/api/cards/
├── route.ts         # GET (list) & POST (create)
├── [id]/
│   ├── route.ts     # GET, PUT, DELETE single card
│   ├── like/
│   │   └── route.ts # POST toggle like
│   └── bookmark/
│       └── route.ts # POST toggle bookmark

components/
├── KnowledgeCard.tsx      # Card display component
├── CardModal.tsx          # Full card view modal
└── CreateCardForm.tsx     # Create/edit form

app/cards/
├── page.tsx               # Cards dashboard
├── create/
│   └── page.tsx          # Create card page
└── [id]/
    └── page.tsx          # Card detail page
```

## 🚀 Quick Start

### 1. Install Dependencies (if not already installed)

```bash
npm install bcryptjs jsonwebtoken mongoose
npm install -D @types/bcryptjs @types/jsonwebtoken
```

### 2. Environment Variables

Make sure your `.env.local` has:

```env
MONGODB_URI=mongodb://localhost:27017/ai-knowledge-workspace
JWT_SECRET=your-super-secret-jwt-key
```

### 3. Start the Application

```bash
# Start MongoDB
mongod

# Start Next.js
npm run dev
```

### 4. Access the System

- **Cards Dashboard**: http://localhost:3000/cards
- **Create Card**: http://localhost:3000/cards/create
- **Card Detail**: http://localhost:3000/cards/[id]

## 📊 MongoDB Models

### Card Model

```typescript
{
  title: string;           // Max 200 chars
  content: string;         // Max 10,000 chars
  category: string;        // Required
  tags: string[];          // Max 10 tags
  author: ObjectId;        // User reference
  authorName: string;      // Cached author name
  likes: number;           // Like count
  bookmarks: number;       // Bookmark count
  isDraft: boolean;        // Draft status
  createdAt: Date;         // Auto timestamp
  updatedAt: Date;         // Auto timestamp
}
```

**Indexes:**
- `{ author: 1, createdAt: -1 }` - User's cards
- `{ category: 1, createdAt: -1 }` - Category filtering
- `{ tags: 1 }` - Tag filtering
- `{ title: 'text', content: 'text' }` - Full-text search
- `{ isDraft: 1, createdAt: -1 }` - Draft filtering

### Like Model

```typescript
{
  userId: ObjectId;   // User who liked
  cardId: ObjectId;   // Card that was liked
  createdAt: Date;    // When liked
}
```

**Indexes:**
- `{ userId: 1, cardId: 1 }` - Unique constraint
- `{ cardId: 1 }` - Card's likes
- `{ userId: 1 }` - User's likes

### Bookmark Model

```typescript
{
  userId: ObjectId;   // User who bookmarked
  cardId: ObjectId;   // Card that was bookmarked
  createdAt: Date;    // When bookmarked
}
```

**Indexes:**
- `{ userId: 1, cardId: 1 }` - Unique constraint
- `{ cardId: 1 }` - Card's bookmarks
- `{ userId: 1 }` - User's bookmarks

## 🔌 API Routes

### GET /api/cards

Fetch cards with pagination and filters.

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 12)
- `category` - Filter by category
- `search` - Full-text search
- `tags` - Comma-separated tags
- `author` - Filter by author ID
- `sortBy` - Sort field (default: createdAt)
- `order` - Sort order: asc/desc (default: desc)

**Response:**
```json
{
  "success": true,
  "cards": [...],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 50,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### POST /api/cards

Create a new card (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "title": "My Knowledge Card",
  "content": "Card content here...",
  "category": "Technology",
  "tags": ["react", "nextjs"],
  "isDraft": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Card published successfully",
  "card": {...}
}
```

### GET /api/cards/[id]

Get a single card by ID.

**Response:**
```json
{
  "success": true,
  "card": {...}
}
```

### PUT /api/cards/[id]

Update a card (requires authentication & ownership).

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "title": "Updated Title",
  "content": "Updated content...",
  "category": "Science",
  "tags": ["updated", "tags"],
  "isDraft": false
}
```

### DELETE /api/cards/[id]

Delete a card (requires authentication & ownership).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Card deleted successfully"
}
```

### POST /api/cards/[id]/like

Toggle like on a card (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "isLiked": true,
  "likes": 42
}
```

### POST /api/cards/[id]/bookmark

Toggle bookmark on a card (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "isBookmarked": true,
  "bookmarks": 15
}
```

## 🎨 Components

### KnowledgeCard

Display individual cards in a grid.

**Props:**
```typescript
{
  card: {
    _id: string;
    title: string;
    content: string;
    category: string;
    tags: string[];
    authorName: string;
    likes: number;
    bookmarks: number;
    createdAt: string;
  };
  isLiked?: boolean;
  isBookmarked?: boolean;
  onLike?: (cardId: string) => void;
  onBookmark?: (cardId: string) => void;
  onClick?: (cardId: string) => void;
}
```

**Features:**
- Category badge
- Content preview (150 chars)
- Tags display (max 3 visible)
- Like/bookmark buttons with counts
- Author and date info
- Hover effects
- Gradient accents

### CardModal

Full card view in a modal.

**Props:**
```typescript
{
  card: Card;
  currentUserId?: string;
  isLiked?: boolean;
  isBookmarked?: boolean;
  onClose: () => void;
  onLike?: (cardId: string) => void;
  onBookmark?: (cardId: string) => void;
  onEdit?: (cardId: string) => void;
  onDelete?: (cardId: string) => void;
}
```

**Features:**
- Full content display
- All tags visible
- Like/bookmark/share buttons
- Edit/delete buttons (owner only)
- Delete confirmation
- Scrollable content
- Dark mode support

### CreateCardForm

Form for creating/editing cards.

**Props:**
```typescript
{
  onSubmit: (data: {
    title: string;
    content: string;
    category: string;
    tags: string[];
    isDraft: boolean;
  }) => Promise<void>;
  initialData?: {
    title?: string;
    content?: string;
    category?: string;
    tags?: string[];
  };
  isEdit?: boolean;
}
```

**Features:**
- Title input (max 200 chars)
- Category dropdown
- Content textarea (max 10,000 chars)
- Tag management (max 10 tags)
- Preview mode
- Save as draft or publish
- Character counters
- Validation

## 📄 Pages

### Cards Dashboard (`/cards`)

**Features:**
- Grid layout (responsive: 1/2/3 columns)
- Search by title/content
- Filter by category
- Create card button
- Loading states
- Empty states
- Card modal on click

### Create Card (`/cards/create`)

**Features:**
- Full create form
- Preview mode
- Save as draft or publish
- Validation
- Success/error handling
- Redirect to dashboard

### Card Detail (`/cards/[id]`)

**Features:**
- Full card display
- Like/bookmark/share actions
- Edit/delete buttons (owner only)
- Back to dashboard button
- Loading states
- Owner badge

## 🎨 Design Features

### Colors

- **Primary**: Cyan to Blue gradient (`from-cyan-500 to-blue-500`)
- **Like**: Red (`red-600`)
- **Bookmark**: Cyan (`cyan-600`)
- **Success**: Green (`green-600`)
- **Danger**: Red (`red-600`)

### Animations

- Hover effects on cards
- Button transitions
- Modal fade-in
- Loading spinners
- Smooth color transitions

### Responsive Design

- **Mobile**: 1 column grid
- **Tablet**: 2 column grid
- **Desktop**: 3 column grid
- Responsive header
- Mobile-friendly forms

### Dark Mode

- Full dark mode support
- Automatic color switching
- Proper contrast ratios
- Dark backgrounds and borders

## 🔒 Authentication

The system uses JWT tokens stored in `localStorage`:

```typescript
// Get token
const token = localStorage.getItem('token');

// Use in API calls
fetch('/api/cards', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// Get user ID from token
const payload = JSON.parse(atob(token.split('.')[1]));
const userId = payload.id;
```

## 🧪 Testing

### Test Card Creation

```bash
# Using cURL
curl -X POST http://localhost:3000/api/cards \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Test Card",
    "content": "This is a test card",
    "category": "Technology",
    "tags": ["test", "demo"],
    "isDraft": false
  }'
```

### Test Card Retrieval

```bash
curl http://localhost:3000/api/cards?category=Technology&limit=5
```

### Test Like Toggle

```bash
curl -X POST http://localhost:3000/api/cards/CARD_ID/like \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🐛 Troubleshooting

### "Authentication required"

Make sure you're logged in and have a valid token in localStorage:

```javascript
// Check token
console.log(localStorage.getItem('token'));

// Login first
// Visit /login or /signup
```

### "Card not found"

The card ID might be invalid or the card was deleted:

```javascript
// Check if ID is valid MongoDB ObjectId
// Should be 24 hex characters
```

### "Not authorized to update this card"

You can only edit/delete your own cards:

```javascript
// Check if you're the card owner
const token = localStorage.getItem('token');
const payload = JSON.parse(atob(token.split('.')[1]));
console.log('Your ID:', payload.id);
console.log('Card author:', card.author);
```

### MongoDB Connection Issues

```bash
# Check if MongoDB is running
mongosh

# Start MongoDB if not running
mongod

# Check connection string
echo $MONGODB_URI
```

## 📈 Performance Optimizations

### Database Indexes

All models have optimized indexes for:
- Fast queries by category
- Fast queries by author
- Fast full-text search
- Fast tag filtering
- Unique constraints

### Connection Caching

MongoDB connections are cached to prevent connection overhead:

```typescript
// lib/mongodb.ts handles caching automatically
await connectDB(); // Reuses existing connection
```

### Pagination

Cards are paginated to prevent loading too much data:

```typescript
// Default: 12 cards per page
// Customize with ?limit=20
```

## 🚀 Production Deployment

### Environment Variables

```env
# Production MongoDB (use Atlas)
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/production

# Strong JWT secret
JWT_SECRET=generate-new-64-character-secret-for-production

# API URL
NEXT_PUBLIC_API_URL=https://your-domain.com
```

### Security Checklist

- [ ] Strong JWT secret (64+ characters)
- [ ] MongoDB Atlas with authentication
- [ ] HTTPS enabled
- [ ] Rate limiting on API routes
- [ ] Input validation and sanitization
- [ ] Error messages don't leak sensitive info
- [ ] CORS configured properly

### Performance Checklist

- [ ] Database indexes created
- [ ] Connection pooling enabled
- [ ] Image optimization (if using images)
- [ ] Code splitting
- [ ] Lazy loading components
- [ ] CDN for static assets

## 📚 Next Steps

### Enhancements

1. **Comments System**: Add comments to cards
2. **User Profiles**: Show user's cards and activity
3. **Advanced Search**: Filters, sorting, date ranges
4. **Rich Text Editor**: Markdown or WYSIWYG editor
5. **Image Uploads**: Add images to cards
6. **Notifications**: Notify on likes/comments
7. **Analytics**: Track views, engagement
8. **Export**: Export cards as PDF/Markdown

### Integration

1. **Dashboard**: Add cards widget to main dashboard
2. **Navigation**: Add cards link to main nav
3. **User Menu**: Add "My Cards" link
4. **Notifications**: Integrate with notification system
5. **Search**: Add to global search

## ✅ Summary

You now have a **complete, production-ready Knowledge Cards system** with:

✅ **3 MongoDB models** with optimized schemas
✅ **7 API routes** with full CRUD operations
✅ **3 React components** with modern design
✅ **3 pages** with responsive layouts
✅ **Full authentication** with JWT tokens
✅ **Like & bookmark** functionality
✅ **Search & filter** capabilities
✅ **Dark mode** support
✅ **Responsive design** for all devices
✅ **Error handling** and validation
✅ **Loading states** and animations

**Start using it now:**

```bash
npm run dev
# Visit http://localhost:3000/cards
```

🎉 **Enjoy your new Knowledge Cards system!**

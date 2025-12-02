# Adaptive AI Knowledge Workspace - Dashboard

## Overview
Modern, clean, and visually appealing dashboard built with React, Next.js, and Tailwind CSS.

## Features Implemented

### ✅ Layout
- **Top Toolbar**
  - Search bar with live suggestions
  - User profile icon with dropdown menu (Profile, Settings, Logout)
  - Notification bell with unread indicator
  - Responsive mobile menu

- **Left Sidebar**
  - Navigation links: Dashboard, Topics, Favorites, Notifications, AI Suggestions
  - Collapsible with smooth animation
  - Responsive (hidden on mobile, toggle button)
  - Gradient logo

- **Main Content Area**
  - Responsive grid layout (1 col mobile, 2 cols tablet, 3 cols desktop)
  - Knowledge cards with hover effects
  - Category filter tabs
  - Pagination

### ✅ Knowledge Cards
Each card includes:
- Title with gradient category badge
- Content snippet (truncated)
- Clickable tags (max 3 shown)
- Like button with counter
- Bookmark button with counter
- View count and date
- Hover effects: shadow, scale-up
- Smooth transitions

### ✅ Color Theme
- Background: White (#ffffff)
- Text: Black/Gray shades
- Accent: Cyan (#06b6d4) and Blue (#3b82f6)
- Gradients for buttons and highlights
- Clean, minimalistic design

### ✅ Animations
- Smooth transitions for hover effects
- Fade-in animation for cards
- Sidebar slide animation
- Dropdown menu animations
- Button hover effects
- Loading spinner

### ✅ Additional Components
- **Loading Skeletons** - Animated placeholders while fetching
- **Empty State** - Beautiful UI when no cards available
- **Error Message** - User-friendly error display with retry
- **Pagination** - Navigate through pages

### ✅ Best Practices
- Clean folder structure
- TypeScript for type safety
- Custom hooks for state management
- Reusable components
- API service layer
- Responsive design
- Accessibility features

## Project Structure

```
├── app/
│   ├── dashboard/
│   │   └── page.tsx          # Main dashboard page
│   ├── globals.css            # Global styles + animations
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Landing page (redirects)
├── components/
│   ├── EmptyState.tsx         # Empty state UI
│   ├── ErrorMessage.tsx       # Error display
│   ├── KnowledgeCard.tsx      # Card component
│   ├── LoadingSkeleton.tsx    # Loading placeholders
│   ├── Sidebar.tsx            # Navigation sidebar
│   └── Toolbar.tsx            # Top toolbar
├── hooks/
│   ├── useAuth.ts             # Authentication hook
│   └── useCards.ts            # Cards data hook
├── lib/
│   ├── api.ts                 # API service layer
│   └── types.ts               # TypeScript types
└── public/                    # Static assets
```

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 3. Start Development Server
```bash
npm run dev
```

Visit: http://localhost:3000

### 4. Start Backend Server
In the backend directory:
```bash
cd backend
npm run dev
```

Backend runs on: http://localhost:5000

## Features Breakdown

### Responsive Design
- **Mobile** (< 768px): Single column, hamburger menu
- **Tablet** (768px - 1024px): 2 columns
- **Desktop** (> 1024px): 3 columns, expanded sidebar

### Animations
- **Fade-in**: Cards appear smoothly on load
- **Hover**: Scale up + shadow on cards
- **Transitions**: All color/size changes are smooth
- **Sidebar**: Slide in/out animation
- **Dropdowns**: Fade in with slight movement

### Interactive Elements
- **Search**: Real-time search with debouncing
- **Category Filter**: Click to filter cards
- **Like/Bookmark**: Toggle with optimistic updates
- **Pagination**: Navigate through pages
- **Profile Menu**: Dropdown with user info

### Loading States
- **Skeleton Cards**: Animated placeholders
- **Spinner**: For page transitions
- **Button States**: Disabled during actions

### Error Handling
- **API Errors**: User-friendly messages
- **Retry Button**: Easy error recovery
- **Empty States**: Helpful guidance

## API Integration

The dashboard connects to your backend API:

### Endpoints Used
- `GET /api/cards` - Fetch cards with filters
- `POST /api/interactions/:id/like` - Like card
- `DELETE /api/interactions/:id/like` - Unlike card
- `POST /api/interactions/:id/bookmark` - Bookmark card
- `DELETE /api/interactions/:id/bookmark` - Unbookmark card
- `GET /api/users/me` - Get current user
- `GET /api/notifications` - Get notifications

### Authentication
- JWT token stored in localStorage
- Automatically included in API requests
- Logout clears token

## Customization

### Colors
Edit `app/globals.css`:
```css
/* Change accent colors */
.bg-gradient-to-r {
  from-cyan-500 to-blue-500
}
```

### Layout
Edit `app/dashboard/page.tsx`:
```typescript
// Change grid columns
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4"

// Change cards per page
limit: 12  // Change to any number
```

### Categories
Edit `app/dashboard/page.tsx`:
```typescript
const categories = [
  'All',
  'Your Category',
  // Add more...
];
```

## Optional Enhancements (Future)

### Dark Mode Toggle
Add theme switcher:
```typescript
const [theme, setTheme] = useState('light');
// Toggle between light/dark
```

### Drag-and-Drop
Use `react-beautiful-dnd`:
```bash
npm install react-beautiful-dnd
```

### AI Suggestions Section
Create dedicated component:
```typescript
<AIRecommendations userId={user.id} />
```

### Real-time Updates
Use WebSockets:
```typescript
const socket = io('http://localhost:5000');
socket.on('newCard', (card) => {
  // Update cards list
});
```

## Performance Optimizations

1. **Lazy Loading**: Images load on demand
2. **Pagination**: Limit data fetched
3. **Debouncing**: Search waits for user to stop typing
4. **Memoization**: Prevent unnecessary re-renders
5. **Code Splitting**: Next.js automatic splitting

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

## Troubleshooting

### Cards not loading
- Check backend is running on port 5000
- Verify `NEXT_PUBLIC_API_URL` in `.env.local`
- Check browser console for errors

### Styles not applying
- Clear Next.js cache: `rm -rf .next`
- Restart dev server: `npm run dev`

### Authentication issues
- Clear localStorage: `localStorage.clear()`
- Check JWT token is valid
- Verify backend auth endpoints

## License
MIT

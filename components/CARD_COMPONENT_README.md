# Knowledge Card Component - Complete Guide

## Overview
Modern, interactive Knowledge Card component with animations, tooltips, and modal view for the Adaptive AI Knowledge Workspace.

## Features Implemented

### ✅ Layout & Content
- **Title**: Bold, easily readable with hover effect
- **Content Snippet**: Preview text (truncated to 150 chars)
- **Tags**: Clickable rounded badges (shows first 3)
- **Category Badge**: Gradient badge with dynamic colors
- **Author Info**: User name with icon
- **Stats**: View count and relative date
- **Action Buttons**: Like, Bookmark, Share with counters

### ✅ Interactions & Animations

**Hover Effects:**
- Subtle shadow and scale-up (1.03x)
- Slight upward translation (-4px)
- Title color change to cyan
- Smooth 300ms transition

**Button Animations:**
- **Like Button**: 
  - Bounce animation on click
  - Pulse animation when liked
  - Color change (gray → red)
  - Counter increment with smooth transition
  
- **Bookmark Button**:
  - Bounce animation on click
  - Pulse animation when bookmarked
  - Color change (gray → blue)
  - Counter increment with smooth transition

**Card Animations:**
- Fade-in on load (0.5s ease-out)
- Scale-in for modal (0.3s ease-out)
- Gradient progress bar on hover

**Tag Animations:**
- Scale-up on hover (1.05x)
- Pulse animation on hover
- Color transition

### ✅ Modal View
- **Full Content Display**: Complete card content
- **Header**: Title, author, date, views, category
- **Tags**: All tags displayed
- **Actions**: Like, bookmark, share buttons
- **Close**: X button or Escape key
- **Backdrop**: Blur effect with fade-in
- **Scroll**: Content scrollable if long
- **Sticky**: Header and footer stay visible

### ✅ Styling & Colors

**Color Scheme:**
- Background: White (#ffffff)
- Text: Black/Gray shades
- Primary Accent: Cyan (#06b6d4)
- Secondary Accent: Blue (#3b82f6)
- Like: Red (#ef4444)
- Bookmark: Blue (#3b82f6)

**Category Colors:**
- AI & ML: Purple to Pink gradient
- Web Development: Cyan to Blue gradient
- Database: Green to Teal gradient
- DevOps: Orange to Red gradient
- Programming: Indigo to Purple gradient
- Data Science: Blue to Cyan gradient
- Security: Red to Pink gradient
- Mobile Development: Teal to Green gradient

**Design:**
- Rounded corners (12px)
- Soft shadows on hover
- Gradient accents
- Minimalistic and modern

### ✅ Tooltips
- Appear on button hover
- Dark background with white text
- Smooth fade-in transition
- Positioned above buttons
- Show action hints:
  - "Like" / "Unlike"
  - "Bookmark" / "Remove bookmark"
  - "Share"

## Component Props

```typescript
interface KnowledgeCardProps {
  card: KnowledgeCard;  // Card data object
  onUpdate?: () => void; // Callback after like/bookmark
}

interface KnowledgeCard {
  _id: string;
  title: string;
  content: string;
  author_id: {
    _id: string;
    name: string;
    email?: string;
  };
  tags: string[];
  category: string;
  visibility: 'public' | 'private' | 'shared';
  view_count: number;
  like_count: number;
  bookmark_count: number;
  created_at: string;
  updated_at: string;
}
```

## Usage Examples

### Basic Usage
```tsx
import KnowledgeCard from '@/components/KnowledgeCard';

<KnowledgeCard 
  card={cardData} 
  onUpdate={() => refetchCards()} 
/>
```

### In Grid Layout
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {cards.map((card) => (
    <KnowledgeCard 
      key={card._id} 
      card={card} 
      onUpdate={refetch} 
    />
  ))}
</div>
```

### With Loading State
```tsx
{loading ? (
  <LoadingGrid />
) : (
  cards.map((card) => (
    <KnowledgeCard key={card._id} card={card} />
  ))
)}
```

## Features Breakdown

### 1. Interactive Like Button
- Click to like/unlike
- Optimistic UI update
- Bounce animation on click
- Pulse animation when liked
- Counter updates smoothly
- Tooltip shows action
- API call to backend

### 2. Interactive Bookmark Button
- Click to bookmark/unbookmark
- Optimistic UI update
- Bounce animation on click
- Pulse animation when bookmarked
- Counter updates smoothly
- Tooltip shows action
- API call to backend

### 3. Clickable Tags
- Click to filter by tag
- Hover scale-up effect
- Pulse animation on hover
- Shows first 3 tags
- "+X more" indicator

### 4. Modal View
- Click card to open modal
- Full content display
- Scrollable content
- Sticky header/footer
- Close with X or Escape
- Backdrop blur effect
- Prevents body scroll

### 5. Dynamic Category Colors
- Each category has unique gradient
- Automatically applied based on category name
- Fallback to default cyan-blue gradient

### 6. Relative Date Formatting
- "Today" for today
- "Yesterday" for yesterday
- "X days ago" for < 7 days
- "X weeks ago" for < 30 days
- Full date for older

### 7. Content Truncation
- Truncates to 150 characters
- Adds "..." at end
- Full content in modal

## Animations Reference

### CSS Animations
```css
/* Fade In */
@keyframes fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Scale In */
@keyframes scale-in {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

/* Bounce */
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

/* Pulse */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

### Tailwind Classes
- `hover:shadow-2xl` - Large shadow on hover
- `hover:scale-[1.03]` - Scale up 3%
- `hover:-translate-y-1` - Move up 4px
- `transition-all duration-300` - Smooth transition
- `animate-fade-in` - Fade in on load
- `animate-bounce` - Bounce animation
- `animate-pulse` - Pulse animation

## Customization

### Change Hover Effect
```tsx
// In KnowledgeCard.tsx
className="hover:shadow-xl hover:scale-[1.05] hover:-translate-y-2"
```

### Change Truncation Length
```tsx
// In truncateContent function
const truncateContent = (text: string, maxLength: number = 200) => {
  // Change 200 to desired length
}
```

### Add New Category Color
```tsx
// In getCategoryColor function
const colors: { [key: string]: string } = {
  'Your Category': 'from-yellow-500 to-orange-500',
  // Add more...
};
```

### Customize Animation Duration
```tsx
// Change transition duration
className="transition-all duration-500" // 500ms instead of 300ms
```

## Accessibility

- **Keyboard Navigation**: All buttons are keyboard accessible
- **ARIA Labels**: Buttons have descriptive labels
- **Focus States**: Visible focus indicators
- **Screen Readers**: Semantic HTML structure
- **Color Contrast**: WCAG AA compliant

## Performance

- **Optimistic Updates**: UI updates before API response
- **Debouncing**: Prevents rapid clicks
- **Lazy Loading**: Modal only renders when opened
- **Memoization**: Prevents unnecessary re-renders
- **Efficient Animations**: CSS animations (GPU accelerated)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

## Future Enhancements

- [ ] Dark mode support
- [ ] Drag-and-drop reordering
- [ ] Card preview on hover
- [ ] Social sharing integration
- [ ] Comment system
- [ ] Card versioning
- [ ] Collaborative editing
- [ ] Export to PDF
- [ ] Print-friendly view
- [ ] Keyboard shortcuts

## Troubleshooting

### Animations not working
- Check Tailwind CSS is properly configured
- Verify `globals.css` is imported
- Clear browser cache

### Modal not closing
- Check Escape key handler
- Verify backdrop click handler
- Check z-index conflicts

### Tooltips not showing
- Verify hover state
- Check tooltip CSS
- Ensure proper positioning

## License
MIT

# Theme Guide - Dark Blue & Black Color Scheme

## 🎨 Color Palette

### Primary Colors
- **Primary Background**: `#0D1B2A` (Dark Blue) - Used for cards, panels, and main UI elements
- **Secondary Background**: `#000000` (Black) - Used for page backgrounds and sidebars
- **Accent Color**: `#1F77FF` (Bright Blue) - Used for buttons, links, and highlights
- **Accent Hover**: `#3D8FFF` (Lighter Blue) - Used for hover states

### Text Colors
- **Primary Text**: `#FFFFFF` (White) - Main text content
- **Secondary Text**: `#CCCCCC` (Light Gray) - Secondary information
- **Muted Text**: `#999999` (Muted Gray) - Placeholders and disabled text

### Semantic Colors
- **Success**: `#10B981` (Green)
- **Warning**: `#F59E0B` (Orange)
- **Error**: `#EF4444` (Red)
- **Info**: `#3B82F6` (Blue)

## 🧩 Component Classes

### Buttons

#### Primary Button
```tsx
<button className="bg-[#1F77FF] hover:bg-[#3D8FFF] text-white font-semibold rounded-lg py-3 px-4 transition-all duration-200 shadow-lg shadow-[#1F77FF]/30 hover:shadow-[#1F77FF]/50 hover:scale-[1.02] transform">
  Click Me
</button>
```

#### Secondary Button
```tsx
<button className="bg-[#0D1B2A] hover:bg-[#1A2332] text-white border border-[#1F77FF]/30 font-semibold rounded-lg py-3 px-4 transition-all duration-200">
  Secondary
</button>
```

#### Outline Button
```tsx
<button className="bg-transparent hover:bg-[#1F77FF]/10 text-[#1F77FF] border border-[#1F77FF]/50 hover:border-[#1F77FF] font-semibold rounded-lg py-3 px-4 transition-all duration-200">
  Outline
</button>
```

### Inputs

#### Standard Input
```tsx
<input className="w-full px-4 py-3 bg-[#0A1420] border border-[#1F77FF]/30 rounded-lg text-white placeholder-[#999999] focus:ring-2 focus:ring-[#1F77FF] focus:border-transparent transition-all duration-200" />
```

#### Input with Error
```tsx
<input className="w-full px-4 py-3 bg-[#0A1420] border border-red-500/50 rounded-lg text-white placeholder-[#999999] focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200" />
```

### Cards

#### Standard Card
```tsx
<div className="bg-[#0D1B2A] rounded-2xl border border-[#1F77FF]/20 p-6">
  Card Content
</div>
```

#### Hoverable Card
```tsx
<div className="bg-[#0D1B2A] rounded-2xl border border-[#1F77FF]/20 p-6 hover:border-[#1F77FF]/40 hover:shadow-lg hover:shadow-[#1F77FF]/20 transition-all duration-200 cursor-pointer">
  Hoverable Card
</div>
```

### Links

#### Standard Link
```tsx
<a className="text-[#1F77FF] hover:text-[#3D8FFF] transition-colors duration-200">
  Link Text
</a>
```

#### Link with Underline
```tsx
<a className="text-[#1F77FF] hover:text-[#3D8FFF] underline transition-colors duration-200">
  Underlined Link
</a>
```

## 📦 Using Theme Components

### Button Component
```tsx
import Button from '@/components/ui/Button';

<Button variant="primary" size="md" fullWidth>
  Primary Button
</Button>

<Button variant="secondary" size="sm">
  Secondary Button
</Button>

<Button variant="outline" loading>
  Loading...
</Button>
```

### Input Component
```tsx
import Input from '@/components/ui/Input';
import { EnvelopeIcon } from '@heroicons/react/24/outline';

<Input
  label="Email Address"
  type="email"
  placeholder="your@email.com"
  icon={<EnvelopeIcon className="w-5 h-5" />}
/>

<Input
  label="Password"
  type="password"
  error="Password is required"
/>
```

### Card Component
```tsx
import Card from '@/components/ui/Card';

<Card padding="lg" hover>
  <h3 className="text-xl font-bold text-white mb-2">Card Title</h3>
  <p className="text-[#CCCCCC]">Card content goes here</p>
</Card>
```

## 🎭 Animations

### Fade In
```tsx
<div className="animate-in fade-in duration-200">
  Fades in smoothly
</div>
```

### Slide In from Top
```tsx
<div className="animate-in fade-in slide-in-from-top duration-200">
  Slides in from top
</div>
```

### Zoom In
```tsx
<div className="animate-in fade-in zoom-in-95 duration-500">
  Zooms in with fade
</div>
```

## 🎯 Best Practices

### 1. Consistent Spacing
- Use Tailwind spacing utilities: `p-4`, `p-6`, `p-8` for padding
- Use `gap-4`, `gap-6` for flex/grid gaps
- Use `space-y-4`, `space-y-6` for vertical spacing

### 2. Consistent Border Radius
- Small elements: `rounded-lg` (8px)
- Cards and panels: `rounded-2xl` (16px)
- Icons and avatars: `rounded-full`

### 3. Hover States
- Always include `transition-all duration-200` for smooth transitions
- Use `hover:scale-[1.02]` for subtle scale effects on buttons
- Use `hover:shadow-lg` for elevation changes

### 4. Focus States
- Always include `focus:ring-2` for keyboard accessibility
- Use `focus:ring-[#1F77FF]` for consistent focus color
- Include `focus:border-transparent` to remove default border

### 5. Shadows
- Use `shadow-lg shadow-[#1F77FF]/30` for primary elements
- Use `hover:shadow-[#1F77FF]/50` for hover states
- Keep shadow opacity between 10% and 50%

### 6. Text Hierarchy
- Headings: `text-white font-bold`
- Body text: `text-[#CCCCCC]`
- Muted text: `text-[#999999]`
- Links: `text-[#1F77FF]`

## 📱 Responsive Design

### Mobile First Approach
```tsx
<div className="p-4 md:p-6 lg:p-8">
  {/* Padding increases on larger screens */}
</div>

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Responsive grid */}
</div>
```

### Breakpoints
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

## 🔧 Theme Configuration

The theme is centralized in `/lib/theme.ts`. Import and use:

```tsx
import { theme, cn } from '@/lib/theme';

// Use theme colors
const buttonClass = theme.classes.btnPrimary;

// Combine classes
const combinedClass = cn(
  'base-class',
  condition && 'conditional-class',
  'another-class'
);
```

## ✅ Checklist for New Components

- [ ] Use dark blue (`#0D1B2A`) for component backgrounds
- [ ] Use black (`#000000`) for page backgrounds
- [ ] Use bright blue (`#1F77FF`) for interactive elements
- [ ] Include hover states with lighter blue (`#3D8FFF`)
- [ ] Add smooth transitions (`transition-all duration-200`)
- [ ] Include focus states for accessibility
- [ ] Use consistent border radius (`rounded-lg` or `rounded-2xl`)
- [ ] Add appropriate shadows with blue tint
- [ ] Ensure text contrast (white on dark backgrounds)
- [ ] Test on mobile, tablet, and desktop
- [ ] Verify keyboard navigation works
- [ ] Check loading and disabled states

## 🎨 Example Page Layout

```tsx
export default function ExamplePage() {
  return (
    <div className="min-h-screen bg-black">
      {/* Page Container */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Page Title
          </h1>
          <p className="text-[#CCCCCC]">
            Page description goes here
          </p>
        </div>

        {/* Content Card */}
        <div className="bg-[#0D1B2A] rounded-2xl border border-[#1F77FF]/20 p-8">
          <h2 className="text-2xl font-bold text-white mb-4">
            Section Title
          </h2>
          <p className="text-[#CCCCCC] mb-6">
            Section content with proper text hierarchy
          </p>
          
          {/* Action Button */}
          <button className="bg-[#1F77FF] hover:bg-[#3D8FFF] text-white font-semibold rounded-lg py-3 px-6 transition-all duration-200 shadow-lg shadow-[#1F77FF]/30 hover:shadow-[#1F77FF]/50 hover:scale-[1.02] transform">
            Take Action
          </button>
        </div>
      </div>
    </div>
  );
}
```

## 🚀 Quick Start

1. Import theme utilities:
```tsx
import { theme, cn } from '@/lib/theme';
```

2. Use pre-built components:
```tsx
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
```

3. Apply consistent styling:
```tsx
<div className={theme.classes.card}>
  <h3 className={theme.classes.textPrimary}>Title</h3>
  <p className={theme.classes.textSecondary}>Description</p>
</div>
```

## 📚 Resources

- Theme Configuration: `/lib/theme.ts`
- UI Components: `/components/ui/`
- Global Styles: `/app/globals.css`
- Example Pages: `/app/login/page.tsx`, `/app/signup/page.tsx`, `/app/forgot-password/page.tsx`

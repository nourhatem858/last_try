# Theme Quick Reference Card

## 🎨 Colors (Copy & Paste)

```tsx
// Backgrounds
bg-[#0D1B2A]      // Primary (Dark Blue)
bg-[#0A1420]      // Input Background (Darker Blue)
bg-[#1A2332]      // Hover Background
bg-black          // Page Background

// Accent
bg-[#1F77FF]      // Primary Accent (Bright Blue)
bg-[#3D8FFF]      // Hover Accent (Lighter Blue)

// Text
text-white        // Primary Text (#FFFFFF)
text-[#CCCCCC]    // Secondary Text
text-[#999999]    // Muted Text

// Borders
border-[#1F77FF]/20   // Default Border (20% opacity)
border-[#1F77FF]/30   // Input Border (30% opacity)
border-[#1F77FF]/50   // Focus Border (50% opacity)

// Shadows
shadow-[#1F77FF]/30   // Default Shadow
shadow-[#1F77FF]/50   // Hover Shadow
```

## 🔘 Button Styles

```tsx
// Primary Button
className="bg-[#1F77FF] hover:bg-[#3D8FFF] text-white font-semibold rounded-lg py-3 px-4 transition-all duration-200 shadow-lg shadow-[#1F77FF]/30 hover:shadow-[#1F77FF]/50 hover:scale-[1.02] transform"

// Secondary Button
className="bg-[#0D1B2A] hover:bg-[#1A2332] text-white border border-[#1F77FF]/30 font-semibold rounded-lg py-3 px-4 transition-all duration-200"

// Outline Button
className="bg-transparent hover:bg-[#1F77FF]/10 text-[#1F77FF] border border-[#1F77FF]/50 hover:border-[#1F77FF] font-semibold rounded-lg py-3 px-4 transition-all duration-200"
```

## 📝 Input Styles

```tsx
// Standard Input
className="w-full px-4 py-3 bg-[#0A1420] border border-[#1F77FF]/30 rounded-lg text-white placeholder-[#999999] focus:ring-2 focus:ring-[#1F77FF] focus:border-transparent transition-all duration-200"

// Input with Error
className="w-full px-4 py-3 bg-[#0A1420] border border-red-500/50 rounded-lg text-white placeholder-[#999999] focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
```

## 🃏 Card Styles

```tsx
// Standard Card
className="bg-[#0D1B2A] rounded-2xl border border-[#1F77FF]/20 p-6"

// Hoverable Card
className="bg-[#0D1B2A] rounded-2xl border border-[#1F77FF]/20 p-6 hover:border-[#1F77FF]/40 hover:shadow-lg hover:shadow-[#1F77FF]/20 transition-all duration-200 cursor-pointer"
```

## 🔗 Link Styles

```tsx
// Standard Link
className="text-[#1F77FF] hover:text-[#3D8FFF] transition-colors duration-200"

// Link with Font Weight
className="text-[#1F77FF] hover:text-[#3D8FFF] font-semibold transition-colors duration-200"
```

## 🎭 Animations

```tsx
// Fade In
className="animate-in fade-in duration-200"

// Slide from Top
className="animate-in fade-in slide-in-from-top duration-200"

// Slide from Bottom
className="animate-in fade-in slide-in-from-bottom duration-200"

// Zoom In
className="animate-in fade-in zoom-in-95 duration-500"
```

## 📦 Pre-built Components

```tsx
// Button
import Button from '@/components/ui/Button';
<Button variant="primary" size="md" fullWidth loading={false}>
  Click Me
</Button>

// Input
import Input from '@/components/ui/Input';
<Input label="Email" type="email" error="Error message" />

// Card
import Card from '@/components/ui/Card';
<Card padding="lg" hover>Content</Card>
```

## 🎯 Common Patterns

### Page Container
```tsx
<div className="min-h-screen bg-black px-4 py-12">
  <div className="max-w-md mx-auto">
    {/* Content */}
  </div>
</div>
```

### Form Container
```tsx
<div className="bg-[#0D1B2A] rounded-2xl border border-[#1F77FF]/20 p-8">
  <form className="space-y-5">
    {/* Form fields */}
  </form>
</div>
```

### Error Message
```tsx
<div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
  <p className="text-red-400 text-sm">Error message</p>
</div>
```

### Success Message
```tsx
<div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
  <p className="text-green-400 text-sm">Success message</p>
</div>
```

### Loading Spinner
```tsx
<svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
</svg>
```

## 📱 Responsive Grid

```tsx
// 1 column mobile, 2 tablet, 3 desktop
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Items */}
</div>

// 1 column mobile, 2 desktop
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  {/* Items */}
</div>
```

## ✨ Icon with Background

```tsx
<div className="w-12 h-12 bg-[#1F77FF]/20 rounded-lg flex items-center justify-center">
  <Icon className="w-6 h-6 text-[#1F77FF]" />
</div>
```

## 🎨 Gradient Background

```tsx
// Primary Gradient
className="bg-gradient-to-r from-[#1F77FF] to-[#0D1B2A]"

// Accent Gradient
className="bg-gradient-to-br from-[#1F77FF] to-[#3D8FFF]"

// Card Gradient
className="bg-gradient-to-br from-[#0D1B2A] to-black"
```

## 🔍 Text Hierarchy

```tsx
// Page Title
<h1 className="text-4xl font-bold text-white mb-4">

// Section Title
<h2 className="text-2xl font-bold text-white mb-3">

// Card Title
<h3 className="text-xl font-bold text-white mb-2">

// Body Text
<p className="text-[#CCCCCC]">

// Muted Text
<p className="text-[#999999] text-sm">

// Label
<label className="block text-sm font-semibold text-white mb-2">
```

## 🎯 States

```tsx
// Disabled
className="opacity-50 cursor-not-allowed"

// Loading
className="opacity-70 cursor-wait"

// Active/Selected
className="bg-[#1F77FF] text-white"

// Hover
className="hover:bg-[#1A2332] transition-all duration-200"
```

## 📏 Spacing Scale

```tsx
p-2   // 8px
p-4   // 16px
p-6   // 24px
p-8   // 32px
p-12  // 48px

gap-2  // 8px
gap-4  // 16px
gap-6  // 24px
gap-8  // 32px

space-y-2  // 8px vertical
space-y-4  // 16px vertical
space-y-6  // 24px vertical
```

## 🔄 Transitions

```tsx
// Standard
transition-all duration-200

// Colors only
transition-colors duration-200

// Transform only
transition-transform duration-200

// With hover scale
hover:scale-[1.02] transform transition-all duration-200
```

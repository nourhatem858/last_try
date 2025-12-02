# Theme Migration Guide

## 🎯 Overview

This guide helps you migrate existing components to the new dark blue and black theme.

## 📋 Color Mapping

### Old → New Color Replacements

| Old Color | New Color | Usage |
|-----------|-----------|-------|
| `bg-white` | `bg-[#0D1B2A]` | Cards, panels |
| `bg-gray-50` | `bg-[#0A1420]` | Input backgrounds |
| `bg-gray-100` | `bg-[#1A2332]` | Hover states |
| `bg-gray-900` | `bg-black` | Page backgrounds |
| `bg-indigo-600` | `bg-[#1F77FF]` | Primary buttons |
| `bg-indigo-700` | `bg-[#3D8FFF]` | Button hover |
| `bg-cyan-500` | `bg-[#1F77FF]` | Accent elements |
| `text-gray-900` | `text-white` | Primary text |
| `text-gray-600` | `text-[#CCCCCC]` | Secondary text |
| `text-gray-400` | `text-[#999999]` | Muted text |
| `text-indigo-600` | `text-[#1F77FF]` | Links |
| `border-gray-300` | `border-[#1F77FF]/30` | Input borders |
| `border-gray-200` | `border-[#1F77FF]/20` | Card borders |

## 🔄 Component Migration Examples

### Example 1: Button Migration

**Before:**
```tsx
<button className="bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-lg">
  Click Me
</button>
```

**After:**
```tsx
<button className="bg-[#1F77FF] hover:bg-[#3D8FFF] text-white py-3 px-4 rounded-lg transition-all duration-200 shadow-lg shadow-[#1F77FF]/30 hover:shadow-[#1F77FF]/50 hover:scale-[1.02] transform">
  Click Me
</button>
```

**Or use the component:**
```tsx
import Button from '@/components/ui/Button';
<Button variant="primary">Click Me</Button>
```

### Example 2: Input Migration

**Before:**
```tsx
<input className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
```

**After:**
```tsx
<input className="w-full px-4 py-3 bg-[#0A1420] border border-[#1F77FF]/30 rounded-lg text-white placeholder-[#999999] focus:ring-2 focus:ring-[#1F77FF] focus:border-transparent transition-all duration-200" />
```

**Or use the component:**
```tsx
import Input from '@/components/ui/Input';
<Input type="text" placeholder="Enter text" />
```

### Example 3: Card Migration

**Before:**
```tsx
<div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
  Content
</div>
```

**After:**
```tsx
<div className="bg-[#0D1B2A] rounded-2xl border border-[#1F77FF]/20 p-8">
  Content
</div>
```

**Or use the component:**
```tsx
import Card from '@/components/ui/Card';
<Card padding="lg">Content</Card>
```

### Example 4: Link Migration

**Before:**
```tsx
<Link href="/page" className="text-indigo-600 hover:text-indigo-500">
  Link Text
</Link>
```

**After:**
```tsx
<Link href="/page" className="text-[#1F77FF] hover:text-[#3D8FFF] transition-colors duration-200">
  Link Text
</Link>
```

### Example 5: Page Background Migration

**Before:**
```tsx
<div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
  Content
</div>
```

**After:**
```tsx
<div className="min-h-screen bg-black">
  Content
</div>
```

### Example 6: Error Message Migration

**Before:**
```tsx
<div className="bg-red-50 border border-red-200 rounded-lg p-4">
  <p className="text-red-800">Error message</p>
</div>
```

**After:**
```tsx
<div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
  <p className="text-red-400">Error message</p>
</div>
```

### Example 7: Success Message Migration

**Before:**
```tsx
<div className="bg-green-50 border border-green-200 rounded-lg p-4">
  <p className="text-green-800">Success message</p>
</div>
```

**After:**
```tsx
<div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
  <p className="text-green-400">Success message</p>
</div>
```

## 🔍 Find and Replace Patterns

Use these regex patterns in your editor to quickly update colors:

### VS Code Find & Replace

1. **Background Colors:**
   - Find: `bg-white(?!\-)`
   - Replace: `bg-[#0D1B2A]`

2. **Text Colors:**
   - Find: `text-gray-900`
   - Replace: `text-white`
   
   - Find: `text-gray-600`
   - Replace: `text-[#CCCCCC]`

3. **Button Colors:**
   - Find: `bg-indigo-600`
   - Replace: `bg-[#1F77FF]`
   
   - Find: `bg-indigo-700`
   - Replace: `bg-[#3D8FFF]`

4. **Border Colors:**
   - Find: `border-gray-300`
   - Replace: `border-[#1F77FF]/30`
   
   - Find: `border-gray-200`
   - Replace: `border-[#1F77FF]/20`

## 📝 Step-by-Step Migration Process

### Step 1: Update Page Backgrounds
```tsx
// Change all page containers
<div className="min-h-screen bg-black">
```

### Step 2: Update Cards and Panels
```tsx
// Change all card backgrounds
<div className="bg-[#0D1B2A] rounded-2xl border border-[#1F77FF]/20">
```

### Step 3: Update Buttons
```tsx
// Primary buttons
<button className="bg-[#1F77FF] hover:bg-[#3D8FFF] text-white">

// Or use the Button component
import Button from '@/components/ui/Button';
<Button variant="primary">Text</Button>
```

### Step 4: Update Inputs
```tsx
// All input fields
<input className="bg-[#0A1420] border border-[#1F77FF]/30 text-white placeholder-[#999999]">

// Or use the Input component
import Input from '@/components/ui/Input';
<Input type="text" />
```

### Step 5: Update Text Colors
```tsx
// Headings
<h1 className="text-white">

// Body text
<p className="text-[#CCCCCC]">

// Muted text
<span className="text-[#999999]">
```

### Step 6: Update Links
```tsx
<Link className="text-[#1F77FF] hover:text-[#3D8FFF] transition-colors duration-200">
```

### Step 7: Add Transitions
```tsx
// Add to all interactive elements
className="... transition-all duration-200"
```

### Step 8: Add Shadows
```tsx
// Add to buttons and elevated elements
className="... shadow-lg shadow-[#1F77FF]/30 hover:shadow-[#1F77FF]/50"
```

## ✅ Migration Checklist

For each component, verify:

- [ ] Background color updated to dark blue or black
- [ ] Text color updated to white or light gray
- [ ] Buttons use bright blue accent color
- [ ] Inputs have dark blue background
- [ ] Borders use blue with opacity
- [ ] Hover states use lighter blue
- [ ] Transitions added (200ms duration)
- [ ] Shadows use blue tint
- [ ] Focus states properly styled
- [ ] Error/success messages use new colors
- [ ] Links use accent blue color
- [ ] Responsive design maintained
- [ ] Accessibility not compromised

## 🧪 Testing After Migration

1. **Visual Testing:**
   - Check all pages in light/dark mode
   - Verify hover states work
   - Test focus states with keyboard
   - Check loading states
   - Verify disabled states

2. **Accessibility Testing:**
   - Check color contrast ratios
   - Test keyboard navigation
   - Verify screen reader compatibility
   - Test with high contrast mode

3. **Responsive Testing:**
   - Test on mobile (320px - 768px)
   - Test on tablet (768px - 1024px)
   - Test on desktop (1024px+)

## 🚨 Common Issues and Solutions

### Issue 1: Text Not Visible
**Problem:** Text appears invisible on dark background
**Solution:** Change text color to `text-white` or `text-[#CCCCCC]`

### Issue 2: Buttons Look Flat
**Problem:** Buttons don't stand out
**Solution:** Add shadow: `shadow-lg shadow-[#1F77FF]/30`

### Issue 3: Inputs Hard to See
**Problem:** Input fields blend with background
**Solution:** Use `bg-[#0A1420]` with `border-[#1F77FF]/30`

### Issue 4: Hover States Not Smooth
**Problem:** Transitions feel abrupt
**Solution:** Add `transition-all duration-200`

### Issue 5: Links Not Obvious
**Problem:** Links don't look clickable
**Solution:** Use `text-[#1F77FF] hover:text-[#3D8FFF]`

## 📚 Resources

- **Theme Guide:** See `THEME_GUIDE.md` for comprehensive documentation
- **Quick Reference:** See `THEME_QUICK_REFERENCE.md` for copy-paste snippets
- **Theme Config:** See `/lib/theme.ts` for centralized theme values
- **UI Components:** See `/components/ui/` for pre-built components
- **Examples:** See `/app/login/page.tsx`, `/app/signup/page.tsx`, `/app/forgot-password/page.tsx`

## 🎯 Priority Order

Migrate in this order for best results:

1. **Authentication Pages** (Login, Signup, Forgot Password) ✅ DONE
2. **Dashboard** (Main landing page)
3. **Sidebar/Navigation** (Global navigation)
4. **Forms** (All form components)
5. **Cards** (Knowledge cards, activity cards)
6. **Modals** (Dialogs and popups)
7. **Lists** (Activity lists, member lists)
8. **Settings Pages** (Profile, preferences)
9. **Content Pages** (Documents, notes)
10. **Utility Components** (Tooltips, badges, alerts)

## 💡 Pro Tips

1. **Use the pre-built components** (`Button`, `Input`, `Card`) for consistency
2. **Import theme utilities** from `/lib/theme.ts` for reusable classes
3. **Test in dark mode** since the theme is dark by default
4. **Add animations** to make the UI feel more polished
5. **Keep shadows subtle** (20-50% opacity)
6. **Use consistent spacing** (multiples of 4px)
7. **Maintain accessibility** - ensure proper contrast ratios
8. **Document custom components** that deviate from the theme

## 🔄 Automated Migration Script

Create a script to automate common replacements:

```bash
# Run this in your project root
find ./app ./components -type f -name "*.tsx" -exec sed -i '' \
  -e 's/bg-white\([^-]\)/bg-[#0D1B2A]\1/g' \
  -e 's/bg-indigo-600/bg-[#1F77FF]/g' \
  -e 's/bg-indigo-700/bg-[#3D8FFF]/g' \
  -e 's/text-gray-900/text-white/g' \
  -e 's/text-gray-600/text-[#CCCCCC]/g' \
  -e 's/border-gray-300/border-[#1F77FF]\/30/g' \
  {} +
```

**Note:** Always review automated changes and test thoroughly!

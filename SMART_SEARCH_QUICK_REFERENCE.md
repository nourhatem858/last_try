# ⚡ Smart Search - Quick Reference

## 🎯 Quick Overview

**Location**: Header (TopNavbar)  
**Debounce**: 300ms  
**API**: `GET /api/search?q={query}`  
**Results**: Notes, Documents, Workspaces, Chats

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `↓` | Next result |
| `↑` | Previous result |
| `Enter` | Select result |
| `Esc` | Close dropdown |

---

## 🎨 Result Types

| Type | Icon | Color | Navigation |
|------|------|-------|------------|
| **Note** | 📝 | Purple → Pink | `/notes` |
| **Document** | 📄 | Green → Emerald | `/documents` |
| **Workspace** | 📁 | Cyan → Blue | `/workspaces` |
| **Chat** | 💬 | Orange → Red | `/chat` |

---

## 🔄 Flow

```
Type → Wait 300ms → API Call → Show Results → Click → Navigate
```

---

## 💻 Code Snippets

### Import
```typescript
import SmartSearch from '@/components/search/SmartSearch';
```

### Use
```typescript
<SmartSearch />
```

### API Response
```json
{
  "notes": [{"id": "1", "title": "...", "snippet": "...", "type": "note"}],
  "documents": [{"id": "1", "title": "...", "snippet": "...", "type": "document"}],
  "workspaces": [{"id": "1", "name": "...", "description": "...", "type": "workspace"}],
  "chats": [{"id": "1", "title": "...", "participants": [], "lastMessage": "...", "type": "chat"}]
}
```

---

## 🎨 Styling

### Colors
```css
Background: #0D1B2A to #000000
Accent: #06B6D4 to #3B82F6
Highlight: bg-cyan-500/30 text-cyan-300
```

### States
```css
Normal: border-cyan-500/20
Focus: border-cyan-500/50 ring-2 ring-cyan-500/20
Hover: bg-black/40 border-cyan-500/20
Selected: bg-cyan-500/20 border-cyan-500/40
```

---

## 🔧 Customization

### Change Debounce
```typescript
setTimeout(() => performSearch(value), 300); // Change 300
```

### Add Result Type
```typescript
case 'your-type':
  return YourIcon;
```

### Modify Highlight
```typescript
<mark className="bg-your-color-500/30">
  {part}
</mark>
```

---

## 🐛 Quick Fixes

| Issue | Solution |
|-------|----------|
| Not searching | Check token, API route |
| No results | Verify API returns data |
| No highlight | Check query passed |
| Keys broken | Check handleKeyDown |

---

## ✅ Quick Test

```bash
1. Type "project" in search
2. Wait 300ms
3. See results dropdown
4. Press Arrow Down
5. Press Enter
6. Navigate to page
7. Success! ✅
```

---

## 📚 Files

```
components/search/
├── SmartSearch.tsx          ← Main component
└── SearchResultItem.tsx     ← Result item

components/dashboard/
└── TopNavbar.tsx            ← Integrated here

app/api/
└── search/
    └── route.ts             ← API endpoint
```

---

**Quick Reference Complete!** 📌

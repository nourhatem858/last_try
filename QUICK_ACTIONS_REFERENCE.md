# ⚡ Quick Actions & Recent Activity - Quick Reference

## 🎯 Quick Actions

### Available Actions

| Action | Function | API Endpoint | Provider |
|--------|----------|--------------|----------|
| **Create Note** | Opens note modal | `POST /api/notes` | NotesProvider |
| **Upload Document** | Opens document modal | `POST /api/documents` | DocumentsProvider |
| **New Workspace** | Opens workspace modal | `POST /api/workspaces` | WorkspacesProvider |
| **Start Chat** | Creates AI conversation | AIProvider | AIProvider |
| **Ask AI** | Opens AI assistance | Navigation | - |
| **Quick Add** | Universal creation modal | Multiple | Multiple |

---

## 📊 Recent Activity

### Data Sources

```typescript
Fetches from:
- /api/notes       → Notes
- /api/documents   → Documents
- /api/workspaces  → Workspaces
- /api/chats       → Chats

Combines → Sorts → Shows top 10
```

### Activity Types

| Type | Icon | Color | Navigation |
|------|------|-------|------------|
| **Note** | 📝 | Purple → Pink | `/notes` |
| **Document** | 📄 | Green → Emerald | `/documents` |
| **Workspace** | 📁 | Cyan → Blue | `/workspaces` |
| **Chat** | 💬 | Orange → Red | `/chat` |

---

## 🔄 Flow Diagram

```
User clicks Quick Action
        ↓
Modal opens (if applicable)
        ↓
User fills form
        ↓
Submit → API call
        ↓
Provider updates
        ↓
Activity refreshes
        ↓
Dashboard stats update
        ↓
Modal closes
        ↓
Success! ✅
```

---

## 💻 Code Snippets

### Create Note
```typescript
const handleCreateNote = async (data) => {
  const response = await fetch('/api/notes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  const result = await response.json();
  addNote(result.data);
  onActivityUpdate();
};
```

### Fetch Recent Activity
```typescript
const fetchRecentActivity = async () => {
  const [notes, docs, workspaces, chats] = await Promise.allSettled([
    fetch('/api/notes', { headers: { Authorization: `Bearer ${token}` } }),
    fetch('/api/documents', { headers: { Authorization: `Bearer ${token}` } }),
    fetch('/api/workspaces', { headers: { Authorization: `Bearer ${token}` } }),
    fetch('/api/chats', { headers: { Authorization: `Bearer ${token}` } }),
  ]);
  
  // Combine, sort, take top 10
  const activities = combineAndSort(notes, docs, workspaces, chats);
  setActivities(activities.slice(0, 10));
};
```

### Format Timestamp
```typescript
const formatTimestamp = (timestamp: string) => {
  const diff = Date.now() - new Date(timestamp).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
};
```

---

## 🎨 Styling Classes

### Quick Action Button
```css
group relative bg-black/40 border border-cyan-500/20
rounded-xl p-5 text-left
hover:border-cyan-500/40 hover:bg-black/60
hover:shadow-xl hover:shadow-cyan-500/10
transition-all duration-300
```

### Activity Card
```css
w-full group flex items-center gap-4 p-4 rounded-xl
bg-black/40 border border-cyan-500/20
hover:border-cyan-500/40 hover:bg-black/60
hover:shadow-lg hover:shadow-cyan-500/10
transition-all duration-200
```

### Icon Badge
```css
w-12 h-12 rounded-lg bg-gradient-to-br {gradient}
flex items-center justify-center flex-shrink-0
shadow-lg group-hover:scale-110
transition-all duration-200
```

---

## 🔑 Key Props

### QuickActionsPanel
```typescript
interface QuickActionsProps {
  onActivityUpdate?: () => void; // Callback when item created
}
```

### RecentActivityList
```typescript
interface RecentActivityListProps {
  refreshTrigger?: number; // Increment to refresh
}
```

### QuickAddModal
```typescript
interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateNote: (data: any) => Promise<void>;
  onUploadDocument: (data: any) => Promise<void>;
  onCreateWorkspace: (data: any) => Promise<void>;
  onActivityUpdate?: () => void;
}
```

---

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| Actions not working | Check token exists, API routes running |
| Activity not showing | Verify API endpoints return data |
| Modals not opening | Check state updates, no JS errors |
| Items not appearing | Verify API success, provider updated |
| Timestamps wrong | Check server/client time sync |

---

## ✅ Quick Test

```bash
# 1. Login to dashboard
# 2. Click "Create Note"
# 3. Fill form and submit
# 4. Check Recent Activity
# 5. Note should appear at top
# 6. Click note to navigate
# 7. Success! ✅
```

---

## 📚 Related Files

```
components/dashboard/
├── QuickActionsPanel.tsx      ← Main quick actions
├── RecentActivityList.tsx     ← Activity feed
├── QuickAddModal.tsx          ← Universal modal
└── DashboardCards.tsx         ← Stats cards

app/
└── dashboard/
    └── page.tsx               ← Dashboard page

contexts/
├── NotesProvider.tsx          ← Notes state
├── DocumentsProvider.tsx      ← Documents state
├── WorkspacesProvider.tsx     ← Workspaces state
└── AIProvider.tsx             ← AI state
```

---

## 🎯 Next Steps

1. **Test all actions** - Create note, document, workspace
2. **Verify activity** - Check items appear in Recent Activity
3. **Test navigation** - Click activity items
4. **Check responsive** - Test on mobile, tablet, desktop
5. **Verify accessibility** - Test keyboard navigation

---

**Quick Reference Complete!** 📌

# ⚡ Quick Fix Reference Card

## 🚨 Common TypeScript Errors & Solutions

### Error 1: "Cannot find name 'documentId'"
**Cause**: Missing `await params` in API route

**Fix**:
```typescript
// Add this at the start of your route handler:
const { id: documentId } = await params;
```

---

### Error 2: "Type 'Promise<{ id: string }>' is not assignable"
**Cause**: Using old Next.js 13-15 params pattern

**Fix**:
```typescript
// Change this:
{ params }: { params: { id: string } }

// To this:
{ params }: { params: Promise<{ id: string }> }
```

---

### Error 3: "Module 'axios' has no exported member 'AxiosError'"
**Cause**: Incorrect axios import pattern

**Fix**:
```typescript
// Change this:
import axios, { AxiosError } from 'axios';

// To this:
import axios from 'axios';
import type { AxiosInstance } from 'axios';

// And use type guard:
if (axios.isAxiosError(error)) { ... }
```

---

### Error 4: "Property 'Authorization' does not exist on type 'HeadersInit'"
**Cause**: Wrong type for dynamic headers

**Fix**:
```typescript
// Change this:
const headers: HeadersInit = { ... };

// To this:
const headers: Record<string, string> = { ... };
```

---

### Error 5: "Module '@heroicons/react/24/outline' has no exported member 'RefreshIcon'"
**Cause**: Icon renamed in Heroicons v2

**Fix**:
```typescript
// Change this:
import { RefreshIcon } from '@heroicons/react/24/outline';

// To this:
import { ArrowPathIcon } from '@heroicons/react/24/outline';
```

**Common Renames**:
- `RefreshIcon` → `ArrowPathIcon`
- `MenuIcon` → `Bars3Icon`
- `SearchIcon` → `MagnifyingGlassIcon`
- `FilterIcon` → `FunnelIcon`
- `XIcon` → `XMarkIcon`
- `LoginIcon` → `ArrowLeftOnRectangleIcon`
- `LogoutIcon` → `ArrowRightOnRectangleIcon`

---

## 🛠️ Quick Commands

### Check for TypeScript errors:
```bash
npx tsc --noEmit
```

### Build project:
```bash
npm run build
```

### Run automated fixes:
```bash
node fix-all-typescript.js
```

### Start development server:
```bash
npm run dev
```

---

## 📋 API Route Template (Next.js 16+)

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // STEP 1: Await params
    const { id: resourceId } = await params;
    
    // STEP 2: Get auth token (if needed)
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    // STEP 3: Your logic here
    const data = await fetchData(resourceId);
    
    // STEP 4: Return response
    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Operation failed' },
      { status: 500 }
    );
  }
}
```

---

## 🎯 Checklist for New API Routes

- [ ] Use `{ params }: { params: Promise<{ id: string }> }`
- [ ] Add `const { id: resourceId } = await params;`
- [ ] Return `NextResponse.json({ success, data })`
- [ ] Add try-catch error handling
- [ ] Use meaningful variable names
- [ ] Add proper status codes

---

## 📚 Full Documentation

For detailed explanations, see:
- `TYPESCRIPT_FIXES_COMPLETE.md` - Complete guide
- `BUILD_SUCCESS_SUMMARY.md` - Summary of changes
- `fix-all-typescript.js` - Automated fix script

---

## 🆘 Emergency Fix

If build fails, run these in order:

```bash
# 1. Run automated fixes
node fix-all-typescript.js

# 2. Check for errors
npx tsc --noEmit

# 3. Try building
npm run build

# 4. If still failing, check:
#    - TYPESCRIPT_FIXES_COMPLETE.md
#    - Error message in terminal
#    - This quick reference
```

---

## ✅ Success Indicators

Your project is fixed when:
- ✅ `npx tsc --noEmit` shows no errors
- ✅ `npm run build` completes successfully
- ✅ `npm run dev` starts without warnings
- ✅ All pages load without 404 errors

---

**Keep this file handy for quick reference!** 📌

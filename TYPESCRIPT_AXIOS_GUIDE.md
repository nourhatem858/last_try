# TypeScript + Axios + Next.js Best Practices Guide

## Problem: Why TypeScript Marks `response.data` as `unknown`

By default, axios returns `AxiosResponse<any>`, which means TypeScript doesn't know the structure of your API response. This leads to:
- `response.data` being typed as `unknown` or `any`
- No autocomplete for response properties
- Runtime errors that TypeScript can't catch

## Solution: Properly Type Axios Responses

### 1. Define API Response Interfaces

Create clear interfaces for all API responses in `types/index.ts`:

```typescript
// Generic response wrapper
export interface ApiResponse<T = any> {
  success: boolean;
  error?: string;
  message?: string;
  data?: T;
}

// Specific API responses
export interface CardsResponse {
  success: boolean;
  cards?: Card[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: string;
}

export interface CreateCardResponse {
  success: boolean;
  card?: Card;
  error?: string;
  message?: string;
}
```

### 2. Type Axios Requests with Generics

Use axios generic type parameter to specify response type:

```typescript
// ✅ CORRECT - TypeScript knows response.data structure
const response = await axios.get<CardsResponse>('/api/cards');

if (response.data.success) {
  // TypeScript recognizes: response.data.cards
  setCards(response.data.cards || []);
} else {
  // TypeScript recognizes: response.data.error
  setError(response.data.error || 'Failed to fetch');
}
```

```typescript
// ❌ WRONG - TypeScript doesn't know response structure
const response = await axios.get('/api/cards');
const data = response.data as any; // Defeats type checking
```

### 3. Implement Type-Safe Error Handling

Always use proper error handling with type guards:

```typescript
try {
  const response = await axios.get<CardsResponse>('/api/cards');
  
  if (response.data.success) {
    // Handle success
  } else {
    // Handle API error
    throw new Error(response.data.error || 'Operation failed');
  }
} catch (err) {
  // Type-safe error handling
  if (axios.isAxiosError(err)) {
    // Axios-specific error (network, timeout, HTTP status)
    const errorMessage = err.response?.data?.error || err.message;
    console.error('API Error:', errorMessage);
  } else if (err instanceof Error) {
    // Standard JavaScript error
    console.error('Error:', err.message);
  } else {
    // Unknown error type
    console.error('Unexpected error:', err);
  }
}
```

### 4. Complete Example: Typed Context

```typescript
import axios from '@/lib/axios';
import { CardsResponse, CreateCardRequest, CreateCardResponse } from '@/types';

const fetchCards = async () => {
  try {
    // Type the response
    const response = await axios.get<CardsResponse>('/api/cards');
    
    // TypeScript now provides autocomplete and type checking
    if (response.data.success) {
      return response.data.cards || [];
    } else {
      throw new Error(response.data.error || 'Failed to fetch cards');
    }
  } catch (err) {
    if (axios.isAxiosError(err)) {
      throw new Error(err.response?.data?.error || 'Network error');
    }
    throw err;
  }
};

const createCard = async (cardData: CreateCardRequest) => {
  try {
    const response = await axios.post<CreateCardResponse>('/api/cards', cardData);
    
    if (response.data.success) {
      return response.data.card;
    } else {
      throw new Error(response.data.error || 'Failed to create card');
    }
  } catch (err) {
    if (axios.isAxiosError(err)) {
      throw new Error(err.response?.data?.error || 'Network error');
    }
    throw err;
  }
};
```

## Best Practices Checklist

### ✅ DO:
1. **Always type axios responses** using generics: `axios.get<ResponseType>(url)`
2. **Define interfaces** for all API responses in a central location
3. **Use type guards** for error handling: `axios.isAxiosError(err)`
4. **Avoid `any`** - use `unknown` if type is truly unknown, then narrow it
5. **Centralize types** in `types/index.ts` for reusability
6. **Handle both success and error cases** in API responses
7. **Use optional chaining** for nested properties: `err.response?.data?.error`

### ❌ DON'T:
1. **Don't use `as any`** - it defeats TypeScript's purpose
2. **Don't ignore error types** - use proper type guards
3. **Don't duplicate types** - centralize in one location
4. **Don't use `err: any`** - use proper error handling
5. **Don't assume response structure** - always check `success` flag
6. **Don't forget try/catch** - network errors can happen

## Common Patterns

### Pattern 1: GET Request with Query Parameters
```typescript
const response = await axios.get<CardsResponse>(
  `/api/cards?${params.toString()}`
);
```

### Pattern 2: POST Request with Body
```typescript
const response = await axios.post<CreateCardResponse>(
  '/api/cards',
  cardData
);
```

### Pattern 3: DELETE Request
```typescript
const response = await axios.delete<DeleteResponse>(
  `/api/cards/${id}`
);
```

### Pattern 4: PUT/PATCH Request
```typescript
const response = await axios.put<UpdateCardResponse>(
  `/api/cards/${id}`,
  updateData
);
```

## Debugging TypeScript Errors

### Error: "Property 'X' does not exist on type 'unknown'"
**Cause:** Response not typed
**Fix:** Add generic type to axios call
```typescript
// Before
const response = await axios.get('/api/cards');

// After
const response = await axios.get<CardsResponse>('/api/cards');
```

### Error: "Type 'any' is not assignable to type 'X'"
**Cause:** Using `as any` or implicit any
**Fix:** Define proper interface and use it
```typescript
// Before
const data = response.data as any;

// After
const response = await axios.get<CardsResponse>('/api/cards');
const data = response.data; // Properly typed
```

### Error: "Object is possibly 'undefined'"
**Cause:** Optional property access
**Fix:** Use optional chaining or null checks
```typescript
// Before
const cards = response.data.cards;

// After
const cards = response.data.cards || [];
// or
const cards = response.data.cards ?? [];
```

## Verification Steps

1. **Run TypeScript check:**
   ```bash
   npx tsc --noEmit
   ```

2. **Build the project:**
   ```bash
   npm run build
   ```

3. **Check for any type errors:**
   - No `as any` in code
   - All axios calls have type parameters
   - All error handlers use type guards

4. **Test runtime behavior:**
   - Success responses work correctly
   - Error responses are handled gracefully
   - Network errors don't crash the app

## API Response Format Standards

### Success Response:
```json
{
  "success": true,
  "cards": [...],
  "pagination": {...}
}
```

### Error Response:
```json
{
  "success": false,
  "error": "Error message here"
}
```

### Validation Error:
```json
{
  "success": false,
  "error": "Validation failed",
  "details": {
    "field": "error message"
  }
}
```

## Next.js 16+ Specific Notes

- Works with both App Router and Pages Router
- Use `'use client'` directive for client components using axios
- Server components should use `fetch` instead of axios
- API routes should return consistent response format

## Summary

The key to fixing TypeScript + axios errors is:
1. Define clear response interfaces
2. Type all axios calls with generics
3. Use proper error handling with type guards
4. Avoid `any` and `as any` casting
5. Centralize types for reusability

This ensures type safety at compile time and prevents runtime errors.


## Advanced: Using API Helper Functions

For even cleaner code, use the provided helper functions in `lib/api-helpers.ts`:

### Basic Usage

```typescript
import axios from '@/lib/axios';
import { apiGet, apiPost, handleApiError } from '@/lib/api-helpers';
import { CardsResponse, CreateCardResponse } from '@/types';

// GET request
const fetchCards = async () => {
  try {
    const data = await apiGet<CardsResponse>(axios, '/api/cards');
    return data.cards || [];
  } catch (err) {
    const message = handleApiError(err, 'Failed to fetch cards');
    throw new Error(message);
  }
};

// POST request
const createCard = async (cardData: CreateCardRequest) => {
  try {
    const data = await apiPost<CreateCardResponse>(axios, '/api/cards', cardData);
    return data.card;
  } catch (err) {
    const message = handleApiError(err, 'Failed to create card');
    throw new Error(message);
  }
};
```

### Benefits of Helper Functions

1. **Consistent error handling** - All errors handled the same way
2. **Less boilerplate** - No need to repeat try/catch patterns
3. **Type safety** - Generic types ensure correct response types
4. **Better error messages** - Automatic extraction of error details
5. **Centralized logic** - Easy to update error handling globally

### Helper Functions Available

- `apiGet<T>(axios, url, config?)` - Type-safe GET requests
- `apiPost<T>(axios, url, data?, config?)` - Type-safe POST requests
- `apiPut<T>(axios, url, data?, config?)` - Type-safe PUT requests
- `apiDelete<T>(axios, url, config?)` - Type-safe DELETE requests
- `apiPatch<T>(axios, url, data?, config?)` - Type-safe PATCH requests
- `handleApiError(error, fallback?)` - Extract error message
- `getErrorMessage(error)` - Get error message from any error type
- `isAxiosError(error)` - Type guard for Axios errors

### Example: Complete Context with Helpers

```typescript
import { apiGet, apiPost, handleApiError } from '@/lib/api-helpers';
import axios from '@/lib/axios';

const CardsContext = () => {
  const fetchCards = async () => {
    setLoading(true);
    try {
      const data = await apiGet<CardsResponse>(
        axios,
        `/api/cards?${params.toString()}`
      );
      
      if (data.success) {
        setCards(data.cards || []);
      } else {
        setError(data.error || 'Failed to fetch cards');
      }
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const createCard = async (cardData: CreateCardRequest) => {
    try {
      const data = await apiPost<CreateCardResponse>(
        axios,
        '/api/cards',
        cardData
      );
      
      if (data.success) {
        await fetchCards();
      } else {
        throw new Error(data.error || 'Failed to create card');
      }
    } catch (err) {
      throw new Error(handleApiError(err));
    }
  };
};
```

## Testing Your Fix

### Run TypeScript Check
```bash
npx tsc --noEmit
```

### Run Build
```bash
npm run build
```

### Run Automated Test
```bash
test-typescript-build.bat
```

This script will:
1. Check TypeScript configuration
2. Run type checking
3. Build the project
4. Report any errors

## Migration Checklist

Use this checklist to migrate existing code:

- [ ] Define all API response interfaces in `types/index.ts`
- [ ] Replace `err: any` with proper error handling
- [ ] Remove all `as any` casts from axios responses
- [ ] Add generic types to all axios calls: `axios.get<Type>(url)`
- [ ] Use `axios.isAxiosError(err)` for error type checking
- [ ] Replace `err.message` with `handleApiError(err)`
- [ ] Test with `npx tsc --noEmit`
- [ ] Test with `npm run build`
- [ ] Verify runtime behavior

## Common Files to Update

1. **Contexts** (`contexts/*.tsx`)
   - CardsContext ✅ Fixed
   - AIProvider
   - CardsProvider
   - DocumentsProvider
   - MembersProvider
   - NotesProvider
   - WorkspacesProvider
   - ChatProvider

2. **Hooks** (`hooks/*.ts`)
   - useCards
   - useNotifications
   - useNote
   - useMembers
   - useAuth

3. **Components** (`components/**/*.tsx`)
   - All components with axios calls

4. **Pages** (`app/**/*.tsx`)
   - All pages with API calls

## Quick Migration Example

### Before (❌ Wrong)
```typescript
try {
  const response = await axios.get('/api/cards');
  const data = response.data as any;
  if (data.success) {
    setCards(data.cards);
  }
} catch (err: any) {
  setError(err.message);
}
```

### After (✅ Correct)
```typescript
try {
  const response = await axios.get<CardsResponse>('/api/cards');
  if (response.data.success) {
    setCards(response.data.cards || []);
  } else {
    setError(response.data.error || 'Failed');
  }
} catch (err) {
  if (axios.isAxiosError(err)) {
    setError(err.response?.data?.error || err.message);
  } else if (err instanceof Error) {
    setError(err.message);
  } else {
    setError('An unexpected error occurred');
  }
}
```

### After with Helpers (✅ Best)
```typescript
try {
  const data = await apiGet<CardsResponse>(axios, '/api/cards');
  if (data.success) {
    setCards(data.cards || []);
  } else {
    setError(data.error || 'Failed');
  }
} catch (err) {
  setError(handleApiError(err));
}
```

## Resources

- [Axios TypeScript Documentation](https://axios-http.com/docs/typescript)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Next.js TypeScript](https://nextjs.org/docs/app/building-your-application/configuring/typescript)

## Support

If you encounter issues:

1. Check `AXIOS_TYPESCRIPT_QUICK_FIX.md` for quick solutions
2. Run `npx tsc --noEmit` to see all TypeScript errors
3. Check the error message carefully - it usually tells you what's wrong
4. Verify your response interface matches the actual API response
5. Use `console.log(response.data)` to see the actual response structure

## Summary

✅ **Fixed Files:**
- `types/index.ts` - Added comprehensive response types
- `contexts/CardsContext.tsx` - Properly typed all axios calls
- `lib/api-helpers.ts` - Created reusable helper functions

✅ **Key Changes:**
- All axios calls now use generic types
- Error handling uses type guards
- No more `as any` or `err: any`
- Centralized error handling logic

✅ **Benefits:**
- TypeScript catches errors at compile time
- Better IDE autocomplete
- Safer refactoring
- Consistent error handling
- Easier debugging

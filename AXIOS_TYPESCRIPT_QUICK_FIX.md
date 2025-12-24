# Quick Fix: Axios TypeScript Errors

## The Problem
```typescript
// ❌ TypeScript Error: 'response.data' is of type 'unknown'
const response = await axios.get('/api/cards');
if (response.data.success) { // Error here!
  setCards(response.data.cards);
}
```

## The Solution
```typescript
// ✅ Type the response with generics
const response = await axios.get<CardsResponse>('/api/cards');
if (response.data.success) { // Works!
  setCards(response.data.cards || []);
}
```

## Step-by-Step Fix

### 1. Define Response Interface (types/index.ts)
```typescript
export interface CardsResponse {
  success: boolean;
  cards?: Card[];
  error?: string;
}
```

### 2. Import and Use the Type
```typescript
import { CardsResponse } from '@/types';

// Add generic type parameter
const response = await axios.get<CardsResponse>('/api/cards');
```

### 3. Add Proper Error Handling
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
  }
}
```

## All HTTP Methods

```typescript
// GET
const response = await axios.get<CardsResponse>('/api/cards');

// POST
const response = await axios.post<CreateCardResponse>('/api/cards', data);

// PUT
const response = await axios.put<UpdateCardResponse>('/api/cards/123', data);

// DELETE
const response = await axios.delete<DeleteResponse>('/api/cards/123');

// PATCH
const response = await axios.patch<UpdateCardResponse>('/api/cards/123', data);
```

## Verify the Fix

```bash
# Check TypeScript errors
npx tsc --noEmit

# Build the project
npm run build
```

## Key Rules

1. ✅ Always type axios responses: `axios.get<Type>(url)`
2. ✅ Use `axios.isAxiosError(err)` for error handling
3. ✅ Define interfaces in `types/index.ts`
4. ❌ Never use `as any` or `err: any`
5. ❌ Never ignore TypeScript errors

## Common Response Types

```typescript
// Success with data
interface SuccessResponse<T> {
  success: true;
  data: T;
}

// Error response
interface ErrorResponse {
  success: false;
  error: string;
}

// Combined
type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;
```

## Files Modified

✅ `types/index.ts` - Added response interfaces
✅ `contexts/CardsContext.tsx` - Fixed axios typing
✅ All TypeScript errors resolved

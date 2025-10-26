# TypeScript Advanced Patterns

## Advanced Type Patterns

### Generic Components
```typescript
// ✅ Generic component with constraints
interface GenericComponentProps<T extends Record<string, unknown>> {
  data: T;
  renderItem: (item: T) => React.ReactNode;
  keyExtractor: (item: T) => string;
}

export default function GenericComponent<T extends Record<string, unknown>>({
  data,
  renderItem,
  keyExtractor
}: GenericComponentProps<T>): JSX.Element {
  return (
    <div>
      {Object.entries(data).map(([key, value]) => (
        <div key={keyExtractor(value as T)}>
          {renderItem(value as T)}
        </div>
      ))}
    </div>
  );
}
```

### Utility Types
```typescript
// ✅ Utility types for better type safety
type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

// Usage
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

type CreateUser = PartialBy<User, 'id'>; // id is optional
type UpdateUser = PartialBy<User, 'id' | 'role'>; // id and role are optional
```

### Discriminated Unions
```typescript
// ✅ Discriminated unions for type safety
type LoadingState = {
  status: 'loading';
};

type SuccessState = {
  status: 'success';
  data: User[];
};

type ErrorState = {
  status: 'error';
  error: string;
};

type AsyncState = LoadingState | SuccessState | ErrorState;

function handleState(state: AsyncState): string {
  switch (state.status) {
    case 'loading':
      return 'Loading...';
    case 'success':
      return `Loaded ${state.data.length} users`;
    case 'error':
      return `Error: ${state.error}`;
    default:
      // TypeScript ensures all cases are handled
      const _exhaustive: never = state;
      return _exhaustive;
  }
}
```

## Error Handling Patterns

### Result Type Pattern
```typescript
// ✅ Result type for better error handling
type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

async function fetchUser(id: string): Promise<Result<User, string>> {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return { success: false, error: 'User not found' };
    }
    return { success: true, data: user };
  } catch (error) {
    return { success: false, error: 'Database error' };
  }
}

// Usage
const result = await fetchUser('123');
if (result.success) {
  console.log(result.data.name); // TypeScript knows this is User
} else {
  console.error(result.error); // TypeScript knows this is string
}
```

## Performance Optimization

### Memoization with Types
```typescript
// ✅ Memoization with proper typing
function memoize<T extends (...args: any[]) => any>(
  fn: T
): T & { clear: () => void } {
  const cache = new Map<string, ReturnType<T>>();
  
  const memoized = ((...args: Parameters<T>): ReturnType<T> => {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    
    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T & { clear: () => void };
  
  memoized.clear = () => cache.clear();
  
  return memoized;
}
```

## Future Enhancements
- [ ] Add more advanced generic patterns
- [ ] Include performance monitoring types
- [ ] Add testing utility types
- [ ] Include state management patterns
- [ ] Add API client type patterns

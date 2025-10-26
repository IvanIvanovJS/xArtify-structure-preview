---
inclusion: fileMatch
fileMatchPattern: ['**/*.ts', '**/*.tsx']
---

# TypeScript Patterns

## Critical Rules
- **NEVER use `any` type** - always provide explicit types
- Use `interface` for object shapes, `type` for unions/primitives
- Always type function parameters and return values
- Use generic types for reusable components
- Prefer `const assertions` for immutable data
- Use `satisfies` operator for type checking without widening

## Component Patterns
```typescript
// ✅ Correct component typing
interface ComponentProps {
  title: string;
  isVisible: boolean;
  onAction: (id: string) => void;
  children?: React.ReactNode;
}

export default function Component({ title, isVisible, onAction, children }: ComponentProps): JSX.Element {
  // Implementation
}

// ❌ Never do this
function Component(props: any) {
  // Implementation
}
```

## API Route Patterns
```typescript
// ✅ Correct API route typing
export async function GET(): Promise<NextResponse> {
  try {
    const data = await prisma.model.findMany();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ message: 'Error occurred' }, { status: 500 });
  }
}
```

## Form Handling
```typescript
// ✅ React Hook Form with Zod validation
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const form = useForm<FormData>({
  resolver: zodResolver(FormSchema),
  defaultValues: { /* ... */ },
});
```

## State Management
```typescript
// ✅ Use SWR for server state
import useSWR from 'swr';

const { data, error, isLoading } = useSWR('/api/paintings', fetcher);
```

## Context Usage
```typescript
// ✅ Proper context implementation
const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  // Implementation
}
```

## Import Conventions
```typescript
// ✅ Proper import order
import { type NextRequest } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { validateInput } from "@/lib/validators";
```

## Reference
For detailed TypeScript patterns and edge cases, see: `docs/cursor-agent/typescript-advanced.md`
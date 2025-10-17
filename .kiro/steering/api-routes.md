---
inclusion: fileMatch
fileMatchPattern: ['**/app/api/**/*.ts']
---

# API Routes

## Critical Rules
- **ALWAYS check session** in protected routes: `const session = await getServerSession(authOptions)`
- **ALWAYS validate inputs** with Zod schemas
- **ALWAYS implement rate limiting** on all API endpoints
- **ALWAYS use proper error handling** with try-catch blocks
- **ALWAYS return proper HTTP status codes**

## Authentication & Authorization
```typescript
// ✅ Session validation in protected routes
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  
  // Use role-based access control
  if (session.user?.role !== "ADMIN") {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }
  
  // Implementation
}
```

## Data Validation
```typescript
// ✅ Always validate with Zod
import { z } from "zod";

const CreatePaintingSchema = z.object({
  title: z.string().min(1).max(140),
  price: z.number().positive(),
  images: z.array(z.string().url()).min(1).max(10),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = CreatePaintingSchema.parse(body);
    // Process validated data
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Invalid data', errors: error.errors }, { status: 400 });
    }
    throw error;
  }
}
```

## Error Handling Pattern
```typescript
// ✅ Proper error handling
export async function apiHandler(req: Request) {
  try {
    const data = await processRequest(req);
    return NextResponse.json(data);
  } catch (error) {
    console.error('API Error:', error);
    
    if (error instanceof ValidationError) {
      return NextResponse.json({ message: 'Invalid data' }, { status: 400 });
    }
    
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
```

## Rate Limiting
```typescript
// ✅ Implement rate limiting
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"),
});

export async function POST(req: Request) {
  const ip = req.ip ?? "127.0.0.1";
  const { success } = await ratelimit.limit(ip);
  
  if (!success) {
    return NextResponse.json({ message: 'Rate limit exceeded' }, { status: 429 });
  }
  
  // Implementation
}
```

## Security Headers
- CSP with nonce-based script execution
- HSTS in production
- X-Frame-Options: DENY
- Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin

## Reference
For detailed error handling and retry strategies, see: `docs/cursor-agent/error-handling.md`
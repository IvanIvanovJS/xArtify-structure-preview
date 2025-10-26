---
inclusion: fileMatch
fileMatchPattern: ['**/app/(auth)/**', '**/middleware.ts']
---

# Authentication

## Critical Rules
- **ALWAYS check session** in protected routes: `const session = await getServerSession(authOptions)`
- **ALWAYS use role-based access control**: `session?.user?.role === "ADMIN"`
- **ALWAYS implement CSRF protection** and secure headers
- **ALWAYS validate session** before accessing protected resources

## Session Validation Pattern
```typescript
// ✅ Session validation in protected routes
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function GET() {
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

## Role-Based Access Control
```typescript
// ✅ Role-based access control
const session = await getServerSession(authOptions);

// Check for specific roles
if (session?.user?.role === "ADMIN") {
  // Admin-only functionality
} else if (session?.user?.role === "ARTIST") {
  // Artist-specific functionality
} else {
  // Regular user functionality
}
```

## Middleware Authentication
```typescript
// ✅ Middleware pattern for route protection
import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req) {
    // Additional middleware logic
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Custom authorization logic
        if (req.nextUrl.pathname.startsWith("/admin")) {
          return token?.role === "ADMIN";
        }
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ["/admin/:path*", "/artist/:path*", "/my-profile/:path*"]
};
```

## CSRF Protection
```typescript
// ✅ CSRF protection in forms
import { getCsrfToken } from "next-auth/react";

export default function ProtectedForm() {
  const [csrfToken, setCsrfToken] = useState<string>("");
  
  useEffect(() => {
    getCsrfToken().then(setCsrfToken);
  }, []);
  
  return (
    <form>
      <input name="csrfToken" type="hidden" defaultValue={csrfToken} />
      {/* Form fields */}
    </form>
  );
}
```

## Security Headers
```typescript
// ✅ Security headers in middleware
export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  return response;
}
```

## Session Management
```typescript
// ✅ Proper session handling
import { useSession } from "next-auth/react";

export default function ProtectedComponent() {
  const { data: session, status } = useSession();
  
  if (status === "loading") {
    return <div>Loading...</div>;
  }
  
  if (status === "unauthenticated") {
    return <div>Please sign in</div>;
  }
  
  return (
    <div>
      Welcome, {session?.user?.name}!
    </div>
  );
}
```

## Password Security
```typescript
// ✅ Password validation
import bcrypt from 'bcryptjs';

// Hash password
const hashedPassword = await bcrypt.hash(password, 12);

// Verify password
const isValidPassword = await bcrypt.compare(password, hashedPassword);
```

## Rate Limiting for Auth
```typescript
// ✅ Rate limiting for authentication endpoints
import { Ratelimit } from "@upstash/ratelimit";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "1 m"), // 5 attempts per minute
});

export async function POST(req: Request) {
  const ip = req.ip ?? "127.0.0.1";
  const { success } = await ratelimit.limit(ip);
  
  if (!success) {
    return NextResponse.json({ message: 'Too many attempts' }, { status: 429 });
  }
  
  // Authentication logic
}
```

## Reference
For comprehensive security guidelines, see: `docs/cursor-agent/security-checklist.md`
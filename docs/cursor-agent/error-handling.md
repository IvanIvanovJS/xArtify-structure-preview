# Error Handling & Resilience

## Retry Strategy

### Exponential Backoff
```typescript
// ✅ REQUIRED: Exponential backoff for external APIs
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries) throw error;
      
      const delay = baseDelay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('Max retries exceeded');
}

// Usage for Stripe/Supabase calls
const paymentIntent = await retryWithBackoff(() => 
  stripe.paymentIntents.create({ amount, currency: 'bgn' })
);
```

### Circuit Breaker Pattern
```typescript
// ✅ Circuit breaker for failing services
class CircuitBreaker {
  private failureCount = 0;
  private lastFailureTime = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  
  constructor(
    private threshold: number = 5,
    private timeout: number = 60000
  ) {}
  
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }
    
    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
  
  private onSuccess() {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }
  
  private onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    if (this.failureCount >= this.threshold) {
      this.state = 'OPEN';
    }
  }
}
```

## Fallback Strategy

### Graceful Degradation
```typescript
// ✅ REQUIRED: Graceful degradation
async function uploadWithFallback(file: File): Promise<string> {
  try {
    return await cloudinaryUpload(file);
  } catch (error) {
    console.warn('Cloudinary failed, using Supabase fallback');
    return await supabaseUpload(file);
  }
}

// Multiple fallback levels
async function getDataWithFallbacks(): Promise<Data> {
  const fallbacks = [
    () => fetchFromPrimaryAPI(),
    () => fetchFromSecondaryAPI(),
    () => fetchFromCache(),
    () => getDefaultData()
  ];
  
  for (const fallback of fallbacks) {
    try {
      return await fallback();
    } catch (error) {
      console.warn('Fallback failed:', error);
      continue;
    }
  }
  
  throw new Error('All fallbacks failed');
}
```

## User Feedback

### Status Management
```typescript
// ✅ REQUIRED: Always provide user feedback
type UploadStatus = 'idle' | 'uploading' | 'retrying' | 'success' | 'error';

const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');

const handleUpload = async () => {
  setUploadStatus('uploading');
  try {
    await uploadFile();
    setUploadStatus('success');
  } catch (error) {
    setUploadStatus('retrying');
    // Show "Upload failed, retrying..." message
  }
};
```

### Error Messages
```typescript
// ✅ User-friendly error messages
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    switch (error.message) {
      case 'NETWORK_ERROR':
        return 'Please check your internet connection and try again.';
      case 'VALIDATION_ERROR':
        return 'Please check your input and try again.';
      case 'AUTHENTICATION_ERROR':
        return 'Please log in again to continue.';
      default:
        return 'Something went wrong. Please try again.';
    }
  }
  return 'An unexpected error occurred.';
}
```

## Logging Levels

### Structured Logging
```typescript
// ✅ REQUIRED: Consistent logging levels
enum LogLevel {
  INFO = 'info',
  WARN = 'warn', 
  ERROR = 'error',
  CRITICAL = 'critical'
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: Record<string, unknown>;
}

class Logger {
  log(level: LogLevel, message: string, context?: Record<string, unknown>) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      context
    };
    
    console.log(JSON.stringify(entry));
  }
  
  info(message: string, context?: Record<string, unknown>) {
    this.log(LogLevel.INFO, message, context);
  }
  
  warn(message: string, context?: Record<string, unknown>) {
    this.log(LogLevel.WARN, message, context);
  }
  
  error(message: string, context?: Record<string, unknown>) {
    this.log(LogLevel.ERROR, message, context);
  }
  
  critical(message: string, context?: Record<string, unknown>) {
    this.log(LogLevel.CRITICAL, message, context);
  }
}

// Usage examples
const logger = new Logger();

// Info: Normal operations
logger.info('User login', { userId, email, timestamp });

// Warn: Retry attempts, degraded service
logger.warn('API retry attempt', { endpoint, attempt: 2, maxRetries: 3 });

// Error: Failed payments, invalid input
logger.error('Payment failed', { userId, amount, error: error.message });

// Critical: Security violations, DB corruption
logger.critical('Security violation', { userId, action: 'unauthorized_access', ip });
```

## API Error Handling

### Consistent Error Responses
```typescript
// ✅ Standardized error response format
interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
    timestamp: string;
  };
}

export function createErrorResponse(
  code: string,
  message: string,
  details?: Record<string, unknown>
): NextResponse {
  const errorResponse: ErrorResponse = {
    error: {
      code,
      message,
      details,
      timestamp: new Date().toISOString()
    }
  };
  
  return NextResponse.json(errorResponse, { status: 400 });
}

// Usage in API routes
export async function POST(req: Request) {
  try {
    // API logic
  } catch (error) {
    if (error instanceof ValidationError) {
      return createErrorResponse('VALIDATION_ERROR', 'Invalid input data', error.details);
    }
    
    if (error instanceof AuthenticationError) {
      return createErrorResponse('AUTH_ERROR', 'Authentication required');
    }
    
    return createErrorResponse('INTERNAL_ERROR', 'Internal server error');
  }
}
```

## Database Error Handling

### Transaction Safety
```typescript
// ✅ Safe database transactions
async function safeTransaction<T>(
  operations: (tx: PrismaTransaction) => Promise<T>
): Promise<T> {
  return await prisma.$transaction(async (tx) => {
    try {
      return await operations(tx);
    } catch (error) {
      // Log the error but let the transaction rollback
      logger.error('Transaction failed', { error: error.message });
      throw error;
    }
  });
}

// Usage
await safeTransaction(async (tx) => {
  await tx.user.create({ data: userData });
  await tx.profile.create({ data: profileData });
});
```

## Future Enhancements
- [ ] Add monitoring and alerting patterns
- [ ] Include performance monitoring
- [ ] Add error recovery strategies
- [ ] Include chaos engineering patterns
- [ ] Add automated testing for error scenarios

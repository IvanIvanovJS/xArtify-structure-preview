# Security Checklist

## Authentication & Authorization

### Session Management
- [ ] Always check session in protected routes
- [ ] Use role-based access control
- [ ] Implement proper session timeout
- [ ] Use secure session storage
- [ ] Implement CSRF protection

### Password Security
- [ ] Hash passwords with bcrypt (minimum 12 rounds)
- [ ] Implement password strength requirements
- [ ] Use secure password reset flows
- [ ] Implement account lockout after failed attempts
- [ ] Store password hashes securely

## API Security

### Input Validation
- [ ] Validate all inputs with Zod schemas
- [ ] Sanitize user inputs
- [ ] Implement rate limiting
- [ ] Use proper HTTP status codes
- [ ] Implement request size limits

### Headers & CORS
- [ ] Set security headers (CSP, HSTS, X-Frame-Options)
- [ ] Configure CORS properly
- [ ] Use HTTPS in production
- [ ] Implement proper error handling
- [ ] Log security events

## Database Security

### RLS Policies
- [ ] Enable RLS on all tables
- [ ] Create policies for SELECT, INSERT, UPDATE, DELETE
- [ ] Test policies with different user roles
- [ ] Document policy logic
- [ ] Store policies in @supabasePolicies/

### Data Protection
- [ ] Encrypt sensitive data
- [ ] Use parameterized queries
- [ ] Implement proper backup procedures
- [ ] Monitor database access
- [ ] Regular security audits

## Future Enhancements
- [ ] Add OWASP compliance checklist
- [ ] Include penetration testing guidelines
- [ ] Add security monitoring patterns
- [ ] Include incident response procedures

# Profile Dashboard System

## Overview

The Profile Dashboard system provides users with a comprehensive interface to manage their account settings, view their data, and access various platform features. The system is designed with a mobile-first approach and follows the xArtify design system.

## Architecture

### Layout Structure

The profile dashboard uses a nested layout system:

- **Main Profile Page** (`/my-profile`): Shows the overview with navigation cards
- **Dashboard Mode** (`/my-profile/*`): Shows sidebar navigation with content area

### Components

#### 1. Profile Layout (`app/my-profile/layout.tsx`)
- **Purpose**: Provides sidebar navigation for dashboard sections
- **Features**:
  - Responsive sidebar with mobile hamburger menu
  - Active state highlighting
  - Back navigation to main profile page
  - Mobile overlay for sidebar

#### 2. Settings Page (`app/my-profile/settings/page.tsx`)
- **Purpose**: User account management interface
- **Features**:
  - Profile image upload
  - Name and email editing
  - Password change functionality
  - Account deletion with confirmation

## API Endpoints

### Profile Update (`/api/profile/update`)
- **Method**: PUT
- **Purpose**: Update user profile information
- **Authentication**: Required
- **Rate Limiting**: Yes
- **Validation**: Zod schema validation

**Request Body**:
```typescript
{
  name: string;
  email: string;
  currentPassword?: string; // Required if changing password
  newPassword?: string;     // Required if changing password
}
```

**Response**:
```typescript
{
  message: string;
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
    role: string;
    updatedAt: Date;
  }
}
```

### Image Upload (`/api/profile/upload-image`)
- **Method**: POST
- **Purpose**: Upload and update profile image
- **Authentication**: Required
- **Rate Limiting**: Yes
- **File Validation**: Image files only, max 5MB

**Request**: FormData with `image` field

**Response**:
```typescript
{
  message: string;
  imagePath: string;
  user: UserObject;
}
```

### Account Deletion (`/api/profile/delete`)
- **Method**: DELETE
- **Purpose**: Delete user account permanently
- **Authentication**: Required
- **Rate Limiting**: Yes
- **Security**: Password confirmation required

**Request Body**:
```typescript
{
  password: string; // Current password for confirmation
}
```

**Response**:
```typescript
{
  message: string;
}
```

## Security Features

### Authentication & Authorization
- All endpoints require valid session
- Users can only modify their own data
- Admin accounts cannot be deleted
- Password verification for sensitive operations

### Rate Limiting
- All endpoints protected with rate limiting
- Prevents abuse and brute force attacks
- Configurable limits per endpoint

### Input Validation
- Zod schema validation for all inputs
- File type and size validation for uploads
- Email format validation
- Password strength requirements

### Data Protection
- Passwords hashed with bcrypt (12 rounds)
- File uploads stored securely
- Old images automatically deleted
- Cascade deletion for related data

## Database Security

### Row Level Security (RLS) Policies

The system implements comprehensive RLS policies to ensure data isolation:

#### Users Table
- Users can only view/update/delete their own profile
- Policies: `Users can view own profile`, `Users can update own profile`, `Users can delete own profile`

#### Artist Profiles Table
- Artists can only manage their own artist profile
- Policies: `Artists can view own profile`, `Artists can insert own profile`, `Artists can update own profile`, `Artists can delete own profile`

#### Authentication Tables
- Users can only access their own account and session data
- Policies for accounts, sessions, and password reset tokens

## User Experience

### Mobile-First Design
- Responsive sidebar that collapses on mobile
- Touch-friendly interface elements
- Optimized for thumb navigation
- Mobile hamburger menu for navigation

### Accessibility
- Proper ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility
- Focus management

### Visual Design
- Consistent with xArtify design system
- Grayscale + neon color scheme
- Smooth transitions and animations
- Loading states and error handling

## File Structure

```
app/my-profile/
├── layout.tsx                 # Dashboard layout with sidebar
├── page.tsx                   # Main profile overview
├── settings/
│   └── page.tsx              # Settings management page
└── styles/
    └── profile-dashboard.css # Dashboard-specific styles

app/api/profile/
├── update/
│   └── route.ts              # Profile update endpoint
├── upload-image/
│   └── route.ts              # Image upload endpoint
└── delete/
    └── route.ts              # Account deletion endpoint

supabasePolicies/
└── user-profile-rls-policies.sql # Database security policies
```

## Error Handling

### Client-Side
- Form validation with real-time feedback
- Loading states during operations
- Success/error message display
- Graceful degradation for network issues

### Server-Side
- Comprehensive error logging
- User-friendly error messages
- Proper HTTP status codes
- Input validation with detailed feedback

## Performance Optimizations

### Image Handling
- Automatic image optimization
- File size validation (5MB max)
- Unique filename generation
- Old image cleanup

### Database Operations
- Efficient queries with proper indexing
- Transaction handling for data consistency
- Cascade deletion for related records

### Caching
- Rate limiting with Redis
- Session-based caching
- Optimized database queries

## Future Enhancements

- [ ] Two-factor authentication support
- [ ] Social media account linking
- [ ] Advanced privacy settings
- [ ] Data export functionality
- [ ] Account recovery options
- [ ] Activity log and audit trail
- [ ] Notification preferences
- [ ] Theme customization
- [ ] Language preferences
- [ ] Advanced security settings

## Testing

### Unit Tests
- Component rendering tests
- Form validation tests
- API endpoint tests
- Error handling tests

### Integration Tests
- End-to-end user flows
- Database operation tests
- File upload tests
- Authentication flow tests

### Security Tests
- RLS policy verification
- Rate limiting tests
- Input validation tests
- Authorization tests

## Deployment Considerations

### Environment Variables
- Database connection strings
- File upload paths
- Rate limiting configuration
- Security keys and secrets

### File Storage
- Local file system for development
- Cloud storage for production
- CDN integration for images
- Backup and recovery procedures

### Monitoring
- Error tracking and logging
- Performance monitoring
- Security event logging
- User activity analytics

## Maintenance

### Regular Tasks
- Database cleanup of old files
- Security policy updates
- Performance optimization
- User feedback implementation

### Security Updates
- Regular dependency updates
- Security patch management
- Policy review and updates
- Penetration testing

## Support

### User Support
- Clear error messages
- Help documentation
- Contact information
- FAQ section

### Developer Support
- Comprehensive documentation
- Code comments and examples
- Testing guidelines
- Deployment procedures
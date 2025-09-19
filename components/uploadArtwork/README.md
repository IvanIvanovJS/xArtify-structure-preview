# Upload Artwork Components

This directory contains the refactored upload artwork functionality for the xArtify art platform. The components are modular, secure, and follow modern React patterns with TypeScript.

## Components Overview

### 1. UploadArtwork.tsx
Main component that orchestrates the upload artwork page. Includes:
- Authorization guard integration
- Filter options fetching
- Layout with main content and sidebar
- Modern, mobile-first design

### 2. UploadArtworkForm.tsx
Comprehensive form for creating new paintings with:
- React Hook Form with Zod validation
- File upload with preview
- Progress tracking
- Error handling and retry logic
- Mobile-optimized UI

### 3. AuthorizationGuard.tsx
Server-side authorization in page component:
- Checks for authentication
- Validates artist profile or admin role
- Redirects unauthorized users
- No client-side API calls needed


## Features

### Security
- ✅ Authentication required
- ✅ Artist profile or ADMIN role required
- ✅ Rate limiting on uploads
- ✅ File type and size validation
- ✅ Image processing with Sharp
- ✅ Secure Cloudinary integration

### User Experience
- ✅ Mobile-first responsive design
- ✅ Real-time form validation
- ✅ Progress indicators
- ✅ Error handling with retry
- ✅ Success feedback
- ✅ Loading states

### Technical
- ✅ TypeScript with strict typing
- ✅ Zod validation schemas
- ✅ React Hook Form integration
- ✅ Modular CSS architecture
- ✅ Proper error boundaries
- ✅ Accessibility features

## File Structure

```
components/uploadArtwork/
├── UploadArtwork.tsx              # Main component
├── UploadArtworkForm.tsx          # Form component
├── types.ts                       # TypeScript definitions
├── README.md                      # This file
└── styles/
    ├── upload-artwork.css         # Main page styles
    └── upload-form.css            # Form styles
```

## API Integration

### Upload Endpoint (`/api/upload`)
- Handles image uploads to Cloudinary
- Image processing with Sharp
- Security validation
- Retry logic with exponential backoff

### Paintings Endpoint (`/api/paintings`)
- Creates new painting records
- Comprehensive validation
- Slug generation
- Transaction safety


## Usage

```tsx
import UploadArtwork from '@/components/uploadArtwork/UploadArtwork';

export default function UploadPage() {
  return <UploadArtwork />;
}
```

## Environment Variables

Required environment variables:
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `CLOUDINARY_FOLDER`
- `UPLOAD_FORCE_WEBP` (optional)

## Dependencies

- `react-hook-form` - Form management
- `@hookform/resolvers` - Form validation
- `zod` - Schema validation
- `lucide-react` - Icons
- `sharp` - Image processing
- `cloudinary` - Image storage

## Security Considerations

1. **Authentication**: All endpoints require valid session
2. **Authorization**: Only artists and admins can upload
3. **File Validation**: Strict file type and size limits
4. **Rate Limiting**: Prevents abuse
5. **Image Processing**: Removes EXIF data and resizes
6. **Input Validation**: Comprehensive Zod schemas
7. **Error Handling**: No sensitive data exposure

## Mobile Optimization

- Touch-friendly interface (44px minimum touch targets)
- Responsive grid layouts
- Optimized form inputs
- Mobile-specific navigation
- Progressive enhancement

## Accessibility

- Semantic HTML structure
- ARIA labels and descriptions
- Keyboard navigation support
- Screen reader compatibility
- Color contrast compliance
- Focus management

## Performance

- Lazy loading of components
- Image optimization
- Efficient re-renders
- Debounced search
- Optimized bundle size
- CDN integration

## Future Enhancements

- [ ] Drag and drop file upload
- [ ] Image editing capabilities
- [ ] Batch upload functionality
- [ ] Advanced image metadata
- [ ] AI-powered tagging
- [ ] Real-time collaboration
- [ ] Gallery integration for inspiration

# Artwork Gallery Components

This directory contains the modern, luxurious artwork gallery components for the xArtify platform, featuring beautiful UI/UX design that creates a premium gallery experience.

## Components Overview

### 1. ArtworkGallery.tsx
Main gallery component that displays a grid of artwork cards with loading states and empty states.

**Features:**
- Responsive grid layout (auto-fill with minmax)
- Loading skeleton states
- Empty state with helpful messaging
- Mobile-first responsive design
- Support for sold items filtering

**Props:**
```typescript
interface ArtworkGalleryProps {
    paintings: PaintingWithArtist[];
    isLoading?: boolean;
    onPaintingClick?: (painting: PaintingWithArtist) => void;
    showSold?: boolean;
    className?: string;
}
```

### 2. PaintingDetailPage.tsx
Comprehensive painting detail page with all artist information, technical details, and interactive features.

**Features:**
- Beautiful image gallery with thumbnails
- Complete painting information display
- Promotion pricing with discount badges
- Technical details (dimensions, materials, technique, style, subject)
- Tags display
- Buy and favorite buttons
- Social sharing functionality
- Mobile-responsive design
- Owner editing capabilities

**Props:**
```typescript
interface PaintingDetailPageProps {
    painting: PaintingWithArtist;
    isOwner?: boolean;
    className?: string;
}
```

### 3. ImageGallery.tsx
Interactive image gallery component for displaying multiple painting images.

**Features:**
- Thumbnail navigation
- Expandable thumbnail view
- Active image highlighting
- Responsive design
- Accessibility support

**Props:**
```typescript
interface ImageGalleryProps {
    images: string[];
    selectedIndex: number;
    onImageSelect: (index: number) => void;
    className?: string;
}
```

### 4. SocialShareButtons.tsx
Comprehensive social media sharing component with support for all major platforms.

**Supported Platforms:**
- Facebook
- Twitter
- Instagram (copies image URL)
- Pinterest
- LinkedIn
- WhatsApp
- Telegram
- Copy Link

**Features:**
- Platform-specific sharing URLs
- Copy to clipboard functionality
- Visual feedback for copied state
- Responsive grid layout
- Accessibility support

**Props:**
```typescript
interface SocialShareButtonsProps {
    title: string;
    description: string;
    image: string;
    url: string;
    className?: string;
}
```

### 5. FavoriteButton.tsx
Interactive favorite button with authentication integration.

**Features:**
- Heart icon with fill animation
- Authentication state handling
- Loading states
- API integration for favorites
- Visual feedback
- Redirect to login for unauthenticated users

**Props:**
```typescript
interface FavoriteButtonProps {
    paintingId: string;
    className?: string;
}
```

## Styling

### CSS Architecture
All components use separate CSS files following the established pattern:
- `artwork-gallery.css` - Main gallery styles
- `painting-detail.css` - Detail page styles with modal support
- `image-gallery.css` - Image gallery specific styles
- `social-share.css` - Social sharing button styles
- `favorite-button.css` - Favorite button styles

### Design System
- **Color Palette**: Uses CSS custom properties for consistent theming
- **Typography**: Inter font with proper hierarchy
- **Spacing**: Consistent spacing scale
- **Animations**: Smooth transitions and hover effects
- **Responsive**: Mobile-first approach with breakpoints

### Key Design Features
- **Luxury Feel**: Premium gradients, shadows, and animations
- **Accessibility**: Proper ARIA labels, keyboard navigation
- **Performance**: Optimized images, lazy loading
- **Modern UI**: Glass morphism effects, backdrop blur

## URL Structure

The gallery uses SEO-friendly URLs with the `urlTitle` field:
- **Format**: `/gallery/[urlTitle]`
- **Fallback**: Falls back to `id` if `urlTitle` is not available
- **Modal Support**: Desktop users see intercept route modals

## API Integration

### Favorites API
- **GET** `/api/favorites/[paintingId]` - Check favorite status
- **POST** `/api/favorites/[paintingId]` - Add to favorites
- **DELETE** `/api/favorites/[paintingId]` - Remove from favorites

### Database Schema
```sql
-- Favorites table
CREATE TABLE favorites (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    painting_id TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, painting_id)
);
```

## Security

### RLS Policies
Comprehensive Row Level Security policies ensure:
- Users can only manage their own favorites
- Admins have full access
- Proper authentication checks
- Data isolation between users

### Authentication
- Session-based authentication
- Redirect to login for unauthenticated actions
- Proper error handling

## Usage Examples

### Basic Gallery
```tsx
import ArtworkGallery from '@/components/artworkGallery/ArtworkGallery';

<ArtworkGallery 
    paintings={paintings}
    isLoading={loading}
    showSold={false}
/>
```

### Painting Detail Page
```tsx
import PaintingDetailPage from '@/components/artworkGallery/PaintingDetailPage';

<PaintingDetailPage 
    painting={painting}
    isOwner={isOwner}
/>
```

### Social Sharing
```tsx
import SocialShareButtons from '@/components/artworkGallery/SocialShareButtons';

<SocialShareButtons
    title={painting.title}
    description={painting.description}
    image={painting.images[0]}
    url={`${window.location.origin}/gallery/${painting.urlTitle}`}
/>
```

## Performance Optimizations

- **Image Optimization**: Next.js Image component with proper sizing
- **Lazy Loading**: Images load as needed
- **Code Splitting**: Dynamic imports for heavy components
- **Caching**: SWR for data fetching
- **Bundle Size**: Optimized imports and tree shaking

## Accessibility Features

- **ARIA Labels**: Proper labeling for screen readers
- **Keyboard Navigation**: Full keyboard support
- **Focus Management**: Visible focus indicators
- **Color Contrast**: WCAG compliant contrast ratios
- **Semantic HTML**: Proper HTML structure

## Browser Support

- **Modern Browsers**: Chrome, Firefox, Safari, Edge
- **Mobile**: iOS Safari, Chrome Mobile
- **Progressive Enhancement**: Graceful degradation for older browsers

## Future Enhancements

- [ ] Add zoom functionality for painting images
- [ ] Implement image comparison feature
- [ ] Add video support for artwork
- [ ] Create virtual gallery tours
- [ ] Add AR/VR viewing capabilities
- [ ] Implement advanced filtering and search
- [ ] Add artwork recommendation system
- [ ] Create artist spotlight features
- [ ] Add auction functionality
- [ ] Implement wishlist management
- [ ] Add artwork history tracking
- [ ] Create print-on-demand integration
- [ ] Add multi-language support
- [ ] Implement advanced analytics
- [ ] Add social proof features (likes, views)
- [ ] Create artwork comparison tool
- [ ] Add price alerts and notifications
- [ ] Implement artwork authentication
- [ ] Add provenance tracking
- [ ] Create collector profiles
- [ ] Add artwork insurance integration

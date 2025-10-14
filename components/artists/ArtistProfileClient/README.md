# Artist Profile Client Component

## Overview
The Artist Profile Client component provides a comprehensive interface for displaying individual artist profiles with advanced filtering, sorting, and responsive design. It follows the site's grayscale theme with neon cyan accents and mobile-first approach.

## Components

### ArtistProfileClient
**Location**: `components/artists/ArtistProfileClient.tsx`

The main client component that renders the complete artist profile page with filtering capabilities.

#### Props
```typescript
interface ArtistProfileClientProps {
  artist: Artist;
}

interface Artist {
  id: string;
  bio: string | null;
  user: {
    name: string | null;
    image: string | null;
  };
  paintings: Painting[];
  tags: Tag[];
  faqs: ArtistFAQ[];
}

interface Painting {
  id: string;
  title: string;
  price: number;
  images: string[];
  technique: string | null;
  subject: string | null;
  style: string | null;
  tags: string[];
  widthCm: number;
  heightCm: number;
  isOnSale: boolean;
  salePercentage: number | null;
  finalPrice: number | null;
  originalPrice: number | null;
  createdAt: Date;
}
```

#### Features
- **Artist Header**: Profile image, name, bio, and tags
- **Advanced Filtering**: Technique, subject, style, price range, and tags
- **Responsive Design**: Desktop sidebar + mobile filter overlay
- **Painting Gallery**: Grid layout with hover effects and sale badges
- **Sorting Options**: Newest, oldest, price, title
- **FAQs Section**: Expandable FAQ display
- **Sale Support**: Special pricing display for discounted items

### ArtistProfileSidebar
**Location**: `components/artists/ArtistProfileSidebar.tsx`

Desktop sidebar component with collapsible filter sections.

#### Features
- **Collapsible Sections**: Expandable filter categories
- **Multi-select Filters**: Checkbox lists for technique, subject, style
- **Price Range**: Number inputs with live display
- **Tag Chips**: Interactive tag selection
- **Sort Dropdown**: Custom dropdown for sorting options
- **Clear Filters**: Reset all filters button

### ArtistProfileMobileFilters
**Location**: `components/artists/ArtistProfileMobileFilters.tsx`

Mobile-optimized filter overlay with tabbed interface.

#### Features
- **Tabbed Interface**: Organized filter categories
- **Touch-friendly**: Large touch targets and smooth scrolling
- **Overlay Design**: Full-screen modal with backdrop
- **Apply Button**: Clear action to apply filters
- **Responsive Tabs**: Horizontal scrolling tab navigation

## Styling

### CSS File
**Location**: `components/artists/styles/artist-profile.css`

The styling follows the site's design system with:
- **Color Variables**: Uses CSS custom properties from global theme
- **Neon Accents**: Primary color (#16ffe4) for interactive elements
- **Grayscale Base**: Dark background (#0b0b0f) with muted elements
- **Smooth Transitions**: 0.3s ease transitions for all interactions

### Key Style Features
- **Artist Header**: Centered layout with gradient text effects
- **Filter Sidebar**: Sticky positioning with collapsible sections
- **Painting Cards**: Hover effects with image transitions
- **Sale Badges**: Orange promotion color for discounts
- **Mobile Filters**: Bottom sheet overlay with backdrop blur
- **Responsive Grid**: Adaptive columns based on screen size

## API Integration

### Endpoints Used
- **GET /api/artists/[artistId]**: Fetch artist data with filtering
- **GET /api/artists**: Fetch all artists (for navigation)

### Filter Parameters
```typescript
interface FilterOptions {
  technique: string[];
  subject: string[];
  style: string[];
  priceRange: [number, number];
  tags: string[];
  sortBy: string;
}
```

### API Response Format
```typescript
interface ArtistApiResponse {
  artist: {
    id: string;
    bio: string | null;
    user: {
      name: string | null;
      image: string | null;
    };
  };
  paintings: Painting[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filterOptions: {
    techniques: string[];
    subjects: string[];
    styles: string[];
    tags: string[];
  };
}
```

## State Management

### Filter State
```typescript
const [filters, setFilters] = useState<FilterOptions>({
  technique: [],
  subject: [],
  style: [],
  priceRange: [0, 10000],
  tags: [],
  sortBy: 'newest'
});
```

### UI State
```typescript
const [filteredPaintings, setFilteredPaintings] = useState<Painting[]>([]);
const [showMobileFilters, setShowMobileFilters] = useState(false);
const [isLoading, setIsLoading] = useState(false);
```

## Filtering Logic

### Client-side Filtering
The component performs real-time filtering on the client side for immediate feedback:

1. **Technique Filter**: Matches painting technique against selected values
2. **Subject Filter**: Matches painting subject against selected values
3. **Style Filter**: Matches painting style against selected values
4. **Price Range**: Filters by final price (sale) or regular price
5. **Tags Filter**: Matches any selected tag against painting tags
6. **Sorting**: Applies sorting based on selected criteria

### Price Handling
```typescript
const getDisplayPrice = (painting: Painting) => {
  if (painting.isOnSale && painting.finalPrice) {
    return {
      price: painting.finalPrice,
      originalPrice: painting.originalPrice || painting.price,
      isOnSale: true,
      salePercentage: painting.salePercentage
    };
  }
  return {
    price: painting.price,
    originalPrice: null,
    isOnSale: false,
    salePercentage: null
  };
};
```

## Responsive Design

### Breakpoints
- **Desktop (1024px+)**: Sidebar + main content grid
- **Tablet (768px-1023px)**: Collapsed sidebar + main content
- **Mobile (<768px)**: Hidden sidebar + mobile filter overlay

### Mobile Features
- **Filter Toggle**: Button to show/hide mobile filters
- **Bottom Sheet**: Full-screen filter overlay
- **Touch Optimization**: Large touch targets and smooth scrolling
- **Tab Navigation**: Horizontal scrolling tabs for filter categories

## Accessibility Features

### Keyboard Navigation
- **Tab Order**: Logical tab sequence through all interactive elements
- **Focus Management**: Clear focus indicators and proper focus trapping
- **Keyboard Shortcuts**: Enter/Space for button activation

### Screen Reader Support
- **ARIA Labels**: Descriptive labels for all interactive elements
- **Semantic HTML**: Proper use of headings, sections, and landmarks
- **Alt Text**: Descriptive alt text for all images
- **Live Regions**: Announcements for filter changes

### Color Contrast
- **WCAG Compliance**: Meets AA standards for text contrast
- **Focus Indicators**: High contrast focus rings
- **Error States**: Clear visual feedback for validation errors

## Performance Optimizations

### Image Optimization
- **Next.js Image**: Automatic optimization and lazy loading
- **Hover Effects**: Smooth image transitions without layout shift
- **Responsive Images**: Different sizes for different screen sizes

### State Management
- **useEffect Optimization**: Efficient dependency arrays
- **Memoization**: Prevents unnecessary re-renders
- **Debounced Filtering**: Smooth filter application

### CSS Performance
- **Hardware Acceleration**: Transform-based animations
- **Efficient Selectors**: Optimized CSS specificity
- **Minimal Repaints**: Transform and opacity changes only

## Usage Example

```typescript
// In a server component
import ArtistProfileClient from "@/components/artists/ArtistProfileClient";

export default async function ArtistProfilePage({ params }) {
  const { artistId } = await params;
  
  const artist = await prisma.artistProfile.findUnique({
    where: { id: artistId },
    include: {
      user: { select: { name: true, image: true } },
      paintings: { orderBy: { createdAt: "desc" } },
      tags: true,
      faqs: { orderBy: { createdAt: "desc" } }
    },
  });

  if (!artist) {
    notFound();
  }

  return <ArtistProfileClient artist={artist} />;
}
```

## Error Handling

### Loading States
- **Skeleton Loading**: Placeholder content during data fetch
- **Error Boundaries**: Graceful error handling and recovery
- **Fallback Content**: Default content when data is unavailable

### Validation
- **Input Validation**: Real-time validation for filter inputs
- **Error Messages**: Clear, actionable error messages
- **Recovery Actions**: Easy ways to recover from errors

## Security Considerations

### Data Sanitization
- **Input Validation**: All filter inputs are validated
- **XSS Prevention**: Proper escaping of user-generated content
- **CSRF Protection**: Secure API communication

### Access Control
- **Public Access**: Artist profiles are publicly viewable
- **Data Privacy**: Only necessary data is exposed
- **Rate Limiting**: API endpoints are rate-limited

## Future Enhancements

- [ ] Add infinite scroll for large painting collections
- [ ] Implement advanced search with full-text search
- [ ] Add painting comparison feature
- [ ] Include artist statistics and analytics
- [ ] Add social sharing functionality
- [ ] Implement painting favorites system
- [ ] Add artist contact form
- [ ] Include artist portfolio sections
- [ ] Add painting zoom and lightbox functionality
- [ ] Implement advanced filtering with multiple criteria
- [ ] Add painting availability status
- [ ] Include artist commission information
- [ ] Add painting dimensions visualization
- [ ] Implement painting material information display
- [ ] Add artist exhibition history
- [ ] Include artist awards and recognition
- [ ] Add painting creation process information
- [ ] Implement artist collaboration features
- [ ] Add painting shipping information
- [ ] Include artist return policy information

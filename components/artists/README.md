# Artists Components

## Overview
The artists components provide a clean, responsive interface for displaying all registered artists on the platform. The design follows the site's grayscale theme with neon cyan accents and mobile-first responsive approach.

## Components

### ArtistsClient
**Location**: `components/artists/ArtistsClient.tsx`

A client-side component that renders the artists grid with square profile images and artist names.

#### Props
```typescript
interface ArtistsClientProps {
  artists: Artist[];
}

interface Artist {
  id: string;
  user: {
    name: string | null;
    image: string | null;
  };
}
```

#### Features
- **Square Images**: All artist profile images are displayed as squares (120px on mobile, up to 180px on desktop)
- **Responsive Grid**: Adapts from 2 columns on mobile to 6 columns on extra-large screens
- **Hover Effects**: Subtle animations and neon glow effects on hover
- **Accessibility**: Proper alt text and semantic HTML structure
- **Empty State**: Displays a message when no artists are registered

#### Responsive Breakpoints
- **Mobile (default)**: 2 columns, 120px images
- **Tablet (640px+)**: 3 columns, 140px images
- **Desktop (768px+)**: 4 columns, 160px images
- **Large Desktop (1024px+)**: 5 columns, 180px images
- **Extra Large (1280px+)**: 6 columns, 180px images

## Styling

### CSS File
**Location**: `components/artists/styles/artists.css`

The styling follows the site's design system with:
- **Color Variables**: Uses CSS custom properties from the global theme
- **Neon Accents**: Primary color (#16ffe4) for hover effects and borders
- **Grayscale Base**: Dark background (#0b0b0f) with muted foreground elements
- **Smooth Transitions**: 0.3s ease transitions for all interactive elements

### Key Style Features
- **Card Design**: Rounded corners with subtle borders and shadows
- **Hover Effects**: Transform, glow, and color changes on interaction
- **Image Containers**: Square aspect ratio with rounded corners and neon borders
- **Typography**: Clean, readable fonts with proper contrast ratios

## Integration

### Server-Side Page
**Location**: `app/artists/page.tsx`

The server-side page component:
1. Fetches all artist profiles from the database using Prisma
2. Includes user data (name and image) in the query
3. Sorts artists alphabetically by name
4. Passes the data to the ArtistsClient component

### Database Query
```typescript
const artists = await prisma.artistProfile.findMany({
  include: {
    user: {
      select: {
        name: true,
        image: true,
      },
    },
  },
  orderBy: {
    user: {
      name: 'asc',
    },
  },
});
```

## Usage Example

```typescript
// In a server component
import ArtistsClient from "@/components/artists/ArtistsClient";

export default async function ArtistsPage() {
  const artists = await fetchArtists();
  return <ArtistsClient artists={artists} />;
}
```

## Accessibility Features

- **Semantic HTML**: Proper use of headings, links, and image elements
- **Alt Text**: Descriptive alt text for all artist profile images
- **Keyboard Navigation**: All interactive elements are keyboard accessible
- **Screen Reader Support**: Proper ARIA labels and semantic structure
- **Color Contrast**: Meets WCAG guidelines for text and background contrast

## Performance Considerations

- **Image Optimization**: Uses Next.js Image component with automatic optimization
- **Lazy Loading**: Images are loaded as they come into view
- **Responsive Images**: Different image sizes for different screen sizes
- **CSS Optimization**: Efficient CSS with minimal repaints and reflows

## Future Enhancements

- [ ] Add artist search functionality
- [ ] Implement artist filtering by category or style
- [ ] Add artist statistics (number of artworks, followers)
- [ ] Include artist bio preview on hover
- [ ] Add sorting options (name, popularity, newest)
- [ ] Implement infinite scroll for large artist lists
- [ ] Add artist verification badges
- [ ] Include social media links in artist cards
- [ ] Add artist location information
- [ ] Implement artist favorites functionality

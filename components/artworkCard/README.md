# ArtworkCard Component

A modern, responsive artwork card component designed for e-commerce galleries with advanced features for displaying paintings and artwork.

## Features

### Visual Design
- **Grayscale Filter**: Images display in grayscale by default, removing filter on hover/selection
- **Modern E-commerce UI**: Clean, professional design following modern e-commerce best practices
- **Responsive Design**: Mobile-first approach with optimized layouts for all screen sizes
- **Hover Effects**: Smooth transitions and visual feedback on interaction

### Image Gallery
- **Primary Image**: Main artwork image with grayscale filter
- **Thumbnail Counter**: Shows additional images count with preview thumbnail
- **Image States**: Grayscale by default, color on hover/selection
- **Optimized Loading**: Uses Next.js Image component with proper sizing

### Smart Tags System
- **"Ново" Tag**: Automatically shows for paintings uploaded in last 10 days
- **"Продадено" Tag**: Displays for sold paintings with overlay
- **Promotion Tags**: Shows discount percentage for promotional items
- **Color-coded**: Uses primary colors for new items, promotion colors for discounts

### Pricing System
- **Dual Currency**: Displays prices in both BGN and EUR
- **Promotion Pricing**: Shows original price (strikethrough) and discounted price
- **Discount Percentage**: Visual discount tags with percentage
- **Final Price**: Always shows the final price in EUR at the bottom

### Dimensions Display
- **API Integration**: Fetches width and height from server data
- **Format**: Displays as "60 x 60" format
- **Fallback**: Shows custom dimensions if API data unavailable

### Interaction Features
- **Click Handling**: Customizable click behavior (navigation or callback)
- **Selection State**: Visual feedback for selected cards
- **Focus Management**: Proper keyboard navigation support
- **Click Outside**: Deselects card when clicking outside

### Sold Items Management
- **Filter Support**: Can hide/show sold items based on gallery filter
- **Visual Overlay**: Clear "Продадено" overlay for sold items
- **Conditional Rendering**: Automatically hides sold items unless filter is active

## Props

```typescript
interface ArtworkCardProps {
    painting: PaintingWithArtist;  // Complete painting data
    showSold?: boolean;           // Show sold items (default: false)
    onCardClick?: (painting: PaintingWithArtist) => void; // Custom click handler
}
```

## Usage Examples

### Basic Usage
```tsx
import ArtworkCard from '@/components/artworkCard/ArtworkCard';

<ArtworkCard painting={paintingData} />
```

### With Custom Click Handler
```tsx
<ArtworkCard 
    painting={paintingData}
    onCardClick={(painting) => {
        // Custom logic for card click
        openModal(painting);
    }}
/>
```

### Showing Sold Items
```tsx
<ArtworkCard 
    painting={paintingData}
    showSold={true}
/>
```

## Data Requirements

The component expects a `PaintingWithArtist` object with the following structure:

```typescript
interface PaintingWithArtist {
    id: string;
    title: string;
    description: string | null;
    dimensions: string | null;
    materials: string | null;
    images: string[];           // Array of image URLs
    price: number;             // Price in BGN
    isSold: boolean;           // Sold status
    artistId: string;
    widthCm: number | null;    // Width in centimeters
    heightCm: number | null;   // Height in centimeters
    slug: string | null;       // URL slug
    technique: string | null;
    subject: string | null;
    tags: string[];
    style: string | null;
    createdAt: Date;           // For "new" tag calculation
    updatedAt: Date;
    artist: {
        id: string;
        bio: string | null;
        user: {
            name: string | null;
            email: string | null;
        };
    };
}
```

## Styling

The component uses CSS custom properties for theming and includes:

- **Color Variables**: Uses theme colors from globals.css
- **Promotion Colors**: Special colors for discount tags (#ff7016)
- **Responsive Breakpoints**: Mobile-first responsive design
- **Animation Classes**: Smooth transitions and hover effects
- **Accessibility**: Focus states and ARIA labels

## Business Logic

### New Item Detection
- Items uploaded within last 10 days show "Ново" tag
- Uses `createdAt` date for calculation

### Promotion System
- Currently: 20% discount for items over 500 BGN
- Shows original price (strikethrough) and discounted price
- Displays discount percentage tag

### Sold Item Handling
- Sold items show overlay and "Продадено" tag
- Hidden by default unless `showSold` prop is true
- Used for gallery filtering functionality

## Integration with Gallery

The component integrates seamlessly with the gallery system:

- **GalleryGrid**: Uses ArtworkCard for consistent display
- **Filtering**: Supports sold item filtering
- **Responsive Grid**: Adapts to gallery layout
- **Animation**: Works with Framer Motion animations

## Accessibility Features

- **Keyboard Navigation**: Full keyboard support with focus management
- **Screen Readers**: Proper ARIA labels and semantic HTML
- **Color Contrast**: Meets WCAG guidelines
- **Focus Indicators**: Clear visual focus states

## Performance Optimizations

- **Image Optimization**: Uses Next.js Image component
- **Lazy Loading**: Images load as needed
- **Efficient Rendering**: Conditional rendering for performance
- **Memory Management**: Proper cleanup of event listeners

## Future Enhancements

- [ ] Add wishlist functionality
- [ ] Implement quick view modal
- [ ] Add image zoom on hover
- [ ] Support for video previews
- [ ] Advanced promotion rules
- [ ] Social sharing buttons
- [ ] Artist verification badges
- [ ] Custom promotion dates
- [ ] Bulk selection mode
- [ ] Comparison functionality

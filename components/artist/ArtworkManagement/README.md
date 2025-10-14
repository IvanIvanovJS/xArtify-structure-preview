# ArtworkManagement Component

## Overview
The ArtworkManagement component provides comprehensive artwork management functionality for artists, including filtering, sorting, viewing modes, and CRUD operations.

## Features
- **Advanced Filtering**: Search, status, technique, subject, style, and sale filters
- **View Modes**: Grid and list view options
- **Bulk Selection**: Select individual or all artworks
- **CRUD Operations**: Create, read, update, and delete artworks
- **Status Management**: Draft, published, and archived statuses
- **Sale Management**: On-sale pricing with percentage discounts
- **Responsive Design**: Mobile-optimized interface

## Data Sources
- `/api/artist/artworks` - List and filter artworks
- `/api/artist/artworks/[id]` - Update and delete specific artwork

## Components Used
- **CustomDropdown**: For all filter dropdowns
- **Image**: Next.js optimized image component
- **Framer Motion**: Smooth animations and transitions

## Filter Options
- **Status**: Draft, Published, Archived
- **Technique**: Oil, Acrylic, Watercolor, Digital, Mixed
- **Subject**: Portrait, Landscape, Abstract, Still Life, Animal
- **Style**: Realistic, Impressionist, Expressionist, Modern, Contemporary
- **Sort**: Created date, Updated date, Title, Price

## Key Features
- **Real-time Search**: Instant filtering as you type
- **Bulk Actions**: Select multiple artworks for batch operations
- **Delete Confirmation**: Modal confirmation for destructive actions
- **Currency Formatting**: Bulgarian Lev (BGN) formatting
- **Date Formatting**: Bulgarian locale formatting
- **Tag Display**: Show artwork tags with overflow handling

## Styling
- Uses CSS custom properties for consistent theming
- Transparent components by default
- Hover effects and smooth transitions
- Mobile-first responsive design
- Status badges with color coding

## Future Enhancements
- [ ] Add drag-and-drop reordering functionality
- [ ] Implement bulk edit operations
- [ ] Add artwork duplication feature
- [ ] Include advanced search with multiple criteria
- [ ] Add artwork analytics and performance metrics
- [ ] Implement artwork templates and presets
- [ ] Add export functionality for artwork data
- [ ] Add bulk archive/unarchive functionality
- [ ] Add automatic archiving when subscription is downgraded
- [ ] Add warning when trying to archive published artworks
- [ ] Add restore functionality for archived artworks

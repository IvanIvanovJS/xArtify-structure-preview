# ArtistAnalytics Component

## Overview
The ArtistAnalytics component provides comprehensive analytics and insights for artists, including performance metrics, charts, and detailed reporting capabilities.

## Features
- **Overview Metrics**: Total views, sales, revenue, and conversion rates
- **Interactive Charts**: Dynamic Chart.js visualizations with multiple data series
- **Time Series Analysis**: Performance tracking over customizable periods
- **Top Performers**: Ranking of most popular paintings
- **Export Functionality**: CSV export for external analysis
- **Responsive Design**: Mobile-optimized charts and tables

## Data Sources
- `/api/artist/analytics` - Main analytics data endpoint
- SWR for data fetching with automatic revalidation

## Components Used
- **Chart.js**: Dynamic import for client-side chart rendering
- **CustomDropdown**: For period and chart type selection
- **Framer Motion**: Smooth animations and transitions

## Chart Types
- **Overview**: Combined view of views, sales, and revenue
- **Sales**: Focus on sales performance over time
- **Views**: Focus on view analytics
- **Revenue**: Focus on revenue trends

## Time Periods
- **7d**: Last 7 days
- **30d**: Last 30 days (default)
- **90d**: Last 90 days
- **1y**: Last year
- **Custom**: User-defined date range

## Key Metrics
- **Total Views**: Combined profile and painting views
- **Profile Views**: Artist profile page visits
- **Painting Views**: Individual artwork views
- **Total Sales**: Number of completed sales
- **Total Revenue**: Gross revenue from sales
- **Total Commission**: Platform commission earned
- **Average Sale Price**: Mean price per sale
- **Conversion Rate**: Views to sales ratio

## Chart Features
- **Dual Y-Axes**: Separate scales for different metrics
- **Responsive Design**: Adapts to container size
- **Interactive Legends**: Toggle data series visibility
- **Smooth Animations**: Chart.js animations for better UX
- **Custom Styling**: Matches site's color palette

## Export Functionality
- **CSV Format**: Standard spreadsheet format
- **Complete Data**: All overview metrics included
- **Timestamped**: Filename includes export date
- **Client-Side**: No server processing required

## Styling
- Uses CSS custom properties for consistent theming
- Transparent components by default
- Hover effects and smooth transitions
- Mobile-first responsive design
- Chart styling matches site colors

## Performance Optimizations
- **Dynamic Imports**: Chart.js loaded only when needed
- **SWR Caching**: Automatic data caching and revalidation
- **Lazy Loading**: Charts render only when visible
- **Efficient Updates**: Minimal re-renders on data changes

## Future Enhancements
- [ ] Add more chart types (pie, bar, area)
- [ ] Implement real-time analytics updates
- [ ] Add comparative period analysis
- [ ] Include geographic analytics
- [ ] Add custom metric calculations
- [ ] Implement data filtering and segmentation
- [ ] Add automated report scheduling
- [ ] Include competitor benchmarking

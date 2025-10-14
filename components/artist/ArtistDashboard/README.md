# ArtistDashboard Component

## Overview
The ArtistDashboard component provides a comprehensive overview of the artist's performance, including statistics, recent sales, and subscription information.

## Features
- **Overview Cards**: Total paintings, courses, sales, and views
- **Period Selection**: 7d, 30d, 90d, 1y time periods
- **Subscription Info**: Current plan and billing details
- **Recent Sales**: List of latest sales with buyer information
- **Real-time Updates**: Auto-refresh every 30 seconds
- **Responsive Design**: Mobile-optimized layout

## Data Sources
- `/api/artist/dashboard?period={period}` - Main dashboard data
- SWR for data fetching with automatic revalidation

## Components
- **Loading Spinner**: Standard admin dashboard colors
- **Error Handling**: User-friendly error messages
- **Currency Formatting**: Bulgarian Lev (BGN) formatting
- **Date Formatting**: Bulgarian locale formatting

## Styling
- Uses CSS custom properties for consistent theming
- Transparent components by default
- Hover effects and smooth transitions
- Mobile-first responsive design

## Key Metrics
- Total paintings (published/draft breakdown)
- Active courses count
- Total sales and revenue
- Profile and painting views
- Commission calculations

## Future Enhancements
- [ ] Add charts and graphs for visual analytics
- [ ] Implement export functionality for reports
- [ ] Add goal setting and progress tracking
- [ ] Include performance comparisons
- [ ] Add notification center for important updates
- [ ] Implement real-time notifications for new sales

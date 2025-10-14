# CourseManagement Component

## Overview
The CourseManagement component provides comprehensive course management functionality for artists, including creating, editing, deleting, and organizing their educational content.

## Features
- **Course CRUD Operations**: Create, read, update, and delete courses
- **Advanced Filtering**: Search and sort courses by various criteria
- **Video Management**: Add/remove multiple video URLs per course
- **Material Integration**: Link courses with educational materials
- **Thumbnail Support**: Set custom thumbnails for courses
- **Responsive Design**: Mobile-optimized interface
- **Form Validation**: Client-side validation with error handling

## Data Sources
- `/api/artist/courses` - List and filter courses
- `/api/artist/courses/[id]` - Update and delete specific course

## Components Used
- **CustomDropdown**: For sorting options
- **Image**: Next.js optimized image component
- **Framer Motion**: Smooth animations and transitions

## Course Form Features
- **Title and Description**: Basic course information
- **Pricing**: Set course price in BGN
- **Video URLs**: Dynamic list of video links
- **Thumbnail**: Optional course thumbnail image
- **Material Links**: Integration with course materials

## Key Features
- **Dynamic Video Management**: Add/remove video URLs dynamically
- **Form Validation**: Required fields and URL validation
- **Loading States**: Proper loading indicators during operations
- **Error Handling**: User-friendly error messages
- **Currency Formatting**: Bulgarian Lev (BGN) formatting
- **Date Formatting**: Bulgarian locale formatting

## Styling
- Uses CSS custom properties for consistent theming
- Transparent components by default
- Hover effects and smooth transitions
- Mobile-first responsive design
- Modal overlays for forms and confirmations

## Form Validation
- Title is required
- Price must be positive number
- Video URLs must be valid URLs
- At least one video URL is required
- Thumbnail URL is optional but must be valid if provided

## Future Enhancements
- [ ] Add course categories and tags
- [ ] Implement course preview functionality
- [ ] Add course analytics and enrollment tracking
- [ ] Support for course prerequisites
- [ ] Add course templates and presets
- [ ] Implement course scheduling and availability
- [ ] Add course completion certificates
- [ ] Support for course bundles and packages

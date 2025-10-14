# ArtistSettings Component

## Overview
The `ArtistSettings` component provides a comprehensive settings interface for artists to manage their profile information, notification preferences, and account details.

## Features

### Profile Management
- **Biography**: Rich text area for artist bio
- **Contact Information**: Website, location, social media links
- **Social Media**: Instagram, Facebook, Twitter integration
- **Specialties**: Dynamic tag system for adding/removing specialties
- **Professional Info**: Experience, education, awards sections

### Notification Settings
- **Email Notifications**: General platform notifications
- **Sale Notifications**: Alerts when paintings are sold
- **Message Notifications**: New message alerts
- **Marketing Emails**: Platform updates and tips

### Account Information
- **Profile Display**: Avatar, name, email, role
- **Account Actions**: Password change, email change, account deletion
- **Statistics**: Registration date, last activity

## Technical Implementation

### State Management
- Uses SWR for data fetching and caching
- Local state for form data and UI interactions
- Optimistic updates with server synchronization

### Form Handling
- Separate forms for profile and notifications
- Real-time validation and error handling
- Success/error message system

### UI/UX Features
- **Tabbed Interface**: Profile, Notifications, Account tabs
- **Animated Transitions**: Framer Motion for smooth tab switching
- **Responsive Design**: Mobile-first approach
- **Loading States**: Spinner and skeleton loading
- **Error Handling**: Comprehensive error states

## API Integration

### Endpoints Used
- `GET /api/artist/settings` - Fetch current settings
- `PUT /api/artist/settings` - Update settings

### Data Structure
```typescript
interface ArtistSettingsData {
    profile: {
        id: string;
        bio: string | null;
        website: string | null;
        instagram: string | null;
        facebook: string | null;
        twitter: string | null;
        location: string | null;
        specialties: string[];
        experience: string | null;
        education: string | null;
        awards: string | null;
        user: {
            name: string | null;
            email: string | null;
            image: string | null;
        };
    };
    notifications: {
        emailNotifications: boolean;
        saleNotifications: boolean;
        messageNotifications: boolean;
        marketingEmails: boolean;
    };
}
```

## Component Structure

### Main Sections
1. **Header**: Title and description
2. **Tabs**: Navigation between settings sections
3. **Content**: Dynamic content based on active tab
4. **Messages**: Success/error feedback system

### Form Components
- **Profile Form**: Comprehensive artist information
- **Notifications Form**: Toggle switches for preferences
- **Account Display**: Read-only account information

## Styling

### CSS Architecture
- Component-scoped CSS modules
- CSS custom properties for theming
- Mobile-first responsive design
- Consistent spacing and typography

### Key Design Elements
- **Toggle Switches**: Custom styled for notifications
- **Specialty Tags**: Interactive tag system
- **Form Validation**: Visual feedback for inputs
- **Loading States**: Consistent spinner design

## Usage

```tsx
import ArtistSettings from '@/components/artist/ArtistSettings/ArtistSettings';

export default function SettingsPage() {
    return <ArtistSettings />;
}
```

## Dependencies
- **React**: Core component library
- **SWR**: Data fetching and caching
- **Framer Motion**: Animation library
- **Next.js Image**: Optimized image component

## Future Enhancements
- [ ] Profile image upload functionality
- [ ] Advanced notification scheduling
- [ ] Two-factor authentication setup
- [ ] Export account data feature
- [ ] Integration with external portfolio platforms
- [ ] Advanced privacy settings
- [ ] Account activity log
- [ ] Backup and restore settings

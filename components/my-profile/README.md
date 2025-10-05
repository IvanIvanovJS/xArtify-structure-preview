# My Profile Components

This directory contains the refactored My Profile page components, providing a clean, minimalist design similar to modern mobile apps with a card-based layout.

## Components

### MyProfileClient
Main client component that handles the profile page logic and layout.

**Features:**
- User data fetching and state management
- Responsive card-based layout
- Dynamic menu items based on user type (regular user vs artist)
- Loading and error states
- Bulgarian localization

**Props:** None (fetches data internally)

**Usage:**
```tsx
import MyProfileClient from "@/components/my-profile/MyProfileClient";

export default function MyProfilePage() {
  return <MyProfileClient />;
}
```

### ProfileCard
Reusable card component for individual menu items.

**Props:**
- `title: string` - Card title
- `icon: string` - Emoji icon
- `href: string` - Navigation URL
- `description?: string` - Optional description
- `isSpecial?: boolean` - Special styling for highlighted cards

**Usage:**
```tsx
import ProfileCard from "@/components/my-profile/ProfileCard";

<ProfileCard
  title="Настройки"
  icon="⚙️"
  href="/my-profile/settings"
  description="Управление на профила"
/>
```

## Menu Items

The profile page displays different menu items based on user type:

### Regular Users
- Настройки (Settings)
- Моите поръчки (My Orders)
- Любими произведения (Favorite Artworks)
- Моите курсове (My Courses)
- Портфейл (Wallet)
- Известия (Notifications)
- Стани артист (Become Artist) - Special card

### Artists (Additional Items)
- Профил на артист (Artist Profile)
- Моите произведения (My Artworks)
- Аналитика (Analytics)

## Styling

### Design System
- **Background**: Transparent with backdrop blur
- **Cards**: Glass-morphism effect with subtle borders
- **Colors**: Primary neon cyan (#16ffe4) with gradient accents
- **Typography**: Inter font with proper hierarchy
- **Spacing**: Consistent 1rem grid system

### Responsive Design
- **Mobile-first**: Optimized for touch interaction
- **Breakpoints**: 768px, 480px
- **Grid**: Auto-fit columns with minimum 300px width
- **Touch targets**: Minimum 44px for accessibility

### Accessibility
- **ARIA labels**: Proper semantic markup
- **Focus states**: Visible focus indicators
- **Keyboard navigation**: Full keyboard support
- **Screen readers**: Descriptive text and roles
- **High contrast**: Support for high contrast mode
- **Reduced motion**: Respects user preferences

## Future Enhancements

- [ ] Add user avatar upload functionality
- [ ] Implement profile editing modal
- [ ] Add notification badges to menu items
- [ ] Create settings sub-pages
- [ ] Add dark/light theme toggle
- [ ] Implement user preferences storage
- [ ] Add profile completion progress indicator
- [ ] Create artist verification status display
- [ ] Add social media links management
- [ ] Implement profile sharing functionality
- [ ] Add profile analytics dashboard
- [ ] Create profile export feature
- [ ] Add profile backup/restore functionality
- [ ] Implement profile privacy settings
- [ ] Add profile activity timeline
- [ ] Create profile achievement system
- [ ] Add profile customization options
- [ ] Implement profile search functionality
- [ ] Add profile comparison feature
- [ ] Create profile recommendation system
- [ ] Add profile integration with external services

## Technical Details

### State Management
- Uses React hooks for local state
- Fetches user data from `/api/profile` endpoint
- Handles authentication and session management
- Implements proper error handling and loading states

### Performance
- Lazy loading for images
- Optimized re-renders with useCallback
- Efficient state updates
- Minimal bundle size impact

### Security
- Client-side data validation
- Secure API communication
- Proper error message handling
- Session timeout management

## File Structure

```
components/my-profile/
├── MyProfileClient.tsx          # Main client component
├── ProfileCard.tsx              # Reusable card component
├── styles/
│   ├── my-profile.css          # Main component styles
│   └── profile-card.css        # Card component styles
└── README.md                   # This documentation
```

## Integration

The components integrate with:
- Next.js App Router
- NextAuth.js for authentication
- Prisma for database operations
- Tailwind CSS for utility classes
- Custom CSS for component-specific styling

## Browser Support

- **Modern browsers**: Full support
- **IE11**: Limited support (graceful degradation)
- **Mobile browsers**: Optimized experience
- **Screen readers**: Full accessibility support

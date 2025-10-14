# ArtistLayout Component

## Overview
The ArtistLayout component provides the main layout structure for the artist portal, including navigation, sidebar, and responsive mobile menu.

## Features
- **Responsive Design**: Mobile-first approach with collapsible sidebar
- **Navigation**: Dashboard, Artworks, Courses, Analytics, Settings, Messages
- **Unread Messages Badge**: Shows count of unread messages
- **Profile Information**: Displays artist name, email, and subscription plan
- **Framer Motion**: Smooth animations for mobile menu and content transitions

## Props
```typescript
interface ArtistLayoutClientProps {
  children: React.ReactNode;
  artistProfile: ArtistProfile;
  unreadMessageCount: number;
}
```

## Usage
```tsx
<ArtistLayoutClient 
  artistProfile={artistProfile}
  unreadMessageCount={5}
>
  <YourPageContent />
</ArtistLayoutClient>
```

## Styling
- Uses CSS custom properties for consistent theming
- Transparent components by default
- Mobile-optimized touch targets (44px minimum)
- Consistent with site's color palette

## Navigation Items
- Dashboard: `/artist`
- Artworks: `/artist/artworks`
- Courses: `/artist/courses`
- Analytics: `/artist/analytics`
- Settings: `/artist/settings`
- Messages: `/artist/messages`

## Future Enhancements
- [ ] Add keyboard navigation support
- [ ] Implement breadcrumb navigation
- [ ] Add search functionality in sidebar
- [ ] Add notification center
- [ ] Implement theme switching
- [ ] Add quick actions menu

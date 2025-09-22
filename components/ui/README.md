# UI Components - Logout Confirmation

## LogoutConfirmation Component

### Overview
Custom logout confirmation modal that provides a better user experience by asking for confirmation before logging out, instead of direct redirect to NextAuth signout page.

### Features
- **Custom Styling**: Matches xArtify design system with neon theme
- **Accessibility**: Full ARIA support, keyboard navigation, screen reader compatibility
- **Mobile Optimized**: Responsive design with touch-friendly interactions
- **Animation**: Smooth modal transitions with reduced motion support
- **Security**: Controlled logout flow with proper session management

### Usage
```typescript
import LogoutConfirmation from "@/components/ui/LogoutConfirmation";

<LogoutConfirmation 
    isOpen={showLogoutConfirm}
    onClose={() => setShowLogoutConfirm(false)}
/>
```

### Props
| Prop | Type | Description |
|------|------|-------------|
| `isOpen` | `boolean` | Controls modal visibility |
| `onClose` | `() => void` | Callback when modal should close |

### Styling
- **File**: `components/ui/styles/logout-confirmation.css`
- **Theme**: Uses CSS custom properties for consistent theming
- **Responsive**: Mobile-first design with desktop enhancements
- **Animations**: CSS transitions with `prefers-reduced-motion` support

### Accessibility Features
- ARIA labels and roles
- Keyboard navigation (Escape to close)
- Focus management
- High contrast mode support
- Screen reader announcements

### Security Implementation
- Uses `signOut({ redirect: false })` for controlled logout
- Manual redirect to home page after logout
- Page refresh to ensure clean state
- No sensitive data in URL parameters

### Browser Support
- Modern browsers with CSS Grid/Flexbox
- Graceful degradation for older browsers
- Progressive enhancement approach
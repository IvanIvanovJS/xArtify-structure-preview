# UI Components Documentation

## SplashScreen Component

### Overview
The SplashScreen component provides an elegant introduction animation for first-time visitors to the xArtify platform. It features a 3.5-second video presentation with smooth transitions and loading animations.

### Features
- **Video Background**: Plays `/entry-splash-screen.mp4` for 3 seconds
- **Fade Transition**: Starts darkening at 2 seconds, fully dark by 3 seconds
- **Loading Animation**: Shows loading spinner during transition
- **Smooth Exit**: Elegant fade-out with scale effect
- **Session Management**: Only shows on first visit per session

### Timing Breakdown
- **0-2s**: Video plays normally
- **2-3s**: Gradual fade to black with loading indicator
- **3-3.5s**: Final transition and content reveal
- **Total Duration**: 3.5 seconds

### Usage
```tsx
import SplashScreen from '@/components/ui/SplashScreen';

<SplashScreen onComplete={() => console.log('Splash completed')} />
```

### Props
- `onComplete: () => void` - Callback fired when splash screen finishes

### Technical Details
- Uses Framer Motion for smooth animations
- Implements `AnimatePresence` for enter/exit transitions
- Includes fallback gradient for browsers without video support
- Responsive design with mobile optimizations
- Accessibility features (reduced motion support)

### CSS Classes
- `.splash-screen` - Main container
- `.splash-video` - Video element styling
- `.splash-overlay` - Gradient overlay
- `.splash-loading` - Loading indicator
- `.splash-spinner` - Animated spinner

### Browser Support
- Modern browsers with video support
- Graceful fallback for older browsers
- Mobile-optimized with touch-friendly interactions

## AppWrapper Component

### Overview
The AppWrapper component manages the splash screen lifecycle and main content transitions. It ensures the splash screen only appears for first-time visitors in a session.

### Features
- **Session Detection**: Uses `sessionStorage` to track visits
- **Conditional Rendering**: Skips splash for returning users
- **Smooth Transitions**: Animated content reveal
- **Performance Optimized**: Minimal re-renders

### Usage
```tsx
import AppWrapper from '@/components/ui/AppWrapper';

<AppWrapper>
  <YourMainContent />
</AppWrapper>
```

### Props
- `children: React.ReactNode` - Main application content

### Session Management
- Uses `sessionStorage.getItem('xartify-splash-seen')` to track visits
- Automatically skips splash for same-session returns
- Resets on new browser session

## Integration

### Layout Integration
The splash screen is integrated at the root level in `app/layout.tsx`:

```tsx
<AppWrapper>
  <Header />
  <MainWrapper>
    {children}
  </MainWrapper>
</AppWrapper>
```

### CSS Integration
Styles are imported in `app/globals.css`:
```css
@import "../components/ui/styles/splash-screen.css";
```

## Performance Considerations

### Video Optimization
- Video is auto-played with `muted` and `playsInline` attributes
- Fallback gradient for browsers without video support
- Optimized for mobile bandwidth

### Animation Performance
- Uses CSS transforms for smooth animations
- Implements `will-change` for GPU acceleration
- Respects `prefers-reduced-motion` user preference

### Memory Management
- Proper cleanup of timers and event listeners
- Minimal state management
- Efficient re-render patterns

## Accessibility

### Features
- Respects `prefers-reduced-motion` setting
- High contrast mode support
- Screen reader friendly
- Keyboard navigation support

### ARIA Labels
- Proper `aria-hidden` attributes for decorative elements
- Loading state announcements
- Focus management during transitions

## Future Enhancements
- [ ] Add sound effects option
- [ ] Implement different splash screens for different user types
- [ ] Add analytics tracking for splash screen completion
- [ ] Support for custom video content
- [ ] A/B testing framework for splash screen variations
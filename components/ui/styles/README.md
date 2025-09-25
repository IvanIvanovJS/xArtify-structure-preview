# UI Styles Documentation

## Grayscale Toggle Component

### Overview
The `grayscale-toggle.css` file provides a reusable grayscale effect with logo toggle functionality. This component allows images to be displayed in grayscale by default and can be toggled to show colors by clicking a logo button.

### Features
- **Grayscale Effect**: Images are displayed in grayscale by default
- **Desktop Hover**: On desktop devices, hovering over the image removes the grayscale effect
- **Mobile Logo Toggle**: On mobile devices, a logo button allows users to toggle the grayscale effect
- **Click Outside Reset**: Clicking outside the component resets the grayscale effect
- **Accessibility**: Full keyboard navigation and screen reader support
- **Responsive Design**: Mobile-first approach with appropriate sizing

### Usage

#### Basic Implementation
```tsx
import "@/components/ui/styles/grayscale-toggle.css";

<div className="grayscale-toggle">
  <img src="image.jpg" alt="Description" className="grayscale-image" />
  <button className="grayscale-toggle-logo" onClick={handleToggle}>
    <img src="/web-logo.svg" width={20} height={20} alt="Toggle Logo" />
  </button>
</div>
```

#### With React State
```tsx
const [isActive, setIsActive] = useState(false);

<div className={`grayscale-toggle ${isActive ? 'is-active' : ''}`}>
  <img src="image.jpg" alt="Description" className="grayscale-image" />
  <button 
    className="grayscale-toggle-logo" 
    onClick={() => setIsActive(true)}
    aria-label="Show image colors"
  >
    <img src="/web-logo.svg" width={20} height={20} alt="Toggle Logo" />
  </button>
</div>
```

### CSS Classes

#### `.grayscale-toggle`
- Main container for the grayscale toggle functionality
- Should be applied to the parent element containing the image and logo button

#### `.grayscale-image`
- Applied to images that should have the grayscale effect
- Images are grayscale by default
- Color is restored on hover (desktop) or when `.is-active` class is present

#### `.grayscale-toggle-logo`
- Logo button for mobile devices
- Positioned at bottom-right of the container
- Hidden on desktop devices (min-width: 769px)
- Includes hover effects and accessibility features

#### `.is-active`
- Applied to `.grayscale-toggle` when colors should be shown
- Removes grayscale effect from `.grayscale-image`

### Responsive Behavior

#### Desktop (min-width: 769px)
- Logo button is hidden
- Grayscale effect is removed on hover
- No manual toggle required

#### Mobile (max-width: 768px)
- Logo button is visible
- Grayscale effect persists until logo is clicked
- Clicking outside the component resets the effect

### Accessibility Features
- **Keyboard Navigation**: Logo button is focusable and responds to Enter/Space keys
- **Screen Reader Support**: Proper ARIA labels and semantic HTML
- **Focus Indicators**: Clear visual focus indicators for keyboard users
- **Reduced Motion**: Respects user's motion preferences

### Integration with ArtworkCard
The grayscale toggle is integrated into the `ArtworkCard` component to provide an interactive way for users to reveal artwork colors on mobile devices. This enhances user engagement and helps users remember the site logo.

### Future Enhancements
- [ ] Add animation options for the grayscale transition
- [ ] Support for different logo sizes and positions
- [ ] Customizable grayscale intensity
- [ ] Touch gesture support for mobile devices
- [ ] Integration with other image components

# Footer Component

## Overview
The Footer component provides a comprehensive footer for the xArtify art platform, featuring a 4-column layout with company information, platform features, resources, and contact details. The footer includes a gradient-masked logo in the bottom right corner and follows the site's dark theme with neon cyan accents.

## Features

### Layout Structure
- **4-column responsive grid** layout (2 columns on mobile)
- **Company section**: About, sponsorships, contacts, privacy
- **Platform section**: Gallery, courses, artists, upload artwork
- **Resources section**: Help, FAQ, terms, blog
- **Contact section**: Location, phone, email with icons

### Visual Design
- **Dark theme** with `#0b0b0f` background and `#e5e7eb` text
- **Neon cyan accents** (`#16ffe4`) for headings and hover states
- **Gradient background** with subtle radial patterns
- **Gradient-masked logo** with hover effects and glow
- **Mobile-first responsive** design

### Accessibility
- **Semantic HTML** with proper ARIA roles
- **Keyboard navigation** support
- **High contrast mode** support
- **Reduced motion** support
- **Screen reader** friendly

## Usage

```tsx
import Footer from "@/components/footer/Footer";

export default function Layout() {
    return (
        <div>
            {/* Your page content */}
            <Footer />
        </div>
    );
}
```

## Styling

The component uses CSS custom properties from the global theme:
- `--color-background`: `#0b0b0f`
- `--color-foreground`: `#e5e7eb`
- `--color-primary`: `#16ffe4`
- `--color-muted`: `#1a1a20`
- `--color-muted-foreground`: `#9ca3af`

## Logo Integration

The footer includes the `web-logo.svg` with:
- **Gradient mask** using site colors
- **Hover effects** with scale and glow
- **Responsive sizing** (60px desktop, 50px mobile)
- **Accessibility** with proper alt text

## Responsive Behavior

### Desktop (768px+)
- 4-column grid layout
- Full contact information with icons
- 60px logo size
- Horizontal bottom layout

### Mobile (< 768px)
- 2-column grid layout
- Stacked bottom layout
- 50px logo size
- Optimized spacing and typography

## Future Enhancements

- [ ] Add social media links section
- [ ] Implement newsletter signup
- [ ] Add language switcher
- [ ] Include payment method icons
- [ ] Add breadcrumb navigation
- [ ] Implement footer search functionality
- [ ] Add back-to-top button
- [ ] Include site map links
- [ ] Add accessibility statement link
- [ ] Implement footer analytics tracking

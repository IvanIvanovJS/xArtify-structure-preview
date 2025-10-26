---
inclusion: fileMatch
fileMatchPattern: ['**/*.css', '**/components/**/*.tsx']
---

# Styling

## Critical Rules
- **NEVER use inline styles** - always create separate CSS files
- **Use CSS modules or separate `.css` files** for component styling
- **Follow pattern**: `components/ComponentName/styles/component.css`
- **Use CSS custom properties** for theme consistency
- **Keep styles organized** by component or feature

## Color Palette
```css
/* ✅ Use CSS custom properties for theme consistency */
:root {
  --color-background: #0b0b0f;        /* deep dark gray */
  --color-foreground: #e5e7eb;        /* readable neutral */
  --color-primary: #16ffe4;           /* neon cyan accent */
  --color-muted: #1a1a20;             /* subtle gray */
  --color-muted-foreground: #9ca3af;  /* secondary text */
  --color-promotion: #ff7016;         /* orange for sales */
}
```

## Component Styling Pattern
```css
/* ✅ Use CSS custom properties with proper button styling */
.example {
  flex: 1;
  background: transparent;
  padding: 0.875rem;
  border-radius: 1.25rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.875rem;
  color: var(--color-white-8);
  border: 1px solid var(--color-primary-60);
}

.example:hover {
  box-shadow:
    inset 0 0px 4px 0px var(--color-primary-70),
    0 0px 12px 0px var(--color-primary-70);
}

.example:focus {
  box-shadow:
    inset 0 0px 4px 0px var(--color-primary-70),
    0 0px 12px 0px var(--color-primary-70);
}
```

## CSS Organization Rules
```typescript
// ✅ CORRECT: Import CSS file
import "./styles/component.css";

export default function Component(): JSX.Element {
  return <div className="component-wrapper">Content</div>;
}

// ❌ FORBIDDEN: Inline styles
export default function BadComponent(): JSX.Element {
  return <div style={{ color: 'red', padding: '10px' }}>Content</div>;
}
```

## Typography
```css
/* ✅ Typography standards */
body {
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

## Loading Spinner Standards
```css
/* ✅ REQUIRED: Consistent spinner colors */
.loading-spinner-large {
  border: 4px solid var(--color-primary-20);
  border-left: 4px solid var(--color-primary);
  animation: spin 1s linear infinite;
}

.loading-spinner-small {
  border: 2px solid var(--color-primary-20);
  border-left: 2px solid var(--color-primary);
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
```

## Mobile-First Responsive Design
```css
/* ✅ Mobile-first approach with Tailwind breakpoints */
.component {
  @apply p-4 md:p-8 lg:p-12;
  @apply text-sm md:text-base lg:text-lg;
  @apply w-full md:w-auto;
}

/* Touch-friendly button sizes */
.button {
  @apply min-h-[44px] touch-manipulation;
}
```

## CSS Anti-Patterns to Avoid
```typescript
// ❌ FORBIDDEN: Inline styles
<div style={{ color: 'red', padding: '10px' }}>Content</div>

// ❌ FORBIDDEN: Style objects in components
const styles = { color: 'red', padding: '10px' };
<div style={styles}>Content</div>

// ✅ CORRECT: Separate CSS file
import "./styles/component.css";
<div className="component-wrapper">Content</div>
```

## Performance Guidelines
- Use CSS custom properties for theme consistency
- Minimize CSS bundle size
- Use efficient selectors
- Implement proper loading states and skeletons
- Use appropriate image formats (WebP, AVIF)

## Reference
For detailed component patterns and CSS organization, see: `docs/cursor-agent/component-library.md`
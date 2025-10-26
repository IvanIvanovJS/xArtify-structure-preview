---
inclusion: fileMatch
fileMatchPattern: ['**/components/**/*.tsx']
---

# Components

## Critical Rules
- **ALL components MUST be transparent by default** - no background colors unless explicitly requested
- **NEVER use inline styles** - always create separate CSS files
- **ALWAYS use mobile-first responsive design**
- **ALWAYS integrate new components** into their intended pages/routes
- **NEVER leave components unused** - always add them to appropriate page

## Component Transparency Rule
```typescript
// ✅ Components inherit site background
export default function Component(): JSX.Element {
  return (
    <div className="component-wrapper">
      {/* No background colors - inherits site background */}
    </div>
  );
}

// ❌ Don't add backgrounds unless explicitly requested
export default function BadComponent(): JSX.Element {
  return (
    <div className="bg-gray-800"> {/* Don't do this */}
      Content
    </div>
  );
}
```

## CSS Organization
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

## Mobile-First Responsive Design
```typescript
// ✅ Mobile-optimized component
export default function MobileOptimizedComponent(): JSX.Element {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    setIsMobile(mq.matches);
    mq.addEventListener("change", (e) => setIsMobile(e.matches));
  }, []);

  return (
    <div className="p-4 md:p-8">
      <button className="w-full md:w-auto min-h-[44px] touch-manipulation">
        Mobile-friendly button
      </button>
    </div>
  );
}
```

## CustomDropdown Usage
```typescript
// ✅ ALWAYS use CustomDropdown for dropdown/select functionality
import CustomDropdown from "@/components/ui/CustomDropdown";

interface DropdownOption {
  value: string;
  label: string;
}

const options: DropdownOption[] = [
  { value: "option1", label: "Option 1" },
  { value: "option2", label: "Option 2" }
];

export default function Component(): JSX.Element {
  return (
    <CustomDropdown
      options={options}
      value={selectedValue}
      onChange={handleChange}
      aria-label="Select option"
    />
  );
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

## Performance Optimization
- Use Next.js Image component with optimization
- Implement lazy loading for images
- Use SWR for data fetching with caching
- Minimize bundle size with dynamic imports
- Implement proper loading states and skeletons

## Accessibility Guidelines
```typescript
// ✅ Accessible components
<button
  aria-label="Add to cart"
  aria-describedby="cart-description"
  onClick={handleAddToCart}
>
  Add to Cart
</button>
```

## Reference
For detailed component patterns and CSS organization, see: `docs/cursor-agent/component-library.md`
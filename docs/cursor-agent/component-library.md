# Component Library

## Component Structure

### Standard Component Pattern
```typescript
// ✅ Standard component structure
import React from "react";
import "./styles/ComponentName.css";

interface ComponentNameProps {
  title: string;
  isVisible: boolean;
  onAction: (id: string) => void;
  children?: React.ReactNode;
}

export default function ComponentName({ 
  title, 
  isVisible, 
  onAction, 
  children 
}: ComponentNameProps): JSX.Element {
  if (!isVisible) return null;
  
  return (
    <div className="component-name">
      <h2>{title}</h2>
      {children}
      <button onClick={() => onAction('action')}>
        Action
      </button>
    </div>
  );
}
```

### CSS File Structure
```css
/* components/ComponentName/styles/ComponentName.css */
.component-name {
  /* Base styles - transparent background */
  padding: 1rem;
  border-radius: 0.5rem;
  transition: all 0.3s ease;
}

.component-name h2 {
  color: var(--color-foreground);
  margin-bottom: 1rem;
}

.component-name button {
  background: transparent;
  border: 1px solid var(--color-primary-60);
  color: var(--color-primary);
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.component-name button:hover {
  box-shadow:
    inset 0 0px 4px 0px var(--color-primary-70),
    0 0px 12px 0px var(--color-primary-70);
}
```

## UI Components

### CustomDropdown
```typescript
// ✅ Always use CustomDropdown for dropdowns
import CustomDropdown from "@/components/ui/CustomDropdown";

interface DropdownOption {
  value: string;
  label: string;
}

const options: DropdownOption[] = [
  { value: "option1", label: "Option 1" },
  { value: "option2", label: "Option 2" }
];

export default function ExampleComponent(): JSX.Element {
  const [selectedValue, setSelectedValue] = useState<string>("");
  
  return (
    <CustomDropdown
      options={options}
      value={selectedValue}
      onChange={setSelectedValue}
      aria-label="Select option"
    />
  );
}
```

### Loading Spinner
```typescript
// ✅ Consistent loading spinner
export default function LoadingSpinner({ size = "large" }: { size?: "small" | "large" }): JSX.Element {
  return (
    <div 
      className={`loading-spinner-${size}`}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}
```

### OptimizedImage
```typescript
// ✅ Use OptimizedImage for all images
import OptimizedImage from "@/components/ui/OptimizedImage";

export default function ImageComponent(): JSX.Element {
  return (
    <OptimizedImage
      src="/path/to/image.jpg"
      alt="Descriptive alt text"
      width={400}
      height={300}
      priority={false}
      className="image-class"
    />
  );
}
```

## Form Components

### Form with Validation
```typescript
// ✅ Form with proper validation
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const FormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.number().positive("Price must be positive"),
});

type FormData = z.infer<typeof FormSchema>;

export default function FormComponent(): JSX.Element {
  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: "",
      description: "",
      price: 0,
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      // Handle form submission
      console.log(data);
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="form-component">
      <div>
        <label htmlFor="title">Title</label>
        <input
          id="title"
          {...form.register("title")}
          className={form.formState.errors.title ? "error" : ""}
        />
        {form.formState.errors.title && (
          <span className="error-message">
            {form.formState.errors.title.message}
          </span>
        )}
      </div>
      
      <button type="submit" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
}
```

## Mobile-First Components

### Responsive Grid
```typescript
// ✅ Mobile-first responsive grid
export default function ResponsiveGrid({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <div className="responsive-grid">
      {children}
    </div>
  );
}
```

```css
/* Responsive grid styles */
.responsive-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: 1fr;
}

@media (min-width: 768px) {
  .responsive-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .responsive-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

### Touch-Friendly Button
```typescript
// ✅ Touch-friendly button component
interface TouchButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  disabled?: boolean;
}

export default function TouchButton({ 
  onClick, 
  children, 
  variant = "primary",
  disabled = false 
}: TouchButtonProps): JSX.Element {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`touch-button touch-button--${variant}`}
      aria-disabled={disabled}
    >
      {children}
    </button>
  );
}
```

```css
/* Touch-friendly button styles */
.touch-button {
  min-height: 44px;
  min-width: 44px;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  touch-action: manipulation;
}

.touch-button--primary {
  background: var(--color-primary);
  color: var(--color-background);
}

.touch-button--secondary {
  background: transparent;
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
}

.touch-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

## Accessibility Guidelines

### ARIA Labels
```typescript
// ✅ Proper ARIA labels
export default function AccessibleComponent(): JSX.Element {
  return (
    <div>
      <button
        aria-label="Close dialog"
        aria-describedby="dialog-description"
        onClick={handleClose}
      >
        ×
      </button>
      
      <div id="dialog-description" className="sr-only">
        This dialog contains important information
      </div>
    </div>
  );
}
```

### Screen Reader Support
```css
/* Screen reader only content */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

## Future Enhancements
- [ ] Add more form component patterns
- [ ] Include animation component library
- [ ] Add data visualization components
- [ ] Include notification components
- [ ] Add modal and dialog patterns

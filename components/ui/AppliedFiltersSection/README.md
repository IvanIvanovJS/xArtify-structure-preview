# Applied Filters Section Component

## Overview
The AppliedFiltersSection component provides a visual representation of all currently active filters with individual removal capabilities and a clear all function.

## Features
- Displays count of applied filters with Bulgarian pluralization
- Shows individual filter items with X buttons for removal
- Provides "Clear all" button to reset all filters
- Responsive design for desktop and mobile
- Proper accessibility with ARIA labels

## Usage
```typescript
import AppliedFiltersSection from '@/components/ui/AppliedFiltersSection';

<AppliedFiltersSection
  appliedFilters={appliedFilters}
  onClearAll={clearAllFilters}
  className="optional-custom-class"
/>
```

## Props
- `appliedFilters`: Array of applied filter objects
- `onClearAll`: Function to clear all filters
- `className`: Optional CSS class for styling

## Applied Filter Object Structure
```typescript
interface AppliedFilter {
  key: string;        // Unique identifier
  label: string;      // Display text (e.g., "Техника: Абстракция")
  value: string;      // Filter value
  onRemove: () => void; // Function to remove this specific filter
}
```

## Styling
Uses CSS classes from `@/components/ui/styles/applied-filters-section.css` with mobile-specific overrides.

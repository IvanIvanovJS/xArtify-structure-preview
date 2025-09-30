// app/gallery/_components/ActiveChips.tsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { XIcon } from 'lucide-react';

// Types
interface ActiveChipsProps {
    searchParams: { [key: string]: string | string[] | undefined };
}

// Helper function to get display label for filter values
function getFilterDisplayLabel(key: string, value: string | string[]): string {
    if (Array.isArray(value)) {
        return value.join(', ');
    }

    switch (key) {
        case 'technique':
            return `Техника: ${value}`;
        case 'subject':
            return `Тема: ${value}`;
        case 'style':
            return `Стил: ${value}`;
        case 'author':
            return `Автор: ${value}`;
        case 'priceMin':
            return `Цена от: ${parseFloat(value).toFixed(0)} лв.`;
        case 'priceMax':
            return `Цена до: ${parseFloat(value).toFixed(0)} лв.`;
        case 'widthMin':
            return `Ширина от: ${parseFloat(value).toFixed(0)} см`;
        case 'widthMax':
            return `Ширина до: ${parseFloat(value).toFixed(0)} см`;
        case 'heightMin':
            return `Височина от: ${parseFloat(value).toFixed(0)} см`;
        case 'heightMax':
            return `Височина до: ${parseFloat(value).toFixed(0)} см`;
        case 'q':
            return `Търсене: "${value}"`;
        default:
            return value;
    }
}

// Individual filter chip component
function FilterChip({
    filterKey,
    filterValue,
    onRemove
}: {
    filterKey: string;
    filterValue: string | string[];
    onRemove: (key: string, value: string | string[]) => void;
}): React.JSX.Element {
    const displayLabel = getFilterDisplayLabel(filterKey, filterValue);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className="filter-chip"
        >
            <span className="chip-label">{displayLabel}</span>
            <button
                onClick={() => onRemove(filterKey, filterValue)}
                className="chip-remove-button"
                type="button"
                aria-label={`Премахни филтър: ${displayLabel}`}
            >
                <XIcon size={14} />
            </button>
        </motion.div>
    );
}

export default function ActiveChips({ searchParams }: ActiveChipsProps): React.JSX.Element {
    const router = useRouter();
    const currentSearchParams = useSearchParams();

    // Get active filters (exclude page and sort)
    const activeFilters = Object.entries(searchParams).filter(([key, value]) => {
        if (key === 'page' || key === 'sort') return false;
        if (Array.isArray(value)) return value.length > 0;
        return value !== undefined && value !== '';
    });

    const removeFilter = (key: string, value: string | string[]): void => {
        const newSearchParams = new URLSearchParams(currentSearchParams.toString());

        if (key === 'tags' && Array.isArray(value)) {
            // Handle tags array - remove specific tags
            const currentTags = newSearchParams.get('tags')?.split(',') || [];
            const remainingTags = currentTags.filter(tag => !value.includes(tag));

            if (remainingTags.length > 0) {
                newSearchParams.set('tags', remainingTags.join(','));
            } else {
                newSearchParams.delete('tags');
            }
        } else {
            // Remove single filter
            newSearchParams.delete(key);
        }

        // Reset to page 1 when filters change
        newSearchParams.set('page', '1');

        // Navigate to new URL
        router.push(`/gallery?${newSearchParams.toString()}`);
    };

    const clearAllFilters = (): void => {
        router.push('/gallery');
    };

    // Don't render if no active filters
    if (activeFilters.length === 0) {
        return <></>;
    }

    return (
        <div className="active-filters">
            <div className="active-filters-header">
                <h3 className="active-filters-title">
                    Активни филтри ({activeFilters.length})
                </h3>
                <button
                    onClick={clearAllFilters}
                    className="clear-all-filters-button"
                    type="button"
                >
                    Изчисти всички
                </button>
            </div>

            <div className="filter-chips-container">
                <AnimatePresence mode="popLayout">
                    {activeFilters.map(([key, value]) => (
                        <FilterChip
                            key={`${key}-${Array.isArray(value) ? value.join(',') : value}`}
                            filterKey={key}
                            filterValue={value || ''}
                            onRemove={removeFilter}
                        />
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}

// app/gallery/_components/ActiveChips.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { XIcon } from 'lucide-react';

// Types
interface Filters {
    search: string;
    author: string;
    technique: string[];
    subject: string[];
    style: string[];
    priceRange: [number, number];
    widthRange: [number, number];
    heightRange: [number, number];
    tags: string[];
    sortBy: string;
    availability: string;
}

interface ActiveChipsProps {
    filters: Filters;
    onFilterChange: (key: keyof Filters, value: string | string[] | [number, number]) => void;
}

// Helper function to get display label for filter values
function getFilterDisplayLabel(key: string, value: string | string[] | [number, number]): string {
    if (Array.isArray(value)) {
        if (typeof value[0] === 'number') {
            // Handle range arrays
            switch (key) {
                case 'priceRange':
                    return `Цена: ${value[0]} - ${value[1]} лв.`;
                case 'widthRange':
                    return `Ширина: ${value[0]} - ${value[1]} см`;
                case 'heightRange':
                    return `Височина: ${value[0]} - ${value[1]} см`;
                default:
                    return value.join(', ');
            }
        } else {
            // Handle string arrays
            return value.join(', ');
        }
    }

    switch (key) {
        case 'search':
            return `Търсене: "${value}"`;
        case 'author':
            return `Автор: ${value}`;
        case 'availability':
            switch (value) {
                case 'new':
                    return 'Наличност: Нови (последните 14 дни)';
                case 'promotion':
                    return 'Наличност: На промоция';
                case 'sold':
                    return 'Наличност: Продадени';
                default:
                    return `Наличност: ${value}`;
            }
        case 'sortBy':
            switch (value) {
                case 'newest':
                    return 'Сортиране: Най-нови';
                case 'oldest':
                    return 'Сортиране: Най-стари';
                case 'price-low':
                    return 'Сортиране: Цена: ниска → висока';
                case 'price-high':
                    return 'Сортиране: Цена: висока → ниска';
                case 'title':
                    return 'Сортиране: Заглавие A-Z';
                default:
                    return `Сортиране: ${value}`;
            }
        default:
            return `${key}: ${value}`;
    }
}

// Helper function to check if a filter has a value
function hasFilterValue(key: string, value: string | string[] | [number, number]): boolean {
    if (Array.isArray(value)) {
        if (typeof value[0] === 'number') {
            // For range arrays, check if they're not at default values
            const numValue = value as [number, number];
            switch (key) {
                case 'priceRange':
                    return numValue[0] > 0 || numValue[1] < 10000;
                case 'widthRange':
                    return numValue[0] > 0 || numValue[1] < 1000;
                case 'heightRange':
                    return numValue[0] > 0 || numValue[1] < 1000;
                default:
                    return value.length > 0;
            }
        } else {
            return value.length > 0;
        }
    }
    return value !== '' && value !== 'newest';
}

// Helper function to clear a specific filter
function clearFilter(key: keyof Filters, onFilterChange: (key: keyof Filters, value: string | string[] | [number, number]) => void) {
    switch (key) {
        case 'search':
        case 'author':
        case 'availability':
            onFilterChange(key, '');
            break;
        case 'sortBy':
            onFilterChange(key, 'newest');
            break;
        case 'technique':
        case 'subject':
        case 'style':
        case 'tags':
            onFilterChange(key, []);
            break;
        case 'priceRange':
            onFilterChange(key, [0, 10000]);
            break;
        case 'widthRange':
            onFilterChange(key, [0, 1000]);
            break;
        case 'heightRange':
            onFilterChange(key, [0, 1000]);
            break;
    }
}

export default function ActiveChips({ filters, onFilterChange }: ActiveChipsProps): React.JSX.Element {
    // Get all active filters
    const activeFilters = Object.entries(filters)
        .filter(([key, value]) => hasFilterValue(key, value))
        .map(([key, value]) => ({
            key: key as keyof Filters,
            value,
            label: getFilterDisplayLabel(key, value)
        }));

    if (activeFilters.length === 0) {
        return <div />;
    }

    return (
        <div className="active-filters">
            <div className="active-filters-header">
                <h3 className="active-filters-title">Активни филтри</h3>
                <span className="active-filters-count">{activeFilters.length}</span>
            </div>

            <div className="active-filters-chips">
                <AnimatePresence>
                    {activeFilters.map((filter) => (
                        <motion.div
                            key={filter.key}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.2 }}
                            className="active-filter-chip"
                        >
                            <span className="chip-label">{filter.label}</span>
                            <button
                                onClick={() => clearFilter(filter.key, onFilterChange)}
                                className="chip-remove-btn"
                                aria-label={`Премахни филтър ${filter.label}`}
                            >
                                <XIcon size={14} />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
// app/gallery/_components/FiltersMobileSheet.tsx
'use client';

import { useState } from 'react';
import { SlidersHorizontalIcon } from 'lucide-react';
import UnifiedFilterDrawer from '@/components/ui/UnifiedFilterDrawer';
import ViewModeControls, { type ViewMode } from '@/components/ui/ViewModeControls';
import '@/components/ui/styles/unified-filter-drawer.css';
import '@/components/ui/styles/applied-filters-section.css';
import './styles/filters-mobile-sheet.css';

// Types
interface FilterOptions {
    techniques: Array<{ name: string; count: number }>;
    subjects: Array<{ name: string; count: number }>;
    styles: Array<{ name: string; count: number }>;
    authors: Array<{ id: string; name: string; count: number }>;
    tags: Array<{ name: string; count: number }>;
    priceRange: {
        min: number;
        max: number;
    };
    sizeRange: {
        widthMin: number;
        widthMax: number;
        heightMin: number;
        heightMax: number;
    };
}

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

interface FiltersMobileSheetProps {
    filterOptions: FilterOptions;
    filters: Filters;
    onFilterChange: (key: keyof Filters, value: string | string[] | [number, number]) => void;
    clearFilters: () => void;
    viewMode: ViewMode;
    onViewModeChange: (viewMode: ViewMode) => void;
}

// Main Filters Mobile Sheet Component
export default function FiltersMobileSheet({
    filterOptions,
    filters,
    onFilterChange,
    clearFilters,
    viewMode,
    onViewModeChange
}: FiltersMobileSheetProps): React.JSX.Element {
    const [isOpen, setIsOpen] = useState(false);

    // Count active filters
    const activeFiltersCount = Object.values(filters).reduce((count, value) => {
        if (Array.isArray(value)) {
            if (typeof value[0] === 'number') {
                // For range arrays, check if they're not at default values
                if (value[0] > 0 || value[1] < 10000) {
                    return count + 1;
                }
            } else {
                return count + (value.length > 0 ? 1 : 0);
            }
        } else {
            return count + (value !== '' && value !== 'newest' ? 1 : 0);
        }
        return count;
    }, 0);

    const handleApplyFilters = () => {
        setIsOpen(false);
    };

    const handleClearFilters = () => {
        clearFilters();
        setIsOpen(false);
    };

    // Generate applied filters for display
    const getAppliedFilters = () => {
        const applied: Array<{ key: string; label: string; value: string; onRemove: () => void }> = [];

        // Search filter
        if (filters.search) {
            applied.push({
                key: 'search',
                label: `Търсене: "${filters.search}"`,
                value: filters.search,
                onRemove: () => onFilterChange('search', '')
            });
        }

        // Author filter
        if (filters.author) {
            applied.push({
                key: 'author',
                label: `Художник: ${filters.author}`,
                value: filters.author,
                onRemove: () => onFilterChange('author', '')
            });
        }

        // Sort filter (only if not default)
        if (filters.sortBy && filters.sortBy !== 'newest') {
            const sortLabels: Record<string, string> = {
                'oldest': 'Най-стари',
                'price-low': 'Цена: ниска → висока',
                'price-high': 'Цена: висока → ниска',
                'title': 'Заглавие A-Z'
            };
            applied.push({
                key: 'sortBy',
                label: `Сортиране: ${sortLabels[filters.sortBy] || filters.sortBy}`,
                value: filters.sortBy,
                onRemove: () => onFilterChange('sortBy', 'newest')
            });
        }

        // Technique filters
        filters.technique.forEach(technique => {
            applied.push({
                key: `technique-${technique}`,
                label: `Техника: ${technique}`,
                value: technique,
                onRemove: () => {
                    const newTechniques = filters.technique.filter(t => t !== technique);
                    onFilterChange('technique', newTechniques);
                }
            });
        });

        // Subject filters
        filters.subject.forEach(subject => {
            applied.push({
                key: `subject-${subject}`,
                label: `Тема: ${subject}`,
                value: subject,
                onRemove: () => {
                    const newSubjects = filters.subject.filter(s => s !== subject);
                    onFilterChange('subject', newSubjects);
                }
            });
        });

        // Style filters
        filters.style.forEach(style => {
            applied.push({
                key: `style-${style}`,
                label: `Стил: ${style}`,
                value: style,
                onRemove: () => {
                    const newStyles = filters.style.filter(s => s !== style);
                    onFilterChange('style', newStyles);
                }
            });
        });

        // Price range filter - only show if different from default [0, maxPrice]
        const maxPrice = filterOptions.priceRange.max;
        if (filters.priceRange[0] > 0 || filters.priceRange[1] < maxPrice) {
            applied.push({
                key: 'priceRange',
                label: `Цена: ${filters.priceRange[0]} - ${filters.priceRange[1]} лв.`,
                value: `${filters.priceRange[0]}-${filters.priceRange[1]}`,
                onRemove: () => onFilterChange('priceRange', [0, maxPrice])
            });
        }

        // Width range filter - only show if different from default [0, maxWidth]
        const maxWidth = filterOptions.sizeRange.widthMax;
        if (filters.widthRange[0] > 0 || filters.widthRange[1] < maxWidth) {
            applied.push({
                key: 'widthRange',
                label: `Ширина: ${filters.widthRange[0]} - ${filters.widthRange[1]} см`,
                value: `${filters.widthRange[0]}-${filters.widthRange[1]}`,
                onRemove: () => onFilterChange('widthRange', [0, maxWidth])
            });
        }

        // Height range filter - only show if different from default [0, maxHeight]
        const maxHeight = filterOptions.sizeRange.heightMax;
        if (filters.heightRange[0] > 0 || filters.heightRange[1] < maxHeight) {
            applied.push({
                key: 'heightRange',
                label: `Височина: ${filters.heightRange[0]} - ${filters.heightRange[1]} см`,
                value: `${filters.heightRange[0]}-${filters.heightRange[1]}`,
                onRemove: () => onFilterChange('heightRange', [0, maxHeight])
            });
        }

        // Tags filters
        filters.tags.forEach(tag => {
            applied.push({
                key: `tag-${tag}`,
                label: `Таг: ${tag}`,
                value: tag,
                onRemove: () => {
                    const newTags = filters.tags.filter(t => t !== tag);
                    onFilterChange('tags', newTags);
                }
            });
        });

        // Availability filter
        if (filters.availability) {
            const availabilityLabels: Record<string, string> = {
                'new': 'Нови (последните 14 дни)',
                'promotion': 'На промоция',
                'sold': 'Продадени'
            };
            applied.push({
                key: 'availability',
                label: `Наличност: ${availabilityLabels[filters.availability] || filters.availability}`,
                value: filters.availability,
                onRemove: () => onFilterChange('availability', '')
            });
        }

        return applied;
    };

    // Map filters to UnifiedFilterDrawer sections
    const sections = [
        {
            id: 'author',
            title: 'Художник',
            type: 'dropdown' as const,
            value: filters.author,
            dropdownOptions: [
                { value: '', label: 'Всички художници' },
                ...filterOptions.authors.map(author => ({
                    value: author.name,
                    label: `${author.name} (${author.count})`
                }))
            ]
        },
        {
            id: 'sort',
            title: 'Сортиране',
            type: 'dropdown' as const,
            value: filters.sortBy,
            dropdownOptions: [
                { value: 'newest', label: 'Най-нови' },
                { value: 'oldest', label: 'Най-стари' },
                { value: 'price-low', label: 'Цена: ниска → висока' },
                { value: 'price-high', label: 'Цена: висока → ниска' },
                { value: 'title', label: 'Заглавие A-Z' }
            ]
        },
        {
            id: 'availability',
            title: 'Наличност',
            type: 'dropdown' as const,
            value: filters.availability,
            dropdownOptions: [
                { value: '', label: 'Всички картини' },
                { value: 'new', label: 'Нови (последните 14 дни)' },
                { value: 'promotion', label: 'На промоция' },
                { value: 'sold', label: 'Продадени' }
            ]
        },
        {
            id: 'price',
            title: 'Ценови диапазон',
            type: 'range' as const,
            value: filters.priceRange
        },
        {
            id: 'size',
            title: 'Размер (в см)',
            type: 'size' as const,
            widthValue: filters.widthRange,
            heightValue: filters.heightRange,
            widthMax: 1000,
            heightMax: 1000
        },
        {
            id: 'technique',
            title: 'Техника',
            type: 'checkbox' as const,
            value: filters.technique,
            options: filterOptions.techniques.filter(t => t.count > 0).map(technique => ({
                id: technique.name,
                name: technique.name,
                count: technique.count
            }))
        },
        {
            id: 'subject',
            title: 'Тема',
            type: 'checkbox' as const,
            value: filters.subject,
            options: filterOptions.subjects.filter(s => s.count > 0).map(subject => ({
                id: subject.name,
                name: subject.name,
                count: subject.count
            }))
        },
        {
            id: 'style',
            title: 'Стил',
            type: 'checkbox' as const,
            value: filters.style,
            options: filterOptions.styles.filter(s => s.count > 0).map(style => ({
                id: style.name,
                name: style.name,
                count: style.count
            }))
        },
        {
            id: 'tags',
            title: 'Тагове',
            type: 'checkbox' as const,
            value: filters.tags,
            options: filterOptions.tags.filter(t => t.count > 0).map(tag => ({
                id: tag.name,
                name: tag.name,
                count: tag.count
            }))
        }
    ];

    return (
        <>
            {/* Mobile Filter Button */}
            <div className="mobile-filters-container">
                <button
                    onClick={() => setIsOpen(true)}
                    className="mobile-filters-btn"
                    aria-label="Отвори филтри"
                >
                    <SlidersHorizontalIcon size={20} />
                    <span>Филтри</span>
                    {activeFiltersCount > 0 && (
                        <span className="filter-count-badge">
                            {activeFiltersCount}
                        </span>
                    )}
                </button>

                <ViewModeControls
                    currentView={viewMode}
                    onViewChange={onViewModeChange}
                />
            </div>

            {/* Unified Filter Drawer */}
            <UnifiedFilterDrawer
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                sections={sections}
                onFilterChange={(sectionId, value) => {
                    switch (sectionId) {
                        case 'author':
                            onFilterChange('author', value as string);
                            break;
                        case 'sort':
                            onFilterChange('sortBy', value as string);
                            break;
                        case 'technique':
                            onFilterChange('technique', value as string[]);
                            break;
                        case 'subject':
                            onFilterChange('subject', value as string[]);
                            break;
                        case 'style':
                            onFilterChange('style', value as string[]);
                            break;
                        case 'price':
                            onFilterChange('priceRange', value as [number, number]);
                            break;
                        case 'size':
                            onFilterChange('widthRange', value as [number, number]);
                            break;
                        case 'height':
                            onFilterChange('heightRange', value as [number, number]);
                            break;
                        case 'tags':
                            onFilterChange('tags', value as string[]);
                            break;
                        case 'availability':
                            onFilterChange('availability', value as string);
                            break;
                    }
                }}
                onClearAll={handleClearFilters}
                onApply={handleApplyFilters}
                appliedFilters={getAppliedFilters()}
            />
        </>
    );
}
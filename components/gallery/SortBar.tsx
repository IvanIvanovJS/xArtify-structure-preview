// app/gallery/_components/SortBar.tsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronDownIcon } from 'lucide-react';

// Types
interface SortBarProps {
    searchParams: { [key: string]: string | string[] | undefined };
    totalItems: number;
}

// Sort options
const sortOptions = [
    { value: 'newest', label: 'Най-нови' },
    { value: 'price_asc', label: 'Цена: ниска към висока' },
    { value: 'price_desc', label: 'Цена: висока към ниска' },
    { value: 'title_asc', label: 'Заглавие: А-Я' },
    { value: 'title_desc', label: 'Заглавие: Я-А' },
];

export default function SortBar({ searchParams, totalItems }: SortBarProps): React.JSX.Element {
    const router = useRouter();
    const currentSearchParams = useSearchParams();

    const currentSort = (searchParams.sort as string) || 'newest';
    const currentPage = (searchParams.page as string) || '1';

    const handleSortChange = (newSort: string): void => {
        const newSearchParams = new URLSearchParams(currentSearchParams.toString());

        // Update sort parameter
        newSearchParams.set('sort', newSort);

        // Reset to page 1 when sorting changes
        newSearchParams.set('page', '1');

        // Navigate to new URL
        router.push(`/gallery?${newSearchParams.toString()}`);
    };

    const clearAllFilters = (): void => {
        router.push('/gallery');
    };

    // Check if any filters are active (excluding page and sort)
    const hasActiveFilters = Object.entries(searchParams).some(([key, value]) => {
        if (key === 'page' || key === 'sort') return false;
        if (Array.isArray(value)) return value.length > 0;
        return value !== undefined && value !== '';
    });

    // const selectedSortLabel = sortOptions.find(option => option.value === currentSort)?.label || 'Най-нови'; // Not used yet

    return (
        <div className="sort-bar">
            {/* Results Count */}
            <div className="results-info">
                <span className="results-count">
                    {totalItems.toLocaleString('bg-BG')} картини
                </span>
                {hasActiveFilters && (
                    <span className="filtered-indicator">
                        (филтрирани резултати)
                    </span>
                )}
            </div>

            {/* Controls */}
            <div className="sort-controls">
                {/* Clear All Filters Button */}
                {hasActiveFilters && (
                    <button
                        onClick={clearAllFilters}
                        className="clear-all-button"
                        type="button"
                        aria-label="Изчисти всички филтри"
                    >
                        Изчисти филтрите
                    </button>
                )}

                {/* Sort Dropdown */}
                <div className="sort-dropdown-container">
                    <label htmlFor="sort-select" className="sort-label">
                        Сортирай по:
                    </label>
                    <div className="custom-select">
                        <select
                            id="sort-select"
                            value={currentSort}
                            onChange={(e) => handleSortChange(e.target.value)}
                            className="sort-dropdown"
                            aria-label="Избери начин на сортиране"
                        >
                            {sortOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        <ChevronDownIcon className="select-icon" size={16} />
                    </div>
                </div>
            </div>

            {/* Current Page Info (Mobile) */}
            <div className="mobile-page-info">
                <span className="page-info">
                    Страница {currentPage}
                </span>
            </div>
        </div>
    );
}

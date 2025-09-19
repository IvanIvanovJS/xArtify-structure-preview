// app/gallery/_components/SortBar.tsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronDownIcon, CheckIcon } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

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
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

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
        setIsOpen(false);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const clearAllFilters = (): void => {
        router.push('/gallery');
    };

    // Check if any filters are active (excluding page and sort)
    const hasActiveFilters = Object.entries(searchParams).some(([key, value]) => {
        if (key === 'page' || key === 'sort') return false;
        if (Array.isArray(value)) return value.length > 0;
        return value !== undefined && value !== '';
    });

    const selectedSortLabel = sortOptions.find(option => option.value === currentSort)?.label || 'Най-нови';

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
                    <label className="sort-label">
                        Сортирай по:
                    </label>
                    <div className="custom-select" ref={dropdownRef}>
                        <button
                            type="button"
                            className="sort-dropdown"
                            onClick={() => setIsOpen(!isOpen)}
                            aria-label="Избери начин на сортиране"
                            aria-expanded={isOpen}
                        >
                            <span className="selected-option">{selectedSortLabel}</span>
                            <ChevronDownIcon
                                className={`select-icon ${isOpen ? 'rotate-180' : ''}`}
                                size={16}
                            />
                        </button>

                        {isOpen && (
                            <div className="dropdown-options">
                                {sortOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        className={`dropdown-option ${currentSort === option.value ? 'selected' : ''}`}
                                        onClick={() => handleSortChange(option.value)}
                                    >
                                        <span className="option-label">{option.label}</span>
                                        {currentSort === option.value && (
                                            <CheckIcon className="check-icon" size={16} />
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
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

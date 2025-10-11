// app/gallery/_components/FiltersMobileSheet.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { SlidersHorizontalIcon } from 'lucide-react';
import UnifiedFilterDrawer from '@/components/ui/UnifiedFilterDrawer';
import '@/components/ui/styles/unified-filter-drawer.css';

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

interface FiltersMobileSheetProps {
    filterOptions: FilterOptions;
    searchParams: { [key: string]: string | string[] | undefined };
}


// Main Filters Mobile Sheet Component
export default function FiltersMobileSheet({
    filterOptions,
    searchParams
}: FiltersMobileSheetProps): React.JSX.Element {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);

    // State for filter values
    const [filters, setFilters] = useState({
        q: (searchParams.q as string) || '',
        author: (searchParams.author as string) || '',
        technique: (searchParams.technique as string) || '',
        subject: (searchParams.subject as string) || '',
        style: (searchParams.style as string) || '',
        priceMin: searchParams.priceMin ? parseInt(searchParams.priceMin as string) || 0 : 0,
        priceMax: searchParams.priceMax ? parseInt(searchParams.priceMax as string) || 0 : 0,
        widthMin: parseInt((searchParams.widthMin as string) || '0') || 0,
        widthMax: parseInt((searchParams.widthMax as string) || '0') || 0,
        heightMin: parseInt((searchParams.heightMin as string) || '0') || 0,
        heightMax: parseInt((searchParams.heightMax as string) || '0') || 0,
        tags: Array.isArray(searchParams.tags) ? searchParams.tags :
            (searchParams.tags as string)?.split(',') || [],
        sort: (searchParams.sort as string) || 'newest',
        availability: (searchParams.availability as string) || '',
    });

    const updateFilters = (newFilters: Partial<typeof filters>): void => {
        const updatedFilters = { ...filters, ...newFilters };
        setFilters(updatedFilters);

        // Build new search params
        const newSearchParams = new URLSearchParams();

        Object.entries(updatedFilters).forEach(([key, value]) => {
            if (key === 'tags' && Array.isArray(value) && value.length > 0) {
                newSearchParams.set(key, value.join(','));
            } else if (key === 'priceMin' && value && value !== 0) {
                newSearchParams.set(key, value.toString());
            } else if (key === 'priceMax' && value && value !== (filterOptions.priceRange?.max || 10000)) {
                newSearchParams.set(key, value.toString());
            } else if (value && value !== '' && value !== 0) {
                newSearchParams.set(key, value.toString());
            }
        });

        // Reset to page 1 when filters change
        newSearchParams.set('page', '1');

        // Navigate to new URL
        router.push(`/gallery?${newSearchParams.toString()}`);
    };

    const clearAllFilters = (): void => {
        router.push('/gallery');
        setIsOpen(false);
    };

    const closeSheet = (): void => {
        setIsOpen(false);
    };

    const handleFilterChange = (sectionId: string, value: string | string[] | [number, number]): void => {
        switch (sectionId) {
            case 'sort':
                updateFilters({ sort: value as string });
                break;
            case 'availability':
                updateFilters({ availability: value as string });
                break;
            case 'author':
                updateFilters({ author: value as string });
                break;
            case 'technique':
                updateFilters({ technique: value as string });
                break;
            case 'subject':
                updateFilters({ subject: value as string });
                break;
            case 'style':
                updateFilters({ style: value as string });
                break;
            case 'price':
                const priceRange = value as [number, number];
                updateFilters({ priceMin: priceRange[0], priceMax: priceRange[1] });
                break;
            case 'size':
                // Handle size range if needed
                break;
            case 'tags':
                updateFilters({ tags: value as string[] });
                break;
        }
    };

    const handleApply = (): void => {
        setIsOpen(false);
    };

    // Prepare filter sections for UnifiedFilterDrawer
    const filterSections = [
        {
            id: 'sort',
            title: 'Сортиране',
            type: 'dropdown' as const,
            dropdownOptions: [
                { value: 'newest', label: 'Най-нови' },
                { value: 'price_asc', label: 'Цена: ниска към висока' },
                { value: 'price_desc', label: 'Цена: висока към ниска' },
                { value: 'title_asc', label: 'Заглавие: А-Я' },
                { value: 'title_desc', label: 'Заглавие: Я-А' },
            ],
            value: filters.sort,
            placeholder: 'Избери сортиране'
        },
        {
            id: 'availability',
            title: 'Наличност',
            type: 'dropdown' as const,
            dropdownOptions: [
                { value: '', label: 'Всички картини' },
                { value: 'new', label: 'Нови (последните 14 дни)' },
                { value: 'promotion', label: 'На промоция' },
                { value: 'sold', label: 'Продадени' },
            ],
            value: filters.availability,
            placeholder: 'Избери наличност'
        },
        {
            id: 'author',
            title: 'Автор',
            type: 'checkbox' as const,
            options: filterOptions.authors.map(author => ({
                id: author.name,
                name: author.name,
                count: author.count
            })),
            value: filters.author ? [filters.author] : []
        },
        {
            id: 'technique',
            title: 'Техника',
            type: 'checkbox' as const,
            options: filterOptions.techniques.map(technique => ({
                id: technique.name,
                name: technique.name,
                count: technique.count
            })),
            value: filters.technique ? [filters.technique] : []
        },
        {
            id: 'subject',
            title: 'Тема',
            type: 'checkbox' as const,
            options: filterOptions.subjects.map(subject => ({
                id: subject.name,
                name: subject.name,
                count: subject.count
            })),
            value: filters.subject ? [filters.subject] : []
        },
        {
            id: 'style',
            title: 'Стил',
            type: 'checkbox' as const,
            options: filterOptions.styles.map(style => ({
                id: style.name,
                name: style.name,
                count: style.count
            })),
            value: filters.style ? [filters.style] : []
        },
        {
            id: 'price',
            title: 'Цена',
            type: 'range' as const,
            value: [filters.priceMin || filterOptions.priceRange?.min || 0, filters.priceMax || filterOptions.priceRange?.max || 10000] as [number, number]
        },
        {
            id: 'tags',
            title: 'Тагове',
            type: 'checkbox' as const,
            options: filterOptions.tags.map(tag => ({
                id: tag.name,
                name: tag.name,
                count: tag.count
            })),
            value: filters.tags
        }
    ];

    return (
        <>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="mobile-filters-button"
                type="button"
                aria-label="Отвори филтри"
            >
                <SlidersHorizontalIcon size={20} />
                <span className="mobile-filters-button-text">Филтри</span>
            </button>

            {/* Unified Filter Drawer */}
            <UnifiedFilterDrawer
                isOpen={isOpen}
                onClose={closeSheet}
                sections={filterSections}
                onFilterChange={handleFilterChange}
                onClearAll={clearAllFilters}
                onApply={handleApply}
            />
        </>
    );
}

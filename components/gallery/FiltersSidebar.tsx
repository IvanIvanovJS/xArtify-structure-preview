// app/gallery/_components/FiltersSidebar.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ChevronDownIcon, ChevronUpIcon, SearchIcon, SlidersHorizontalIcon } from 'lucide-react';
import CustomDropdown from '@/components/ui/CustomDropdown';

// Debounce hook to prevent excessive API calls
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}


// Types
interface FilterOptions {
    techniques: string[];
    subjects: string[];
    styles: string[];
    authors: Array<{ id: string; name: string }>;
    tags: string[];
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

interface FiltersSidebarProps {
    filterOptions: FilterOptions;
    searchParams: { [key: string]: string | string[] | undefined };
}

// Individual filter section component
function FilterSection({
    title,
    isExpanded,
    onToggle,
    children
}: {
    title: string;
    isExpanded: boolean;
    onToggle: () => void;
    children: React.ReactNode;
}): React.JSX.Element {
    return (
        <div className="filter-section">
            <button
                onClick={onToggle}
                className="filter-section-header"
                type="button"
                aria-expanded={isExpanded}
            >
                <span className="filter-section-title">{title}</span>
                {isExpanded ? (
                    <ChevronUpIcon size={16} />
                ) : (
                    <ChevronDownIcon size={16} />
                )}
            </button>
            {isExpanded && (
                <div className="filter-section-content">
                    {children}
                </div>
            )}
        </div>
    );
}

// Search input component
function SearchFilter({
    value,
    onChange
}: {
    value: string;
    onChange: (value: string) => void;
}): React.JSX.Element {
    return (
        <div className="search-filter">
            <div className="search-input-container">
                <SearchIcon size={16} className="search-icon" />
                <input
                    type="text"
                    placeholder="Търси картини..."
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="search-input"
                />
            </div>
        </div>
    );
}

// Select filter component
function SelectFilter({
    options,
    value,
    onChange,
    placeholder = "Избери..."
}: {
    options: string[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}): React.JSX.Element {
    const dropdownOptions = [
        { value: "", label: placeholder },
        ...options.map(option => ({ value: option, label: option }))
    ];

    return (
        <div className="select-filter">
            <CustomDropdown
                value={value}
                onChange={onChange}
                options={dropdownOptions}
                className="filter-dropdown"
            />
        </div>
    );
}

// Author select filter
function AuthorFilter({
    authors,
    value,
    onChange
}: {
    authors: Array<{ id: string; name: string }>;
    value: string;
    onChange: (value: string) => void;
}): React.JSX.Element {
    const dropdownOptions = [
        { value: "", label: "Всички художници" },
        ...(authors || []).filter(author => author && author.name).map(author => ({
            value: author.name,
            label: author.name
        }))
    ];

    return (
        <div className="select-filter">
            <CustomDropdown
                value={value}
                onChange={onChange}
                options={dropdownOptions}
                className="filter-dropdown"
            />
        </div>
    );
}

// Price range filter
function PriceFilter({
    priceRange,
    minValue,
    maxValue,
    onMinChange,
    onMaxChange
}: {
    priceRange: { min: number; max: number };
    minValue: number;
    maxValue: number;
    onMinChange: (value: number) => void;
    onMaxChange: (value: number) => void;
}): React.JSX.Element {
    const [sliderMin, setSliderMin] = useState(minValue);
    const [sliderMax, setSliderMax] = useState(maxValue);

    // Debounce the slider values to prevent excessive API calls
    const debouncedMin = useDebounce(sliderMin, 500);
    const debouncedMax = useDebounce(sliderMax, 500);

    useEffect(() => {
        setSliderMin(minValue);
        setSliderMax(maxValue);
    }, [minValue, maxValue]);

    // Update parent component only when debounced values change
    useEffect(() => {
        if (debouncedMin !== minValue) {
            onMinChange(debouncedMin);
        }
    }, [debouncedMin, minValue, onMinChange]);

    useEffect(() => {
        if (debouncedMax !== maxValue) {
            onMaxChange(debouncedMax);
        }
    }, [debouncedMax, maxValue, onMaxChange]);

    const handleSliderChange = (type: 'min' | 'max', value: number): void => {
        if (type === 'min') {
            // Ensure min doesn't exceed max
            const newMin = Math.min(value, sliderMax);
            setSliderMin(newMin);
        } else {
            // Ensure max doesn't go below min
            const newMax = Math.max(value, sliderMin);
            setSliderMax(newMax);
        }
    };

    const minPrice = priceRange?.min || 0;
    const maxPrice = priceRange?.max || 10000;

    // Update the filled range between sliders
    useEffect(() => {
        const minPercent = ((sliderMin - minPrice) / (maxPrice - minPrice)) * 100;
        const maxPercent = ((sliderMax - minPrice) / (maxPrice - minPrice)) * 100;

        const sliderContainer = document.querySelector('.dual-range-slider') as HTMLElement;
        if (sliderContainer) {
            sliderContainer.style.setProperty('--min-percent', `${minPercent}%`);
            sliderContainer.style.setProperty('--max-percent', `${maxPercent}%`);
        }
    }, [sliderMin, sliderMax, minPrice, maxPrice]);

    return (
        <div className="price-filter">
            <label className="filter-label">Ценови диапазон</label>

            {/* Dual Range Slider */}
            <div className="dual-range-slider-container">
                <div className="dual-range-slider">
                    <input
                        type="range"
                        min={minPrice}
                        max={maxPrice}
                        value={sliderMin}
                        onChange={(e) => handleSliderChange('min', parseInt(e.target.value))}
                        className="range-slider range-slider-min"
                    />
                    <input
                        type="range"
                        min={minPrice}
                        max={maxPrice}
                        value={sliderMax}
                        onChange={(e) => handleSliderChange('max', parseInt(e.target.value))}
                        className="range-slider range-slider-max"
                    />
                </div>
            </div>

            {/* Value Display */}
            <div className="price-range-display">
                <span className="price-range-value">
                    {sliderMin.toFixed(0)} - {sliderMax.toFixed(0)} лв.
                </span>
            </div>

            {/* Manual Inputs */}
            <div className="price-inputs">
                <div className="price-input-group">
                    <label className="price-input-label">От</label>
                    <input
                        type="number"
                        min={priceRange?.min || 0}
                        max={priceRange?.max || 10000}
                        value={sliderMin}
                        onChange={(e) => handleSliderChange('min', parseInt(e.target.value) || 0)}
                        className="price-input"
                    />
                </div>
                <div className="price-input-group">
                    <label className="price-input-label">До</label>
                    <input
                        type="number"
                        min={priceRange?.min || 0}
                        max={priceRange?.max || 10000}
                        value={sliderMax}
                        onChange={(e) => handleSliderChange('max', parseInt(e.target.value) || 0)}
                        className="price-input"
                    />
                </div>
            </div>
        </div>
    );
}

// Size filter component
function SizeFilter({
    sizeRange,
    widthMin,
    widthMax,
    heightMin,
    heightMax,
    onWidthMinChange,
    onWidthMaxChange,
    onHeightMinChange,
    onHeightMaxChange
}: {
    sizeRange: { widthMin: number; widthMax: number; heightMin: number; heightMax: number };
    widthMin: number;
    widthMax: number;
    heightMin: number;
    heightMax: number;
    onWidthMinChange: (value: number) => void;
    onWidthMaxChange: (value: number) => void;
    onHeightMinChange: (value: number) => void;
    onHeightMaxChange: (value: number) => void;
}): React.JSX.Element {
    return (
        <div className="size-filter">
            <label className="filter-label">Размер (в см)</label>

            {/* Width */}
            <div className="size-input-group">
                <label className="size-input-label">Ширина</label>
                <div className="size-inputs">
                    <input
                        type="number"
                        placeholder="От"
                        min={sizeRange?.widthMin || 0}
                        max={sizeRange?.widthMax || 1000}
                        value={widthMin || ''}
                        onChange={(e) => onWidthMinChange(parseInt(e.target.value) || 0)}
                        className="size-input"
                    />
                    <span className="size-input-separator">-</span>
                    <input
                        type="number"
                        placeholder="До"
                        min={sizeRange?.widthMin || 0}
                        max={sizeRange?.widthMax || 1000}
                        value={widthMax || ''}
                        onChange={(e) => onWidthMaxChange(parseInt(e.target.value) || 0)}
                        className="size-input"
                    />
                </div>
            </div>

            {/* Height */}
            <div className="size-input-group">
                <label className="size-input-label">Височина</label>
                <div className="size-inputs">
                    <input
                        type="number"
                        placeholder="От"
                        min={sizeRange?.heightMin || 0}
                        max={sizeRange?.heightMax || 1000}
                        value={heightMin || ''}
                        onChange={(e) => onHeightMinChange(parseInt(e.target.value) || 0)}
                        className="size-input"
                    />
                    <span className="size-input-separator">-</span>
                    <input
                        type="number"
                        placeholder="До"
                        min={sizeRange?.heightMin || 0}
                        max={sizeRange?.heightMax || 1000}
                        value={heightMax || ''}
                        onChange={(e) => onHeightMaxChange(parseInt(e.target.value) || 0)}
                        className="size-input"
                    />
                </div>
            </div>
        </div>
    );
}

// Tags filter component
function TagsFilter({
    tags,
    selectedTags,
    onTagsChange
}: {
    tags: string[];
    selectedTags: string[];
    onTagsChange: (tags: string[]) => void;
}): React.JSX.Element {
    const toggleTag = (tag: string): void => {
        if (selectedTags.includes(tag)) {
            onTagsChange(selectedTags.filter(t => t !== tag));
        } else {
            onTagsChange([...selectedTags, tag]);
        }
    };

    return (
        <div className="tags-filter">
            <label className="filter-label">Тагове</label>
            <div className="tags-container">
                {tags.map((tag) => (
                    <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`tag-button ${selectedTags.includes(tag) ? 'tag-selected' : ''}`}
                        type="button"
                    >
                        {tag}
                    </button>
                ))}
            </div>
        </div>
    );
}

// Sort filter component
function SortFilter({
    value,
    onChange
}: {
    value: string;
    onChange: (value: string) => void;
}): React.JSX.Element {
    const dropdownOptions = [
        { value: 'newest', label: 'Най-нови' },
        { value: 'price_asc', label: 'Цена: ниска към висока' },
        { value: 'price_desc', label: 'Цена: висока към ниска' },
        { value: 'title_asc', label: 'Заглавие: А-Я' },
        { value: 'title_desc', label: 'Заглавие: Я-А' },
    ];

    return (
        <div className="sort-filter">
            <CustomDropdown
                value={value}
                onChange={onChange}
                options={dropdownOptions}
                className="filter-dropdown"
            />
        </div>
    );
}

// Main Filters Sidebar Component
export default function FiltersSidebar({
    filterOptions,
    searchParams
}: FiltersSidebarProps): React.JSX.Element {
    const router = useRouter();
    // const currentSearchParams = useSearchParams(); // Not used yet

    // State for expanded sections - all closed by default
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        search: false,
        author: false,
        technique: false,
        subject: false,
        style: false,
        price: false,
        size: false,
        tags: false,
        sort: false,
    });

    // State for filter values
    const [filters, setFilters] = useState({
        q: (searchParams.q as string) || '',
        author: (searchParams.author as string) || '',
        technique: (searchParams.technique as string) || '',
        subject: (searchParams.subject as string) || '',
        style: (searchParams.style as string) || '',
        priceMin: parseInt((searchParams.priceMin as string) || '0') || 0,
        priceMax: parseInt((searchParams.priceMax as string) || '0') || filterOptions.priceRange?.max || 10000,
        widthMin: parseInt((searchParams.widthMin as string) || '0') || 0,
        widthMax: parseInt((searchParams.widthMax as string) || '0') || 0,
        heightMin: parseInt((searchParams.heightMin as string) || '0') || 0,
        heightMax: parseInt((searchParams.heightMax as string) || '0') || 0,
        tags: Array.isArray(searchParams.tags) ? searchParams.tags :
            (searchParams.tags as string)?.split(',') || [],
        sort: (searchParams.sort as string) || 'newest',
    });

    const toggleSection = (section: string): void => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const updateFilters = (newFilters: Partial<typeof filters>): void => {
        const updatedFilters = { ...filters, ...newFilters };
        setFilters(updatedFilters);

        // Build new search params
        const newSearchParams = new URLSearchParams();

        Object.entries(updatedFilters).forEach(([key, value]) => {
            if (key === 'tags' && Array.isArray(value) && value.length > 0) {
                newSearchParams.set(key, value.join(','));
            } else if (value && value !== '' && value !== 0) {
                newSearchParams.set(key, value.toString());
            }
        });

        // Reset to page 1 when filters change
        newSearchParams.set('page', '1');

        // Navigate to new URL
        router.push(`/gallery?${newSearchParams.toString()}`);
    };

    return (
        <div className="filters-sidebar">
            <div className="filters-header">
                <SlidersHorizontalIcon size={20} />
                <h2 className="filters-title">Филтри</h2>
            </div>

            <div className="filters-content">
                {/* Search */}
                <FilterSection
                    title="Търсене"
                    isExpanded={expandedSections.search}
                    onToggle={() => toggleSection('search')}
                >
                    <SearchFilter
                        value={filters.q}
                        onChange={(value) => updateFilters({ q: value })}
                    />
                </FilterSection>

                {/* Author */}
                <FilterSection
                    title="Художник"
                    isExpanded={expandedSections.author}
                    onToggle={() => toggleSection('author')}
                >
                    <AuthorFilter
                        authors={filterOptions.authors}
                        value={filters.author}
                        onChange={(value) => updateFilters({ author: value })}
                    />
                </FilterSection>

                {/* Technique */}
                <FilterSection
                    title="Техника"
                    isExpanded={expandedSections.technique}
                    onToggle={() => toggleSection('technique')}
                >
                    <SelectFilter
                        options={filterOptions.techniques}
                        value={filters.technique}
                        onChange={(value) => updateFilters({ technique: value })}
                        placeholder="Всички техники"
                    />
                </FilterSection>

                {/* Subject */}
                <FilterSection
                    title="Тема"
                    isExpanded={expandedSections.subject}
                    onToggle={() => toggleSection('subject')}
                >
                    <SelectFilter
                        options={filterOptions.subjects}
                        value={filters.subject}
                        onChange={(value) => updateFilters({ subject: value })}
                        placeholder="Всички теми"
                    />
                </FilterSection>

                {/* Style */}
                <FilterSection
                    title="Стил"
                    isExpanded={expandedSections.style}
                    onToggle={() => toggleSection('style')}
                >
                    <SelectFilter
                        options={filterOptions.styles}
                        value={filters.style}
                        onChange={(value) => updateFilters({ style: value })}
                        placeholder="Всички стилове"
                    />
                </FilterSection>

                {/* Price */}
                <FilterSection
                    title="Цена"
                    isExpanded={expandedSections.price}
                    onToggle={() => toggleSection('price')}
                >
                    <PriceFilter
                        priceRange={filterOptions.priceRange}
                        minValue={filters.priceMin}
                        maxValue={filters.priceMax}
                        onMinChange={(value) => updateFilters({ priceMin: value })}
                        onMaxChange={(value) => updateFilters({ priceMax: value })}
                    />
                </FilterSection>

                {/* Size */}
                <FilterSection
                    title="Размер"
                    isExpanded={expandedSections.size}
                    onToggle={() => toggleSection('size')}
                >
                    <SizeFilter
                        sizeRange={filterOptions.sizeRange}
                        widthMin={filters.widthMin}
                        widthMax={filters.widthMax}
                        heightMin={filters.heightMin}
                        heightMax={filters.heightMax}
                        onWidthMinChange={(value) => updateFilters({ widthMin: value })}
                        onWidthMaxChange={(value) => updateFilters({ widthMax: value })}
                        onHeightMinChange={(value) => updateFilters({ heightMin: value })}
                        onHeightMaxChange={(value) => updateFilters({ heightMax: value })}
                    />
                </FilterSection>

                {/* Tags */}
                <FilterSection
                    title="Тагове"
                    isExpanded={expandedSections.tags}
                    onToggle={() => toggleSection('tags')}
                >
                    <TagsFilter
                        tags={filterOptions.tags}
                        selectedTags={filters.tags}
                        onTagsChange={(tags) => updateFilters({ tags })}
                    />
                </FilterSection>

                {/* Sort */}
                <FilterSection
                    title="Сортиране"
                    isExpanded={expandedSections.sort}
                    onToggle={() => toggleSection('sort')}
                >
                    <SortFilter
                        value={filters.sort}
                        onChange={(value) => updateFilters({ sort: value })}
                    />
                </FilterSection>
            </div>
        </div>
    );
}

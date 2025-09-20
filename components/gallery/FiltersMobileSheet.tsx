// app/gallery/_components/FiltersMobileSheet.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import CustomDropdown from '@/components/ui/CustomDropdown';
import {
    SlidersHorizontalIcon,
    XIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    SearchIcon
} from 'lucide-react';

// Custom hook for debouncing
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

interface FiltersMobileSheetProps {
    filterOptions: FilterOptions;
    searchParams: { [key: string]: string | string[] | undefined };
}

// Individual filter section component for mobile
function MobileFilterSection({
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
        <div className="mobile-filter-section">
            <button
                onClick={onToggle}
                className="mobile-filter-section-header"
                type="button"
                aria-expanded={isExpanded}
            >
                <span className="mobile-filter-section-title">{title}</span>
                {isExpanded ? (
                    <ChevronUpIcon size={16} />
                ) : (
                    <ChevronDownIcon size={16} />
                )}
            </button>
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="mobile-filter-section-content"
                    >
                        {children}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// Search input component
function MobileSearchFilter({
    value,
    onChange
}: {
    value: string;
    onChange: (value: string) => void;
}): React.JSX.Element {
    const [localValue, setLocalValue] = useState(value);
    const debouncedValue = useDebounce(localValue, 300);

    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    useEffect(() => {
        if (debouncedValue !== value) {
            onChange(debouncedValue);
        }
    }, [debouncedValue, value, onChange]);

    return (
        <div className="mobile-search-filter">
            <div className="mobile-search-input-container">
                <SearchIcon size={16} className="mobile-search-icon" />
                <input
                    type="text"
                    placeholder="Търси картини..."
                    value={localValue}
                    onChange={(e) => setLocalValue(e.target.value)}
                    className="mobile-search-input"
                />
            </div>
        </div>
    );
}

// Select filter component for mobile
function MobileSelectFilter({
    title,
    options,
    value,
    onChange,
    placeholder = "Избери..."
}: {
    title: string;
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
        <div className="mobile-select-filter">
            <CustomDropdown
                value={value}
                onChange={onChange}
                options={dropdownOptions}
                label={title}
                className="mobile-filter-dropdown"
            />
        </div>
    );
}

// Author select filter for mobile
function MobileAuthorFilter({
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
        <div className="mobile-select-filter">
            <CustomDropdown
                value={value}
                onChange={onChange}
                options={dropdownOptions}
                label="Художник"
                className="mobile-filter-dropdown"
            />
        </div>
    );
}

// Price range filter for mobile
function MobilePriceFilter({
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
            setSliderMin(value);
        } else {
            setSliderMax(value);
        }
    };

    return (
        <div className="mobile-price-filter">
            <label className="mobile-filter-label">Ценови диапазон</label>

            {/* Range Slider */}
            <div className="mobile-range-slider-container">
                <input
                    type="range"
                    min={priceRange?.min || 0}
                    max={priceRange?.max ? priceRange.max / 2 : 5000}
                    value={sliderMin}
                    onChange={(e) => handleSliderChange('min', parseInt(e.target.value))}
                    className="mobile-range-slider mobile-range-slider-min"
                />
                <input
                    type="range"
                    min={priceRange?.max ? priceRange.max / 2 : 5000}
                    max={priceRange?.max || 10000}
                    value={sliderMax}
                    onChange={(e) => handleSliderChange('max', parseInt(e.target.value))}
                    className="mobile-range-slider mobile-range-slider-max"
                />
            </div>

            {/* Value Display */}
            <div className="mobile-price-range-display">
                <span className="mobile-price-range-value">
                    {sliderMin.toFixed(0)} - {sliderMax.toFixed(0)} лв.
                </span>
            </div>

            {/* Manual Inputs */}
            <div className="mobile-price-inputs">
                <div className="mobile-price-input-group">
                    <label className="mobile-price-input-label">От</label>
                    <input
                        type="number"
                        min={priceRange?.min || 0}
                        max={priceRange?.max || 10000}
                        value={sliderMin}
                        onChange={(e) => handleSliderChange('min', parseInt(e.target.value) || 0)}
                        className="mobile-price-input"
                    />
                </div>
                <div className="mobile-price-input-group">
                    <label className="mobile-price-input-label">До</label>
                    <input
                        type="number"
                        min={priceRange?.min || 0}
                        max={priceRange?.max || 10000}
                        value={sliderMax}
                        onChange={(e) => handleSliderChange('max', parseInt(e.target.value) || 0)}
                        className="mobile-price-input"
                    />
                </div>
            </div>
        </div>
    );
}

// Size filter component for mobile
function MobileSizeFilter({
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
    const [localWidthMin, setLocalWidthMin] = useState(widthMin);
    const [localWidthMax, setLocalWidthMax] = useState(widthMax);
    const [localHeightMin, setLocalHeightMin] = useState(heightMin);
    const [localHeightMax, setLocalHeightMax] = useState(heightMax);

    // Debounce all size values
    const debouncedWidthMin = useDebounce(localWidthMin, 500);
    const debouncedWidthMax = useDebounce(localWidthMax, 500);
    const debouncedHeightMin = useDebounce(localHeightMin, 500);
    const debouncedHeightMax = useDebounce(localHeightMax, 500);

    useEffect(() => {
        setLocalWidthMin(widthMin);
        setLocalWidthMax(widthMax);
        setLocalHeightMin(heightMin);
        setLocalHeightMax(heightMax);
    }, [widthMin, widthMax, heightMin, heightMax]);

    // Update parent component only when debounced values change
    useEffect(() => {
        if (debouncedWidthMin !== widthMin) {
            onWidthMinChange(debouncedWidthMin);
        }
    }, [debouncedWidthMin, widthMin, onWidthMinChange]);

    useEffect(() => {
        if (debouncedWidthMax !== widthMax) {
            onWidthMaxChange(debouncedWidthMax);
        }
    }, [debouncedWidthMax, widthMax, onWidthMaxChange]);

    useEffect(() => {
        if (debouncedHeightMin !== heightMin) {
            onHeightMinChange(debouncedHeightMin);
        }
    }, [debouncedHeightMin, heightMin, onHeightMinChange]);

    useEffect(() => {
        if (debouncedHeightMax !== heightMax) {
            onHeightMaxChange(debouncedHeightMax);
        }
    }, [debouncedHeightMax, heightMax, onHeightMaxChange]);
    return (
        <div className="mobile-size-filter">
            <label className="mobile-filter-label">Размер (в см)</label>

            {/* Width */}
            <div className="mobile-size-input-group">
                <label className="mobile-size-input-label">Ширина</label>
                <div className="mobile-size-inputs">
                    <input
                        type="number"
                        placeholder="От"
                        min={sizeRange?.widthMin || 0}
                        max={sizeRange?.widthMax || 1000}
                        value={localWidthMin || ''}
                        onChange={(e) => setLocalWidthMin(parseInt(e.target.value) || 0)}
                        className="mobile-size-input"
                    />
                    <span className="mobile-size-input-separator">-</span>
                    <input
                        type="number"
                        placeholder="До"
                        min={sizeRange?.widthMin || 0}
                        max={sizeRange?.widthMax || 1000}
                        value={localWidthMax || ''}
                        onChange={(e) => setLocalWidthMax(parseInt(e.target.value) || 0)}
                        className="mobile-size-input"
                    />
                </div>
            </div>

            {/* Height */}
            <div className="mobile-size-input-group">
                <label className="mobile-size-input-label">Височина</label>
                <div className="mobile-size-inputs">
                    <input
                        type="number"
                        placeholder="От"
                        min={sizeRange?.heightMin || 0}
                        max={sizeRange?.heightMax || 1000}
                        value={localHeightMin || ''}
                        onChange={(e) => setLocalHeightMin(parseInt(e.target.value) || 0)}
                        className="mobile-size-input"
                    />
                    <span className="mobile-size-input-separator">-</span>
                    <input
                        type="number"
                        placeholder="До"
                        min={sizeRange?.heightMin || 0}
                        max={sizeRange?.heightMax || 1000}
                        value={localHeightMax || ''}
                        onChange={(e) => setLocalHeightMax(parseInt(e.target.value) || 0)}
                        className="mobile-size-input"
                    />
                </div>
            </div>
        </div>
    );
}

// Tags filter component for mobile
function MobileTagsFilter({
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
        <div className="mobile-tags-filter">
            <label className="mobile-filter-label">Тагове</label>
            <div className="mobile-tags-container">
                {tags.map((tag) => (
                    <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`mobile-tag-button ${selectedTags.includes(tag) ? 'mobile-tag-selected' : ''}`}
                        type="button"
                    >
                        {tag}
                    </button>
                ))}
            </div>
        </div>
    );
}

// Main Filters Mobile Sheet Component
export default function FiltersMobileSheet({
    filterOptions,
    searchParams
}: FiltersMobileSheetProps): React.JSX.Element {
    const router = useRouter();
    // const currentSearchParams = useSearchParams(); // Not used yet
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // State for expanded sections
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        search: true,
        author: false,
        technique: false,
        subject: false,
        style: false,
        price: false,
        size: false,
        tags: false,
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

    const clearAllFilters = (): void => {
        router.push('/gallery');
        setIsOpen(false);
    };

    const closeSheet = (): void => {
        setIsOpen(false);
    };

    const sheetContent = (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="mobile-filters-overlay"
                        onClick={closeSheet}

                    />

                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        className="mobile-filters-sheet"

                    >
                        {/* Sheet Header */}
                        <div className="mobile-filters-sheet-header">
                            <h2 className="mobile-filters-sheet-title">Филтри</h2>
                            <button
                                onClick={closeSheet}
                                className="mobile-filters-close-button"
                                type="button"
                                aria-label="Затвори филтри"
                            >
                                <XIcon size={20} />
                            </button>
                        </div>

                        {/* Sheet Content */}
                        <div className="mobile-filters-sheet-content">
                            {/* Search */}
                            <MobileFilterSection
                                title="Търсене"
                                isExpanded={expandedSections.search}
                                onToggle={() => toggleSection('search')}
                            >
                                <MobileSearchFilter
                                    value={filters.q}
                                    onChange={(value) => updateFilters({ q: value })}
                                />
                            </MobileFilterSection>

                            {/* Author */}
                            <MobileFilterSection
                                title="Художник"
                                isExpanded={expandedSections.author}
                                onToggle={() => toggleSection('author')}
                            >
                                <MobileAuthorFilter
                                    authors={filterOptions.authors}
                                    value={filters.author}
                                    onChange={(value) => updateFilters({ author: value })}
                                />
                            </MobileFilterSection>

                            {/* Technique */}
                            <MobileFilterSection
                                title="Техника"
                                isExpanded={expandedSections.technique}
                                onToggle={() => toggleSection('technique')}
                            >
                                <MobileSelectFilter
                                    title=""
                                    options={filterOptions.techniques}
                                    value={filters.technique}
                                    onChange={(value) => updateFilters({ technique: value })}
                                    placeholder="Всички техники"
                                />
                            </MobileFilterSection>

                            {/* Subject */}
                            <MobileFilterSection
                                title="Тема"
                                isExpanded={expandedSections.subject}
                                onToggle={() => toggleSection('subject')}
                            >
                                <MobileSelectFilter
                                    title=""
                                    options={filterOptions.subjects}
                                    value={filters.subject}
                                    onChange={(value) => updateFilters({ subject: value })}
                                    placeholder="Всички теми"
                                />
                            </MobileFilterSection>

                            {/* Style */}
                            <MobileFilterSection
                                title="Стил"
                                isExpanded={expandedSections.style}
                                onToggle={() => toggleSection('style')}
                            >
                                <MobileSelectFilter
                                    title=""
                                    options={filterOptions.styles}
                                    value={filters.style}
                                    onChange={(value) => updateFilters({ style: value })}
                                    placeholder="Всички стилове"
                                />
                            </MobileFilterSection>

                            {/* Price */}
                            <MobileFilterSection
                                title="Цена"
                                isExpanded={expandedSections.price}
                                onToggle={() => toggleSection('price')}
                            >
                                <MobilePriceFilter
                                    priceRange={filterOptions.priceRange}
                                    minValue={filters.priceMin}
                                    maxValue={filters.priceMax}
                                    onMinChange={(value) => updateFilters({ priceMin: value })}
                                    onMaxChange={(value) => updateFilters({ priceMax: value })}
                                />
                            </MobileFilterSection>

                            {/* Size */}
                            <MobileFilterSection
                                title="Размер"
                                isExpanded={expandedSections.size}
                                onToggle={() => toggleSection('size')}
                            >
                                <MobileSizeFilter
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
                            </MobileFilterSection>

                            {/* Tags */}
                            <MobileFilterSection
                                title="Тагове"
                                isExpanded={expandedSections.tags}
                                onToggle={() => toggleSection('tags')}
                            >
                                <MobileTagsFilter
                                    tags={filterOptions.tags}
                                    selectedTags={filters.tags}
                                    onTagsChange={(tags) => updateFilters({ tags })}
                                />
                            </MobileFilterSection>
                        </div>

                        {/* Sheet Footer */}
                        <div className="mobile-filters-sheet-footer">
                            <button
                                onClick={clearAllFilters}
                                className="mobile-filters-clear-button"
                                type="button"
                            >
                                Изчисти всички
                            </button>
                            <button
                                onClick={closeSheet}
                                className="mobile-filters-apply-button"
                                type="button"
                            >
                                Приложи филтри
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );

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

            {/* Portal for Sheet - renders outside the button container */}
            {mounted && createPortal(sheetContent, document.body)}
        </>
    );
}

// app/gallery/_components/FiltersSidebar.tsx
'use client';

import { useState } from 'react';
import CustomDropdown from '@/components/ui/CustomDropdown';
import AppliedFiltersSection from '@/components/ui/AppliedFiltersSection';
import "@/components/ui/styles/global-checkbox.css";
import "@/components/ui/styles/applied-filters-section.css";
import "./styles/filters-sidebar.css";

// CheckboxList component with infinite pagination
function CheckboxList({
    items,
    selectedItems,
    onItemToggle,
    showMoreThreshold = 5,
    showMoreIncrement = 10
}: {
    items: Array<{ name: string; count: number }>;
    selectedItems: string[];
    onItemToggle: (item: string) => void;
    showMoreThreshold?: number;
    showMoreIncrement?: number;
}) {
    const [visibleCount, setVisibleCount] = useState(showMoreThreshold);

    const visibleItems = items.slice(0, visibleCount);
    const hasMore = visibleCount < items.length;
    const isExpanded = visibleCount > showMoreThreshold;

    const showMore = () => {
        const nextCount = Math.min(visibleCount + showMoreIncrement, items.length);
        setVisibleCount(nextCount);
    };

    const showLess = () => {
        setVisibleCount(showMoreThreshold);
    };

    return (
        <div className="checkbox-list">
            {visibleItems.map((item) => (
                <label key={item.name} className="custom-checkbox-container">
                    <input
                        type="checkbox"
                        className="custom-checkbox-input"
                        checked={selectedItems.includes(item.name)}
                        onChange={() => onItemToggle(item.name)}
                    />
                    <div className="custom-checkbox">
                        <svg className="custom-checkbox-icon" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <span className="form-checkbox-label">{item.name} ({item.count})</span>
                </label>
            ))}

            {hasMore && (
                <button
                    className="show-more-btn"
                    onClick={showMore}
                >
                    Покажи още {Math.min(showMoreIncrement, items.length - visibleCount)}
                </button>
            )}

            {isExpanded && (
                <button
                    className="show-less-btn"
                    onClick={showLess}
                >
                    Покажи по-малко
                </button>
            )}
        </div>
    );
}

// TagsList component with infinite pagination
function TagsList({
    items,
    selectedItems,
    onItemToggle,
    showMoreThreshold = 5,
    showMoreIncrement = 10
}: {
    items: Array<{ name: string; count: number }>;
    selectedItems: string[];
    onItemToggle: (item: string) => void;
    showMoreThreshold?: number;
    showMoreIncrement?: number;
}) {
    const [visibleCount, setVisibleCount] = useState(showMoreThreshold);

    const visibleItems = items.slice(0, visibleCount);
    const hasMore = visibleCount < items.length;
    const isExpanded = visibleCount > showMoreThreshold;

    const showMore = () => {
        const nextCount = Math.min(visibleCount + showMoreIncrement, items.length);
        setVisibleCount(nextCount);
    };

    const showLess = () => {
        setVisibleCount(showMoreThreshold);
    };

    return (
        <div className="tags-list">
            {visibleItems.map((item) => (
                <button
                    key={item.name}
                    className={`tag-chip ${selectedItems.includes(item.name) ? 'active' : ''}`}
                    onClick={() => onItemToggle(item.name)}
                >
                    {item.name} ({item.count})
                </button>
            ))}

            {hasMore && (
                <button
                    className="show-more-btn"
                    onClick={showMore}
                >
                    Покажи още {Math.min(showMoreIncrement, items.length - visibleCount)}
                </button>
            )}

            {isExpanded && (
                <button
                    className="show-less-btn"
                    onClick={showLess}
                >
                    Покажи по-малко
                </button>
            )}
        </div>
    );
}


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

interface FiltersSidebarProps {
    filterOptions: FilterOptions;
    filters: Filters;
    onFilterChange: (key: keyof Filters, value: string | string[] | [number, number]) => void;
    clearFilters: () => void;
}

export default function FiltersSidebar({
    filterOptions,
    filters,
    onFilterChange,
    clearFilters
}: FiltersSidebarProps) {
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        search: true,
        author: true,
        technique: true,
        subject: true,
        style: true,
        price: true,
        size: true,
        tags: true,
        sort: true,
        availability: true
    });

    const toggleSection = (section: string) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const handleMultiSelect = (key: keyof Filters, value: string) => {
        const currentValues = filters[key] as string[];
        const newValues = currentValues.includes(value)
            ? currentValues.filter(v => v !== value)
            : [...currentValues, value];
        onFilterChange(key, newValues);
    };

    const handleRangeChange = (key: keyof Filters, index: number, value: string) => {
        const newRange: [number, number] = [...filters[key] as [number, number]];
        newRange[index] = parseFloat(value) || 0;
        onFilterChange(key, newRange);
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

    return (
        <aside className="filters-sidebar">
            <div className="sidebar-header">
                <h3>Филтри</h3>
            </div>

            {/* Applied Filters Section */}
            <AppliedFiltersSection
                appliedFilters={getAppliedFilters()}
                onClearAll={clearFilters}
            />

            {/* Search */}
            <div className="filter-section">
                <button
                    className="filter-section-header"
                    onClick={() => toggleSection('search')}
                >
                    <span>Търси картини</span>
                    <svg className={`section-icon ${expandedSections.search ? 'expanded' : ''}`} viewBox="0 0 24 24">
                        <path d="M7 10l5 5 5-5z" />
                    </svg>
                </button>
                {expandedSections.search && (
                    <div className="filter-section-content">
                        <input
                            type="text"
                            placeholder="Търси картини..."
                            value={filters.search}
                            onChange={(e) => onFilterChange('search', e.target.value)}
                            className="search-input"
                        />
                    </div>
                )}
            </div>

            {/* Author Filter */}
            <div className="filter-section">
                <button
                    className="filter-section-header"
                    onClick={() => toggleSection('author')}
                >
                    <span>Художник</span>
                    <svg className={`section-icon ${expandedSections.author ? 'expanded' : ''}`} viewBox="0 0 24 24">
                        <path d="M7 10l5 5 5-5z" />
                    </svg>
                </button>
                {expandedSections.author && (
                    <div className="filter-section-content">
                        <CustomDropdown
                            options={[
                                { value: "", label: "Всички художници" },
                                ...filterOptions.authors.map(author => ({
                                    value: author.name,
                                    label: `${author.name} (${author.count})`
                                }))
                            ]}
                            value={filters.author}
                            onChange={(value) => onFilterChange('author', value)}
                            placeholder="Избери художник"
                            aria-label="Избери художник"
                        />
                    </div>
                )}
            </div>

            {/* Sort By */}
            <div className="filter-section">
                <button
                    className="filter-section-header"
                    onClick={() => toggleSection('sort')}
                >
                    <span>Сортиране</span>
                    <svg className={`section-icon ${expandedSections.sort ? 'expanded' : ''}`} viewBox="0 0 24 24">
                        <path d="M7 10l5 5 5-5z" />
                    </svg>
                </button>
                {expandedSections.sort && (
                    <div className="filter-section-content">
                        <CustomDropdown
                            options={[
                                { value: 'newest', label: 'Най-нови' },
                                { value: 'oldest', label: 'Най-стари' },
                                { value: 'price-low', label: 'Цена: ниска → висока' },
                                { value: 'price-high', label: 'Цена: висока → ниска' },
                                { value: 'title', label: 'Заглавие A-Z' }
                            ]}
                            value={filters.sortBy}
                            onChange={(value) => onFilterChange('sortBy', value)}
                            placeholder="Избери сортиране"
                            aria-label="Сортиране на картини"
                        />
                    </div>
                )}
            </div>

            {/* Availability Filter */}
            <div className="filter-section">
                <button
                    className="filter-section-header"
                    onClick={() => toggleSection('availability')}
                >
                    <span>Наличност</span>
                    <svg className={`section-icon ${expandedSections.availability ? 'expanded' : ''}`} viewBox="0 0 24 24">
                        <path d="M7 10l5 5 5-5z" />
                    </svg>
                </button>
                {expandedSections.availability && (
                    <div className="filter-section-content">
                        <CustomDropdown
                            options={[
                                { value: '', label: 'Всички картини' },
                                { value: 'new', label: 'Нови (последните 14 дни)' },
                                { value: 'promotion', label: 'На промоция' },
                                { value: 'sold', label: 'Продадени' },
                            ]}
                            value={filters.availability}
                            onChange={(value) => onFilterChange('availability', value)}
                            placeholder="Избери наличност"
                            aria-label="Наличност на картини"
                        />
                    </div>
                )}
            </div>

            {/* Price Range Filter */}
            <div className="filter-section">
                <button
                    className="filter-section-header"
                    onClick={() => toggleSection('price')}
                >
                    <span>Ценови диапазон</span>
                    <svg className={`section-icon ${expandedSections.price ? 'expanded' : ''}`} viewBox="0 0 24 24">
                        <path d="M7 10l5 5 5-5z" />
                    </svg>
                </button>
                {expandedSections.price && (
                    <div className="filter-section-content">
                        <div className="price-range">
                            <div className="price-inputs">
                                <input
                                    type="number"
                                    placeholder="От"
                                    value={filters.priceRange[0] || ''}
                                    onChange={(e) => handleRangeChange('priceRange', 0, e.target.value)}
                                    className="price-input"
                                />
                                <span className="price-separator">-</span>
                                <input
                                    type="number"
                                    placeholder="До"
                                    value={filters.priceRange[1] || ''}
                                    onChange={(e) => handleRangeChange('priceRange', 1, e.target.value)}
                                    className="price-input"
                                />
                            </div>
                            <div className="price-range-display">
                                {filters.priceRange[0]} - {filters.priceRange[1]} лв.
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Size Filter */}
            <div className="filter-section">
                <button
                    className="filter-section-header"
                    onClick={() => toggleSection('size')}
                >
                    <span>Размер (в см)</span>
                    <svg className={`section-icon ${expandedSections.size ? 'expanded' : ''}`} viewBox="0 0 24 24">
                        <path d="M7 10l5 5 5-5z" />
                    </svg>
                </button>
                {expandedSections.size && (
                    <div className="filter-section-content">
                        <div className="size-range">
                            <div className="size-inputs">
                                <div className="size-input-group">
                                    <label className="size-input-label">Ширина</label>
                                    <div className="size-inputs-row">
                                        <input
                                            type="number"
                                            placeholder="От"
                                            value={filters.widthRange[0] || ''}
                                            onChange={(e) => handleRangeChange('widthRange', 0, e.target.value)}
                                            className="size-input"
                                        />
                                        <span className="size-separator">-</span>
                                        <input
                                            type="number"
                                            placeholder="До"
                                            value={filters.widthRange[1] || ''}
                                            onChange={(e) => handleRangeChange('widthRange', 1, e.target.value)}
                                            className="size-input"
                                        />
                                    </div>
                                </div>
                                <div className="size-input-group">
                                    <label className="size-input-label">Височина</label>
                                    <div className="size-inputs-row">
                                        <input
                                            type="number"
                                            placeholder="От"
                                            value={filters.heightRange[0] || ''}
                                            onChange={(e) => handleRangeChange('heightRange', 0, e.target.value)}
                                            className="size-input"
                                        />
                                        <span className="size-separator">-</span>
                                        <input
                                            type="number"
                                            placeholder="До"
                                            value={filters.heightRange[1] || ''}
                                            onChange={(e) => handleRangeChange('heightRange', 1, e.target.value)}
                                            className="size-input"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Technique Filter */}
            {filterOptions.techniques.filter(t => t.count > 0).length > 0 && (
                <div className="filter-section">
                    <button
                        className="filter-section-header"
                        onClick={() => toggleSection('technique')}
                    >
                        <span>Техника</span>
                        <svg className={`section-icon ${expandedSections.technique ? 'expanded' : ''}`} viewBox="0 0 24 24">
                            <path d="M7 10l5 5 5-5z" />
                        </svg>
                    </button>
                    {expandedSections.technique && (
                        <div className="filter-section-content">
                            <CheckboxList
                                items={filterOptions.techniques.filter(t => t.count > 0)}
                                selectedItems={filters.technique}
                                onItemToggle={(item) => handleMultiSelect('technique', item)}
                                showMoreThreshold={5}
                                showMoreIncrement={10}
                            />
                        </div>
                    )}
                </div>
            )}

            {/* Subject Filter */}
            {filterOptions.subjects.filter(s => s.count > 0).length > 0 && (
                <div className="filter-section">
                    <button
                        className="filter-section-header"
                        onClick={() => toggleSection('subject')}
                    >
                        <span>Тема</span>
                        <svg className={`section-icon ${expandedSections.subject ? 'expanded' : ''}`} viewBox="0 0 24 24">
                            <path d="M7 10l5 5 5-5z" />
                        </svg>
                    </button>
                    {expandedSections.subject && (
                        <div className="filter-section-content">
                            <CheckboxList
                                items={filterOptions.subjects.filter(s => s.count > 0)}
                                selectedItems={filters.subject}
                                onItemToggle={(item) => handleMultiSelect('subject', item)}
                                showMoreThreshold={5}
                                showMoreIncrement={10}
                            />
                        </div>
                    )}
                </div>
            )}

            {/* Style Filter */}
            {filterOptions.styles.filter(s => s.count > 0).length > 0 && (
                <div className="filter-section">
                    <button
                        className="filter-section-header"
                        onClick={() => toggleSection('style')}
                    >
                        <span>Стил</span>
                        <svg className={`section-icon ${expandedSections.style ? 'expanded' : ''}`} viewBox="0 0 24 24">
                            <path d="M7 10l5 5 5-5z" />
                        </svg>
                    </button>
                    {expandedSections.style && (
                        <div className="filter-section-content">
                            <CheckboxList
                                items={filterOptions.styles.filter(s => s.count > 0)}
                                selectedItems={filters.style}
                                onItemToggle={(item) => handleMultiSelect('style', item)}
                                showMoreThreshold={5}
                                showMoreIncrement={10}
                            />
                        </div>
                    )}
                </div>
            )}

            {/* Tags Filter */}
            {filterOptions.tags.filter(t => t.count > 0).length > 0 && (
                <div className="filter-section">
                    <button
                        className="filter-section-header"
                        onClick={() => toggleSection('tags')}
                    >
                        <span>Тагове</span>
                        <svg className={`section-icon ${expandedSections.tags ? 'expanded' : ''}`} viewBox="0 0 24 24">
                            <path d="M7 10l5 5 5-5z" />
                        </svg>
                    </button>
                    {expandedSections.tags && (
                        <div className="filter-section-content">
                            <TagsList
                                items={filterOptions.tags.filter(t => t.count > 0)}
                                selectedItems={filters.tags}
                                onItemToggle={(item) => handleMultiSelect('tags', item)}
                                showMoreThreshold={5}
                                showMoreIncrement={10}
                            />
                        </div>
                    )}
                </div>
            )}
        </aside>
    );
}



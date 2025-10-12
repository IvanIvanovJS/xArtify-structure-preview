'use client';

import { useState } from 'react';
import CustomDropdown from '@/components/ui/CustomDropdown';
import AppliedFiltersSection from '@/components/ui/AppliedFiltersSection';
import "@/components/ui/styles/global-checkbox.css";
import "@/components/ui/styles/applied-filters-section.css";
import "./styles/artist-profile.css";

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

interface FilterOptions {
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

interface ArtistProfileSidebarProps {
  filters: FilterOptions;
  onFilterChange: (key: keyof FilterOptions, value: string | string[] | [number, number]) => void;
  clearFilters: () => void;
  techniqueOptions: Array<{ name: string; count: number }>;
  subjectOptions: Array<{ name: string; count: number }>;
  styleOptions: Array<{ name: string; count: number }>;
  allTags: Array<{ name: string; count: number }>;
  sortOptions: Array<{ value: string; label: string }>;
  maxPrice: number;
  maxWidth: number;
  maxHeight: number;
}

export default function ArtistProfileSidebar({
  filters,
  onFilterChange,
  clearFilters,
  techniqueOptions,
  subjectOptions,
  styleOptions,
  allTags,
  sortOptions,
  maxPrice,
  maxWidth,
  maxHeight
}: ArtistProfileSidebarProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
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

  const handleMultiSelect = (key: keyof FilterOptions, value: string) => {
    const currentValues = filters[key] as string[];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    onFilterChange(key, newValues);
  };

  const handlePriceRangeChange = (index: number, value: string) => {
    const newRange: [number, number] = [...filters.priceRange];
    const numValue = parseFloat(value) || 0;
    // Ensure the value doesn't exceed maxPrice
    newRange[index] = Math.min(numValue, maxPrice);
    onFilterChange('priceRange', newRange);
  };

  const handleWidthRangeChange = (index: number, value: string) => {
    const newRange: [number, number] = [...filters.widthRange];
    const numValue = parseFloat(value) || 0;
    // Ensure the value doesn't exceed maxWidth
    newRange[index] = Math.min(numValue, maxWidth);
    onFilterChange('widthRange', newRange);
  };

  const handleHeightRangeChange = (index: number, value: string) => {
    const newRange: [number, number] = [...filters.heightRange];
    const numValue = parseFloat(value) || 0;
    // Ensure the value doesn't exceed maxHeight
    newRange[index] = Math.min(numValue, maxHeight);
    onFilterChange('heightRange', newRange);
  };

  // Generate applied filters for display
  const getAppliedFilters = () => {
    const applied: Array<{ key: string; label: string; value: string; onRemove: () => void }> = [];

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
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < maxPrice) {
      applied.push({
        key: 'priceRange',
        label: `Цена: ${filters.priceRange[0]} - ${filters.priceRange[1]} лв.`,
        value: `${filters.priceRange[0]}-${filters.priceRange[1]}`,
        onRemove: () => onFilterChange('priceRange', [0, maxPrice])
      });
    }

    // Width range filter - only show if different from default [0, maxWidth]
    if (filters.widthRange[0] > 0 || filters.widthRange[1] < maxWidth) {
      applied.push({
        key: 'widthRange',
        label: `Ширина: ${filters.widthRange[0]} - ${filters.widthRange[1]} см`,
        value: `${filters.widthRange[0]}-${filters.widthRange[1]}`,
        onRemove: () => onFilterChange('widthRange', [0, maxWidth])
      });
    }

    // Height range filter - only show if different from default [0, maxHeight]
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
      let availabilityLabel = '';
      switch (filters.availability) {
        case 'new':
          availabilityLabel = 'Наличност: Нови (последните 14 дни)';
          break;
        case 'promotion':
          availabilityLabel = 'Наличност: На промоция';
          break;
        case 'sold':
          availabilityLabel = 'Наличност: Продадени';
          break;
        default:
          availabilityLabel = `Наличност: ${filters.availability}`;
      }

      applied.push({
        key: 'availability',
        label: availabilityLabel,
        value: filters.availability,
        onRemove: () => onFilterChange('availability', '')
      });
    }

    return applied;
  };

  return (
    <aside className="artist-sidebar">
      <div className="sidebar-header">
        <h3>Филтри</h3>
      </div>

      {/* Applied Filters Section */}
      <AppliedFiltersSection
        appliedFilters={getAppliedFilters()}
        onClearAll={clearFilters}
      />

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
              options={sortOptions}
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
                  onChange={(e) => handlePriceRangeChange(0, e.target.value)}
                  className="price-input"
                  min="0"
                  max={maxPrice}
                />
                <span className="price-separator">-</span>
                <input
                  type="number"
                  placeholder={`До ${maxPrice}`}
                  value={filters.priceRange[1] || ''}
                  onChange={(e) => handlePriceRangeChange(1, e.target.value)}
                  className="price-input"
                  min="0"
                  max={maxPrice}
                />
              </div>
              <div className="price-range-display">
                {filters.priceRange[0]} - {filters.priceRange[1]} лв.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Size Range Filter */}
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
                      onChange={(e) => handleWidthRangeChange(0, e.target.value)}
                      className="size-input"
                      min="0"
                      max={maxWidth}
                    />
                    <span className="size-separator">-</span>
                    <input
                      type="number"
                      placeholder={`До ${maxWidth}`}
                      value={filters.widthRange[1] || ''}
                      onChange={(e) => handleWidthRangeChange(1, e.target.value)}
                      className="size-input"
                      min="0"
                      max={maxWidth}
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
                      onChange={(e) => handleHeightRangeChange(0, e.target.value)}
                      className="size-input"
                      min="0"
                      max={maxHeight}
                    />
                    <span className="size-separator">-</span>
                    <input
                      type="number"
                      placeholder={`До ${maxHeight}`}
                      value={filters.heightRange[1] || ''}
                      onChange={(e) => handleHeightRangeChange(1, e.target.value)}
                      className="size-input"
                      min="0"
                      max={maxHeight}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Technique Filter */}
      {techniqueOptions.filter(t => t.count > 0).length > 0 && (
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
                items={techniqueOptions.filter(t => t.count > 0)}
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
      {subjectOptions.filter(s => s.count > 0).length > 0 && (
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
                items={subjectOptions.filter(s => s.count > 0)}
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
      {styleOptions.filter(s => s.count > 0).length > 0 && (
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
                items={styleOptions.filter(s => s.count > 0)}
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
      {allTags.filter(t => t.count > 0).length > 0 && (
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
                items={allTags.filter(t => t.count > 0)}
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

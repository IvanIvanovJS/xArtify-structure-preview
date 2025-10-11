'use client';

import { useState } from 'react';
import CustomDropdown from '@/components/ui/CustomDropdown';
import "@/components/ui/styles/global-checkbox.css";
import "./styles/artist-profile.css";

// CheckboxList component with show more functionality
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
  const [showAll, setShowAll] = useState(false);

  const visibleItems = showAll ? items : items.slice(0, showMoreThreshold);
  const hasMore = items.length > showMoreThreshold;

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
          onClick={() => setShowAll(!showAll)}
        >
          {showAll ? 'Покажи по-малко' : `Покажи още ${Math.min(showMoreIncrement, items.length - showMoreThreshold)}`}
        </button>
      )}
    </div>
  );
}

// TagsList component with show more functionality
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
  const [showAll, setShowAll] = useState(false);

  const visibleItems = showAll ? items : items.slice(0, showMoreThreshold);
  const hasMore = items.length > showMoreThreshold;

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
          onClick={() => setShowAll(!showAll)}
        >
          {showAll ? 'Покажи по-малко' : `Покажи още ${Math.min(showMoreIncrement, items.length - showMoreThreshold)}`}
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
  tags: string[];
  sortBy: string;
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
}

export default function ArtistProfileSidebar({
  filters,
  onFilterChange,
  clearFilters,
  techniqueOptions,
  subjectOptions,
  styleOptions,
  allTags,
  sortOptions
}: ArtistProfileSidebarProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    technique: true,
    subject: true,
    style: true,
    price: true,
    tags: true,
    sort: true
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
    newRange[index] = parseFloat(value) || 0;
    onFilterChange('priceRange', newRange);
  };

  return (
    <aside className="artist-sidebar">
      <div className="sidebar-header">
        <h3>Филтри</h3>
        <button onClick={clearFilters} className="clear-filters-btn">
          Изчисти всички
        </button>
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
              options={sortOptions}
              value={filters.sortBy}
              onChange={(value) => onFilterChange('sortBy', value)}
              placeholder="Избери сортиране"
              aria-label="Сортиране на картини"
            />
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
                />
                <span className="price-separator">-</span>
                <input
                  type="number"
                  placeholder="До"
                  value={filters.priceRange[1] || ''}
                  onChange={(e) => handlePriceRangeChange(1, e.target.value)}
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

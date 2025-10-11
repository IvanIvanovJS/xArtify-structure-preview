'use client';

import { useState } from 'react';
import CustomDropdown from '@/components/ui/CustomDropdown';
import "@/components/ui/styles/global-checkbox.css";
import "./styles/artist-profile.css";

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
  techniqueOptions: string[];
  subjectOptions: string[];
  styleOptions: string[];
  allTags: string[];
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
      {techniqueOptions.length > 0 && (
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
              <div className="checkbox-list">
                {techniqueOptions.map((technique) => (
                  <label key={technique} className="custom-checkbox-container">
                    <input
                      type="checkbox"
                      className="custom-checkbox-input"
                      checked={filters.technique.includes(technique)}
                      onChange={() => handleMultiSelect('technique', technique)}
                    />
                    <div className="custom-checkbox">
                      <svg className="custom-checkbox-icon" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="form-checkbox-label">{technique}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Subject Filter */}
      {subjectOptions.length > 0 && (
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
              <div className="checkbox-list">
                {subjectOptions.map((subject) => (
                  <label key={subject} className="custom-checkbox-container">
                    <input
                      type="checkbox"
                      className="custom-checkbox-input"
                      checked={filters.subject.includes(subject)}
                      onChange={() => handleMultiSelect('subject', subject)}
                    />
                    <div className="custom-checkbox">
                      <svg className="custom-checkbox-icon" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="form-checkbox-label">{subject}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Style Filter */}
      {styleOptions.length > 0 && (
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
              <div className="checkbox-list">
                {styleOptions.map((style) => (
                  <label key={style} className="custom-checkbox-container">
                    <input
                      type="checkbox"
                      className="custom-checkbox-input"
                      checked={filters.style.includes(style)}
                      onChange={() => handleMultiSelect('style', style)}
                    />
                    <div className="custom-checkbox">
                      <svg className="custom-checkbox-icon" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="form-checkbox-label">{style}</span>
                  </label>
                ))}
              </div>
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
      {allTags.length > 0 && (
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
              <div className="tags-list">
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    className={`tag-chip ${filters.tags.includes(tag) ? 'active' : ''}`}
                    onClick={() => handleMultiSelect('tags', tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </aside>
  );
}

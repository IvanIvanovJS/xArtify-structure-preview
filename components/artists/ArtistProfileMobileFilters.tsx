'use client';

import { useState } from 'react';
import CustomDropdown from '@/components/ui/CustomDropdown';
import "./styles/artist-profile.css";

interface FilterOptions {
  technique: string[];
  subject: string[];
  style: string[];
  priceRange: [number, number];
  tags: string[];
  sortBy: string;
}

interface ArtistProfileMobileFiltersProps {
  filters: FilterOptions;
  onFilterChange: (key: keyof FilterOptions, value: string | string[] | [number, number]) => void;
  clearFilters: () => void;
  techniqueOptions: string[];
  subjectOptions: string[];
  styleOptions: string[];
  allTags: string[];
  sortOptions: Array<{ value: string; label: string }>;
  onClose: () => void;
}

export default function ArtistProfileMobileFilters({
  filters,
  onFilterChange,
  clearFilters,
  techniqueOptions,
  subjectOptions,
  styleOptions,
  allTags,
  sortOptions,
  onClose
}: ArtistProfileMobileFiltersProps) {
  const [activeTab, setActiveTab] = useState('sort');

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

  const tabs = [
    { id: 'sort', label: 'Сортиране' },
    { id: 'technique', label: 'Техника' },
    { id: 'subject', label: 'Тема' },
    { id: 'style', label: 'Стил' },
    { id: 'price', label: 'Цена' },
    { id: 'tags', label: 'Тагове' }
  ].filter(tab => {
    if (tab.id === 'technique') return techniqueOptions.length > 0;
    if (tab.id === 'subject') return subjectOptions.length > 0;
    if (tab.id === 'style') return styleOptions.length > 0;
    if (tab.id === 'tags') return allTags.length > 0;
    return true;
  });

  return (
    <div className="mobile-filters-overlay">
      <div className="mobile-filters">
        <div className="mobile-filters-header">
          <h3>Филтри</h3>
          <div className="mobile-filters-actions">
            <button onClick={clearFilters} className="clear-filters-btn">
              Изчисти
            </button>
            <button onClick={onClose} className="close-filters-btn" aria-label="Затвори филтри">
              <svg viewBox="0 0 24 24">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              </svg>
            </button>
          </div>
        </div>

        <div className="mobile-filters-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`mobile-filter-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mobile-filters-content">
          {/* Sort Tab */}
          {activeTab === 'sort' && (
            <div className="mobile-filter-panel">
              <CustomDropdown
                options={sortOptions}
                value={filters.sortBy}
                onChange={(value) => onFilterChange('sortBy', value)}
                placeholder="Избери сортиране"
                aria-label="Сортиране на картини"
              />
            </div>
          )}

          {/* Technique Tab */}
          {activeTab === 'technique' && (
            <div className="mobile-filter-panel">
              <div className="checkbox-list">
                {techniqueOptions.map((technique) => (
                  <label key={technique} className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={filters.technique.includes(technique)}
                      onChange={() => handleMultiSelect('technique', technique)}
                    />
                    <span className="checkbox-label">{technique}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Subject Tab */}
          {activeTab === 'subject' && (
            <div className="mobile-filter-panel">
              <div className="checkbox-list">
                {subjectOptions.map((subject) => (
                  <label key={subject} className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={filters.subject.includes(subject)}
                      onChange={() => handleMultiSelect('subject', subject)}
                    />
                    <span className="checkbox-label">{subject}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Style Tab */}
          {activeTab === 'style' && (
            <div className="mobile-filter-panel">
              <div className="checkbox-list">
                {styleOptions.map((style) => (
                  <label key={style} className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={filters.style.includes(style)}
                      onChange={() => handleMultiSelect('style', style)}
                    />
                    <span className="checkbox-label">{style}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Price Tab */}
          {activeTab === 'price' && (
            <div className="mobile-filter-panel">
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

          {/* Tags Tab */}
          {activeTab === 'tags' && (
            <div className="mobile-filter-panel">
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

        <div className="mobile-filters-footer">
          <button onClick={onClose} className="apply-filters-btn">
            Приложи филтри
          </button>
        </div>
      </div>
    </div>
  );
}

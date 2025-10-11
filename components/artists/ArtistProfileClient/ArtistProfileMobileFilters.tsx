'use client';


import UnifiedFilterDrawer from '@/components/ui/UnifiedFilterDrawer';
import '@/components/ui/styles/unified-filter-drawer.css';

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
  techniqueOptions: Array<{ name: string; count: number }>;
  subjectOptions: Array<{ name: string; count: number }>;
  styleOptions: Array<{ name: string; count: number }>;
  allTags: Array<{ name: string; count: number }>;
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
  const handleFilterChange = (sectionId: string, value: string | string[] | [number, number]): void => {
    switch (sectionId) {
      case 'sort':
        onFilterChange('sortBy', value as string);
        break;
      case 'technique':
        onFilterChange('technique', value as string[]);
        break;
      case 'subject':
        onFilterChange('subject', value as string[]);
        break;
      case 'style':
        onFilterChange('style', value as string[]);
        break;
      case 'price':
        onFilterChange('priceRange', value as [number, number]);
        break;
      case 'tags':
        onFilterChange('tags', value as string[]);
        break;
    }
  };

  const handleApply = (): void => {
    onClose();
  };

  // Prepare filter sections for UnifiedFilterDrawer
  const filterSections = [
    {
      id: 'sort',
      title: 'Сортиране',
      type: 'dropdown' as const,
      dropdownOptions: sortOptions,
      value: filters.sortBy,
      placeholder: 'Избери сортиране'
    },
    {
      id: 'technique',
      title: 'Техника',
      type: 'checkbox' as const,
      options: techniqueOptions.map(technique => ({
        id: technique.name,
        name: technique.name,
        count: technique.count
      })),
      value: filters.technique
    },
    {
      id: 'subject',
      title: 'Тема',
      type: 'checkbox' as const,
      options: subjectOptions.map(subject => ({
        id: subject.name,
        name: subject.name,
        count: subject.count
      })),
      value: filters.subject
    },
    {
      id: 'style',
      title: 'Стил',
      type: 'checkbox' as const,
      options: styleOptions.map(style => ({
        id: style.name,
        name: style.name,
        count: style.count
      })),
      value: filters.style
    },
    {
      id: 'price',
      title: 'Цена',
      type: 'range' as const,
      value: filters.priceRange
    },
    {
      id: 'tags',
      title: 'Тагове',
      type: 'checkbox' as const,
      options: allTags.map(tag => ({
        id: tag.name,
        name: tag.name,
        count: tag.count
      })),
      value: filters.tags
    }
  ].filter(section => {
    // Only show sections that have options
    if (section.type === 'checkbox') {
      return section.options && section.options.length > 0;
    }
    return true;
  });

  return (
    <UnifiedFilterDrawer
      isOpen={true}
      onClose={onClose}
      sections={filterSections}
      onFilterChange={handleFilterChange}
      onClearAll={clearFilters}
      onApply={handleApply}
    />
  );
}

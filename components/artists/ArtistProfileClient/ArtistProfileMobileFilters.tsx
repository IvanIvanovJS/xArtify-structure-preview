'use client';


import UnifiedFilterDrawer from '@/components/ui/UnifiedFilterDrawer';
import ViewModeControls, { type ViewMode } from '@/components/ui/ViewModeControls';
import '@/components/ui/styles/unified-filter-drawer.css';

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

interface ArtistProfileMobileFiltersProps {
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
  onClose: () => void;
  viewMode: ViewMode;
  onViewModeChange: (viewMode: ViewMode) => void;
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
  maxPrice,
  maxWidth,
  maxHeight,
  onClose,
  viewMode,
  onViewModeChange
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
      case 'width':
        onFilterChange('widthRange', value as [number, number]);
        break;
      case 'height':
        onFilterChange('heightRange', value as [number, number]);
        break;
      case 'tags':
        onFilterChange('tags', value as string[]);
        break;
      case 'availability':
        onFilterChange('availability', value as string);
        break;
    }
  };

  const handleApply = (): void => {
    onClose();
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
      id: 'availability',
      title: 'Наличност',
      type: 'dropdown' as const,
      dropdownOptions: [
        { value: '', label: 'Всички картини' },
        { value: 'new', label: 'Нови (последните 14 дни)' },
        { value: 'promotion', label: 'На промоция' },
        { value: 'sold', label: 'Продадени' }
      ],
      value: filters.availability,
      placeholder: 'Избери наличност'
    },
    {
      id: 'price',
      title: 'Цена',
      type: 'range' as const,
      value: filters.priceRange,
      min: 0,
      max: maxPrice
    },
    {
      id: 'size',
      title: 'Размер (в см)',
      type: 'size' as const,
      widthValue: filters.widthRange,
      heightValue: filters.heightRange,
      widthMax: maxWidth,
      heightMax: maxHeight
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
    <div className="artist-mobile-filters-wrapper">
      <div className="artist-mobile-filters-header">
        <ViewModeControls
          currentView={viewMode}
          onViewChange={onViewModeChange}
        />
      </div>

      <UnifiedFilterDrawer
        isOpen={true}
        onClose={onClose}
        sections={filterSections}
        onFilterChange={handleFilterChange}
        onClearAll={clearFilters}
        onApply={handleApply}
        appliedFilters={getAppliedFilters()}
      />
    </div>
  );
}

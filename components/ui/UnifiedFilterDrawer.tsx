'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { XIcon, ChevronDownIcon } from 'lucide-react';
import CustomDropdown from '@/components/ui/CustomDropdown';
import AppliedFiltersSection from '@/components/ui/AppliedFiltersSection';
import "@/components/ui/styles/global-checkbox.css";
import "@/components/ui/styles/applied-filters-section.css";

// Types
interface FilterOption {
    id: string;
    name: string;
    count?: number;
}

interface FilterSection {
    id: string;
    title: string;
    type: 'dropdown' | 'checkbox' | 'range' | 'size';
    options?: FilterOption[];
    dropdownOptions?: Array<{ value: string; label: string }>;
    value?: string | string[] | [number, number];
    placeholder?: string;
    showMore?: boolean;
    widthValue?: [number, number];
    heightValue?: [number, number];
    widthMax?: number;
    heightMax?: number;
}

interface AppliedFilter {
    key: string;
    label: string;
    value: string;
    onRemove: () => void;
}

interface UnifiedFilterDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    sections: FilterSection[];
    onFilterChange: (sectionId: string, value: string | string[] | [number, number]) => void;
    onClearAll: () => void;
    onApply: () => void;
    appliedFilters?: AppliedFilter[];
}

// Show More Button Component
function ShowMoreButton({
    isExpanded,
    onToggle,
    hasMore,
    totalCount,
    visibleCount
}: {
    isExpanded: boolean;
    onToggle: () => void;
    hasMore: boolean;
    totalCount: number;
    visibleCount: number;
}): React.JSX.Element {
    if (!hasMore) return <></>;

    const remainingCount = totalCount - visibleCount;

    return (
        <button
            onClick={onToggle}
            className="show-more-button"
            type="button"
        >
            {isExpanded ? 'Покажи по-малко' : `Покажи още ${remainingCount}`}
        </button>
    );
}

// Checkbox List Component with infinite pagination
function CheckboxList({
    options,
    selectedValues,
    onSelectionChange,
    expanded = false
}: {
    options: FilterOption[];
    selectedValues: string[];
    onSelectionChange: (values: string[]) => void;
    expanded?: boolean;
}): React.JSX.Element {
    const [visibleCount, setVisibleCount] = useState(5);
    const visibleOptions = options.slice(0, visibleCount);
    const hasMore = visibleCount < options.length;
    const isExpanded = visibleCount > 5;

    const showMore = () => {
        const nextCount = Math.min(visibleCount + 10, options.length);
        setVisibleCount(nextCount);
    };

    const showLess = () => {
        setVisibleCount(5);
    };

    const toggleOption = (optionId: string): void => {
        const newValues = selectedValues.includes(optionId)
            ? selectedValues.filter(id => id !== optionId)
            : [...selectedValues, optionId];
        onSelectionChange(newValues);
    };

    return (
        <div className="checkbox-list-container">
            <div className="checkbox-list">
                {visibleOptions.map((option, index) => (
                    <div key={option.id} className="checkbox-item">
                        <label className="custom-checkbox-container">
                            <input
                                type="checkbox"
                                className="custom-checkbox-input"
                                checked={selectedValues.includes(option.id)}
                                onChange={() => toggleOption(option.id)}
                            />
                            <div className="custom-checkbox">
                                <svg className="custom-checkbox-icon" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <span className="form-checkbox-label">{option.name}</span>
                            {option.count && (
                                <span className="option-count">({option.count})</span>
                            )}
                        </label>
                        {index < visibleOptions.length - 1 && (
                            <div className="separator-line"></div>
                        )}
                    </div>
                ))}
            </div>

            {hasMore && (
                <button
                    className="show-more-button"
                    onClick={showMore}
                    type="button"
                >
                    Покажи още {Math.min(10, options.length - visibleCount)}
                </button>
            )}

            {isExpanded && (
                <button
                    className="show-less-button"
                    onClick={showLess}
                    type="button"
                >
                    Покажи по-малко
                </button>
            )}
        </div>
    );
}

// Range Input Component
function RangeInput({
    value,
    onChange,
    min = 0,
    max = 10000,
    step = 1
}: {
    value: [number, number];
    onChange: (value: [number, number]) => void;
    min?: number;
    max?: number;
    step?: number;
}): React.JSX.Element {
    const [localValue, setLocalValue] = useState<[number, number]>(value);

    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    const handleMinChange = (newMin: number): void => {
        const newValue: [number, number] = [Math.min(newMin, localValue[1]), localValue[1]];
        setLocalValue(newValue);
        onChange(newValue);
    };

    const handleMaxChange = (newMax: number): void => {
        const newValue: [number, number] = [localValue[0], Math.max(newMax, localValue[0])];
        setLocalValue(newValue);
        onChange(newValue);
    };

    return (
        <div className="range-input-container">
            <div className="range-inputs">
                <div className="range-input-group">
                    <label className="range-input-label">От</label>
                    <input
                        type="number"
                        min={min}
                        max={max}
                        step={step}
                        value={localValue[0] || ''}
                        onChange={(e) => handleMinChange(parseFloat(e.target.value) || 0)}
                        className="range-input"
                    />
                </div>
                <div className="range-input-group">
                    <label className="range-input-label">До</label>
                    <input
                        type="number"
                        min={min}
                        max={max}
                        step={step}
                        value={localValue[1] || ''}
                        onChange={(e) => handleMaxChange(parseFloat(e.target.value) || 0)}
                        className="range-input"
                    />
                </div>
            </div>
            <div className="range-display">
                {localValue[0]} - {localValue[1]} лв.
            </div>
        </div>
    );
}

// Size Range Input Component (for width and height)
function SizeRangeInput({
    widthValue,
    heightValue,
    onWidthChange,
    onHeightChange,
    widthMax = 1000,
    heightMax = 1000
}: {
    widthValue: [number, number];
    heightValue: [number, number];
    onWidthChange: (value: [number, number]) => void;
    onHeightChange: (value: [number, number]) => void;
    widthMax?: number;
    heightMax?: number;
}): React.JSX.Element {
    return (
        <div className="size-range-container">
            <div className="size-range">
                <div className="size-inputs">
                    <div className="size-input-group">
                        <label className="size-input-label">Ширина</label>
                        <div className="size-inputs-row">
                            <input
                                type="number"
                                placeholder="От"
                                value={widthValue[0] || ''}
                                onChange={(e) => {
                                    const newValue: [number, number] = [parseFloat(e.target.value) || 0, widthValue[1]];
                                    onWidthChange(newValue);
                                }}
                                className="size-input"
                                min="0"
                                max={widthMax}
                            />
                            <span className="size-separator">-</span>
                            <input
                                type="number"
                                placeholder={`До ${widthMax}`}
                                value={widthValue[1] || ''}
                                onChange={(e) => {
                                    const newValue: [number, number] = [widthValue[0], parseFloat(e.target.value) || 0];
                                    onWidthChange(newValue);
                                }}
                                className="size-input"
                                min="0"
                                max={widthMax}
                            />
                        </div>
                    </div>
                    <div className="size-input-group">
                        <label className="size-input-label">Височина</label>
                        <div className="size-inputs-row">
                            <input
                                type="number"
                                placeholder="От"
                                value={heightValue[0] || ''}
                                onChange={(e) => {
                                    const newValue: [number, number] = [parseFloat(e.target.value) || 0, heightValue[1]];
                                    onHeightChange(newValue);
                                }}
                                className="size-input"
                                min="0"
                                max={heightMax}
                            />
                            <span className="size-separator">-</span>
                            <input
                                type="number"
                                placeholder={`До ${heightMax}`}
                                value={heightValue[1] || ''}
                                onChange={(e) => {
                                    const newValue: [number, number] = [heightValue[0], parseFloat(e.target.value) || 0];
                                    onHeightChange(newValue);
                                }}
                                className="size-input"
                                min="0"
                                max={heightMax}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Filter Section Component
function FilterSectionComponent({
    section,
    onFilterChange
}: {
    section: FilterSection;
    onFilterChange: (sectionId: string, value: string | string[] | [number, number]) => void;
}): React.JSX.Element {
    const renderContent = (): React.ReactNode => {
        switch (section.type) {
            case 'dropdown':
                return (
                    <CustomDropdown
                        value={section.value as string || ''}
                        onChange={(value) => onFilterChange(section.id, value)}
                        options={section.dropdownOptions || []}
                        placeholder={section.placeholder || 'Избери...'}
                        className="filter-dropdown"
                    />
                );

            case 'checkbox':
                return (
                    <CheckboxList
                        options={section.options || []}
                        selectedValues={section.value as string[] || []}
                        onSelectionChange={(values) => onFilterChange(section.id, values)}
                    />
                );

            case 'range':
                return (
                    <RangeInput
                        value={section.value as [number, number] || [0, 10000]}
                        onChange={(value) => onFilterChange(section.id, value)}
                    />
                );

            case 'size':
                return (
                    <SizeRangeInput
                        widthValue={section.widthValue || [0, 1000]}
                        heightValue={section.heightValue || [0, 1000]}
                        onWidthChange={(value) => onFilterChange('width', value)}
                        onHeightChange={(value) => onFilterChange('height', value)}
                        widthMax={section.widthMax || 1000}
                        heightMax={section.heightMax || 1000}
                    />
                );

            default:
                return null;
        }
    };

    return (
        <div className="filter-section">
            <div className="filter-section-header">
                <h3 className="filter-section-title">{section.title}</h3>
                <ChevronDownIcon size={16} className="filter-section-icon" />
            </div>
            <div className="filter-section-content">
                {renderContent()}
            </div>
        </div>
    );
}

// Main Unified Filter Drawer Component
export default function UnifiedFilterDrawer({
    isOpen,
    onClose,
    sections,
    onFilterChange,
    onClearAll,
    onApply,
    appliedFilters = []
}: UnifiedFilterDrawerProps): React.JSX.Element {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleOverlayClick = (e: React.MouseEvent): void => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const drawerContent = (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="filter-drawer-overlay"
                        onClick={handleOverlayClick}
                    />

                    <motion.div
                        initial={{ y: '-100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '-100%' }}
                        transition={{
                            type: 'spring',
                            damping: 30,
                            stiffness: 300
                        }}
                        className="filter-drawer"
                    >
                        {/* Header */}
                        <div className="filter-drawer-header">
                            <h2 className="filter-drawer-title">Филтри</h2>
                            <button
                                onClick={onClose}
                                className="filter-drawer-close"
                                type="button"
                                aria-label="Затвори филтри"
                            >
                                <XIcon size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="filter-drawer-content">
                            {/* Applied Filters Section */}
                            {appliedFilters.length > 0 && (
                                <>
                                    <AppliedFiltersSection
                                        appliedFilters={appliedFilters}
                                        onClearAll={onClearAll}
                                        className="mobile-applied-filters"
                                    />
                                    <div className="section-separator"></div>
                                </>
                            )}

                            {sections.map((section, index) => (
                                <div key={section.id}>
                                    <FilterSectionComponent
                                        section={section}
                                        onFilterChange={onFilterChange}
                                    />
                                    {index < sections.length - 1 && (
                                        <div className="section-separator"></div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Footer */}
                        <div className="filter-drawer-footer">
                            <button
                                onClick={onApply}
                                className="filter-apply-button"
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
            {mounted && createPortal(drawerContent, document.body)}
        </>
    );
}

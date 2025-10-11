'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { XIcon, ChevronDownIcon } from 'lucide-react';
import CustomDropdown from '@/components/ui/CustomDropdown';
import "@/components/ui/styles/global-checkbox.css";

// Types
interface FilterOption {
    id: string;
    name: string;
    count?: number;
}

interface FilterSection {
    id: string;
    title: string;
    type: 'dropdown' | 'checkbox' | 'range';
    options?: FilterOption[];
    dropdownOptions?: Array<{ value: string; label: string }>;
    value?: string | string[] | [number, number];
    placeholder?: string;
    showMore?: boolean;
}

interface UnifiedFilterDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    sections: FilterSection[];
    onFilterChange: (sectionId: string, value: string | string[] | [number, number]) => void;
    onClearAll: () => void;
    onApply: () => void;
}

// Show More Button Component
function ShowMoreButton({
    isExpanded,
    onToggle,
    hasMore
}: {
    isExpanded: boolean;
    onToggle: () => void;
    hasMore: boolean;
}): React.JSX.Element {
    if (!hasMore) return <></>;

    return (
        <button
            onClick={onToggle}
            className="show-more-button"
            type="button"
        >
            {isExpanded ? 'Покажи по-малко' : 'Покажи повече'}
        </button>
    );
}

// Checkbox List Component
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
    const [isExpanded, setIsExpanded] = useState(expanded);
    const visibleOptions = isExpanded ? options : options.slice(0, 5);
    const hasMore = options.length > 5;

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
            <ShowMoreButton
                isExpanded={isExpanded}
                onToggle={() => setIsExpanded(!isExpanded)}
                hasMore={hasMore}
            />
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
    onApply
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
                                onClick={onClearAll}
                                className="filter-clear-button"
                                type="button"
                            >
                                Изчисти всички
                            </button>
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

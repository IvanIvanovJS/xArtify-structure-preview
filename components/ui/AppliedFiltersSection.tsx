'use client';

import { X } from 'lucide-react';

interface AppliedFilter {
    key: string;
    label: string;
    value: string;
    onRemove: () => void;
}

interface AppliedFiltersSectionProps {
    appliedFilters: AppliedFilter[];
    onClearAll: () => void;
    className?: string;
}

export default function AppliedFiltersSection({
    appliedFilters,
    onClearAll,
    className = ''
}: AppliedFiltersSectionProps): React.JSX.Element {
    if (appliedFilters.length === 0) {
        return <></>;
    }

    return (
        <div className={`applied-filters-section ${className}`}>
            <div className="applied-filters-header">
                <h4 className="applied-filters-title">
                    {appliedFilters.length} {appliedFilters.length === 1 ? 'приложен филтър' : 'приложени филтри'}
                </h4>
            </div>

            <div className="applied-filters-list">
                {appliedFilters.map((filter) => (
                    <div key={filter.key} className="applied-filter-item">
                        <button
                            className="applied-filter-remove"
                            onClick={filter.onRemove}
                            aria-label={`Премахни филтър ${filter.label}`}
                        >
                            <X size={16} />
                        </button>
                        <span className="applied-filter-label">{filter.label}</span>
                    </div>
                ))}
            </div>

            <button
                className="clear-all-filters-btn"
                onClick={onClearAll}
            >
                Изчисти всички
            </button>
        </div>
    );
}

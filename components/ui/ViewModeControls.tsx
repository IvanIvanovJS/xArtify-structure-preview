'use client';

import { JSX } from 'react';
import './styles/view-mode-controls.css';

export type ViewMode = 'grid' | 'large';

interface ViewModeControlsProps {
    currentView: ViewMode;
    onViewChange: (view: ViewMode) => void;
    className?: string;
}

export default function ViewModeControls({
    currentView,
    onViewChange,
    className = ''
}: ViewModeControlsProps): JSX.Element {
    return (
        <div className={`view-mode-controls ${className}`}>
            <button
                className={`view-mode-btn ${currentView === 'grid' ? 'active' : ''}`}
                onClick={() => onViewChange('grid')}
                aria-label="Грид изглед"
                title="Грид изглед"
            >
                <svg viewBox="0 0 24 24" fill="currentColor" className="view-mode-icon">
                    <path d="M3 3h7v7H3V3zm0 11h7v7H3v-7zm11-11h7v7h-7V3zm0 11h7v7h-7v-7z" />
                </svg>
            </button>

            <button
                className={`view-mode-btn ${currentView === 'large' ? 'active' : ''}`}
                onClick={() => onViewChange('large')}
                aria-label="Голям изглед"
                title="Голям изглед"
            >
                <svg viewBox="0 0 24 24" fill="currentColor" className="view-mode-icon">
                    <path d="M3 3h18v18H3V3zm2 2v14h14V5H5z" />
                </svg>
            </button>
        </div>
    );
}

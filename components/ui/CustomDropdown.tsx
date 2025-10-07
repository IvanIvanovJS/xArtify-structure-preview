// components/ui/CustomDropdown.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, ChevronUpIcon, CheckIcon } from 'lucide-react';

interface DropdownOption {
    value: string;
    label: string;
}

interface CustomDropdownProps {
    value: string;
    onChange: (value: string) => void;
    options: DropdownOption[];
    placeholder?: string;
    label?: string;
    className?: string;
    'aria-label'?: string;
}

export default function CustomDropdown({
    value,
    onChange,
    options,
    placeholder = "Избери опция",
    label,
    className = "",
    'aria-label': ariaLabel
}: CustomDropdownProps): React.JSX.Element {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(option => option.value === value);
    const displayValue = selectedOption?.label || placeholder;

    const handleOptionClick = (optionValue: string): void => {
        onChange(optionValue);
        setIsOpen(false);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className={`custom-dropdown ${className}`} ref={dropdownRef}>
            {label && (
                <label className="dropdown-label">
                    {label}
                </label>
            )}
            <div className="dropdown-container">
                <button
                    type="button"
                    className="dropdown-button"
                    onClick={() => setIsOpen(!isOpen)}
                    aria-label={ariaLabel || label}
                    aria-expanded={isOpen}
                >
                    <span className="selected-option">{displayValue}</span>
                    {isOpen ? (
                        <ChevronUpIcon
                            className="dropdown-icon"
                            size={14}
                        />
                    ) : (
                        <ChevronDownIcon
                            className="dropdown-icon"
                            size={14}
                        />
                    )}
                </button>

                {isOpen && (
                    <div className="dropdown-options">
                        {options.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                className={`dropdown-option ${value === option.value ? 'selected' : ''}`}
                                onClick={() => handleOptionClick(option.value)}
                            >
                                <span className="option-label">{option.label}</span>
                                {value === option.value && (
                                    <CheckIcon className="check-icon" size={16} />
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

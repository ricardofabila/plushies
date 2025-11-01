/**
 * Validation error display component with cute styling
 */

import React from 'react';
import { AlertCircle, AlertTriangle, Info } from 'lucide-react';

export interface ValidationErrorProps {
    error?: string;
    type?: 'error' | 'warning' | 'info';
    className?: string;
    showIcon?: boolean;
    id?: string;
}

const ValidationError: React.FC<ValidationErrorProps> = ({
    error,
    type = 'error',
    className = '',
    showIcon = true,
    id
}) => {
    if (!error) return null;

    const getIcon = () => {
        switch (type) {
            case 'warning':
                return <AlertTriangle className="w-4 h-4 mr-1 flex-shrink-0" />;
            case 'info':
                return <Info className="w-4 h-4 mr-1 flex-shrink-0" />;
            default:
                return <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />;
        }
    };

    const getColorClasses = () => {
        switch (type) {
            case 'warning':
                return 'text-warning-orange';
            case 'info':
                return 'text-primary-600';
            default:
                return 'text-error-red';
        }
    };

    return (
        <p
            id={id}
            className={`text-sm flex items-start ${getColorClasses()} ${className}`}
            role="alert"
            aria-live="polite"
        >
            {showIcon && <span aria-hidden="true">{getIcon()}</span>}
            <span>{error}</span>
        </p>
    );
};

export default ValidationError;
import React, { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ToastMessage } from '@/types';

interface ToastProps {
    toast: ToastMessage;
    onRemove: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onRemove }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        // Animate in
        const timer = setTimeout(() => setIsVisible(true), 100);

        // Auto remove after duration
        const duration = toast.duration || 5000;
        const removeTimer = setTimeout(() => {
            handleRemove();
        }, duration);

        return () => {
            clearTimeout(timer);
            clearTimeout(removeTimer);
        };
    }, [toast.duration]);

    const handleRemove = () => {
        setIsExiting(true);
        setTimeout(() => {
            onRemove(toast.id);
        }, 300);
    };

    const getToastStyles = () => {
        switch (toast.type) {
            case 'success':
                return {
                    bgColor: 'bg-success-50 border-success-200',
                    textColor: 'text-success-800',
                    iconColor: 'text-success-500',
                    icon: CheckCircle,
                };
            case 'error':
                return {
                    bgColor: 'bg-error-50 border-error-200',
                    textColor: 'text-error-800',
                    iconColor: 'text-error-500',
                    icon: AlertCircle,
                };
            case 'warning':
                return {
                    bgColor: 'bg-warning-50 border-warning-200',
                    textColor: 'text-warning-800',
                    iconColor: 'text-warning-500',
                    icon: AlertTriangle,
                };
            case 'info':
                return {
                    bgColor: 'bg-primary-50 border-primary-200',
                    textColor: 'text-primary-800',
                    iconColor: 'text-primary-500',
                    icon: Info,
                };
            default:
                return {
                    bgColor: 'bg-neutral-50 border-neutral-200',
                    textColor: 'text-neutral-800',
                    iconColor: 'text-neutral-500',
                    icon: Info,
                };
        }
    };

    const styles = getToastStyles();
    const Icon = styles.icon;

    return (
        <div
            className={`
        transform transition-all duration-300 ease-in-out
        ${isVisible && !isExiting ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        ${styles.bgColor} border rounded-lg shadow-cozy p-4 mb-3 max-w-sm w-full
      `}
        >
            <div className="flex items-start space-x-3">
                <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${styles.iconColor}`} />

                <div className="flex-1 min-w-0">
                    <h4 className={`font-medium ${styles.textColor}`}>
                        {toast.title}
                    </h4>
                    {toast.message && (
                        <p className={`text-sm mt-1 ${styles.textColor} opacity-90`}>
                            {toast.message}
                        </p>
                    )}
                </div>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemove}
                    className="h-6 w-6 p-0 hover:bg-black/10"
                >
                    <X className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
};

interface ToastContainerProps {
    toasts: ToastMessage[];
    onRemove: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
    if (toasts.length === 0) return null;

    return (
        <div className="fixed top-4 right-4 z-50 space-y-2">
            {toasts.map((toast) => (
                <Toast key={toast.id} toast={toast} onRemove={onRemove} />
            ))}
        </div>
    );
};

export { Toast, ToastContainer };
export default ToastContainer;
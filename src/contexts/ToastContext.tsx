import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ToastMessage } from '@/types';

interface ToastContextType {
    toasts: ToastMessage[];
    addToast: (toast: Omit<ToastMessage, 'id'>) => string;
    removeToast: (id: string) => void;
    clearAllToasts: () => void;
    success: (title: string, message?: string, duration?: number) => string;
    error: (title: string, message?: string, duration?: number) => string;
    warning: (title: string, message?: string, duration?: number) => string;
    info: (title: string, message?: string, duration?: number) => string;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

let toastId = 0;

const generateToastId = () => {
    return `toast-${++toastId}`;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const addToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
        const newToast: ToastMessage = {
            ...toast,
            id: generateToastId(),
        };

        setToasts((prev) => [...prev, newToast]);
        return newToast.id;
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const clearAllToasts = useCallback(() => {
        setToasts([]);
    }, []);

    // Convenience methods for different toast types
    const success = useCallback((title: string, message?: string, duration?: number) => {
        return addToast({ type: 'success', title, message, duration });
    }, [addToast]);

    const error = useCallback((title: string, message?: string, duration?: number) => {
        return addToast({ type: 'error', title, message, duration });
    }, [addToast]);

    const warning = useCallback((title: string, message?: string, duration?: number) => {
        return addToast({ type: 'warning', title, message, duration });
    }, [addToast]);

    const info = useCallback((title: string, message?: string, duration?: number) => {
        return addToast({ type: 'info', title, message, duration });
    }, [addToast]);

    const value = {
        toasts,
        addToast,
        removeToast,
        clearAllToasts,
        success,
        error,
        warning,
        info,
    };

    return (
        <ToastContext.Provider value={value}>
            {children}
        </ToastContext.Provider>
    );
};

export const useToast = (): ToastContextType => {
    const context = useContext(ToastContext);
    if (context === undefined) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};
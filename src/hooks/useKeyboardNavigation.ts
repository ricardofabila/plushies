import { useEffect, useCallback } from 'react';

interface KeyboardNavigationOptions {
    onEscape?: () => void;
    onEnter?: () => void;
    onArrowUp?: () => void;
    onArrowDown?: () => void;
    onArrowLeft?: () => void;
    onArrowRight?: () => void;
    onTab?: () => void;
    onShiftTab?: () => void;
    enabled?: boolean;
}

export const useKeyboardNavigation = (options: KeyboardNavigationOptions) => {
    const {
        onEscape,
        onEnter,
        onArrowUp,
        onArrowDown,
        onArrowLeft,
        onArrowRight,
        onTab,
        onShiftTab,
        enabled = true,
    } = options;

    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        if (!enabled) return;

        switch (event.key) {
            case 'Escape':
                if (onEscape) {
                    event.preventDefault();
                    onEscape();
                }
                break;
            case 'Enter':
                if (onEnter) {
                    event.preventDefault();
                    onEnter();
                }
                break;
            case 'ArrowUp':
                if (onArrowUp) {
                    event.preventDefault();
                    onArrowUp();
                }
                break;
            case 'ArrowDown':
                if (onArrowDown) {
                    event.preventDefault();
                    onArrowDown();
                }
                break;
            case 'ArrowLeft':
                if (onArrowLeft) {
                    event.preventDefault();
                    onArrowLeft();
                }
                break;
            case 'ArrowRight':
                if (onArrowRight) {
                    event.preventDefault();
                    onArrowRight();
                }
                break;
            case 'Tab':
                if (event.shiftKey && onShiftTab) {
                    event.preventDefault();
                    onShiftTab();
                } else if (!event.shiftKey && onTab) {
                    event.preventDefault();
                    onTab();
                }
                break;
        }
    }, [enabled, onEscape, onEnter, onArrowUp, onArrowDown, onArrowLeft, onArrowRight, onTab, onShiftTab]);

    useEffect(() => {
        if (enabled) {
            document.addEventListener('keydown', handleKeyDown);
            return () => document.removeEventListener('keydown', handleKeyDown);
        }
    }, [handleKeyDown, enabled]);
};

export const useFocusManagement = () => {
    const focusElement = useCallback((selector: string) => {
        const element = document.querySelector(selector) as HTMLElement;
        if (element) {
            element.focus();
        }
    }, []);

    const focusFirstFocusableElement = useCallback((container?: HTMLElement) => {
        const containerElement = container || document;
        const focusableElements = containerElement.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0] as HTMLElement;
        if (firstElement) {
            firstElement.focus();
        }
    }, []);

    const focusLastFocusableElement = useCallback((container?: HTMLElement) => {
        const containerElement = container || document;
        const focusableElements = containerElement.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
        if (lastElement) {
            lastElement.focus();
        }
    }, []);

    const trapFocus = useCallback((container: HTMLElement) => {
        const focusableElements = container.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        const handleTabKey = (e: KeyboardEvent) => {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
            }
        };

        container.addEventListener('keydown', handleTabKey);
        return () => container.removeEventListener('keydown', handleTabKey);
    }, []);

    return {
        focusElement,
        focusFirstFocusableElement,
        focusLastFocusableElement,
        trapFocus,
    };
};
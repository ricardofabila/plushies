/**
 * Custom hook for form validation with cute styling and user-friendly error handling
 */

import { useState, useCallback, useMemo } from 'react';
import type { FieldValidationResult } from '@/lib/validation';

/**
 * Validation state for a form
 */
export interface ValidationState {
    [fieldName: string]: FieldValidationResult;
}

/**
 * Validation hook options
 */
export interface UseValidationOptions {
    validateOnChange?: boolean;
    validateOnBlur?: boolean;
    showErrorsImmediately?: boolean;
}

/**
 * Custom hook for managing form validation state
 * @param initialState - Initial validation state
 * @param options - Validation options
 * @returns Validation utilities and state
 */
export const useValidation = (
    initialState: ValidationState = {},
    options: UseValidationOptions = {}
) => {
    const {
        validateOnChange = false,
        validateOnBlur = true,
        showErrorsImmediately = false
    } = options;

    const [validationState, setValidationState] = useState<ValidationState>(initialState);
    const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
    const [showErrors, setShowErrors] = useState(showErrorsImmediately);

    /**
     * Set validation result for a specific field
     */
    const setFieldValidation = useCallback((fieldName: string, result: FieldValidationResult) => {
        setValidationState(prev => ({
            ...prev,
            [fieldName]: result
        }));
    }, []);

    /**
     * Set multiple field validations at once
     */
    const setValidations = useCallback((validations: ValidationState) => {
        setValidationState(prev => ({
            ...prev,
            ...validations
        }));
    }, []);

    /**
     * Mark a field as touched
     */
    const touchField = useCallback((fieldName: string) => {
        setTouchedFields(prev => new Set([...prev, fieldName]));
    }, []);

    /**
     * Mark multiple fields as touched
     */
    const touchFields = useCallback((fieldNames: string[]) => {
        setTouchedFields(prev => new Set([...prev, ...fieldNames]));
    }, []);

    /**
     * Clear validation for a specific field
     */
    const clearFieldValidation = useCallback((fieldName: string) => {
        setValidationState(prev => {
            const newState = { ...prev };
            delete newState[fieldName];
            return newState;
        });
    }, []);

    /**
     * Clear all validations
     */
    const clearValidations = useCallback(() => {
        setValidationState({});
        setTouchedFields(new Set());
        setShowErrors(showErrorsImmediately);
    }, [showErrorsImmediately]);

    /**
     * Enable error display
     */
    const enableErrorDisplay = useCallback(() => {
        setShowErrors(true);
    }, []);

    /**
     * Get validation result for a field
     */
    const getFieldValidation = useCallback((fieldName: string): FieldValidationResult => {
        return validationState[fieldName] || { isValid: true };
    }, [validationState]);

    /**
     * Check if a field has been touched
     */
    const isFieldTouched = useCallback((fieldName: string): boolean => {
        return touchedFields.has(fieldName);
    }, [touchedFields]);

    /**
     * Check if a field should show its error
     */
    const shouldShowFieldError = useCallback((fieldName: string): boolean => {
        if (!showErrors) return false;
        const validation = getFieldValidation(fieldName);
        return !validation.isValid && (isFieldTouched(fieldName) || showErrorsImmediately);
    }, [showErrors, getFieldValidation, isFieldTouched, showErrorsImmediately]);

    /**
     * Get error message for a field (only if it should be shown)
     */
    const getFieldError = useCallback((fieldName: string): string | undefined => {
        if (!shouldShowFieldError(fieldName)) return undefined;
        return getFieldValidation(fieldName).error;
    }, [shouldShowFieldError, getFieldValidation]);

    /**
     * Get CSS classes for a field based on validation state
     */
    const getFieldClasses = useCallback((fieldName: string, baseClasses: string = ''): string => {
        const hasError = shouldShowFieldError(fieldName);
        const errorClasses = hasError ? 'border-error-red focus:border-error-red focus:ring-error-red/20' : '';
        return `${baseClasses} ${errorClasses}`.trim();
    }, [shouldShowFieldError]);

    /**
     * Handle field change with optional validation
     */
    const handleFieldChange = useCallback((
        fieldName: string,
        value: any,
        validator?: (value: any) => FieldValidationResult
    ) => {
        if (validateOnChange && validator) {
            const result = validator(value);
            setFieldValidation(fieldName, result);
        }

        // Clear existing error if field becomes valid
        const currentValidation = getFieldValidation(fieldName);
        if (!currentValidation.isValid && validator) {
            const newResult = validator(value);
            if (newResult.isValid) {
                setFieldValidation(fieldName, newResult);
            }
        }
    }, [validateOnChange, setFieldValidation, getFieldValidation]);

    /**
     * Handle field blur with optional validation
     */
    const handleFieldBlur = useCallback((
        fieldName: string,
        value: any,
        validator?: (value: any) => FieldValidationResult
    ) => {
        touchField(fieldName);

        if (validateOnBlur && validator) {
            const result = validator(value);
            setFieldValidation(fieldName, result);
        }
    }, [validateOnBlur, touchField, setFieldValidation]);

    /**
     * Validate all fields and return overall validity
     */
    const validateAll = useCallback((validators: Record<string, (value: any) => FieldValidationResult>, values: Record<string, any>): boolean => {
        const newValidations: ValidationState = {};

        Object.entries(validators).forEach(([fieldName, validator]) => {
            const value = values[fieldName];
            const result = validator(value);
            newValidations[fieldName] = result;
        });

        setValidations(newValidations);
        touchFields(Object.keys(validators));
        enableErrorDisplay();

        return Object.values(newValidations).every(result => result.isValid);
    }, [setValidations, touchFields, enableErrorDisplay]);

    /**
     * Computed values
     */
    const computedValues = useMemo(() => {
        const allErrors = Object.values(validationState)
            .filter(result => !result.isValid && result.error)
            .map(result => result.error!);

        const visibleErrors = Object.keys(validationState)
            .filter(fieldName => shouldShowFieldError(fieldName))
            .map(fieldName => getFieldValidation(fieldName).error!)
            .filter(Boolean);

        const isValid = Object.values(validationState).every(result => result.isValid);
        const hasErrors = allErrors.length > 0;
        const hasVisibleErrors = visibleErrors.length > 0;

        return {
            allErrors,
            visibleErrors,
            isValid,
            hasErrors,
            hasVisibleErrors,
            errorCount: allErrors.length,
            visibleErrorCount: visibleErrors.length
        };
    }, [validationState, shouldShowFieldError, getFieldValidation]);

    return {
        // State
        validationState,
        touchedFields: Array.from(touchedFields),
        showErrors,

        // Actions
        setFieldValidation,
        setValidations,
        touchField,
        touchFields,
        clearFieldValidation,
        clearValidations,
        enableErrorDisplay,

        // Getters
        getFieldValidation,
        isFieldTouched,
        shouldShowFieldError,
        getFieldError,
        getFieldClasses,

        // Handlers
        handleFieldChange,
        handleFieldBlur,
        validateAll,

        // Computed values
        ...computedValues
    };
};

/**
 * Hook for simple field validation
 * @param validator - Validation function
 * @param initialValue - Initial field value
 * @returns Field validation utilities
 */
export const useFieldValidation = (
    validator: (value: any) => FieldValidationResult,
    initialValue: any = ''
) => {
    const [value, setValue] = useState(initialValue);
    const [isTouched, setIsTouched] = useState(false);
    const [validationResult, setValidationResult] = useState<FieldValidationResult>({ isValid: true });

    const validate = useCallback((newValue: any = value) => {
        const result = validator(newValue);
        setValidationResult(result);
        return result;
    }, [validator, value]);

    const handleChange = useCallback((newValue: any) => {
        setValue(newValue);
        if (isTouched) {
            validate(newValue);
        }
    }, [isTouched, validate]);

    const handleBlur = useCallback(() => {
        setIsTouched(true);
        validate();
    }, [validate]);

    const reset = useCallback((newValue: any = initialValue) => {
        setValue(newValue);
        setIsTouched(false);
        setValidationResult({ isValid: true });
    }, [initialValue]);

    const shouldShowError = isTouched && !validationResult.isValid;
    const errorMessage = shouldShowError ? validationResult.error : undefined;
    const fieldClasses = shouldShowError ? 'border-error-red focus:border-error-red focus:ring-error-red/20' : '';

    return {
        value,
        setValue,
        isTouched,
        validationResult,
        shouldShowError,
        errorMessage,
        fieldClasses,
        handleChange,
        handleBlur,
        validate,
        reset,
        isValid: validationResult.isValid
    };
};
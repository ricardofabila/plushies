/**
 * Comprehensive validation utilities for the Plushie Machine Revenue Tracker
 * Implements all validation rules for forms with user-friendly error messages
 */

import { isValidDateFormat, parseDate } from '@/utils';
import type { ValidationError } from '@/types';

/**
 * Validation result interface
 */
export interface ValidationResult {
    isValid: boolean;
    errors: ValidationError[];
}

/**
 * Field validation result
 */
export interface FieldValidationResult {
    isValid: boolean;
    error?: string;
}

/**
 * Validation rules configuration
 */
export interface ValidationRules {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: RegExp;
    custom?: (value: any) => string | null;
}

/**
 * Generic field validator
 * @param value - Value to validate
 * @param rules - Validation rules
 * @param fieldName - Field name for error messages
 * @returns Validation result
 */
export const validateField = (
    value: any,
    rules: ValidationRules,
    fieldName: string
): FieldValidationResult => {
    // Required validation
    if (rules.required && (!value || (typeof value === 'string' && !value.trim()))) {
        return {
            isValid: false,
            error: `${fieldName} es requerido`
        };
    }

    // Skip other validations if value is empty and not required
    if (!value || (typeof value === 'string' && !value.trim())) {
        return { isValid: true };
    }

    const stringValue = String(value).trim();

    // String length validations
    if (typeof value === 'string') {
        if (rules.minLength && stringValue.length < rules.minLength) {
            return {
                isValid: false,
                error: `${fieldName} debe tener al menos ${rules.minLength} caracteres`
            };
        }

        if (rules.maxLength && stringValue.length > rules.maxLength) {
            return {
                isValid: false,
                error: `${fieldName} no puede exceder ${rules.maxLength} caracteres`
            };
        }
    }

    // Numeric validations
    if (typeof value === 'number' || !isNaN(Number(value))) {
        const numValue = Number(value);

        if (rules.min !== undefined && numValue < rules.min) {
            return {
                isValid: false,
                error: `${fieldName} debe ser mayor o igual a ${rules.min}`
            };
        }

        if (rules.max !== undefined && numValue > rules.max) {
            return {
                isValid: false,
                error: `${fieldName} debe ser menor o igual a ${rules.max}`
            };
        }
    }

    // Pattern validation
    if (rules.pattern && !rules.pattern.test(stringValue)) {
        return {
            isValid: false,
            error: `${fieldName} tiene un formato inválido`
        };
    }

    // Custom validation
    if (rules.custom) {
        const customError = rules.custom(value);
        if (customError) {
            return {
                isValid: false,
                error: customError
            };
        }
    }

    return { isValid: true };
};

/**
 * Date validation utilities
 */
export const validateDate = (dateString: string, fieldName: string = 'Fecha'): FieldValidationResult => {
    if (!dateString || !dateString.trim()) {
        return {
            isValid: false,
            error: `${fieldName} es requerida`
        };
    }

    if (!isValidDateFormat(dateString)) {
        return {
            isValid: false,
            error: 'Formato de fecha inválido. Use DD/MM/YYYY'
        };
    }

    try {
        const parsedDate = parseDate(dateString);
        const today = new Date();
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(today.getFullYear() - 1);
        const oneYearFromNow = new Date();
        oneYearFromNow.setFullYear(today.getFullYear() + 1);

        if (parsedDate < oneYearAgo || parsedDate > oneYearFromNow) {
            return {
                isValid: false,
                error: 'La fecha debe estar dentro del último año o el próximo año'
            };
        }
    } catch {
        return {
            isValid: false,
            error: 'Fecha inválida'
        };
    }

    return { isValid: true };
};

/**
 * Date range validation
 * @param startDate - Start date string
 * @param endDate - End date string
 * @returns Validation result for date range
 */
export const validateDateRange = (startDate: string, endDate: string): {
    startDateResult: FieldValidationResult;
    endDateResult: FieldValidationResult;
    rangeResult: FieldValidationResult;
} => {
    const startDateResult = validateDate(startDate, 'Fecha de inicio');
    const endDateResult = validateDate(endDate, 'Fecha de fin');

    let rangeResult: FieldValidationResult = { isValid: true };

    // Only validate range if both dates are valid
    if (startDateResult.isValid && endDateResult.isValid) {
        try {
            const start = parseDate(startDate);
            const end = parseDate(endDate);

            if (start > end) {
                rangeResult = {
                    isValid: false,
                    error: 'La fecha de inicio no puede ser posterior a la fecha de fin'
                };
            }

            // Check if range is too large (more than 2 years)
            const diffTime = Math.abs(end.getTime() - start.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays > 730) { // 2 years
                rangeResult = {
                    isValid: false,
                    error: 'El rango de fechas no puede ser mayor a 2 años'
                };
            }
        } catch {
            rangeResult = {
                isValid: false,
                error: 'Rango de fechas inválido'
            };
        }
    }

    return {
        startDateResult,
        endDateResult,
        rangeResult
    };
};

/**
 * Currency amount validation
 * @param amount - Amount to validate
 * @param fieldName - Field name for error messages
 * @param allowZero - Whether to allow zero values
 * @returns Validation result
 */
export const validateCurrencyAmount = (
    amount: string | number,
    fieldName: string,
    allowZero: boolean = false
): FieldValidationResult => {
    if (!amount && amount !== 0) {
        return {
            isValid: false,
            error: `${fieldName} es requerido`
        };
    }

    const numValue = typeof amount === 'string' ? parseFloat(amount) : amount;

    if (isNaN(numValue)) {
        return {
            isValid: false,
            error: `${fieldName} debe ser un número válido`
        };
    }

    if (!allowZero && numValue < 0) {
        return {
            isValid: false,
            error: `${fieldName} debe ser un número positivo`
        };
    }

    if (allowZero && numValue < 0) {
        return {
            isValid: false,
            error: `${fieldName} no puede ser negativo`
        };
    }

    if (numValue > 1000000) {
        return {
            isValid: false,
            error: `${fieldName} parece demasiado alto (máximo: $1,000,000)`
        };
    }

    // Check for reasonable decimal places (max 2)
    const decimalPlaces = (numValue.toString().split('.')[1] || '').length;
    if (decimalPlaces > 2) {
        return {
            isValid: false,
            error: `${fieldName} no puede tener más de 2 decimales`
        };
    }

    return { isValid: true };
};

/**
 * Percentage validation
 * @param percentage - Percentage to validate
 * @param fieldName - Field name for error messages
 * @returns Validation result
 */
export const validatePercentage = (
    percentage: string | number,
    fieldName: string = 'Porcentaje'
): FieldValidationResult => {
    if (!percentage && percentage !== 0) {
        return {
            isValid: false,
            error: `${fieldName} es requerido`
        };
    }

    const numValue = typeof percentage === 'string' ? parseFloat(percentage) : percentage;

    if (isNaN(numValue)) {
        return {
            isValid: false,
            error: `${fieldName} debe ser un número válido`
        };
    }

    if (numValue < 0 || numValue > 100) {
        return {
            isValid: false,
            error: `${fieldName} debe estar entre 0 y 100`
        };
    }

    return { isValid: true };
};

/**
 * Store name validation
 * @param name - Store name to validate
 * @param existingNames - Array of existing store names to check for duplicates
 * @param currentName - Current name (for edit scenarios)
 * @returns Validation result
 */
export const validateStoreName = (
    name: string,
    existingNames: string[] = [],
    currentName?: string
): FieldValidationResult => {
    if (!name || !name.trim()) {
        return {
            isValid: false,
            error: 'El nombre de la tienda es requerido'
        };
    }

    const trimmedName = name.trim();

    if (trimmedName.length < 2) {
        return {
            isValid: false,
            error: 'El nombre de la tienda debe tener al menos 2 caracteres'
        };
    }

    if (trimmedName.length > 50) {
        return {
            isValid: false,
            error: 'El nombre de la tienda no puede exceder 50 caracteres'
        };
    }

    // Check for duplicate names (case-insensitive)
    const isDuplicate = existingNames.some(existingName =>
        existingName.toLowerCase() === trimmedName.toLowerCase() &&
        existingName !== currentName
    );

    if (isDuplicate) {
        return {
            isValid: false,
            error: 'Ya existe una tienda con este nombre'
        };
    }

    // Check for valid characters (letters, numbers, spaces, basic punctuation)
    const validNamePattern = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s\-_.,()]+$/;
    if (!validNamePattern.test(trimmedName)) {
        return {
            isValid: false,
            error: 'El nombre contiene caracteres no válidos'
        };
    }

    return { isValid: true };
};

/**
 * Entry validation - validates complete entry data
 * @param entryData - Entry data to validate
 * @param existingNames - Existing store names for validation
 * @returns Complete validation result
 */
export const validateEntry = (entryData: {
    date: string;
    recaudado: string | number;
    costoPeluches: string | number;
    notes?: string;
}): {
    date: FieldValidationResult;
    recaudado: FieldValidationResult;
    costoPeluches: FieldValidationResult;
    notes: FieldValidationResult;
    crossField: FieldValidationResult;
} => {
    const dateResult = validateDate(entryData.date);
    const recaudadoResult = validateCurrencyAmount(entryData.recaudado, 'Monto recaudado');
    const costoPeluchesResult = validateCurrencyAmount(entryData.costoPeluches, 'Costo de peluches');

    // Notes validation (optional field)
    const notesResult = validateField(
        entryData.notes || '',
        { maxLength: 500 },
        'Notas'
    );

    // Cross-field validation
    let crossFieldResult: FieldValidationResult = { isValid: true };

    if (recaudadoResult.isValid && costoPeluchesResult.isValid) {
        const recaudado = typeof entryData.recaudado === 'string'
            ? parseFloat(entryData.recaudado)
            : entryData.recaudado;
        const costoPeluches = typeof entryData.costoPeluches === 'string'
            ? parseFloat(entryData.costoPeluches)
            : entryData.costoPeluches;

        if (costoPeluches > recaudado) {
            crossFieldResult = {
                isValid: false,
                error: 'El costo de peluches no puede ser mayor al monto recaudado'
            };
        }
    }

    return {
        date: dateResult,
        recaudado: recaudadoResult,
        costoPeluches: costoPeluchesResult,
        notes: notesResult,
        crossField: crossFieldResult
    };
};

/**
 * Store validation - validates complete store data
 * @param storeData - Store data to validate
 * @param existingNames - Existing store names for duplicate checking
 * @param currentName - Current store name (for edit scenarios)
 * @returns Complete validation result
 */
export const validateStore = (storeData: {
    name: string;
    commissionPercent: string | number;
}, existingNames: string[] = [], currentName?: string): {
    name: FieldValidationResult;
    commissionPercent: FieldValidationResult;
} => {
    const nameResult = validateStoreName(storeData.name, existingNames, currentName);
    const commissionResult = validatePercentage(storeData.commissionPercent, 'Porcentaje de comisión');

    return {
        name: nameResult,
        commissionPercent: commissionResult
    };
};

/**
 * User settings validation
 * @param settings - User settings to validate
 * @returns Validation result
 */
export const validateUserSettings = (settings: {
    defaultCommissionPercent: string | number;
}): {
    defaultCommissionPercent: FieldValidationResult;
} => {
    const commissionResult = validatePercentage(
        settings.defaultCommissionPercent,
        'Porcentaje de comisión por defecto'
    );

    return {
        defaultCommissionPercent: commissionResult
    };
};

/**
 * File validation utilities
 */
export const validateFile = (file: File, options: {
    maxSizeMB?: number;
    allowedTypes?: string[];
    allowedExtensions?: string[];
} = {}): FieldValidationResult => {
    const {
        maxSizeMB = 10,
        allowedTypes = ['application/json'],
        allowedExtensions = ['.json']
    } = options;

    if (!file) {
        return {
            isValid: false,
            error: 'No se ha seleccionado ningún archivo'
        };
    }

    // File size validation
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
        return {
            isValid: false,
            error: `El archivo es demasiado grande. Tamaño máximo: ${maxSizeMB}MB`
        };
    }

    // File type validation
    const isValidType = allowedTypes.some(type => file.type.includes(type));
    const isValidExtension = allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext));

    if (!isValidType && !isValidExtension) {
        return {
            isValid: false,
            error: `Tipo de archivo no válido. Tipos permitidos: ${allowedExtensions.join(', ')}`
        };
    }

    return { isValid: true };
};

/**
 * Utility function to get all validation errors from a validation result object
 * @param validationResults - Object containing validation results
 * @returns Array of error messages
 */
export const getValidationErrors = (validationResults: Record<string, FieldValidationResult>): string[] => {
    return Object.values(validationResults)
        .filter(result => !result.isValid && result.error)
        .map(result => result.error!);
};

/**
 * Check if all validation results are valid
 * @param validationResults - Object containing validation results
 * @returns True if all validations pass
 */
export const isValidationPassing = (validationResults: Record<string, FieldValidationResult>): boolean => {
    return Object.values(validationResults).every(result => result.isValid);
};
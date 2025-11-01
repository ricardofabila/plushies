import type { AppStateV1 } from '@/types';

/**
 * LocalStorage persistence layer with schema versioning and error handling
 */

// Storage configuration
const STORAGE_KEY = 'plushie-tracker:v1';
const STORAGE_VERSION = 1;
const DEBOUNCE_DELAY = 300; // milliseconds

/**
 * Storage error types
 */
export class StorageError extends Error {
    public cause?: Error;

    constructor(message: string, cause?: Error) {
        super(message);
        this.name = 'StorageError';
        this.cause = cause;
    }
}

export class StorageQuotaError extends StorageError {
    constructor(message: string = 'LocalStorage quota exceeded') {
        super(message);
        this.name = 'StorageQuotaError';
    }
}

export class StorageValidationError extends StorageError {
    constructor(message: string) {
        super(message);
        this.name = 'StorageValidationError';
    }
}

/**
 * Schema validation for imported data
 */
const validateAppState = (data: any): data is AppStateV1 => {
    if (!data || typeof data !== 'object') {
        return false;
    }

    // Check version
    if (data.version !== 1) {
        return false;
    }

    // Check currency
    if (data.currency !== 'MXN') {
        return false;
    }

    // Check stores array
    if (!Array.isArray(data.stores)) {
        return false;
    }

    // Validate each store
    for (const store of data.stores) {
        if (!validateStore(store)) {
            return false;
        }
    }

    // Check user settings
    if (!validateUserSettings(data.userSettings)) {
        return false;
    }

    return true;
};

const validateStore = (store: any): boolean => {
    if (!store || typeof store !== 'object') {
        return false;
    }

    // Required fields
    if (typeof store.id !== 'string' ||
        typeof store.name !== 'string' ||
        typeof store.commissionPercent !== 'number') {
        return false;
    }

    // Validate commission percent range
    if (store.commissionPercent < 0 || store.commissionPercent > 100) {
        return false;
    }

    // Validate entries array
    if (!Array.isArray(store.entries)) {
        return false;
    }

    // Validate each entry
    for (const entry of store.entries) {
        if (!validateEntry(entry)) {
            return false;
        }
    }

    return true;
};

const validateEntry = (entry: any): boolean => {
    if (!entry || typeof entry !== 'object') {
        return false;
    }

    // Required fields
    if (typeof entry.id !== 'string' ||
        typeof entry.date !== 'string' ||
        typeof entry.recaudado !== 'number' ||
        typeof entry.costoPeluches !== 'number') {
        return false;
    }

    // Validate date format (DD/MM/YYYY)
    const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!dateRegex.test(entry.date)) {
        return false;
    }

    // Validate non-negative amounts
    if (entry.recaudado < 0 || entry.costoPeluches < 0) {
        return false;
    }

    return true;
};

const validateUserSettings = (settings: any): boolean => {
    if (!settings || typeof settings !== 'object') {
        return false;
    }

    if (typeof settings.defaultCommissionPercent !== 'number' ||
        settings.dateLocale !== 'es-MX') {
        return false;
    }

    if (settings.defaultCommissionPercent < 0 || settings.defaultCommissionPercent > 100) {
        return false;
    }

    return true;
};

/**
 * Debounced write functionality
 */
let writeTimeout: ReturnType<typeof setTimeout> | null = null;

const debouncedWrite = (data: AppStateV1): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (writeTimeout) {
            clearTimeout(writeTimeout);
        }

        writeTimeout = setTimeout(() => {
            try {
                writeToStorage(data);
                resolve();
            } catch (error) {
                reject(error);
            }
        }, DEBOUNCE_DELAY);
    });
};

/**
 * Core storage operations
 */

/**
 * Write data to LocalStorage with error handling
 */
const writeToStorage = (data: AppStateV1): void => {
    try {
        const serialized = JSON.stringify(data);
        localStorage.setItem(STORAGE_KEY, serialized);
    } catch (error) {
        if (error instanceof Error) {
            // Check for quota exceeded error
            if (error.name === 'QuotaExceededError' ||
                error.message.includes('quota') ||
                error.message.includes('storage')) {
                throw new StorageQuotaError('LocalStorage quota exceeded. Please export your data and clear storage.');
            }
            throw new StorageError(`Failed to write to LocalStorage: ${error.message}`, error);
        }
        throw new StorageError('Unknown error occurred while writing to LocalStorage');
    }
};

/**
 * Read data from LocalStorage with validation
 */
const readFromStorage = (): AppStateV1 | null => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) {
            return null;
        }

        const parsed = JSON.parse(stored);

        if (!validateAppState(parsed)) {
            throw new StorageValidationError('Invalid data structure in LocalStorage');
        }

        return parsed;
    } catch (error) {
        if (error instanceof StorageValidationError) {
            throw error;
        }
        if (error instanceof Error) {
            throw new StorageError(`Failed to read from LocalStorage: ${error.message}`, error);
        }
        throw new StorageError('Unknown error occurred while reading from LocalStorage');
    }
};

/**
 * Public API
 */

/**
 * Save application state to LocalStorage (debounced)
 */
export const saveToStorage = async (data: AppStateV1): Promise<void> => {
    if (!validateAppState(data)) {
        throw new StorageValidationError('Invalid application state data');
    }

    return debouncedWrite(data);
};

/**
 * Load application state from LocalStorage
 */
export const loadFromStorage = (): AppStateV1 | null => {
    try {
        return readFromStorage();
    } catch (error) {
        console.error('Storage load error:', error);

        // For validation errors, we might want to clear corrupted data
        if (error instanceof StorageValidationError) {
            console.warn('Clearing corrupted storage data');
            clearStorage();
        }

        return null;
    }
};

/**
 * Clear all data from LocalStorage
 */
export const clearStorage = (): void => {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
        console.error('Failed to clear storage:', error);
    }
};

/**
 * Check if LocalStorage is available
 */
export const isStorageAvailable = (): boolean => {
    try {
        const testKey = '__storage_test__';
        localStorage.setItem(testKey, 'test');
        localStorage.removeItem(testKey);
        return true;
    } catch {
        return false;
    }
};

/**
 * Get storage usage information
 */
export const getStorageInfo = (): { used: number; available: boolean } => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        const used = stored ? new Blob([stored]).size : 0;

        return {
            used,
            available: isStorageAvailable(),
        };
    } catch {
        return {
            used: 0,
            available: false,
        };
    }
};

/**
 * Import data with validation
 */
export const importFromJSON = (jsonString: string): AppStateV1 => {
    try {
        const parsed = JSON.parse(jsonString);

        if (!validateAppState(parsed)) {
            throw new StorageValidationError('Invalid JSON data structure');
        }

        return parsed;
    } catch (error) {
        if (error instanceof StorageValidationError) {
            throw error;
        }
        if (error instanceof SyntaxError) {
            throw new StorageValidationError('Invalid JSON format');
        }
        throw new StorageError('Failed to import JSON data');
    }
};

/**
 * Export data as JSON string
 */
export const exportToJSON = (data: AppStateV1): string => {
    if (!validateAppState(data)) {
        throw new StorageValidationError('Invalid application state data');
    }

    try {
        return JSON.stringify(data, null, 2);
    } catch (error) {
        throw new StorageError('Failed to export data as JSON');
    }
};

/**
 * Schema migration utilities (for future versions)
 */

/**
 * Migrate data from older schema versions
 * Currently only supports v1, but prepared for future migrations
 */
export const migrateSchema = (data: any): AppStateV1 => {
    // Currently only v1 is supported
    if (data.version === 1) {
        return data as AppStateV1;
    }

    // Future migration logic would go here
    throw new StorageValidationError(`Unsupported schema version: ${data.version}`);
};

/**
 * Check if data needs migration
 */
export const needsMigration = (data: any): boolean => {
    return data && data.version && data.version !== STORAGE_VERSION;
};
import type { Store, Entry } from '@/types';
import { calculateEntryMetrics, parseDate } from '@/utils';

/**
 * CSV export utilities for plushie machine revenue data
 */

/**
 * Spanish headers for CSV export
 */
const CSV_HEADERS = [
    'fecha',
    'recaudado',
    'costo_peluches',
    'ganancia',
    'comision',
    'restante',
    'notas'
];

/**
 * Format number for CSV export (using dot as decimal separator)
 * @param value - Number to format
 * @returns Formatted number string
 */
const formatNumberForCSV = (value: number): string => {
    return value.toFixed(2);
};

/**
 * Escape CSV field value
 * @param value - Value to escape
 * @returns Escaped CSV field
 */
const escapeCSVField = (value: string | number): string => {
    const stringValue = String(value);

    // If the field contains comma, quote, or newline, wrap in quotes and escape quotes
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
    }

    return stringValue;
};

/**
 * Convert entry to CSV row
 * @param entry - Entry data
 * @param commissionPercent - Store commission percentage
 * @returns CSV row string
 */
const entryToCSVRow = (entry: Entry, commissionPercent: number): string => {
    const metrics = calculateEntryMetrics(entry, commissionPercent);

    const fields = [
        escapeCSVField(entry.date),
        escapeCSVField(formatNumberForCSV(entry.recaudado)),
        escapeCSVField(formatNumberForCSV(entry.costoPeluches)),
        escapeCSVField(formatNumberForCSV(metrics.ganancia)),
        escapeCSVField(formatNumberForCSV(metrics.comision)),
        escapeCSVField(formatNumberForCSV(metrics.restante)),
        escapeCSVField(entry.notes || '')
    ];

    return fields.join(',');
};

/**
 * Export store data as CSV string
 * @param store - Store to export
 * @returns CSV string with Spanish headers
 */
export const exportStoreToCSV = (store: Store): string => {
    const lines: string[] = [];

    // Add header row
    lines.push(CSV_HEADERS.join(','));

    // Sort entries by date (oldest first)
    const sortedEntries = [...store.entries].sort((a, b) => {
        try {
            const dateA = parseDate(a.date);
            const dateB = parseDate(b.date);
            return dateA.getTime() - dateB.getTime();
        } catch {
            return 0;
        }
    });

    // Add data rows
    sortedEntries.forEach(entry => {
        lines.push(entryToCSVRow(entry, store.commissionPercent));
    });

    return lines.join('\n');
};

/**
 * Generate filename for CSV export
 * @param storeName - Name of the store
 * @returns Sanitized filename
 */
export const generateCSVFilename = (storeName: string): string => {
    // Sanitize store name for filename
    const sanitized = storeName
        .replace(/[^a-zA-Z0-9\s-_]/g, '') // Remove special characters
        .replace(/\s+/g, '_') // Replace spaces with underscores
        .toLowerCase();

    const date = new Date();
    const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD format

    return `plushie_revenue_${sanitized}_${dateString}.csv`;
};

/**
 * Download CSV file
 * @param csvContent - CSV content string
 * @param filename - Filename for download
 */
export const downloadCSV = (csvContent: string, filename: string): void => {
    try {
        // Create blob with UTF-8 BOM for proper Excel compatibility
        const BOM = '\uFEFF';
        const blob = new Blob([BOM + csvContent], {
            type: 'text/csv;charset=utf-8;'
        });

        // Create download link
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';

        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Clean up
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Failed to download CSV:', error);
        throw new Error('Failed to download CSV file');
    }
};/**
 * JSON
 export/import utilities
 */

import { exportToJSON, importFromJSON, StorageValidationError } from './storage';
import type { AppStateV1 } from '@/types';

/**
 * Generate filename for JSON export
 * @returns Filename with current date
 */
export const generateJSONFilename = (): string => {
    const date = new Date();
    const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD format

    return `plushie_tracker_backup_${dateString}.json`;
};

/**
 * Download JSON file
 * @param data - Application state data to export
 * @param filename - Filename for download
 */
export const downloadJSON = (data: AppStateV1, filename: string): void => {
    try {
        const jsonContent = exportToJSON(data);

        const blob = new Blob([jsonContent], {
            type: 'application/json;charset=utf-8;'
        });

        // Create download link
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';

        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Clean up
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Failed to download JSON:', error);
        throw new Error('Failed to download JSON file');
    }
};

/**
 * Read and validate JSON file from file input
 * @param file - File object from input
 * @returns Promise resolving to validated AppStateV1 data
 */
export const readJSONFile = (file: File): Promise<AppStateV1> => {
    return new Promise((resolve, reject) => {
        if (!file.type.includes('json') && !file.name.endsWith('.json')) {
            reject(new Error('Please select a valid JSON file'));
            return;
        }

        const reader = new FileReader();

        reader.onload = (event) => {
            try {
                const content = event.target?.result as string;
                if (!content) {
                    reject(new Error('File is empty or could not be read'));
                    return;
                }

                const data = importFromJSON(content);
                resolve(data);
            } catch (error) {
                if (error instanceof StorageValidationError) {
                    reject(new Error(`Invalid file format: ${error.message}`));
                } else {
                    reject(new Error('Failed to read JSON file'));
                }
            }
        };

        reader.onerror = () => {
            reject(new Error('Failed to read file'));
        };

        reader.readAsText(file);
    });
};

/**
 * Validate file size before processing
 * @param file - File to validate
 * @param maxSizeMB - Maximum file size in MB (default: 10MB)
 * @returns True if file size is acceptable
 */
export const validateFileSize = (file: File, maxSizeMB: number = 10): boolean => {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
};
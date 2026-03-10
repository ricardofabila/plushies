import { format, parse, startOfDay, endOfDay, startOfMonth, endOfMonth, startOfYear, endOfYear, subDays } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Entry, EntryMetrics, DateRange, DateRangePreset, ChartDataPoint } from '@/types';

/**
 * Business calculation functions for plushie machine revenue tracking
 */

/**
 * Calculate ganancia (profit) as recaudado minus costoPeluches
 * @param recaudado - Total money collected (gross revenue)
 * @param costoPeluches - Cost of plushies sold/dispensed
 * @returns Profit amount rounded to 2 decimal places
 */
export const calculateGanancia = (recaudado: number, costoPeluches: number): number => {
    const ganancia = recaudado - costoPeluches;
    return Math.round(ganancia * 100) / 100;
};

/**
 * Calculate comision (commission) as percentage of ganancia
 * @param ganancia - Profit amount
 * @param commissionPercent - Commission percentage (0-100)
 * @returns Commission amount rounded to 2 decimal places
 */
export const calculateComision = (ganancia: number, commissionPercent: number): number => {
    const comision = (ganancia * commissionPercent) / 100;
    return Math.round(comision * 100) / 100;
};

/**
 * Calculate restante (remaining profit) as ganancia minus comision
 * @param ganancia - Profit amount
 * @param comision - Commission amount
 * @returns Remaining profit rounded to 2 decimal places
 */
export const calculateRestante = (ganancia: number, comision: number): number => {
    const restante = ganancia - comision;
    return Math.round(restante * 100) / 100;
};

/**
 * Calculate all metrics for an entry
 * @param entry - Entry data
 * @param commissionPercent - Commission percentage for the store
 * @returns Complete entry metrics
 */
export const calculateEntryMetrics = (entry: Entry, commissionPercent: number): EntryMetrics => {
    const ganancia = calculateGanancia(entry.recaudado, entry.costoPeluches);
    const comision = calculateComision(ganancia, commissionPercent);
    const restante = calculateRestante(ganancia, comision);

    return {
        ganancia,
        comision,
        restante,
    };
};

/**
 * Date formatting utilities with Spanish locale
 */

/**
 * Format date to DD/MM/YYYY format
 * @param date - Date object to format
 * @returns Formatted date string
 */
export const formatDate = (date: Date): string => {
    return format(date, 'dd/MM/yyyy', { locale: es });
};

/**
 * Format date string to display format with Spanish month abbreviation (e.g., "10/oct/2025")
 * @param dateString - Date string in DD/MM/YYYY format
 * @returns Display formatted date string or original if parsing fails
 */
export const formatDateForDisplay = (dateString: string): string => {
    try {
        const date = parseDate(dateString);
        return format(date, 'dd/MMM/yyyy', { locale: es });
    } catch {
        // Return original string if parsing fails
        return dateString;
    }
};

/**
 * Parse date string in DD/MM/YYYY format
 * @param dateString - Date string to parse
 * @returns Date object
 * @throws Error if date string is invalid
 */
export const parseDate = (dateString: string): Date => {
    const parsed = parse(dateString, 'dd/MM/yyyy', new Date(), { locale: es });
    if (isNaN(parsed.getTime())) {
        throw new Error(`Invalid date format: ${dateString}. Expected DD/MM/YYYY`);
    }
    return parsed;
};

/**
 * Validate date string format
 * @param dateString - Date string to validate
 * @returns True if valid DD/MM/YYYY format
 */
export const isValidDateFormat = (dateString: string): boolean => {
    try {
        parseDate(dateString);
        return true;
    } catch {
        return false;
    }
};

/**
 * Convert date from DD/MM/YYYY to YYYY-MM-DD format (for HTML5 date inputs)
 * @param dateString - Date string in DD/MM/YYYY format
 * @returns Date string in YYYY-MM-DD format
 */
export const convertToInputDate = (dateString: string): string => {
    try {
        const date = parseDate(dateString);
        return format(date, 'yyyy-MM-dd');
    } catch {
        // If parsing fails, return today's date in input format
        return format(new Date(), 'yyyy-MM-dd');
    }
};

/**
 * Convert date from YYYY-MM-DD to DD/MM/YYYY format (from HTML5 date inputs)
 * @param inputDate - Date string in YYYY-MM-DD format
 * @returns Date string in DD/MM/YYYY format
 */
export const convertFromInputDate = (inputDate: string): string => {
    try {
        const date = parse(inputDate, 'yyyy-MM-dd', new Date());
        return format(date, 'dd/MM/yyyy', { locale: es });
    } catch {
        return inputDate;
    }
};

/**
 * Currency formatting utilities for MXN
 */

/**
 * Format amount as Mexican Peso currency
 * @param amount - Amount to format
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
    }).format(amount);
};

/**
 * Format amount as number with thousands separators
 * @param amount - Amount to format
 * @returns Formatted number string
 */
export const formatNumber = (amount: number): string => {
    return new Intl.NumberFormat('es-MX', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
};

/**
 * Date range utilities
 */

/**
 * Get date range based on preset
 * @param preset - Date range preset
 * @param customRange - Custom date range (used when preset is 'custom')
 * @returns Date range object
 */
export const getDateRangeFromPreset = (
    preset: DateRangePreset,
    customRange?: DateRange
): DateRange => {
    const now = new Date();

    switch (preset) {
        case 'este-mes':
            return {
                start: startOfMonth(now),
                end: endOfMonth(now),
            };
        case 'ultimos-30-dias':
            return {
                start: startOfDay(subDays(now, 29)),
                end: endOfDay(now),
            };
        case 'ano-actual':
            return {
                start: startOfYear(now),
                end: endOfYear(now),
            };
        case 'all-time':
            return {
                start: new Date(1970, 0, 1), // January 1, 1970
                end: endOfDay(now),
            };
        case 'custom':
            if (!customRange) {
                throw new Error('Custom range required when preset is "custom"');
            }
            return customRange;
        default:
            return {
                start: startOfMonth(now),
                end: endOfMonth(now),
            };
    }
};

/**
 * Check if a date string falls within a date range
 * @param dateString - Date string in DD/MM/YYYY format
 * @param range - Date range to check against
 * @returns True if date is within range
 */
export const isDateInRange = (dateString: string, range: DateRange): boolean => {
    try {
        const date = parseDate(dateString);
        return date >= startOfDay(range.start) && date <= endOfDay(range.end);
    } catch {
        return false;
    }
};

/**
 * Utility functions
 */

/**
 * Generate UUID-like ID
 * @returns Random ID string
 */
export const generateId = (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
};

/**
 * Sort array by key with direction
 * @param array - Array to sort
 * @param key - Key to sort by
 * @param direction - Sort direction
 * @returns Sorted array copy
 */
export const sortBy = <T>(array: T[], key: keyof T, direction: 'asc' | 'desc' = 'asc'): T[] => {
    return [...array].sort((a, b) => {
        const aVal = a[key];
        const bVal = b[key];

        if (aVal < bVal) return direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return direction === 'asc' ? 1 : -1;
        return 0;
    });
};

/**
 * Round number to specified decimal places
 * @param num - Number to round
 * @param decimals - Number of decimal places
 * @returns Rounded number
 */
export const roundToDecimals = (num: number, decimals: number = 2): number => {
    const factor = Math.pow(10, decimals);
    return Math.round(num * factor) / factor;
};

/**
 * Analytics calculation functions
 */

/**
 * Calculate combined KPI data from multiple stores for a date range
 * @param stores - Array of stores with entries
 * @param dateRange - Date range to filter entries
 * @returns Combined KPI data across all stores
 */
export const calculateCombinedKPIs = (stores: any[], dateRange: DateRange): any => {
    let totalRecaudado = 0;
    let totalGanancia = 0;
    let totalComision = 0;
    let totalRestante = 0;
    let entryCount = 0;

    stores.forEach(store => {
        store.entries.forEach((entry: Entry) => {
            if (isDateInRange(entry.date, dateRange)) {
                const metrics = calculateEntryMetrics(entry, store.commissionPercent);

                totalRecaudado += entry.recaudado;
                totalGanancia += metrics.ganancia;
                totalComision += metrics.comision;
                totalRestante += metrics.restante;
                entryCount++;
            }
        });
    });

    const profitMargin = totalRecaudado > 0 ? (totalRestante / totalRecaudado) * 100 : 0;

    return {
        totalRecaudado: roundToDecimals(totalRecaudado),
        totalGanancia: roundToDecimals(totalGanancia),
        totalComision: roundToDecimals(totalComision),
        totalRestante: roundToDecimals(totalRestante),
        profitMargin: roundToDecimals(profitMargin),
        entryCount,
    };
};/**

 * Prepare line chart data showing revenue trends over time
 * @param stores - Array of stores with entries
 * @param dateRange - Date range to filter entries
 * @returns Array of chart data points grouped by date
 */
export const prepareRevenueLineChartData = (stores: any[], dateRange: DateRange): ChartDataPoint[] => {
    const dataMap = new Map<string, ChartDataPoint>();

    stores.forEach(store => {
        store.entries.forEach((entry: Entry) => {
            if (isDateInRange(entry.date, dateRange)) {
                const metrics = calculateEntryMetrics(entry, store.commissionPercent);
                const dateKey = entry.date;

                if (dataMap.has(dateKey)) {
                    const existing = dataMap.get(dateKey)!;
                    existing.recaudado += entry.recaudado;
                    existing.ganancia += metrics.ganancia;
                    existing.comision += metrics.comision;
                    existing.restante += metrics.restante;
                } else {
                    dataMap.set(dateKey, {
                        date: dateKey,
                        recaudado: entry.recaudado,
                        ganancia: metrics.ganancia,
                        comision: metrics.comision,
                        restante: metrics.restante,
                    });
                }
            }
        });
    });

    // Convert to array and sort by date
    return Array.from(dataMap.values())
        .sort((a, b) => {
            try {
                const dateA = parseDate(a.date);
                const dateB = parseDate(b.date);
                return dateA.getTime() - dateB.getTime();
            } catch {
                return 0;
            }
        })
        .map(item => ({
            ...item,
            recaudado: roundToDecimals(item.recaudado),
            ganancia: roundToDecimals(item.ganancia),
            comision: roundToDecimals(item.comision),
            restante: roundToDecimals(item.restante),
        }));
};

/**
 * Prepare bar chart data comparing restante by store
 * @param stores - Array of stores with entries
 * @param dateRange - Date range to filter entries
 * @returns Array of store comparison data
 */
export const prepareStoreComparisonData = (stores: any[], dateRange: DateRange): Array<{ name: string, restante: number, color?: string }> => {
    const colors = [
        '#ed7f4a', // primary-500
        '#22c55e', // success-500
        '#f59e0b', // warning-500
        '#d946ef', // accent-500
        '#0ea5e9', // secondary-500
        '#ef4444', // error-500
    ];

    return stores.map((store, index) => {
        let totalRestante = 0;

        store.entries.forEach((entry: Entry) => {
            if (isDateInRange(entry.date, dateRange)) {
                const metrics = calculateEntryMetrics(entry, store.commissionPercent);
                totalRestante += metrics.restante;
            }
        });

        return {
            name: store.name,
            restante: roundToDecimals(totalRestante),
            color: store.color || colors[index % colors.length],
        };
    }).filter(item => item.restante > 0); // Only show stores with revenue
};

/**
 * Prepare pie chart data showing recaudado distribution by store
 * @param stores - Array of stores with entries
 * @param dateRange - Date range to filter entries
 * @returns Array of pie chart data
 */
export const prepareRevenueDistributionData = (stores: any[], dateRange: DateRange): Array<{ name: string, value: number, color?: string }> => {
    const colors = [
        '#ed7f4a', // primary-500
        '#22c55e', // success-500
        '#f59e0b', // warning-500
        '#d946ef', // accent-500
        '#0ea5e9', // secondary-500
        '#ef4444', // error-500
    ];

    return stores.map((store, index) => {
        let totalRecaudado = 0;

        store.entries.forEach((entry: Entry) => {
            if (isDateInRange(entry.date, dateRange)) {
                totalRecaudado += entry.recaudado;
            }
        });

        return {
            name: store.name,
            value: roundToDecimals(totalRecaudado),
            color: store.color || colors[index % colors.length],
        };
    }).filter(item => item.value > 0); // Only show stores with revenue
};

/**
 * Prepare stores summary data for the summary table
 * @param stores - Array of stores with entries
 * @param dateRange - Date range to filter entries
 * @returns Array of store summary data
 */
export const prepareStoresSummaryData = (stores: any[], dateRange: DateRange): Array<{
    store: any;
    totalRecaudado: number;
    totalGanancia: number;
    totalComision: number;
    totalRestante: number;
    profitMargin: number;
    entryCount: number;
}> => {
    return stores.map(store => {
        let totalRecaudado = 0;
        let totalGanancia = 0;
        let totalComision = 0;
        let totalRestante = 0;
        let entryCount = 0;

        store.entries.forEach((entry: Entry) => {
            if (isDateInRange(entry.date, dateRange)) {
                const metrics = calculateEntryMetrics(entry, store.commissionPercent);

                totalRecaudado += entry.recaudado;
                totalGanancia += metrics.ganancia;
                totalComision += metrics.comision;
                totalRestante += metrics.restante;
                entryCount++;
            }
        });

        const profitMargin = totalRecaudado > 0 ? (totalRestante / totalRecaudado) * 100 : 0;

        return {
            store,
            totalRecaudado: roundToDecimals(totalRecaudado),
            totalGanancia: roundToDecimals(totalGanancia),
            totalComision: roundToDecimals(totalComision),
            totalRestante: roundToDecimals(totalRestante),
            profitMargin: roundToDecimals(profitMargin),
            entryCount,
        };
    }).filter(item => item.entryCount > 0); // Only show stores with entries in the date range
};

/**
 * Calculate store-specific KPI data for a date range
 * @param store - Store with entries
 * @param dateRange - Date range to filter entries
 * @returns Store-specific KPI data with best/worst day information
 */
export const calculateStoreKPIs = (store: any, dateRange: DateRange): {
    totalRecaudado: number;
    totalGanancia: number;
    totalComision: number;
    totalRestante: number;
    profitMargin: number;
    entryCount: number;
    bestDay?: { date: string; restante: number };
    worstDay?: { date: string; restante: number };
} => {
    let totalRecaudado = 0;
    let totalGanancia = 0;
    let totalComision = 0;
    let totalRestante = 0;
    let entryCount = 0;
    let bestDay: { date: string; restante: number } | undefined;
    let worstDay: { date: string; restante: number } | undefined;

    store.entries.forEach((entry: Entry) => {
        if (isDateInRange(entry.date, dateRange)) {
            const metrics = calculateEntryMetrics(entry, store.commissionPercent);

            totalRecaudado += entry.recaudado;
            totalGanancia += metrics.ganancia;
            totalComision += metrics.comision;
            totalRestante += metrics.restante;
            entryCount++;

            // Track best and worst days by restante
            if (!bestDay || metrics.restante > bestDay.restante) {
                bestDay = { date: entry.date, restante: metrics.restante };
            }
            if (!worstDay || metrics.restante < worstDay.restante) {
                worstDay = { date: entry.date, restante: metrics.restante };
            }
        }
    });

    const profitMargin = totalRecaudado > 0 ? (totalRestante / totalRecaudado) * 100 : 0;

    return {
        totalRecaudado: roundToDecimals(totalRecaudado),
        totalGanancia: roundToDecimals(totalGanancia),
        totalComision: roundToDecimals(totalComision),
        totalRestante: roundToDecimals(totalRestante),
        profitMargin: roundToDecimals(profitMargin),
        entryCount,
        bestDay: bestDay ? { ...bestDay, restante: roundToDecimals(bestDay.restante) } : undefined,
        worstDay: worstDay ? { ...worstDay, restante: roundToDecimals(worstDay.restante) } : undefined,
    };
};

/**
 * Prepare store-specific revenue line chart data
 * @param store - Store with entries
 * @param dateRange - Date range to filter entries
 * @returns Array of chart data points for store revenue trends
 */
export const prepareStoreRevenueLineChartData = (store: any, dateRange: DateRange): Array<{
    date: string;
    recaudado: number;
    costoPeluches: number;
    restante: number;
}> => {
    const chartData: Array<{
        date: string;
        recaudado: number;
        costoPeluches: number;
        restante: number;
    }> = [];

    store.entries.forEach((entry: Entry) => {
        if (isDateInRange(entry.date, dateRange)) {
            const metrics = calculateEntryMetrics(entry, store.commissionPercent);

            chartData.push({
                date: entry.date,
                recaudado: roundToDecimals(entry.recaudado),
                costoPeluches: roundToDecimals(entry.costoPeluches),
                restante: roundToDecimals(metrics.restante),
            });
        }
    });

    // Sort by date
    return chartData.sort((a, b) => {
        try {
            const dateA = parseDate(a.date);
            const dateB = parseDate(b.date);
            return dateA.getTime() - dateB.getTime();
        } catch {
            return 0;
        }
    });
};

/**
 * Prepare commission vs profit bar chart data for a store
 * @param store - Store with entries
 * @param dateRange - Date range to filter entries
 * @returns Array of chart data points showing commission vs restante by date
 */
export const prepareCommissionVsProfitData = (store: any, dateRange: DateRange): Array<{
    date: string;
    comision: number;
    restante: number;
}> => {
    const chartData: Array<{
        date: string;
        comision: number;
        restante: number;
    }> = [];

    store.entries.forEach((entry: Entry) => {
        if (isDateInRange(entry.date, dateRange)) {
            const metrics = calculateEntryMetrics(entry, store.commissionPercent);

            chartData.push({
                date: entry.date,
                comision: roundToDecimals(metrics.comision),
                restante: roundToDecimals(metrics.restante),
            });
        }
    });

    // Sort by date
    return chartData.sort((a, b) => {
        try {
            const dateA = parseDate(a.date);
            const dateB = parseDate(b.date);
            return dateA.getTime() - dateB.getTime();
        } catch {
            return 0;
        }
    });
};
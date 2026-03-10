// Core data types for the Plushie Machine Revenue Tracker

/**
 * Application state with schema versioning
 */
export interface AppStateV1 {
    version: 1;
    currency: 'MXN';
    stores: Store[];
    userSettings: UserSettings;
}

/**
 * User settings and preferences
 */
export interface UserSettings {
    defaultCommissionPercent: number;
    dateLocale: 'es-MX';
}

/**
 * Store represents a physical location with plushie machines
 */
export interface Store {
    id: string; // UUID
    name: string;
    commissionPercent: number;
    color?: string; // For chart differentiation
    entries: Entry[];
}

/**
 * Entry represents a daily transaction record for a store
 */
export interface Entry {
    id: string; // UUID
    date: string; // DD/MM/YYYY format
    recaudado: number; // Total money collected (gross revenue)
    costoPeluches: number; // Cost of plushies sold/dispensed
    notes?: string;
    // Computed fields (not stored, calculated at runtime):
    // ganancia: recaudado - costoPeluches
    // comision: ganancia * commissionPercent / 100
    // restante: ganancia - comision
}

/**
 * Computed financial metrics for an entry
 */
export interface EntryMetrics {
    ganancia: number; // Profit (recaudado - costoPeluches)
    comision: number; // Commission fee
    restante: number; // Net profit after commission
}

/**
 * Date range for filtering data
 */
export interface DateRange {
    start: Date;
    end: Date;
}

/**
 * Chart data point for visualizations
 */
export interface ChartDataPoint {
    date: string;
    recaudado: number;
    ganancia: number;
    comision: number;
    restante: number;
    store?: string; // Store name for multi-store charts
}

/**
 * KPI (Key Performance Indicator) data
 */
export interface KPIData {
    totalRecaudado: number;
    totalGanancia: number;
    totalComision: number;
    totalRestante: number;
    profitMargin: number; // restante / recaudado * 100
    entryCount: number;
}

/**
 * Store summary for dashboard table
 */
export interface StoreSummary {
    store: Store;
    metrics: KPIData;
    bestDay?: {
        date: string;
        restante: number;
    };
    worstDay?: {
        date: string;
        restante: number;
    };
}

/**
 * Date range preset options
 */
export type DateRangePreset = 'este-mes' | 'ultimos-30-dias' | 'ano-actual' | 'all-time' | 'custom';

/**
 * Sort options for tables
 */
export type SortField = 'date' | 'recaudado' | 'ganancia' | 'comision' | 'restante' | 'name';
export type SortDirection = 'asc' | 'desc';

/**
 * Error types for validation and error handling
 */
export interface ValidationError {
    field: string;
    message: string;
    type: 'required' | 'invalid' | 'range' | 'format';
}

/**
 * Toast notification types
 */
export interface ToastMessage {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message?: string;
    duration?: number;
}
import { parseDate, isDateInRange, calculateEntryMetrics, roundToDecimals } from './index';
import { getDay, differenceInDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subMonths, subWeeks, subYears, eachDayOfInterval } from 'date-fns';
import type { Store, DateRange } from '@/types';

/**
 * Advanced analytics calculations for plushie sales tracking
 */

// ============================================================================
// Best/Worst Performing Days Analysis
// ============================================================================

export interface DayOfWeekPerformance {
    dayName: string;
    dayNumber: number; // 0 = Sunday, 6 = Saturday
    totalRevenue: number;
    avgRevenue: number;
    entryCount: number;
    percentage: number;
}

export const analyzeDayOfWeekPerformance = (stores: Store[], dateRange: DateRange): DayOfWeekPerformance[] => {
    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const dayStats = Array.from({ length: 7 }, (_, i) => ({
        dayName: dayNames[i],
        dayNumber: i,
        totalRevenue: 0,
        entryCount: 0,
    }));

    stores.forEach(store => {
        store.entries.forEach(entry => {
            if (isDateInRange(entry.date, dateRange)) {
                const date = parseDate(entry.date);
                const dayOfWeek = getDay(date);
                dayStats[dayOfWeek].totalRevenue += entry.recaudado;
                dayStats[dayOfWeek].entryCount++;
            }
        });
    });

    const totalRevenue = dayStats.reduce((sum, day) => sum + day.totalRevenue, 0);

    return dayStats.map(day => ({
        ...day,
        avgRevenue: day.entryCount > 0 ? roundToDecimals(day.totalRevenue / day.entryCount) : 0,
        totalRevenue: roundToDecimals(day.totalRevenue),
        percentage: totalRevenue > 0 ? roundToDecimals((day.totalRevenue / totalRevenue) * 100) : 0,
    }));
};

export interface PeakSalesDay {
    date: string;
    revenue: number;
    profit: number;
    stores: string[];
}

export const findPeakSalesDays = (stores: Store[], dateRange: DateRange, topN: number = 5): PeakSalesDay[] => {
    const dayMap = new Map<string, { revenue: number; profit: number; stores: Set<string> }>();

    stores.forEach(store => {
        store.entries.forEach(entry => {
            if (isDateInRange(entry.date, dateRange)) {
                const metrics = calculateEntryMetrics(entry, store.commissionPercent);
                const existing = dayMap.get(entry.date) || { revenue: 0, profit: 0, stores: new Set<string>() };

                existing.revenue += entry.recaudado;
                existing.profit += metrics.restante;
                existing.stores.add(store.name);

                dayMap.set(entry.date, existing);
            }
        });
    });

    return Array.from(dayMap.entries())
        .map(([date, data]) => ({
            date,
            revenue: roundToDecimals(data.revenue),
            profit: roundToDecimals(data.profit),
            stores: Array.from(data.stores),
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, topN);
};

// ============================================================================
// Growth Rate Metrics
// ============================================================================

export interface GrowthMetrics {
    current: number;
    previous: number;
    growthRate: number; // percentage
    growthAmount: number;
    label: string;
}

export const calculateMonthOverMonthGrowth = (stores: Store[], currentDate: Date = new Date()): GrowthMetrics => {
    const currentMonthRange: DateRange = {
        start: startOfMonth(currentDate),
        end: endOfMonth(currentDate),
    };

    const previousMonthDate = subMonths(currentDate, 1);
    const previousMonthRange: DateRange = {
        start: startOfMonth(previousMonthDate),
        end: endOfMonth(previousMonthDate),
    };

    let currentRevenue = 0;
    let previousRevenue = 0;

    stores.forEach(store => {
        store.entries.forEach(entry => {
            if (isDateInRange(entry.date, currentMonthRange)) {
                currentRevenue += entry.recaudado;
            }
            if (isDateInRange(entry.date, previousMonthRange)) {
                previousRevenue += entry.recaudado;
            }
        });
    });

    const growthAmount = currentRevenue - previousRevenue;
    const growthRate = previousRevenue > 0 ? (growthAmount / previousRevenue) * 100 : 0;

    return {
        current: roundToDecimals(currentRevenue),
        previous: roundToDecimals(previousRevenue),
        growthRate: roundToDecimals(growthRate),
        growthAmount: roundToDecimals(growthAmount),
        label: 'Mes a Mes',
    };
};

export const calculateWeekOverWeekGrowth = (stores: Store[], currentDate: Date = new Date()): GrowthMetrics => {
    const currentWeekRange: DateRange = {
        start: startOfWeek(currentDate, { weekStartsOn: 1 }), // Monday
        end: endOfWeek(currentDate, { weekStartsOn: 1 }),
    };

    const previousWeekDate = subWeeks(currentDate, 1);
    const previousWeekRange: DateRange = {
        start: startOfWeek(previousWeekDate, { weekStartsOn: 1 }),
        end: endOfWeek(previousWeekDate, { weekStartsOn: 1 }),
    };

    let currentRevenue = 0;
    let previousRevenue = 0;

    stores.forEach(store => {
        store.entries.forEach(entry => {
            if (isDateInRange(entry.date, currentWeekRange)) {
                currentRevenue += entry.recaudado;
            }
            if (isDateInRange(entry.date, previousWeekRange)) {
                previousRevenue += entry.recaudado;
            }
        });
    });

    const growthAmount = currentRevenue - previousRevenue;
    const growthRate = previousRevenue > 0 ? (growthAmount / previousRevenue) * 100 : 0;

    return {
        current: roundToDecimals(currentRevenue),
        previous: roundToDecimals(previousRevenue),
        growthRate: roundToDecimals(growthRate),
        growthAmount: roundToDecimals(growthAmount),
        label: 'Semana a Semana',
    };
};

export const calculateYearOverYearGrowth = (stores: Store[], currentDate: Date = new Date()): GrowthMetrics => {
    const currentYearRange: DateRange = {
        start: startOfMonth(currentDate),
        end: endOfMonth(currentDate),
    };

    const previousYearDate = subYears(currentDate, 1);
    const previousYearRange: DateRange = {
        start: startOfMonth(previousYearDate),
        end: endOfMonth(previousYearDate),
    };

    let currentRevenue = 0;
    let previousRevenue = 0;

    stores.forEach(store => {
        store.entries.forEach(entry => {
            if (isDateInRange(entry.date, currentYearRange)) {
                currentRevenue += entry.recaudado;
            }
            if (isDateInRange(entry.date, previousYearRange)) {
                previousRevenue += entry.recaudado;
            }
        });
    });

    const growthAmount = currentRevenue - previousRevenue;
    const growthRate = previousRevenue > 0 ? (growthAmount / previousRevenue) * 100 : 0;

    return {
        current: roundToDecimals(currentRevenue),
        previous: roundToDecimals(previousRevenue),
        growthRate: roundToDecimals(growthRate),
        growthAmount: roundToDecimals(growthAmount),
        label: 'Año a Año',
    };
};

// ============================================================================
// Moving Averages
// ============================================================================

export interface MovingAverageDataPoint {
    date: string;
    actualRevenue: number;
    ma7: number | null;
    ma30: number | null;
}

export const calculateMovingAverages = (stores: Store[], dateRange: DateRange): MovingAverageDataPoint[] => {
    // Collect all entries with dates
    const allEntries: Array<{ date: Date; dateStr: string; revenue: number }> = [];

    stores.forEach(store => {
        store.entries.forEach(entry => {
            if (isDateInRange(entry.date, dateRange)) {
                allEntries.push({
                    date: parseDate(entry.date),
                    dateStr: entry.date,
                    revenue: entry.recaudado,
                });
            }
        });
    });

    // Sort by date
    allEntries.sort((a, b) => a.date.getTime() - b.date.getTime());

    // Group by date and sum revenues
    const dailyRevenue = new Map<string, number>();
    allEntries.forEach(entry => {
        const existing = dailyRevenue.get(entry.dateStr) || 0;
        dailyRevenue.set(entry.dateStr, existing + entry.revenue);
    });

    // Convert to sorted array
    const sortedDays = Array.from(dailyRevenue.entries())
        .map(([dateStr, revenue]) => ({ dateStr, date: parseDate(dateStr), revenue }))
        .sort((a, b) => a.date.getTime() - b.date.getTime());

    // Calculate moving averages
    return sortedDays.map((day, index) => {
        // 7-day MA
        const ma7Start = Math.max(0, index - 6);
        const ma7Days = sortedDays.slice(ma7Start, index + 1);
        const ma7 = ma7Days.length >= 7
            ? roundToDecimals(ma7Days.reduce((sum, d) => sum + d.revenue, 0) / ma7Days.length)
            : null;

        // 30-day MA
        const ma30Start = Math.max(0, index - 29);
        const ma30Days = sortedDays.slice(ma30Start, index + 1);
        const ma30 = ma30Days.length >= 30
            ? roundToDecimals(ma30Days.reduce((sum, d) => sum + d.revenue, 0) / ma30Days.length)
            : null;

        return {
            date: day.dateStr,
            actualRevenue: roundToDecimals(day.revenue),
            ma7,
            ma30,
        };
    });
};

// ============================================================================
// ROI per Store
// ============================================================================

export interface StoreROI {
    storeName: string;
    totalInvestment: number; // costoPeluches
    totalRevenue: number; // recaudado
    totalProfit: number; // restante
    roi: number; // (profit / investment) * 100
    breakEvenDate: string | null;
    daysToBreakEven: number | null;
}

export const calculateStoreROI = (store: Store, dateRange: DateRange): StoreROI => {
    let totalInvestment = 0;
    let totalRevenue = 0;
    let totalProfit = 0;
    let cumulativeProfit = 0;
    let breakEvenDate: string | null = null;
    let firstEntryDate: Date | null = null;

    // Sort entries by date
    const sortedEntries = [...store.entries]
        .filter(entry => isDateInRange(entry.date, dateRange))
        .sort((a, b) => {
            try {
                return parseDate(a.date).getTime() - parseDate(b.date).getTime();
            } catch {
                return 0;
            }
        });

    sortedEntries.forEach(entry => {
        const metrics = calculateEntryMetrics(entry, store.commissionPercent);

        totalInvestment += entry.costoPeluches;
        totalRevenue += entry.recaudado;
        totalProfit += metrics.restante;
        cumulativeProfit += metrics.restante;

        if (!firstEntryDate) {
            firstEntryDate = parseDate(entry.date);
        }

        // Check if we've broken even
        if (!breakEvenDate && cumulativeProfit >= totalInvestment) {
            breakEvenDate = entry.date;
        }
    });

    const roi = totalInvestment > 0 ? (totalProfit / totalInvestment) * 100 : 0;
    const daysToBreakEven = breakEvenDate && firstEntryDate
        ? differenceInDays(parseDate(breakEvenDate), firstEntryDate)
        : null;

    return {
        storeName: store.name,
        totalInvestment: roundToDecimals(totalInvestment),
        totalRevenue: roundToDecimals(totalRevenue),
        totalProfit: roundToDecimals(totalProfit),
        roi: roundToDecimals(roi),
        breakEvenDate,
        daysToBreakEven,
    };
};

// ============================================================================
// Store Efficiency Score
// ============================================================================

export interface StoreEfficiency {
    storeName: string;
    efficiencyScore: number; // 0-100
    revenueScore: number;
    profitMarginScore: number;
    consistencyScore: number;
    rank: number;
}

export const calculateStoreEfficiencyScores = (stores: Store[], dateRange: DateRange): StoreEfficiency[] => {
    const storeMetrics = stores.map(store => {
        let totalRevenue = 0;
        let totalProfit = 0;
        const dailyProfits: number[] = [];

        store.entries.forEach(entry => {
            if (isDateInRange(entry.date, dateRange)) {
                const metrics = calculateEntryMetrics(entry, store.commissionPercent);
                totalRevenue += entry.recaudado;
                totalProfit += metrics.restante;
                dailyProfits.push(metrics.restante);
            }
        });

        const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

        // Calculate consistency (coefficient of variation - lower is more consistent)
        const avgProfit = dailyProfits.length > 0
            ? dailyProfits.reduce((sum, p) => sum + p, 0) / dailyProfits.length
            : 0;
        const variance = dailyProfits.length > 0
            ? dailyProfits.reduce((sum, p) => sum + Math.pow(p - avgProfit, 2), 0) / dailyProfits.length
            : 0;
        const stdDev = Math.sqrt(variance);
        const coefficientOfVariation = avgProfit > 0 ? stdDev / avgProfit : 0;

        return {
            storeName: store.name,
            totalRevenue,
            profitMargin,
            coefficientOfVariation,
            entryCount: dailyProfits.length,
        };
    }).filter(m => m.entryCount > 0);

    if (storeMetrics.length === 0) {
        return [];
    }

    // Find max values for normalization
    const maxRevenue = Math.max(...storeMetrics.map(m => m.totalRevenue));
    const maxMargin = Math.max(...storeMetrics.map(m => m.profitMargin));
    const maxCV = Math.max(...storeMetrics.map(m => m.coefficientOfVariation));

    // Calculate scores
    const efficiencyScores = storeMetrics.map(metric => {
        const revenueScore = maxRevenue > 0 ? (metric.totalRevenue / maxRevenue) * 100 : 0;
        const profitMarginScore = maxMargin > 0 ? (metric.profitMargin / maxMargin) * 100 : 0;
        const consistencyScore = maxCV > 0 ? (1 - (metric.coefficientOfVariation / maxCV)) * 100 : 100;

        // Weighted average: 40% revenue, 30% margin, 30% consistency
        const efficiencyScore = (revenueScore * 0.4) + (profitMarginScore * 0.3) + (consistencyScore * 0.3);

        return {
            storeName: metric.storeName,
            efficiencyScore: roundToDecimals(efficiencyScore),
            revenueScore: roundToDecimals(revenueScore),
            profitMarginScore: roundToDecimals(profitMarginScore),
            consistencyScore: roundToDecimals(consistencyScore),
            rank: 0, // Will be set after sorting
        };
    });

    // Sort by efficiency score and assign ranks
    efficiencyScores.sort((a, b) => b.efficiencyScore - a.efficiencyScore);
    efficiencyScores.forEach((score, index) => {
        score.rank = index + 1;
    });

    return efficiencyScores;
};

// ============================================================================
// Cash Flow Timeline
// ============================================================================

export interface CashFlowDataPoint {
    date: string;
    investment: number; // costoPeluches
    revenue: number; // recaudado
    profit: number; // restante
    cumulativeInvestment: number;
    cumulativeProfit: number;
    netCashFlow: number; // cumulativeProfit - cumulativeInvestment
}

export const calculateCashFlowTimeline = (stores: Store[], dateRange: DateRange): CashFlowDataPoint[] => {
    const dailyData = new Map<string, { investment: number; revenue: number; profit: number }>();

    stores.forEach(store => {
        store.entries.forEach(entry => {
            if (isDateInRange(entry.date, dateRange)) {
                const metrics = calculateEntryMetrics(entry, store.commissionPercent);
                const existing = dailyData.get(entry.date) || { investment: 0, revenue: 0, profit: 0 };

                existing.investment += entry.costoPeluches;
                existing.revenue += entry.recaudado;
                existing.profit += metrics.restante;

                dailyData.set(entry.date, existing);
            }
        });
    });

    // Sort by date
    const sortedData = Array.from(dailyData.entries())
        .map(([date, data]) => ({ date, ...data }))
        .sort((a, b) => {
            try {
                return parseDate(a.date).getTime() - parseDate(b.date).getTime();
            } catch {
                return 0;
            }
        });

    // Calculate cumulative values
    let cumulativeInvestment = 0;
    let cumulativeProfit = 0;

    return sortedData.map(day => {
        cumulativeInvestment += day.investment;
        cumulativeProfit += day.profit;

        return {
            date: day.date,
            investment: roundToDecimals(day.investment),
            revenue: roundToDecimals(day.revenue),
            profit: roundToDecimals(day.profit),
            cumulativeInvestment: roundToDecimals(cumulativeInvestment),
            cumulativeProfit: roundToDecimals(cumulativeProfit),
            netCashFlow: roundToDecimals(cumulativeProfit - cumulativeInvestment),
        };
    });
};

// ============================================================================
// Store-to-Store Benchmarking
// ============================================================================

export interface StoreBenchmark {
    storeName: string;
    avgDailyRevenue: number;
    avgDailyProfit: number;
    profitMargin: number;
    vsAverageRevenue: number; // percentage difference from average
    vsAverageProfit: number;
    vsAverageMargin: number;
    isOutlier: boolean;
    outlierType: 'high' | 'low' | null;
}

export const calculateStoreBenchmarks = (stores: Store[], dateRange: DateRange): StoreBenchmark[] => {
    const storeStats = stores.map(store => {
        let totalRevenue = 0;
        let totalProfit = 0;
        let entryCount = 0;

        store.entries.forEach(entry => {
            if (isDateInRange(entry.date, dateRange)) {
                const metrics = calculateEntryMetrics(entry, store.commissionPercent);
                totalRevenue += entry.recaudado;
                totalProfit += metrics.restante;
                entryCount++;
            }
        });

        const avgDailyRevenue = entryCount > 0 ? totalRevenue / entryCount : 0;
        const avgDailyProfit = entryCount > 0 ? totalProfit / entryCount : 0;
        const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

        return {
            storeName: store.name,
            avgDailyRevenue,
            avgDailyProfit,
            profitMargin,
            entryCount,
        };
    }).filter(s => s.entryCount > 0);

    if (storeStats.length === 0) {
        return [];
    }

    // Calculate averages across all stores
    const avgRevenue = storeStats.reduce((sum, s) => sum + s.avgDailyRevenue, 0) / storeStats.length;
    const avgProfit = storeStats.reduce((sum, s) => sum + s.avgDailyProfit, 0) / storeStats.length;
    const avgMargin = storeStats.reduce((sum, s) => sum + s.profitMargin, 0) / storeStats.length;

    // Calculate standard deviations for outlier detection
    const revenueStdDev = Math.sqrt(
        storeStats.reduce((sum, s) => sum + Math.pow(s.avgDailyRevenue - avgRevenue, 2), 0) / storeStats.length
    );

    return storeStats.map(stat => {
        const vsAverageRevenue = avgRevenue > 0 ? ((stat.avgDailyRevenue - avgRevenue) / avgRevenue) * 100 : 0;
        const vsAverageProfit = avgProfit > 0 ? ((stat.avgDailyProfit - avgProfit) / avgProfit) * 100 : 0;
        const vsAverageMargin = avgMargin > 0 ? ((stat.profitMargin - avgMargin) / avgMargin) * 100 : 0;

        // Outlier detection: more than 1.5 standard deviations from mean
        const zScore = revenueStdDev > 0 ? (stat.avgDailyRevenue - avgRevenue) / revenueStdDev : 0;
        const isOutlier = Math.abs(zScore) > 1.5;
        const outlierType = isOutlier ? (zScore > 0 ? 'high' : 'low') : null;

        return {
            storeName: stat.storeName,
            avgDailyRevenue: roundToDecimals(stat.avgDailyRevenue),
            avgDailyProfit: roundToDecimals(stat.avgDailyProfit),
            profitMargin: roundToDecimals(stat.profitMargin),
            vsAverageRevenue: roundToDecimals(vsAverageRevenue),
            vsAverageProfit: roundToDecimals(vsAverageProfit),
            vsAverageMargin: roundToDecimals(vsAverageMargin),
            isOutlier,
            outlierType,
        };
    });
};

// ============================================================================
// Entry Frequency Heatmap
// ============================================================================

export interface HeatmapDay {
    date: string;
    dateObj: Date;
    entryCount: number;
    revenue: number;
    hasEntry: boolean;
}

export const generateEntryFrequencyHeatmap = (stores: Store[], dateRange: DateRange): HeatmapDay[] => {
    const dailyData = new Map<string, { entryCount: number; revenue: number }>();

    stores.forEach(store => {
        store.entries.forEach(entry => {
            if (isDateInRange(entry.date, dateRange)) {
                const existing = dailyData.get(entry.date) || { entryCount: 0, revenue: 0 };
                existing.entryCount++;
                existing.revenue += entry.recaudado;
                dailyData.set(entry.date, existing);
            }
        });
    });

    // Generate all days in range
    const allDays = eachDayOfInterval({ start: dateRange.start, end: dateRange.end });

    return allDays.map(dateObj => {
        const dateStr = dateObj.toLocaleDateString('es-MX', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }).replace(/\//g, '/');

        const data = dailyData.get(dateStr);

        return {
            date: dateStr,
            dateObj,
            entryCount: data?.entryCount || 0,
            revenue: data ? roundToDecimals(data.revenue) : 0,
            hasEntry: !!data,
        };
    });
};

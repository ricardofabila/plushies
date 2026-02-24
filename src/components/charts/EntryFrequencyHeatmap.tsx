import React from 'react';
import { format, startOfMonth, endOfMonth, eachWeekOfInterval, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { es } from 'date-fns/locale';
import { formatCurrency } from '@/utils';
import type { HeatmapDay } from '@/utils/analytics';

interface EntryFrequencyHeatmapProps {
    data: HeatmapDay[];
    dateRange: { start: Date; end: Date };
}

const EntryFrequencyHeatmap: React.FC<EntryFrequencyHeatmapProps> = ({ data, dateRange }) => {
    const dayNames = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];

    // Create a map for quick lookup
    const dataMap = new Map(data.map(d => [d.date, d]));

    // Generate calendar grid
    const weeks = eachWeekOfInterval(
        { start: startOfMonth(dateRange.start), end: endOfMonth(dateRange.end) },
        { weekStartsOn: 0 }
    );

    const getIntensityColor = (entryCount: number, revenue: number): string => {
        if (entryCount === 0) return 'bg-gray-100';
        if (revenue > 1000) return 'bg-primary-600';
        if (revenue > 500) return 'bg-primary-400';
        if (revenue > 200) return 'bg-primary-300';
        return 'bg-primary-200';
    };

    return (
        <div className="space-y-2">
            {/* Day labels */}
            <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map((day, i) => (
                    <div key={i} className="text-center text-xs font-medium text-gray-600">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar grid */}
            <div className="space-y-1">
                {weeks.map((weekStart, weekIndex) => {
                    const days = eachDayOfInterval({
                        start: startOfWeek(weekStart, { weekStartsOn: 0 }),
                        end: endOfWeek(weekStart, { weekStartsOn: 0 }),
                    });

                    return (
                        <div key={weekIndex} className="grid grid-cols-7 gap-1">
                            {days.map((day, dayIndex) => {
                                const dateStr = format(day, 'dd/MM/yyyy', { locale: es });
                                const dayData = dataMap.get(dateStr);
                                const isInRange = day >= dateRange.start && day <= dateRange.end;
                                const isCurrentMonth = day.getMonth() === dateRange.start.getMonth();

                                if (!isInRange || !isCurrentMonth) {
                                    return <div key={dayIndex} className="aspect-square" />;
                                }

                                const intensityColor = dayData
                                    ? getIntensityColor(dayData.entryCount, dayData.revenue)
                                    : 'bg-gray-100';

                                return (
                                    <div
                                        key={dayIndex}
                                        className={`aspect-square rounded ${intensityColor} flex items-center justify-center text-xs font-medium transition-all hover:ring-2 hover:ring-primary-500 cursor-pointer group relative`}
                                        title={dayData ? `${dateStr}: ${formatCurrency(dayData.revenue)} (${dayData.entryCount} entradas)` : dateStr}
                                    >
                                        <span className={dayData?.hasEntry ? 'text-white' : 'text-gray-400'}>
                                            {format(day, 'd')}
                                        </span>

                                        {/* Tooltip */}
                                        {dayData && (
                                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                                                <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                                                    <div>{dateStr}</div>
                                                    <div>{formatCurrency(dayData.revenue)}</div>
                                                    <div>{dayData.entryCount} entradas</div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-600">
                <span>Menos</span>
                <div className="flex gap-1">
                    <div className="w-4 h-4 bg-gray-100 rounded" />
                    <div className="w-4 h-4 bg-primary-200 rounded" />
                    <div className="w-4 h-4 bg-primary-300 rounded" />
                    <div className="w-4 h-4 bg-primary-400 rounded" />
                    <div className="w-4 h-4 bg-primary-600 rounded" />
                </div>
                <span>Más</span>
            </div>
        </div>
    );
};

export default EntryFrequencyHeatmap;

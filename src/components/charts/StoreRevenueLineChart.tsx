import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';
import { formatCurrency, formatDateForDisplay } from '@/utils';
import { useResponsive } from '@/hooks/useResponsive';

interface StoreRevenueData {
    date: string;
    recaudado: number;
    costoPeluches: number;
    restante: number;
}

interface StoreRevenueLineChartProps {
    data: StoreRevenueData[];
    className?: string;
}

const StoreRevenueLineChart: React.FC<StoreRevenueLineChartProps> = ({ data, className = '' }) => {
    const { isMobile, isTablet } = useResponsive();

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-2 sm:p-3 border border-gray-200 rounded-lg shadow-lg max-w-xs">
                    <p className="font-medium text-gray-900 mb-1 sm:mb-2 text-xs sm:text-sm">
                        {formatDateForDisplay(label)}
                    </p>
                    {payload.map((entry: any, index: number) => (
                        <p key={index} className="text-xs sm:text-sm" style={{ color: entry.color }}>
                            {entry.name}: {formatCurrency(entry.value)}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    // Handle empty data
    if (!data || data.length === 0) {
        return (
            <div className={`w-full h-64 sm:h-80 flex items-center justify-center ${className}`}>
                <div className="text-center text-gray-500">
                    <div className="text-2xl mb-2">📈</div>
                    <p className="text-sm sm:text-base">No hay datos para mostrar</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`w-full h-64 sm:h-80 min-h-[256px] sm:min-h-[320px] ${className}`}>
            <ResponsiveContainer width="100%" height="100%" minWidth={280} minHeight={256}>
                <LineChart
                    data={data}
                    margin={{
                        top: 5,
                        right: isMobile ? 10 : 30,
                        left: isMobile ? 10 : 20,
                        bottom: isMobile ? 50 : 5
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                        dataKey="date"
                        stroke="#666"
                        fontSize={isMobile ? 10 : 12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => {
                            const formatted = formatDateForDisplay(value);
                            return isMobile ? formatted.split('/').slice(0, 2).join('/') : formatted;
                        }}
                        interval={isMobile ? 'preserveStartEnd' : 0}
                        angle={isMobile ? -45 : 0}
                        textAnchor={isMobile ? 'end' : 'middle'}
                        height={isMobile ? 50 : 30}
                    />
                    <YAxis
                        stroke="#666"
                        fontSize={isMobile ? 10 : 12}
                        tickLine={false}
                        axisLine={false}
                        width={isMobile ? 40 : 60}
                        tickFormatter={(value) => {
                            if (value >= 1000) {
                                return `${(value / 1000).toFixed(0)}k`;
                            } else if (value >= 100) {
                                return `${Math.round(value)}`;
                            } else if (value > 0) {
                                return `${value.toFixed(0)}`;
                            }
                            return '$0';
                        }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                        wrapperStyle={{ fontSize: isMobile ? '12px' : '14px' }}
                        iconSize={isMobile ? 12 : 18}
                    />
                    <Line
                        type="monotone"
                        dataKey="recaudado"
                        stroke="#ed7f4a"
                        strokeWidth={isMobile ? 2 : 3}
                        dot={{ fill: '#ed7f4a', strokeWidth: 2, r: isMobile ? 3 : 4 }}
                        activeDot={{ r: isMobile ? 5 : 6, stroke: '#ed7f4a', strokeWidth: 2 }}
                        name="Recaudado"
                    />
                    <Line
                        type="monotone"
                        dataKey="costoPeluches"
                        stroke="#f59e0b"
                        strokeWidth={isMobile ? 2 : 3}
                        dot={{ fill: '#f59e0b', strokeWidth: 2, r: isMobile ? 3 : 4 }}
                        activeDot={{ r: isMobile ? 5 : 6, stroke: '#f59e0b', strokeWidth: 2 }}
                        name="Costo Peluches"
                    />
                    <Line
                        type="monotone"
                        dataKey="restante"
                        stroke="#22c55e"
                        strokeWidth={isMobile ? 2 : 3}
                        dot={{ fill: '#22c55e', strokeWidth: 2, r: isMobile ? 3 : 4 }}
                        activeDot={{ r: isMobile ? 5 : 6, stroke: '#22c55e', strokeWidth: 2 }}
                        name="Restante"
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default StoreRevenueLineChart;
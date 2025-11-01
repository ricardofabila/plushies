import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';
import { formatCurrency } from '@/utils';
import { useResponsive } from '@/hooks/useResponsive';

interface StoreData {
    name: string;
    restante: number;
    color?: string;
}

interface StoreComparisonBarProps {
    data: StoreData[];
    className?: string;
}

const StoreComparisonBar: React.FC<StoreComparisonBarProps> = ({ data, className = '' }) => {
    const { isMobile } = useResponsive();

    // Color palette for stores
    const colors = [
        '#ed7f4a', // primary-500
        '#22c55e', // success-500
        '#f59e0b', // warning-500
        '#d946ef', // accent-500
        '#0ea5e9', // secondary-500
        '#ef4444', // error-500
    ];

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-2 sm:p-3 border border-gray-200 rounded-lg shadow-lg max-w-xs">
                    <p className="font-medium text-gray-900 mb-1 text-xs sm:text-sm">{label}</p>
                    <p className="text-xs sm:text-sm text-success-600">
                        Restante: {formatCurrency(payload[0].value)}
                    </p>
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
                    <div className="text-2xl mb-2">📊</div>
                    <p className="text-sm sm:text-base">No hay datos para mostrar</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`w-full h-64 sm:h-80 min-h-[256px] sm:min-h-[320px] ${className}`}>
            <ResponsiveContainer width="100%" height="100%" minWidth={280} minHeight={256}>
                <BarChart
                    data={data}
                    margin={{
                        top: 20,
                        right: isMobile ? 10 : 30,
                        left: isMobile ? 10 : 20,
                        bottom: isMobile ? 80 : 5
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                        dataKey="name"
                        stroke="#666"
                        fontSize={isMobile ? 10 : 12}
                        tickLine={false}
                        axisLine={false}
                        interval={0}
                        angle={isMobile ? -45 : 0}
                        textAnchor={isMobile ? 'end' : 'middle'}
                        height={isMobile ? 80 : 30}
                        tick={{ fontSize: isMobile ? 10 : 12 }}
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
                    <Bar
                        dataKey="restante"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={isMobile ? 40 : 60}
                    >
                        {data.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={entry.color || colors[index % colors.length]}
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default StoreComparisonBar;
import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';
import { formatCurrency, formatDateForDisplay } from '@/utils';
import { useResponsive } from '@/hooks/useResponsive';

interface CommissionProfitData {
    date: string;
    comision: number;
    restante: number;
}

interface CommissionVsProfitBarProps {
    data: CommissionProfitData[];
    className?: string;
}

const CommissionVsProfitBar: React.FC<CommissionVsProfitBarProps> = ({ data, className = '' }) => {
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
                        dataKey="date"
                        stroke="#666"
                        fontSize={isMobile ? 10 : 12}
                        tickLine={false}
                        axisLine={false}
                        interval={isMobile ? 'preserveStartEnd' : 0}
                        angle={isMobile ? -45 : 0}
                        textAnchor={isMobile ? 'end' : 'middle'}
                        height={isMobile ? 80 : 30}
                        tickFormatter={(value) => {
                            const formatted = formatDateForDisplay(value);
                            return isMobile ? formatted.split('/').slice(0, 2).join('/') : formatted;
                        }}
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
                    <Bar
                        dataKey="comision"
                        fill="#d946ef"
                        radius={[4, 4, 0, 0]}
                        name="Comisión"
                        maxBarSize={isMobile ? 30 : 40}
                    />
                    <Bar
                        dataKey="restante"
                        fill="#22c55e"
                        radius={[4, 4, 0, 0]}
                        name="Restante"
                        maxBarSize={isMobile ? 30 : 40}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default CommissionVsProfitBar;
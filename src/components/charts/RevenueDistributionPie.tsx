import React from 'react';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend
} from 'recharts';
import { formatCurrency } from '@/utils';
import { useResponsive } from '@/hooks/useResponsive';

interface PieData {
    name: string;
    value: number;
    color?: string;
}

interface RevenueDistributionPieProps {
    data: PieData[];
    className?: string;
}

const RevenueDistributionPie: React.FC<RevenueDistributionPieProps> = ({ data, className = '' }) => {
    const { isMobile, isTablet } = useResponsive();

    // Color palette for stores
    const colors = [
        '#ed7f4a', // primary-500
        '#22c55e', // success-500
        '#f59e0b', // warning-500
        '#d946ef', // accent-500
        '#0ea5e9', // secondary-500
        '#ef4444', // error-500
    ];

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0];
            const total = payload[0].payload.payload?.total || 0;
            const percentage = total > 0 ? ((data.value / total) * 100).toFixed(1) : 0;

            return (
                <div className="bg-white p-2 sm:p-3 border border-gray-200 rounded-lg shadow-lg max-w-xs">
                    <p className="font-medium text-gray-900 mb-1 text-xs sm:text-sm">{data.name}</p>
                    <p className="text-xs sm:text-sm text-primary-600">
                        Recaudado: {formatCurrency(data.value)}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500">
                        {percentage}% del total
                    </p>
                </div>
            );
        }
        return null;
    };

    const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
        if (percent < 0.05) return null; // Don't show labels for slices smaller than 5%

        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text
                x={x}
                y={y}
                fill="white"
                textAnchor={x > cx ? 'start' : 'end'}
                dominantBaseline="central"
                fontSize={isMobile ? 10 : 12}
                fontWeight="bold"
            >
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    // Handle empty data
    if (!data || data.length === 0) {
        return (
            <div className={`w-full h-64 sm:h-80 flex items-center justify-center ${className}`}>
                <div className="text-center text-gray-500">
                    <div className="text-2xl mb-2">🥧</div>
                    <p className="text-sm sm:text-base">No hay datos para mostrar</p>
                </div>
            </div>
        );
    }

    // Calculate total for percentage calculation
    const total = data.reduce((sum, item) => sum + item.value, 0);
    const dataWithTotal = data.map(item => ({ ...item, total }));

    return (
        <div className={`w-full h-64 sm:h-80 min-h-[256px] sm:min-h-[320px] ${className}`}>
            <ResponsiveContainer width="100%" height="100%" minWidth={280} minHeight={256}>
                <PieChart>
                    <Pie
                        data={dataWithTotal}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={!isMobile ? CustomLabel : false}
                        outerRadius={isMobile ? 80 : 100}
                        fill="#8884d8"
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={entry.color || colors[index % colors.length]}
                            />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                        verticalAlign="bottom"
                        height={isMobile ? 50 : 36}
                        wrapperStyle={{ fontSize: isMobile ? '12px' : '14px' }}
                        formatter={(value, entry) => (
                            <span style={{ color: entry.color }}>{value}</span>
                        )}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export default RevenueDistributionPie;
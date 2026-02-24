import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency, formatDateForDisplay } from '@/utils';
import type { MovingAverageDataPoint } from '@/utils/analytics';

interface MovingAverageChartProps {
    data: MovingAverageDataPoint[];
}

const MovingAverageChart: React.FC<MovingAverageChartProps> = ({ data }) => {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                    dataKey="date"
                    tick={{ fill: '#6b7280', fontSize: 11 }}
                    tickFormatter={(value) => formatDateForDisplay(value).split('/')[0]}
                />
                <YAxis
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                    contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        padding: '12px',
                    }}
                    labelFormatter={(label) => formatDateForDisplay(label)}
                    formatter={(value: any, name: string) => {
                        if (value === null || value === undefined) return ['N/A', name];
                        const numValue = typeof value === 'number' ? value : 0;
                        if (name === 'actualRevenue') return [formatCurrency(numValue), 'Ingresos'];
                        if (name === 'ma7') return [formatCurrency(numValue), 'MA 7 días'];
                        if (name === 'ma30') return [formatCurrency(numValue), 'MA 30 días'];
                        return [formatCurrency(numValue), name];
                    }}
                />
                <Legend
                    wrapperStyle={{ paddingTop: '20px' }}
                    formatter={(value) => {
                        if (value === 'actualRevenue') return 'Ingresos Reales';
                        if (value === 'ma7') return 'Promedio 7 días';
                        if (value === 'ma30') return 'Promedio 30 días';
                        return value;
                    }}
                />
                <Line
                    type="monotone"
                    dataKey="actualRevenue"
                    stroke="#94a3b8"
                    strokeWidth={1}
                    dot={false}
                    name="actualRevenue"
                />
                <Line
                    type="monotone"
                    dataKey="ma7"
                    stroke="#22c55e"
                    strokeWidth={2}
                    dot={false}
                    name="ma7"
                    connectNulls
                />
                <Line
                    type="monotone"
                    dataKey="ma30"
                    stroke="#ed7f4a"
                    strokeWidth={2}
                    dot={false}
                    name="ma30"
                    connectNulls
                />
            </LineChart>
        </ResponsiveContainer>
    );
};

export default MovingAverageChart;

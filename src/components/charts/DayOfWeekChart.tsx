import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { formatCurrency } from '@/utils';
import type { DayOfWeekPerformance } from '@/utils/analytics';

interface DayOfWeekChartProps {
    data: DayOfWeekPerformance[];
}

const DayOfWeekChart: React.FC<DayOfWeekChartProps> = ({ data }) => {
    const colors = ['#ed7f4a', '#22c55e', '#f59e0b', '#d946ef', '#0ea5e9', '#ef4444', '#8b5cf6'];

    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                    dataKey="dayName"
                    tick={{ fill: '#6b7280', fontSize: 12 }}
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
                    formatter={(value: number, name: string) => {
                        if (name === 'totalRevenue') return [formatCurrency(value), 'Ingresos'];
                        if (name === 'avgRevenue') return [formatCurrency(value), 'Promedio'];
                        if (name === 'entryCount') return [value, 'Entradas'];
                        return [value, name];
                    }}
                />
                <Bar dataKey="totalRevenue" radius={[8, 8, 0, 0]}>
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors[entry.dayNumber]} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
};

export default DayOfWeekChart;

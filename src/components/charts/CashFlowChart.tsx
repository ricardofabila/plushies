import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { formatCurrency, formatDateForDisplay } from '@/utils';
import type { CashFlowDataPoint } from '@/utils/analytics';

interface CashFlowChartProps {
    data: CashFlowDataPoint[];
}

const CashFlowChart: React.FC<CashFlowChartProps> = ({ data }) => {
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
                    formatter={(value: number, name: string) => {
                        if (name === 'cumulativeInvestment') return [formatCurrency(value), 'Inversión Acumulada'];
                        if (name === 'cumulativeProfit') return [formatCurrency(value), 'Ganancia Acumulada'];
                        if (name === 'netCashFlow') return [formatCurrency(value), 'Flujo Neto'];
                        return [formatCurrency(value), name];
                    }}
                />
                <Legend
                    wrapperStyle={{ paddingTop: '20px' }}
                    formatter={(value) => {
                        if (value === 'cumulativeInvestment') return 'Inversión Acumulada';
                        if (value === 'cumulativeProfit') return 'Ganancia Acumulada';
                        if (value === 'netCashFlow') return 'Flujo Neto';
                        return value;
                    }}
                />
                <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="3 3" />
                <Line
                    type="monotone"
                    dataKey="cumulativeInvestment"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={false}
                    name="cumulativeInvestment"
                />
                <Line
                    type="monotone"
                    dataKey="cumulativeProfit"
                    stroke="#22c55e"
                    strokeWidth={2}
                    dot={false}
                    name="cumulativeProfit"
                />
                <Line
                    type="monotone"
                    dataKey="netCashFlow"
                    stroke="#ed7f4a"
                    strokeWidth={3}
                    dot={false}
                    name="netCashFlow"
                />
            </LineChart>
        </ResponsiveContainer>
    );
};

export default CashFlowChart;

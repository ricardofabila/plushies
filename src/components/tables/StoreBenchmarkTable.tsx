import React from 'react';
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle } from 'lucide-react';
import { formatCurrency } from '@/utils';
import type { StoreBenchmark } from '@/utils/analytics';

interface StoreBenchmarkTableProps {
    data: StoreBenchmark[];
}

const StoreBenchmarkTable: React.FC<StoreBenchmarkTableProps> = ({ data }) => {
    const getPercentageDisplay = (value: number) => {
        const isPositive = value > 0;
        const Icon = isPositive ? TrendingUp : TrendingDown;
        const colorClass = isPositive ? 'text-success-600' : 'text-error-600';

        return (
            <div className={`flex items-center gap-1 justify-center ${colorClass}`}>
                <Icon className="w-3 h-3" />
                <span className="text-sm font-medium">
                    {isPositive ? '+' : ''}{value.toFixed(1)}%
                </span>
            </div>
        );
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Tienda</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Ingreso Diario Prom.</th>
                        <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">vs Promedio</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Ganancia Diaria Prom.</th>
                        <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">vs Promedio</th>
                        <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Margen</th>
                        <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Estado</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((store) => (
                        <tr
                            key={store.storeName}
                            className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${store.isOutlier && store.outlierType === 'high' ? 'bg-success-50/30' : ''
                                } ${store.isOutlier && store.outlierType === 'low' ? 'bg-error-50/30' : ''
                                }`}
                        >
                            <td className="py-3 px-4">
                                <span className="font-medium text-gray-900">{store.storeName}</span>
                            </td>
                            <td className="py-3 px-4 text-right">
                                <span className="text-gray-900">{formatCurrency(store.avgDailyRevenue)}</span>
                            </td>
                            <td className="py-3 px-4">
                                {getPercentageDisplay(store.vsAverageRevenue)}
                            </td>
                            <td className="py-3 px-4 text-right">
                                <span className="text-gray-900">{formatCurrency(store.avgDailyProfit)}</span>
                            </td>
                            <td className="py-3 px-4">
                                {getPercentageDisplay(store.vsAverageProfit)}
                            </td>
                            <td className="py-3 px-4 text-center">
                                <span className="text-sm font-medium text-gray-700">
                                    {store.profitMargin.toFixed(1)}%
                                </span>
                            </td>
                            <td className="py-3 px-4">
                                <div className="flex items-center justify-center gap-1">
                                    {store.isOutlier ? (
                                        store.outlierType === 'high' ? (
                                            <>
                                                <CheckCircle className="w-4 h-4 text-success-600" />
                                                <span className="text-xs text-success-600 font-medium">Top</span>
                                            </>
                                        ) : (
                                            <>
                                                <AlertCircle className="w-4 h-4 text-error-600" />
                                                <span className="text-xs text-error-600 font-medium">Bajo</span>
                                            </>
                                        )
                                    ) : (
                                        <span className="text-xs text-gray-500">Normal</span>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default StoreBenchmarkTable;

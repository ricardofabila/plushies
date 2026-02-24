import React from 'react';
import { TrendingUp, Calendar, DollarSign } from 'lucide-react';
import { formatCurrency, formatDateForDisplay } from '@/utils';
import type { StoreROI } from '@/utils/analytics';

interface StoreROITableProps {
    data: StoreROI[];
}

const StoreROITable: React.FC<StoreROITableProps> = ({ data }) => {
    const getROIColor = (roi: number): string => {
        if (roi >= 100) return 'text-success-600 bg-success-50';
        if (roi >= 50) return 'text-primary-600 bg-primary-50';
        if (roi >= 0) return 'text-warning-600 bg-warning-50';
        return 'text-error-600 bg-error-50';
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Tienda</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                            <div className="flex items-center justify-end gap-1">
                                <DollarSign className="w-4 h-4" />
                                <span>Inversión</span>
                            </div>
                        </th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Ingresos</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Ganancia</th>
                        <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                            <div className="flex items-center justify-center gap-1">
                                <TrendingUp className="w-4 h-4" />
                                <span>ROI</span>
                            </div>
                        </th>
                        <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                            <div className="flex items-center justify-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>Break-Even</span>
                            </div>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((store) => (
                        <tr
                            key={store.storeName}
                            className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                        >
                            <td className="py-3 px-4">
                                <span className="font-medium text-gray-900">{store.storeName}</span>
                            </td>
                            <td className="py-3 px-4 text-right">
                                <span className="text-gray-900">{formatCurrency(store.totalInvestment)}</span>
                            </td>
                            <td className="py-3 px-4 text-right">
                                <span className="text-gray-900">{formatCurrency(store.totalRevenue)}</span>
                            </td>
                            <td className="py-3 px-4 text-right">
                                <span className="text-gray-900 font-medium">{formatCurrency(store.totalProfit)}</span>
                            </td>
                            <td className="py-3 px-4">
                                <div className="flex justify-center">
                                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getROIColor(store.roi)}`}>
                                        {store.roi.toFixed(1)}%
                                    </span>
                                </div>
                            </td>
                            <td className="py-3 px-4 text-center">
                                {store.breakEvenDate ? (
                                    <div className="space-y-1">
                                        <div className="text-sm text-gray-900">
                                            {formatDateForDisplay(store.breakEvenDate)}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {store.daysToBreakEven} días
                                        </div>
                                    </div>
                                ) : (
                                    <span className="text-sm text-gray-400">Pendiente</span>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default StoreROITable;

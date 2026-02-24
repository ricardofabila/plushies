import React from 'react';
import { Calendar, TrendingUp, Store } from 'lucide-react';
import { formatCurrency, formatDateForDisplay } from '@/utils';
import type { PeakSalesDay } from '@/utils/analytics';

interface PeakSalesDaysProps {
    data: PeakSalesDay[];
}

const PeakSalesDays: React.FC<PeakSalesDaysProps> = ({ data }) => {
    if (data.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                No hay datos suficientes para mostrar días pico
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {data.map((day, index) => (
                <div
                    key={day.date}
                    className={`p-4 rounded-lg border transition-all hover:shadow-md ${index === 0
                            ? 'bg-warning-50 border-warning-200'
                            : 'bg-white border-gray-200'
                        }`}
                >
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                {index === 0 && (
                                    <span className="text-lg">🏆</span>
                                )}
                                <Calendar className="w-4 h-4 text-gray-600" />
                                <span className="font-semibold text-gray-900">
                                    {formatDateForDisplay(day.date)}
                                </span>
                                <span className="text-xs text-gray-500">
                                    #{index + 1}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-2">
                                <div>
                                    <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
                                        <TrendingUp className="w-3 h-3" />
                                        <span>Ingresos</span>
                                    </div>
                                    <div className="text-lg font-bold text-primary-600">
                                        {formatCurrency(day.revenue)}
                                    </div>
                                </div>
                                <div>
                                    <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
                                        <TrendingUp className="w-3 h-3" />
                                        <span>Ganancia</span>
                                    </div>
                                    <div className="text-lg font-bold text-success-600">
                                        {formatCurrency(day.profit)}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-1 text-xs text-gray-600">
                                <Store className="w-3 h-3" />
                                <span>{day.stores.join(', ')}</span>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default PeakSalesDays;

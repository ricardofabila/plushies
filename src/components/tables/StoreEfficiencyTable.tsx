import React from 'react';
import { Trophy, TrendingUp, Target, Activity } from 'lucide-react';
import type { StoreEfficiency } from '@/utils/analytics';

interface StoreEfficiencyTableProps {
    data: StoreEfficiency[];
}

const StoreEfficiencyTable: React.FC<StoreEfficiencyTableProps> = ({ data }) => {
    const getScoreColor = (score: number): string => {
        if (score >= 80) return 'text-success-600 bg-success-50';
        if (score >= 60) return 'text-primary-600 bg-primary-50';
        if (score >= 40) return 'text-warning-600 bg-warning-50';
        return 'text-error-600 bg-error-50';
    };

    const getRankBadge = (rank: number) => {
        if (rank === 1) return <Trophy className="w-4 h-4 text-warning-500" />;
        return <span className="text-sm font-semibold text-gray-600">#{rank}</span>;
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Rank</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Tienda</th>
                        <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                            <div className="flex items-center justify-center gap-1">
                                <Target className="w-4 h-4" />
                                <span>Score</span>
                            </div>
                        </th>
                        <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                            <div className="flex items-center justify-center gap-1">
                                <TrendingUp className="w-4 h-4" />
                                <span>Ingresos</span>
                            </div>
                        </th>
                        <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                            <div className="flex items-center justify-center gap-1">
                                <Activity className="w-4 h-4" />
                                <span>Margen</span>
                            </div>
                        </th>
                        <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                            <div className="flex items-center justify-center gap-1">
                                <Activity className="w-4 h-4" />
                                <span>Consistencia</span>
                            </div>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((store, index) => (
                        <tr
                            key={store.storeName}
                            className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${index === 0 ? 'bg-warning-50/30' : ''
                                }`}
                        >
                            <td className="py-3 px-4">
                                <div className="flex items-center justify-center">
                                    {getRankBadge(store.rank)}
                                </div>
                            </td>
                            <td className="py-3 px-4">
                                <span className="font-medium text-gray-900">{store.storeName}</span>
                            </td>
                            <td className="py-3 px-4">
                                <div className="flex justify-center">
                                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getScoreColor(store.efficiencyScore)}`}>
                                        {store.efficiencyScore.toFixed(0)}
                                    </span>
                                </div>
                            </td>
                            <td className="py-3 px-4 text-center">
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-primary-500 h-2 rounded-full transition-all"
                                        style={{ width: `${store.revenueScore}%` }}
                                    />
                                </div>
                                <span className="text-xs text-gray-500 mt-1">{store.revenueScore.toFixed(0)}%</span>
                            </td>
                            <td className="py-3 px-4 text-center">
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-success-500 h-2 rounded-full transition-all"
                                        style={{ width: `${store.profitMarginScore}%` }}
                                    />
                                </div>
                                <span className="text-xs text-gray-500 mt-1">{store.profitMarginScore.toFixed(0)}%</span>
                            </td>
                            <td className="py-3 px-4 text-center">
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-accent-500 h-2 rounded-full transition-all"
                                        style={{ width: `${store.consistencyScore}%` }}
                                    />
                                </div>
                                <span className="text-xs text-gray-500 mt-1">{store.consistencyScore.toFixed(0)}%</span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default StoreEfficiencyTable;

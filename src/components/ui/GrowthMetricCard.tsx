import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatCurrency } from '@/utils';
import type { GrowthMetrics } from '@/utils/analytics';

interface GrowthMetricCardProps {
    metrics: GrowthMetrics;
}

const GrowthMetricCard: React.FC<GrowthMetricCardProps> = ({ metrics }) => {
    const isPositive = metrics.growthRate > 0;
    const isNeutral = metrics.growthRate === 0;

    const Icon = isNeutral ? Minus : isPositive ? TrendingUp : TrendingDown;
    const colorClass = isNeutral
        ? 'text-gray-500 bg-gray-100'
        : isPositive
            ? 'text-success-600 bg-success-100'
            : 'text-error-600 bg-error-100';

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">{metrics.label}</h3>
                <div className={`p-2 rounded-full ${colorClass}`}>
                    <Icon className="w-4 h-4" />
                </div>
            </div>

            <div className="space-y-1">
                <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-gray-900">
                        {isPositive ? '+' : ''}{metrics.growthRate.toFixed(1)}%
                    </span>
                    <span className="text-sm text-gray-500">
                        {formatCurrency(Math.abs(metrics.growthAmount))}
                    </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>Actual: {formatCurrency(metrics.current)}</span>
                    <span>•</span>
                    <span>Anterior: {formatCurrency(metrics.previous)}</span>
                </div>
            </div>
        </div>
    );
};

export default GrowthMetricCard;

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { LucideIcon } from 'lucide-react';

interface KPICardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: LucideIcon;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    className?: string;
    valueClassName?: string;
}

const KPICard: React.FC<KPICardProps> = ({
    title,
    value,
    subtitle,
    icon: Icon,
    trend,
    className = '',
    valueClassName = '',
}) => {
    return (
        <Card className={`shadow-soft hover:shadow-cozy transition-shadow duration-200 bg-white ${className}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-neutral-600">
                    {title}
                </CardTitle>
                <Icon className="h-4 w-4 text-primary-500" />
            </CardHeader>
            <CardContent>
                <div className={`text-2xl font-bold text-primary-800 ${valueClassName}`}>
                    {value}
                </div>

                {subtitle && (
                    <p className="text-xs text-neutral-500 mt-1">
                        {subtitle}
                    </p>
                )}

                {trend && (
                    <div className="flex items-center mt-2">
                        <span
                            className={`text-xs font-medium ${trend.isPositive ? 'text-success-600' : 'text-error-600'
                                }`}
                        >
                            {trend.isPositive ? '+' : ''}{trend.value}%
                        </span>
                        <span className="text-xs text-neutral-500 ml-1">
                            vs período anterior
                        </span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default KPICard;
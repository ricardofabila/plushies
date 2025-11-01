import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/utils';
import { ChevronUp, ChevronDown, Store } from 'lucide-react';
import type { Store as StoreType } from '@/types';

interface StoreSummaryData {
    store: StoreType;
    totalRecaudado: number;
    totalGanancia: number;
    totalComision: number;
    totalRestante: number;
    profitMargin: number;
    entryCount: number;
}

interface StoresSummaryTableProps {
    data: StoreSummaryData[];
    className?: string;
}

type SortField = 'name' | 'totalRecaudado' | 'totalGanancia' | 'totalComision' | 'totalRestante' | 'profitMargin' | 'entryCount';
type SortDirection = 'asc' | 'desc';

const StoresSummaryTable: React.FC<StoresSummaryTableProps> = ({ data, className = '' }) => {
    const [sortField, setSortField] = useState<SortField>('totalRestante');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('desc');
        }
    };

    const sortedData = [...data].sort((a, b) => {
        let aValue: any;
        let bValue: any;

        switch (sortField) {
            case 'name':
                aValue = a.store.name.toLowerCase();
                bValue = b.store.name.toLowerCase();
                break;
            default:
                aValue = a[sortField];
                bValue = b[sortField];
        }

        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });

    const SortButton: React.FC<{ field: SortField; children: React.ReactNode }> = ({ field, children }) => (
        <Button
            variant="ghost"
            size="sm"
            onClick={() => handleSort(field)}
            className="h-auto p-1 font-medium text-left justify-start hover:bg-primary-50"
        >
            <span className="flex items-center gap-1">
                {children}
                {sortField === field && (
                    sortDirection === 'asc' ?
                        <ChevronUp className="w-3 h-3" /> :
                        <ChevronDown className="w-3 h-3" />
                )}
            </span>
        </Button>
    );

    if (data.length === 0) {
        return (
            <Card className={`shadow-soft bg-white ${className}`}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        🏪 Resumen por Tienda
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8">
                        <Store className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No hay datos para mostrar</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={`shadow-soft bg-white ${className}`}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    🏪 Resumen por Tienda
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="text-left py-3 px-2">
                                    <SortButton field="name">Tienda</SortButton>
                                </th>
                                <th className="text-right py-3 px-2">
                                    <SortButton field="totalRecaudado">Recaudado</SortButton>
                                </th>
                                <th className="text-right py-3 px-2">
                                    <SortButton field="totalGanancia">Ganancia</SortButton>
                                </th>
                                <th className="text-right py-3 px-2">
                                    <SortButton field="totalComision">Comisión</SortButton>
                                </th>
                                <th className="text-right py-3 px-2">
                                    <SortButton field="totalRestante">Restante</SortButton>
                                </th>
                                <th className="text-right py-3 px-2">
                                    <SortButton field="profitMargin">Margen</SortButton>
                                </th>
                                <th className="text-right py-3 px-2">
                                    <SortButton field="entryCount">Entradas</SortButton>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedData.map((item, index) => (
                                <tr
                                    key={item.store.id}
                                    className={`border-b border-gray-100 hover:bg-primary-25 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                                        }`}
                                >
                                    <td className="py-3 px-2">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-3 h-3 rounded-full"
                                                style={{
                                                    backgroundColor: item.store.color || '#ed7f4a'
                                                }}
                                            />
                                            <span className="font-medium text-gray-900">
                                                {item.store.name}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                ({item.store.commissionPercent}%)
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-3 px-2 text-right font-medium text-primary-700">
                                        {formatCurrency(item.totalRecaudado)}
                                    </td>
                                    <td className="py-3 px-2 text-right font-medium text-success-600">
                                        {formatCurrency(item.totalGanancia)}
                                    </td>
                                    <td className="py-3 px-2 text-right font-medium text-warning-600">
                                        {formatCurrency(item.totalComision)}
                                    </td>
                                    <td className="py-3 px-2 text-right font-bold text-accent-600">
                                        {formatCurrency(item.totalRestante)}
                                    </td>
                                    <td className="py-3 px-2 text-right">
                                        <span className={`font-medium ${item.profitMargin >= 20 ? 'text-success-600' :
                                            item.profitMargin >= 10 ? 'text-warning-600' :
                                                'text-error-600'
                                            }`}>
                                            {item.profitMargin.toFixed(1)}%
                                        </span>
                                    </td>
                                    <td className="py-3 px-2 text-right text-gray-600">
                                        {item.entryCount}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        {/* Totals Row */}
                        <tfoot>
                            <tr className="border-t-2 border-primary-200 bg-primary-50 font-bold">
                                <td className="py-3 px-2 text-primary-800">
                                    Total ({data.length} tiendas)
                                </td>
                                <td className="py-3 px-2 text-right text-primary-700">
                                    {formatCurrency(data.reduce((sum, item) => sum + item.totalRecaudado, 0))}
                                </td>
                                <td className="py-3 px-2 text-right text-success-600">
                                    {formatCurrency(data.reduce((sum, item) => sum + item.totalGanancia, 0))}
                                </td>
                                <td className="py-3 px-2 text-right text-warning-600">
                                    {formatCurrency(data.reduce((sum, item) => sum + item.totalComision, 0))}
                                </td>
                                <td className="py-3 px-2 text-right text-accent-600">
                                    {formatCurrency(data.reduce((sum, item) => sum + item.totalRestante, 0))}
                                </td>
                                <td className="py-3 px-2 text-right text-gray-600">
                                    {(() => {
                                        const totalRecaudado = data.reduce((sum, item) => sum + item.totalRecaudado, 0);
                                        const totalRestante = data.reduce((sum, item) => sum + item.totalRestante, 0);
                                        const overallMargin = totalRecaudado > 0 ? (totalRestante / totalRecaudado) * 100 : 0;
                                        return `${overallMargin.toFixed(1)}%`;
                                    })()}
                                </td>
                                <td className="py-3 px-2 text-right text-gray-600">
                                    {data.reduce((sum, item) => sum + item.entryCount, 0)}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
};

export default StoresSummaryTable;
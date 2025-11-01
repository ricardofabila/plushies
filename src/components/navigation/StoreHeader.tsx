import React from 'react';
import { Store as StoreIcon, Percent, Calendar, TrendingUp, TrendingDown, Download } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/contexts/ToastContext';
import { exportStoreToCSV, generateCSVFilename, downloadCSV } from '@/lib/export';
import { formatDateForDisplay } from '@/utils';
import type { Store } from '@/types';

interface StoreHeaderProps {
    store: Store;
    bestDay?: { date: string; restante: number };
    worstDay?: { date: string; restante: number };
}

const StoreHeader: React.FC<StoreHeaderProps> = ({ store, bestDay, worstDay }) => {
    const { success, error } = useToast();

    const handleExportCSV = () => {
        try {
            if (store.entries.length === 0) {
                error('No hay datos para exportar', 'Esta tienda no tiene entradas registradas.');
                return;
            }

            const csvContent = exportStoreToCSV(store);
            const filename = generateCSVFilename(store.name);
            downloadCSV(csvContent, filename);

            success('CSV exportado', `Datos de ${store.name} exportados exitosamente.`);
        } catch (err) {
            console.error('CSV export error:', err);
            error('Error al exportar', 'No se pudo exportar el archivo CSV.');
        }
    };

    return (
        <div className="space-y-4">
            {/* Store Title and Basic Info */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="p-3 bg-cute-pink/20 rounded-xl">
                        <StoreIcon className="h-8 w-8 text-cute-pink" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-primary-800">
                            {store.name}
                        </h1>
                        <div className="flex items-center space-x-2 text-neutral-600">
                            <Percent className="h-4 w-4" />
                            <span>Comisión: {store.commissionPercent}%</span>
                        </div>
                    </div>
                </div>

                {/* Export CSV Button */}
                <Button
                    onClick={handleExportCSV}
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-2 border-cute-pink text-cute-pink hover:bg-cute-pink hover:text-white transition-colors"
                >
                    <Download className="h-4 w-4" />
                    <span>Exportar CSV</span>
                </Button>
            </div>

            {/* Best/Worst Day Cards */}
            {(bestDay || worstDay) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {bestDay && (
                        <Card className="shadow-soft hover:shadow-cozy transition-shadow duration-200 border-success-200 bg-success-50/50">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="flex items-center space-x-2 text-success-700 mb-1">
                                            <TrendingUp className="h-4 w-4" />
                                            <span className="text-sm font-medium">Mejor día</span>
                                        </div>
                                        <div className="text-lg font-bold text-success-800">
                                            ${bestDay.restante.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                        </div>
                                        <div className="flex items-center space-x-1 text-success-600 text-sm">
                                            <Calendar className="h-3 w-3" />
                                            <span>{formatDateForDisplay(bestDay.date)}</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {worstDay && (
                        <Card className="shadow-soft hover:shadow-cozy transition-shadow duration-200 border-warning-200 bg-warning-50/50">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="flex items-center space-x-2 text-warning-700 mb-1">
                                            <TrendingDown className="h-4 w-4" />
                                            <span className="text-sm font-medium">Día más bajo</span>
                                        </div>
                                        <div className="text-lg font-bold text-warning-800">
                                            ${worstDay.restante.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                        </div>
                                        <div className="flex items-center space-x-1 text-warning-600 text-sm">
                                            <Calendar className="h-3 w-3" />
                                            <span>{formatDateForDisplay(worstDay.date)}</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}
        </div>
    );
};

export default StoreHeader;
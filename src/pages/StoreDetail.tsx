import React from 'react';
import { useParams } from 'react-router-dom';
import { DollarSign, TrendingUp, Percent, Wallet } from 'lucide-react';
import { useStoreById, useDateRange } from '@/store';
import {
    calculateStoreKPIs,
    formatCurrency,
    prepareStoreRevenueLineChartData,
    prepareCommissionVsProfitData
} from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StoreHeader from '@/components/navigation/StoreHeader';
import KPICard from '@/components/ui/KPICard';
import DateRangeFilter from '@/components/ui/DateRangeFilter';
import StoreRevenueLineChart from '@/components/charts/StoreRevenueLineChart';
import CommissionVsProfitBar from '@/components/charts/CommissionVsProfitBar';
import EntriesTable from '@/components/tables/EntriesTable';

const StoreDetail: React.FC = () => {
    const { storeId } = useParams<{ storeId: string }>();
    const store = useStoreById(storeId || '');
    const dateRange = useDateRange();

    if (!store) {
        return (
            <div className="text-center py-12">
                <div className="text-6xl mb-4">🤔</div>
                <h2 className="text-2xl font-semibold text-primary-700 mb-2">
                    Store not found
                </h2>
                <p className="text-neutral-600">
                    The store you're looking for doesn't exist
                </p>
            </div>
        );
    }

    // Calculate store-specific KPIs for the selected date range
    const kpis = calculateStoreKPIs(store, dateRange);

    // Prepare chart data
    const revenueChartData = prepareStoreRevenueLineChartData(store, dateRange);
    const commissionProfitData = prepareCommissionVsProfitData(store, dateRange);

    return (
        <div className="space-y-6">
            {/* Store Header with Best/Worst Day */}
            <StoreHeader
                store={store}
                bestDay={kpis.bestDay}
                worstDay={kpis.worstDay}
            />

            {/* Date Range Filter */}
            <DateRangeFilter />

            {/* Store-Specific KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard
                    title="Total Recaudado"
                    value={formatCurrency(kpis.totalRecaudado)}
                    subtitle={`${kpis.entryCount} entradas`}
                    icon={DollarSign}
                />

                <KPICard
                    title="Ganancia"
                    value={formatCurrency(kpis.totalGanancia)}
                    subtitle="Recaudado - Costo"
                    icon={TrendingUp}
                />

                <KPICard
                    title="Comisión"
                    value={formatCurrency(kpis.totalComision)}
                    subtitle={`${store.commissionPercent}% de ganancia`}
                    icon={Percent}
                />

                <KPICard
                    title="Restante"
                    value={formatCurrency(kpis.totalRestante)}
                    subtitle={`${kpis.profitMargin.toFixed(1)}% margen`}
                    icon={Wallet}
                    valueClassName={kpis.totalRestante >= 0 ? 'text-success-600' : 'text-error-600'}
                />
            </div>

            {/* Store Analytics Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="shadow-soft hover:shadow-cozy transition-shadow duration-200 bg-white">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-primary-800 flex items-center space-x-2">
                            <TrendingUp className="h-5 w-5 text-cute-pink" />
                            <span>Tendencias de Ingresos</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <StoreRevenueLineChart data={revenueChartData} />
                    </CardContent>
                </Card>

                <Card className="shadow-soft hover:shadow-cozy transition-shadow duration-200 bg-white">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-primary-800 flex items-center space-x-2">
                            <Percent className="h-5 w-5 text-cute-pink" />
                            <span>Comisión vs Ganancia</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CommissionVsProfitBar data={commissionProfitData} />
                    </CardContent>
                </Card>
            </div>

            {/* Entries Table */}
            <EntriesTable
                storeId={store.id}
                entries={store.entries}
            />
        </div>
    );
};

export default StoreDetail;
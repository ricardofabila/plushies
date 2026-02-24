import React from 'react';
import { useStores, useDateRange } from '@/store';
import {
    calculateCombinedKPIs,
    formatCurrency,
    prepareRevenueLineChartData,
    prepareStoreComparisonData,
    prepareRevenueDistributionData,
    prepareStoresSummaryData
} from '@/utils';
import {
    analyzeDayOfWeekPerformance,
    calculateMonthOverMonthGrowth,
    calculateWeekOverWeekGrowth,
    calculateYearOverYearGrowth,
    calculateMovingAverages,
    calculateStoreROI,
    calculateStoreEfficiencyScores,
    calculateCashFlowTimeline,
    calculateStoreBenchmarks,
    generateEntryFrequencyHeatmap,
    findPeakSalesDays
} from '@/utils/analytics';
import KPICard from '@/components/ui/KPICard';
import DateRangeFilter from '@/components/ui/DateRangeFilter';
import GrowthMetricCard from '@/components/ui/GrowthMetricCard';
import PeakSalesDays from '@/components/ui/PeakSalesDays';
import RevenueLineChart from '@/components/charts/RevenueLineChart';
import StoreComparisonBar from '@/components/charts/StoreComparisonBar';
import RevenueDistributionPie from '@/components/charts/RevenueDistributionPie';
import DayOfWeekChart from '@/components/charts/DayOfWeekChart';
import MovingAverageChart from '@/components/charts/MovingAverageChart';
import CashFlowChart from '@/components/charts/CashFlowChart';
import EntryFrequencyHeatmap from '@/components/charts/EntryFrequencyHeatmap';
import StoresSummaryTable from '@/components/tables/StoresSummaryTable';
import StoreEfficiencyTable from '@/components/tables/StoreEfficiencyTable';
import StoreBenchmarkTable from '@/components/tables/StoreBenchmarkTable';
import StoreROITable from '@/components/tables/StoreROITable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, Percent, PiggyBank } from 'lucide-react';

const Dashboard: React.FC = () => {
    const stores = useStores();
    const dateRange = useDateRange();

    // Calculate combined KPIs for all stores
    const kpis = calculateCombinedKPIs(stores, dateRange);

    // Prepare chart data
    const lineChartData = prepareRevenueLineChartData(stores, dateRange);
    const barChartData = prepareStoreComparisonData(stores, dateRange);
    const pieChartData = prepareRevenueDistributionData(stores, dateRange);
    const summaryData = prepareStoresSummaryData(stores, dateRange);

    // Advanced analytics
    const dayOfWeekData = analyzeDayOfWeekPerformance(stores, dateRange);
    const peakSalesDays = findPeakSalesDays(stores, dateRange, 5);
    const momGrowth = calculateMonthOverMonthGrowth(stores);
    const wowGrowth = calculateWeekOverWeekGrowth(stores);
    const yoyGrowth = calculateYearOverYearGrowth(stores);
    const movingAverages = calculateMovingAverages(stores, dateRange);
    const storeROIs = stores.map(store => calculateStoreROI(store, dateRange));
    const efficiencyScores = calculateStoreEfficiencyScores(stores, dateRange);
    const cashFlowData = calculateCashFlowTimeline(stores, dateRange);
    const benchmarks = calculateStoreBenchmarks(stores, dateRange);
    const heatmapData = generateEntryFrequencyHeatmap(stores, dateRange);

    // Show welcome message if no stores exist
    if (stores.length === 0) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-primary-800">
                        📊 Dashboard
                    </h1>
                </div>

                <div className="text-center py-12">
                    <div className="text-6xl mb-4">🧸</div>
                    <h2 className="text-2xl font-semibold text-primary-700 mb-2">
                        ¡Bienvenido a tu Dashboard de Peluches!
                    </h2>
                    <p className="text-neutral-600 mb-4">
                        Crea tu primera tienda para comenzar a rastrear tus ingresos
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h1 className="text-3xl font-bold text-primary-800">
                    📊 Dashboard
                </h1>
                <DateRangeFilter />
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard
                    title="Total Recaudado"
                    value={formatCurrency(kpis.totalRecaudado)}
                    subtitle={`${kpis.entryCount} entradas`}
                    icon={DollarSign}
                    className="bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200"
                />

                <KPICard
                    title="Ganancia Total"
                    value={formatCurrency(kpis.totalGanancia)}
                    subtitle="Recaudado - Costos"
                    icon={TrendingUp}
                    className="bg-gradient-to-br from-success-50 to-success-100 border-success-200"
                />

                <KPICard
                    title="Comisión Total"
                    value={formatCurrency(kpis.totalComision)}
                    subtitle="Comisiones pagadas"
                    icon={Percent}
                    className="bg-gradient-to-br from-warning-50 to-warning-100 border-warning-200"
                />

                <KPICard
                    title="Restante Total"
                    value={formatCurrency(kpis.totalRestante)}
                    subtitle={`${kpis.profitMargin.toFixed(1)}% margen`}
                    icon={PiggyBank}
                    className="bg-gradient-to-br from-accent-50 to-accent-100 border-accent-200"
                />
            </div>

            {/* Charts Section */}
            {kpis.entryCount > 0 ? (
                <div className="space-y-6">
                    {/* Growth Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <GrowthMetricCard metrics={momGrowth} />
                        <GrowthMetricCard metrics={wowGrowth} />
                        <GrowthMetricCard metrics={yoyGrowth} />
                    </div>

                    {/* Peak Sales Days and Day of Week Performance */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card className="shadow-soft bg-white">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    🏆 Días con Mejores Ventas
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <PeakSalesDays data={peakSalesDays} />
                            </CardContent>
                        </Card>

                        <Card className="shadow-soft bg-white">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    📅 Rendimiento por Día de la Semana
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <DayOfWeekChart data={dayOfWeekData} />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Moving Averages */}
                    <Card className="shadow-soft bg-white">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                📊 Promedios Móviles (7 y 30 días)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <MovingAverageChart data={movingAverages} />
                        </CardContent>
                    </Card>

                    {/* Revenue Trends Line Chart */}
                    <Card className="shadow-soft bg-white">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                📈 Tendencias de Ingresos
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <RevenueLineChart data={lineChartData} />
                        </CardContent>
                    </Card>

                    {/* Cash Flow Timeline */}
                    <Card className="shadow-soft bg-white">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                💰 Flujo de Efectivo Acumulado
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CashFlowChart data={cashFlowData} />
                        </CardContent>
                    </Card>

                    {/* Store Efficiency Scores */}
                    <Card className="shadow-soft bg-white">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                🎯 Ranking de Eficiencia por Tienda
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <StoreEfficiencyTable data={efficiencyScores} />
                        </CardContent>
                    </Card>

                    {/* Store ROI Analysis */}
                    <Card className="shadow-soft bg-white">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                📊 ROI por Tienda
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <StoreROITable data={storeROIs} />
                        </CardContent>
                    </Card>

                    {/* Store Benchmarking */}
                    <Card className="shadow-soft bg-white">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                📊 Comparación entre Tiendas
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <StoreBenchmarkTable data={benchmarks} />
                        </CardContent>
                    </Card>

                    {/* Entry Frequency Heatmap */}
                    <Card className="shadow-soft bg-white">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                🗓️ Calendario de Frecuencia de Entradas
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <EntryFrequencyHeatmap data={heatmapData} dateRange={dateRange} />
                        </CardContent>
                    </Card>

                    {/* Store Comparison and Revenue Distribution */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Store Comparison Bar Chart */}
                        <Card className="shadow-soft bg-white">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    📊 Comparación por Tienda
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <StoreComparisonBar data={barChartData} />
                            </CardContent>
                        </Card>

                        {/* Revenue Distribution Pie Chart */}
                        <Card className="shadow-soft bg-white">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    🥧 Distribución de Ingresos
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <RevenueDistributionPie data={pieChartData} />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Stores Summary Table */}
                    <StoresSummaryTable data={summaryData} />
                </div>
            ) : (
                <div className="text-center py-8 bg-primary-50 rounded-xl border border-primary-200">
                    <div className="text-4xl mb-4">📈</div>
                    <h3 className="text-xl font-semibold text-primary-700 mb-2">
                        Sin Datos para Mostrar
                    </h3>
                    <p className="text-gray-600">
                        Agrega algunas entradas a tus tiendas para ver los gráficos de análisis
                    </p>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
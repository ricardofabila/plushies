# 📊 Advanced Analytics Features

This document describes the new analytics features added to the Plushie Sales Tracker Dashboard.

## 🎯 Features Implemented

### 1. Best/Worst Performing Days Analysis

#### Day of Week Performance Chart
- **Location**: Dashboard - "Rendimiento por Día de la Semana"
- **Shows**: Total revenue by day of week (Domingo - Sábado)
- **Insights**: Identify which days generate the most revenue
- **Visual**: Color-coded bar chart with percentage breakdown

#### Peak Sales Days
- **Location**: Dashboard - "Días con Mejores Ventas"
- **Shows**: Top 5 highest revenue days
- **Details**: Date, revenue, profit, and participating stores
- **Highlight**: #1 day gets trophy badge and special styling

### 2. Growth Rate Metrics

Three growth comparison cards showing:

#### Month-over-Month (MoM)
- Current month vs previous month revenue
- Growth percentage and absolute amount
- Visual trend indicator (up/down/neutral)

#### Week-over-Week (WoW)
- Current week vs previous week revenue
- Helps identify short-term trends

#### Year-over-Year (YoY)
- Same month this year vs last year
- Long-term growth tracking

### 3. Moving Averages

#### Moving Average Chart
- **Location**: Dashboard - "Promedios Móviles"
- **Shows**: 
  - Actual daily revenue (gray line)
  - 7-day moving average (green line)
  - 30-day moving average (orange line)
- **Purpose**: Smooth out daily fluctuations to see overall trends
- **Note**: MA lines only appear when sufficient data exists (7+ or 30+ days)

### 4. ROI per Store

#### Store ROI Table
- **Location**: Dashboard - "ROI por Tienda"
- **Columns**:
  - Total Investment (costoPeluches)
  - Total Revenue (recaudado)
  - Total Profit (restante)
  - ROI percentage
  - Break-even date and days to break-even
- **Color Coding**:
  - Green: ROI ≥ 100%
  - Orange: ROI ≥ 50%
  - Yellow: ROI ≥ 0%
  - Red: ROI < 0%

### 5. Store Efficiency Score

#### Efficiency Ranking Table
- **Location**: Dashboard - "Ranking de Eficiencia por Tienda"
- **Composite Score** (0-100) based on:
  - Revenue Score (40% weight)
  - Profit Margin Score (30% weight)
  - Consistency Score (30% weight)
- **Features**:
  - Rank #1 gets trophy icon
  - Progress bars for each component score
  - Identifies top and underperforming stores

### 6. Cash Flow Timeline

#### Cumulative Cash Flow Chart
- **Location**: Dashboard - "Flujo de Efectivo Acumulado"
- **Shows**:
  - Cumulative Investment (red line)
  - Cumulative Profit (green line)
  - Net Cash Flow (orange line - profit minus investment)
- **Purpose**: Track when business breaks even and becomes profitable
- **Zero Line**: Reference line shows break-even point

### 7. Store-to-Store Benchmarking

#### Benchmark Comparison Table
- **Location**: Dashboard - "Comparación entre Tiendas"
- **Metrics**:
  - Average daily revenue per store
  - Average daily profit per store
  - Profit margin percentage
  - Comparison vs. average (percentage difference)
- **Outlier Detection**:
  - "Top" badge: Significantly above average (green)
  - "Bajo" badge: Significantly below average (red)
  - "Normal": Within expected range
- **Statistical Method**: Uses 1.5 standard deviations for outlier detection

### 8. Entry Frequency Heatmap

#### Calendar Heatmap
- **Location**: Dashboard - "Calendario de Frecuencia de Entradas"
- **Visual**: Calendar grid showing collection frequency
- **Color Intensity**:
  - Gray: No entries
  - Light orange: Low revenue ($0-200)
  - Medium orange: Medium revenue ($200-500)
  - Dark orange: High revenue ($500-1000)
  - Darkest orange: Very high revenue ($1000+)
- **Interactive**: Hover to see date, revenue, and entry count
- **Purpose**: 
  - Identify gaps in data collection
  - Optimize visit schedules
  - Spot patterns in collection frequency

## 📈 How to Use

1. **Date Range Filter**: All analytics respect the selected date range (top right of dashboard)
2. **Scroll Through**: Dashboard is organized from high-level metrics to detailed analysis
3. **Hover for Details**: Most charts show tooltips with detailed information
4. **Compare Stores**: Use efficiency scores and benchmarks to identify best practices

## 🎨 Visual Design

- **Color Scheme**: Consistent with app theme (primary orange, success green, etc.)
- **Responsive**: All charts and tables adapt to screen size
- **Accessibility**: Clear labels, good contrast, hover states

## 🔧 Technical Details

### New Files Created

**Analytics Engine**:
- `src/utils/analytics.ts` - All calculation functions

**Charts**:
- `src/components/charts/DayOfWeekChart.tsx`
- `src/components/charts/MovingAverageChart.tsx`
- `src/components/charts/CashFlowChart.tsx`
- `src/components/charts/EntryFrequencyHeatmap.tsx`

**UI Components**:
- `src/components/ui/GrowthMetricCard.tsx`
- `src/components/ui/PeakSalesDays.tsx`

**Tables**:
- `src/components/tables/StoreEfficiencyTable.tsx`
- `src/components/tables/StoreBenchmarkTable.tsx`
- `src/components/tables/StoreROITable.tsx`

### Dependencies Used

- `recharts` - For all charts
- `date-fns` - For date calculations and formatting
- Existing app utilities for currency formatting and date parsing

## 💡 Insights You Can Gain

1. **Best Days to Collect**: See which days of the week perform best
2. **Growth Trends**: Track if business is growing or declining
3. **Store Performance**: Identify which locations are most profitable
4. **Investment Returns**: Know your ROI and when you'll break even
5. **Consistency**: Find stores with stable vs. volatile performance
6. **Collection Patterns**: Optimize your visit schedule based on frequency data
7. **Seasonal Patterns**: Spot trends over time with moving averages

## 🚀 Future Enhancements

Potential additions:
- Predictive forecasting
- Inventory recommendations
- Alert system for unusual patterns
- Export analytics reports
- Custom date range comparisons
- Store-specific deep dives

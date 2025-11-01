# Design Document - Plushie Machine Revenue Tracker

## Overview

The Plushie Machine Revenue Tracker is a React-based single-page application that provides comprehensive revenue tracking and analytics for plushie machine operations across multiple store locations. The application uses a modern tech stack with React, TypeScript, Tailwind CSS, and shadcn/ui components, storing all data locally in the browser's LocalStorage.

The system follows a clean architecture pattern with clear separation between data models, business logic, and presentation layers. The application is designed to be responsive, accessible, and performant while maintaining simplicity for single-user operation.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Browser Environment                       │
├─────────────────────────────────────────────────────────────┤
│  React Application Layer                                    │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   Dashboard     │  │  Store Detail   │  │  Settings   │ │
│  │   Component     │  │   Component     │  │  Component  │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  State Management Layer (Zustand)                          │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   Store State   │  │   UI State      │  │  Settings   │ │
│  │   Management    │  │   Management    │  │   State     │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  Business Logic Layer                                      │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   Calculators   │  │   Validators    │  │   Formatters│ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  Data Layer                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │  LocalStorage   │  │   Data Models   │  │   Schema    │ │
│  │   Persistence   │  │                 │  │  Migration  │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom cute/cozy color palette
- **UI Components**: shadcn/ui (primary), custom components only when necessary
- **Icons**: Lucide React for cute, friendly icons
- **State Management**: Zustand for global state
- **Charts**: Recharts for data visualization with cozy color schemes
- **Date Handling**: date-fns with Spanish locale
- **Data Export**: Custom JSON/CSV utilities
- **Storage**: Browser LocalStorage with schema versioning

## Components and Interfaces

### Core Data Models

```typescript
interface AppStateV1 {
  version: 1;
  currency: 'MXN';
  stores: Store[];
  userSettings: UserSettings;
}

interface UserSettings {
  defaultCommissionPercent: number;
  dateLocale: 'es-MX';
}

interface Store {
  id: string; // UUID
  name: string;
  commissionPercent: number;
  color?: string; // For chart differentiation
  entries: Entry[];
}

interface Entry {
  id: string; // UUID
  date: string; // DD/MM/YYYY format
  recaudado: number;
  costoPeluches: number;
  notes?: string;
  // Computed fields (not stored):
  // ganancia, comision, restante
}
```

### Component Hierarchy

```
App
├── Navigation
│   ├── AppHeader
│   └── StoreTabs
├── Router
│   ├── Dashboard
│   │   ├── KPICards
│   │   ├── DateRangeFilter
│   │   ├── CombinedCharts
│   │   │   ├── RevenueLineChart
│   │   │   ├── StoreComparisonBar
│   │   │   └── RevenueDistributionPie
│   │   └── StoresSummaryTable
│   ├── StoreDetail
│   │   ├── StoreHeader
│   │   ├── StoreKPICards
│   │   ├── StoreCharts
│   │   │   ├── StoreRevenueLineChart
│   │   │   └── CommissionVsProfitBar
│   │   ├── EntriesTable
│   │   └── EntryModal (CRUD)
│   └── Settings
│       ├── DefaultSettings
│       ├── DataManagement
│       └── ImportExportControls
└── GlobalComponents
    ├── Toast
    ├── ConfirmDialog
    └── LoadingSpinner
```

### State Management Structure

```typescript
interface AppStore {
  // Data state
  stores: Store[];
  userSettings: UserSettings;
  
  // UI state
  selectedDateRange: DateRange;
  activeStoreId: string | null;
  isLoading: boolean;
  
  // Actions
  addStore: (store: Omit<Store, 'id' | 'entries'>) => void;
  updateStore: (id: string, updates: Partial<Store>) => void;
  deleteStore: (id: string) => void;
  
  addEntry: (storeId: string, entry: Omit<Entry, 'id'>) => void;
  updateEntry: (storeId: string, entryId: string, updates: Partial<Entry>) => void;
  deleteEntry: (storeId: string, entryId: string) => void;
  
  setDateRange: (range: DateRange) => void;
  setActiveStore: (storeId: string) => void;
  
  exportData: () => string; // JSON export
  importData: (jsonData: string) => void;
  exportStoreCSV: (storeId: string) => string;
}
```

## Data Models

### Business Logic Calculations

The system implements the following calculation formulas:

```typescript
// Core business calculations
const calculateGanancia = (recaudado: number, costoPeluches: number): number => {
  return recaudado - costoPeluches;
};

const calculateComision = (
  ganancia: number,
  commissionPercent: number
): number => {
  return Math.round((ganancia * commissionPercent / 100) * 100) / 100;
};

const calculateRestante = (ganancia: number, comision: number): number => {
  return ganancia - comision;
};
```

### Data Persistence Strategy

- **Primary Storage**: LocalStorage with key `plushie-tracker:v1`
- **Schema Versioning**: Version field in root object for future migrations
- **Write Strategy**: Debounced writes (300ms) to optimize performance
- **Backup Strategy**: Automatic JSON export capability
- **Migration**: Forward-compatible schema with version checking

### Date and Currency Formatting

```typescript
// Date formatting utilities
const formatDate = (date: Date): string => {
  return format(date, 'dd/MM/yyyy', { locale: es });
};

const parseDate = (dateString: string): Date => {
  return parse(dateString, 'dd/MM/yyyy', new Date(), { locale: es });
};

// Currency formatting
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(amount);
};
```

## Error Handling

### Validation Strategy

1. **Input Validation**:
   - Date format validation using date-fns strict parsing
   - Numeric validation for currency amounts (non-negative)
   - Required field validation
   - Range validation (reasonable date ranges, amount limits)

2. **Business Rule Validation**:
   - Warning when costoPeluches > recaudado
   - Commission percentage bounds (0-100%)
   - Store name uniqueness

3. **Data Integrity**:
   - Schema validation on data import
   - LocalStorage quota monitoring
   - Graceful degradation on storage failures

### Error Display Strategy

```typescript
interface ErrorState {
  type: 'validation' | 'storage' | 'import' | 'calculation';
  message: string;
  field?: string; // For field-specific errors
  severity: 'error' | 'warning' | 'info';
}
```

- **Toast Notifications**: For operation confirmations and non-blocking errors
- **Inline Validation**: Real-time field validation with error messages
- **Modal Dialogs**: For critical errors requiring user action
- **Form Validation**: Comprehensive validation before data submission

## Testing Strategy

### Unit Testing Approach

1. **Business Logic Testing**:
   - Calculator functions (ganancia, comision, restante)
   - Date parsing and formatting utilities
   - Currency formatting functions
   - Validation functions

2. **Component Testing**:
   - Form validation behavior
   - Chart data transformation
   - Table sorting and filtering
   - Modal interactions

3. **Integration Testing**:
   - LocalStorage persistence
   - State management operations
   - Data import/export functionality
   - Cross-component data flow

### Testing Tools

- **Unit Tests**: Vitest with React Testing Library
- **Component Tests**: React Testing Library with user-event
- **E2E Tests**: Playwright for critical user flows (optional)

### Test Coverage Goals

- **Business Logic**: 100% coverage for calculation functions
- **Components**: Focus on user interactions and edge cases
- **Integration**: Critical data flows and persistence operations

## UI Design System

### Cute and Cozy Design Theme

The application will feature a warm, friendly, and approachable design that reflects the playful nature of plushie machines while maintaining professionalism for business use.

#### Color Palette

**Primary Colors:**
- **Soft Pink**: `#F8BBD9` - Primary accent color for buttons and highlights
- **Warm Coral**: `#F4A6CD` - Secondary accent for interactive elements
- **Lavender**: `#E8D5FF` - Tertiary accent for backgrounds and cards

**Neutral Colors:**
- **Cream White**: `#FFF8F3` - Main background color
- **Soft Gray**: `#F5F5F5` - Card backgrounds and subtle dividers
- **Warm Gray**: `#8B8B8B` - Text secondary color
- **Charcoal**: `#2D2D2D` - Primary text color

**Semantic Colors:**
- **Success Green**: `#A8E6A3` - Positive values and success states
- **Warning Orange**: `#FFD4A3` - Warnings and alerts
- **Error Red**: `#FFB3BA` - Error states and negative values

#### Typography

- **Font Family**: Inter or similar clean, friendly sans-serif
- **Headings**: Slightly rounded, warm feeling
- **Body Text**: Clean and readable with comfortable line spacing
- **Numbers**: Tabular figures for financial data alignment

#### Icon Strategy

**Icon Library**: Lucide React with emphasis on:
- **Plushie/Toy Icons**: For store representations and branding
- **Rounded Icons**: Soft, friendly appearance
- **Consistent Style**: Outline style with consistent stroke width
- **Contextual Icons**: 
  - 🧸 Teddy bear for stores
  - 💰 Coins for revenue
  - 📊 Charts for analytics
  - ⚙️ Settings gear
  - 📅 Calendar for dates
  - 💾 Save/export actions

#### Component Styling

**Cards and Containers:**
- Soft rounded corners (`rounded-xl` or `rounded-2xl`)
- Subtle shadows with warm tones
- Gentle gradients for depth
- Soft borders in muted colors

**Buttons:**
- Rounded corners with hover animations
- Soft color transitions
- Friendly micro-interactions
- Icon + text combinations

**Charts:**
- Soft, pastel color schemes
- Rounded chart elements where possible
- Gentle gradients in area charts
- Warm color progression for data series

#### Layout and Spacing

- **Generous Padding**: Comfortable spacing throughout
- **Soft Transitions**: Smooth animations between states
- **Friendly Empty States**: Cute illustrations or icons with encouraging messages
- **Cozy Containers**: Cards with soft backgrounds and gentle shadows

### Custom Tailwind Configuration

```javascript
// tailwind.config.js additions
module.exports = {
  theme: {
    extend: {
      colors: {
        'cute-pink': '#F8BBD9',
        'warm-coral': '#F4A6CD',
        'soft-lavender': '#E8D5FF',
        'cream-white': '#FFF8F3',
        'soft-gray': '#F5F5F5',
        'warm-gray': '#8B8B8B',
        'success-green': '#A8E6A3',
        'warning-orange': '#FFD4A3',
        'error-red': '#FFB3BA',
      },
      borderRadius: {
        'cute': '1rem',
        'extra-cute': '1.5rem',
      },
      boxShadow: {
        'soft': '0 4px 6px -1px rgba(248, 187, 217, 0.1), 0 2px 4px -1px rgba(248, 187, 217, 0.06)',
        'cozy': '0 10px 15px -3px rgba(248, 187, 217, 0.1), 0 4px 6px -2px rgba(248, 187, 217, 0.05)',
      }
    }
  }
}
```

## Performance Considerations

### Optimization Strategies

1. **Data Management**:
   - Debounced LocalStorage writes
   - Memoized calculations for derived fields
   - Efficient date range filtering
   - Lazy loading for large datasets

2. **UI Performance**:
   - React.memo for expensive components
   - useMemo for complex calculations
   - useCallback for event handlers
   - Virtual scrolling for large tables (if needed)

3. **Chart Performance**:
   - Data aggregation before chart rendering
   - Responsive chart containers
   - Efficient data transformation

### Memory Management

- Cleanup of event listeners
- Proper dependency arrays in hooks
- Avoiding memory leaks in chart components
- Efficient state updates

## Accessibility Features

### WCAG 2.1 Compliance

1. **Keyboard Navigation**:
   - Tab order for all interactive elements
   - Keyboard shortcuts for common actions
   - Focus management in modals

2. **Screen Reader Support**:
   - Semantic HTML structure
   - ARIA labels and descriptions
   - Live regions for dynamic content updates

3. **Visual Accessibility**:
   - High contrast color schemes
   - Scalable text and UI elements
   - Clear visual hierarchy

### Implementation Details

- **shadcn/ui Components**: Built-in accessibility features
- **Form Labels**: Proper association with form controls
- **Error Announcements**: Screen reader accessible error messages
- **Chart Accessibility**: Alternative data tables for chart content

## Security Considerations

### Data Protection

1. **Client-Side Security**:
   - No sensitive data transmission (local-only storage)
   - Input sanitization for XSS prevention
   - Safe JSON parsing with error handling

2. **Data Validation**:
   - Schema validation on import
   - Type checking for all data operations
   - Bounds checking for numeric inputs

### Privacy

- **No External Dependencies**: All data remains in browser
- **No Analytics**: No user tracking or data collection
- **Local Storage Only**: No network requests for data operations

This design provides a solid foundation for implementing the Plushie Machine Revenue Tracker with modern web technologies while maintaining simplicity, performance, and user experience standards.
# Implementation Plan

- [x] 1. Set up project structure and dependencies
  - Initialize Vite React TypeScript project with Tailwind CSS
  - Install and configure shadcn/ui components
  - Install required dependencies: Zustand, Recharts, date-fns, Lucide React
  - Configure Tailwind with custom cute/cozy color palette
  - Set up project folder structure for components, hooks, utils, and types
  - _Requirements: 10.6_

- [x] 2. Implement core data models and business logic
  - [x] 2.1 Create TypeScript interfaces for Store, Entry, and AppState
    - Define data models with proper typing
    - Include schema versioning structure
    - _Requirements: 8.2_

  - [x] 2.2 Implement business calculation functions
    - Create calculateGanancia function (recaudado - costoPeluches)
    - Create calculateComision function (ganancia * commissionPercent / 100)
    - Create calculateRestante function (ganancia - comision)
    - Add proper rounding to 2 decimal places
    - _Requirements: 2.4, 2.5_

  - [x] 2.3 Create date and currency formatting utilities
    - Implement DD/MM/YYYY date formatting with date-fns Spanish locale
    - Create MXN currency formatter with proper thousands separators
    - Add date parsing and validation functions
    - _Requirements: 9.3, 7.4, 7.5_

- [x] 3. Set up state management and data persistence
  - [x] 3.1 Create Zustand store for application state
    - Implement stores array management (add, update, delete)
    - Implement entries management within stores
    - Add user settings state management
    - Include UI state for date ranges and active store
    - _Requirements: 1.1, 1.4, 2.1, 6.4_

  - [x] 3.2 Implement LocalStorage persistence layer
    - Create debounced LocalStorage write functionality
    - Implement schema versioning and migration system
    - Add error handling for storage quota exceeded
    - Create data validation on load
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 4. Create core UI components and layout
  - [x] 4.1 Set up routing and main application layout
    - Configure React Router for Dashboard, Store Detail, and Settings pages
    - Create main App component with navigation structure
    - Implement responsive layout with cute/cozy styling
    - _Requirements: 10.1, 10.2_

  - [x] 4.2 Create navigation components
    - Build AppHeader with app name and global actions
    - Implement StoreTabs component with horizontal scrolling on mobile
    - Add "Add Store" functionality in navigation
    - Style with cute icons and cozy colors
    - _Requirements: 1.1, 1.5, 10.2_

  - [x] 4.3 Implement reusable UI components
    - Create KPICard component for displaying financial metrics
    - Build DateRangeFilter component with preset and custom options
    - Create ConfirmDialog component for delete confirmations
    - Add Toast notification system
    - Style all components with cute/cozy design theme
    - _Requirements: 6.1, 6.2, 9.5, 1.4_

- [x] 5. Build store management functionality
  - [x] 5.1 Create store CRUD operations
    - Implement AddStoreModal with name and commission percentage inputs
    - Create store update functionality for renaming and commission changes
    - Add store deletion with confirmation dialog
    - Include input validation for store data
    - _Requirements: 1.1, 1.2, 1.4, 9.1, 9.2_

  - [x] 5.2 Implement store tabs interface
    - Create interactive store tabs with cute styling
    - Add tab menu for store actions (rename, delete)
    - Implement active store selection and routing
    - Handle empty state when no stores exist
    - _Requirements: 1.5_

- [x] 6. Develop entry management system
  - [x] 6.1 Create entry CRUD modal
    - Build EntryModal component for add/edit operations
    - Implement form with date, recaudado, costoPeluches, and notes fields
    - Add real-time preview of calculated fields (ganancia, comision, restante)
    - Include comprehensive input validation
    - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.3, 9.1, 9.2, 9.3, 9.4_

  - [x] 6.2 Build entries table component
    - Create sortable and filterable entries table
    - Display all entry fields including calculated values
    - Add edit and delete actions for each entry
    - Implement responsive table design for mobile
    - _Requirements: 5.3, 3.2, 3.5_

- [x] 7. Implement dashboard with combined analytics
  - [x] 7.1 Create dashboard KPI cards
    - Build KPI cards for total recaudado, ganancia, comision, and restante
    - Implement date range filtering for all KPIs
    - Add profit margin calculation and display
    - Style with cute colors and friendly icons
    - _Requirements: 4.1, 4.2, 5.5_

  - [x] 7.2 Implement combined analytics charts
    - Create RevenueLineChart showing recaudado and restante trends over time
    - Build StoreComparisonBar chart for restante by store
    - Implement RevenueDistributionPie chart for recaudado by store
    - Configure charts with cozy color schemes and responsive design
    - _Requirements: 4.3, 4.4, 4.5_

  - [x] 7.3 Build stores summary table
    - Create table showing per-store totals and profit margins
    - Include store filtering and sorting capabilities
    - Display data for selected date range
    - Add cute styling consistent with design theme
    - _Requirements: 4.1, 4.2, 5.5_

- [x] 8. Create store detail page with analytics
  - [x] 8.1 Build store-specific KPI display
    - Create store header with name and commission information
    - Implement store-specific KPI cards
    - Add best/worst day calculations and display
    - _Requirements: 5.1, 5.2, 5.5_

  - [x] 8.2 Implement store analytics charts
    - Create StoreRevenueLineChart for recaudado, costoPeluches, and restante
    - Build CommissionVsProfitBar chart showing comision vs restante by date
    - Configure responsive chart containers with cute styling
    - _Requirements: 5.2_

- [ ] 9. Develop data import/export functionality
  - [x] 9.1 Implement CSV export for individual stores
    - Create CSV export function with Spanish headers
    - Include all fields: fecha, recaudado, costo_peluches, ganancia, comision, restante
    - Format dates and currency properly in exports
    - _Requirements: 7.1, 7.4, 7.5_

  - [x] 9.2 Build JSON data export/import system
    - Implement complete application data export as JSON
    - Create JSON import functionality with data validation
    - Add schema version checking and error handling
    - Include user confirmation before replacing existing data
    - _Requirements: 7.2, 7.3, 7.4, 7.5_

- [x] 10. Create settings page and data management
  - [x] 10.1 Build settings interface
    - Create default commission percentage setting
    - Add data management section with export/import controls
    - Implement clear all data functionality with confirmation
    - Style with cute/cozy design theme
    - _Requirements: 7.2, 7.3, 7.5_

  - [x] 10.2 Add comprehensive input validation
    - Implement all validation rules for forms
    - Add error message display with cute styling
    - Create validation for date ranges and numeric inputs
    - Handle edge cases and provide user-friendly error messages
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 11. Implement responsive design and accessibility
  - [x] 11.1 Ensure mobile responsiveness
    - Test and optimize all components for mobile screens
    - Implement touch-friendly interface elements
    - Ensure charts are readable and interactive on mobile
    - _Requirements: 10.2, 10.3, 10.4_

  - [x] 11.2 Add accessibility features
    - Implement keyboard navigation for all interactive elements
    - Add proper ARIA labels and descriptions
    - Ensure color contrast meets accessibility standards
    - _Requirements: 10.5, 10.6_

- [ ] 12. Testing and quality assurance
  - [x] 12.1 Write unit tests for business logic
    - Test calculation functions (ganancia, comision, restante)
    - Test date and currency formatting utilities
    - Test validation functions
    - _Requirements: 2.4, 2.5_


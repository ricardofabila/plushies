# Requirements Document

## Introduction

The Plushie Machine Revenue Tracker is a single-user web application designed to track daily earnings from plushie machines across multiple store locations. The system enables owners/operators to monitor revenue, calculate costs and commissions, analyze profit margins, and visualize financial trends across their plushie machine network. The application operates entirely in the browser using LocalStorage for data persistence, with no backend requirements.

## Glossary

- **Plushie_Tracker_System**: The web application that manages revenue tracking for plushie machines
- **Store**: A physical location where one or more plushie machines are operated
- **Entry**: A daily transaction record containing revenue and cost data for a specific store
- **Recaudado**: Total money collected from plushie machines (gross revenue)
- **Costo_Peluches**: Cost of plushies sold/dispensed from machines
- **Ganancia**: Profit calculated as recaudado minus costo_peluches
- **Comision**: Commission fee calculated as percentage of either ganancia or recaudado
- **Restante**: Net profit after deducting commission from ganancia

- **LocalStorage**: Browser storage mechanism for data persistence
- **MXN**: Mexican Peso currency format
- **DD/MM/YYYY**: Date format used throughout the system (day/month/year)

## Requirements

### Requirement 1

**User Story:** As a plushie machine operator, I want to create and manage multiple store locations, so that I can track revenue from different physical locations separately.

#### Acceptance Criteria

1. THE Plushie_Tracker_System SHALL allow creation of new stores with unique names
2. THE Plushie_Tracker_System SHALL allow configuration of commission percentage per store
4. THE Plushie_Tracker_System SHALL allow deletion of stores with confirmation dialog
5. THE Plushie_Tracker_System SHALL display stores as navigable tabs in the interface

### Requirement 2

**User Story:** As a plushie machine operator, I want to record daily revenue and costs for each store, so that I can track the financial performance of my machines.

#### Acceptance Criteria

1. THE Plushie_Tracker_System SHALL allow entry of daily recaudado amounts in MXN currency
2. THE Plushie_Tracker_System SHALL allow entry of daily costo_peluches amounts in MXN currency
3. THE Plushie_Tracker_System SHALL require date entry in DD/MM/YYYY format
4. THE Plushie_Tracker_System SHALL automatically calculate ganancia as recaudado minus costo_peluches
5. THE Plushie_Tracker_System SHALL automatically calculate comision as percentage of ganancia based on store commission percentage

### Requirement 3

**User Story:** As a plushie machine operator, I want to edit and delete existing revenue entries, so that I can correct mistakes and maintain accurate records.

#### Acceptance Criteria

1. THE Plushie_Tracker_System SHALL allow editing of existing entry data including date, recaudado, and costo_peluches
2. THE Plushie_Tracker_System SHALL allow deletion of entries with confirmation dialog
3. WHEN entry data is modified, THE Plushie_Tracker_System SHALL recalculate derived fields automatically
4. THE Plushie_Tracker_System SHALL validate edited data using the same rules as new entries
5. THE Plushie_Tracker_System SHALL update all related charts and KPIs when entries are modified or deleted

### Requirement 4

**User Story:** As a plushie machine operator, I want to view combined analytics across all stores, so that I can understand my overall business performance.

#### Acceptance Criteria

1. THE Plushie_Tracker_System SHALL display total recaudado across all stores for selected date range
2. THE Plushie_Tracker_System SHALL display total restante across all stores for selected date range
3. THE Plushie_Tracker_System SHALL display line charts showing combined revenue trends over time
4. THE Plushie_Tracker_System SHALL display bar charts comparing restante by store
5. THE Plushie_Tracker_System SHALL display pie charts showing recaudado distribution by store

### Requirement 5

**User Story:** As a plushie machine operator, I want to view detailed analytics for individual stores, so that I can identify which locations are most profitable.

#### Acceptance Criteria

1. THE Plushie_Tracker_System SHALL display store-specific KPI cards showing recaudado, ganancia, comision, and restante
2. THE Plushie_Tracker_System SHALL display line charts for individual store revenue trends
3. THE Plushie_Tracker_System SHALL display sortable table of all entries for the store
4. THE Plushie_Tracker_System SHALL allow filtering of store entries by date range
5. THE Plushie_Tracker_System SHALL calculate and display profit margin as restante divided by recaudado

### Requirement 6

**User Story:** As a plushie machine operator, I want to filter data by date ranges, so that I can analyze performance for specific time periods.

#### Acceptance Criteria

1. THE Plushie_Tracker_System SHALL provide preset date range filters including "Este mes", "Últimos 30 días", and "Año actual"
2. THE Plushie_Tracker_System SHALL allow custom date range selection
3. WHEN date range is changed, THE Plushie_Tracker_System SHALL update all KPIs and charts accordingly
4. THE Plushie_Tracker_System SHALL persist selected date range across page navigation within the session
5. THE Plushie_Tracker_System SHALL validate that start date is not after end date

### Requirement 7

**User Story:** As a plushie machine operator, I want to export and import my complete data set, so that I can create backups and transfer my data between different computers.

#### Acceptance Criteria

1. THE Plushie_Tracker_System SHALL export individual store data as CSV files with Spanish headers
2. THE Plushie_Tracker_System SHALL export complete application data as JSON files including all stores and entries
3. THE Plushie_Tracker_System SHALL import complete application data from JSON files
4. WHEN importing JSON data, THE Plushie_Tracker_System SHALL validate the data structure and schema version
5. THE Plushie_Tracker_System SHALL replace existing data with imported data after user confirmation

### Requirement 8

**User Story:** As a plushie machine operator, I want my data to persist between browser sessions, so that I don't lose my revenue tracking information.

#### Acceptance Criteria

1. THE Plushie_Tracker_System SHALL store all data in browser LocalStorage
2. THE Plushie_Tracker_System SHALL use schema versioning for data structure management
3. WHEN application loads, THE Plushie_Tracker_System SHALL restore previous session data
4. THE Plushie_Tracker_System SHALL debounce LocalStorage writes to optimize performance
5. IF LocalStorage quota is exceeded, THEN THE Plushie_Tracker_System SHALL prompt user to export and clear data

### Requirement 9

**User Story:** As a plushie machine operator, I want input validation and error handling, so that I can maintain data accuracy and avoid system errors.

#### Acceptance Criteria

1. THE Plushie_Tracker_System SHALL validate that recaudado values are non-negative numbers
2. THE Plushie_Tracker_System SHALL validate that costo_peluches values are non-negative numbers
3. THE Plushie_Tracker_System SHALL validate date entries match DD/MM/YYYY format exactly
4. IF costo_peluches exceeds recaudado, THEN THE Plushie_Tracker_System SHALL display warning message
5. THE Plushie_Tracker_System SHALL display toast notifications for save confirmations and errors

### Requirement 10

**User Story:** As a plushie machine operator, I want the interface to work on both desktop and mobile devices, so that I can access my data from anywhere.

#### Acceptance Criteria

1. THE Plushie_Tracker_System SHALL display responsive layouts that adapt to screen size
2. THE Plushie_Tracker_System SHALL provide horizontally scrollable store tabs on mobile devices
3. THE Plushie_Tracker_System SHALL ensure charts are readable and interactive on mobile screens
4. THE Plushie_Tracker_System SHALL provide touch-friendly interface elements
5. THE Plushie_Tracker_System SHALL maintain accessibility standards including keyboard navigation
6. THE Plushie_Tracker_System SHALL use shadcn/ui components as the primary UI component library
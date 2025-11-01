import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type {
    Store,
    Entry,
    UserSettings,
    DateRange,
    DateRangePreset,
    AppStateV1
} from '@/types';
import {
    generateId,
    getDateRangeFromPreset
} from '@/utils';
import {
    saveToStorage,
    loadFromStorage,
    getStorageInfo,
    StorageError,
    StorageQuotaError,
    StorageValidationError
} from '@/lib/storage';

/**
 * UI State interface for managing application UI state
 */
interface UIState {
    selectedDateRange: DateRange;
    selectedDateRangePreset: DateRangePreset;
    activeStoreId: string | null;
    isLoading: boolean;
    customDateRange?: DateRange;
}

/**
 * Complete application store interface
 */
interface AppStore {
    // Data state
    stores: Store[];
    userSettings: UserSettings;

    // UI state
    ui: UIState;

    // Store management actions
    addStore: (store: Omit<Store, 'id' | 'entries'>) => void;
    updateStore: (id: string, updates: Partial<Omit<Store, 'id' | 'entries'>>) => void;
    deleteStore: (id: string) => void;

    // Entry management actions
    addEntry: (storeId: string, entry: Omit<Entry, 'id'>) => void;
    updateEntry: (storeId: string, entryId: string, updates: Partial<Omit<Entry, 'id'>>) => void;
    deleteEntry: (storeId: string, entryId: string) => void;

    // UI state actions
    setDateRange: (preset: DateRangePreset, customRange?: DateRange) => void;
    setActiveStore: (storeId: string | null) => void;
    setLoading: (loading: boolean) => void;

    // Settings actions
    updateUserSettings: (settings: Partial<UserSettings>) => void;

    // Data management actions
    exportData: () => AppStateV1;
    importData: (data: AppStateV1) => void;
    clearAllData: () => void;

    // Storage management actions
    getStorageInfo: () => { used: number; available: boolean };
    handleStorageError: (error: StorageError) => void;

    // Computed getters
    getStoreById: (id: string) => Store | undefined;
    getEntriesForDateRange: (storeId?: string) => Entry[];
    getActiveStore: () => Store | undefined;
}

/**
 * Default user settings
 */
const defaultUserSettings: UserSettings = {
    defaultCommissionPercent: 20,
    dateLocale: 'es-MX',
};

/**
 * Default UI state
 */
const defaultUIState: UIState = {
    selectedDateRange: getDateRangeFromPreset('este-mes'),
    selectedDateRangePreset: 'este-mes',
    activeStoreId: null,
    isLoading: false,
};

/**
 * Initialize store with data from LocalStorage
 */
const initializeStore = (): Partial<AppStore> => {
    try {
        const savedData = loadFromStorage();
        if (savedData) {
            return {
                stores: savedData.stores,
                userSettings: savedData.userSettings,
                ui: {
                    ...defaultUIState,
                    activeStoreId: savedData.stores.length > 0 ? savedData.stores[0].id : null,
                },
            };
        }
    } catch (error) {
        console.error('Failed to load data from storage:', error);
        // Continue with default state
    }

    return {
        stores: [],
        userSettings: defaultUserSettings,
        ui: defaultUIState,
    };
};

/**
 * Save current state to storage
 */
const persistState = (state: AppStore): void => {
    try {
        const dataToSave: AppStateV1 = {
            version: 1,
            currency: 'MXN',
            stores: state.stores,
            userSettings: state.userSettings,
        };

        // Use synchronous storage to avoid async issues in subscription
        saveToStorage(dataToSave);
    } catch (error) {
        console.error('Failed to save data to storage:', error);

        // Handle quota exceeded error
        if (error instanceof StorageQuotaError) {
            // Could emit an event or show a notification here
            console.warn('Storage quota exceeded. Consider exporting and clearing data.');
        }
    }
};

/**
 * Main application store using Zustand
 */
export const useAppStore = create<AppStore>()(
    subscribeWithSelector((set, get) => {
        const initialState = initializeStore();

        return {
            // Initial state
            stores: initialState.stores || [],
            userSettings: initialState.userSettings || defaultUserSettings,
            ui: initialState.ui || defaultUIState,

            // Store management actions
            addStore: (storeData) => {
                const newStore: Store = {
                    ...storeData,
                    id: generateId(),
                    entries: [],
                };

                set((state) => ({
                    stores: [...state.stores, newStore],
                    ui: {
                        ...state.ui,
                        // Set as active store if it's the first one
                        activeStoreId: state.stores.length === 0 ? newStore.id : state.ui.activeStoreId,
                    },
                }));
            },

            updateStore: (id, updates) => {
                set((state) => ({
                    stores: state.stores.map((store) =>
                        store.id === id ? { ...store, ...updates } : store
                    ),
                }));
            },

            deleteStore: (id) => {
                set((state) => {
                    const remainingStores = state.stores.filter((store) => store.id !== id);
                    const newActiveStoreId = state.ui.activeStoreId === id
                        ? (remainingStores.length > 0 ? remainingStores[0].id : null)
                        : state.ui.activeStoreId;

                    return {
                        stores: remainingStores,
                        ui: {
                            ...state.ui,
                            activeStoreId: newActiveStoreId,
                        },
                    };
                });
            },

            // Entry management actions
            addEntry: (storeId, entryData) => {
                const newEntry: Entry = {
                    ...entryData,
                    id: generateId(),
                };

                set((state) => ({
                    stores: state.stores.map((store) =>
                        store.id === storeId
                            ? { ...store, entries: [...store.entries, newEntry] }
                            : store
                    ),
                }));
            },

            updateEntry: (storeId, entryId, updates) => {
                set((state) => ({
                    stores: state.stores.map((store) =>
                        store.id === storeId
                            ? {
                                ...store,
                                entries: store.entries.map((entry) =>
                                    entry.id === entryId ? { ...entry, ...updates } : entry
                                ),
                            }
                            : store
                    ),
                }));
            },

            deleteEntry: (storeId, entryId) => {
                set((state) => ({
                    stores: state.stores.map((store) =>
                        store.id === storeId
                            ? {
                                ...store,
                                entries: store.entries.filter((entry) => entry.id !== entryId),
                            }
                            : store
                    ),
                }));
            },

            // UI state actions
            setDateRange: (preset, customRange) => {
                const dateRange = preset === 'custom' && customRange
                    ? customRange
                    : getDateRangeFromPreset(preset, customRange);

                set((state) => ({
                    ui: {
                        ...state.ui,
                        selectedDateRange: dateRange,
                        selectedDateRangePreset: preset,
                        customDateRange: preset === 'custom' ? customRange : state.ui.customDateRange,
                    },
                }));
            },

            setActiveStore: (storeId) => {
                set((state) => ({
                    ui: {
                        ...state.ui,
                        activeStoreId: storeId,
                    },
                }));
            },

            setLoading: (loading) => {
                set((state) => ({
                    ui: {
                        ...state.ui,
                        isLoading: loading,
                    },
                }));
            },

            // Settings actions
            updateUserSettings: (settings) => {
                set((state) => ({
                    userSettings: {
                        ...state.userSettings,
                        ...settings,
                    },
                }));
            },

            // Data management actions
            exportData: () => {
                const state = get();
                return {
                    version: 1 as const,
                    currency: 'MXN' as const,
                    stores: state.stores,
                    userSettings: state.userSettings,
                };
            },

            importData: (data) => {
                set({
                    stores: data.stores,
                    userSettings: data.userSettings,
                    ui: {
                        ...defaultUIState,
                        activeStoreId: data.stores.length > 0 ? data.stores[0].id : null,
                    },
                });
            },

            clearAllData: () => {
                set({
                    stores: [],
                    userSettings: defaultUserSettings,
                    ui: defaultUIState,
                });
            },

            // Storage management actions
            getStorageInfo: () => {
                return getStorageInfo();
            },

            handleStorageError: (error: StorageError) => {
                console.error('Storage error:', error);

                if (error instanceof StorageQuotaError) {
                    // Could trigger a toast notification or modal here
                    console.warn('Storage quota exceeded. Consider exporting and clearing data.');
                } else if (error instanceof StorageValidationError) {
                    console.warn('Data validation error:', error.message);
                } else {
                    console.error('General storage error:', error.message);
                }
            },

            // Computed getters
            getStoreById: (id) => {
                return get().stores.find((store) => store.id === id);
            },

            getEntriesForDateRange: (storeId) => {
                const state = get();
                const stores = storeId
                    ? state.stores.filter((store) => store.id === storeId)
                    : state.stores;

                const allEntries = stores.flatMap((store) => store.entries);

                // Filter entries by date range
                return allEntries.filter((entry) => {
                    try {
                        const entryDate = new Date(entry.date.split('/').reverse().join('-'));
                        return entryDate >= state.ui.selectedDateRange.start &&
                            entryDate <= state.ui.selectedDateRange.end;
                    } catch {
                        return false;
                    }
                });
            },

            getActiveStore: () => {
                const state = get();
                return state.ui.activeStoreId
                    ? state.stores.find((store) => store.id === state.ui.activeStoreId)
                    : undefined;
            },
        };
    })
);

// Subscribe to store changes and persist to LocalStorage
let persistTimeout: number | null = null;

useAppStore.subscribe(
    (state) => ({ stores: state.stores, userSettings: state.userSettings }),
    (current) => {
        // Debounce persistence to avoid infinite loops
        if (persistTimeout) {
            clearTimeout(persistTimeout);
        }

        persistTimeout = setTimeout(() => {
            try {
                persistState(current as AppStore);
            } catch (error) {
                console.error('Failed to persist state:', error);
            }
        }, 100); // 100ms debounce
    },
    {
        equalityFn: (a, b) => {
            // Use a more efficient equality check
            if (a === b) return true;
            if (!a || !b) return false;

            return (
                a.stores.length === b.stores.length &&
                a.userSettings.defaultCommissionPercent === b.userSettings.defaultCommissionPercent &&
                a.userSettings.dateLocale === b.userSettings.dateLocale &&
                JSON.stringify(a.stores) === JSON.stringify(b.stores)
            );
        }
    }
);

/**
 * Selector hooks for specific parts of the store
 */

// Store selectors
export const useStores = () => useAppStore((state) => state.stores);
export const useActiveStore = () => useAppStore((state) => state.getActiveStore());
export const useStoreById = (id: string) => useAppStore((state) => state.getStoreById(id));

// UI state selectors
export const useUIState = () => useAppStore((state) => state.ui);
export const useDateRange = () => useAppStore((state) => state.ui.selectedDateRange);
export const useActiveStoreId = () => useAppStore((state) => state.ui.activeStoreId);
export const useIsLoading = () => useAppStore((state) => state.ui.isLoading);

// Settings selectors
export const useUserSettings = () => useAppStore((state) => state.userSettings);

// Individual action selectors to prevent object recreation
export const useAddStore = () => useAppStore((state) => state.addStore);
export const useDeleteStore = () => useAppStore((state) => state.deleteStore);

// Additional individual action selectors
export const useUpdateStore = () => useAppStore((state) => state.updateStore);
export const useAddEntry = () => useAppStore((state) => state.addEntry);
export const useUpdateEntry = () => useAppStore((state) => state.updateEntry);
export const useDeleteEntry = () => useAppStore((state) => state.deleteEntry);
export const useSetDateRange = () => useAppStore((state) => state.setDateRange);
export const useSetActiveStore = () => useAppStore((state) => state.setActiveStore);
export const useSetLoading = () => useAppStore((state) => state.setLoading);
export const useExportData = () => useAppStore((state) => state.exportData);
export const useImportData = () => useAppStore((state) => state.importData);
export const useClearAllData = () => useAppStore((state) => state.clearAllData);
export const useUpdateUserSettings = () => useAppStore((state) => state.updateUserSettings);
export const useGetStorageInfo = () => useAppStore((state) => state.getStorageInfo);
export const useHandleStorageError = () => useAppStore((state) => state.handleStorageError);
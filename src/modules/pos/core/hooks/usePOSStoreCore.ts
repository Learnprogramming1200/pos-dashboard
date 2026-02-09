'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { posAPI } from '../pos.api';
import type { Store, UserRole } from '../pos.types';

// Roles that CAN change store
const ROLES_CAN_CHANGE_STORE: UserRole[] = ['superadmin', 'admin', 'manager'];

export interface UsePOSStoreCoreOptions {
    initialStoreId?: string;
    userRole?: UserRole;
    userAssignedStoreId?: string;
}

export interface UsePOSStoreCoreReturn {
    // State
    stores: Store[];
    selectedStoreId: string | null;
    selectedStore: Store | null;
    isLoading: boolean;
    error: string | null;
    canChangeStore: boolean;

    // Actions
    fetchStores: () => Promise<{ stores: Store[], selectedStoreId: string | null }>;
    setSelectedStore: (storeId: string) => Promise<void>;
    getStoreById: (storeId: string) => Store | null;
    setStoresData: (stores: Store[], selectedStoreId: string | null) => void;

    // Internal
    abortController: React.MutableRefObject<AbortController | null>;
}

export function usePOSStoreCore(options: UsePOSStoreCoreOptions = {}): UsePOSStoreCoreReturn {
    const { initialStoreId, userRole = 'cashier', userAssignedStoreId } = options;

    // State
    const [stores, setStores] = useState<Store[]>([]);
    const [selectedStoreId, setSelectedStoreId] = useState<string | null>(initialStoreId || null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Abort controller for cancelling requests
    const abortController = useRef<AbortController | null>(null);

    // Derived: Can change store based on role
    const canChangeStore = ROLES_CAN_CHANGE_STORE.includes(userRole);

    // Derived: Selected store object
    const selectedStore = stores.find((s: Store) => s._id === selectedStoreId) || null;

    // Get store by ID
    const getStoreById = useCallback((storeId: string): Store | null => {
        return stores.find((s: Store) => s._id === storeId) || null;
    }, [stores]);

    // Fetch all active stores - uses unified API for refresh
    const fetchStores = useCallback(async (): Promise<{ stores: Store[], selectedStoreId: string | null }> => {
        // Cancel any pending request
        if (abortController.current) {
            abortController.current.abort();
        }
        abortController.current = new AbortController();

        setIsLoading(true);
        setError(null);

        try {
            // Use unified POS initialization API to refresh stores
            const response = await posAPI.initialize({
                storeId: initialStoreId,
                userAssignedStoreId: userAssignedStoreId,
            });

            if (!response.success) {
                throw new Error(response.error || 'Failed to fetch stores');
            }

            const fetchedStores = response.data.stores;
            setStores(fetchedStores);

            // Determine initial selected store
            let currentSelectedId = selectedStoreId;

            if (!currentSelectedId && fetchedStores.length > 0) {
                let storeToSelect: string | null = null;

                // Priority 1: User assigned store (for cashiers)
                if (userAssignedStoreId) {
                    const assignedStore = fetchedStores.find((s: Store) => s._id === userAssignedStoreId);
                    if (assignedStore) {
                        storeToSelect = assignedStore._id;
                    }
                }

                // Priority 2: Initial store ID from options
                if (!storeToSelect && initialStoreId) {
                    const initialStore = fetchedStores.find((s: Store) => s._id === initialStoreId);
                    if (initialStore) {
                        storeToSelect = initialStore._id;
                    }
                }

                // Priority 3: First available store
                if (!storeToSelect) {
                    storeToSelect = fetchedStores[0]._id;
                }

                setSelectedStoreId(storeToSelect);
                currentSelectedId = storeToSelect;
            }

            return { stores: fetchedStores, selectedStoreId: currentSelectedId };
        } catch (err: any) {
            if (err.name !== 'AbortError') {
                const errorMessage = err.message || 'Failed to fetch stores';
                setError(errorMessage);
                console.error('Error fetching stores:', err);
            }
            return { stores: [], selectedStoreId: null };
        } finally {
            setIsLoading(false);
        }
    }, [selectedStoreId, userAssignedStoreId, initialStoreId]);

    // Set selected store with validation
    const setSelectedStore = useCallback(async (storeId: string): Promise<void> => {
        // SECURITY: Prevent store change if user doesn't have permission
        if (!canChangeStore) {
            console.warn('User role does not allow store change');
            return;
        }

        // Validate store exists
        const store = stores.find(s => s._id === storeId);
        if (!store) {
            console.warn('Store not found:', storeId);
            return;
        }

        // Cancel any pending requests
        if (abortController.current) {
            abortController.current.abort();
        }
        abortController.current = new AbortController();

        setSelectedStoreId(storeId);
    }, [canChangeStore, stores]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (abortController.current) {
                abortController.current.abort();
            }
        };
    }, []);

    // Set stores data from unified API (skips API call)
    const setStoresData = useCallback((storesData: Store[], initialSelectedStoreId: string | null) => {
        setStores(storesData);
        setSelectedStoreId(initialSelectedStoreId);
    }, []);

    return {
        stores,
        selectedStoreId,
        selectedStore,
        isLoading,
        error,
        canChangeStore,
        fetchStores,
        setSelectedStore,
        getStoreById,
        setStoresData,
        abortController,
    };
}

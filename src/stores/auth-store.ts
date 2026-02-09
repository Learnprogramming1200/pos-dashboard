/**
 * Global Auth Store using Zustand
 * 
 * This store manages:
 * - User role
 * - Tab-based permissions from /admin/access-control/me
 * - Permission checking utilities
 * 
 * Design principles:
 * - Single source of truth for permissions
 * - No refetching on route change (cached after first load)
 * - Memoized permission checks
 * - Type-safe throughout
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// ============================================================================
// Types
// ============================================================================

export type UserRole = 'superadmin' | 'admin' | 'manager' | 'cashier' | null;

export interface TabPermission {
    /**
     * Standardized permissions coming from backend.
     *
     * NOTE:
     * - Some roles use `view` instead of `read` for read access.
     * - Our login redirect logic already treats `view` as read.
     * - To keep behavior consistent across the app, `view` must be
     *   handled here as an alias for `read`.
     */
    read?: boolean;
    /** Alias used by some APIs for read access */
    view?: boolean;
    create?: boolean;
    add?: boolean;
    update?: boolean;
    edit?: boolean;
    delete?: boolean;
    remove?: boolean;
}

export interface PermissionResponse {
    role: UserRole;
    isBypassRole: boolean;
    tabs: Record<string, TabPermission>;
}

export interface AuthState {
    // State
    role: UserRole;
    permissions: Record<string, TabPermission> | null;
    isBypassRole: boolean;
    isLoading: boolean;
    isInitialized: boolean;
    lastFetchedAt: number | null;

    // Actions
    setRole: (role: UserRole) => void;
    setPermissions: (data: PermissionResponse) => void;
    setLoading: (loading: boolean) => void;
    setInitialized: (initialized: boolean) => void;
    reset: () => void;

    // Permission Helpers
    hasPermission: (key: string, action: 'read' | 'create' | 'update' | 'delete') => boolean;
    canAccess: (permissionKey: string) => boolean;
    isSuperAdmin: () => boolean;
    isAdmin: () => boolean;
    isManager: () => boolean;
    isCashier: () => boolean;
    hasAnyRole: (...roles: UserRole[]) => boolean;
}

// ============================================================================
// Initial State
// ============================================================================

const initialState = {
    role: null as UserRole,
    permissions: null as Record<string, TabPermission> | null,
    isBypassRole: false,
    isLoading: false,
    isInitialized: false,
    lastFetchedAt: null as number | null,
};

// ============================================================================
// Store Implementation
// ============================================================================

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            ...initialState,

            // ========================================
            // Actions
            // ========================================

            setRole: (role) => set({ role }),

            setPermissions: (data) => set({
                role: data.role,
                permissions: data.tabs,
                isBypassRole: data.isBypassRole,
                isInitialized: true,
                isLoading: false,
                lastFetchedAt: Date.now(),
            }),

            setLoading: (isLoading) => set({ isLoading }),

            setInitialized: (isInitialized) => set({ isInitialized }),

            reset: () => set(initialState),

            // ========================================
            // Permission Helpers
            // ========================================

            /**
             * Check if user has specific permission for a given action
             * Bypass roles (superadmin, admin) have full access
             */
            hasPermission: (key, action) => {
                const { role, permissions, isBypassRole } = get();

                // Superadmin and admin have full access
                if (role === 'superadmin' || role === 'admin' || isBypassRole) {
                    return true;
                }

                if (!permissions) return false;

                const perm = permissions[key];
                if (!perm) {
                    // Try to find by last part of key (e.g., "products" in "inventory.products")
                    const foundKey = Object.keys(permissions).find(k => {
                        const parts = k.split('.');
                        return parts[parts.length - 1] === key;
                    });
                    if (foundKey) {
                        return get().hasPermission(foundKey, action);
                    }
                    return false;
                }

                switch (action) {
                    case 'read':
                        // Treat `view` as read permission to match
                        // login redirect logic and backend payload shape.
                        return !!(perm.read || (perm as any).view);
                    case 'create':
                        return !!(perm.create || perm.add);
                    case 'update':
                        return !!(perm.update || perm.edit);
                    case 'delete':
                        return !!(perm.delete || perm.remove);
                    default:
                        return false;
                }
            },

            /**
             * Check if user can access a page (has read permission)
             */
            canAccess: (permissionKey) => {
                return get().hasPermission(permissionKey, 'read');
            },

            /**
             * Role check helpers
             */
            isSuperAdmin: () => get().role === 'superadmin',
            isAdmin: () => get().role === 'admin',
            isManager: () => get().role === 'manager',
            isCashier: () => get().role === 'cashier',

            /**
             * Check if user has any of the specified roles
             */
            hasAnyRole: (...roles) => {
                const currentRole = get().role;
                return roles.includes(currentRole);
            },
        }),
        {
            name: 'pos-auth-storage',
            storage: createJSONStorage(() => sessionStorage),
            partialize: (state) => ({
                role: state.role,
                permissions: state.permissions,
                isBypassRole: state.isBypassRole,
                isInitialized: state.isInitialized,
                lastFetchedAt: state.lastFetchedAt,
            }),
        }
    )
);

// ============================================================================
// Selectors (for optimized re-renders)
// ============================================================================

export const selectRole = (state: AuthState) => state.role;
export const selectPermissions = (state: AuthState) => state.permissions;
export const selectIsLoading = (state: AuthState) => state.isLoading;
export const selectIsInitialized = (state: AuthState) => state.isInitialized;
export const selectIsBypassRole = (state: AuthState) => state.isBypassRole;

// ============================================================================
// Utility: Permission cache check
// ============================================================================

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const isPermissionCacheValid = (): boolean => {
    const { lastFetchedAt, isInitialized } = useAuthStore.getState();
    if (!isInitialized || !lastFetchedAt) return false;
    return Date.now() - lastFetchedAt < CACHE_DURATION;
};

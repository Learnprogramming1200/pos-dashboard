/**
 * Auth Provider Component
 * 
 * Responsible for:
 * - Fetching permissions once on mount (if not cached)
 * - Syncing session role with auth store
 * - Not refetching on route change
 * 
 * Performance optimizations:
 * - Uses sessionStorage cache to avoid refetching on route change
 * - Cache validated on login
 */

'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useAuthStore, isPermissionCacheValid } from '@/stores/auth-store';
import { ServerActions } from '@/lib';
import { getUserRole } from '@/lib/utils';

interface AuthProviderProps {
    children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const { data: session, status } = useSession();
    const isInitialMount = useRef(true);
    const fetchingRef = useRef(false);
    const lastSessionId = useRef<string | null>(null);

    const {
        setRole,
        setPermissions,
        setLoading,
        setInitialized,
        role: storedRole,
        isInitialized,
        reset,
    } = useAuthStore();

    const fetchPermissions = useCallback(async () => {
        // Prevent concurrent fetches
        if (fetchingRef.current) return;
        fetchingRef.current = true;

        console.log('[AuthProvider] Fetching permissions from API...');

        try {
            setLoading(true);
            const response = await ServerActions.ServerActionslib.getRolePermissionsMeAction();

            console.log('[AuthProvider] API Response:', response?.success ? 'Success' : 'Failed');

            if (response?.success && response?.data) {
                const data = response.data.data || response.data;
                setPermissions({
                    role: data.role || storedRole,
                    isBypassRole: data.isBypassRole || false,
                    tabs: data.tabs || {},
                });
                console.log('[AuthProvider] Permissions stored:', Object.keys(data.tabs || {}).length, 'tabs');
            } else {
                // If fetch fails, still mark as initialized to prevent blocking
                setInitialized(true);
                setLoading(false);
            }
        } catch (error) {
            console.error('[AuthProvider] Failed to fetch permissions:', error);
            setInitialized(true);
            setLoading(false);
        } finally {
            fetchingRef.current = false;
        }
    }, [setLoading, setPermissions, setInitialized, storedRole]);

    useEffect(() => {
        // Wait for session to be determined
        if (status === 'loading') return;

        const rawRole = getUserRole(session?.user);
        // Cast to UserRole - null if undefined or not a valid role
        const sessionRole = (rawRole === 'superadmin' || rawRole === 'admin' || rawRole === 'manager' || rawRole === 'cashier')
            ? rawRole
            : null;

        // Detect new login (different session)
        const currentSessionId = session?.user?.id || session?.user?.email || null;
        const isNewSession = currentSessionId && currentSessionId !== lastSessionId.current;

        if (isNewSession) {
            console.log('[AuthProvider] New session detected, will fetch permissions');
            lastSessionId.current = currentSessionId;
            // Reset cache for new session
            if (lastSessionId.current !== null) {
                // Don't reset on first mount, only on actual session change
            }
        }

        // Update role if changed
        if (sessionRole !== storedRole) {
            console.log('[AuthProvider] Role changed:', storedRole, '->', sessionRole);
            setRole(sessionRole);
        }

        // Determine if we should fetch
        const shouldFetch = (() => {
            // No session = no fetch
            if (!sessionRole) return false;

            // First time initialization = always fetch
            if (!isInitialized) {
                console.log('[AuthProvider] First init, will fetch');
                return true;
            }

            // New session = always fetch
            if (isNewSession) {
                console.log('[AuthProvider] New session, will fetch');
                return true;
            }

            // Cache expired = fetch
            if (!isPermissionCacheValid()) {
                console.log('[AuthProvider] Cache expired, will fetch');
                return true;
            }

            console.log('[AuthProvider] Using cached permissions');
            return false;
        })();

        if (shouldFetch && sessionRole) {
            fetchPermissions();
        } else if (sessionRole && !isInitialized) {
            // For bypass roles with existing cache, just mark as initialized
            setInitialized(true);
        }

        // Reset on logout
        if (!sessionRole && isInitialized && !isInitialMount.current) {
            console.log('[AuthProvider] Session ended, resetting store');
            reset();
        }

        isInitialMount.current = false;
    }, [status, session, storedRole, isInitialized, setRole, setInitialized, fetchPermissions, reset]);

    return <>{children}</>;
}


/**
 * Page Guard Component - Page-Level Authorization
 * 
 * This component MUST be used in every dashboard page to:
 * 1. Check if user has permission to view the page
 * 2. Redirect to /dashboard/unauthorized if not authorized
 * 3. Show loading state while permissions are being fetched
 * 
 * Critical Security: Do NOT rely only on sidebar hiding!
 * Users can directly access URLs, so page-level checks are essential.
 */

'use client';

import React, { useEffect, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { getPermissionKeyForPath } from '@/config/navigation.config';
import { Skeleton } from '@/components/ui/skeleton';

interface PageGuardProps {
    children: React.ReactNode;
    /** 
     * Explicit permission key to check. 
     * If not provided, will be inferred from the current path.
     */
    permissionKey?: string;
    /**
     * Required action type. Defaults to 'read'.
     */
    requiredAction?: 'read' | 'create' | 'update' | 'delete';
    /**
     * Custom fallback component during loading
     */
    loadingFallback?: React.ReactNode;
}

export function PageGuard({
    children,
    permissionKey: explicitKey,
    requiredAction = 'read',
    loadingFallback,
}: PageGuardProps) {
    const router = useRouter();
    const pathname = usePathname();

    const {
        role,
        isLoading,
        isInitialized,
        hasPermission,
        isBypassRole,
        permissions,
    } = useAuthStore();

    // Determine permission key
    const permissionKey = useMemo(() => {
        if (explicitKey) return explicitKey;
        return getPermissionKeyForPath(pathname || '');
    }, [explicitKey, pathname]);

    // Check authorization
    const isAuthorized = useMemo(() => {
        // Bypass roles have full access
        if (role === 'superadmin' || role === 'admin' || isBypassRole) {
            return true;
        }

        // If no permission key defined for this path, allow access
        // (This handles dynamic routes or pages without permission requirements)
        if (!permissionKey) {
            return true;
        }

        // Special handling for root dashboard:
        // - Some roles (manager/cashier) reported having dashboard read access
        //   but were still redirected due to mismatched keys or partial data.
        // - If they have ANY readable tab, allow /dashboard as a safe home.
        if (
            permissionKey === 'dashboard' &&
            (role === 'manager' || role === 'cashier')
        ) {
            const hasAnyReadableTab = Object.values(permissions || {}).some(
                (perm: any) => !!(perm && (perm.read || perm.view)),
            );
            if (hasAnyReadableTab) {
                return true;
            }
        }

        return hasPermission(permissionKey, requiredAction);
    }, [role, isBypassRole, permissionKey, requiredAction, hasPermission, permissions]);

    // Handle unauthorized access
    useEffect(() => {
        // Wait for initialization
        if (!isInitialized || isLoading) return;

        // Redirect if not authorized
        if (!isAuthorized) {
            router.replace('/dashboard/unauthorized');
        }
    }, [isInitialized, isLoading, isAuthorized, router]);

    // Loading state
    if (!isInitialized || isLoading) {
        return loadingFallback || <PageGuardSkeleton />;
    }

    // Unauthorized (will redirect)
    if (!isAuthorized) {
        return loadingFallback || <PageGuardSkeleton />;
    }

    return <>{children}</>;
}

/**
 * Default loading skeleton for page guard
 */
function PageGuardSkeleton() {
    return (
        <div className="p-6 space-y-6">
            <Skeleton className="h-8 w-64" />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-32 w-full" />
                ))}
            </div>
            <Skeleton className="h-64 w-full" />
        </div>
    );
}

/**
 * HOC version for class components or alternative usage
 */
export function withPageGuard<P extends object>(
    WrappedComponent: React.ComponentType<P>,
    options?: Omit<PageGuardProps, 'children'>
) {
    const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';

    const GuardedComponent = (props: P) => (
        <PageGuard {...options}>
            <WrappedComponent {...props} />
        </PageGuard>
    );

    GuardedComponent.displayName = `withPageGuard(${displayName})`;

    return GuardedComponent;
}

/**
 * Hook for checking permissions in components
 */
export function usePageAuthorization(permissionKey?: string, action: 'read' | 'create' | 'update' | 'delete' = 'read') {
    const pathname = usePathname();
    const {
        role,
        isLoading,
        isInitialized,
        hasPermission,
        isBypassRole,
    } = useAuthStore();

    const key = permissionKey || getPermissionKeyForPath(pathname || '');

    const isAuthorized = useMemo(() => {
        if (role === 'superadmin' || role === 'admin' || isBypassRole) return true;
        if (!key) return true;
        return hasPermission(key, action);
    }, [role, isBypassRole, key, action, hasPermission]);

    return {
        isAuthorized,
        isLoading: !isInitialized || isLoading,
        role,
    };
}

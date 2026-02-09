/**
 * Permission Action Guard Component
 * 
 * Use this component to conditionally render UI elements
 * based on specific permission actions (create, update, delete).
 * 
 * Example:
 * <ActionGuard permissionKey="inventory.products" action="create">
 *   <CreateButton />
 * </ActionGuard>
 */

'use client';

import React, { useMemo } from 'react';
import { useAuthStore } from '@/stores/auth-store';

interface ActionGuardProps {
    children: React.ReactNode;
    permissionKey: string;
    action: 'read' | 'create' | 'update' | 'delete';
    /**
     * Fallback component to render when not authorized.
     * If not provided, nothing is rendered.
     */
    fallback?: React.ReactNode;
}

export function ActionGuard({
    children,
    permissionKey,
    action,
    fallback = null,
}: ActionGuardProps) {
    const { role, hasPermission, isBypassRole, isInitialized } = useAuthStore();

    const isAuthorized = useMemo(() => {
        // Bypass roles have full access
        if (role === 'superadmin' || role === 'admin' || isBypassRole) {
            return true;
        }

        return hasPermission(permissionKey, action);
    }, [role, isBypassRole, permissionKey, action, hasPermission]);

    // Don't render anything while loading
    if (!isInitialized && role !== 'superadmin' && role !== 'admin') {
        return null;
    }

    if (!isAuthorized) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
}

/**
 * Hook for checking permission actions
 */
export function useActionPermission(permissionKey: string) {
    const { role, hasPermission, isBypassRole } = useAuthStore();

    return useMemo(() => ({
        canRead: role === 'superadmin' || role === 'admin' || isBypassRole || hasPermission(permissionKey, 'read'),
        canCreate: role === 'superadmin' || role === 'admin' || isBypassRole || hasPermission(permissionKey, 'create'),
        canUpdate: role === 'superadmin' || role === 'admin' || isBypassRole || hasPermission(permissionKey, 'update'),
        canDelete: role === 'superadmin' || role === 'admin' || isBypassRole || hasPermission(permissionKey, 'delete'),
    }), [role, isBypassRole, permissionKey, hasPermission]);
}

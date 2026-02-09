"use client";
import React from 'react';
import { useSession } from "next-auth/react";
import { getUserRole } from "@/lib/utils";
import { ServerActions } from "@/lib";

export const useUserPermissions = () => {
    const { data: session } = useSession();
    const userRole = getUserRole(session?.user);
    const [permissions, setPermissions] = React.useState<any>(null);

    React.useEffect(() => {
        if (userRole && userRole !== "superadmin" && userRole !== "admin") {
            const fetchPermissions = async () => {
                try {
                    const response = await ServerActions.ServerActionslib.getRolePermissionsMeAction();
                    if (response?.success && response?.data) {
                        const data = response.data.data || response.data;
                        setPermissions(data.tabs || {});
                    }
                } catch (error) {
                    console.error("Failed to fetch permissions", error);
                }
            };

            fetchPermissions();
        }
    }, [userRole]);

    const checkPermission = React.useCallback((key: string, action: string) => {
        if (userRole === "superadmin" || userRole === "admin") return true;
        if (!permissions) return false;

        const perm = permissions[key];
        if (perm) {
            if (action === 'create' && (perm.create || perm.add)) return true;
            if (action === 'update' && (perm.update || perm.edit)) return true;
            if (action === 'delete' && (perm.delete || perm.remove)) return true;
            if (action === 'read' && (perm.read || perm.view)) return true;
            return !!perm[action];
        }
        return false;
    }, [permissions, userRole]);

    return {
        userRole,
        permissions,
        checkPermission
    };
};

"use client";
import React from "react";
import { HiArrowLeft, HiPlus } from "react-icons/hi";
import { Constants } from "@/constant";
import { WebComponents } from "@/components";
import { AdminTypes } from "@/types";
import { ServerActions } from "@/lib";


interface ActionCheckboxProps {
    action: { exists: boolean; checked: boolean; key: string };
    moduleKey: string;
    roleKey: string;
    onToggle: (moduleKey: string, actionKey: string, roleKey: AdminTypes.RolePermissionTypes.RoleKey) => void;
}

const ActionCheckbox: React.FC<ActionCheckboxProps> = ({ action, moduleKey, roleKey, onToggle }) => {
    if (!action.exists) return <div className="flex justify-center"></div>;
    return (
        <div className="flex justify-center">
            <input
                type="checkbox"
                checked={action.checked}
                onChange={() => onToggle(moduleKey, action.key, roleKey as AdminTypes.RolePermissionTypes.RoleKey)}
                className="w-5 h-5 rounded border-gray-300 text-[#3B82F6] focus:ring-[#3B82F6] cursor-pointer accent-[#3B82F6]"
            />
        </div>
    );
};

interface PermissionRowProps {
    module: AdminTypes.RolePermissionTypes.ModuleGroup;
    selectedRoleKey: AdminTypes.RolePermissionTypes.RoleKey;
    onToggle: (moduleKey: string, actionKey: string, roleKey: AdminTypes.RolePermissionTypes.RoleKey) => void;
}

const PermissionRow: React.FC<PermissionRowProps> = ({ module, selectedRoleKey, onToggle }) => {

    const getActionStatus = (type: string) => {
        const targetKeys = type === 'view' ? ['view', 'access', 'read'] :
            type === 'add' ? ['add', 'create'] :
                type === 'edit' ? ['edit', 'update'] :
                    type === 'delete' ? ['delete', 'remove'] : [];

        const action = module.actions.find(a => targetKeys.includes(a.key));
        return action
            ? { exists: true, checked: action.permissions[selectedRoleKey] || false, key: action.key }
            : { exists: false, checked: false, key: '' };
    };

    return (
        <div className="relative group hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition-colors">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 items-center border-b border-gray-100 dark:border-[#2F2F2F] last:border-0">
                <div className="md:col-span-2 font-medium text-textMain dark:text-white pl-2">
                    {module.name}
                </div>
                <ActionCheckbox action={getActionStatus('view')} moduleKey={module.key} roleKey={selectedRoleKey} onToggle={onToggle} />
                <ActionCheckbox action={getActionStatus('add')} moduleKey={module.key} roleKey={selectedRoleKey} onToggle={onToggle} />
                <ActionCheckbox action={getActionStatus('edit')} moduleKey={module.key} roleKey={selectedRoleKey} onToggle={onToggle} />
                <ActionCheckbox action={getActionStatus('delete')} moduleKey={module.key} roleKey={selectedRoleKey} onToggle={onToggle} />
            </div>
        </div>
    );
};

// --- Main Component ---

export default function RolesPermission() {
    const [searchTerm, setSearchTerm] = React.useState("");
    const [modules, setModules] = React.useState<AdminTypes.RolePermissionTypes.ModuleGroup[]>([]);
    const [selectedRole, setSelectedRole] = React.useState<AdminTypes.RolePermissionTypes.RoleDefinition | null>(null);
    const [showAddRoleForm, setShowAddRoleForm] = React.useState(false);

    // Initial Load
    React.useEffect(() => {
        setModules(Constants.rolemodules.DEFAULT_MODULES);
    }, []);

    // Fetch Permissions when Role Selected
    React.useEffect(() => {
        if (!selectedRole?.key) return;

        const fetchRolePermissions = async () => {
            try {
                const response = await ServerActions.ServerActionslib.getRolePermissionsAction(selectedRole.key);

                if (response.success && response.data) {
                    const permissionsData = response.data.data || response.data;

                    // New Schema: tabs array
                    if (permissionsData.tabs && Array.isArray(permissionsData.tabs)) {
                        const tabs = permissionsData.tabs;

                        setModules(prev => prev.map(module => {
                            // Direct match using module.key as it now matches API tab IDs
                            const matchedTab = tabs.find((t: any) =>
                                t.id === module.key || t.id.toLowerCase() === module.key.toLowerCase()
                            );

                            if (!matchedTab) {
                                // No data found, reset permissions for this role
                                return {
                                    ...module,
                                    actions: module.actions.map(a => ({
                                        ...a,
                                        permissions: { ...a.permissions, [selectedRole.key]: false }
                                    }))
                                };
                            }

                            return {
                                ...module,
                                actions: module.actions.map(action => {
                                    let isAllowed = false; // Default to false
                                    const p = matchedTab.permissions;

                                    if (p) {
                                        if (['view', 'access', 'read'].includes(action.key)) isAllowed = p.read;
                                        else if (['add', 'create'].includes(action.key)) isAllowed = p.create;
                                        else if (['edit', 'update'].includes(action.key)) isAllowed = p.update;
                                        else if (['delete', 'remove'].includes(action.key)) isAllowed = p.delete;
                                    }

                                    return {
                                        ...action,
                                        permissions: {
                                            ...action.permissions,
                                            [selectedRole.key]: !!isAllowed
                                        }
                                    };
                                })
                            };
                        }));
                    }
                    // Legacy Schema: array of objects
                    else if (Array.isArray(permissionsData)) {
                        const permissionMap = new Map();
                        permissionsData.forEach((item: any) => {
                            const allowedActions = new Set(
                                item.permissions
                                    .filter((p: any) => p.isAllowed)
                                    .map((p: any) => p.name || p.action)
                            );
                            permissionMap.set(item.pageId, allowedActions);
                        });

                        setModules(prev => prev.map(m => {
                            const allowedActionsForModule = permissionMap.get(m.key);
                            return {
                                ...m,
                                actions: m.actions.map(a => ({
                                    ...a,
                                    permissions: {
                                        ...a.permissions,
                                        [selectedRole.key]: allowedActionsForModule ? allowedActionsForModule.has(a.key) : false
                                    }
                                }))
                            };
                        }));
                    }
                }
            } catch (error) {
                console.error("Failed to fetch permissions", error);
            }
        };
        fetchRolePermissions();
    }, [selectedRole]);

    const filteredModules = React.useMemo(() => {
        const query = searchTerm.trim().toLowerCase();
        return query
            ? modules.filter(module => module.name.toLowerCase().includes(query))
            : modules;
    }, [modules, searchTerm]);

    const togglePermission = (moduleKey: string, actionKey: string, roleKey: AdminTypes.RolePermissionTypes.RoleKey) => {
        setModules(prev => prev.map(module => {
            if (module.key !== moduleKey) return module;
            return {
                ...module,
                actions: module.actions.map(action => {
                    if (action.key !== actionKey) return action;
                    return {
                        ...action,
                        permissions: {
                            ...action.permissions,
                            [roleKey]: !action.permissions[roleKey],
                        },
                    };
                }),
            };
        }));
    };

    const handleSave = async () => {
        if (!selectedRole) return;

        const tabs = modules.map(module => {
            const check = (aliases: string[]) => {
                const action = module.actions.find(a => aliases.includes(a.key));
                return action ? (action.permissions[selectedRole.key] || false) : false;
            };

            return {
                id: module.key,
                label: module.name,
                permissions: {
                    create: check(['add', 'create']),
                    read: check(['view', 'access', 'read']),
                    update: check(['edit', 'update']),
                    delete: check(['delete', 'remove'])
                }
            };
        });

        const payload = { tabs };

        try {
            const response = await ServerActions.ServerActionslib.updateRolePermissionsAction(selectedRole.key, payload);
            if (response && response.success) {
                WebComponents.UiComponents.UiWebComponents.SwalHelper.success({ text: "Permissions saved successfully" });
            } else {
                WebComponents.UiComponents.UiWebComponents.SwalHelper.error({
                    text: (response?.error && typeof response.error === 'string') ? response.error : 'Failed to save permissions'
                });
            }
        } catch (error) {
            console.error("Error saving permissions:", error);
            WebComponents.UiComponents.UiWebComponents.SwalHelper.error({ text: "An unexpected error occurred while saving" });
        }
    };

    const handleAddRoleCallback = (data: any) => {
        setShowAddRoleForm(false);
        WebComponents.UiComponents.UiWebComponents.SwalHelper.success({ text: "Role created successfully" });
    };

    const handleBackToRoles = () => {
        setSelectedRole(null);
        setSearchTerm("");
    };

    const renderHeader = () => (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-6">
            <div>
                <h1 className="text-xl font-semibold text-textMain dark:text-white">
                    {showAddRoleForm ? "Permission & Role > Add Role" : (selectedRole ? selectedRole.label : "Permission & Role")}
                </h1>
            </div>
            <div>
                {selectedRole ? (
                    <WebComponents.AdminComponents.AdminWebComponents.Button
                        variant="addBackButton"
                        onClick={handleBackToRoles}
                        className="bg-[#3B82F6] hover:bg-[#2563EB] text-white border-0"
                    >
                        <HiArrowLeft className="w-4 h-4" />{Constants.adminConstants.backLabel}
                    </WebComponents.AdminComponents.AdminWebComponents.Button>
                ) : (
                    <WebComponents.AdminComponents.AdminWebComponents.Button
                        variant="permissionButton"
                        onClick={() => setShowAddRoleForm(!showAddRoleForm)}
                        className="text-white border-0"
                    >
                        {showAddRoleForm ? (
                            <><HiArrowLeft className="w-4 h-4" /> {Constants.adminConstants.back}</>
                        ) : (
                            <><HiPlus className="w-4 h-4" />{Constants.adminConstants.create}</>
                        )}
                    </WebComponents.AdminComponents.AdminWebComponents.Button>
                )}
            </div>
        </div>
    );

    return (
        <>
            {renderHeader()}

            {/* Role List View */}
            {!selectedRole && !showAddRoleForm && (
                <div className="flex flex-col gap-4">
                    {Constants.rolemodules.ROLE_DEFINITIONS.map((role) => (
                        <div key={role.key} className="bg-white dark:bg-[#333333] p-5 rounded-lg shadow-sm border border-gray-100 dark:border-[#2F2F2F] flex justify-between items-center transition-shadow hover:shadow-md">
                            <span className="font-medium text-textMain dark:text-white text-base">{role.label}</span>
                            <WebComponents.UiWebComponents.UiWebComponents.Button
                                variant="permissionButton"
                                onClick={() => setSelectedRole(role)}
                                className="text-white text-sm rounded transition-colors font-medium"
                            >
                                {Constants.adminConstants.RolesPermissionConstants.permission}
                            </WebComponents.UiWebComponents.UiWebComponents.Button>
                        </div>
                    ))}
                </div>
            )}

            {/* Permission Editor View */}
            {selectedRole && (
                <div className="bg-white dark:bg-[#1F1F1F] rounded-lg shadow-sm w-full">
                    <div className="sticky top-16 z-20 bg-white dark:bg-[#1F1F1F] rounded-t-lg shadow-sm">
                        <div className="p-4 border-b border-gray-100 dark:border-[#2F2F2F] flex justify-end">
                            <button
                                onClick={handleSave}
                                className="bg-[#1E293B] hover:bg-[#334155] text-white px-6 py-2 rounded text-sm font-medium flex items-center gap-2 transition-colors"
                            >
                                {Constants.adminConstants.save}
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 bg-[#F9FAFB] dark:bg-[#444444] border-b border-gray-100 dark:border-[#2F2F2F] text-sm font-semibold text-textSmall">
                            {[
                                { label: Constants.adminConstants.RolesPermissionConstants.modules, className: "md:col-span-2 pl-2" },
                                { label: Constants.adminConstants.RolesPermissionConstants.view, className: "text-center" },
                                { label: Constants.adminConstants.RolesPermissionConstants.add, className: "text-center" },
                                { label: Constants.adminConstants.RolesPermissionConstants.edit, className: "text-center" },
                                { label: Constants.adminConstants.RolesPermissionConstants.deleteLabel, className: "text-center" }
                            ].map((header, index) => (
                                <div key={index} className={`${header.className} dark:text-white`}>
                                    {header.label}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="divide-y divide-gray-100 dark:divide-[#2F2F2F]">
                        {filteredModules.map((module) => (
                            <PermissionRow
                                key={module.key}
                                module={module}
                                selectedRoleKey={selectedRole.key}
                                onToggle={togglePermission}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Role Form */}
            {showAddRoleForm && (
                <WebComponents.UiComponents.UiWebComponents.AdminFormModal
                    formId="role-form"
                    onClose={() => setShowAddRoleForm(false)}
                >
                    <WebComponents.AdminComponents.AdminWebComponents.Forms.RoleForm
                        onSubmit={handleAddRoleCallback}
                        initialValues={{ name: "", code: "", description: "", isActive: true }}
                    />
                </WebComponents.UiComponents.UiWebComponents.AdminFormModal>
            )}
        </>
    );
}

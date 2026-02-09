export type RoleKey = "admin" | "manager" | "cashier" | "generalstaff";

export type ModuleAction = {
    key: string;
    name: string;
    description?: string;
    permissions: Record<RoleKey, boolean>;
};

export type ModuleGroup = {
    key: string;
    name: string;
    actions: ModuleAction[];
};

export type RoleDefinition = {
    key: RoleKey;
    label: string;
};

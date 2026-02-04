export type TrialSettings = {
    _id?: string;
    description: string;
    duration: number;
    createdAt?: string;
    updatedAt?: string;
    __v?: number;
};

export type TrialSettingsFormData = {
    duration: number;
    description: string;
};
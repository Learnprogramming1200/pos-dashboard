"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from 'react-toastify';
import { WebComponents } from '@/components';
import { Constants } from '@/constant';
import { ServerActions } from '@/lib';
import { SuperAdminTypes } from '@/types';
import { trialSettingsSchema } from '@/app/validation/ValidationSchema';

interface TrialProps {
    trialSettings: SuperAdminTypes.SettingTypes.TrialSettingsTypes.TrialSettings | null;
}

const Trial = ({ trialSettings: initialSettings }: TrialProps) => {
    const router = useRouter();
    const [isLoading, setIsLoading] = React.useState(false);
    const [savedSection, setSavedSection] = React.useState<string | null>(null);

    type FormData = Yup.InferType<typeof trialSettingsSchema>;

    const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
        resolver: yupResolver(trialSettingsSchema) as any,
        defaultValues: {
            duration: initialSettings?.duration || 0,
            description: initialSettings?.description || '',
        },
    });

    React.useEffect(() => {
        if (initialSettings) {
            reset({
                duration: initialSettings.duration || 0,
                description: initialSettings.description || '',
            });
        }
    }, [initialSettings, reset]);

    const onSubmitForm = async (data: FormData) => {
        setIsLoading(true);
        try {
            const formData = {
                ...data,
                _id: initialSettings?._id,
            };

            const result = await ServerActions.ServerActionslib.updateTrialSettingsAction(formData);

            if (result?.success || result?.data) {
                toast.success('Trial settings saved successfully.');
                setSavedSection('trial');
                setTimeout(() => setSavedSection(null), 2000);
                router.refresh();
            } else {
                toast.error(result?.error || 'Failed to save trial settings');
            }
        } catch (error) {
            console.error('Error saving:', error);
            toast.error('Failed to save trial settings');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmitForm)} className='m-4'>
            <div className="space-y-4">
                <div>
                    <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="duration">Trial Days</WebComponents.UiComponents.UiWebComponents.FormLabel>
                    <WebComponents.UiComponents.UiWebComponents.FormInput
                        id="duration"
                        type="number"
                        {...register("duration")}
                        className={errors.duration ? "border-red-500" : ""}
                    />
                    {errors.duration && <p className="mt-1 text-sm text-red-500">{errors.duration.message}</p>}
                </div>

                <div>
                    <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="description">Trial Description</WebComponents.UiComponents.UiWebComponents.FormLabel>
                    <WebComponents.UiComponents.UiWebComponents.Textarea
                        id="description"
                        {...register("description")}
                        className={`min-h-[100px] resize-vertical ${errors.description ? "border-red-500" : ""}`}
                    />
                    {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>}
                </div>
            </div>
            <div className="mt-8">
                <WebComponents.UiComponents.UiWebComponents.SaveButtonWithStatus
                    onClick={handleSubmit(onSubmitForm)}
                    showStatus={savedSection === 'trial'}
                    disabled={isLoading}
                >
                    {Constants.superadminConstants.savetrialsettings}
                </WebComponents.UiComponents.UiWebComponents.SaveButtonWithStatus>
            </div>
        </form>
    );
};

export default Trial;

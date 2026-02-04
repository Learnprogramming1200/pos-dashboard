"use client";
import React from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { Constants } from "@/constant";
import { WebComponents } from "@/components";
import { businessTypeSchema } from "@/app/validation/ValidationSchema";
type FormData = Yup.InferType<typeof businessTypeSchema>;

const BusinessTypeFormModal = ({
    title,
    onClose,
    onSubmit,
    formData: initialData,
    setFormData,
    businessTypeLoading
}: {
    title: string;
    onClose: () => void;
    onSubmit: () => void;
    formData: {
        title: string;
        description: string;
        status: boolean;
    };
    setFormData: React.Dispatch<React.SetStateAction<{
        title: string;
        description: string;
        status: boolean;
    }>>;
    businessTypeLoading?: boolean;
}) => {
    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
        watch,
    } = useForm<FormData>({
        resolver: yupResolver(businessTypeSchema),
        defaultValues: {
            title: initialData.title || "",
            description: initialData.description || "",
            status: initialData.status ?? true,
        },
    });

    const description = watch("description") || "";

    // Sync form values with parent state
    React.useEffect(() => {
        const subscription = watch((value) => {
            setFormData({
                title: value.title || "",
                description: value.description || "",
                status: value.status ?? true,
            });
        });
        return () => subscription.unsubscribe();
    }, [watch, setFormData]);

    const handleFormSubmit = (data: FormData) => {
        // Update parent state before calling onSubmit
        setFormData(data);
        onSubmit();
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-darkFilterbar w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg p-4 sm:p-6 shadow-xl relative">
                <div className="flex justify-between items-center border-b pb-3 mb-4 border-[#F4F5F5] dark:border-[#616161]">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">{title}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white text-2xl">&times;</button>
                </div>
                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
                    <div className="space-y-6">
                        {/* Title */}
                        <div>
                            <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="business-type-title">
                                {Constants.superadminConstants.titlelabel} <span className="text-required">{Constants.superadminConstants.requiredstar}</span>
                            </WebComponents.UiComponents.UiWebComponents.FormLabel>
                            <WebComponents.UiComponents.UiWebComponents.FormInput
                                id="business-type-title"
                                type="text"
                                placeholder="Retail Stores"
                                {...register("title")}
                                autoComplete="off"
                            />
                            {errors.title && (
                                <p className="mt-1 text-sm text-required">{errors.title.message}</p>
                            )}
                        </div>

                        {/* Description */}
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="business-type-description">
                                    {Constants.superadminConstants.descriptionlabel} <span className="text-required">{Constants.superadminConstants.requiredstar}</span>
                                </WebComponents.UiComponents.UiWebComponents.FormLabel>
                                <p className="text-textSmall dark:text-gray-400 font-interTight font-normal text-xs sm:text-sm leading-[8px]">{Constants.superadminConstants.max250characters}</p>
                            </div>
                            <Controller
                                name="description"
                                control={control}
                                render={({ field, fieldState }) => (
                                    <>
                                        <WebComponents.UiComponents.UiWebComponents.Textarea
                                            {...field}
                                            id="business-type-description"
                                            placeholder="Clothing, electronics, groceries, and specialty retail stores"
                                            rows={3}
                                            charCounter={false}
                                            autoComplete="off"
                                        />
                                        <div className="flex justify-between items-center mt-1">
                                            {fieldState.error ? (
                                                <p className="text-sm text-required">{fieldState.error.message}</p>
                                            ) : (
                                                <div />
                                            )}
                                            <div className="text-xs text-textSmall font-interTight font-normal">
                                                {description.length}/250
                                            </div>
                                        </div>
                                    </>
                                )}
                            />
                        </div>

                        {/* Status */}
                        <div>
                            <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="business-type-status-toggle">
                                {Constants.superadminConstants.statuslabel} <span className="text-required">{Constants.superadminConstants.requiredstar}</span>
                            </WebComponents.UiComponents.UiWebComponents.FormLabel>
                            <Controller
                                name="status"
                                control={control}
                                render={({ field: { value, onChange } }) => (
                                    <div className="h-[44px] w-full rounded-[4px] border-[0.6px] border-[#D8D9D9] dark:border-[#616161] bg-textMain2 dark:bg-[#1B1B1B]">
                                        <div className="flex items-center justify-between px-3 sm:px-4 py-[10px]">
                                            <span className="text-xs sm:text-sm font-interTight font-medium leading-[14px] text-textMain dark:text-white">
                                                {value ? Constants.superadminConstants.activestatus : Constants.superadminConstants.inactivestatus}
                                            </span>
                                            <WebComponents.UiComponents.UiWebComponents.Switch
                                                id="business-type-status-toggle"
                                                checked={value}
                                                onCheckedChange={onChange}
                                                aria-label="Toggle business type status"
                                            />
                                        </div>
                                    </div>
                                )}
                            />
                            {errors.status && (
                                <p className="mt-1 text-sm text-required">{errors.status.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
                        <WebComponents.UiComponents.UiWebComponents.Button
                            variant="cancel"
                            type="button"
                            onClick={onClose}
                            aria-label="Cancel form"
                        >
                            {Constants.superadminConstants.cancelbutton}
                        </WebComponents.UiComponents.UiWebComponents.Button>
                        <WebComponents.UiComponents.UiWebComponents.Button
                            variant="save"
                            type="submit"
                            disabled={businessTypeLoading}
                        >
                            {Constants.superadminConstants.save}
                        </WebComponents.UiComponents.UiWebComponents.Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default BusinessTypeFormModal;
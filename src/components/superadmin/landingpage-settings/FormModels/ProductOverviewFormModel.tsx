"use client";
import React from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { Constants } from "@/constant";
import { WebComponents } from "@/components";
import { productOverviewSchema } from "@/app/validation/ValidationSchema";

type FormData = Yup.InferType<typeof productOverviewSchema>;

const ProductOverviewFormModel = ({
    title,
    onClose,
    onSubmit,
    formData: initialData,
    setFormData,
    productOverviewLoading,
    setSelectedFile
}: {
    title: string;
    onClose: () => void;
    onSubmit: () => void;
    formData: {
        title: string;
        description: string;
        overviewImage: string | File | undefined;
        status: boolean;
    };
    setFormData: React.Dispatch<React.SetStateAction<{
        title: string;
        description: string;
        overviewImage: string | File | undefined;
        status: boolean;
    }>>;
    productOverviewLoading?: boolean;
    setSelectedFile: (file: File | null) => void;
}) => {
    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
        watch,
        setValue
    } = useForm<FormData>({
        resolver: yupResolver(productOverviewSchema) as any,
        defaultValues: {
            title: initialData.title || "",
            description: initialData.description || "",
            status: initialData.status ?? true,
            overviewImage: initialData.overviewImage as any
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
                overviewImage: (value.overviewImage as string | File | undefined)
            });
        });
        return () => subscription.unsubscribe();
    }, [watch, setFormData]);

    const handleFormSubmit = (data: FormData) => {
        // Update parent state before calling onSubmit
        setFormData({
            title: data.title,
            description: data.description,
            status: data.status,
            overviewImage: (data.overviewImage as string | File | undefined)
        });
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
                            <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="product-overview-title">
                                {Constants.superadminConstants.titlelabel} <span className="text-required">{Constants.superadminConstants.requiredstar}</span>
                            </WebComponents.UiComponents.UiWebComponents.FormLabel>
                            <WebComponents.UiComponents.UiWebComponents.FormInput
                                id="product-overview-title"
                                type="text"
                                placeholder="Enter title"
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
                                <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="product-overview-description">
                                    {Constants.superadminConstants.descriptionlabel} <span className="text-required">{Constants.superadminConstants.requiredstar}</span>
                                </WebComponents.UiComponents.UiWebComponents.FormLabel>
                                <p className="text-textSmall dark:text-gray-400 font-interTight font-normal text-xs sm:text-sm leading-[8px]">{Constants.superadminConstants.max500characters}</p>
                            </div>
                            <Controller
                                name="description"
                                control={control}
                                render={({ field, fieldState }) => (
                                    <>
                                        <WebComponents.UiComponents.UiWebComponents.Textarea
                                            {...field}
                                            id="product-overview-description"
                                            placeholder="Enter description"
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
                                                {description.length}/500
                                            </div>
                                        </div>
                                    </>
                                )}
                            />
                        </div>

                        {/* Image Upload */}
                        <div>
                            <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="product-overview-image">
                                {Constants.superadminConstants.imagelabel} <span className="text-required">{Constants.superadminConstants.requiredstar}</span>
                            </WebComponents.UiComponents.UiWebComponents.FormLabel>
                            <div className="mt-1">
                                <Controller
                                    name="overviewImage"
                                    control={control}
                                    render={({ field }) => (
                                        <WebComponents.UiComponents.UiWebComponents.ImageCropUpload
                                            id="product-overview-image"
                                            value={field.value as any}
                                            onChange={(val) => {
                                                field.onChange(val as any);
                                                setSelectedFile(val instanceof File ? val : null);
                                            }}
                                            accept="image/*"
                                            aspect={400 / 128} // Matching previous preview aspect
                                            shape="rect"
                                            previewMask="rect"
                                            previewSize={{ width: 400, height: 128 }}
                                            viewSize={400}
                                            uploadButtonText="Upload"
                                            removeButtonText="Remove"
                                            layout="vertical"
                                        />
                                    )}
                                />
                                {errors.overviewImage && (
                                    <p className="mt-1 text-sm text-required">{errors.overviewImage.message as string}</p>
                                )}
                            </div>
                        </div>

                        {/* Status */}
                        <div>
                            <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="product-overview-status-toggle">
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
                                                id="product-overview-status-toggle"
                                                checked={value}
                                                onCheckedChange={onChange}
                                                aria-label="Toggle product overview status"
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
                            disabled={productOverviewLoading}
                        >
                            {Constants.superadminConstants.save}
                        </WebComponents.UiComponents.UiWebComponents.Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductOverviewFormModel;

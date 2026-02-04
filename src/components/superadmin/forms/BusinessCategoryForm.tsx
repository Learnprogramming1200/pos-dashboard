"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { Constants } from "@/constant";
import { businessCategorySchema } from "@/app/validation/ValidationSchema";
import { WebComponents } from "@/components";
import { SuperAdminTypes } from "@/types";

type FormData = Yup.InferType<typeof businessCategorySchema>;

export default function BusinessCategoryForm({
    onSubmit,
    category
}: {
    readonly onSubmit: (data: SuperAdminTypes.BusinessCategoryTypes.BusinessCategoryFormData) => void;
    readonly category?: SuperAdminTypes.BusinessCategoryTypes.BusinessCategory;
}) {
    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
        reset,
    } = useForm<FormData>({
        resolver: yupResolver(businessCategorySchema),
        defaultValues: {
            categoryName: category?.categoryName || "",
            description: category?.description || "",
            isActive: category ? !!category.isActive : true,
        },
    });

    // Update form values when category prop changes
    React.useEffect(() => {
        if (category) {
            reset({
                categoryName: category.categoryName || "",
                description: category.description || "",
                isActive: !!category.isActive,
            });
        }
    }, [category, reset]);

    const onFormSubmit = (data: FormData) => {
        onSubmit(data);
    };

    return (
        <div className="bg-white dark:bg-darkFilterbar rounded-[4px] mt-4">
            <form id="category-form" onSubmit={handleSubmit(onFormSubmit)}>
                <div className="p-4 sm:p-5 md:p-6 lg:p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6 lg:gap-8">

                        {/* Category Name */}
                        <div className="col-span-1 md:col-span-2">
                            <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="categoryName">
                                {Constants.superadminConstants.categoryname} <span className="text-required">{Constants.superadminConstants.requiredstar}</span>
                            </WebComponents.UiComponents.UiWebComponents.FormLabel>
                            <WebComponents.UiComponents.UiWebComponents.FormInput
                                id="categoryName"
                                type="text"
                                placeholder="e.g., Salon, Grocery, Clinic"
                                {...register("categoryName")}
                                autoComplete='off'
                                className={errors.categoryName ? "border-red-500" : ""}
                            />
                            {errors.categoryName && (
                                <p className="mt-1 text-sm text-required">{errors.categoryName.message}</p>
                            )}
                        </div>

                        <div className="col-span-1 md:col-span-2">
                            <div className="flex justify-between items-center mb-1">
                                <WebComponents.UiComponents.UiWebComponents.FormLabel>
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
                                            placeholder="Describe the business category"
                                            rows={3}
                                            charCounter={false}
                                            autoComplete='off'
                                            className={fieldState.invalid ? "border-red-500" : ""}
                                        />
                                        <div className="flex justify-between items-center mt-1">
                                            {fieldState.error ? (
                                                <p className="text-sm text-required">{fieldState.error.message}</p>
                                            ) : (
                                                <div />
                                            )}
                                            <div className="text-xs text-textSmall font-interTight font-normal">
                                                {(field.value || "").length}/250
                                            </div>
                                        </div>
                                    </>
                                )}
                            />
                        </div>

                        {/* Status toggle */}
                        <div className="col-span-1 md:col-span-2">
                            <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="status-toggle">
                                {Constants.superadminConstants.statuslabel} <span className="text-required">{Constants.superadminConstants.requiredstar}</span>
                            </WebComponents.UiComponents.UiWebComponents.FormLabel>
                            <Controller
                                name="isActive"
                                control={control}
                                render={({ field: { value, onChange } }) => (
                                    <div className="h-[44px] w-full rounded-[4px] border-[0.6px] border-[#D8D9D9] dark:border-[#616161] bg-textMain2 dark:bg-[#1B1B1B]">
                                        <div className="flex items-center justify-between px-3 sm:px-4 py-[10px]">
                                            <span className="text-xs sm:text-sm font-interTight font-medium leading-[14px] text-textMain dark:text-white">
                                                {value ? Constants.superadminConstants.activestatus : Constants.superadminConstants.inactivestatus}
                                            </span>
                                            <WebComponents.UiComponents.UiWebComponents.Switch
                                                id="status-toggle"
                                                checked={value}
                                                onCheckedChange={onChange}
                                                aria-label="Toggle category status"
                                            />
                                        </div>
                                    </div>
                                )}
                            />
                            {errors.isActive && (
                                <p className="mt-1 text-sm text-required">{errors.isActive.message}</p>
                            )}
                        </div>

                    </div>
                </div>
            </form>
        </div>
    );
}

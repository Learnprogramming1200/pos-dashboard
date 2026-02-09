"use client";
import React from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { Constants } from "@/constant";
import { expenseCategoryFormSchema } from "@/app/validation/ValidationSchema";
import { WebComponents } from "@/components";

interface ExpenseCategoryFormProps {
    onSubmit: (data: {
        name: string;
        description: string;
        status: boolean;
    }) => void;
    category?: any;
}

type FormData = Yup.InferType<typeof expenseCategoryFormSchema>;

const ExpenseCategoryForm = ({ onSubmit, category }: ExpenseCategoryFormProps) => {
    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
        reset,
        watch,
    } = useForm<FormData>({
        resolver: yupResolver(expenseCategoryFormSchema) as any,
        defaultValues: {
            name: category?.name || "",
            description: category?.description || "",
            status: category?.status ?? true,
        },
    });

    const description = watch("description");

    // Update form values when category prop changes
    React.useEffect(() => {
        if (category) {
            reset({
                name: category.name || "",
                description: category.description || "",
                status: category.status ?? true,
            });
        }
    }, [category, reset]);

    const onSubmitForm = (data: FormData) => {
        onSubmit({
            name: data.name.trim(),
            description: (data.description || "").trim(),
            status: data.status,
        });
    };

    return (
        <form id="expense-category-form" onSubmit={handleSubmit(onSubmitForm)}>
            <div className="p-4 sm:p-5 md:p-6 lg:p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6 lg:gap-8">
                    {/* Category Name */}
                    <div className="col-span-1">
                        <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="name">
                            {Constants.adminConstants.categoryNameLabel} <span className="text-required">{Constants.adminConstants.requiredstar}</span>
                        </WebComponents.UiComponents.UiWebComponents.FormLabel>
                        <WebComponents.UiComponents.UiWebComponents.FormInput
                            id="name"
                            type="text"
                            placeholder="e.g., Office Supplies, Utilities, Travel"
                            {...register("name")}
                            autoComplete="off"
                            className={errors.name ? "border-red-500" : ""}
                        />
                        {errors.name && (
                            <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
                        )}
                    </div>

                    {/* Status toggle */}
                    <div className="col-span-1">
                        <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="status-toggle">
                            {Constants.adminConstants.statusLabel} <span className="text-required">{Constants.adminConstants.requiredstar}</span>
                        </WebComponents.UiComponents.UiWebComponents.FormLabel>
                        <Controller
                            name="status"
                            control={control}
                            render={({ field: { value, onChange } }) => (
                                <div className="h-[44px] w-full rounded-[4px] border-[0.6px] border-[#D8D9D9] dark:border-[#616161] bg-textMain2 dark:bg-[#1B1B1B]">
                                    <div className="flex items-center justify-between px-3 sm:px-4 py-[10px]">
                                        <span className="text-xs sm:text-sm font-interTight font-medium leading-[14px] text-textMain dark:text-white">
                                            {value ? Constants.adminConstants.activestatus : Constants.adminConstants.inactivestatus}
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
                        {errors.status && (
                            <p className="mt-1 text-sm text-red-500">{errors.status.message}</p>
                        )}
                    </div>

                    {/* Description */}
                    <div className="col-span-1 md:col-span-1">
                        <div className="flex justify-between items-center mb-1">
                            <WebComponents.UiComponents.UiWebComponents.FormLabel>
                                {Constants.adminConstants.descriptionLabel}
                            </WebComponents.UiComponents.UiWebComponents.FormLabel>
                            <p className="text-textSmall dark:text-gray-400 font-interTight font-normal text-xs sm:text-sm leading-[8px]">
                                Max 250 characters
                            </p>
                        </div>
                        <WebComponents.UiComponents.UiWebComponents.Textarea
                            placeholder="Describe the category"
                            {...register("description")}
                            rows={3}
                            charCounter={false}
                            autoComplete="off"
                            className={errors.description ? "border-red-500" : ""}
                        />
                        <div className="text-xs text-gray-500 text-right mt-1">
                            {(description || "").length}/250
                        </div>
                        {errors.description && (
                            <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>
                        )}
                    </div>
                </div>
            </div>
        </form>
    );
};

export default ExpenseCategoryForm;

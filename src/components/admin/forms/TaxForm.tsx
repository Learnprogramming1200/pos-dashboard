"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Constants } from "@/constant";
import { WebComponents } from "@/components";
import { AdminTypes } from "@/types";
import { taxFormSchema } from "@/app/validation/ValidationSchema";

interface TaxFormProps {
    onSubmit: (data: any) => void;
    tax?: AdminTypes.taxTypes.Tax;
}

const TaxForm: React.FC<TaxFormProps> = ({ onSubmit, tax }) => {
    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
        reset,
        watch,
    } = useForm({
        resolver: yupResolver(taxFormSchema),
        defaultValues: {
            taxName: tax?.taxName || "",
            taxType: (tax?.taxType as "Inclusive" | "Exclusive") || "",
            valueType: (tax?.valueType as "Fixed" | "Percentage") || "",
            value: (tax?.value ?? "") as any,
            status: typeof tax?.status === "boolean" ? tax.status : (tax ? tax.status === "Active" : true),
            description: tax?.description || "",
        },
    });

    const valueType = watch("valueType");

    React.useEffect(() => {
        if (tax) {
            reset({
                taxName: tax.taxName || "",
                taxType: (tax?.taxType as "Inclusive" | "Exclusive") || "",
                valueType: (tax?.valueType as "Fixed" | "Percentage") || "",
                value: (tax?.value ?? "") as any,
                status: typeof tax.status === "boolean" ? tax.status : (tax ? tax.status === "Active" : true),
                description: tax.description || "",
            });
        }
    }, [tax, reset]);

    const handleFormSubmit = (data: any) => {
        onSubmit(data);
    };

    return (
        <form id="tax-form" onSubmit={handleSubmit(handleFormSubmit)} className="w-full">
            <div className="p-4 sm:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {/* Tax Name */}
                    <div className="col-span-1">
                        <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="taxName">
                            {Constants.adminConstants.taxName} <span className="text-required">{Constants.adminConstants.requiredstar}</span>
                        </WebComponents.UiComponents.UiWebComponents.FormLabel>
                        <WebComponents.UiComponents.UiWebComponents.FormInput
                            id="taxName"
                            placeholder="e.g., GST, Service Tax"
                            {...register("taxName")}
                            autoComplete="off"
                            className={errors.taxName ? "border-red-500" : ""}
                        />
                        {errors.taxName && (
                            <p className="mt-1 text-sm text-red-500">{errors.taxName.message}</p>
                        )}
                    </div>

                    {/* Tax Type */}
                    <div className="col-span-1">
                        <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="taxType">
                            {Constants.adminConstants.taxType} <span className="text-required">{Constants.adminConstants.requiredstar}</span>
                        </WebComponents.UiComponents.UiWebComponents.FormLabel>
                        <Controller
                            name="taxType"
                            control={control}
                            render={({ field }) => (
                                <WebComponents.UiComponents.UiWebComponents.FormDropdown
                                    {...field}
                                    id="taxType"
                                    placeholder="Select Tax Type"
                                    className={errors.taxType ? "border-red-500" : ""}
                                >
                                    <WebComponents.UiComponents.UiWebComponents.FormOption value="Inclusive">
                                        {Constants.adminConstants.inclusive}
                                    </WebComponents.UiComponents.UiWebComponents.FormOption>
                                    <WebComponents.UiComponents.UiWebComponents.FormOption value="Exclusive">
                                        {Constants.adminConstants.exclusive}
                                    </WebComponents.UiComponents.UiWebComponents.FormOption>
                                </WebComponents.UiComponents.UiWebComponents.FormDropdown>
                            )}
                        />
                        {errors.taxType && (
                            <p className="mt-1 text-sm text-red-500">{errors.taxType.message}</p>
                        )}
                    </div>

                    {/* Value Type */}
                    <div className="col-span-1">
                        <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="valueType">
                            {Constants.adminConstants.valueType} <span className="text-required">{Constants.adminConstants.requiredstar}</span>
                        </WebComponents.UiComponents.UiWebComponents.FormLabel>
                        <Controller
                            name="valueType"
                            control={control}
                            render={({ field }) => (
                                <WebComponents.UiComponents.UiWebComponents.FormDropdown
                                    {...field}
                                    id="valueType"
                                    placeholder="Select Value Type"
                                    className={errors.valueType ? "border-red-500" : ""}
                                >
                                    <WebComponents.UiComponents.UiWebComponents.FormOption value="Fixed">
                                        {Constants.adminConstants.fixed}
                                    </WebComponents.UiComponents.UiWebComponents.FormOption>
                                    <WebComponents.UiComponents.UiWebComponents.FormOption value="Percentage">
                                        {Constants.adminConstants.percentage}
                                    </WebComponents.UiComponents.UiWebComponents.FormOption>
                                </WebComponents.UiComponents.UiWebComponents.FormDropdown>
                            )}
                        />
                        {errors.valueType && (
                            <p className="mt-1 text-sm text-red-500">{errors.valueType.message}</p>
                        )}
                    </div>

                    {/* Value */}
                    <div className="col-span-1">
                        <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="value">
                            {Constants.adminConstants.value} <span className="text-required">{Constants.adminConstants.requiredstar}</span>
                        </WebComponents.UiComponents.UiWebComponents.FormLabel>
                        <div className="relative">
                            <WebComponents.UiComponents.UiWebComponents.FormInput
                                id="value"
                                type="number"
                                step={valueType === "Percentage" ? "0.01" : "1"}
                                placeholder={valueType === "Percentage" ? "e.g., 18" : "e.g., 50"}
                                {...register("value")}
                                className={errors.value ? "border-red-500" : ""}
                            />
                            {valueType === "Percentage" && (
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                                    %
                                </span>
                            )}
                        </div>
                        {errors.value && (
                            <p className="mt-1 text-sm text-red-500">{errors.value.message}</p>
                        )}
                    </div>

                    {/* Status Toggle */}
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
                                            aria-label="Toggle tax status"
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
                    <div className="col-span-1">
                        <div className="flex justify-between items-center mb-1">
                            <WebComponents.UiComponents.UiWebComponents.FormLabel>
                                {Constants.adminConstants.descriptionLabel}
                            </WebComponents.UiComponents.UiWebComponents.FormLabel>
                            <p className="text-textSmall dark:text-gray-400 font-interTight font-normal text-xs sm:text-sm leading-[8px]">
                                Max 250 characters
                            </p>
                        </div>
                        <WebComponents.UiComponents.UiWebComponents.Textarea
                            placeholder="Enter tax description (optional)"
                            {...register("description")}
                            rows={3}
                            charCounter={false}
                            autoComplete="off"
                            className={errors.description ? "border-red-500" : ""}
                        />
                        {errors.description && (
                            <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>
                        )}
                    </div>
                </div>
            </div>
        </form>
    );
};

export default TaxForm;

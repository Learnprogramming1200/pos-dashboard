"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { superAdminTaxFormSchema } from "@/app/validation/ValidationSchema";
import { Constants } from "@/constant";
import { WebComponents } from "@/components";
import { SuperAdminTypes } from "@/types";

type FormData = Yup.InferType<typeof superAdminTaxFormSchema>;

export default function TaxForm({
    onSubmit,
    tax
}: {
    readonly onSubmit: (data: SuperAdminTypes.TaxTypes.TaxFormData) => void;
    readonly tax?: SuperAdminTypes.TaxTypes.Tax;
}) {
    const {
        register,
        handleSubmit,
        control,
        watch,
        formState: { errors },
        reset,
    } = useForm<FormData>({
        resolver: yupResolver(superAdminTaxFormSchema),
        defaultValues: {
            name: tax?.name || "",
            type: (tax?.type || tax?.valueType || "Fixed") as "Fixed" | "Percentage",
            value: tax?.value?.toString() || "",
            status: tax ? (typeof tax.status === 'boolean' ? tax.status : tax.status === 'Active') : true,
        },
    });

    const watchType = watch("type");

    // Update form values when tax prop changes
    React.useEffect(() => {
        if (tax) {
            reset({
                name: tax.name || "",
                type: (tax.type || tax.valueType || "Fixed") as "Fixed" | "Percentage",
                value: tax.value?.toString() || "",
                status: typeof tax.status === 'boolean' ? tax.status : tax.status === 'Active',
            });
        }
    }, [tax, reset]);

    const onFormSubmit = (data: FormData) => {
        onSubmit({
            name: data.name.trim(),
            type: data.type as "Fixed" | "Percentage",
            value: Number.parseFloat(data.value),
            status: data.status,
        });
    };

    return (
        <div className="bg-white dark:bg-darkFilterbar rounded-[4px] mt-4">
            <form id="tax-form" onSubmit={handleSubmit(onFormSubmit)}>
                <div className="p-4 sm:p-5 md:p-6 lg:p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6 lg:gap-8">

                        {/* Tax Name */}
                        <div className="col-span-1">
                            <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="name">
                                {Constants.superadminConstants.taxtitlelabel} <span className="text-required">{Constants.superadminConstants.requiredstar}</span>
                            </WebComponents.UiComponents.UiWebComponents.FormLabel>
                            <WebComponents.UiComponents.UiWebComponents.FormInput
                                id="name"
                                type="text"
                                placeholder="e.g., GST, Service Tax, Processing Fee"
                                {...register("name")}
                                autoComplete='off'
                                className={errors.name ? "border-red-500" : ""}
                            />
                            {errors.name && (
                                <p className="mt-1 text-sm text-required">{errors.name.message}</p>
                            )}
                        </div>

                        {/* Tax Type */}
                        <div className="col-span-1">
                            <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="type">
                                {Constants.superadminConstants.taxtypelabel} <span className="text-required">{Constants.superadminConstants.requiredstar}</span>
                            </WebComponents.UiComponents.UiWebComponents.FormLabel>
                            <Controller
                                name="type"
                                control={control}
                                render={({ field: { value, onChange } }) => (
                                    <WebComponents.UiComponents.UiWebComponents.FormDropdown
                                        id="type"
                                        value={value}
                                        onChange={(e) => onChange(e.target.value as "Fixed" | "Percentage")}
                                        autoComplete='off'
                                        className={errors.type ? "border-red-500" : ""}
                                    >
                                        <WebComponents.UiComponents.UiWebComponents.FormOption value="Fixed">Fixed</WebComponents.UiComponents.UiWebComponents.FormOption>
                                        <WebComponents.UiComponents.UiWebComponents.FormOption value="Percentage">Percentage</WebComponents.UiComponents.UiWebComponents.FormOption>
                                    </WebComponents.UiComponents.UiWebComponents.FormDropdown>
                                )}
                            />
                            {errors.type && (
                                <p className="mt-1 text-sm text-required">{errors.type.message}</p>
                            )}
                        </div>

                        {/* Tax Value */}
                        <div className="col-span-1">
                            <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="value">
                                {Constants.superadminConstants.taxvaluelabel} <span className="text-required">{Constants.superadminConstants.requiredstar}</span>
                            </WebComponents.UiComponents.UiWebComponents.FormLabel>
                            <WebComponents.UiComponents.UiWebComponents.FormInput
                                id="value"
                                type="number"
                                placeholder={watchType === "Percentage" ? "e.g., 18 for 18%" : "e.g., 50 for $50"}
                                {...register("value")}
                                step={watchType === "Percentage" ? "0.01" : "1"}
                                min="0"
                                autoComplete='off'
                                className={errors.value ? "border-red-500" : ""}
                            />
                            {errors.value && (
                                <p className="mt-1 text-sm text-required">{errors.value.message}</p>
                            )}
                        </div>

                        {/* Status toggle */}
                        <div className="col-span-1">
                            <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="tax-status-toggle">
                                {Constants.superadminConstants.statuslabel}
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
                                                id="tax-status-toggle"
                                                checked={value}
                                                onCheckedChange={onChange}
                                                aria-label="Toggle tax status"
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
                </div>
            </form>
        </div>
    );
}


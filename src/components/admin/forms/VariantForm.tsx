"use client";
import React from "react";
import { useForm, Controller } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Constants } from "@/constant";
import { variantFormSchema } from "@/app/validation/ValidationSchema";
import { WebComponents } from "@/components";
import { AdminTypes } from "@/types";

const VariantForm = ({ onSubmit, variant }: AdminTypes.InventoryTypes.VariantTypes.VariantFormProps) => {
    const initialValues = Array.isArray(variant?.values)
        ? variant.values
            .map((v) => {
                if (typeof v === "string") return v;
                if (
                    typeof v === "object" &&
                    v !== null &&
                    "value" in v &&
                    typeof (v as { value: string }).value === "string"
                ) {
                    return (v as { value: string }).value;
                }
                return String(v);
            })
            .join(", ")
        : "";

    type FormData = Yup.InferType<typeof variantFormSchema>;

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
        reset,
    } = useForm<FormData>({
        resolver: yupResolver(variantFormSchema) as any,
        defaultValues: {
            variant: variant?.variant ?? "",
            values: initialValues,
            status: variant?.status ?? true,
        },
    });

    // Update form values when variant prop changes
    React.useEffect(() => {
        if (variant) {
            const variantValues = Array.isArray(variant.values)
                ? variant.values
                    .map((v) => {
                        if (typeof v === "string") return v;
                        if (
                            typeof v === "object" &&
                            v !== null &&
                            "value" in v &&
                            typeof (v as { value: string }).value === "string"
                        ) {
                            return (v as { value: string }).value;
                        }
                        return String(v);
                    })
                    .join(", ")
                : "";
            reset({
                variant: variant.variant || "",
                values: variantValues,
                status: variant.status ?? true,
            });
        }
    }, [variant, reset]);

    const onSubmitForm = (data: FormData) => {
        onSubmit({
            variant: data.variant.trim(),
            values: data.values.trim(),
            status: data.status,
        });
    };

    return (
        <form id="variant-form" onSubmit={handleSubmit(onSubmitForm)}>
            <div className="p-4 sm:p-5 md:p-6 lg:p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6 lg:gap-8">
                    <div className="col-span-1 md:col-span-2">
                        <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="variant">
                            {Constants.adminConstants.variantStrings.variantNameLabel}{" "}
                            <span className="text-required">{Constants.adminConstants.requiredstar}</span>
                        </WebComponents.UiComponents.UiWebComponents.FormLabel>
                        <WebComponents.UiComponents.UiWebComponents.FormInput
                            id="variant"
                            type="text"
                            placeholder="Enter variant name (e.g., Color, Size, Material)"
                            {...register("variant")}
                            autoComplete="off"
                            className={errors.variant ? "border-red-500" : ""}
                        />
                        {errors.variant && (
                            <p className="mt-1 text-sm text-required">{errors.variant.message}</p>
                        )}
                    </div>

                    <div className="col-span-1 md:col-span-2">
                        <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="values">
                            {Constants.adminConstants.variantStrings.valuesLabel}{" "}
                            <span className="text-required">{Constants.adminConstants.requiredstar}</span>
                        </WebComponents.UiComponents.UiWebComponents.FormLabel>
                        <Controller
                            name="values"
                            control={control}
                            render={({ field, fieldState }) => (
                                <>
                                    <WebComponents.UiComponents.UiWebComponents.Textarea
                                        {...field}
                                        id="values"
                                        placeholder="Enter variant values separated by commas (e.g., Red, Blue, Green, Yellow)"
                                        rows={3}
                                        charCounter={false}
                                        className={fieldState.invalid ? "border-red-500" : ""}
                                    />
                                    <div className="flex justify-between items-start mt-1 gap-2">
                                        <div className="flex-1 min-w-0">
                                            {fieldState.error ? (
                                                <p className="text-sm text-required break-words leading-tight">{fieldState.error.message}</p>
                                            ) : (
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {Constants.adminConstants.variantStrings.multipleValuesNote}
                                                </p>
                                            )}
                                        </div>
                                        <div className="text-sm text-textSmall font-interTight whitespace-nowrap">
                                            {(field.value || "").length}/250
                                        </div>
                                    </div>
                                </>
                            )}
                        />
                    </div>

                    <div className="col-span-1 md:col-span-2">
                        <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="variant-status-toggle">
                            {Constants.adminConstants.statusLabel}{" "}
                            <span className="text-required">{Constants.adminConstants.requiredstar}</span>
                        </WebComponents.UiComponents.UiWebComponents.FormLabel>
                        <Controller
                            name="status"
                            control={control}
                            render={({ field: { value, onChange } }) => (
                                <div className="h-[44px] w-full rounded-[4px] border-[0.6px] border-[#D8D9D9] dark:border-[#616161] bg-textMain2 dark:bg-[#1B1B1B]">
                                    <div className="flex items-center justify-between px-3 sm:px-4 py-[10px]">
                                        <span className="text-xs sm:text-sm font-interTight font-medium leading-[14px] text-textMain dark:text-white">
                                            {value
                                                ? Constants.adminConstants.activestatus
                                                : Constants.adminConstants.inactivestatus}
                                        </span>
                                        <WebComponents.UiComponents.UiWebComponents.Switch
                                            id="variant-status-toggle"
                                            checked={value}
                                            onCheckedChange={onChange}
                                            aria-label="Toggle variant status"
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
    );
}


export default VariantForm;
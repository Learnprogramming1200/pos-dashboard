"use client";

import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { UiWebComponents } from "@/components/ui";

// Validation Schema
const currencyFormSchema = Yup.object().shape({
    currencyName: Yup.string().required("Currency Name is required"),
    currencyCode: Yup.string().required("Currency Code is required"),
    currencySymbol: Yup.string().required("Currency Symbol is required"),
    currencyPosition: Yup.string().oneOf(['Left', 'Right'], "Invalid position").default('Left'),
    thousandSeparator: Yup.string().required("Thousand Separator is required"),
    decimalSeparator: Yup.string().required("Decimal Separator is required"),
    numberOfDecimals: Yup.number().min(0, "Must be positive").integer("Must be an integer").default(2),
});

export interface CurrencyFormData {
    currencyName: string;
    currencyCode: string;
    currencySymbol: string;
    currencyPosition: 'Left' | 'Right';
    thousandSeparator: string;
    decimalSeparator: string;
    numberOfDecimals: number;
}

interface CurrencyFormProps {
    onSubmit: (data: CurrencyFormData) => void;
    initialData?: Partial<CurrencyFormData>;
}

const CurrencyForm: React.FC<CurrencyFormProps> = ({ onSubmit, initialData }) => {
    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors },
    } = useForm<CurrencyFormData>({
        resolver: yupResolver(currencyFormSchema) as any,
        defaultValues: {
            currencyName: "",
            currencyCode: "",
            currencySymbol: "",
            currencyPosition: "Left",
            thousandSeparator: ",",
            decimalSeparator: ".",
            numberOfDecimals: 2,
            ...initialData
        },
    });

    useEffect(() => {
        if (initialData) {
            reset({
                currencyName: initialData.currencyName || "",
                currencyCode: initialData.currencyCode || "",
                currencySymbol: initialData.currencySymbol || "",
                currencyPosition: initialData.currencyPosition || "Left",
                thousandSeparator: initialData.thousandSeparator || ",",
                decimalSeparator: initialData.decimalSeparator || ".",
                numberOfDecimals: initialData.numberOfDecimals || 2,
            });
        }
    }, [initialData, reset]);

    return (
        <form id="currency-form" onSubmit={handleSubmit(onSubmit)} className="w-full">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Row 1 */}
                <div>
                    <UiWebComponents.FormLabel htmlFor="currencyName">
                        Currency Name <span className="text-required">*</span>
                    </UiWebComponents.FormLabel>
                    <UiWebComponents.FormInput
                        id="currencyName"
                        {...register("currencyName")}
                        placeholder="e.g. US Dollar"
                    />
                    {errors.currencyName && <p className="text-red-500 text-xs mt-1">{errors.currencyName.message}</p>}
                </div>

                <div>
                    <UiWebComponents.FormLabel htmlFor="currencyCode">
                        Currency Code <span className="text-required">*</span>
                    </UiWebComponents.FormLabel>
                    <UiWebComponents.FormInput
                        id="currencyCode"
                        {...register("currencyCode")}
                        placeholder="e.g. USD"
                    />
                    {errors.currencyCode && <p className="text-red-500 text-xs mt-1">{errors.currencyCode.message}</p>}
                </div>

                <div>
                    <UiWebComponents.FormLabel htmlFor="currencySymbol">
                        Currency Symbol <span className="text-required">*</span>
                    </UiWebComponents.FormLabel>
                    <UiWebComponents.FormInput
                        id="currencySymbol"
                        {...register("currencySymbol")}
                        placeholder="e.g. $"
                    />
                    {errors.currencySymbol && <p className="text-red-500 text-xs mt-1">{errors.currencySymbol.message}</p>}
                </div>

                {/* Row 2 */}
                <div>
                    <UiWebComponents.FormLabel htmlFor="currencyPosition">
                        Currency Position
                    </UiWebComponents.FormLabel>
                    <Controller
                        control={control}
                        name="currencyPosition"
                        render={({ field }) => (
                            <UiWebComponents.FormDropdown
                                id="currencyPosition"
                                value={field.value}
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => field.onChange(e.target.value)}
                            >
                                <UiWebComponents.FormOption value="Left">Left</UiWebComponents.FormOption>
                                <UiWebComponents.FormOption value="Right">Right</UiWebComponents.FormOption>
                            </UiWebComponents.FormDropdown>
                        )}
                    />
                </div>

                <div>
                    <UiWebComponents.FormLabel htmlFor="thousandSeparator">
                        Thousand Separator
                    </UiWebComponents.FormLabel>
                    <UiWebComponents.FormInput
                        id="thousandSeparator"
                        {...register("thousandSeparator")}
                    />
                    {errors.thousandSeparator && <p className="text-red-500 text-xs mt-1">{errors.thousandSeparator.message}</p>}
                </div>

                <div>
                    <UiWebComponents.FormLabel htmlFor="decimalSeparator">
                        Decimal Separator
                    </UiWebComponents.FormLabel>
                    <UiWebComponents.FormInput
                        id="decimalSeparator"
                        {...register("decimalSeparator")}
                    />
                    {errors.decimalSeparator && <p className="text-red-500 text-xs mt-1">{errors.decimalSeparator.message}</p>}
                </div>

                {/* Row 3 */}
                <div>
                    <UiWebComponents.FormLabel htmlFor="numberOfDecimals">
                        Number of Decimals
                    </UiWebComponents.FormLabel>
                    <UiWebComponents.FormInput
                        id="numberOfDecimals"
                        type="number"
                        {...register("numberOfDecimals")}
                    />
                    {errors.numberOfDecimals && <p className="text-red-500 text-xs mt-1">{errors.numberOfDecimals.message}</p>}
                </div>
            </div>
        </form>
    );
};

export default CurrencyForm;

"use client";
import React from "react";
import { useForm, Controller } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { posFormSchema } from "@/app/validation/ValidationSchema";
import { WebComponents } from "@/components";
import { POS } from "@/types/admin/sales/Sales";

type POSFormData = Yup.InferType<typeof posFormSchema>;

interface POSModelProps {
    name: string;
    onClose: () => void;
    onSubmit: (data: any) => void;
    pos?: POS;
}

const POSModel: React.FC<POSModelProps> = ({ name, onClose, onSubmit, pos }) => {
    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<POSFormData>({
        resolver: yupResolver(posFormSchema),
        defaultValues: {
            name: pos?.name || "",
            storeId: pos?.storeId || "",
            location: pos?.location || "",
            status: pos?.status || "Active",
        },
    });

    const [loading, setLoading] = React.useState(false);

    const onFormSubmit = async (data: POSFormData) => {
        setLoading(true);
        try {
            await onSubmit({
                ...data,
                storeName: data.storeId === "STORE-001" ? "Main Store" : data.storeId === "STORE-002" ? "Branch Store" : "",
            });
        } finally {
            setLoading(false);
        }
    };

    const onCancel = () => {
        onClose();
    };

    return (
        <>
            <div className="bg-white dark:bg-darkFilterbar rounded-[4px] mt-4">
                <form id="pos-form" onSubmit={handleSubmit(onFormSubmit)}>
                    <div className="p-4 sm:p-5 md:p-6 lg:p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* POS Name */}
                            <div className="col-span-1">
                                <WebComponents.UiComponents.UiWebComponents.FormLabel>
                                    POS Name <span className="text-red-500">*</span>
                                </WebComponents.UiComponents.UiWebComponents.FormLabel>
                                <Controller
                                    name="name"
                                    control={control}
                                    render={({ field }) => (
                                        <WebComponents.UiComponents.UiWebComponents.FormInput
                                            {...field}
                                            placeholder="Enter POS name"
                                            className={errors.name ? "border-red-500" : ""}
                                        />
                                    )}
                                />
                                {errors.name && (
                                    <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
                                )}
                            </div>

                            {/* Store */}
                            <div className="col-span-1">
                                <WebComponents.UiComponents.UiWebComponents.FormLabel>
                                    Store <span className="text-red-500">*</span>
                                </WebComponents.UiComponents.UiWebComponents.FormLabel>
                                <Controller
                                    name="storeId"
                                    control={control}
                                    render={({ field }) => (
                                        <WebComponents.UiComponents.UiWebComponents.FormDropdown
                                            {...field}
                                            value={field.value}
                                            onChange={field.onChange}
                                            className={errors.storeId ? "border-red-500" : ""}
                                        >
                                            <WebComponents.UiComponents.UiWebComponents.FormOption value="">Select Store</WebComponents.UiComponents.UiWebComponents.FormOption>
                                            <WebComponents.UiComponents.UiWebComponents.FormOption value="STORE-001">Main Store</WebComponents.UiComponents.UiWebComponents.FormOption>
                                            <WebComponents.UiComponents.UiWebComponents.FormOption value="STORE-002">Branch Store</WebComponents.UiComponents.UiWebComponents.FormOption>
                                        </WebComponents.UiComponents.UiWebComponents.FormDropdown>
                                    )}
                                />
                                {errors.storeId && (
                                    <p className="mt-1 text-sm text-red-500">{errors.storeId.message}</p>
                                )}
                            </div>

                            {/* Location */}
                            <div className="col-span-1">
                                <WebComponents.UiComponents.UiWebComponents.FormLabel>
                                    Location <span className="text-red-500">*</span>
                                </WebComponents.UiComponents.UiWebComponents.FormLabel>
                                <Controller
                                    name="location"
                                    control={control}
                                    render={({ field }) => (
                                        <WebComponents.UiComponents.UiWebComponents.FormInput
                                            {...field}
                                            placeholder="Enter location (e.g., Front Counter)"
                                            className={errors.location ? "border-red-500" : ""}
                                        />
                                    )}
                                />
                                {errors.location && (
                                    <p className="mt-1 text-sm text-red-500">{errors.location.message}</p>
                                )}
                            </div>

                            {/* Status */}
                            <div className="col-span-1">
                                <WebComponents.UiComponents.UiWebComponents.FormLabel>
                                    Status <span className="text-red-500">*</span>
                                </WebComponents.UiComponents.UiWebComponents.FormLabel>
                                <Controller
                                    name="status"
                                    control={control}
                                    render={({ field }) => (
                                        <WebComponents.UiComponents.UiWebComponents.FormDropdown
                                            {...field}
                                            value={field.value}
                                            onChange={field.onChange}
                                            className={errors.status ? "border-red-500" : ""}
                                        >
                                            <WebComponents.UiComponents.UiWebComponents.FormOption value="Active">Active</WebComponents.UiComponents.UiWebComponents.FormOption>
                                            <WebComponents.UiComponents.UiWebComponents.FormOption value="Inactive">Inactive</WebComponents.UiComponents.UiWebComponents.FormOption>
                                            <WebComponents.UiComponents.UiWebComponents.FormOption value="Maintenance">Maintenance</WebComponents.UiComponents.UiWebComponents.FormOption>
                                        </WebComponents.UiComponents.UiWebComponents.FormDropdown>
                                    )}
                                />
                                {errors.status && (
                                    <p className="mt-1 text-sm text-red-500">{errors.status.message}</p>
                                )}
                            </div>

                        </div>
                    </div>
                </form>
            </div>

            {/* Footer */}
            <div className="pt-[60px] flex justify-end gap-3">
                <WebComponents.UiComponents.UiWebComponents.Button
                    variant="cancel"
                    type="button"
                    onClick={onCancel}
                    className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                    Cancel
                </WebComponents.UiComponents.UiWebComponents.Button>
                <WebComponents.UiComponents.UiWebComponents.Button
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    type="submit"
                    form="pos-form"
                    disabled={loading}
                >
                    {loading ? (
                        <div className="flex items-center gap-2">
                            <span className="animate-spin text-white">⏳</span>
                            <span>Processing...</span>
                        </div>
                    ) : (
                        "Save"
                    )}
                </WebComponents.UiComponents.UiWebComponents.Button>
            </div>
        </>
    );
};

export default POSModel;

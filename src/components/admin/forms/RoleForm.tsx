"use client";
import React from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { Constants } from "@/constant";
import { roleFormSchema } from "@/app/validation/ValidationSchema";
import { WebComponents } from "@/components";
interface RoleData {
    name: string;
    code: string;
    description: string;
    isActive: boolean;
}

interface RoleFormProps {
    onSubmit: (data: RoleData) => void;
    role?: RoleData;
    initialValues?: RoleData; // Allow passing specific initial values if needed
}

type FormData = Yup.InferType<typeof roleFormSchema>;

const RoleForm = ({ onSubmit, role, initialValues }: RoleFormProps) => {
    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
        reset,
    } = useForm<FormData>({
        resolver: yupResolver(roleFormSchema) as any,
        defaultValues: {
            name: role?.name || initialValues?.name || "",
            code: role?.code || initialValues?.code || "",
            description: role?.description || initialValues?.description || "",
            isActive: role?.isActive ?? initialValues?.isActive ?? true,
        },
    });

    // Update form values when role prop changes
    React.useEffect(() => {
        if (role) {
            reset({
                name: role.name || "",
                code: role.code || "",
                description: role.description || "",
                isActive: role.isActive ?? true,
            });
        } else if (initialValues) {
            reset({
                name: initialValues.name || "",
                code: initialValues.code || "",
                description: initialValues.description || "",
                isActive: initialValues.isActive ?? true,
            });
        }
    }, [role, initialValues, reset]);

    const onSubmitForm = (data: FormData) => {
        onSubmit({
            name: data.name.trim(),
            code: data.code.trim().toUpperCase(),
            description: (data.description || "").trim(),
            isActive: data.isActive,
        });
    };

    return (
        <form id="role-form" onSubmit={handleSubmit(onSubmitForm)}>
            <div className="p-4 sm:p-5 md:p-6 lg:p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6 lg:gap-8">
                    {/* Role Name */}
                    <div className="col-span-1">
                        <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="name">
                            Role Name <span className="text-required">{Constants.adminConstants.requiredstar}</span>
                        </WebComponents.UiComponents.UiWebComponents.FormLabel>
                        <WebComponents.UiComponents.UiWebComponents.FormInput
                            id="name"
                            type="text"
                            placeholder="e.g., Store Manager"
                            {...register("name")}
                            autoComplete="off"
                            className={errors.name ? "border-red-500" : ""}
                        />
                        {errors.name && (
                            <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
                        )}
                    </div>

                    {/* Role Code */}
                    <div className="col-span-1">
                        <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="code">
                            Role Code <span className="text-required">{Constants.adminConstants.requiredstar}</span>
                        </WebComponents.UiComponents.UiWebComponents.FormLabel>
                        <WebComponents.UiComponents.UiWebComponents.FormInput
                            id="code"
                            type="text"
                            placeholder="e.g., STORE_MANAGER"
                            {...register("code")}
                            autoComplete="off"
                            className={errors.code ? "border-red-500" : ""}
                            onChange={(e) => {
                                e.target.value = e.target.value.toUpperCase();
                                register("code").onChange(e);
                            }}
                        />
                        {errors.code && (
                            <p className="mt-1 text-sm text-red-500">{errors.code.message}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">Must be uppercase with underscores (e.g. ADMIN_USER)</p>
                    </div>

                    {/* Description */}
                    <div className="col-span-1">
                        <div className="flex justify-between items-center mb-1">
                            <WebComponents.UiComponents.UiWebComponents.FormLabel>
                                {Constants.adminConstants.descriptionLabel}
                            </WebComponents.UiComponents.UiWebComponents.FormLabel>
                            <p className="text-textSmall dark:text-gray-400 font-interTight font-normal text-xs sm:text-sm leading-[8px]">
                                Max 500 characters
                            </p>
                        </div>
                        <Controller
                            name="description"
                            control={control}
                            render={({ field, fieldState }) => (
                                <>
                                    <WebComponents.UiComponents.UiWebComponents.Textarea
                                        {...field}
                                        value={field.value || ""}
                                        placeholder="Describe the role permissions"
                                        rows={3}
                                        charCounter={false}
                                        autoComplete="off"
                                        className={fieldState.invalid ? "border-red-500" : ""}
                                    />
                                    <div className="flex justify-between items-center mt-1">
                                        {fieldState.error ? (
                                            <p className="text-sm text-red-500">{fieldState.error.message}</p>
                                        ) : (
                                            <div />
                                        )}
                                        <div className="text-xs text-textSmall font-interTight">
                                            {(field.value || "").length}/500
                                        </div>
                                    </div>
                                </>
                            )}
                        />
                    </div>

                    {/* Status Toggle */}
                    <div className="col-span-1">
                        <div>
                            <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="status-toggle">
                                {Constants.adminConstants.statusLabel} <span className="text-required">{Constants.adminConstants.requiredstar}</span>
                            </WebComponents.UiComponents.UiWebComponents.FormLabel>
                            <Controller
                                name="isActive"
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
                                                aria-label="Toggle role status"
                                            />
                                        </div>
                                    </div>
                                )}
                            />
                            {errors.isActive && (
                                <p className="mt-1 text-sm text-red-500">{errors.isActive.message}</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
};

export default RoleForm;

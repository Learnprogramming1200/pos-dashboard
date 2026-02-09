"use client";

import React from 'react';
import { Eye, EyeOff } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { businessOwnerFormSchema } from "@/app/validation/ValidationSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { Constants } from '@/constant';
import { WebComponents } from '@/components';
import { SuperAdminTypes } from '@/types';

interface BusinessOwnerFormProps {
    onClose: () => void;
    onSubmit: (data: SuperAdminTypes.BusinessOwnerTypes.BusinessOwnerFormData) => void;
    owner?: SuperAdminTypes.BusinessOwnerTypes.BusinessOwner;
    businessCategories: SuperAdminTypes.BusinessCategoryTypes.BusinessCategory[];
}

type FormData = Yup.InferType<typeof businessOwnerFormSchema>;

export default function BusinessOwnerForm({
    onClose,
    onSubmit,
    owner,
    businessCategories
}: BusinessOwnerFormProps) {
    const isEditing = !!owner;
    const [showPassword, setShowPassword] = React.useState(false);

    const parsePhone = (p?: string) => {
        if (!p) return { code: "+1", num: "" };
        const match = p.match(/^(\+\d{1,4})\s*(.+)$/);
        return match ? { code: match[1], num: match[2] } : { code: "+1", num: p };
    };

    const initialPhone = parsePhone(owner?.phone);

    const {
        register,
        handleSubmit,
        control,
        formState: { errors, isSubmitting },
        reset,
    } = useForm<FormData>({
        resolver: yupResolver(businessOwnerFormSchema) as any,
        context: { isEdit: isEditing },
        defaultValues: {
            name: owner?.name || "",
            email: owner?.email || "",
            countryCode: initialPhone.code,
            phoneNumber: initialPhone.num,
            password: owner?.password || "",
            businessName: (() => {
                if (owner?.businesses?.length) return owner.businesses[0].businessName || "";
                return owner?.businessName || "";
            })(),
            businessCategory: (() => {
                if (owner?.businesses?.length) return owner.businesses[0].businessCategoryId?._id || "";
                if (typeof owner?.businessCategory === 'object') return owner.businessCategory?._id || "";
                return "";
            })(),
            isActive: owner?.isActive ?? true,
        },
    });

    React.useEffect(() => {
        if (owner) {
            const phone = parsePhone(owner.phone);
            reset({
                name: owner.name || "",
                email: owner.email || "",
                countryCode: phone.code,
                phoneNumber: phone.num,
                password: owner.password || "",
                businessName: owner.businesses?.[0]?.businessName || owner.businessName || "",
                businessCategory: owner.businesses?.[0]?.businessCategoryId?._id || (typeof owner.businessCategory === 'object' ? owner.businessCategory?._id : "") || "",
                isActive: owner.isActive ?? true,
            });
        }
    }, [owner, reset]);

    const onSubmitForm = async (data: FormData) => {
        await onSubmit({
            name: data.name.trim(),
            email: data.email.trim(),
            phone: `${data.countryCode} ${data.phoneNumber}`.trim(),
            password: data.password || "",
            businessName: data.businessName.trim(),
            businessCategory: data.businessCategory,
            isActive: data.isActive
        });
    };

    return (
        <>
            <div className="bg-white dark:bg-darkFilterbar rounded-[4px] mt-4">
                <form id="owner-form" onSubmit={handleSubmit(onSubmitForm)} className="p-4 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="businessName">{Constants.superadminConstants.businessnamelabel} <span className="text-red-500">*</span></WebComponents.UiComponents.UiWebComponents.FormLabel>
                        <WebComponents.UiComponents.UiWebComponents.FormInput
                            id="businessName"
                            {...register("businessName")}
                            className={errors.businessName ? "border-red-500" : ""}
                        />
                        {errors.businessName && <p className="mt-1 text-xs text-red-500">{errors.businessName.message}</p>}
                    </div>

                    <div>
                        <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="businessCategory">{Constants.superadminConstants.businesscategorylabel} <span className="text-red-500">*</span></WebComponents.UiComponents.UiWebComponents.FormLabel>
                        <Controller
                            name="businessCategory"
                            control={control}
                            render={({ field: { value, onChange } }) => (
                                <WebComponents.UiComponents.UiWebComponents.FormDropdown
                                    id="businessCategory"
                                    value={value}
                                    onChange={onChange}
                                    className={errors.businessCategory ? "border-red-500" : ""}
                                >
                                    <WebComponents.UiComponents.UiWebComponents.FormOption value="">{Constants.superadminConstants.selectcategory}</WebComponents.UiComponents.UiWebComponents.FormOption>
                                    {businessCategories.map(cat => (
                                        <WebComponents.UiComponents.UiWebComponents.FormOption key={cat._id} value={cat._id}>
                                            {cat.categoryName}
                                        </WebComponents.UiComponents.UiWebComponents.FormOption>
                                    ))}
                                </WebComponents.UiComponents.UiWebComponents.FormDropdown>
                            )}
                        />
                        {errors.businessCategory && <p className="mt-1 text-xs text-red-500">{errors.businessCategory.message}</p>}
                    </div>

                    <div>
                        <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="name">{Constants.superadminConstants.ownername} <span className="text-red-500">*</span></WebComponents.UiComponents.UiWebComponents.FormLabel>
                        <WebComponents.UiComponents.UiWebComponents.FormInput
                            id="name"
                            {...register("name")}
                            className={errors.name ? "border-red-500" : ""}
                        />
                        {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
                    </div>

                    <div>
                        <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="phone">{Constants.superadminConstants.phonelabel} <span className="text-red-500">*</span></WebComponents.UiComponents.UiWebComponents.FormLabel>
                        <Controller
                            name="phoneNumber"
                            control={control}
                            render={({ field: phoneField }) => (
                                <Controller
                                    name="countryCode"
                                    control={control}
                                    render={({ field: codeField }) => (
                                        <WebComponents.UiComponents.UiWebComponents.PhoneInputWithCountryCode
                                            countryCode={codeField.value}
                                            phoneNumber={phoneField.value}
                                            onCountryCodeChange={codeField.onChange}
                                            onPhoneNumberChange={phoneField.onChange}
                                            className={(errors.phoneNumber || errors.countryCode) ? "border-red-500" : ""}
                                        />
                                    )}
                                />
                            )}
                        />
                        {(errors.phoneNumber || errors.countryCode) && (
                            <p className="mt-1 text-xs text-red-500">
                                {errors.phoneNumber?.message || errors.countryCode?.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="email">{Constants.superadminConstants.emaillabel} <span className="text-red-500">*</span></WebComponents.UiComponents.UiWebComponents.FormLabel>
                        <WebComponents.UiComponents.UiWebComponents.FormInput
                            id="email"
                            type="email"
                            {...register("email")}
                            className={errors.email ? "border-red-500" : ""}
                        />
                        {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
                    </div>

                    {!isEditing && (
                        <div className="relative">
                            <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="password">
                                {Constants.superadminConstants.passwordlabel} <span className="text-red-500">*</span>
                            </WebComponents.UiComponents.UiWebComponents.FormLabel>
                            <div className="relative">
                                <WebComponents.UiComponents.UiWebComponents.FormInput
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    {...register("password")}
                                    placeholder="Enter password"
                                    className={errors.password ? "border-red-500 pr-10" : "pr-10"}
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
                        </div>
                    )}

                    <div>
                        <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="status-toggle">{Constants.superadminConstants.statuslabel}</WebComponents.UiComponents.UiWebComponents.FormLabel>
                        <Controller
                            name="isActive"
                            control={control}
                            render={({ field: { value, onChange } }) => (
                                <div className="h-[44px] w-full rounded-[4px] bg-textMain2 dark:bg-[#1B1B1B] border-[0.6px] border-[#D8D9D9] dark:border-[#616161] flex items-center justify-between px-3 sm:px-4 py-[10px]">
                                    <span className="text-xs sm:text-sm font-interTight font-medium leading-[14px] text-textMain dark:text-white">
                                        {value ? Constants.superadminConstants.activestatus : Constants.superadminConstants.inactivestatus}
                                    </span>
                                    <WebComponents.UiComponents.UiWebComponents.Switch
                                        id="status-toggle"
                                        checked={value}
                                        onCheckedChange={onChange}
                                    />
                                </div>
                            )}
                        />
                    </div>
                </form>
            </div>

            <div className="flex justify-end gap-3 mt-6">
                <WebComponents.UiComponents.UiWebComponents.Button variant="cancel" onClick={onClose}>{Constants.superadminConstants.cancelbutton}</WebComponents.UiComponents.UiWebComponents.Button>
                <WebComponents.UiComponents.UiWebComponents.Button variant="save" type="submit" form="owner-form" disabled={isSubmitting}>
                    {isSubmitting ? Constants.superadminConstants.saving : Constants.superadminConstants.save}
                </WebComponents.UiComponents.UiWebComponents.Button>
            </div>
        </>
    );
}

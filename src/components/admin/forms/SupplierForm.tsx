"use client";
import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Constants } from "@/constant";
import { WebComponents } from "@/components";
import { Country, State as CscState, City as CscCity } from 'country-state-city';
import { AdminTypes } from "@/types";
import { supplierSchema } from "@/app/validation/ValidationSchema";

// Parse phone number to extract country code and number
const parsePhoneNumber = (phone: string | undefined): { countryCode: string; phoneNumber: string } => {
    if (!phone) return { countryCode: "+91", phoneNumber: "" };
    // Try to extract country code (common patterns: +1, +44, etc.)
    const phoneRegex = /^(\+\d{1,4})\s*(.+)$/;
    const phoneMatch = phoneRegex.exec(phone);
    if (phoneMatch) {
        return { countryCode: phoneMatch[1], phoneNumber: phoneMatch[2] };
    }
    // If phone starts with + but no space, try to find the code
    if (phone.startsWith("+")) {
        // Common country code lengths: 1-4 digits after +
        const codeRegex = /^(\+\d{1,4})(\d+)$/;
        const codeMatch = codeRegex.exec(phone);
        if (codeMatch) {
            return { countryCode: codeMatch[1], phoneNumber: codeMatch[2] };
        }
    }
    // Default: assume India (+91) if no code found
    return { countryCode: "+91", phoneNumber: phone };
};

interface SupplierFormProps {
    onSubmit: (data: AdminTypes.supplierTypes.SupplierFormData) => void;
    supplier?: AdminTypes.supplierTypes.Supplier;
}

const SupplierForm = ({
    onSubmit,
    supplier
}: SupplierFormProps) => {
    type FormData = Yup.InferType<typeof supplierSchema>;

    const initialPhone = parsePhoneNumber(supplier?.phone);
    const [dialCode, setDialCode] = useState(initialPhone.countryCode);

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
        setValue,
        watch,
        reset,
    } = useForm<FormData>({
        resolver: yupResolver(supplierSchema) as any,
        defaultValues: {
            name: supplier?.name || "",
            email: supplier?.email || "",
            phone: initialPhone.phoneNumber,
            code: supplier?.supplierCode || "",
            address: supplier?.address.street || "",
            city: supplier?.address.city || "",
            state: supplier?.address.state || "",
            country: supplier?.address.country || "",
            pincode: supplier?.address.pincode || "",
            status: supplier?.status ?? true,
            supplierImage: supplier?.supplierImage || null,
            createdBy: supplier?.createdBy,
            updatedBy: supplier?.updatedBy,
        },
    });

    const watchedName = watch("name");
    const watchedPhone = watch("phone");
    const watchedCode = watch("code");
    const watchedCountry = watch("country");
    const watchedState = watch("state");

    const isEditing = !!supplier;

    // Reset form when supplier prop changes
    React.useEffect(() => {
        if (supplier) {
            const { countryCode: newDialCode, phoneNumber: newNumber } = parsePhoneNumber(supplier.phone);
            setDialCode(newDialCode);
            reset({
                name: supplier.name,
                email: supplier.email,
                phone: newNumber,
                code: supplier.supplierCode,
                address: supplier.address.street,
                city: supplier.address.city,
                state: supplier.address.state,
                country: supplier.address.country,
                pincode: supplier.address.pincode,
                status: supplier.status,
                supplierImage: supplier.supplierImage,
                createdBy: supplier.createdBy,
                updatedBy: supplier.updatedBy,
            });
        }
    }, [supplier, reset]);

    // Country / State / City options using country-state-city
    const countryOptions = React.useMemo(() =>
        Country.getAllCountries().map((c) => ({ name: c.name, value: c.isoCode })),
        []);

    const stateOptions = React.useMemo(() => {
        if (!watchedCountry) return [] as { name: string; value: string }[];
        return CscState.getStatesOfCountry(watchedCountry).map((s) => ({ name: s.name, value: s.isoCode }));
    }, [watchedCountry]);

    const cityOptions = React.useMemo(() => {
        if (!watchedCountry || !watchedState) return [] as { name: string; value: string }[];
        return CscCity.getCitiesOfState(watchedCountry, watchedState).map((ci) => ({ name: ci.name, value: ci.name }));
    }, [watchedCountry, watchedState]);

    // Function to generate supplier code
    const generateSupplierCode = (supplierName: string, phoneNumber: string): string => {
        if (!supplierName || !phoneNumber) return "";

        // Extract first 3-4 characters from supplier name (uppercase, no spaces)
        const namePart = supplierName
            .replace(/\s+/g, '') // Remove spaces
            .replace(/[^a-zA-Z]/g, '') // Remove non-alphabetic characters
            .substring(0, 4)
            .toUpperCase();

        // Extract last 3 digits from phone number
        const phoneDigits = phoneNumber.replace(/\D/g, ''); // Remove non-digits
        const phonePart = phoneDigits.slice(-3); // Get last 3 digits

        // Ensure we have at least 3 digits from phone
        if (phonePart.length < 3) {
            return `SUP${namePart}${phonePart.padStart(3, '0')}`;
        }

        return `SUP${namePart}${phonePart}`;
    };

    // Auto-generate code when name or phone changes (only for new suppliers and when code is empty)
    React.useEffect(() => {
        if (!isEditing && watchedName && watchedPhone && !watchedCode) {
            const generatedCode = generateSupplierCode(watchedName, watchedPhone);
            setValue("code", generatedCode);
        }
    }, [watchedName, watchedPhone, isEditing, watchedCode, setValue]);

    const onSubmitForm = (data: FormData) => {
        // Combine dialCode and phone number and structure address object before submitting
        const { address, city, state, country, pincode, code, ...rest } = data;

        const finalData = {
            ...rest,
            supplierCode: code,
            phone: `${dialCode}${data.phone}`,
            address: {
                street: address,
                city,
                state,
                pincode,
                country
            }
        };
        onSubmit(finalData as any);
    };

    return (
        <form id="supplier-form" onSubmit={handleSubmit(onSubmitForm)}>
            <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-[2fr_2fr_2fr] gap-6 items-start">
                    {/* Supplier Image */}
                    <div className="md:col-span-1 space-y-6">
                        {/* Supplier Image */}
                        <div>
                            <WebComponents.UiWebComponents.UiWebComponents.FormLabel className="mb-2 block">{Constants.adminConstants.imageLabel}</WebComponents.UiWebComponents.UiWebComponents.FormLabel>
                            <div className="rounded-md border border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/40 p-3">
                                <Controller
                                    name="supplierImage"
                                    control={control}
                                    render={({ field: { value, onChange } }) => (
                                        <WebComponents.UiWebComponents.UiWebComponents.ImageCropUpload
                                            value={value}
                                            onChange={onChange}
                                            aspect={1}
                                            viewSize={300}
                                            previewSize={{ width: 96, height: 96 }}
                                            shape="rect"
                                            previewMask="circle"
                                            accept="image/*"
                                            uploadButtonText="Upload"
                                            removeButtonText="Remove"
                                            useAdminUpload={true}
                                        />
                                    )}
                                />
                            </div>
                            {errors.supplierImage && (
                                <p className="mt-1 text-sm text-red-500">{errors.supplierImage.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="lg:col-span-2 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Code */}
                            <div className="col-span-1">
                                <WebComponents.UiWebComponents.UiWebComponents.FormLabel htmlFor="code">
                                    {Constants.adminConstants.codeLabel} {!isEditing && <span className="text-xs text-gray-500">({Constants.adminConstants.autoGeneratedLabel})</span>}
                                    {isEditing && <span className="text-xs text-gray-500">(Read-only)</span>}
                                </WebComponents.UiWebComponents.UiWebComponents.FormLabel>
                                <WebComponents.UiWebComponents.UiWebComponents.FormInput
                                    id="code"
                                    type="text"
                                    placeholder={isEditing ? "Supplier code" : "Enter supplier code or leave blank for auto-generation"}
                                    {...register("code")}
                                    readOnly={isEditing}
                                    className={`${isEditing ? "bg-gray-50 cursor-not-allowed" : ""} ${errors.code ? "border-red-500" : ""}`}
                                />
                                {errors.code && (
                                    <p className="mt-1 text-sm text-red-500">{errors.code.message}</p>
                                )}
                            </div>

                            {/* Supplier Name */}
                            <div className="col-span-1">
                                <WebComponents.UiWebComponents.UiWebComponents.FormLabel htmlFor="name">{Constants.adminConstants.supplierNameLabel} <span className="text-red-500">*</span></WebComponents.UiWebComponents.UiWebComponents.FormLabel>
                                <WebComponents.UiWebComponents.UiWebComponents.FormInput
                                    id="name"
                                    type="text"
                                    placeholder="Enter supplier name"
                                    {...register("name")}
                                    className={errors.name ? "border-red-500" : ""}
                                />
                                {errors.name && (
                                    <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Phone */}
                            <div className="col-span-1">
                                <WebComponents.UiWebComponents.UiWebComponents.FormLabel htmlFor="phone">{Constants.adminConstants.phoneLabel} <span className="text-red-500">*</span></WebComponents.UiWebComponents.UiWebComponents.FormLabel>
                                <div className={`w-full`}>
                                    <Controller
                                        name="phone"
                                        control={control}
                                        render={({ field: { value, onChange } }) => (
                                            <WebComponents.UiWebComponents.UiWebComponents.PhoneInputWithCountryCode
                                                countryCode={dialCode}
                                                phoneNumber={value}
                                                onCountryCodeChange={setDialCode}
                                                onPhoneNumberChange={onChange}
                                                placeholder="Enter phone number"
                                                className={errors.phone ? "border-red-500" : ""}
                                            />
                                        )}
                                    />
                                </div>
                                {errors.phone && (
                                    <p className="mt-1 text-sm text-red-500">{errors.phone.message}</p>
                                )}
                            </div>

                            {/* Email */}
                            <div className="col-span-1">
                                <WebComponents.UiWebComponents.UiWebComponents.FormLabel htmlFor="email">{Constants.adminConstants.emailLabel} <span className="text-red-500">*</span></WebComponents.UiWebComponents.UiWebComponents.FormLabel>
                                <WebComponents.UiWebComponents.UiWebComponents.FormInput
                                    id="email"
                                    type="email"
                                    placeholder="Enter email address"
                                    {...register("email")}
                                    className={errors.email ? "border-red-500" : ""}
                                />
                                {errors.email && (
                                    <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
                                )}
                            </div>
                        </div>

                        {/* Address */}
                        <div className="grid grid-cols-1 gap-6">
                            <div>
                                <WebComponents.UiWebComponents.UiWebComponents.FormLabel htmlFor="address">{Constants.adminConstants.addressLabel} <span className="text-red-500">*</span></WebComponents.UiWebComponents.UiWebComponents.FormLabel>
                                <WebComponents.UiWebComponents.UiWebComponents.FormInput
                                    id="address"
                                    type="text"
                                    placeholder="Enter address"
                                    {...register("address")}
                                    className={errors.address ? "border-red-500" : ""}
                                />
                                {errors.address && (
                                    <p className="mt-1 text-sm text-red-500">{errors.address.message}</p>
                                )}
                            </div>
                        </div>

                        {/* Country, State, City */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Country */}
                            <div>
                                <WebComponents.UiWebComponents.UiWebComponents.FormLabel htmlFor="country">{Constants.adminConstants.countryLabel} <span className="text-red-500">*</span></WebComponents.UiWebComponents.UiWebComponents.FormLabel>
                                <Controller
                                    name="country"
                                    control={control}
                                    render={({ field: { value, onChange } }) => (
                                        <WebComponents.UiWebComponents.UiWebComponents.FilterDropdown
                                            value={value || null}
                                            onChange={(e) => {
                                                const code = e?.value ?? '';
                                                onChange(code);
                                                setValue("state", "");
                                                setValue("city", "");
                                            }}
                                            options={countryOptions}
                                            optionLabel="name"
                                            optionValue="value"
                                            placeholder="Select country"
                                            filter
                                            className="w-full"
                                        />
                                    )}
                                />
                                {errors.country && (
                                    <p className="mt-1 text-sm text-red-500">{errors.country.message}</p>
                                )}
                            </div>

                            {/* State */}
                            <div>
                                <WebComponents.UiWebComponents.UiWebComponents.FormLabel htmlFor="state">{Constants.adminConstants.stateLabel} <span className="text-red-500">*</span></WebComponents.UiWebComponents.UiWebComponents.FormLabel>
                                <Controller
                                    name="state"
                                    control={control}
                                    render={({ field: { value, onChange } }) => (
                                        <WebComponents.UiWebComponents.UiWebComponents.FilterDropdown
                                            value={value || null}
                                            onChange={(e) => {
                                                const code = e?.value ?? '';
                                                onChange(code);
                                                setValue("city", "");
                                            }}
                                            options={stateOptions}
                                            optionLabel="name"
                                            optionValue="value"
                                            placeholder="Select state"
                                            filter
                                            className="w-full"
                                            disabled={!watchedCountry}
                                        />
                                    )}
                                />
                                {errors.state && (
                                    <p className="mt-1 text-sm text-red-500">{errors.state.message}</p>
                                )}
                            </div>

                            {/* City */}
                            <div>
                                <WebComponents.UiWebComponents.UiWebComponents.FormLabel htmlFor="city">{Constants.adminConstants.cityLabel} <span className="text-red-500">*</span></WebComponents.UiWebComponents.UiWebComponents.FormLabel>
                                <Controller
                                    name="city"
                                    control={control}
                                    render={({ field: { value, onChange } }) => (
                                        <WebComponents.UiWebComponents.UiWebComponents.FilterDropdown
                                            value={value || null}
                                            onChange={(e) => onChange(e?.value ?? '')}
                                            options={cityOptions}
                                            optionLabel="name"
                                            optionValue="value"
                                            placeholder="Select city"
                                            filter
                                            className="w-full"
                                            disabled={!watchedCountry || !watchedState}
                                        />
                                    )}
                                />
                                {errors.city && (
                                    <p className="mt-1 text-sm text-red-500">{errors.city.message}</p>
                                )}
                            </div>
                        </div>

                        {/* Postal Code , Status */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <WebComponents.UiWebComponents.UiWebComponents.FormLabel htmlFor="pincode">{Constants.adminConstants.pincodeLabel} <span className="text-red-500">*</span></WebComponents.UiWebComponents.UiWebComponents.FormLabel>
                                <WebComponents.UiWebComponents.UiWebComponents.FormInput
                                    id="pincode"
                                    type="text"
                                    placeholder="Enter pincode"
                                    {...register("pincode")}
                                    className={errors.pincode ? "border-red-500" : ""}
                                />
                                {errors.pincode && (
                                    <p className="mt-1 text-sm text-red-500">{errors.pincode.message}</p>
                                )}
                            </div>
                            <div>
                                <WebComponents.UiWebComponents.UiWebComponents.FormLabel htmlFor="supplier-status-toggle">{Constants.adminConstants.statusLabel}</WebComponents.UiWebComponents.UiWebComponents.FormLabel>
                                <Controller
                                    name="status"
                                    control={control}
                                    render={({ field: { value, onChange } }) => (
                                        <div className="h-[44px] w-full rounded-[4px] border-[0.6px] border-[#D8D9D9] dark:border-[#616161] bg-textMain2 dark:bg-[#1B1B1B]">
                                            <div className="flex items-center justify-between px-3 py-[10px]">
                                                <span className="text-sm font-interTight font-medium leading-[14px] text-textMain dark:text-white">{value ? "Active" : "Inactive"}</span>
                                                <WebComponents.UiWebComponents.UiWebComponents.Switch id="supplier-status-toggle" checked={value} onCheckedChange={onChange} />
                                            </div>
                                        </div>
                                    )}
                                />
                                {errors.status && (
                                    <p className="mt-1 text-sm text-red-500">{errors.status.message}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
}


export default SupplierForm;
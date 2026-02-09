"use client";
import React from "react";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Constants } from "@/constant";
import { customerFormSchema } from "@/app/validation/ValidationSchema";
import * as Yup from "yup";
import { WebComponents } from "@/components";
import { AdminTypes } from "@/types";

// Known country codes sorted by length (longest first) for proper matching
const KNOWN_COUNTRY_CODES = [
    // 4-digit codes
    "+1684", "+1264", "+1268", "+1242", "+1246", "+1441", "+1284", "+1345", "+1767", "+1809", "+1829", "+1849", "+1473", "+1876", "+1664", "+1787", "+1939", "+1869", "+1758", "+1784", "+1868", "+1649", "+1340",
    // 3-digit codes
    "+993", "+992", "+977", "+976", "+975", "+974", "+973", "+972", "+971", "+970", "+968", "+967", "+966", "+965", "+964", "+963", "+962", "+961", "+960", "+886", "+880", "+856", "+855", "+853", "+852", "+850", "+692", "+691", "+690", "+689", "+688", "+687", "+686", "+685", "+683", "+682", "+681", "+680", "+679", "+678", "+677", "+676", "+675", "+674", "+673", "+672", "+670", "+599", "+598", "+597", "+596", "+595", "+594", "+593", "+592", "+591", "+590", "+509", "+508", "+507", "+506", "+505", "+504", "+503", "+502", "+501", "+500", "+423", "+421", "+420", "+389", "+387", "+386", "+385", "+383", "+382", "+381", "+380", "+378", "+377", "+376", "+375", "+374", "+373", "+372", "+371", "+370", "+359", "+358", "+357", "+356", "+355", "+354", "+353", "+352", "+351", "+350", "+299", "+298", "+297", "+295", "+291", "+290", "+269", "+268", "+267", "+266", "+265", "+264", "+263", "+262", "+261", "+260", "+258", "+257", "+256", "+255", "+254", "+253", "+252", "+251", "+250", "+249", "+248", "+247", "+246", "+245", "+244", "+243", "+242", "+241", "+240", "+239", "+238", "+237", "+236", "+235", "+234", "+233", "+232", "+231", "+230", "+229", "+228", "+227", "+226", "+225", "+224", "+223", "+222", "+221", "+220", "+218", "+216", "+213", "+212", "+211", "+98", "+95", "+94", "+93", "+92", "+91", "+90", "+86", "+84", "+82", "+81", "+66", "+65", "+64", "+63", "+62", "+61", "+60", "+58", "+57", "+56", "+55", "+54", "+53", "+52", "+51", "+49", "+48", "+47", "+46", "+45", "+44", "+43", "+41", "+40", "+39", "+36", "+34", "+33", "+32", "+31", "+30", "+27", "+20",
    // 1-digit code (North America)
    "+1"
];

// Parse phone number to extract country code and number
const parsePhoneNumber = (phone: string | undefined): { countryCode: string; phoneNumber: string } => {
    if (!phone) return { countryCode: "+91", phoneNumber: "" };

    // If phone has a space after country code, split by space
    const spaceMatch = /^(\+\d{1,4})\s+(.+)$/.exec(phone);
    if (spaceMatch) {
        return { countryCode: spaceMatch[1], phoneNumber: spaceMatch[2].replace(/\s/g, '') };
    }

    // Try to match known country codes (sorted by length, longest first)
    if (phone.startsWith("+")) {
        for (const code of KNOWN_COUNTRY_CODES) {
            if (phone.startsWith(code)) {
                const phoneNumber = phone.slice(code.length);
                if (phoneNumber.length >= 5) { // Ensure remaining is a valid phone number
                    return { countryCode: code, phoneNumber };
                }
            }
        }
    }

    // Default: assume India (+91) if no code found
    return { countryCode: "+91", phoneNumber: phone.replace(/^\+/, '') };
};



const CustomerForm = ({ onSubmit, customer, existingCustomers }: AdminTypes.customerTypes.CustomerFormProps) => {
    const isEditing = !!customer;

    // Extract initial address fields
    const initialAddress = (() => {
        if (!customer) {
            return {
                street: "",
                city: "",
                state: "",
                country: "",
                pincode: "",
            };
        }

        const addr = customer.address;
        const legacyCity = customer.city ?? "";
        const legacyState = customer.state ?? "";
        const legacyCountry = customer.country ?? "";
        const legacyPincode = customer.pincode ?? "";

        if (typeof addr === 'string') {
            return {
                street: addr,
                city: legacyCity,
                state: legacyState,
                country: legacyCountry,
                pincode: legacyPincode,
            };
        }

        if (
            typeof addr === 'object' &&
            addr !== null &&
            !Array.isArray(addr)
        ) {
            return {
                street: addr.street ?? "",
                city: addr.city ?? legacyCity,
                state: addr.state ?? legacyState,
                country: addr.country ?? legacyCountry,
                pincode: addr.pincode ?? legacyPincode,
            };
        }

        return {
            street: "",
            city: legacyCity,
            state: legacyState,
            country: legacyCountry,
            pincode: legacyPincode,
        };
    })();

    // Extract initial customer name
    const initialCustomerName = customer
        ? customer.customerName || customer.fullName ||
        `${(customer as Record<string, string | undefined>).firstName || ''} ${(customer as Record<string, string | undefined>).lastName || ''}`.trim() || ""
        : "";



    // Parse initial phone number
    const initialPhone = parsePhoneNumber(customer?.phone);

    type FormData = Yup.InferType<typeof customerFormSchema>;

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
        reset,
    } = useForm<FormData>({
        resolver: yupResolver(customerFormSchema) as Resolver<FormData>,
        defaultValues: {
            customerName: initialCustomerName,
            gender: (customer?.gender as AdminTypes.customerTypes.GenderType) || "Male",
            countryCode: initialPhone.countryCode,
            phoneNumber: initialPhone.phoneNumber,
            email: customer?.email || "",
            address: initialAddress,
            isActive: customer?.isActive ?? customer?.status ?? true,
        },
    });

    // Update form values when customer prop changes
    React.useEffect(() => {
        if (customer) {
            const addressObj = (() => {
                const addr = customer.address;
                const legacyCity = customer.city ?? "";
                const legacyState = customer.state ?? "";
                const legacyCountry = customer.country ?? "";
                const legacyPincode = customer.pincode ?? "";

                if (typeof addr === 'string') {
                    return {
                        street: addr,
                        city: legacyCity,
                        state: legacyState,
                        country: legacyCountry,
                        pincode: legacyPincode,
                    };
                }

                if (
                    typeof addr === 'object' &&
                    addr !== null &&
                    !Array.isArray(addr)
                ) {
                    return {
                        street: addr.street ?? "",
                        city: addr.city ?? legacyCity,
                        state: addr.state ?? legacyState,
                        country: addr.country ?? legacyCountry,
                        pincode: addr.pincode ?? legacyPincode,
                    };
                }

                return {
                    street: "",
                    city: legacyCity,
                    state: legacyState,
                    country: legacyCountry,
                    pincode: legacyPincode,
                };
            })();

            const customerName = customer.customerName || customer.fullName ||
                `${(customer as Record<string, string | undefined>).firstName || ''} ${(customer as Record<string, string | undefined>).lastName || ''}`.trim() || "";

            const phone = parsePhoneNumber(customer.phone);

            reset({
                customerName: customerName,
                gender: (customer.gender as AdminTypes.customerTypes.GenderType) || "Male",
                countryCode: phone.countryCode,
                phoneNumber: phone.phoneNumber,
                email: customer.email || "",
                address: addressObj,
                isActive: customer.isActive ?? customer.status ?? true,
            });
        }
    }, [customer, reset]);

    const onSubmitForm = (data: FormData) => {
        // Combine country code and phone number without space
        const fullPhone = `${data.countryCode}${data.phoneNumber}`.trim();
        onSubmit({
            customerName: data.customerName.trim(),
            gender: data.gender as AdminTypes.customerTypes.GenderType,
            phone: fullPhone,
            email: data.email?.trim() || "",
            address: {
                street: data.address?.street?.trim() || "",
                city: data.address?.city?.trim() || "",
                state: data.address?.state?.trim() || "",
                country: data.address?.country?.trim() || "",
                pincode: data.address?.pincode?.trim() || "",
            },
            isActive: data.isActive,
        });
    };

    return (
        <form id="customer-form" onSubmit={handleSubmit(onSubmitForm)}>
            <div className="p-4 sm:p-5 md:p-6 lg:p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 md:gap-6 lg:gap-8">


                    {/* Customer Name */}
                    <div className="col-span-1">
                        <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="customerName">
                            {Constants.adminConstants.customerNameLabel}{" "}
                            <span className="text-required">{Constants.adminConstants.requiredstar}</span>
                        </WebComponents.UiComponents.UiWebComponents.FormLabel>
                        <WebComponents.UiComponents.UiWebComponents.FormInput
                            id="customerName"
                            type="text"
                            placeholder="Enter customer name"
                            {...register("customerName")}
                            autoComplete="off"
                            className={errors.customerName ? "border-red-500" : ""}
                        />
                        {errors.customerName && (
                            <p className="mt-1 text-sm text-required">{errors.customerName.message}</p>
                        )}
                    </div>

                    {/* Gender */}
                    <div className="col-span-1">
                        <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="gender">
                            {Constants.adminConstants.genderLabel}{" "}
                            <span className="text-required">{Constants.adminConstants.requiredstar}</span>
                        </WebComponents.UiComponents.UiWebComponents.FormLabel>
                        <Controller
                            name="gender"
                            control={control}
                            render={({ field: { value, onChange } }) => (
                                <WebComponents.UiComponents.UiWebComponents.FormDropdown
                                    id="gender"
                                    value={value}
                                    onChange={(e) => onChange(e.target.value)}
                                >
                                    <WebComponents.UiComponents.UiWebComponents.FormOption value="Male">Male</WebComponents.UiComponents.UiWebComponents.FormOption>
                                    <WebComponents.UiComponents.UiWebComponents.FormOption value="Female">Female</WebComponents.UiComponents.UiWebComponents.FormOption>
                                    <WebComponents.UiComponents.UiWebComponents.FormOption value="Other">Other</WebComponents.UiComponents.UiWebComponents.FormOption>
                                </WebComponents.UiComponents.UiWebComponents.FormDropdown>
                            )}
                        />
                        {errors.gender && (
                            <p className="mt-1 text-sm text-required">{errors.gender.message}</p>
                        )}
                    </div>

                    {/* Phone */}
                    <div className="col-span-1">
                        <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="phoneNumber">
                            {Constants.adminConstants.phoneLabel}{" "}
                            <span className="text-required">{Constants.adminConstants.requiredstar}</span>
                        </WebComponents.UiComponents.UiWebComponents.FormLabel>
                        <Controller
                            name="countryCode"
                            control={control}
                            render={({ field: { value: countryCodeValue, onChange: onCountryCodeChange } }) => (
                                <Controller
                                    name="phoneNumber"
                                    control={control}
                                    render={({ field: { value: phoneValue, onChange: onPhoneChange } }) => (
                                        <WebComponents.UiComponents.UiWebComponents.PhoneInputWithCountryCode
                                            countryCode={countryCodeValue}
                                            phoneNumber={phoneValue}
                                            onCountryCodeChange={onCountryCodeChange}
                                            onPhoneNumberChange={onPhoneChange}
                                            placeholder="Enter phone number"
                                        />
                                    )}
                                />
                            )}
                        />
                        {errors.phoneNumber && (
                            <p className="mt-1 text-sm text-required">{errors.phoneNumber.message}</p>
                        )}
                        {errors.countryCode && (
                            <p className="mt-1 text-sm text-required">{errors.countryCode.message}</p>
                        )}
                    </div>

                    {/* Email */}
                    <div className="col-span-1">
                        <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="email">
                            {Constants.adminConstants.emailLabel}
                        </WebComponents.UiComponents.UiWebComponents.FormLabel>
                        <WebComponents.UiComponents.UiWebComponents.FormInput
                            id="email"
                            type="email"
                            placeholder="Enter email address"
                            {...register("email")}
                            autoComplete="off"
                            className={errors.email ? "border-red-500" : ""}
                        />
                        {errors.email && (
                            <p className="mt-1 text-sm text-required">{errors.email.message}</p>
                        )}
                    </div>

                    {/* Address */}
                    <div className="col-span-1">
                        <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="address.street">
                            {Constants.adminConstants.addressLabel}
                        </WebComponents.UiComponents.UiWebComponents.FormLabel>
                        <WebComponents.UiComponents.UiWebComponents.FormInput
                            id="address.street"
                            type="text"
                            placeholder="Enter address"
                            {...register("address.street")}
                            autoComplete="off"
                            className={errors.address?.street ? "border-red-500" : ""}
                        />
                        {errors.address?.street && (
                            <p className="mt-1 text-sm text-required">{errors.address.street.message}</p>
                        )}
                    </div>

                    {/* City */}
                    <div className="col-span-1">
                        <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="address.city">
                            {Constants.adminConstants.cityLabel}
                        </WebComponents.UiComponents.UiWebComponents.FormLabel>
                        <WebComponents.UiComponents.UiWebComponents.FormInput
                            id="address.city"
                            type="text"
                            placeholder="Enter city"
                            {...register("address.city")}
                            autoComplete="off"
                            className={errors.address?.city ? "border-red-500" : ""}
                        />
                        {errors.address?.city && (
                            <p className="mt-1 text-sm text-required">{errors.address.city.message}</p>
                        )}
                    </div>

                    {/* State */}
                    <div className="col-span-1">
                        <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="address.state">
                            {Constants.adminConstants.stateLabel}
                        </WebComponents.UiComponents.UiWebComponents.FormLabel>
                        <WebComponents.UiComponents.UiWebComponents.FormInput
                            id="address.state"
                            type="text"
                            placeholder="Enter state"
                            {...register("address.state")}
                            autoComplete="off"
                            className={errors.address?.state ? "border-red-500" : ""}
                        />
                        {errors.address?.state && (
                            <p className="mt-1 text-sm text-required">{errors.address.state.message}</p>
                        )}
                    </div>

                    {/* Country */}
                    <div className="col-span-1">
                        <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="address.country">
                            {Constants.adminConstants.countryLabel}
                        </WebComponents.UiComponents.UiWebComponents.FormLabel>
                        <WebComponents.UiComponents.UiWebComponents.FormInput
                            id="address.country"
                            type="text"
                            placeholder="Enter country"
                            {...register("address.country")}
                            autoComplete="off"
                            className={errors.address?.country ? "border-red-500" : ""}
                        />
                        {errors.address?.country && (
                            <p className="mt-1 text-sm text-required">{errors.address.country.message}</p>
                        )}
                    </div>

                    {/* Pincode */}
                    <div className="col-span-1">
                        <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="address.pincode">
                            {Constants.adminConstants.pincodeLabel}
                        </WebComponents.UiComponents.UiWebComponents.FormLabel>
                        <WebComponents.UiComponents.UiWebComponents.FormInput
                            id="address.pincode"
                            type="text"
                            placeholder="Enter pincode"
                            {...register("address.pincode")}
                            autoComplete="off"
                            className={errors.address?.pincode ? "border-red-500" : ""}
                        />
                        {errors.address?.pincode && (
                            <p className="mt-1 text-sm text-required">{errors.address.pincode.message}</p>
                        )}
                    </div>

                    {/* Status toggle */}
                    <div className="col-span-1">
                        <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="customer-status-toggle">
                            {Constants.adminConstants.statusLabel}{" "}
                            <span className="text-required">{Constants.adminConstants.requiredstar}</span>
                        </WebComponents.UiComponents.UiWebComponents.FormLabel>
                        <Controller
                            name="isActive"
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
                                            id="customer-status-toggle"
                                            checked={value}
                                            onCheckedChange={onChange}
                                            aria-label="Toggle customer status"
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
    );
};

export default CustomerForm;

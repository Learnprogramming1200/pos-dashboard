"use client";
import React from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
// import { PhoneInput } from 'react-international-phone';
// import 'react-international-phone/style.css';
import { Constants } from "@/constant";
import { staffFormSchema } from "@/app/validation/ValidationSchema";
import { WebComponents } from "@/components";
import { AdminTypes } from "@/types";

interface StaffFormProps {
    onSubmit: (data: AdminTypes.hrmTypes.staffTypes.StaffFormData) => void;
    staff?: AdminTypes.hrmTypes.staffTypes.Staff;
    stores: AdminTypes.hrmTypes.staffTypes.StoreOption[];
}

type FormData = Yup.InferType<typeof staffFormSchema>;

const parsePhone = (p?: string) => {
    if (!p) return { code: "+91", num: "" };
    const clean = p.replace(/\s+/g, '');

    // 1. Try matching with space first if present
    const spaceMatch = p.match(/^(\+\d{1,4})\s+(.+)$/);
    if (spaceMatch) return { code: spaceMatch[1], num: spaceMatch[2] };

    // 2. Try matching 10-digit number with 1-3 digit code (common case like +91)
    const match10 = clean.match(/^(\+\d{1,3})(\d{10})$/);
    if (match10) return { code: match10[1], num: match10[2] };

    // 3. Special handling for India if not matched above
    if (clean.startsWith("+91")) return { code: "+91", num: clean.slice(3) };

    // 4. Fallback generic match
    const matchGeneric = clean.match(/^(\+\d{1,4})(\d{7,})$/);
    if (matchGeneric) return { code: matchGeneric[1], num: matchGeneric[2] };

    return { code: "+91", num: clean.replace(/^\+91/, "") };
};

const StaffForm = ({ onSubmit, staff, stores }: StaffFormProps) => {
    const isEdit = !!staff;
    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
        reset,
        watch,
        setValue,
    } = useForm<FormData>({
        resolver: yupResolver(staffFormSchema) as any,
        context: { isEdit },
        defaultValues: {
            firstName: (staff?.user?.name || staff?.name || "")?.split(" ")[0] || "",
            lastName: (staff?.user?.name || staff?.name || "")?.split(" ").slice(1).join(" ") || "",
            email: staff?.user?.email || staff?.email || "",
            countryCode: parsePhone(staff?.user?.phone || staff?.phone).code,
            phoneNumber: parsePhone(staff?.user?.phone || staff?.phone).num,
            designation: staff?.designation || "",
            storeId: staff?.storeId || staff?.store?._id || "",
            salary: Number(staff?.salary || 0),
            joiningDate: (staff?.joinDate || (staff as any)?.joiningDate) ? new Date((staff?.joinDate || (staff as any)?.joiningDate) as string).toISOString().split('T')[0] : "",
            gender: (staff?.gender || (staff as any)?.user?.gender || "Male") as any,
            status: !staff || staff?.isActive === true || staff?.status === 'Active' ? "Active" : "Inactive",
            password: "",
            confirmPassword: "",
            image: staff?.user?.profilePicture || staff?.image || null,
        },
    });

    // Update form values when staff prop changes
    React.useEffect(() => {
        if (staff) {
            const phone = parsePhone(staff.user?.phone || staff.phone);
            reset({
                firstName: (staff.user?.name || staff.name || "")?.split(" ")[0] || "",
                lastName: (staff.user?.name || staff.name || "")?.split(" ").slice(1).join(" ") || "",
                email: staff.user?.email || staff.email || "",
                countryCode: phone.code,
                phoneNumber: phone.num,
                designation: staff.designation || "",
                storeId: staff.storeId || staff.store?._id || "",
                salary: Number(staff.salary || 0),
                joiningDate: (staff.joinDate || (staff as any).joiningDate) ? new Date(staff.joinDate || (staff as any).joiningDate).toISOString().split('T')[0] : "",
                gender: (staff.gender || (staff as any).user?.gender || "Male") as any,
                status: staff.isActive === true || staff.status === 'Active' ? "Active" : "Inactive",
                password: "",
                confirmPassword: "",
                image: staff.user?.profilePicture || staff.image || null,
            });
        }
    }, [staff, reset]);

    const onSubmitForm = (data: FormData) => {
        const { firstName, lastName, countryCode, phoneNumber, ...rest } = data;
        onSubmit({
            ...rest,
            name: `${firstName} ${lastName}`.trim(),
            phone: `${countryCode}${phoneNumber}`.trim(),
            image: data.image as any,
        } as any);
    };

    return (
        <form id="staff-form" onSubmit={handleSubmit(onSubmitForm)}>
            <div className="p-4 sm:p-5 md:p-6 lg:p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 sm:gap-x-5 md:gap-x-6 lg:gap-x-8 gap-y-2 sm:gap-y-3">
                    {/* Row 1: Image (L) | Names & Email (R) */}
                    <div className="col-span-1">
                        <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="image" className="font-semibold text-[#1B1B1B] dark:text-gray-200">
                            Staff Image
                        </WebComponents.UiComponents.UiWebComponents.FormLabel>
                        <div className="mt-1 text-center">
                            <Controller
                                name="image"
                                control={control}
                                render={({ field: { value, onChange } }) => (
                                    <WebComponents.UiComponents.UiWebComponents.ImageCropUpload
                                        id="staff-image"
                                        accept="image/*"
                                        onChange={(val) => {
                                            onChange(typeof val === "string" ? val : null);
                                        }}
                                        value={value as any}
                                        previewSize={{ width: 200, height: 250 }}
                                        viewSize={300}
                                        aspect={1}
                                        shape="rect"
                                        previewMask="rect"
                                        layout="vertical"
                                        uploadButtonText="Upload"
                                        removeButtonText="Remove"
                                        useAdminUpload={true}
                                    />
                                )}
                            />
                        </div>
                    </div>

                    <div className="col-span-1 space-y-2">
                        {/* First Name */}
                        <div>
                            <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="firstName" className="font-semibold text-[#1B1B1B] dark:text-gray-200">
                                First Name <span className="text-required">*</span>
                            </WebComponents.UiComponents.UiWebComponents.FormLabel>
                            <WebComponents.UiComponents.UiWebComponents.FormInput
                                id="firstName"
                                type="text"
                                placeholder="Enter first name"
                                {...register("firstName")}
                                className={`h-[44px] mt-1 rounded-[4px] border-[0.6px] border-[#D8D9D9] dark:border-[#616161] ${errors.firstName ? "border-red-500" : ""}`}
                            />
                            {errors.firstName && (
                                <p className="mt-1 text-sm text-required">{errors.firstName.message}</p>
                            )}
                        </div>

                        {/* Last Name */}
                        <div>
                            <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="lastName" className="font-semibold text-[#1B1B1B] dark:text-gray-200">
                                Last Name <span className="text-required">*</span>
                            </WebComponents.UiComponents.UiWebComponents.FormLabel>
                            <WebComponents.UiComponents.UiWebComponents.FormInput
                                id="lastName"
                                type="text"
                                placeholder="Enter last name"
                                {...register("lastName")}
                                className={`h-[44px] mt-2 rounded-[4px] border-[0.6px] border-[#D8D9D9] dark:border-[#616161] ${errors.lastName ? "border-red-500" : ""}`}
                            />
                            {errors.lastName && (
                                <p className="text-sm text-required">{errors.lastName.message}</p>
                            )}
                        </div>

                        {/* Email */}
                        <div>
                            <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="email" className="font-semibold text-[#1B1B1B] dark:text-gray-200">
                                Email <span className="text-required">*</span>
                            </WebComponents.UiComponents.UiWebComponents.FormLabel>
                            <WebComponents.UiComponents.UiWebComponents.FormInput
                                id="email"
                                type="email"
                                autoComplete="none"
                                placeholder="Enter email address"
                                {...register("email")}
                                className={`h-[44px] mt-2 rounded-[4px] border-[0.6px] border-[#D8D9D9] dark:border-[#616161] ${errors.email ? "border-red-500" : ""}`}
                            />
                            {errors.email && (
                                <p className="text-sm text-required">{errors.email.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Row 2: Store (L) | Phone Number (R) */}
                    <div className="col-span-1">
                        <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="storeId" className="font-semibold text-[#1B1B1B] dark:text-gray-200">
                            Store <span className="text-required">*</span>
                        </WebComponents.UiComponents.UiWebComponents.FormLabel>
                        <div className="mt-1">
                            <Controller
                                name="storeId"
                                control={control}
                                render={({ field: { value, onChange } }) => (
                                    <WebComponents.UiComponents.UiWebComponents.FormDropdown
                                        id="storeId"
                                        value={value}
                                        onChange={(e: any) => onChange(e.target.value)}
                                        className={`border-[0.6px] border-[#D8D9D9] dark:border-[#616161] ${errors.storeId ? "border-red-500" : ""}`}
                                    >
                                        <WebComponents.UiComponents.UiWebComponents.FormOption value="">Select store</WebComponents.UiComponents.UiWebComponents.FormOption>
                                        {stores.map(store => (
                                            <WebComponents.UiComponents.UiWebComponents.FormOption key={store.id} value={store.id}>{store.name}</WebComponents.UiComponents.UiWebComponents.FormOption>
                                        ))}
                                    </WebComponents.UiComponents.UiWebComponents.FormDropdown>
                                )}
                            />
                        </div>
                        {errors.storeId && (
                            <p className="mt-1 text-sm text-required">{errors.storeId.message}</p>
                        )}
                    </div>

                    <div className="col-span-1">
                        <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="phone" className="font-semibold text-[#1B1B1B] dark:text-gray-200">
                            Phone Number <span className="text-required">*</span>
                        </WebComponents.UiComponents.UiWebComponents.FormLabel>
                        <div className="mt-1">
                            <Controller
                                name="countryCode"
                                control={control}
                                render={({ field: codeField }) => (
                                    <Controller
                                        name="phoneNumber"
                                        control={control}
                                        render={({ field: phoneField }) => (
                                            <WebComponents.UiComponents.UiWebComponents.PhoneInputWithCountryCode
                                                countryCode={codeField.value}
                                                phoneNumber={phoneField.value}
                                                onCountryCodeChange={codeField.onChange}
                                                onPhoneNumberChange={phoneField.onChange}
                                                placeholder="Enter phone number"
                                                className={(errors.phoneNumber || errors.countryCode) ? "border-red-500" : ""}
                                            />
                                        )}
                                    />
                                )}
                            />
                        </div>
                        {(errors.phoneNumber || errors.countryCode) && (
                            <p className="mt-1 text-sm text-required">
                                {errors.phoneNumber?.message || errors.countryCode?.message}
                            </p>
                        )}
                    </div>

                    {/* Row 3: Designation (L) | Salary (R) */}
                    <div className="col-span-1">
                        <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="designation" className="font-semibold text-[#1B1B1B] dark:text-gray-200">
                            Designation <span className="text-required">*</span>
                        </WebComponents.UiComponents.UiWebComponents.FormLabel>
                        <div className="mt-1">
                            <Controller
                                name="designation"
                                control={control}
                                render={({ field: { value, onChange } }) => (
                                    <WebComponents.UiComponents.UiWebComponents.FormDropdown
                                        id="designation"
                                        value={value}
                                        onChange={(e: any) => onChange(e.target.value)}
                                        className={`border-[0.6px] border-[#D8D9D9] dark:border-[#616161] ${errors.designation ? "border-red-500" : ""}`}
                                    >
                                        <WebComponents.UiComponents.UiWebComponents.FormOption value="">Select designation</WebComponents.UiComponents.UiWebComponents.FormOption>
                                        {Constants.adminConstants.designations.map(desig => (
                                            <WebComponents.UiComponents.UiWebComponents.FormOption key={desig} value={desig}>{desig}</WebComponents.UiComponents.UiWebComponents.FormOption>
                                        ))}
                                    </WebComponents.UiComponents.UiWebComponents.FormDropdown>
                                )}
                            />
                        </div>
                        {errors.designation && (
                            <p className="mt-1 text-sm text-required">{errors.designation.message}</p>
                        )}
                    </div>
                    <div className="col-span-1">
                        <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="salary" className="font-semibold text-[#1B1B1B] dark:text-gray-200">
                            Salary <span className="text-required">*</span>
                        </WebComponents.UiComponents.UiWebComponents.FormLabel>
                        <WebComponents.UiComponents.UiWebComponents.FormInput
                            id="salary"
                            type="number"
                            placeholder="Enter salary amount"
                            {...register("salary", { valueAsNumber: true })}
                            className={`h-[44px] rounded-[4px] border-[0.6px] border-[#D8D9D9] dark:border-[#616161] ${errors.salary ? "border-red-500" : ""}`}
                        />
                        {errors.salary && (
                            <p className="mt-1 text-sm text-required">{errors.salary.message}</p>
                        )}
                    </div>

                    {/* Row 4: Gender (L) | Joining Date (R) */}
                    <div className="col-span-1">
                        <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="gender" className="font-semibold text-[#1B1B1B] dark:text-gray-200">
                            Gender <span className="text-required">*</span>
                        </WebComponents.UiComponents.UiWebComponents.FormLabel>
                        <div className="mt-1">
                            <Controller
                                name="gender"
                                control={control}
                                render={({ field: { value, onChange } }) => (
                                    <WebComponents.UiComponents.UiWebComponents.FormDropdown
                                        id="gender"
                                        value={value}
                                        onChange={(e: any) => onChange(e.target.value)}
                                        className={`border-[0.6px] border-[#D8D9D9] dark:border-[#616161] ${errors.gender ? "border-red-500" : ""}`}
                                    >
                                        <WebComponents.UiComponents.UiWebComponents.FormOption value="Male">Male</WebComponents.UiComponents.UiWebComponents.FormOption>
                                        <WebComponents.UiComponents.UiWebComponents.FormOption value="Female">Female</WebComponents.UiComponents.UiWebComponents.FormOption>
                                        <WebComponents.UiComponents.UiWebComponents.FormOption value="Other">Other</WebComponents.UiComponents.UiWebComponents.FormOption>
                                    </WebComponents.UiComponents.UiWebComponents.FormDropdown>
                                )}
                            />
                        </div>
                        {errors.gender && (
                            <p className="mt-1 text-sm text-required">{errors.gender.message}</p>
                        )}
                    </div>
                    <div className="col-span-1">
                        <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="joiningDate" className="font-semibold text-[#1B1B1B] dark:text-gray-200">
                            Joining Date <span className="text-required">*</span>
                        </WebComponents.UiComponents.UiWebComponents.FormLabel>
                        <WebComponents.UiComponents.UiWebComponents.FormInput
                            id="joiningDate"
                            type="text"
                            placeholder="dd-mm-yyyy"
                            onFocus={(e) => (e.target.type = "date")}
                            {...register("joiningDate", {
                                onBlur: (e) => { if (!e.target.value) e.target.type = "text"; }
                            })}
                            className={`h-[44px] rounded-[4px] border-[0.6px] border-[#D8D9D9] dark:border-[#616161] ${errors.joiningDate ? "border-red-500" : ""}`}
                        />
                        {errors.joiningDate && (
                            <p className="mt-1 text-sm text-required">{errors.joiningDate.message}</p>
                        )}
                    </div>

                    {/* Row 5: Passwords (Hidden in Edit) */}
                    {!isEdit && (
                        <>
                            <div className="col-span-1">
                                <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="password" aria-required="true" className="font-semibold text-[#1B1B1B] dark:text-gray-200">
                                    Password <span className="text-required">*</span>
                                </WebComponents.UiComponents.UiWebComponents.FormLabel>
                                <WebComponents.UiComponents.UiWebComponents.FormInput
                                    id="password"
                                    type="password"
                                    autoComplete="new-password"
                                    placeholder="Enter password"
                                    {...register("password")}
                                    className={`border-[0.6px] border-[#D8D9D9] dark:border-[#616161] ${errors.password ? "border-red-500" : ""}`}
                                />
                                {errors.password && (
                                    <p className="mt-1 text-sm text-required">{errors.password.message}</p>
                                )}
                            </div>
                            <div className="col-span-1">
                                <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="confirmPassword" aria-required="true" className="font-semibold text-[#1B1B1B] dark:text-gray-200">
                                    Confirm Password <span className="text-required">*</span>
                                </WebComponents.UiComponents.UiWebComponents.FormLabel>
                                <WebComponents.UiComponents.UiWebComponents.FormInput
                                    id="confirmPassword"
                                    type="password"
                                    autoComplete="new-password"
                                    placeholder="Confirm password"
                                    {...register("confirmPassword")}
                                    className={`border-[0.6px] border-[#D8D9D9] dark:border-[#616161] ${errors.confirmPassword ? "border-red-500" : ""}`}
                                />
                                {errors.confirmPassword && (
                                    <p className="mt-1 text-sm text-required">{errors.confirmPassword.message}</p>
                                )}
                            </div>
                        </>
                    )}

                    {/* Row 6: Status */}
                    <div className="col-span-1">
                        <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="status" className="font-semibold text-[#1B1B1B] dark:text-gray-200">
                            Status <span className="text-required">*</span>
                        </WebComponents.UiComponents.UiWebComponents.FormLabel>
                        <div className="mt-1">
                            <Controller
                                name="status"
                                control={control}
                                render={({ field: { value, onChange } }) => (
                                    <div className="h-[44px] w-full rounded-[4px] border-[0.6px] border-[#D8D9D9] dark:border-[#616161] bg-textMain2 dark:bg-[#1B1B1B]">
                                        <div className="flex items-center justify-between px-3 sm:px-4 py-[10px]">
                                            <span className="text-xs sm:text-sm font-interTight font-medium leading-[14px] text-textMain dark:text-white">
                                                {value}
                                            </span>
                                            <WebComponents.UiComponents.UiWebComponents.Switch
                                                checked={value === "Active"}
                                                onCheckedChange={(checked) => onChange(checked ? "Active" : "Inactive")}
                                            />
                                        </div>
                                    </div>
                                )}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
};

export default StaffForm;

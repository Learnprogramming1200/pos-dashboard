"use client";
import React from "react";
import { useForm, Controller } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Constants } from "@/constant";
import { WebComponents } from "@/components";
import { couponFormSchema } from "@/app/validation/ValidationSchema";
import { AdminTypes } from "@/types";

// Customer type for dropdown
interface Customer {
    _id: string;
    customerCode: string;
    customerName: string;
    fullName: string;
    email: string;
    phone: string;
    gender: string;
    isActive: boolean;
}

const CouponForm = ({
    onSubmit,
    coupon,
    customers
}: {
    onSubmit: (data: AdminTypes.adminCouponTypes.AdminCouponFormData) => void,
    coupon?: AdminTypes.adminCouponTypes.AdminCoupon,
    customers?: Customer[]
}) => {
    // Helper function to convert ISO date to YYYY-MM-DD format
    const formatDateForInput = (dateString: string | undefined): string => {
        if (!dateString) return "";
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return "";
            return date.toISOString().split('T')[0]; // Convert to YYYY-MM-DD format
        } catch (error) {
            console.error('Error formatting date:', error);
            return "";
        }
    };

    type FormData = Yup.InferType<typeof couponFormSchema>;

    // Get initial date values
    const getInitialStartDateYMD = () => {
        if (coupon?.start_date) {
            return formatDateForInput(coupon.start_date);
        }
        return ""; // Empty for new coupon
    };

    const getInitialEndDateYMD = () => {
        if (coupon?.end_date) {
            return formatDateForInput(coupon.end_date);
        }
        return ""; // Empty for new coupon
    };

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
        reset,
        watch,
        setValue,
    } = useForm<FormData>({
        resolver: yupResolver(couponFormSchema) as any,
        defaultValues: {
            code: coupon?.code ?? "",
            type: coupon?.type ?? "Percentage",
            discount_amount: coupon?.discount_amount,
            limit: coupon?.limit,
            startDate: getInitialStartDateYMD() || new Date().toISOString().slice(0, 10),
            endDate: getInitialEndDateYMD() || new Date().toISOString().slice(0, 10),
            description: coupon?.description ?? "",
            maxUsagePerUser: coupon?.maxUsagePerUser ?? 1,
            customerIds: coupon?.assignedCustomerIds ?? [],
            sendMail: coupon?.options?.sendEmail ?? false,
            status: coupon?.status ?? true,
        },
    });

    const selectedCustomers = watch("customerIds") || [];

    // Determine customer scope based on selected customers
    const getCustomerScope = (): 'All' | 'Specific' => {
        // If no customers are selected, it's for all customers
        if (!selectedCustomers || selectedCustomers.length === 0) {
            return "All";
        }

        // If all available customers are selected, it's also considered "All"
        const allCustomerIds = customers?.map(c => c._id) || [];
        const allSelected = allCustomerIds.length > 0 &&
            selectedCustomers.length === allCustomerIds.length &&
            allCustomerIds.every(id => selectedCustomers.includes(id));

        return allSelected ? "All" : "Specific";
    };

    const type = watch("type");
    React.useEffect(() => {
        if (coupon) {
            const startDateStr = formatDateForInput(coupon.start_date);
            const endDateStr = formatDateForInput(coupon.end_date);
            reset({
                code: coupon.code || "",
                type: coupon.type || "Percentage",
                discount_amount: coupon.discount_amount,
                limit: coupon.limit ?? 1,
                startDate: startDateStr || new Date().toISOString().slice(0, 10),
                endDate: endDateStr || new Date().toISOString().slice(0, 10),
                description: coupon.description || "",
                maxUsagePerUser: coupon.maxUsagePerUser ?? 1,
                customerIds: coupon.assignedCustomerIds ?? [],
                sendMail: coupon.options?.sendEmail ?? false,
                status: coupon.status ?? true,
            });
        }
    }, [coupon, reset]);

    const generateCouponCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 8; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setValue("code", result);
    };

    const onSubmitForm = (data: FormData) => {
        const customerScope = getCustomerScope();
        
        onSubmit({
            code: data.code.trim(),
            type: data.type as "Percentage" | "Fixed",
            discount_amount: data.discount_amount,
            limit: data.limit,
            start_date: data.startDate,
            end_date: data.endDate,
            description: data.description.trim(),
            maxUsagePerUser: data.maxUsagePerUser,
            assignedCustomerIds: customerScope === "Specific"
                ? (data.customerIds || []).filter((id): id is string => id !== undefined)
                : [],
            customerScope: getCustomerScope(),
            options: { sendEmail: data.sendMail },
            status: data.status,
        });
    };

    return (
        <form id="coupon-form" onSubmit={handleSubmit(onSubmitForm)}>
            <div className="p-4 sm:p-5 md:p-6 lg:p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6 lg:gap-8">

                    {/* Coupon Code */}
                    <div className="col-span-1">
                        <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="code">
                            {Constants.adminConstants.couponCodeLabel}
                        </WebComponents.UiComponents.UiWebComponents.FormLabel>
                        <div className="flex gap-2">
                            <WebComponents.UiComponents.UiWebComponents.FormInput
                                id="code"
                                type="text"
                                placeholder="Enter coupon code"
                                {...register("code")}
                                autoComplete="off"
                                className={errors.code ? "border-red-500" : ""}
                            />
                            <WebComponents.UiComponents.UiWebComponents.Button type="button" variant="outline" onClick={generateCouponCode} className="whitespace-nowrap">
                                {Constants.adminConstants.generateCode}
                            </WebComponents.UiComponents.UiWebComponents.Button>
                        </div>
                        {errors.code && (
                            <p className="mt-1 text-sm text-required">{errors.code.message}</p>
                        )}
                    </div>

                    {/* Coupon Type */}
                    <div className="col-span-1">
                        <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="type">
                            {Constants.adminConstants.couponType}
                        </WebComponents.UiComponents.UiWebComponents.FormLabel>
                        <WebComponents.UiComponents.UiWebComponents.FormDropdown
                            id="type"
                            {...register("type")}
                            name="type"
                            value={type}
                            onChange={(e) => setValue("type", e.target.value as "Percentage" | "Fixed")}
                            autoComplete="off"
                            className={errors.type ? "border-red-500" : ""}
                        >
                            <WebComponents.UiComponents.UiWebComponents.FormOption value="Percentage">{Constants.adminConstants.percentage}</WebComponents.UiComponents.UiWebComponents.FormOption>
                            <WebComponents.UiComponents.UiWebComponents.FormOption value="Fixed">{Constants.adminConstants.fixed}</WebComponents.UiComponents.UiWebComponents.FormOption>
                        </WebComponents.UiComponents.UiWebComponents.FormDropdown>
                        {errors.type && (
                            <p className="mt-1 text-sm text-required">{errors.type.message}</p>
                        )}
                    </div>

                    {/* Discount Amount */}
                    <div className="col-span-1">
                        <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="discount_amount">
                            {Constants.adminConstants.discountAmount}
                        </WebComponents.UiComponents.UiWebComponents.FormLabel>
                        <div className="relative">
                            <WebComponents.UiComponents.UiWebComponents.FormInput
                                id="discount_amount"
                                type="number"
                                placeholder={type === "Percentage" ? "1-100" : "0"}
                                {...register("discount_amount")}
                                autoComplete="off"
                                className={errors.discount_amount ? "border-red-500" : ""}
                            />
                        </div>
                        {errors.discount_amount && (
                            <p className="mt-1 text-sm text-required">{errors.discount_amount.message}</p>
                        )}
                    </div>

                    {/* Limit */}
                    <div className="col-span-1">
                        <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="limit">
                            {Constants.adminConstants.limit}
                        </WebComponents.UiComponents.UiWebComponents.FormLabel>
                        <WebComponents.UiComponents.UiWebComponents.FormInput
                            id="limit"
                            type="number"
                            placeholder="Enter usage limit"
                            {...register("limit")}
                            autoComplete="off"
                            className={errors.limit ? "border-red-500" : ""}
                        />
                        {errors.limit && (
                            <p className="mt-1 text-sm text-required">{errors.limit.message}</p>
                        )}
                    </div>

                    {/* Max Usage Per User */}
                    <div className="col-span-1">
                        <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="maxUsagePerUser">
                            Max Usage Per User
                        </WebComponents.UiComponents.UiWebComponents.FormLabel>
                        <WebComponents.UiComponents.UiWebComponents.FormInput
                            id="maxUsagePerUser"
                            type="number"
                            placeholder="Enter max usage per user"
                            {...register("maxUsagePerUser")}
                            autoComplete="off"
                            className={errors.maxUsagePerUser ? "border-red-500" : ""}
                        />
                        {errors.maxUsagePerUser && (
                            <p className="mt-1 text-sm text-required">{errors.maxUsagePerUser.message}</p>
                        )}
                    </div>

                    {/* Start Date */}
                    <div className="col-span-1">
                        <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="startDate">
                            {Constants.adminConstants.startDateLabel}
                        </WebComponents.UiComponents.UiWebComponents.FormLabel>
                        <Controller
                            name="startDate"
                            control={control}
                            render={({ field }) => (
                                <WebComponents.UiComponents.UiWebComponents.SingleDatePicker
                                    value={field.value}
                                    onChange={field.onChange}
                                    placeholder="DD-MM-YYYY"
                                    className={errors.startDate ? "border-red-500" : ""}
                                />
                            )}
                        />

                        {errors.startDate && (
                            <p className="mt-1 text-sm text-required">{errors.startDate.message}</p>
                        )}
                    </div>

                    {/* End Date */}
                    <div className="col-span-1">
                        <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="endDate">
                            {Constants.adminConstants.endDateLabel}
                        </WebComponents.UiComponents.UiWebComponents.FormLabel>
                        <Controller
                            name="endDate"
                            control={control}
                            render={({ field }) => (
                                <WebComponents.UiComponents.UiWebComponents.SingleDatePicker
                                    value={field.value}
                                    onChange={field.onChange}
                                    placeholder="DD-MM-YYYY"
                                    className={errors.endDate ? "border-red-500" : ""}
                                />
                            )}
                        />

                        {errors.endDate && (
                            <p className="mt-1 text-sm text-required">{errors.endDate.message}</p>
                        )}
                    </div>

                    {/* Description */}
                    <div className="col-span-1 md:col-span-2">
                        <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="description">
                            {Constants.adminConstants.descriptionLabel} <span className="text-required">*</span>
                        </WebComponents.UiComponents.UiWebComponents.FormLabel>
                        <WebComponents.UiComponents.UiWebComponents.Textarea
                            id="description"
                            {...register("description")}
                            autoComplete="off"
                            placeholder="Describe the coupon"
                            rows={3}
                            className={errors.description ? "border-red-500" : ""}
                        />
                        {errors.description && (
                            <p className="mt-1 text-sm text-required">{errors.description.message}</p>
                        )}
                    </div>

                    {/* Customers */}
                    <div className="col-span-1">
                        <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="customerIds">
                            {Constants.adminConstants.customersLabel}
                        </WebComponents.UiComponents.UiWebComponents.FormLabel>
                        <Controller
                            name="customerIds"
                            control={control}
                            render={({ field: { value, onChange } }) => (
                                <WebComponents.UiComponents.UiWebComponents.FormDropdown
                                    id="customerIds"
                                    value={(value || []).filter((v): v is string => typeof v === "string")}
                                    onChange={(e) => {
                                        const newValue = Array.isArray(e.target.value)
                                            ? e.target.value.filter((v): v is string => typeof v === "string")
                                            : [];
                                        onChange(newValue);
                                    }}
                                    multiselect
                                    selectall
                                    autoComplete="off"
                                >
                                    {customers?.map((customer) => (
                                        <WebComponents.UiComponents.UiWebComponents.FormOption
                                            key={customer._id}
                                            value={customer._id}
                                            label={customer._id}
                                        >
                                            {customer.customerName}
                                        </WebComponents.UiComponents.UiWebComponents.FormOption>
                                    ))}
                                </WebComponents.UiComponents.UiWebComponents.FormDropdown>
                            )}
                        />
                    </div>

                    {/* Send in Mail */}
                    <div className="col-span-1">
                        <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="send-mail-toggle">
                            Send in Mail
                        </WebComponents.UiComponents.UiWebComponents.FormLabel>
                        <Controller
                            name="sendMail"
                            control={control}
                            render={({ field: { value, onChange } }) => (
                                <>
                                    <div className="h-[44px] w-full rounded-[4px] border-[0.6px] border-[#D8D9D9] dark:border-[#616161] bg-textMain2 dark:bg-[#1B1B1B]">
                                        <div className="flex items-center justify-between px-3 sm:px-4 py-[10px]">
                                            <span className="text-xs sm:text-sm font-interTight font-medium leading-[14px] text-textMain dark:text-white">
                                                {value ? "Yes" : "No"}
                                            </span>
                                            <WebComponents.UiComponents.UiWebComponents.Switch
                                                id="send-mail-toggle"
                                                checked={value}
                                                onCheckedChange={onChange}
                                                aria-label="Toggle send coupon in mail"
                                            />
                                        </div>
                                    </div>
                                </>
                            )}
                        />
                    </div>

                    {/* Status */}
                    <div className="col-span-1">
                        <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="coupon-status-toggle">
                            {Constants.adminConstants.couponStatus}
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
                                            id="coupon-status-toggle"
                                            checked={value}
                                            onCheckedChange={onChange}
                                            aria-label="Toggle coupon status"
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
};

export default CouponForm;
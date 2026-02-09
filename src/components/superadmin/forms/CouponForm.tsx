"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { Constants } from "@/constant";
import { couponFormSchema } from "@/app/validation/ValidationSchema";
import { WebComponents } from "@/components";
import { SuperAdminTypes } from "@/types";

type FormData = Yup.InferType<typeof couponFormSchema>;

// Helper function to convert date string to YYYY-MM-DD format (ISO)
const formatDateForInput = (dateString: string | undefined) => {
  if (!dateString) return "";
  try {
    // If already in YYYY-MM-DD format, return as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }
    // Otherwise, parse and convert
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    return date.toISOString().split('T')[0];
  } catch (error) {
    console.error('Error formatting date:', error);
    return "";
  }
};

export default function CouponForm({
  onSubmit,
  coupon,
  plans
}: {
  readonly onSubmit: (data: SuperAdminTypes.CouponTypes.CouponFormData) => void;
  readonly coupon?: SuperAdminTypes.CouponTypes.Coupon;
  readonly plans: Array<{ _id: string; name: string }>;
}) {

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    watch,
    trigger,
  } = useForm<FormData>({
    resolver: yupResolver(couponFormSchema) as any,
    defaultValues: {
      code: coupon?.code || "",
      description: coupon?.description || "",
      startDate: coupon ? formatDateForInput(coupon?.start_date || coupon?.startDate) : new Date().toISOString().split('T')[0],
      endDate: coupon ? formatDateForInput(coupon?.end_date || coupon?.endDate) : new Date().toISOString().split('T')[0],
      type: (coupon?.type || "Percentage") as "Percentage" | "Fixed",
      discount_amount: coupon?.discount_amount ?? coupon?.discountAmount ?? 0,
      limit: coupon?.limit ?? 0,
      maxUsagePerUser: coupon?.maxUsagePerUser ?? 1,
      customerIds: [] as string[],
      sendMail: false,
      status: coupon?.status ?? true,
    },
  });

  const watchedType = watch("type");
  const watchedStartDate = watch("startDate");

  // Re-validate end date when start date changes
  React.useEffect(() => {
    if (watchedStartDate) {
      trigger("endDate");
    }
  }, [watchedStartDate, trigger]);

  // Update form values when coupon prop changes
  React.useEffect(() => {
    if (coupon) {
      const startYmd = formatDateForInput(coupon?.start_date || coupon?.startDate);
      const endYmd = formatDateForInput(coupon?.end_date || coupon?.endDate);
      
      reset({
        code: coupon.code || "",
        description: coupon.description || "",
        startDate: startYmd || "",
        endDate: endYmd || "",
        type: (coupon.type || "Percentage") as "Percentage" | "Fixed",
        discount_amount: coupon.discount_amount ?? coupon.discountAmount ?? 0,
        limit: coupon.limit ?? 0,
        maxUsagePerUser: coupon.maxUsagePerUser ?? 1,
        customerIds: [] as string[],
        sendMail: false,
        status: coupon.status ?? true,
      });
    } else {
      // Reset to today's date for new coupon
      const today = new Date().toISOString().split('T')[0];
      reset({
        code: "",
        description: "",
        startDate: today,
        endDate: today,
        type: "Percentage" as "Percentage" | "Fixed",
        discount_amount: 0,
        limit: 0,
        maxUsagePerUser: 1,
        customerIds: [] as string[],
        sendMail: false,
        status: true,
      });
    }
  }, [coupon, reset]);

  // Handle plans selection separately since it's not in the schema
  const [selectedPlans, setSelectedPlans] = React.useState<string[]>(() => {
    if (!coupon?.plans) return [];
    if (Array.isArray(coupon.plans)) {
      if (typeof coupon.plans[0] === 'string') {
        return coupon.plans as string[];
      } else {
        return (coupon.plans as any).map((p: any) => p._id).filter(Boolean);
      }
    }
    return [];
  });

  // Override onFormSubmit to include plans
  const handleFormSubmit = (data: FormData) => {
    const formData: SuperAdminTypes.CouponTypes.CouponFormData = {
      code: data.code,
      description: data.description,
      start_date: data.startDate,
      end_date: data.endDate,
      type: data.type as "Percentage" | "Fixed",
      discount_amount: data.discount_amount,
      limit: data.limit,
      plans: selectedPlans,
      status: data.status,
      maxUsagePerUser: data.maxUsagePerUser,
    };
    onSubmit(formData);
  };

  return (
    <div className="bg-white dark:bg-darkFilterbar rounded-[4px] mt-4">
      <form id="coupon-form" onSubmit={handleSubmit(handleFormSubmit)}>
        <div className="p-4 sm:p-5 md:p-6 lg:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6 lg:gap-8">

            {/* Coupon Code */}
            <div className="col-span-1">
              <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="code">
                {Constants.superadminConstants.couponcodelabel} <span className="text-required">{Constants.superadminConstants.requiredstar}</span>
              </WebComponents.UiComponents.UiWebComponents.FormLabel>
              <WebComponents.UiComponents.UiWebComponents.FormInput
                id="code"
                type="text"
                placeholder="e.g., WELCOME20"
                {...register("code")}
                autoComplete="off"
                className={errors.code ? "border-red-500" : ""}
              />
              {errors.code && (
                <p className="mt-1 text-sm text-required">{errors.code.message}</p>
              )}
            </div>

            {/* Type */}
            <div className="col-span-1">
              <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="type">
                {Constants.superadminConstants.typelabel} <span className="text-required">{Constants.superadminConstants.requiredstar}</span>
              </WebComponents.UiComponents.UiWebComponents.FormLabel>
              <Controller
                name="type"
                control={control}
                render={({ field, fieldState }) => (
                  <>
                    <WebComponents.UiComponents.UiWebComponents.FormDropdown
                      id="type"
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      autoComplete="off"
                      className={fieldState.invalid ? "border-red-500" : ""}
                    >
                      <WebComponents.UiComponents.UiWebComponents.FormOption value="Percentage">Percentage</WebComponents.UiComponents.UiWebComponents.FormOption>
                      <WebComponents.UiComponents.UiWebComponents.FormOption value="Fixed">Fixed</WebComponents.UiComponents.UiWebComponents.FormOption>
                    </WebComponents.UiComponents.UiWebComponents.FormDropdown>
                    {fieldState.error && (
                      <p className="mt-1 text-sm text-required">{fieldState.error.message}</p>
                    )}
                  </>
                )}
              />
            </div>

            {/* Description */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex justify-between items-center mb-1">
                <WebComponents.UiComponents.UiWebComponents.FormLabel>
                  {Constants.superadminConstants.descriptionlabel} <span className="text-required">{Constants.superadminConstants.requiredstar}</span>
                </WebComponents.UiComponents.UiWebComponents.FormLabel>
                <p className="text-textSmall dark:text-gray-400 font-interTight font-normal text-xs sm:text-sm leading-[8px]">{Constants.superadminConstants.max250characters}</p>
              </div>
              <Controller
                name="description"
                control={control}
                render={({ field, fieldState }) => (
                  <>
                    <WebComponents.UiComponents.UiWebComponents.Textarea
                      {...field}
                      placeholder="Describe the coupon"
                      rows={3}
                      charCounter={false}
                      autoComplete="off"
                      className={fieldState.invalid ? "border-red-500" : ""}
                    />
                    <div className="flex justify-between items-center mt-1">
                      {fieldState.error ? (
                        <p className="text-sm text-required">{fieldState.error.message}</p>
                      ) : (
                        <div />
                      )}
                      <div className="text-xs text-textSmall font-interTight font-normal">
                        {(field.value || "").length}/250
                      </div>
                    </div>
                  </>
                )}
              />
            </div>

            {/* Start Date */}
            <div className="col-span-1">
              <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="startDate">
                {Constants.superadminConstants.startdatelabel} <span className="text-required">{Constants.superadminConstants.requiredstar}</span>
              </WebComponents.UiComponents.UiWebComponents.FormLabel>
              <Controller
                name="startDate"
                control={control}
                render={({ field, fieldState }) => (
                  <>
                    <WebComponents.UiComponents.UiWebComponents.SingleDatePicker
                      value={field.value || ""}
                      onChange={(v) => field.onChange(v)}
                      // disablePast
                    />
                    {fieldState.error && (
                      <p className="mt-1 text-sm text-required">{fieldState.error.message}</p>
                    )}
                  </>
                )}
              />
            </div>

            {/* End Date */}
            <div className="col-span-1">
              <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="endDate">
                {Constants.superadminConstants.enddatelabel} <span className="text-required">{Constants.superadminConstants.requiredstar}</span>
              </WebComponents.UiComponents.UiWebComponents.FormLabel>
              <Controller
                name="endDate"
                control={control}
                render={({ field, fieldState }) => {
                  // Parse start date to set as minDate for end date
                  const minDate = watchedStartDate ? (() => {
                    try {
                      const [year, month, day] = watchedStartDate.split("-").map(Number);
                      return new Date(year, month - 1, day);
                    } catch {
                      return undefined;
                    }
                  })() : undefined;

                  return (
                    <>
                      <WebComponents.UiComponents.UiWebComponents.SingleDatePicker
                        value={field.value || ""}
                        onChange={(v) => field.onChange(v)}
                        minDate={minDate}
                      />
                      {fieldState.error && (
                        <p className="mt-1 text-sm text-required">{fieldState.error.message}</p>
                      )}
                    </>
                  );
                }}
              />
            </div>

            {/* Discount Amount */}
            <div className="col-span-1">
              <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="discount_amount">
                {Constants.superadminConstants.discountamountlabel} <span className="text-required">{Constants.superadminConstants.requiredstar}</span>
              </WebComponents.UiComponents.UiWebComponents.FormLabel>
              <WebComponents.UiComponents.UiWebComponents.FormInput
                id="discount_amount"
                type="number"
                placeholder={watchedType === "Percentage" ? "e.g., 20" : "e.g., 50"}
                {...register("discount_amount", { valueAsNumber: true })}
                autoComplete="off"
                className={errors.discount_amount ? "border-red-500" : ""}
              />
              {errors.discount_amount && (
                <p className="mt-1 text-sm text-required">{errors.discount_amount.message}</p>
              )}
            </div>

            {/* Limit */}
            <div className="col-span-1">
              <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="limit">
                {Constants.superadminConstants.limitlabel} <span className="text-required">{Constants.superadminConstants.requiredstar}</span>
              </WebComponents.UiComponents.UiWebComponents.FormLabel>
              <WebComponents.UiComponents.UiWebComponents.FormInput
                id="limit"
                type="number"
                placeholder="e.g., 100"
                {...register("limit", { valueAsNumber: true })}
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
                {Constants.superadminConstants.maxusageperuserlabel} <span className="text-required">{Constants.superadminConstants.requiredstar}</span>
              </WebComponents.UiComponents.UiWebComponents.FormLabel>
              <WebComponents.UiComponents.UiWebComponents.FormInput
                id="maxUsagePerUser"
                type="number"
                min={1}
                {...register("maxUsagePerUser", { valueAsNumber: true })}
                autoComplete="off"
                className={errors.maxUsagePerUser ? "border-red-500" : ""}
              />
              {errors.maxUsagePerUser && (
                <p className="mt-1 text-sm text-required">{errors.maxUsagePerUser.message}</p>
              )}
            </div>

            {/* Plans Selection */}
            <div className="col-span-1">
              <WebComponents.UiComponents.UiWebComponents.FormLabel>
                {Constants.superadminConstants.selectplanslabel}
              </WebComponents.UiComponents.UiWebComponents.FormLabel>
              <WebComponents.UiComponents.UiWebComponents.FormDropdown
                id="plans"
                value={selectedPlans}
                onChange={(e) => {
                  const newValue = Array.isArray(e.target.value) ? e.target.value : [];
                  setSelectedPlans(newValue);
                }}
                multiselect
                selectall
                autoComplete="off"
              >
                {plans.map((plan) => (
                  <WebComponents.UiComponents.UiWebComponents.FormOption key={plan._id} value={plan._id}>
                    {plan.name}
                  </WebComponents.UiComponents.UiWebComponents.FormOption>
                ))}
              </WebComponents.UiComponents.UiWebComponents.FormDropdown>
            </div>

            {/* Status toggle */}
            <div className="col-span-1">
              <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="status-toggle">
                {Constants.superadminConstants.statuslabel}
              </WebComponents.UiComponents.UiWebComponents.FormLabel>
              <Controller
                name="status"
                control={control}
                render={({ field: { value, onChange }, fieldState }) => (
                  <>
                    <div className="h-[44px] w-full rounded-[4px] border-[0.6px] border-[#D8D9D9] dark:border-[#616161] bg-textMain2 dark:bg-[#1B1B1B]">
                      <div className="flex items-center justify-between px-3 sm:px-4 py-[10px]">
                        <span className="text-xs sm:text-sm font-interTight font-medium leading-[14px] text-textMain dark:text-white">
                          {value ? Constants.superadminConstants.activestatus : Constants.superadminConstants.inactivestatus}
                        </span>
                        <WebComponents.UiComponents.UiWebComponents.Switch
                          id="status-toggle"
                          checked={value}
                          onCheckedChange={onChange}
                          aria-label="Toggle coupon status"
                        />
                      </div>
                    </div>
                    {fieldState.error && (
                      <p className="mt-1 text-sm text-required">{fieldState.error.message}</p>
                    )}
                  </>
                )}
              />
            </div>

          </div>
        </div>
      </form>
    </div>
  );
}


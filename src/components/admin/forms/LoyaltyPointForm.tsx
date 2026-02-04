"use client";
import React from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { loyaltyFormSchema } from "@/app/validation/ValidationSchema";
import { Constants } from "@/constant";
import { WebComponents } from "@/components";
import { AdminTypes } from "@/types";

const LoyaltyForm = ({
  onSubmit,
  loyalty,
}: {
  onSubmit: (data: AdminTypes.loyaltyTypes.LoyaltyPointFormData) => void;
  loyalty?: AdminTypes.loyaltyTypes.LoyaltyPointServerResponse;
}) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<AdminTypes.loyaltyTypes.LoyaltyPointFormData>({
    resolver: yupResolver(loyaltyFormSchema) as any,
    defaultValues: {
      loyaltyPoints: loyalty?.loyaltyPoints ?? 0,
      minimumAmount: loyalty?.minimumAmount ?? 0,
      maximumAmount: loyalty?.maximumAmount ?? 0,
      expiryDuration: loyalty?.expiryDuration ?? 0,
      status: loyalty?.status ?? true,
    },
  });

  // Update form values when loyalty prop changes
  React.useEffect(() => {
    if (loyalty) {
      reset({
        loyaltyPoints: loyalty.loyaltyPoints ?? 0,
        minimumAmount: loyalty.minimumAmount ?? 0,
        maximumAmount: loyalty.maximumAmount ?? 0,
        expiryDuration: loyalty.expiryDuration ?? 0,
        status: loyalty.status ?? true,
      });
    } else {
      reset({
        loyaltyPoints: 0,
        minimumAmount: 0,
        maximumAmount: 0,
        expiryDuration: 0,
        status: true,
      });
    }
  }, [loyalty, reset]);

  const onSubmitForm = (data: AdminTypes.loyaltyTypes.LoyaltyPointFormData) => {
    onSubmit({
      loyaltyPoints: Number(data.loyaltyPoints) || 0,
      minimumAmount: Number(data.minimumAmount) || 0,
      maximumAmount: Number(data.maximumAmount) || 0,
      expiryDuration: Number(data.expiryDuration) || 0,
      status: data.status,
    });
  };

  return (
    <form id="loyalty-form" onSubmit={handleSubmit(onSubmitForm)}>
      <div className="p-4 sm:p-5 md:p-6 lg:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5 md:gap-6 lg:gap-8">
          {/* Loyalty Points */}
          <div>
            <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="loyaltyPoints">
              {Constants.adminConstants.loyaltyPointsLabel} <span className="text-required">{Constants.adminConstants.requiredstar}</span>
            </WebComponents.UiComponents.UiWebComponents.FormLabel>
            <WebComponents.UiComponents.UiWebComponents.FormInput
              id="loyaltyPoints"
              type="number"
              min="0"
              placeholder={Constants.adminConstants.loyaltyPointsPlaceholder}
              {...register("loyaltyPoints", { valueAsNumber: true })}
              className={errors.loyaltyPoints ? "border-red-500" : ""}
            />
            {errors.loyaltyPoints && (
              <p className="mt-1 text-sm text-required">{errors.loyaltyPoints.message}</p>
            )}
          </div>

          {/* Minimum Amount */}
          <div>
            <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="minimumAmount">
              {Constants.adminConstants.minimumAmountLabel} <span className="text-required">{Constants.adminConstants.requiredstar}</span>
            </WebComponents.UiComponents.UiWebComponents.FormLabel>
            <WebComponents.UiComponents.UiWebComponents.FormInput
              id="minimumAmount"
              type="number"
              min="0"
              placeholder={Constants.adminConstants.minimumAmountPlaceholder}
              {...register("minimumAmount", { valueAsNumber: true })}
              className={errors.minimumAmount ? "border-red-500" : ""}
            />
            {errors.minimumAmount && (
              <p className="mt-1 text-sm text-required">{errors.minimumAmount.message}</p>
            )}
          </div>

          {/* Maximum Amount */}
          <div>
            <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="maximumAmount">
              Maximum Amount <span className="text-required">{Constants.adminConstants.requiredstar}</span>
            </WebComponents.UiComponents.UiWebComponents.FormLabel>
            <WebComponents.UiComponents.UiWebComponents.FormInput
              id="maximumAmount"
              type="number"
              min="0"
              placeholder="Enter maximum amount"
              {...register("maximumAmount", { valueAsNumber: true })}
              className={errors.maximumAmount ? "border-red-500" : ""}
            />
            {errors.maximumAmount && (
              <p className="mt-1 text-sm text-required">{errors.maximumAmount.message}</p>
            )}
          </div>

          {/* Expiry Duration */}
          <div>
            <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="expiryDuration">
              Expiry Duration (Days) <span className="text-required">{Constants.adminConstants.requiredstar}</span>
            </WebComponents.UiComponents.UiWebComponents.FormLabel>
            <WebComponents.UiComponents.UiWebComponents.FormInput
              id="expiryDuration"
              type="number"
              min="0"
              placeholder="Enter expiry duration in days"
              {...register("expiryDuration", { valueAsNumber: true })}
              className={errors.expiryDuration ? "border-red-500" : ""}
            />
            {errors.expiryDuration && (
              <p className="mt-1 text-sm text-required">{errors.expiryDuration.message}</p>
            )}
          </div>

          {/* Status */}
          <div>
            <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="status-toggle">
              Status
            </WebComponents.UiComponents.UiWebComponents.FormLabel>
            <Controller
              name="status"
              control={control}
              render={({ field: { value, onChange } }) => (
                <div className="h-[44px] w-full rounded-[4px] border-[0.6px] border-[#D8D9D9] dark:border-[#616161] bg-textMain2 dark:bg-[#1B1B1B]">
                  <div className="flex items-center justify-between px-3 sm:px-4 py-[10px]">
                    <span className="text-xs sm:text-sm font-interTight font-medium leading-[14px] text-textMain dark:text-white">
                      {value ? "Active" : "Inactive"}
                    </span>
                    <WebComponents.UiComponents.UiWebComponents.Switch
                      id="status-toggle"
                      checked={value}
                      onCheckedChange={onChange}
                      aria-label="Toggle status"
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

export default LoyaltyForm;

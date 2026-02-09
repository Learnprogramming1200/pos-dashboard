"use client";
import React from "react";
import { useForm, Controller } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { warrantyFormSchema } from "@/app/validation/ValidationSchema";
import { WebComponents } from "@/components";
import { Constants } from "@/constant";
import { AdminTypes } from "@/types";
interface WarrantyFormProps {
  onSubmit: (data: {
    warranty: string;
    description: string;
    duration: number;
    period: 'Month' | 'Year';
    status: boolean;
  }) => void;
  warranty?: AdminTypes.InventoryTypes.WarrantyTypes.WarrantyType;
}

type FormData = Yup.InferType<typeof warrantyFormSchema>;

const WarrantyForm = ({ onSubmit, warranty }: WarrantyFormProps) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: yupResolver(warrantyFormSchema) as any,
    defaultValues: {
      warranty: warranty?.warranty || "",
      description: warranty?.description || "",
      duration: warranty?.duration || 1,
      period: warranty?.period || 'Month',
      status: warranty?.status ?? true,
    },
  });

  // Update form values when warranty prop changes
  React.useEffect(() => {
    if (warranty) {
      reset({
        warranty: warranty.warranty || "",
        description: warranty.description || "",
        duration: warranty.duration || 1,
        period: warranty.period || 'Month',
        status: warranty.status ?? true,
      });
    }
  }, [warranty, reset]);

  const onSubmitForm = (data: FormData) => {
    onSubmit({
      warranty: data.warranty.trim(),
      description: data.description.trim(),
      duration: data.duration,
      period: data.period as 'Month' | 'Year',
      status: data.status,
    });
  };

  return (
    <form id="warranty-form" onSubmit={handleSubmit(onSubmitForm)}>
      <div className="p-4 sm:p-5 md:p-6 lg:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6 lg:gap-8">
          {/* Warranty Name */}
          <div className="col-span-1 md:col-span-1">
            <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="warranty">
              {Constants.adminConstants.warrantyStrings.warrantyNameLabel}{" "}
              <span className="text-required">{Constants.adminConstants.requiredstar}</span>
            </WebComponents.UiComponents.UiWebComponents.FormLabel>
            <WebComponents.UiComponents.UiWebComponents.FormInput
              id="warranty"
              type="text"
              placeholder="e.g., 1 Year Warranty, Lifetime Warranty"
              {...register("warranty")}
              autoComplete="off"
              className={errors.warranty ? "border-red-500" : ""}
            />
            {errors.warranty && (
              <p className="mt-1 text-sm text-required">{errors.warranty.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex justify-between items-center mb-1">
              <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="description">
                {Constants.adminConstants.warrantyStrings.warrantyDescriptionLabel}{" "}
                <span className="text-required">{Constants.adminConstants.requiredstar}</span>
              </WebComponents.UiComponents.UiWebComponents.FormLabel>
              <p className="text-textSmall dark:text-gray-400 font-interTight font-normal text-xs sm:text-sm leading-[8px]">
                Max 250 characters
              </p>
            </div>
            <WebComponents.UiComponents.UiWebComponents.Textarea
              id="description"
              placeholder="Describe the warranty terms and conditions"
              rows={3}
              {...register("description")}
              className={errors.description ? "border-red-500" : ""}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-required">{errors.description.message}</p>
            )}
          </div>

          {/* Period */}
          <div className="col-span-1">
            <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="period">
              {Constants.adminConstants.warrantyStrings.durationPeriodLabel}{" "}
              <span className="text-required">{Constants.adminConstants.requiredstar}</span>
            </WebComponents.UiComponents.UiWebComponents.FormLabel>
            <Controller
              name="period"
              control={control}
              render={({ field: { value, onChange } }) => (
                <WebComponents.UiComponents.UiWebComponents.FormDropdown
                  id="period"
                  value={value}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    if (newValue === 'Month' || newValue === 'Year') {
                      onChange(newValue);
                    }
                  }}
                  placeholder="Select period"
                  className={errors.period ? "border-red-500" : ""}
                >
                  <WebComponents.UiComponents.UiWebComponents.FormOption value="Month">Month</WebComponents.UiComponents.UiWebComponents.FormOption>
                  <WebComponents.UiComponents.UiWebComponents.FormOption value="Year">Year</WebComponents.UiComponents.UiWebComponents.FormOption>
                </WebComponents.UiComponents.UiWebComponents.FormDropdown>
              )}
            />
            {errors.period && (
              <p className="mt-1 text-sm text-required">{errors.period.message}</p>
            )}
          </div>

          {/* Duration */}
          <div className="col-span-1">
            <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="duration">
              {Constants.adminConstants.durationLabel}{" "}
              <span className="text-required">{Constants.adminConstants.requiredstar}</span>
            </WebComponents.UiComponents.UiWebComponents.FormLabel>
            <WebComponents.UiComponents.UiWebComponents.FormInput
              id="duration"
              type="number"
              min="1"
              placeholder="Enter duration"
              {...register("duration", { valueAsNumber: true })}
              autoComplete="off"
              className={errors.duration ? "border-red-500" : ""}
            />
            {errors.duration && (
              <p className="mt-1 text-sm text-required">{errors.duration.message}</p>
            )}
          </div>

          {/* Status toggle */}
          <div className="col-span-1 md:col-span-1">
            <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="status-toggle">
              {Constants.adminConstants.statusLabel}{" "}
              <span className="text-required">{Constants.adminConstants.requiredstar}</span>
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
                      id="status-toggle"
                      checked={value}
                      onCheckedChange={onChange}
                      aria-label="Toggle warranty status"
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

export default WarrantyForm;


"use client";
import React from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { Constants } from "@/constant";
import { unitFormSchema } from "@/app/validation/ValidationSchema";
import { WebComponents } from "@/components";
import { AdminTypes } from "@/types";
interface UnitFormProps {
  onSubmit: (data: {
    unit: string;
    shortName: string;
    status: boolean;
  }) => void;
  unit?: AdminTypes.InventoryTypes.UnitTypes.UnitType;
}

type FormData = Yup.InferType<typeof unitFormSchema>;

const UnitForm = ({ onSubmit, unit }: UnitFormProps) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: yupResolver(unitFormSchema) as any,
    defaultValues: {
      unit: unit?.unit || "",
      shortName: unit?.shortName || "",
      status: unit?.status ?? true,
    },
  });

  // Update form values when unit prop changes
  React.useEffect(() => {
    if (unit) {
      reset({
        unit: unit.unit || "",
        shortName: unit.shortName || "",
        status: unit.status ?? true,
      });
    }
  }, [unit, reset]);

  const onSubmitForm = (data: FormData) => {
    onSubmit({
      unit: data.unit.trim(),
      shortName: data.shortName.trim(),
      status: data.status,
    });
  };

  return (
    <form id="unit-form" onSubmit={handleSubmit(onSubmitForm)}>
      <div className="p-4 sm:p-5 md:p-6 lg:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6 lg:gap-8">
          {/* Unit Name */}
          <div className="col-span-1">
            <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="unit">
              {Constants.adminConstants.unitStrings.unitLabel}{" "}
              <span className="text-required">{Constants.adminConstants.requiredstar}</span>
            </WebComponents.UiComponents.UiWebComponents.FormLabel>
            <WebComponents.UiComponents.UiWebComponents.FormInput
              id="unit"
              type="text"
              placeholder="e.g., Kilogram, Liter, Piece"
              {...register("unit")}
              autoComplete="off"
              className={errors.unit ? "border-red-500" : ""}
            />
            {errors.unit && (
              <p className="mt-1 text-sm text-required">{errors.unit.message}</p>
            )}
          </div>

          {/* Short Name */}
          <div className="col-span-1">
            <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="shortName">
              {Constants.adminConstants.unitStrings.shortNameLabel}{" "}
              <span className="text-required">{Constants.adminConstants.requiredstar}</span>
            </WebComponents.UiComponents.UiWebComponents.FormLabel>
            <WebComponents.UiComponents.UiWebComponents.FormInput
              id="shortName"
              type="text"
              placeholder="e.g., kg, L, pc"
              {...register("shortName")}
              autoComplete="off"
              className={errors.shortName ? "border-red-500" : ""}
            />
            {errors.shortName && (
              <p className="mt-1 text-sm text-required">{errors.shortName.message}</p>
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
                      aria-label="Toggle unit status"
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

export default UnitForm;


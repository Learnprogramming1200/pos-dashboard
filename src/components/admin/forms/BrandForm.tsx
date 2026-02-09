"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Constants } from "@/constant";
import { brandFormSchema } from "@/app/validation/ValidationSchema";
import { WebComponents } from "@/components";
import { AdminTypes } from "@/types";

interface BrandFormProps {
  onSubmit: (data: {
    brand: string;
    brandImage: string | File;
    status: boolean;
  }) => void;
  brand?: AdminTypes.InventoryTypes.BrandTypes.Brand;
}

interface FormData {
  brand: string;
  brandImage: string | File | null;
  status: boolean;
}

const BrandForm: React.FC<BrandFormProps> = ({ onSubmit, brand }) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    setValue,
  } = useForm<FormData>({
    resolver: yupResolver(brandFormSchema) as any,
    defaultValues: {
      brand: brand?.brand || "",
      brandImage: brand?.brandImage || null,
      status: brand?.status ?? true,
    },
  });

  // Update form values when brand prop changes
  React.useEffect(() => {
    if (brand) {
      reset({
        brand: brand.brand || "",
        brandImage: brand.brandImage || null,
        status: brand.status ?? true,
      });
    }
  }, [brand, reset]);

  const handleImageChange = React.useCallback((value: string | File | null) => {
    setValue("brandImage", value, { shouldValidate: true });
  }, [setValue]);

  const onSubmitForm = (data: FormData) => {
    onSubmit({
      brand: data.brand.trim(),
      brandImage: (data.brandImage || "") as string | File,
      status: data.status,
    });
  };

  return (
    <form id="brand-form" onSubmit={handleSubmit(onSubmitForm)} className="w-full">
      <div className="p-4 sm:p-5 md:p-6 lg:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6 lg:gap-8">
          {/* Image Upload */}
          <div className="col-span-1 md:col-span-2">
            <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="brandImage">
              Brand Image <span className="text-required">{Constants.adminConstants.requiredstar}</span>
            </WebComponents.UiComponents.UiWebComponents.FormLabel>
            <div className="mt-2 text-center">
              <Controller
                name="brandImage"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <WebComponents.UiComponents.UiWebComponents.ImageCropUpload
                    value={value || null}
                    onChange={(newValue) => {
                      onChange(newValue);
                      handleImageChange(newValue);
                    }}
                    accept="image/*"
                    aspect={4 / 3}
                    uploadButtonText="Upload Brand Image"
                    useAdminUpload={true}
                  />
                )}
              />
            </div>
            {errors.brandImage && (
              <p className="mt-1 text-sm text-red-500">{errors.brandImage.message}</p>
            )}
          </div>

          {/* Brand Name */}
          <div className="col-span-1">
            <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="brand">
              Brand Name{" "}
              <span className="text-required">{Constants.adminConstants.requiredstar}</span>
            </WebComponents.UiComponents.UiWebComponents.FormLabel>
            <WebComponents.UiComponents.UiWebComponents.FormInput
              id="brand"
              type="text"
              placeholder="e.g., Nike, Adidas, Apple"
              {...register("brand")}
              autoComplete="off"
              className={errors.brand ? "border-red-500" : ""}
            />
            {errors.brand && (
              <p className="mt-1 text-sm text-red-500">{errors.brand.message}</p>
            )}
          </div>

          {/* Status Toggle */}
          <div className="col-span-1">
            <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="status-toggle">
              {Constants.adminConstants.statuslabel}{" "}
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
                      aria-label="Toggle brand status"
                    />
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
    </form>
  );
};

export default BrandForm;

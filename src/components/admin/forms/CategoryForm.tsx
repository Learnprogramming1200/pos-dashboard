"use client";
import React from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { Constants } from "@/constant";
import { categoryFormSchema } from "@/app/validation/ValidationSchema";
import { WebComponents } from "@/components";
import { AdminTypes } from "@/types";

interface CategoryFormProps {
  onSubmit: (data: {
    categoryName: string;
    description: string;
    isActive: boolean;
    hasExpiry: boolean;
    hasWarranty: boolean;
  }) => void;
  category?: AdminTypes.InventoryTypes.ProductCategoryTypes.ServerCategoryType;
}

type FormData = Yup.InferType<typeof categoryFormSchema>;

const CategoryForm = ({ onSubmit, category }: CategoryFormProps) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<FormData>({
    resolver: yupResolver(categoryFormSchema) as any,
    defaultValues: {
      categoryName: category?.categoryName || "",
      description: category?.description || "",
      isActive: category?.isActive ?? true,
      hasExpiry: category?.hasExpiry ?? false,
      hasWarranty: category?.hasWarranty ?? false,
    },
  });

  // Watch hasExpiry and hasWarranty to handle mutual exclusivity
  const hasExpiryValue = watch("hasExpiry");
  const hasWarrantyValue = watch("hasWarranty");

  // Update form values when category prop changes
  React.useEffect(() => {
    if (category) {
      reset({
        categoryName: category.categoryName || "",
        description: category.description || "",
        isActive: category.isActive ?? true,
        hasExpiry: category.hasExpiry ?? false,
        hasWarranty: category.hasWarranty ?? false,
      });
    }
  }, [category, reset]);

  const onSubmitForm = (data: FormData) => {
    onSubmit({
      categoryName: data.categoryName.trim(),
      description: data.description.trim(),
      isActive: data.isActive,
      hasExpiry: data.hasExpiry,
      hasWarranty: data.hasWarranty,
    });
  };

  return (
    <form id="category-form" onSubmit={handleSubmit(onSubmitForm)}>
      <div className="p-4 sm:p-5 md:p-6 lg:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6 lg:gap-8">
          {/* Category Name */}
          <div className="col-span-1 md:col-span-2">
            <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="categoryName">
              {Constants.adminConstants.categoryNameLabel} <span className="text-required">{Constants.adminConstants.requiredstar}</span>
            </WebComponents.UiComponents.UiWebComponents.FormLabel>
            <WebComponents.UiComponents.UiWebComponents.FormInput
              id="categoryName"
              type="text"
              placeholder="e.g., Electronics, Clothing, Food"
              {...register("categoryName")}
              autoComplete="off"
              className={errors.categoryName ? "border-red-500" : ""}
            />
            {errors.categoryName && (
              <p className="mt-1 text-sm text-red-500">{errors.categoryName.message}</p>
            )}
          </div>

          <div className="col-span-1 md:col-span-2">
            <div className="flex justify-between items-center mb-1">
              <WebComponents.UiComponents.UiWebComponents.FormLabel>
                {Constants.adminConstants.descriptionLabel} <span className="text-required">{Constants.adminConstants.requiredstar}</span>
              </WebComponents.UiComponents.UiWebComponents.FormLabel>
              <p className="text-textSmall dark:text-gray-400 font-interTight font-normal text-xs sm:text-sm leading-[8px]">
                Max 250 characters
              </p>
            </div>
            <Controller
              name="description"
              control={control}
              render={({ field, fieldState }) => (
                <>
                  <WebComponents.UiComponents.UiWebComponents.Textarea
                    {...field}
                    placeholder="Describe the category"
                    rows={3}
                    charCounter={false}
                    autoComplete="off"
                    className={fieldState.invalid ? "border-red-500" : ""}
                  />
                  <div className="flex justify-between items-center mt-1">
                    {fieldState.error ? (
                      <p className="text-sm text-red-500">{fieldState.error.message}</p>
                    ) : (
                      <div />
                    )}
                    <div className="text-xs text-textSmall font-interTight">
                      {(field.value || "").length}/250
                    </div>
                  </div>
                </>
              )}
            />
          </div>

          {/* Status, Expiry, and Warranty toggles in one row */}
          <div className="col-span-1 md:col-span-2">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 md:gap-6 lg:gap-8">
              {/* Expiry toggle */}
              <div>
                <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="expiry-toggle">
                  Expiry <span className="text-required">{Constants.adminConstants.requiredstar}</span>
                </WebComponents.UiComponents.UiWebComponents.FormLabel>
                <Controller
                  name="hasExpiry"
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <div className="h-[44px] w-full rounded-[4px] border-[0.6px] border-[#D8D9D9] dark:border-[#616161] bg-textMain2 dark:bg-[#1B1B1B]">
                      <div className="flex items-center justify-between px-3 sm:px-4 py-[10px]">
                        <span className="text-xs sm:text-sm font-interTight font-medium leading-[14px] text-textMain dark:text-white">
                          {value ? 'Enabled' : 'Disabled'}
                        </span>
                        <WebComponents.UiComponents.UiWebComponents.Switch
                          id="expiry-toggle"
                          checked={value}
                          onCheckedChange={(checked) => {
                            onChange(checked);
                            if (checked && hasWarrantyValue) {
                              // Reset warranty if expiry is enabled
                              setValue("hasWarranty", false);
                            }
                          }}
                          aria-label="Toggle expiry"
                        />
                      </div>
                    </div>
                  )}
                />
                {errors.hasExpiry && (
                  <p className="mt-1 text-sm text-red-500">{errors.hasExpiry.message}</p>
                )}
              </div>

              {/* Warranty toggle */}
              <div>
                <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="warranty-toggle">
                  Warranty <span className="text-required">{Constants.adminConstants.requiredstar}</span>
                </WebComponents.UiComponents.UiWebComponents.FormLabel>
                <Controller
                  name="hasWarranty"
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <div className="h-[44px] w-full rounded-[4px] border-[0.6px] border-[#D8D9D9] dark:border-[#616161] bg-textMain2 dark:bg-[#1B1B1B]">
                      <div className="flex items-center justify-between px-3 sm:px-4 py-[10px]">
                        <span className="text-xs sm:text-sm font-interTight font-medium leading-[14px] text-textMain dark:text-white">
                          {value ? 'Enabled' : 'Disabled'}
                        </span>
                        <WebComponents.UiComponents.UiWebComponents.Switch
                          id="warranty-toggle"
                          checked={value}
                          onCheckedChange={(checked) => {
                            onChange(checked);
                            if (checked && hasExpiryValue) {
                              // Reset expiry if warranty is enabled
                              setValue("hasExpiry", false);
                            }
                          }}
                          aria-label="Toggle warranty"
                        />
                      </div>
                    </div>
                  )}
                />
                {errors.hasWarranty && (
                  <p className="mt-1 text-sm text-red-500">{errors.hasWarranty.message}</p>
                )}
              </div>

              {/* Status toggle */}
              <div>
                <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="status-toggle">
                  {Constants.adminConstants.statusLabel} <span className="text-required">{Constants.adminConstants.requiredstar}</span>
                </WebComponents.UiComponents.UiWebComponents.FormLabel>
                <Controller
                  name="isActive"
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <div className="h-[44px] w-full rounded-[4px] border-[0.6px] border-[#D8D9D9] dark:border-[#616161] bg-textMain2 dark:bg-[#1B1B1B]">
                      <div className="flex items-center justify-between px-3 sm:px-4 py-[10px]">
                        <span className="text-xs sm:text-sm font-interTight font-medium leading-[14px] text-textMain dark:text-white">
                          {value ? Constants.adminConstants.activestatus : Constants.adminConstants.inactivestatus}
                        </span>
                        <WebComponents.UiComponents.UiWebComponents.Switch
                          id="status-toggle"
                          checked={value}
                          onCheckedChange={onChange}
                          aria-label="Toggle category status"
                        />
                      </div>
                    </div>
                  )}
                />
                {errors.isActive && (
                  <p className="mt-1 text-sm text-red-500">{errors.isActive.message}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default CategoryForm;


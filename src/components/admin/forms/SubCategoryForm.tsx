"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Constants } from "@/constant";
import { subCategoryFormSchema } from "@/app/validation/ValidationSchema";
import { WebComponents } from "@/components";
import { AdminTypes } from "@/types";

interface SubCategoryFormProps {
  onSubmit: (data: {
    category: string;
    subcategory: string;
    categorycode: string;
    description?: string;
    subCategoryImage?: string | File;
    status: boolean;
  }) => void;
  subcategory?: AdminTypes.InventoryTypes.productSubCategoryTypes.SubCategoryType;
  categories: AdminTypes.InventoryTypes.ProductCategoryTypes.ServerCategoryType[];
}

interface FormData {
  category: string;
  subcategory: string;
  categorycode: string;
  description: string;
  status: boolean;
  subCategoryImage: string | File | null;
}

const SubCategoryForm = ({ onSubmit, subcategory, categories }: SubCategoryFormProps) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<FormData>({
    resolver: yupResolver(subCategoryFormSchema) as any,
    defaultValues: {
      category: subcategory?.category._id || "",
      subcategory: subcategory?.subcategory || "",
      categorycode: subcategory?.categorycode || "",
      description: subcategory?.description || "",
      status: subcategory?.status ?? true,
      subCategoryImage: subcategory?.subCategoryImage || null,
    },
  });

  // Update form values when subcategory prop changes
  React.useEffect(() => {
    if (subcategory) {
      reset({
        category: subcategory.category._id || "",
        subcategory: subcategory.subcategory || "",
        categorycode: subcategory.categorycode || "",
        description: subcategory.description || "",
        status: subcategory.status ?? true,
        subCategoryImage: subcategory.subCategoryImage || null,
      });
    }
  }, [subcategory, reset]);

  const handleImageChange = React.useCallback((value: string | File | null) => {
    setValue("subCategoryImage", value, { shouldValidate: true });
  }, [setValue]);

  const onSubmitForm = (data: FormData) => {
    onSubmit({
      category: data.category,
      subcategory: data.subcategory.trim(),
      categorycode: data.categorycode.trim(),
      description: data.description?.trim() || "",
      subCategoryImage: (data.subCategoryImage || undefined) as string | File | undefined,
      status: data.status,
    });
  };

  return (
    <form id="subcategory-form" onSubmit={handleSubmit(onSubmitForm)}>
      <div className="p-4 sm:p-5 md:p-6 lg:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6 lg:gap-8">
          {/* Left Side - Image Upload */}
          <div className="flex flex-col">
            <WebComponents.UiComponents.UiWebComponents.FormLabel>
              {Constants.adminConstants.subcategoryStrings.imageLabel}
            </WebComponents.UiComponents.UiWebComponents.FormLabel>
            <div className="mt-2 flex-1">
              <Controller
                name="subCategoryImage"
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
                    uploadButtonText={Constants.adminConstants.subcategoryStrings.uploadImageLabel}
                    useAdminUpload={true}
                  />
                )}
              />
            </div>
          </div>

          {/* Right Side - Form Fields */}
          <div className="flex flex-col gap-4 sm:gap-5 md:gap-6 lg:gap-8">
            {/* Sub Category Name */}
            <div>
              <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="subcategory">
                {Constants.adminConstants.subcategoryStrings.subcategoryNameLabel}{" "}
                <span className="text-required">{Constants.adminConstants.requiredstar}</span>
              </WebComponents.UiComponents.UiWebComponents.FormLabel>
              <WebComponents.UiComponents.UiWebComponents.FormInput
                id="subcategory"
                type="text"
                placeholder={Constants.adminConstants.subcategoryStrings.namePlaceholder}
                {...register("subcategory")}
                autoComplete="off"
                className={errors.subcategory ? "border-red-500" : ""}
              />
              {errors.subcategory && (
                <p className="mt-1 text-sm text-red-500">{errors.subcategory.message}</p>
              )}
            </div>

            {/* Category */}
            <div>
              <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="category">
                {Constants.adminConstants.subcategoryStrings.categoryLabel}{" "}
                <span className="text-required">{Constants.adminConstants.requiredstar}</span>
              </WebComponents.UiComponents.UiWebComponents.FormLabel>
              <Controller
                name="category"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <WebComponents.UiComponents.UiWebComponents.FormDropdown
                    id="category"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className={errors.category ? "border-red-500" : ""}
                  >
                    <WebComponents.UiComponents.UiWebComponents.FormOption value="">Select Category</WebComponents.UiComponents.UiWebComponents.FormOption>
                    {Array.isArray(categories) && categories.length > 0 ? (
                      categories.map((cat) => (
                        <WebComponents.UiComponents.UiWebComponents.FormOption key={cat._id} value={cat._id}>
                          {cat.categoryName}
                        </WebComponents.UiComponents.UiWebComponents.FormOption>
                      ))
                    ) : (
                      <WebComponents.UiComponents.UiWebComponents.FormOption value="" disabled>
                        {Constants.adminConstants.subcategoryStrings.noCategoriesAvailable}
                      </WebComponents.UiComponents.UiWebComponents.FormOption>
                    )}
                  </WebComponents.UiComponents.UiWebComponents.FormDropdown>
                )}
              />
              {errors.category && (
                <p className="mt-1 text-sm text-red-500">{errors.category.message}</p>
              )}
            </div>

            {/* Sub Category Code */}
            <div>
              <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="categorycode">
                {Constants.adminConstants.subcategoryStrings.codeLabel}{" "}
                <span className="text-required">{Constants.adminConstants.requiredstar}</span>
              </WebComponents.UiComponents.UiWebComponents.FormLabel>
              <WebComponents.UiComponents.UiWebComponents.FormInput
                id="categorycode"
                type="text"
                placeholder={Constants.adminConstants.subcategoryStrings.codePlaceholder}
                {...register("categorycode")}
                autoComplete="off"
                className={errors.categorycode ? "border-red-500" : ""}
              />
              {errors.categorycode && (
                <p className="mt-1 text-sm text-red-500">{errors.categorycode.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Description and Status - Aligned Horizontally */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6 lg:gap-8">
          {/* Description */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <WebComponents.UiComponents.UiWebComponents.FormLabel>
                {Constants.adminConstants.descriptionlabel}{" "}
                <span className="text-required">{Constants.adminConstants.requiredstar}</span>
              </WebComponents.UiComponents.UiWebComponents.FormLabel>
              <p className="text-textSmall dark:text-gray-400 font-interTight font-normal text-xs sm:text-sm leading-[8px]">
                {Constants.adminConstants.max250characters}
              </p>
            </div>
            <Controller
              name="description"
              control={control}
              render={({ field, fieldState }) => (
                <>
                  <WebComponents.UiComponents.UiWebComponents.Textarea
                    {...field}
                    placeholder={Constants.adminConstants.subcategoryStrings.descriptionPlaceholder}
                    rows={1}
                    charCounter={false}
                    autoComplete="off"
                    className={fieldState.error ? "border-red-500" : ""}
                  />
                  <div className="flex justify-between items-start mt-1 gap-2">
                    <div className="flex-1 min-w-0">
                      {fieldState.error && (
                        <p className="text-sm text-required break-words leading-tight">
                          {fieldState.error.message}
                        </p>
                      )}
                    </div>
                    <div className="text-sm text-textSmall font-interTight whitespace-nowrap">
                      {(field.value || "").length}/250
                    </div>
                  </div>
                </>
              )}
            />
          </div>

          {/* Status toggle */}
          <div>
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
                      aria-label="Toggle subcategory status"
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

export default SubCategoryForm;

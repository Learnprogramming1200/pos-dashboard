"use client";

import React from "react";
import { useForm, Controller, useController } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { planFormSchema } from "@/app/validation/ValidationSchema";
import { Constants } from "@/constant";
import { WebComponents } from "@/components";
import { SuperAdminTypes } from "@/types";

export default function PlanForm({
  title,
  onClose,
  onSubmit,
  plan,
  taxes = [],
}: {
  readonly title: string;
  readonly onClose: () => void;
  readonly onSubmit: (formData: SuperAdminTypes.PlanTypes.PlanFormData) => void;
  readonly plan?: SuperAdminTypes.PlanTypes.Plan;
  readonly taxes?: SuperAdminTypes.TaxTypes.Tax[];
}) {
  type FormData = Yup.InferType<typeof planFormSchema>;

  const defaultPlanCategory: "paid" | "free" = (() => {
    if (!plan) return "paid";
    const planCategory = (plan as any)?.planCategory;
    if (planCategory === "paid" || planCategory === "free") return planCategory;
    const isTrial = (plan as any)?.isTrial;
    if (typeof isTrial === "boolean") return isTrial ? "free" : "paid";
    const planPrice = (plan as any)?.price || (plan as any)?.Price;
    return planPrice && Number(planPrice) > 0 ? "paid" : "free";
  })();

  const defaultTaxes: string[] = (() => {
    const planTaxes = (plan as any)?.taxes;
    if (!planTaxes) return [];
    if (!Array.isArray(planTaxes)) return [];
    return planTaxes.map((t: any) => (typeof t === "string" ? t : t?._id)).filter(Boolean);
  })();

  const defaultScreens: string[] = Array.isArray((plan as any)?.screens)
    ? (plan as any).screens
    : Array.isArray((plan as any)?.Pos_Screen)
      ? ((plan as any).Pos_Screen as any)
      : (plan as any)?.Pos_Screen
        ? [(plan as any).Pos_Screen]
        : [];

  const defaultModules: string[] = Array.isArray((plan as any)?.modules)
    ? (plan as any).modules
    : Array.isArray((plan as any)?.Modules)
      ? (plan as any).Modules
      : [];

  const defaultStatusBoolean =
    typeof (plan as any)?.status === "boolean"
      ? Boolean((plan as any).status)
      : ((plan as any)?.Status === "Active" || (plan as any)?.status === "Active");

  const defaultDiscountType = (() => {
    const dt = (plan as any)?.discountType || (plan as any)?.Discount_Type;
    if (!dt) return "";
    const normalized = String(dt).toLowerCase();
    if (normalized === "fixed" || normalized === "percentage") return normalized;
    return "";
  })();

  const defaultDiscount = (() => {
    const d = (plan as any)?.discount ?? (plan as any)?.Discount;
    if (d === null || d === undefined || d === "") return null;
    const n = Number(d);
    return Number.isFinite(n) ? n : null;
  })();

  const taxesLoading = false;

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(planFormSchema) as any,
    mode: "onChange",
    defaultValues: {
      planCategory: defaultPlanCategory,
      name: (plan as any)?.name || (plan as any)?.Plan_Name || "",
      type: ((plan as any)?.type || "").toString() || (defaultPlanCategory === "free" ? "daily" : "monthly"),
      duration: (() => {
        const duration = (plan as any)?.duration;
        if (!duration) return "";
        if (typeof duration === "number") return String(duration);
        const durationStr = String(duration);
        const numericMatch = durationStr.match(/^\d+/);
        return numericMatch ? numericMatch[0] : "";
      })(),
      price: (() => {
        const p = (plan as any)?.price ?? (plan as any)?.Price;
        if (p === null || p === undefined || p === "") return defaultPlanCategory === "free" ? 0 : 0;
        const n = Number(p);
        return Number.isFinite(n) ? n : 0;
      })(),
      staffLimit: (() => {
        const v = (plan as any)?.staffLimit ?? (plan as any)?.Staff;
        const n = Number(v);
        return Number.isFinite(n) ? n : 0;
      })(),
      storeLimit: (() => {
        const v = (plan as any)?.storeLimit ?? (plan as any)?.Total_Stores;
        const n = Number(v);
        return Number.isFinite(n) ? n : 0;
      })(),
      screens: defaultScreens,
      modules: defaultModules,
      description: (plan as any)?.description || (plan as any)?.Description || "",
      status: plan ? defaultStatusBoolean : true,
      taxes: defaultTaxes,
      discountType: defaultDiscountType,
      discount: defaultDiscount,
      totalPrice: (plan as any)?.totalPrice ?? 0,
    } as any,
  });

  const planCategoryCtrl = useController({ name: "planCategory", control });
  const totalPriceCtrl = useController({ name: "totalPrice", control });

  const planCategory = planCategoryCtrl.field.value;
  const planType = watch("type");
  const selectedTaxes = watch("taxes") || [];
  const selectedScreens = watch("screens") || [];
  const selectedModules = watch("modules") || [];
  const watchedPrice = watch("price");
  const watchedDiscountType = watch("discountType");
  const watchedDiscount = watch("discount");

  const activeTab: "paid" | "free" =
    planCategory === "paid" || planCategory === "free" ? planCategory : defaultPlanCategory;

  const planId = (plan as any)?._id as string | undefined;
  const isEdit = Boolean(planId);
  const lastResetKeyRef = React.useRef<string>("__init__");

  // Sync form values when editing plan changes
  React.useEffect(() => {
    // Prevent unwanted resets when plan object reference changes
    const nextKey = planId || "__new__";
    if (lastResetKeyRef.current === nextKey) return;
    lastResetKeyRef.current = nextKey;

    reset({
      planCategory: defaultPlanCategory,
      name: (plan as any)?.name || (plan as any)?.Plan_Name || "",
      type: ((plan as any)?.type || "").toString() || (defaultPlanCategory === "free" ? "daily" : "monthly"),
      duration: (() => {
        const duration = (plan as any)?.duration;
        if (!duration) return "";
        if (typeof duration === "number") return String(duration);
        const durationStr = String(duration);
        const numericMatch = durationStr.match(/^\d+/);
        return numericMatch ? numericMatch[0] : "";
      })(),
      price: (() => {
        const p = (plan as any)?.price ?? (plan as any)?.Price;
        const n = Number(p ?? 0);
        return Number.isFinite(n) ? n : 0;
      })(),
      staffLimit: (() => {
        const v = (plan as any)?.staffLimit ?? (plan as any)?.Staff;
        const n = Number(v ?? 0);
        return Number.isFinite(n) ? n : 0;
      })(),
      storeLimit: (() => {
        const v = (plan as any)?.storeLimit ?? (plan as any)?.Total_Stores;
        const n = Number(v ?? 0);
        return Number.isFinite(n) ? n : 0;
      })(),
      screens: defaultScreens,
      modules: defaultModules,
      description: (plan as any)?.description || (plan as any)?.Description || "",
      status: plan ? defaultStatusBoolean : true,
      taxes: defaultTaxes,
      discountType: defaultDiscountType,
      discount: defaultDiscount,
      totalPrice: (plan as any)?.totalPrice ?? 0,
    } as any);
  }, [planId, reset, defaultPlanCategory, defaultTaxes, defaultDiscount, defaultDiscountType, defaultModules, defaultScreens, defaultStatusBoolean]);

  // Keep totalPrice in sync (client-side computed)
  React.useEffect(() => {
    if (planCategory === "free") {
      setValue("totalPrice", 0 as any, { shouldDirty: false });
      return;
    }

    const basePrice = Number(watchedPrice) || 0;
    if (basePrice <= 0) {
      setValue("totalPrice", 0 as any, { shouldDirty: false });
      return;
    }

    let discountedPrice = basePrice;
    const discountNum = typeof watchedDiscount === "number" ? watchedDiscount : Number(watchedDiscount);
    if (watchedDiscountType && discountNum && Number.isFinite(discountNum)) {
      if (watchedDiscountType === "percentage") {
        discountedPrice = basePrice - (basePrice * discountNum) / 100;
      } else if (watchedDiscountType === "fixed") {
        discountedPrice = basePrice - discountNum;
      }
      if (discountedPrice < 0) discountedPrice = 0;
    }

    let finalPrice = discountedPrice;
    if (Array.isArray(selectedTaxes) && selectedTaxes.length > 0) {
      selectedTaxes.forEach((taxId: any) => {
        const tax = taxes.find((t) => (t as any)._id === taxId);
        if (!tax) return;
        const taxValue = Number((tax as any).value) || 0;
        const taxType = (tax as any).type;
        if (taxType === "Percentage") {
          finalPrice += (discountedPrice * taxValue) / 100;
        } else {
          finalPrice += taxValue;
        }
      });
    }

    setValue("totalPrice", Math.max(0, finalPrice) as any, { shouldDirty: false });
  }, [planCategory, watchedPrice, watchedDiscountType, watchedDiscount, selectedTaxes, taxes, setValue]);

  const handleTabChange = (tab: "paid" | "free") => {
    // Requirement: allow switching only while creating.
    if (isEdit) return;
    planCategoryCtrl.field.onChange(tab);
    // validate immediately so UI updates consistently
    setValue("planCategory", tab as any, { shouldValidate: true, shouldDirty: true });

    if (tab === "free") {
      setValue("type", "daily" as any, { shouldValidate: true });
      setValue("price", 0 as any, { shouldValidate: true });
      setValue("discountType", "" as any, { shouldValidate: true });
      setValue("discount", null as any, { shouldValidate: true });
      setValue("taxes", [] as any, { shouldValidate: true });
      setValue("totalPrice", 0 as any, { shouldDirty: false });
    } else {
      // Paid: ensure type is valid paid default
      const currentType = watch("type");
      if (!currentType || currentType === "daily") {
        setValue("type", "monthly" as any, { shouldValidate: true });
      }
    }
  };

  const maxDuration = (() => {
    if (planCategory === "free" && planType === "daily") return 31;
    if (planCategory === "paid" && planType === "monthly") return 11;
    if (planCategory === "paid" && planType === "yearly") return 10;
    return undefined;
  })();

  const onFormSubmit = (data: FormData) => {
    const formData: SuperAdminTypes.PlanTypes.PlanFormData = {
      name: data.name,
      type: data.type as any,
      price: Number(data.price || 0),
      duration: String(data.duration || ""),
      storeLimit: Number(data.storeLimit || 0),
      staffLimit: Number(data.staffLimit || 0),
      screens: Array.isArray(data.screens) ? (data.screens as any) : [],
      modules: Array.isArray(data.modules) ? (data.modules as any) : [],
      description: (data.description || "") as any,
      status: Boolean(data.status),
      planCategory: (data.planCategory as any) || "paid",
      isTrial: data.planCategory === "free",
    };

    if (data.planCategory === "paid") {
      formData.taxes = Array.isArray(data.taxes) && data.taxes.length > 0 ? (data.taxes as any) : undefined;
      formData.discountType = data.discountType ? (data.discountType as any) : undefined;
      formData.discount = typeof data.discount === "number" ? data.discount : (data.discount ? Number(data.discount) : undefined);
      formData.totalPrice = typeof (data as any).totalPrice === "number" ? (data as any).totalPrice : undefined;
    }

    onSubmit(formData);
  };

  return (
    <>
      {/* title prop kept for parity */}
      <div className="w-full h-full bg-white dark:bg-darkFilterbar flex flex-col rounded-[4px] mt-4">
        {/* Tabs */}
        <div className="px-4 sm:px-5 md:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-[#616161]">
          <div className="flex space-x-1 bg-gray-100 dark:bg-[#1B1B1B] rounded-lg p-1">
            <button
              type="button"
              onClick={() => handleTabChange("paid")}
              disabled={isEdit}
              className={`flex-1 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors ${
                activeTab === "paid"
                  ? "bg-white dark:bg-[#3A3A3A] text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              } ${isEdit ? "opacity-70 cursor-not-allowed hover:text-gray-500 dark:hover:text-gray-400" : ""}`}
            >
              {Constants.superadminConstants.paidplan}
            </button>
            <button
              type="button"
              onClick={() => handleTabChange("free")}
              disabled={isEdit}
              className={`flex-1 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors ${
                activeTab === "free"
                  ? "bg-white dark:bg-[#3A3A3A] text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              } ${isEdit ? "opacity-70 cursor-not-allowed hover:text-gray-500 dark:hover:text-gray-400" : ""}`}
            >
              {Constants.superadminConstants.freeplan}
            </button>
          </div>
        </div>

        <form id="plan-form" onSubmit={handleSubmit(onFormSubmit)} className="h-full" noValidate>
          {/* keep RHF fields mounted */}
          <input type="hidden" {...planCategoryCtrl.field} />
          <input
            type="hidden"
            name={totalPriceCtrl.field.name}
            ref={totalPriceCtrl.field.ref}
            onBlur={totalPriceCtrl.field.onBlur}
            onChange={totalPriceCtrl.field.onChange}
            value={totalPriceCtrl.field.value ?? ""}
          />
          <div className="p-4 sm:p-5 md:p-6 lg:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6 lg:gap-8">
              <div>
                <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="planName">
                  {Constants.superadminConstants.plannamelabel}{" "}
                  <span className="text-required">{Constants.superadminConstants.requiredstar}</span>
                </WebComponents.UiComponents.UiWebComponents.FormLabel>
                <WebComponents.UiComponents.UiWebComponents.FormInput
                  id="planName"
                  placeholder="Enter plan name"
                  data-testid="plan-name-input"
                  autoComplete="off"
                  {...register("name")}
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && <p className="mt-1 text-sm text-required">{String(errors.name.message)}</p>}
              </div>

              <div>
                <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="planType">
                  {Constants.superadminConstants.plantypelabel}{" "}
                  <span className="text-required">{Constants.superadminConstants.requiredstar}</span>
                </WebComponents.UiComponents.UiWebComponents.FormLabel>
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <WebComponents.UiComponents.UiWebComponents.FormDropdown
                      id="planType"
                      name="planType"
                      value={field.value as any}
                      onChange={(e) => {
                        const value = e.target.value;
                        const v =
                          value === "monthly" || value === "yearly" || value === "daily" || value === "weekly"
                            ? value
                            : "";
                        field.onChange(v);
                        setValue("duration", "" as any, { shouldValidate: true });
                      }}
                      data-testid="plan-type-dropdown"
                      autoComplete="off"
                      className={errors.type ? "border-red-500" : ""}
                    >
                      <WebComponents.UiComponents.UiWebComponents.FormOption value="">
                        Choose Plan Type
                      </WebComponents.UiComponents.UiWebComponents.FormOption>
                      {activeTab === "paid"
                        ? ["monthly", "yearly"].map((type) => (
                            <WebComponents.UiComponents.UiWebComponents.FormOption key={type} value={type}>
                              {type}
                            </WebComponents.UiComponents.UiWebComponents.FormOption>
                          ))
                        : ["daily"].map((type) => (
                            <WebComponents.UiComponents.UiWebComponents.FormOption key={type} value={type}>
                              {type}
                            </WebComponents.UiComponents.UiWebComponents.FormOption>
                          ))}
                    </WebComponents.UiComponents.UiWebComponents.FormDropdown>
                  )}
                />
                {errors.type && <p className="mt-1 text-sm text-required">{String(errors.type.message)}</p>}
              </div>

              <div>
                <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="planDuration">
                  {Constants.superadminConstants.plandurationlabel}{" "}
                  <span className="text-required">{Constants.superadminConstants.requiredstar}</span>
                </WebComponents.UiComponents.UiWebComponents.FormLabel>
                <WebComponents.UiComponents.UiWebComponents.FormInput
                  id="planDuration"
                  type="number"
                  min="1"
                  max={maxDuration}
                  placeholder={
                    activeTab === "free" && planType === "daily"
                      ? "Enter days (max 31)"
                      : activeTab === "paid" && planType === "monthly"
                        ? "Enter months (max 11)"
                        : activeTab === "paid" && planType === "yearly"
                          ? "Enter years (max 10)"
                          : "Enter duration"
                  }
                  autoComplete="off"
                  disabled={!planType}
                  {...register("duration")}
                  className={errors.duration ? "border-red-500" : ""}
                />
                {planType && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {activeTab === "free" && planType === "daily"
                      ? "Maximum 31 days"
                      : activeTab === "paid" && planType === "monthly"
                        ? "Maximum 11 months"
                        : activeTab === "paid" && planType === "yearly"
                          ? "Maximum 10 years"
                          : ""}
                  </p>
                )}
                {errors.duration && <p className="mt-1 text-sm text-required">{String(errors.duration.message)}</p>}
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="planPrice">
                    {Constants.superadminConstants.planpricelabel}{" "}
                    <span className="text-required">{Constants.superadminConstants.requiredstar}</span>
                  </WebComponents.UiComponents.UiWebComponents.FormLabel>
                  {activeTab === "free" && (
                    <p className="text-textSmall font-interTight font-normal text-sm leading-[8px]">
                      {Constants.superadminConstants.freeplanshaveafixedpriceof0}
                    </p>
                  )}
                </div>
                <Controller
                  name="price"
                  control={control}
                  render={({ field }) => (
                    <WebComponents.UiComponents.UiWebComponents.FormInput
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder={activeTab === "free" ? "Free Plan" : "Enter plan price"}
                      value={String(field.value ?? "")}
                      onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                      autoComplete="off"
                      disabled={activeTab === "free"}
                      className={errors.price ? "border-red-500" : ""}
                    />
                  )}
                />
                {errors.price && <p className="mt-1 text-sm text-required">{String(errors.price.message)}</p>}
              </div>

              {activeTab === "paid" && (
                <>
                  <div>
                    <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="discountType">
                      {Constants.superadminConstants.discounttypecolabel}
                    </WebComponents.UiComponents.UiWebComponents.FormLabel>
                    <Controller
                      name="discountType"
                      control={control}
                      render={({ field }) => (
                        <WebComponents.UiComponents.UiWebComponents.FormDropdown
                          id="discountType"
                          name="discountType"
                          value={(field.value as any) ?? ""}
                          onChange={(e) => field.onChange((e.target as HTMLSelectElement).value)}
                          autoComplete="off"
                          className={errors.discountType ? "border-red-500" : ""}
                        >
                          <WebComponents.UiComponents.UiWebComponents.FormOption value="">
                            No Discount
                          </WebComponents.UiComponents.UiWebComponents.FormOption>
                          <WebComponents.UiComponents.UiWebComponents.FormOption value="fixed">
                            Fixed
                          </WebComponents.UiComponents.UiWebComponents.FormOption>
                          <WebComponents.UiComponents.UiWebComponents.FormOption value="percentage">
                            Percentage
                          </WebComponents.UiComponents.UiWebComponents.FormOption>
                        </WebComponents.UiComponents.UiWebComponents.FormDropdown>
                      )}
                    />
                  </div>

                  <div>
                    <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="discountValue">
                      {Constants.superadminConstants.discountlabel}
                    </WebComponents.UiComponents.UiWebComponents.FormLabel>
                    <Controller
                      name="discount"
                      control={control}
                      render={({ field }) => (
                        <WebComponents.UiComponents.UiWebComponents.FormInput
                          id="discountValue"
                          name="discountValue"
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder={watchedDiscountType === "percentage" ? "Enter %" : "Enter amount"}
                          value={field.value === null || typeof field.value === "undefined" ? "" : String(field.value)}
                          onChange={(e) => field.onChange(e.target.value === "" ? null : Number(e.target.value))}
                          autoComplete="off"
                          disabled={!watchedDiscountType}
                          className={errors.discount ? "border-red-500" : ""}
                        />
                      )}
                    />
                    {watchedDiscountType === "percentage" && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {Constants.superadminConstants.discount0to100}
                      </p>
                    )}
                    {errors.discount && <p className="mt-1 text-sm text-required">{String(errors.discount.message)}</p>}
                  </div>
                </>
              )}

              {activeTab === "paid" && (
                <>
                  <div>
                    <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="selectedTax">
                      {Constants.superadminConstants.taxlabel}{" "}
                      <span className="text-required">{Constants.superadminConstants.requiredstar}</span>
                    </WebComponents.UiComponents.UiWebComponents.FormLabel>
                    <Controller
                      name="taxes"
                      control={control}
                      render={({ field }) => (
                        <WebComponents.UiComponents.UiWebComponents.FormDropdown
                          id="selectedTax"
                          name="selectedTax"
                          value={(field.value as any) || []}
                          onChange={(e) => {
                            const v: any = (e.target as any).value;
                            const next = Array.isArray(v) ? v.filter(Boolean) : (v ? [v] : []);
                            field.onChange(next);
                          }}
                          disabled={taxesLoading}
                          multiselect
                          selectall
                          autoComplete="off"
                          className={errors.taxes ? "border-red-500" : ""}
                        >
                          {taxes
                            .filter((tax) => (tax as any).status === true)
                            .map((tax) => {
                              const taxName = (tax as any).name || "Unnamed Tax";
                              const taxType =
                                (tax as any).type === "Percentage"
                                  ? `${(tax as any).value}%`
                                  : `${(tax as any).value}`;
                              return (
                                <WebComponents.UiComponents.UiWebComponents.FormOption
                                  key={(tax as any)._id}
                                  value={(tax as any)._id}
                                >
                                  {`${taxName} (${taxType})`}
                                </WebComponents.UiComponents.UiWebComponents.FormOption>
                              );
                            })}
                        </WebComponents.UiComponents.UiWebComponents.FormDropdown>
                      )}
                    />
                    {taxesLoading && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Loading taxes...
                      </p>
                    )}
                    {errors.taxes && <p className="mt-1 text-sm text-required">{String((errors.taxes as any).message)}</p>}
                  </div>

                  <div>
                    <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="totalPrice">
                      Total Price
                    </WebComponents.UiComponents.UiWebComponents.FormLabel>
                    <WebComponents.UiComponents.UiWebComponents.FormInput
                      id="totalPrice"
                      name="totalPrice"
                      type="number"
                      step="0.01"
                      value={Number(watch("totalPrice") || 0).toFixed(2)}
                      readOnly
                      disabled
                      className="bg-gray-100 dark:bg-[#1B1B1B] cursor-not-allowed"
                      autoComplete="off"
                    />
                  </div>
                </>
              )}

              <div className="col-span-1 lg:col-span-2">
                <WebComponents.UiComponents.UiWebComponents.FormLabel className="mb-3 block">
                  Screen Selection
                </WebComponents.UiComponents.UiWebComponents.FormLabel>
                <Controller
                  name="screens"
                  control={control}
                  render={({ field }) => (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                      {Constants.commonConstants.superAdminScreens.map((screen) => {
                        const selected = (field.value as any[])?.includes(screen.name);
                        return (
                          <div
                            key={screen.id}
                            className={`border-2 rounded-lg p-3 cursor-pointer transition-all relative ${
                              selected
                                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                            }`}
                            onClick={() => {
                              const prev = Array.isArray(field.value) ? [...(field.value as any[])] : [];
                              const next = prev.includes(screen.name)
                                ? prev.filter((t) => t !== screen.name)
                                : [...prev, screen.name];
                              field.onChange(next);
                            }}
                          >
                            <div
                              className={`w-full h-20 rounded mb-2 flex items-center justify-center ${
                                screen.name === "POS 1"
                                  ? "bg-white border border-gray-200"
                                  : screen.name === "POS 2"
                                    ? "bg-gray-800"
                                    : screen.name === "POS 3"
                                      ? "bg-blue-100"
                                      : screen.name === "POS 4"
                                        ? "bg-gray-100"
                                        : "bg-white border border-gray-100"
                              }`}
                            >
                              <div
                                className={`w-8 h-8 rounded ${
                                  screen.name === "POS 1"
                                    ? "bg-gray-200"
                                    : screen.name === "POS 2"
                                      ? "bg-gray-600"
                                      : screen.name === "POS 3"
                                        ? "bg-blue-200"
                                        : screen.name === "POS 4"
                                          ? "bg-gray-300"
                                          : "bg-gray-100"
                                }`}
                              />
                            </div>
                            <p className="text-sm text-center text-gray-900 dark:text-white font-medium">
                              {screen.name}
                            </p>
                            {selected && (
                              <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs font-bold">✓</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                />
                {selectedScreens.length > 0 && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
                    {Constants.superadminConstants.selectedscreens} {selectedScreens.join(", ")}
                  </p>
                )}
                {errors.screens && <p className="mt-1 text-sm text-required">{String((errors.screens as any).message)}</p>}
              </div>

              <div>
                <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="staffCount">
                  {Constants.superadminConstants.staffcountlabel}{" "}
                  <span className="text-required">{Constants.superadminConstants.requiredstar}</span>
                </WebComponents.UiComponents.UiWebComponents.FormLabel>
                <WebComponents.UiComponents.UiWebComponents.FormInput
                  type="number"
                  min="1"
                  placeholder="Enter staff count"
                  autoComplete="off"
                  {...register("staffLimit")}
                  className={errors.staffLimit ? "border-red-500" : ""}
                />
                {errors.staffLimit && <p className="mt-1 text-sm text-required">{String(errors.staffLimit.message)}</p>}
              </div>

              <div>
                <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="storeCount">
                  {Constants.superadminConstants.storecountlabel}{" "}
                  <span className="text-required">{Constants.superadminConstants.requiredstar}</span>
                </WebComponents.UiComponents.UiWebComponents.FormLabel>
                <WebComponents.UiComponents.UiWebComponents.FormInput
                  type="number"
                  min="1"
                  placeholder="Enter store count"
                  autoComplete="off"
                  {...register("storeLimit")}
                  className={errors.storeLimit ? "border-red-500" : ""}
                />
                {errors.storeLimit && <p className="mt-1 text-sm text-required">{String(errors.storeLimit.message)}</p>}
              </div>

              <div className="col-span-1 lg:col-span-2">
                <div className="flex items-center justify-between mb-3">
                  <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="planModules">
                    {Constants.superadminConstants.planmodulelabel}{" "}
                    <span className="text-required">{Constants.superadminConstants.requiredstar}</span>
                  </WebComponents.UiComponents.UiWebComponents.FormLabel>
                  <label className="flex items-center space-x-2">
                    <Controller
                      name="modules"
                      control={control}
                      render={({ field }) => (
                        <WebComponents.UiComponents.UiWebComponents.Checkbox
                          checked={
                            Array.isArray(field.value) &&
                            field.value.length === Constants.commonConstants.superAdminModules.length
                          }
                          onChange={(e) => {
                            const checked = (e.target as HTMLInputElement).checked;
                            field.onChange(checked ? Constants.commonConstants.superAdminModules : []);
                          }}
                          autoComplete="off"
                        />
                      )}
                    />
                    <span className="text-textMain dark:text-white font-interTight font-normal text-base leading-[20px]">
                      {Constants.superadminConstants.selectall}
                    </span>
                  </label>
                </div>
                <Controller
                  name="modules"
                  control={control}
                  render={({ field }) => (
                    <div className="bg-textMain2 dark:bg-[#1B1B1B] grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-[130px] gap-y-[30px] border border-[#D8D9D9] dark:border-[#616161] rounded-lg p-4">
                      {Constants.commonConstants.superAdminModules.map((module) => (
                        <label key={module} className="flex items-center space-x-2">
                          <WebComponents.UiComponents.UiWebComponents.Checkbox
                            id={module}
                            checked={Array.isArray(field.value) ? (field.value as any[]).includes(module) : false}
                            onChange={() => {
                              const prev = Array.isArray(field.value) ? [...(field.value as any[])] : [];
                              const next = prev.includes(module)
                                ? prev.filter((m) => m !== module)
                                : [...prev, module];
                              field.onChange(next);
                            }}
                            autoComplete="off"
                          />
                          <span className="text-textMain dark:text-white font-interTight font-normal text-base leading-[20px]">
                            {module}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                />
                {errors.modules && <p className="mt-1 text-sm text-required">{String((errors.modules as any).message)}</p>}
              </div>

              <div className="col-span-1 lg:col-span-2">
                <div className="flex justify-between items-center mb-1">
                  <WebComponents.UiComponents.UiWebComponents.FormLabel>
                    {Constants.superadminConstants.descriptionlabel}
                  </WebComponents.UiComponents.UiWebComponents.FormLabel>
                  <p className="text-textSmall dark:text-gray-400 font-interTight font-normal text-xs sm:text-sm leading-[8px]">
                    {Constants.superadminConstants.max50characters}
                  </p>
                </div>
                <WebComponents.UiComponents.UiWebComponents.Textarea
                  placeholder="Enter plan description"
                  charLength={50}
                  autoComplete="off"
                  {...register("description")}
                />
                {errors.description && <p className="mt-1 text-sm text-required">{String(errors.description.message)}</p>}
              </div>

              {/* Status toggle for both paid and free plans */}
              <div className="col-span-1 md:col-span-2">
                <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="plan-status-toggle">
                  {Constants.superadminConstants.statuslabel}
                </WebComponents.UiComponents.UiWebComponents.FormLabel>
                <div className="h-[44px] w-full rounded-[4px] border-[0.6px] border-[#D8D9D9] dark:border-[#616161] bg-textMain2 dark:bg-[#1B1B1B]">
                  <div className="flex items-center justify-between px-3 sm:px-4 py-[10px]">
                    <span className="text-xs sm:text-sm font-interTight font-medium leading-[14px] text-textMain dark:text-white">
                      {watch("status")
                        ? Constants.superadminConstants.activestatus
                        : Constants.superadminConstants.inactivestatus}
                    </span>
                    <Controller
                      name="status"
                      control={control}
                      render={({ field }) => (
                        <WebComponents.UiComponents.UiWebComponents.Switch
                          id="plan-status-toggle"
                          checked={!!field.value}
                          onCheckedChange={(checked) => field.onChange(checked)}
                          aria-label="Toggle plan status"
                        />
                      )}
                    />
                  </div>
                </div>
                {errors.status && <p className="mt-1 text-sm text-required">{String(errors.status.message)}</p>}
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Footer */}
      <div className="pt-6 sm:pt-10 md:pt-14 lg:pt-[40px] flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 px-4 sm:px-0">
        <WebComponents.UiComponents.UiWebComponents.Button
          variant="cancel"
          type="button"
          onClick={onClose}
          aria-label="Cancel form"
        >
          {Constants.superadminConstants.cancelbutton}
        </WebComponents.UiComponents.UiWebComponents.Button>
        <WebComponents.UiComponents.UiWebComponents.Button
          variant="save"
          type="submit"
          form="plan-form"
          aria-label="Save plan"
        >
          {Constants.superadminConstants.save}
        </WebComponents.UiComponents.UiWebComponents.Button>
      </div>
    </>
  );
}


"use client";
import React from "react";
import dynamic from "next/dynamic";
import { Plus, Trash2, QrCode, Camera, RefreshCw } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { productFormSchema } from "@/app/validation/ValidationSchema";
import { Constants } from "@/constant";
import { WebComponents } from "@/components";
import { AdminTypes } from "@/types";
import { toast } from "react-toastify";
const BarcodeScanner = dynamic(() => import("react-qr-barcode-scanner"), {
  ssr: false,
}) as any;

interface ProductFormProps {
  formData: AdminTypes.InventoryTypes.ProductTypes.ProductFormData;
  setFormData: React.Dispatch<React.SetStateAction<AdminTypes.InventoryTypes.ProductTypes.ProductFormData>>;
  handleSubmit: (e: React.FormEvent, directData?: AdminTypes.InventoryTypes.ProductTypes.ProductFormData) => void;
  handleFileChange: (file: File | null | string) => void;
  isScanning: boolean;
  setIsScanning: React.Dispatch<React.SetStateAction<boolean>>;
  barcodeFetchStatus: {
    loading: boolean;
    success: boolean;
    error: string | null;
  };
  setBarcodeFetchStatus: React.Dispatch<
    React.SetStateAction<{
      loading: boolean;
      success: boolean;
      error: string | null;
    }>
  >;
  suggestions: any[];
  suggestionsLoading: boolean;
  updateSearchTerm: (value: string) => void;
  handleBarcodeSuggestionSelect: (suggestion: any) => void;
  fetchProductData: (barcodeValue: string) => void;
  generateSKU: () => void;
  showWarrantyFields: boolean;
  showExpiryFields: boolean;
  ymdToDisplay: (ymd: string) => string;
  displayToYmd: (display: string) => string;
  updateVariation: (
    index: number,
    field: keyof AdminTypes.InventoryTypes.ProductTypes.ProductVariationItem,
    value: any
  ) => void;
  addVariation: () => void;
  removeVariation: (index: number) => void;
  generateVariationSKU: (
    variationValue: string,
    variationType: string
  ) => string;
  stores: AdminTypes.storeTypes.Store[];
  categories: AdminTypes.InventoryTypes.ProductTypes.ProductCategory[];
  subcategories: AdminTypes.InventoryTypes.ProductTypes.ProductSubCategory[];
  brands: AdminTypes.InventoryTypes.ProductTypes.ProductBrand[];
  units: AdminTypes.InventoryTypes.ProductTypes.ProductUnit[];
  warranties: AdminTypes.InventoryTypes.ProductTypes.ProductWarranty[];
  variations: AdminTypes.InventoryTypes.ProductTypes.ProductVariation[];
  taxes: any[];
  resetTrigger?: number;
}


export default function ProductForm({
  formData,
  setFormData,
  handleSubmit: parentHandleSubmit,
  handleFileChange,
  isScanning,
  setIsScanning,
  barcodeFetchStatus,
  setBarcodeFetchStatus,
  suggestions,
  suggestionsLoading,
  updateSearchTerm,
  handleBarcodeSuggestionSelect,
  fetchProductData,
  generateSKU,
  showWarrantyFields,
  showExpiryFields,
  ymdToDisplay,
  displayToYmd,
  updateVariation,
  addVariation,
  removeVariation,
  generateVariationSKU,
  stores,
  categories,
  subcategories,
  brands,
  units,
  warranties,
  variations,
  taxes,
  resetTrigger,
}: ProductFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    clearErrors,
    reset,
  } = useForm<AdminTypes.InventoryTypes.ProductTypes.CreateProductFormData>({
    resolver: yupResolver(productFormSchema) as any,
    mode: "onSubmit",
    defaultValues: {
      productName: formData.productName || "",
      description: formData.description || "",
      category: formData.category || "",
      subCategory: formData.subCategory || "",
      brand: formData.brand || "",
      unit: formData.unit || { unit: "", value: 0 },
      productSKU: formData.productSKU || "",
      barcode: formData.barcode || "",
      status: formData.status ?? true,
      hasVariation: formData.hasVariation || false,
      stock: formData.stock || [{ storeId: "", quantity: 0 }],
      productCostPrice: formData.productCostPrice || 0,
      productSellingPrice: formData.productSellingPrice || 0,
      productDiscount: formData.productDiscount || 0,
      tax: formData.tax || [],
      warrantyType: formData.warrantyType || "",
      warrantyDate: formData.warrantyDate || "",
      expiryDate: formData.expiryDate || "",
      dimensions: formData.dimensions || "",
      lowStockAlert: formData.lowStockAlert || 0,
      variantInventory: formData.variantInventory || [],
    },
  });

  // Sync react-hook-form with parent's formData (only when formData changes externally)
  const prevFormDataRef = React.useRef(formData);
  const lastHandledResetTrigger = React.useRef(resetTrigger || 0);

  // Sync react-hook-form with parent's formData (only when specific fields change externally)
  React.useEffect(() => {
    if (prevFormDataRef.current.productSKU !== formData.productSKU) {
      setValue("productSKU", formData.productSKU || "", { shouldValidate: true });
    }
    if (prevFormDataRef.current.productName !== formData.productName) {
      setValue("productName", formData.productName || "", { shouldValidate: true });
    }
    if (prevFormDataRef.current.description !== formData.description) {
      setValue("description", formData.description || "", { shouldValidate: true });
    }
    if (prevFormDataRef.current.category !== formData.category) {
      setValue("category", formData.category || "", { shouldValidate: true });
    }
    if (prevFormDataRef.current.subCategory !== formData.subCategory) {
      setValue("subCategory", formData.subCategory || "", { shouldValidate: true });
    }
    if (prevFormDataRef.current.brand !== formData.brand) {
      setValue("brand", formData.brand || "", { shouldValidate: true });
    }
    if (JSON.stringify(prevFormDataRef.current.stock?.[0]) !== JSON.stringify(formData.stock?.[0])) {
      setValue("stock.0.storeId", formData.stock?.[0]?.storeId || "", { shouldValidate: true });
    }
    if (prevFormDataRef.current.expiryDate !== formData.expiryDate) {
      setValue("expiryDate", formData.expiryDate || "", { shouldValidate: true });
    }
    if (prevFormDataRef.current.warrantyDate !== formData.warrantyDate) {
      setValue("warrantyDate", formData.warrantyDate || "", { shouldValidate: true });
    }
    if (prevFormDataRef.current.warrantyType !== formData.warrantyType) {
      setValue("warrantyType", formData.warrantyType || "", { shouldValidate: true });
    }
    if (prevFormDataRef.current.hasVariation !== formData.hasVariation) {
      setValue("hasVariation", formData.hasVariation || false, { shouldValidate: true });
    }
    if (prevFormDataRef.current.status !== formData.status) {
      setValue("status", formData.status ?? true, { shouldValidate: true });
    }
    if (prevFormDataRef.current.lowStockAlert !== formData.lowStockAlert) {
      setValue("lowStockAlert", formData.lowStockAlert || 0, { shouldValidate: true });
    }
    prevFormDataRef.current = formData;
  }, [
    formData.productSKU,
    formData.productName,
    formData.description,
    formData.category,
    formData.subCategory,
    formData.brand,
    formData.stock,
    formData.expiryDate,
    formData.warrantyDate,
    formData.warrantyType,
    formData.hasVariation,
    formData.status,
    formData.lowStockAlert,
    setValue
  ]);

  // Sync variantInventory with react-hook-form when it changes
  React.useEffect(() => {
    if (formData.variantInventory) {
      setValue("variantInventory", formData.variantInventory.map(v => ({
        variantValue: v.variantValue,
        SKU: v.SKU,
        quantity: v.quantity,
        costPrice: v.costPrice,
        sellingPrice: v.sellingPrice,
        variantId: v.variantId || "",
        image: v.image || null,
        discount: v.discount || 0,
        lowStockAlert: v.lowStockAlert || 0,
        _id: v._id,
      })));
    }
  }, [formData.variantInventory, setValue]);

  // Reset form when editing a product (triggered by resetTrigger from parent)
  React.useEffect(() => {
    if (resetTrigger !== undefined && resetTrigger > lastHandledResetTrigger.current) {
      lastHandledResetTrigger.current = resetTrigger;
      // Reset the form with all current formData values
      const resetValues: any = {
        productName: formData.productName || "",
        description: formData.description || "",
        category: formData.category || "",
        subCategory: formData.subCategory || "",
        brand: formData.brand || "",
        unit: formData.unit || { unit: "", value: 0 },
        productSKU: formData.productSKU || "",
        barcode: formData.barcode || "",
        status: formData.status ?? true,
        hasVariation: formData.hasVariation || false,
        stock: formData.stock || [{ storeId: "", quantity: 0 }],
        productCostPrice: formData.productCostPrice || 0,
        productSellingPrice: formData.productSellingPrice || 0,
        productDiscount: formData.productDiscount || 0,
        tax: formData.tax || "",
        warrantyType: formData.warrantyType || "",
        warrantyDate: formData.warrantyDate || "",
        expiryDate: formData.expiryDate || "",
        dimensions: formData.dimensions || "",
        variantInventory: formData.variantInventory?.map(v => ({
          variantValue: v.variantValue,
          SKU: v.SKU,
          quantity: v.quantity,
          costPrice: v.costPrice,
          sellingPrice: v.sellingPrice,
          variantId: v.variantId || "",
          image: v.image || null,
          discount: v.discount || 0,
          lowStockAlert: v.lowStockAlert || 0,
          _id: v._id,
        })) || [],
      };

      // Use reset to update all form values at once
      reset(resetValues);

    }
  }, [resetTrigger, formData, reset]);


  // Handle form submission with validation
  // Handle form submission with validation
  const onSubmit = async (data: AdminTypes.InventoryTypes.ProductTypes.CreateProductFormData) => {
    // Create a synthetic event to pass to parent handler
    const syntheticEvent = {
      preventDefault: () => { },
      stopPropagation: () => { },
    } as React.FormEvent;

    // Update parent formData with validated data (with proper type conversion)
    // Use formData as source of truth for unit to ensure it's always current
    setFormData((prev) => {
      const updated: AdminTypes.InventoryTypes.ProductTypes.ProductFormData = {
        ...prev,
        productName: data.productName || "",
        description: data.description || "",
        category: data.category || "",
        subCategory: data.subCategory || "",
        brand: data.brand || "",
        // Use current formData.unit.unit if available, otherwise use validated data
        unit: {
          unit: prev.unit?.unit || data.unit?.unit || "",
          value: prev.unit?.value ?? data.unit?.value ?? 0,
        },
        productSKU: data.productSKU || "",
        barcode: data.barcode || "",
        status: data.status ?? true,
        hasVariation: data.hasVariation || false,
        productCostPrice: data.productCostPrice || 0,
        productSellingPrice: data.productSellingPrice || 0,
        productDiscount: data.productDiscount || 0,
        tax: data.tax || "",
        warrantyType: data.warrantyType || "",
        warrantyDate: data.warrantyDate || "",
        expiryDate: data.expiryDate || "",
        dimensions: data.dimensions || "",
      };
      if (data.stock) {
        updated.stock = data.stock.map(s => ({
          storeId: s.storeId,
          quantity: (s.quantity ?? 0) as number,
        }));
      }
      if (data.variantInventory) {
        updated.variantInventory = data.variantInventory.map(v => ({
          variantValue: v.variantValue,
          SKU: v.SKU,
          quantity: v.quantity,
          costPrice: v.costPrice,
          sellingPrice: v.sellingPrice,
          variantId: v.variantId || "",
          image: v.image || null,
          discount: Number(v.discount) || 0,
          lowStockAlert: Number(v.lowStockAlert) || 0,
          _id: v._id,
        }));
      }
      return updated;
    });

    // Call parent's handleSubmit with the direct data to avoid state race conditions
    // The parent's setFormData we just called is async, so we pass the local 'updated' object
    const finalUpdated: any = {
      ...formData, // Start with everything from parent state
      ...data,     // Override with fresh data from react-hook-form
      unit: {
        unit: data.unit?.unit || formData.unit?.unit || "",
        value: data.unit?.value ?? formData.unit?.value ?? 0,
      },
    };

    if (data.variantInventory) {
      finalUpdated.variantInventory = data.variantInventory.map((v, index) => {
        // Find existing variant for ID if possible, otherwise use what RHF has
        const existingVariant = (formData.variantInventory || [])[index];
        return {
          variantValue: v.variantValue,
          SKU: v.SKU,
          quantity: v.quantity,
          costPrice: v.costPrice,
          sellingPrice: v.sellingPrice,
          variantId: v.variantId || existingVariant?.variantId || "",
          image: v.image || existingVariant?.image || null,
          discount: Number(v.discount) || 0,
          lowStockAlert: Number(v.lowStockAlert) || 0,
          _id: v._id || existingVariant?._id,
        };
      });
    }

    parentHandleSubmit(syntheticEvent, finalUpdated);
  };

  const onError = (errors: any) => {
    toast.error("Please fill all required fields correctly.");

    // Scroll to first error
    const firstErrorField = Object.keys(errors)[0];
    if (firstErrorField) {
      // Special handling for variantInventory errors - scroll to variations section
      if (firstErrorField === "variantInventory") {
        const variationsSection = document.querySelector('[data-section="variations"]');
        if (variationsSection) {
          variationsSection.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      } else {
        // For other fields, try to find the input element
        const element = document.querySelector(`[name="${firstErrorField}"]`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    }
  };

  return (
    <div className="bg-white dark:bg-darkFilterbar rounded-[4px] mt-4">
      <form id="product-form" onSubmit={handleSubmit(onSubmit, onError)}>
        <div className="p-4 sm:p-5 md:p-6 lg:p-8">
          {/* Row 1: Product Image (Left) and Scan Product (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-5 lg:gap-6 xl:gap-7 2xl:gap-8 mb-3 sm:mb-4 md:mb-5 lg:mb-6 items-stretch">
            {/* Product Image */}
            <div className="col-span-1 h-full">
              <div className="rounded-[4px] border-[0.6px] border-[#D8D9D9] dark:border-[#616161] p-3 sm:p-4 md:p-5 lg:p-6 h-full">
                <WebComponents.UiComponents.UiWebComponents.FormLabel>{Constants.adminConstants.productimage}</WebComponents.UiComponents.UiWebComponents.FormLabel>
                <div className="flex flex-col gap-2 sm:gap-3 md:gap-4 pt-2 sm:pt-2.5 md:pt-3">
                  <WebComponents.UiComponents.UiWebComponents.ImageCropUpload
                    value={formData.productImage as any}
                    onChange={(val: string | File | null) =>
                      handleFileChange(val as File | null)
                    }
                    accept="image/*"
                    aspect={1}
                    shape="rect"
                    previewMask="rect"
                    previewSize={{
                      width: 500,
                      height: isScanning ? 300 : 150,
                    }}
                    viewSize={300}
                    uploadButtonText="Upload"
                    removeButtonText="Remove"
                    layout="vertical"
                    useAdminUpload={true}
                  />
                </div>
              </div>
            </div>

            {/* Scan Product */}
            <div className="col-span-1 h-full">
              <div className="bg-white dark:bg-transparent rounded-[4px] border-[0.6px] border-[#D8D9D9] dark:border-[#616161] p-3 sm:p-4 md:p-5 lg:p-6 h-full">
                <WebComponents.UiComponents.UiWebComponents.FormLabel>Scan Product</WebComponents.UiComponents.UiWebComponents.FormLabel>
                <div className="flex flex-col gap-2 sm:gap-3 md:gap-4 pt-2 sm:pt-2.5 md:pt-3">
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-center">
                    <div className="flex-1 relative">
                      <Controller
                        name="barcode"
                        control={control}
                        render={({ field }) => (
                          <WebComponents.UiComponents.UiWebComponents.BarcodeSuggestionDropdown
                            value={field.value || ""}
                            onInputChange={(value) => {
                              field.onChange(value);
                              setFormData((prev) => ({
                                ...prev,
                                barcode: value,
                              }));
                              updateSearchTerm(value);
                              if (
                                barcodeFetchStatus.error ||
                                barcodeFetchStatus.success
                              ) {
                                setBarcodeFetchStatus({
                                  loading: false,
                                  success: false,
                                  error: null,
                                });
                              }
                            }}
                            onSuggestionSelect={handleBarcodeSuggestionSelect}
                            suggestions={suggestions}
                            isLoading={suggestionsLoading}
                            placeholder="Enter barcode or scan with barcode"
                          />
                        )}
                      />
                    </div>
                    <WebComponents.UiComponents.UiWebComponents.Button
                      type="button"
                      onClick={() => setIsScanning((prev) => !prev)}
                      className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 md:py-3 h-10 sm:h-11 md:h-12 text-xs sm:text-sm md:text-base ${isScanning
                        ? "bg-green-600 hover:bg-green-700 text-white"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                        }`}
                    >
                      {isScanning ? (
                        <>
                          <Camera className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                          <span className="hidden sm:inline">Stop</span>
                        </>
                      ) : (
                        <>
                          <QrCode className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                          <span className="hidden sm:inline">Scan</span>
                        </>
                      )}
                    </WebComponents.UiComponents.UiWebComponents.Button>
                  </div>

                  {/* Camera Scanner */}
                  {isScanning && (
                    <div className="border rounded-lg w-full max-w-[200px] sm:max-w-[250px] md:max-w-[300px] lg:max-w-[350px] xl:max-w-[400px] aspect-square overflow-hidden bg-black barcode-scanner-container mx-auto sm:mx-0">
                      <BarcodeScanner
                        width={300}
                        height={300}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                        onUpdate={(err: any, result: any) => {
                          if (result) {
                            const code = result.text;
                            setValue("barcode", code);
                            setFormData((prev) => ({
                              ...prev,
                              barcode: code,
                            }));
                            setIsScanning(false);
                            fetchProductData(code);
                          }
                        }}
                      />
                    </div>
                  )}

                  {/* Status Messages */}
                  {barcodeFetchStatus.loading && (
                    <div className="text-xs sm:text-sm md:text-base text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-2.5 rounded border border-blue-200 dark:border-blue-800 flex items-center gap-1.5 sm:gap-2">
                      <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-blue-600"></div>
                      <span className="text-xs sm:text-sm">
                        Fetching product data...
                      </span>
                    </div>
                  )}

                  {barcodeFetchStatus.success && (
                    <div className="text-xs sm:text-sm md:text-base text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-2.5 rounded border border-green-200 dark:border-green-800 flex items-center gap-1.5 sm:gap-2">
                      <svg
                        className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-xs sm:text-sm">
                        Product data loaded successfully! Form fields have
                        been auto-filled.
                      </span>
                    </div>
                  )}

                  {barcodeFetchStatus.error && (
                    <div className="text-xs sm:text-sm md:text-base text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-2.5 rounded border border-red-200 dark:border-red-800 flex items-center gap-1.5 sm:gap-2">
                      <svg
                        className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-xs sm:text-sm">
                        {barcodeFetchStatus.error}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Name And Description (Left) and Category (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-5 lg:gap-6 xl:gap-7 2xl:gap-8 mb-3 sm:mb-4 md:mb-5 lg:mb-6 items-stretch">
            {/* Name And Description */}
            <div className="col-span-1 h-full">
              <div className="bg-white dark:bg-transparent rounded-[4px] border-[0.6px] border-[#D8D9D9] dark:border-[#616161] p-3 sm:p-4 md:p-5 lg:p-6 h-full">
                <h3 className="text-formHeading font-poppins text-sm sm:text-sm md:text-base font-semibold leading-4 dark:text-white">
                  {Constants.adminConstants.nameanddescription}
                </h3>
                <div className="pt-2 sm:pt-2.5 md:pt-3">
                  {/* Product Name */}
                  <div>
                    <WebComponents.UiComponents.UiWebComponents.FormLabel>{Constants.adminConstants.productname} <span className="text-required">{Constants.adminConstants.requiredstar}</span></WebComponents.UiComponents.UiWebComponents.FormLabel>
                    <Controller
                      name="productName"
                      control={control}
                      render={({ field }) => (
                        <WebComponents.UiComponents.UiWebComponents.FormInput
                          {...field}
                          placeholder={Constants.adminConstants.enterproductname}
                          value={field.value || ""}
                          onChange={(e) => {
                            field.onChange(e);
                            setFormData((prev) => ({
                              ...prev,
                              productName: e.target.value,
                            }));
                          }}
                          className={errors.productName ? "border-red-500" : ""}
                        />
                      )}
                    />
                    {errors.productName && (
                      <p className="mt-1 text-sm text-red-500">{errors.productName.message}</p>
                    )}
                  </div>

                  {/* Product Description */}
                  <div className="pt-2 sm:pt-2.5 md:pt-3">
                    <div className="flex items-center justify-between">
                      <WebComponents.UiComponents.UiWebComponents.FormLabel>{Constants.adminConstants.productdescription} <span className="text-required">{Constants.adminConstants.requiredstar}</span></WebComponents.UiComponents.UiWebComponents.FormLabel>
                      {/* <div className="text-textSmall font-interTight font-normal text-xs sm:text-sm leading-2 dark:text-gray-400">
                        {Constants.adminConstants.max250characters}
                      </div> */}
                    </div>
                    <div className="relative">
                      <Controller
                        name="description"
                        control={control}
                        render={({ field }) => (
                          <>
                            <WebComponents.UiComponents.UiWebComponents.Textarea
                              {...field}
                              value={field.value || ""}
                              charCounter={false}
                              onChange={(e) => {
                                field.onChange(e);
                                setFormData((prev) => ({
                                  ...prev,
                                  description: e.target.value,
                                }));
                              }}
                              placeholder={Constants.adminConstants.enterproductdescription}
                              rows={2}
                              charLength={250}
                              className={errors.description ? "border-red-500" : ""}
                            />
                            <div className="flex justify-between items-center mt-1">
                              {errors.description && (
                                <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>
                              )}
                              <div className="text-xs text-gray-500 text-right">
                                {(field.value || "").length}/250
                              </div>
                            </div>
                          </>
                        )}
                      />

                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Category */}
            <div className="col-span-1 h-full">
              <div className="bg-white dark:bg-transparent rounded-[4px] border-[0.6px] border-[#D8D9D9] dark:border-[#616161] p-3 sm:p-4 md:p-5 lg:p-6 h-full">
                <h3 className="text-formHeading font-poppins text-sm sm:text-sm md:text-base font-semibold leading-4 dark:text-white">
                  {Constants.adminConstants.categorysection}
                </h3>
                <div className="pt-2 sm:pt-2.5 md:pt-3">
                  {/* Product Category */}
                  <div>
                    <WebComponents.UiComponents.UiWebComponents.FormLabel>{Constants.adminConstants.productcategorylabel} <span className="text-required">{Constants.adminConstants.requiredstar}</span></WebComponents.UiComponents.UiWebComponents.FormLabel>
                    <Controller
                      name="category"
                      control={control}
                      render={({ field }) => (
                        <WebComponents.UiComponents.UiWebComponents.FormDropdown
                          {...field}
                          value={field.value || ""}
                          onChange={(e) => {
                            field.onChange(e);
                            setValue("subCategory", "");
                            setFormData((prev) => ({
                              ...prev,
                              category: e.target.value,
                              subCategory: "",
                            }));
                          }}
                          className={errors.category ? "border-red-500" : ""}
                        >
                          <WebComponents.UiComponents.UiWebComponents.FormOption value="">{Constants.adminConstants.selectcategory}</WebComponents.UiComponents.UiWebComponents.FormOption>
                          {categories.map((category) => (
                            <WebComponents.UiComponents.UiWebComponents.FormOption key={category._id} value={category._id}>
                              {`${category.categoryName}${category.business ? ` (${category.business})` : ""
                                }`}
                            </WebComponents.UiComponents.UiWebComponents.FormOption>
                          ))}
                        </WebComponents.UiComponents.UiWebComponents.FormDropdown>
                      )}
                    />
                    {errors.category && (
                      <p className="mt-1 text-sm text-red-500">{errors.category.message}</p>
                    )}
                  </div>

                  {/* Product Sub-Category */}
                  <div className="pt-2 sm:pt-2.5 md:pt-3">
                    <WebComponents.UiComponents.UiWebComponents.FormLabel>{Constants.adminConstants.productsubcategorylabel} <span className="text-required">{Constants.adminConstants.requiredstar}</span></WebComponents.UiComponents.UiWebComponents.FormLabel>
                    <Controller
                      name="subCategory"
                      control={control}
                      render={({ field }) => (
                        <WebComponents.UiComponents.UiWebComponents.FormDropdown
                          {...field}
                          value={field.value || ""}
                          onChange={(e) => {
                            field.onChange(e);
                            setFormData((prev) => ({
                              ...prev,
                              subCategory: e.target.value,
                            }));
                          }}
                          disabled={!formData.category}
                          className={errors.subCategory ? "border-red-500" : ""}
                        >
                          <WebComponents.UiComponents.UiWebComponents.FormOption value="">{Constants.adminConstants.selectsubcategory}</WebComponents.UiComponents.UiWebComponents.FormOption>
                          {subcategories
                            .filter((sub) => {
                              // Handle both string and object category structures
                              const subCategoryId = typeof sub.category === 'string'
                                ? sub.category
                                : sub.category?._id;
                              return subCategoryId === formData.category;
                            })
                            .map((subCategory) => (
                              <WebComponents.UiComponents.UiWebComponents.FormOption
                                key={subCategory._id}
                                value={subCategory._id}
                              >
                                {`${subCategory.subcategory}${subCategory.categorycode
                                  ? ` (${subCategory.categorycode})`
                                  : ""
                                  }`}
                              </WebComponents.UiComponents.UiWebComponents.FormOption>
                            ))}
                        </WebComponents.UiComponents.UiWebComponents.FormDropdown>
                      )}
                    />
                    {errors.subCategory && (
                      <p className="mt-1 text-sm text-red-500">{errors.subCategory.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Row 3: Store, SKU & Status (Left) and Product Details (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-5 lg:gap-6 xl:gap-7 2xl:gap-8 mb-3 sm:mb-4 md:mb-5 lg:mb-6 items-stretch">
            {/* Store, SKU & Status */}
            <div className="col-span-1 h-full">
              <div className="bg-white dark:bg-transparent rounded-[4px] border-[0.6px] border-[#D8D9D9] dark:border-[#616161] p-3 sm:p-4 md:p-5 lg:p-6 h-full">
                <h3 className="text-formHeading font-poppins text-sm sm:text-sm md:text-base font-semibold leading-4 dark:text-white">
                  {Constants.adminConstants.storeskustatus}
                </h3>
                <div className="pt-2 sm:pt-2.5 md:pt-3">
                  {/* Store */}
                  <div>
                    <WebComponents.UiComponents.UiWebComponents.FormLabel>{Constants.adminConstants.storelabel} <span className="text-required">{Constants.adminConstants.requiredstar}</span></WebComponents.UiComponents.UiWebComponents.FormLabel>
                    <Controller
                      name="stock.0.storeId"
                      control={control}
                      render={({ field }) => (
                        <WebComponents.UiComponents.UiWebComponents.FormDropdown
                          {...field}
                          value={field.value || ""}
                          onChange={(e) => {
                            field.onChange(e);
                            setFormData((prev) => ({
                              ...prev,
                              stock:
                                (prev.stock || []).length > 0
                                  ? [
                                    {
                                      ...(prev.stock || [])[0],
                                      storeId: e.target.value,
                                    },
                                  ]
                                  : [{ storeId: e.target.value, quantity: 0 }],
                            }));
                          }}
                          className={errors.stock?.[0]?.storeId ? "border-red-500" : ""}
                        >
                          <WebComponents.UiComponents.UiWebComponents.FormOption value="">{Constants.adminConstants.selectstore}</WebComponents.UiComponents.UiWebComponents.FormOption>
                          {stores.map((store) => (
                            <WebComponents.UiComponents.UiWebComponents.FormOption key={store._id} value={store._id}>
                              {`${store.name}${store.owner ? ` (${store.owner.name})` : ""
                                }`}
                            </WebComponents.UiComponents.UiWebComponents.FormOption>
                          ))}
                        </WebComponents.UiComponents.UiWebComponents.FormDropdown>
                      )}
                    />
                    {errors.stock?.[0]?.storeId && (
                      <p className="mt-1 text-sm text-red-500">{errors.stock[0].storeId.message}</p>
                    )}
                  </div>

                  {/* SKU */}
                  <div className="pt-2 sm:pt-2.5 md:pt-3">
                    <WebComponents.UiComponents.UiWebComponents.FormLabel>{Constants.adminConstants.skuaotolabel} <span className="text-required">{Constants.adminConstants.requiredstar}</span></WebComponents.UiComponents.UiWebComponents.FormLabel>
                    <div className="flex gap-1.5 sm:gap-2">
                      <Controller
                        name="productSKU"
                        control={control}
                        render={({ field }) => (
                          <WebComponents.UiComponents.UiWebComponents.FormInput
                            {...field}
                            value={field.value || ""}
                            onChange={(e) => {
                              field.onChange(e);
                              setFormData((prev) => ({
                                ...prev,
                                productSKU: e.target.value,
                              }));
                            }}
                            placeholder={Constants.adminConstants.entersku}
                            className={`flex-1 text-xs sm:text-sm md:text-base ${errors.productSKU ? "border-red-500" : ""}`}
                          />
                        )}
                      />
                      <WebComponents.UiComponents.UiWebComponents.Button
                        type="button"
                        onClick={generateSKU}
                        className="bg-blue-600 hover:bg-blue-700 text-white p-2 sm:p-2.5 md:p-3 h-10 sm:h-11 w-10 sm:w-11 md:w-12 flex items-center justify-center"
                      >
                        <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                      </WebComponents.UiComponents.UiWebComponents.Button>
                    </div>
                    {errors.productSKU && (
                      <p className="mt-1 text-sm text-red-500">{errors.productSKU.message}</p>
                    )}
                  </div>

                  {/* Status */}
                  <div className="pt-2 sm:pt-2.5 md:pt-3">
                    <WebComponents.UiComponents.UiWebComponents.FormLabel>{Constants.adminConstants.statuslabel}</WebComponents.UiComponents.UiWebComponents.FormLabel>
                    <Controller
                      name="status"
                      control={control}
                      render={({ field }) => (
                        <div className="h-10 sm:h-11 md:h-12 w-full rounded-[4px] border-[0.6px] border-[#D8D9D9] dark:border-[#616161] bg-textMain2 dark:bg-[#1B1B1B]">
                          <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 h-full">
                            <span className="text-xs sm:text-sm md:text-base font-medium text-gray-700 dark:text-white">
                              {field.value ? Constants.adminConstants.activestatus : Constants.adminConstants.inactivestatus}
                            </span>
                            <WebComponents.UiComponents.UiWebComponents.Switch
                              checked={field.value}
                              onCheckedChange={(checked) => {
                                field.onChange(checked);
                                setFormData((prev) => ({
                                  ...prev,
                                  status: checked,
                                }));
                              }}
                              className="data-[state=checked]:bg-blue-600"
                            />
                          </div>
                        </div>
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Product Details */}
            <div className="col-span-1 h-full">
              <div className="bg-white dark:bg-transparent rounded-[4px] border-[0.6px] border-[#D8D9D9] dark:border-[#616161] p-3 sm:p-4 md:p-5 lg:p-6 h-full">
                <h3 className="text-formHeading font-poppins text-sm sm:text-sm md:text-base font-semibold leading-4 dark:text-white">
                  {Constants.adminConstants.productdetails}
                </h3>
                <div className="pt-2 sm:pt-2.5 md:pt-3 space-y-2 sm:space-y-3 md:space-y-4">
                  {/* Brand Name */}
                  <div>
                    <WebComponents.UiComponents.UiWebComponents.FormLabel>{Constants.adminConstants.brandnamelabel} <span className="text-required">{Constants.adminConstants.requiredstar}</span></WebComponents.UiComponents.UiWebComponents.FormLabel>
                    <Controller
                      name="brand"
                      control={control}
                      render={({ field }) => (
                        <WebComponents.UiComponents.UiWebComponents.FormDropdown
                          {...field}
                          value={field.value || ""}
                          onChange={(e) => {
                            field.onChange(e);
                            setFormData((prev) => ({
                              ...prev,
                              brand: e.target.value,
                            }));
                          }}
                          className={errors.brand ? "border-red-500" : ""}
                        >
                          <WebComponents.UiComponents.UiWebComponents.FormOption value="">{Constants.adminConstants.selectbrand}</WebComponents.UiComponents.UiWebComponents.FormOption>
                          {brands.map((brand) => (
                            <WebComponents.UiComponents.UiWebComponents.FormOption key={brand._id} value={brand._id}>
                              {brand.brand}
                            </WebComponents.UiComponents.UiWebComponents.FormOption>
                          ))}
                        </WebComponents.UiComponents.UiWebComponents.FormDropdown>
                      )}
                    />
                    {errors.brand && (
                      <p className="mt-1 text-sm text-red-500">{errors.brand.message}</p>
                    )}
                  </div>

                  {/* Unit */}
                  <div>
                    <WebComponents.UiComponents.UiWebComponents.FormLabel>{Constants.adminConstants.productunit} <span className="text-required">{Constants.adminConstants.requiredstar}</span></WebComponents.UiComponents.UiWebComponents.FormLabel>
                    <Controller
                      name="unit.unit"
                      control={control}
                      render={({ field, fieldState }) => {
                        const unitError = fieldState.error || (errors.unit as any)?.unit || errors.unit;
                        // Use formData.unit.unit as source of truth to ensure it's always in sync
                        const currentValue = formData.unit?.unit || field.value || "";
                        return (
                          <>
                            <WebComponents.UiComponents.UiWebComponents.FormDropdown
                              {...field}
                              value={currentValue}
                              onChange={(e) => {
                                const newValue = e.target.value;
                                // Update react-hook-form
                                field.onChange(newValue);
                                setValue("unit.unit", newValue, { shouldValidate: true });
                                // Update parent formData
                                setFormData((prev) => ({
                                  ...prev,
                                  unit: {
                                    ...prev.unit,
                                    unit: newValue,
                                  },
                                }));
                              }}
                              className={fieldState.invalid || unitError ? "border-red-500" : ""}
                            >

                              <WebComponents.UiComponents.UiWebComponents.FormOption value="">{Constants.adminConstants.selectunit}</WebComponents.UiComponents.UiWebComponents.FormOption>
                              {units.map((unit) => (
                                <WebComponents.UiComponents.UiWebComponents.FormOption key={unit._id} value={unit._id}>
                                  {`${unit.unit}${unit.shortName ? ` (${unit.shortName})` : ""}`}
                                </WebComponents.UiComponents.UiWebComponents.FormOption>
                              ))}
                            </WebComponents.UiComponents.UiWebComponents.FormDropdown>
                            {unitError && (
                              <p className="mt-1 text-sm text-red-500">
                                {unitError.message || "Unit is required"}
                              </p>
                            )}
                          </>
                        );
                      }}
                    />
                  </div>


                  {/* Warranty (shown based on selected category) */}
                  {showWarrantyFields && (
                    <div>
                      <WebComponents.UiComponents.UiWebComponents.FormLabel>{Constants.adminConstants.warrantylabel}</WebComponents.UiComponents.UiWebComponents.FormLabel>
                      <WebComponents.UiComponents.UiWebComponents.FormDropdown
                        value={formData.warrantyType}
                        onChange={(e) => {
                          const val = e.target.value;
                          // Update react-hook-form
                          setValue("warrantyType", val, { shouldValidate: true });
                          // Update parent formData
                          setFormData((prev) => ({
                            ...prev,
                            warrantyType: val,
                          }))
                        }
                        }
                      >
                        <WebComponents.UiComponents.UiWebComponents.FormOption value="">{Constants.adminConstants.selectwarranty}</WebComponents.UiComponents.UiWebComponents.FormOption>
                        <WebComponents.UiComponents.UiWebComponents.FormOption value="no-warranty">No Warranty</WebComponents.UiComponents.UiWebComponents.FormOption>
                        {warranties.map((warranty) => (
                          <WebComponents.UiComponents.UiWebComponents.FormOption key={warranty._id} value={warranty._id}>
                            {`${warranty.warranty} (${warranty.duration} ${warranty.period})`}
                          </WebComponents.UiComponents.UiWebComponents.FormOption>
                        ))}
                      </WebComponents.UiComponents.UiWebComponents.FormDropdown>
                      {formData.warrantyType && formData.warrantyType !== "no-warranty" && formData.warrantyDate && (
                        <p className="mt-1 text-xs text-info font-medium">
                          Warranty expires on: {formData.warrantyDate}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Expiry Date (shown based on selected category) */}
                  {showExpiryFields && (
                    <div>
                      <WebComponents.UiComponents.UiWebComponents.FormLabel>{Constants.adminConstants.expirydate}</WebComponents.UiComponents.UiWebComponents.FormLabel>
                      <Controller
                        name="expiryDate"
                        control={control}
                        render={({ field }) => (
                          <WebComponents.UiComponents.UiWebComponents.SingleDatePicker
                            value={field.value}
                            onChange={(v) => {
                              field.onChange(v);
                              setFormData((prev) => ({
                                ...prev,
                                expiryDate: v,
                              }));
                            }}
                            disabled={formData.warrantyType === "no-warranty"}
                            className="h-10 sm:h-11 md:h-12 text-xs sm:text-sm md:text-base"
                          />
                        )}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Row 4: Product Pricing (Full Width, 3 columns internally) - Hidden when variations are enabled */}
          {!formData.hasVariation && (
            <div className="mb-3 sm:mb-4 md:mb-5 lg:mb-6">
              <div className="bg-white dark:bg-transparent rounded-[4px] border-[0.6px] border-[#D8D9D9] dark:border-[#616161] p-3 sm:p-4 md:p-5 lg:p-6">
                <h3 className="text-formHeading font-poppins text-sm sm:text-sm md:text-base font-semibold leading-4 dark:text-white">
                  {Constants.adminConstants.productpricing}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-5 md:gap-6 pt-2 sm:pt-2.5 md:pt-3">
                  {/* Row 1: Quantity, Low Stock Alert, Cost Price */}
                  {/* Quantity */}
                  <div>
                    <WebComponents.UiComponents.UiWebComponents.FormLabel>{Constants.adminConstants.productquantity}</WebComponents.UiComponents.UiWebComponents.FormLabel>
                    <Controller
                      name="stock.0.quantity"
                      control={control}
                      render={({ field }) => (
                        <WebComponents.UiComponents.UiWebComponents.FormInput
                          type="number"
                          {...field}
                          min="0"
                          step="1"
                          value={field.value || 0}
                          onChange={(e) => {
                            field.onChange(parseInt(e.target.value) || 0);
                            setFormData((prev) => ({
                              ...prev,
                              stock:
                                (prev.stock || []).length > 0
                                  ? [
                                    {
                                      ...(prev.stock || [])[0],
                                      quantity: parseInt(e.target.value) || 0,
                                    },
                                  ]
                                  : [
                                    {
                                      storeId: "",
                                      quantity: parseInt(e.target.value) || 0,
                                    },
                                  ],
                            }));
                          }}
                          placeholder="0"
                          className={errors.stock?.[0]?.quantity ? "border-red-500" : ""}
                        />
                      )}
                    />
                    {errors.stock?.[0]?.quantity && (
                      <p className="mt-1 text-sm text-red-500">{errors.stock[0].quantity.message}</p>
                    )}
                  </div>

                  {/* Low Stock Alert */}
                  <div>
                    <WebComponents.UiComponents.UiWebComponents.FormLabel>Low Stock Alert</WebComponents.UiComponents.UiWebComponents.FormLabel>
                    <Controller
                      name="lowStockAlert"
                      control={control}
                      render={({ field }) => (
                        <WebComponents.UiComponents.UiWebComponents.FormInput
                          type="number"
                          {...field}
                          min="0"
                          step="1"
                          value={field.value || 0}
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || 0;
                            field.onChange(value);
                            setFormData((prev) => ({
                              ...prev,
                              lowStockAlert: value,
                            }));
                          }}
                          placeholder="Enter low stock threshold"
                          className={errors.lowStockAlert ? "border-red-500" : ""}
                        />
                      )}
                    />
                    {errors.lowStockAlert && (
                      <p className="mt-1 text-sm text-red-500">{errors.lowStockAlert.message}</p>
                    )}
                  </div>

                  {/* Cost Price */}
                  <div>
                    <WebComponents.UiComponents.UiWebComponents.FormLabel>{Constants.adminConstants.productcostprice} <span className="text-required">{Constants.adminConstants.requiredstar}</span></WebComponents.UiComponents.UiWebComponents.FormLabel>
                    <WebComponents.UiComponents.UiWebComponents.FormInput
                      type="number"
                      min="0"
                      step="1"
                      {...register("productCostPrice", { valueAsNumber: true })}
                      value={formData.productCostPrice || ""}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0;
                        setFormData((prev) => ({
                          ...prev,
                          productCostPrice: value,
                        }));
                      }}
                      placeholder="0"
                      className={errors.productCostPrice ? "border-red-500" : ""}
                    />
                    {errors.productCostPrice && (
                      <p className="mt-1 text-sm text-red-500">{errors.productCostPrice.message}</p>
                    )}
                  </div>

                  {/* Row 2: Selling Price, Discount, Tax */}
                  {/* Selling Price */}
                  <div>
                    <WebComponents.UiComponents.UiWebComponents.FormLabel>{Constants.adminConstants.productsellingprice} <span className="text-required">{Constants.adminConstants.requiredstar}</span></WebComponents.UiComponents.UiWebComponents.FormLabel>
                    <WebComponents.UiComponents.UiWebComponents.FormInput
                      type="number"
                      min="0"
                      step="1"
                      {...register("productSellingPrice", { valueAsNumber: true })}
                      value={formData.productSellingPrice || ""}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0;
                        setFormData((prev) => ({
                          ...prev,
                          productSellingPrice: value,
                        }));
                      }}
                      placeholder="0"
                      className={errors.productSellingPrice ? "border-red-500" : ""}
                    />
                    {errors.productSellingPrice && (
                      <p className="mt-1 text-sm text-red-500">{errors.productSellingPrice.message}</p>
                    )}
                  </div>

                  {/* Discount */}
                  <div>
                    <WebComponents.UiComponents.UiWebComponents.FormLabel>{Constants.adminConstants.discountlabel} ({Constants.adminConstants.percentagesymbol})</WebComponents.UiComponents.UiWebComponents.FormLabel>
                    <WebComponents.UiComponents.UiWebComponents.FormInput
                      type="number"
                      min="0"
                      step="1"
                      {...register("productDiscount", { valueAsNumber: true })}
                      placeholder="0"
                      className={errors.productDiscount ? "border-red-500" : ""}
                    />
                    {errors.productDiscount && (
                      <p className="mt-1 text-sm text-red-500">{errors.productDiscount.message}</p>
                    )}
                  </div>

                  {/* Tax */}
                  <div>
                    <WebComponents.UiComponents.UiWebComponents.FormLabel>{Constants.adminConstants.taxlabel}</WebComponents.UiComponents.UiWebComponents.FormLabel>
                    <Controller
                      name="tax"
                      control={control}
                      render={({ field }) => (
                        <WebComponents.UiComponents.UiWebComponents.FormDropdown
                          {...field}
                          multiselect
                          value={field.value || []}
                          onChange={(e) => {
                            const selectedValues = e.target.value as unknown as string[];
                            field.onChange(selectedValues);
                            setFormData((prev) => ({
                              ...prev,
                              tax: selectedValues,
                            }));
                          }}
                          placeholder={Constants.adminConstants.selecttax}
                        >
                          {taxes.map((tax: any) => (
                            <WebComponents.UiComponents.UiWebComponents.FormOption key={tax._id} value={tax._id}>
                              {`${tax.taxName} - ${tax.value}${tax.valueType === "Percentage" ? "%" : ""
                                } (${tax.taxType})`}
                            </WebComponents.UiComponents.UiWebComponents.FormOption>
                          ))}
                        </WebComponents.UiComponents.UiWebComponents.FormDropdown>
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Row 5 removed: Expiry Details now lives inside Product Details */}

          {/* Row 6: Product Variations (Full Width) */}
          <div data-section="variations">
            <div className="bg-white dark:bg-transparent rounded-[4px] border-[0.6px] border-[#D8D9D9] dark:border-[#616161] p-3 sm:p-4 md:p-5 lg:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-5 md:mb-6">
                <h3 className="text-formHeading font-poppins text-sm sm:text-sm md:text-base font-semibold leading-4 dark:text-white">
                  {Constants.adminConstants.productvariations}
                </h3>
                <Controller
                  name="hasVariation"
                  control={control}
                  render={({ field }) => (
                    <WebComponents.UiComponents.UiWebComponents.Switch
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        field.onChange(checked);
                        // Clear regular pricing errors when toggling to variations
                        if (checked) {
                          setValue("productCostPrice", 0);
                          setValue("productSellingPrice", 0);
                          setValue("productDiscount", 0);
                          setValue("stock.0.quantity", 0);
                          setValue("tax", []);

                          // Clear any existing errors for these fields
                          clearErrors(["productCostPrice", "productSellingPrice", "productDiscount", "stock.0.quantity"]);
                        }

                        setFormData((prev) => {
                          const newData = {
                            ...prev,
                            hasVariation: checked,
                          };

                          // Clear values in state as well
                          if (checked) {
                            newData.productCostPrice = 0;
                            newData.productSellingPrice = 0;
                            newData.productDiscount = 0;
                            newData.tax = [];
                            if (newData.stock && newData.stock.length > 0) {
                              newData.stock[0].quantity = 0;
                            }
                          }

                          // If enabling variations and no variations exist, add the first one
                          if (
                            checked &&
                            (!prev.variantInventory ||
                              prev.variantInventory.length === 0)
                          ) {
                            newData.variantInventory = [
                              {
                                variantValue: "",
                                SKU: "",
                                quantity: 0,
                                costPrice: 0,
                                sellingPrice: 0,
                                image: null,
                                variantId: "",
                                discount: 0,
                                lowStockAlert: 0,
                              },
                            ];
                            setValue("variantInventory", newData.variantInventory.map(v => ({
                              variantValue: v.variantValue,
                              SKU: v.SKU,
                              quantity: v.quantity,
                              costPrice: v.costPrice,
                              sellingPrice: v.sellingPrice,
                              variantId: v.variantId || "",
                              image: v.image || null,
                              discount: v.discount || 0,
                              lowStockAlert: v.lowStockAlert || 0,
                            })));
                          }
                          return newData;
                        });
                      }}
                      className="data-[state=checked]:bg-blue-600"
                    />
                  )}
                />
              </div>



              {formData.hasVariation && (
                <div className="pt-2 sm:pt-2.5 md:pt-3">
                  {/* Tax field for all variations */}
                  <div className="mb-4 sm:mb-5 md:mb-6">
                    <WebComponents.UiComponents.UiWebComponents.FormLabel>{Constants.adminConstants.taxlabel}</WebComponents.UiComponents.UiWebComponents.FormLabel>
                    <Controller
                      name="tax"
                      control={control}
                      render={({ field }) => (
                        <WebComponents.UiComponents.UiWebComponents.FormDropdown
                          {...field}
                          multiselect
                          value={field.value || []}
                          onChange={(e) => {
                            const selectedValues = e.target.value as unknown as string[];
                            field.onChange(selectedValues);
                            setFormData((prev) => ({
                              ...prev,
                              tax: selectedValues,
                            }));
                          }}
                          placeholder={Constants.adminConstants.selecttax}
                        >
                          {taxes.map((tax: any) => (
                            <WebComponents.UiComponents.UiWebComponents.FormOption key={tax._id} value={tax._id}>
                              {`${tax.taxName} - ${tax.value}${tax.valueType === "Percentage" ? "%" : ""
                                } (${tax.taxType})`}
                            </WebComponents.UiComponents.UiWebComponents.FormOption>
                          ))}
                        </WebComponents.UiComponents.UiWebComponents.FormDropdown>
                      )}
                    />
                  </div>
                  {formData.variantInventory &&
                    formData.variantInventory.length > 0 && (
                      <div>
                        <div className="inline-block min-w-full align-middle">
                          <table className="min-w-full border border-gray-200 dark:border-gray-600 rounded-lg">
                            <thead className="bg-[#F7F7F7] dark:bg-[#333333]">
                              <tr>
                                {/* Product Image first */}
                                <th className="px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-xs sm:text-sm md:text-base text-left text-[#171B23] dark:text-white border-b border-gray-200 dark:border-gray-600">
                                  {Constants.adminConstants.productimage}
                                </th>
                                {/* Variation type & value */}
                                <th className="px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-xs sm:text-sm md:text-base text-left text-[#171B23] dark:text-white border-b border-gray-200 dark:border-gray-600">
                                  {Constants.adminConstants.variationtype} <span className="text-required">{Constants.adminConstants.requiredstar}</span>
                                </th>
                                <th className="px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-xs sm:text-sm md:text-base text-left text-[#171B23] dark:text-white border-b border-gray-200 dark:border-gray-600">
                                  {Constants.adminConstants.variationvalue} <span className="text-required">{Constants.adminConstants.requiredstar}</span>
                                </th>
                                {/* Rest of columns */}
                                <th className="px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-xs sm:text-sm md:text-base text-left text-[#171B23] dark:text-white border-b border-gray-200 dark:border-gray-600">
                                  SKU <span className="text-required">{Constants.adminConstants.requiredstar}</span>
                                </th>
                                <th className="px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-xs sm:text-sm md:text-base text-left text-[#171B23] dark:text-white border-b border-gray-200 dark:border-gray-600">
                                  {Constants.adminConstants.productquantity} <span className="text-required">{Constants.adminConstants.requiredstar}</span>
                                </th>
                                <th className="px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-xs sm:text-sm md:text-base text-left text-[#171B23] dark:text-white border-b border-gray-200 dark:border-gray-600">
                                  Low Stock Alert
                                </th>
                                <th className="px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-xs sm:text-sm md:text-base text-left text-[#171B23] dark:text-white border-b border-gray-200 dark:border-gray-600">
                                  {Constants.adminConstants.productcostprice} <span className="text-required">{Constants.adminConstants.requiredstar}</span>
                                </th>
                                <th className="px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-xs sm:text-sm md:text-base text-left text-[#171B23] dark:text-white border-b border-gray-200 dark:border-gray-600">
                                  {Constants.adminConstants.productsellingprice} <span className="text-required">{Constants.adminConstants.requiredstar}</span>
                                </th>
                                <th className="px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-xs sm:text-sm md:text-base text-left text-[#171B23] dark:text-white border-b border-gray-200 dark:border-gray-600">
                                  {Constants.adminConstants.discountlabel}
                                </th>
                                <th className="px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-xs sm:text-sm md:text-base text-left text-[#171B23] dark:text-white border-b border-gray-200 dark:border-gray-600">
                                  {Constants.adminConstants.actionslabel}
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {formData.variantInventory!.map(
                                (variation, index) => {
                                  const variantErrors = Array.isArray(errors.variantInventory)
                                    ? (errors.variantInventory as any)[index]
                                    : undefined;

                                  return (
                                    <tr
                                      key={index}
                                      className="border-b border-gray-200 dark:border-gray-600"
                                    >
                                      {/* Product Image first */}
                                      <td className="px-2 sm:px-3 md:px-4 py-1.5 sm:py-2">
                                        <div className="w-16 sm:w-20 md:w-24">
                                          <WebComponents.UiComponents.UiWebComponents.ImageCropUpload
                                            value={variation.image as any}
                                            onChange={(val: string | File | null) =>
                                              updateVariation(
                                                index,
                                                "image",
                                                val
                                              )
                                            }
                                            accept="image/*"
                                            aspect={1}
                                            shape="rect"
                                            previewMask="rect"
                                            compact
                                            uploadButtonText="Upload"
                                            removeButtonText="Remove"
                                            layout="vertical"
                                            useAdminUpload={true}
                                          />
                                        </div>
                                      </td>
                                      <td className="px-2 sm:px-3 md:px-4 py-1.5 sm:py-2">
                                        <Controller
                                          name={`variantInventory.${index}.variantId`}
                                          control={control}
                                          render={({ field }) => (
                                            <>
                                              <WebComponents.UiComponents.UiWebComponents.FormDropdown
                                                {...field}
                                                value={field.value || ""}
                                                onChange={(e: any) => {
                                                  const val = e.target.value;
                                                  field.onChange(val);
                                                  const selectedVariation = variations.find((v) => v.id === val || v._id === val);
                                                  updateVariation(index, "variantId", val);
                                                  updateVariation(index, "variantValue", "");
                                                  setValue(`variantInventory.${index}.variantValue`, "");
                                                }}
                                                className={variantErrors?.variantId ? "border-red-500" : ""}
                                              >
                                                <WebComponents.UiComponents.UiWebComponents.FormOption value="">
                                                  {Constants.adminConstants.selecttype}
                                                </WebComponents.UiComponents.UiWebComponents.FormOption>
                                                {variations.map((v) => (
                                                  <WebComponents.UiComponents.UiWebComponents.FormOption key={v.id || v._id} value={v.id || v._id}>
                                                    {v.variant}
                                                  </WebComponents.UiComponents.UiWebComponents.FormOption>
                                                ))}
                                              </WebComponents.UiComponents.UiWebComponents.FormDropdown>
                                              {variantErrors?.variantId && (
                                                <p className="mt-1 text-xs text-red-500">{variantErrors.variantId.message}</p>
                                              )}
                                            </>
                                          )}
                                        />
                                      </td>
                                      {/* Variation Value */}
                                      <td className="px-2 sm:px-3 md:px-4 py-1.5 sm:py-2">
                                        <Controller
                                          name={`variantInventory.${index}.variantValue`}
                                          control={control}
                                          render={({ field }) => (
                                            <>
                                              <WebComponents.UiComponents.UiWebComponents.FormDropdown
                                                {...field}
                                                value={field.value || ""}
                                                onChange={(e: any) => {
                                                  const val = e.target.value;
                                                  field.onChange(val);
                                                  updateVariation(index, "variantValue", val);
                                                  if (val && variation.variantId) {
                                                    const variationType = variations.find((v) => v.id === variation.variantId || v._id === variation.variantId)?.variant;
                                                    if (variationType) {
                                                      const generatedSKU = generateVariationSKU(val, variationType);
                                                      updateVariation(index, "SKU", generatedSKU);
                                                      // Fix: trigger validation when auto-filling SKU
                                                      setValue(`variantInventory.${index}.SKU`, generatedSKU, { shouldValidate: true });
                                                    }
                                                  }
                                                }}
                                                disabled={!variation.variantId}
                                                className={variantErrors?.variantValue ? "border-red-500" : ""}
                                              >
                                                <WebComponents.UiComponents.UiWebComponents.FormOption value="">
                                                  {Constants.adminConstants.selectvalue}
                                                </WebComponents.UiComponents.UiWebComponents.FormOption>
                                                {variation.variantId &&
                                                  variations.find((v) => (v.id || v._id) === variation.variantId)?.values.map((value, vIdx) => {
                                                    const vStr = typeof value === "string" ? value : (value as any).value;
                                                    return (
                                                      <WebComponents.UiComponents.UiWebComponents.FormOption key={vIdx} value={vStr}>
                                                        {vStr}
                                                      </WebComponents.UiComponents.UiWebComponents.FormOption>
                                                    );
                                                  })}
                                              </WebComponents.UiComponents.UiWebComponents.FormDropdown>
                                              {variantErrors?.variantValue && (
                                                <p className="mt-1 text-xs text-red-500">{variantErrors.variantValue.message}</p>
                                              )}
                                            </>
                                          )}
                                        />
                                      </td>
                                      <td className="px-2 sm:px-3 md:px-4 py-1.5 sm:py-2">
                                        <Controller
                                          name={`variantInventory.${index}.SKU`}
                                          control={control}
                                          render={({ field }) => (
                                            <>
                                              <WebComponents.UiComponents.UiWebComponents.FormInput
                                                {...field}
                                                value={field.value || ""}
                                                onChange={(e) => {
                                                  field.onChange(e.target.value);
                                                }}
                                                placeholder={Constants.adminConstants.autogenerated}
                                                className={variantErrors?.SKU ? "border-red-500" : ""}
                                              />
                                              {variantErrors?.SKU && (
                                                <p className="mt-1 text-xs text-red-500">{variantErrors.SKU.message}</p>
                                              )}
                                            </>
                                          )}
                                        />
                                      </td>
                                      <td className="px-2 sm:px-3 md:px-4 py-1.5 sm:py-2">
                                        <Controller
                                          name={`variantInventory.${index}.quantity`}
                                          control={control}
                                          render={({ field }) => (
                                            <>
                                              <WebComponents.UiComponents.UiWebComponents.FormInput
                                                {...field}
                                                type="number"
                                                min="0"
                                                step="1"
                                                value={field.value || 0}
                                                onChange={(e) => {
                                                  const val = parseInt(e.target.value) || 0;
                                                  field.onChange(val);
                                                }}
                                                placeholder="0"
                                                className={variantErrors?.quantity ? "border-red-500" : ""}
                                              />
                                              {variantErrors?.quantity && (
                                                <p className="mt-1 text-xs text-red-500 text-left">
                                                  {variantErrors.quantity.message}
                                                </p>
                                              )}
                                            </>
                                          )}
                                        />
                                      </td>
                                      <td className="px-2 sm:px-3 md:px-4 py-1.5 sm:py-2">
                                        <Controller
                                          name={`variantInventory.${index}.lowStockAlert`}
                                          control={control}
                                          render={({ field }) => (
                                            <>
                                              <WebComponents.UiComponents.UiWebComponents.FormInput
                                                {...field}
                                                type="number"
                                                min="0"
                                                step="1"
                                                value={field.value || 0}
                                                onChange={(e) => {
                                                  const val = parseInt(e.target.value) || 0;
                                                  field.onChange(val);
                                                }}
                                                placeholder="0"
                                                className={variantErrors?.lowStockAlert ? "border-red-500" : ""}
                                              />
                                              {variantErrors?.lowStockAlert && (
                                                <p className="mt-1 text-xs text-red-500 text-left">
                                                  {variantErrors.lowStockAlert.message}
                                                </p>
                                              )}
                                            </>
                                          )}
                                        />
                                      </td>
                                      <td className="px-2 sm:px-3 md:px-4 py-1.5 sm:py-2">
                                        <Controller
                                          name={`variantInventory.${index}.costPrice`}
                                          control={control}
                                          render={({ field }) => (
                                            <>
                                              <WebComponents.UiComponents.UiWebComponents.FormInput
                                                {...field}
                                                type="number"
                                                min="0"
                                                step="1"
                                                value={field.value || 0}
                                                onChange={(e) => {
                                                  const val = parseFloat(e.target.value) || 0;
                                                  field.onChange(val);
                                                }}
                                                placeholder="0"
                                                className={variantErrors?.costPrice ? "border-red-500" : ""}
                                              />
                                              {variantErrors?.costPrice && (
                                                <p className="mt-1 text-xs text-red-500 text-left">
                                                  {variantErrors.costPrice.message}
                                                </p>
                                              )}
                                            </>
                                          )}
                                        />
                                      </td>
                                      <td className="px-2 sm:px-3 md:px-4 py-1.5 sm:py-2">
                                        <Controller
                                          name={`variantInventory.${index}.sellingPrice`}
                                          control={control}
                                          render={({ field }) => (
                                            <>
                                              <WebComponents.UiComponents.UiWebComponents.FormInput
                                                {...field}
                                                type="number"
                                                min="0"
                                                step="1"
                                                value={field.value || 0}
                                                onChange={(e) => {
                                                  const val = parseFloat(e.target.value) || 0;
                                                  field.onChange(val);
                                                }}
                                                placeholder="0"
                                                className={variantErrors?.sellingPrice ? "border-red-500" : ""}
                                              />
                                              {variantErrors?.sellingPrice && (
                                                <p className="mt-1 text-xs text-red-500 text-left">
                                                  {variantErrors.sellingPrice.message}
                                                </p>
                                              )}
                                            </>
                                          )}
                                        />
                                      </td>
                                      <td className="px-2 sm:px-3 md:px-4 py-1.5 sm:py-2">
                                        <Controller
                                          name={`variantInventory.${index}.discount`}
                                          control={control}
                                          render={({ field }) => (
                                            <>
                                              <WebComponents.UiComponents.UiWebComponents.FormInput
                                                {...field}
                                                type="number"
                                                min="0"
                                                step="1"
                                                value={Number(field.value) || 0}
                                                onChange={(e) => {
                                                  const val = parseFloat(e.target.value) || 0;
                                                  field.onChange(val);
                                                }}
                                                placeholder="0"
                                                className={variantErrors?.discount ? "border-red-500" : ""}
                                              />
                                              {variantErrors?.discount && (
                                                <p className="mt-1 text-xs text-red-500 text-left">
                                                  {variantErrors.discount.message}
                                                </p>
                                              )}
                                            </>
                                          )}
                                        />
                                      </td>
                                      <td className="px-2 sm:px-3 md:px-4 py-1.5 sm:py-2">
                                        <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2">
                                          <WebComponents.UiComponents.UiWebComponents.Button
                                            type="button"
                                            onClick={addVariation}
                                            className="bg-blue-600 hover:bg-blue-700 text-white p-1.5 sm:p-2 h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 flex items-center justify-center rounded"
                                            title="Add Variation"
                                          >
                                            <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
                                          </WebComponents.UiComponents.UiWebComponents.Button>
                                          {formData.variantInventory &&
                                            formData.variantInventory.length >
                                            0 && (
                                              <WebComponents.UiComponents.UiWebComponents.Button
                                                type="button"
                                                onClick={() =>
                                                  removeVariation(index)
                                                }
                                                className="bg-red-600 hover:bg-red-700 text-white p-1.5 sm:p-2 h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 flex items-center justify-center rounded"
                                                title="Delete Variation"
                                              >
                                                <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
                                              </WebComponents.UiComponents.UiWebComponents.Button>
                                            )}
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                </div>
              )}
            </div>
          </div>
        </div>
      </form >
    </div >
  );
}


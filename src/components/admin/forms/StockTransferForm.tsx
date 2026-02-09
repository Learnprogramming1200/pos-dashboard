"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { ServerActions } from "@/lib";
import { stockTransferFormSchema } from "@/app/validation/ValidationSchema";
import { WebComponents } from "@/components";
import { AdminTypes } from "@/types";

interface StockTransferFormProps {
  title: string;
  stores: AdminTypes.StockTypes.Options.StoreOption[];
  products: AdminTypes.StockTypes.Options.ProductOption[];
  categories: AdminTypes.StockTypes.Options.CategoryOption[];
  subcategories: AdminTypes.StockTypes.Options.SubcategoryOption[];
  defaultValues?: AdminTypes.StockTypes.Forms.TransferFormData;
  onClose: () => void;
  onSubmit: (data: AdminTypes.StockTypes.Forms.TransferFormData) => void;
}

type FormData = Yup.InferType<typeof stockTransferFormSchema>;

export default function StockTransferForm({
  title,
  stores,
  products: initialProducts,
  categories,
  subcategories,
  defaultValues,
  onClose,
  onSubmit
}: StockTransferFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
    setValue,
    reset,
    setError,
    clearErrors,
    trigger,
  } = useForm<FormData>({
    resolver: yupResolver(stockTransferFormSchema) as any,
    mode: "onChange",
    defaultValues: {
      fromStoreId: defaultValues?.fromStoreId || "",
      toStoreId: defaultValues?.toStoreId || "",
      categoryId: defaultValues?.categoryId || "",
      subCategoryId: defaultValues?.subCategoryId || "",
      productId: defaultValues?.productId || "",
      variant: defaultValues?.variant || "",
      SKU: defaultValues?.SKU || "",
      quantity: defaultValues?.quantity || 0,
      reason: defaultValues?.reason || "",
      status: defaultValues?.status || "pending",
    },
  });

  // Watch form values for dependencies
  const fromStoreId = watch("fromStoreId");
  const toStoreId = watch("toStoreId");
  const categoryId = watch("categoryId");
  const subCategoryId = watch("subCategoryId");
  const productId = watch("productId");
  const variant = watch("variant");

  const [products, setProducts] = React.useState<AdminTypes.StockTypes.Options.ProductOption[]>(initialProducts);
  const [loadingProducts, setLoadingProducts] = React.useState(false);

  React.useEffect(() => {
    const fetchProducts = async () => {
      if (!fromStoreId) {
        return;
      }

      setLoadingProducts(true);
      try {
        const result = await ServerActions.ServerActionslib.getActiveProductsByStoreAction(fromStoreId);
        const productsData = result.data?.data?.products || result.data?.data || result.data || [];

        const rawProducts = Array.isArray(productsData) ? productsData : [];

        if (result.success) {
          const mappedProducts = rawProducts.map((product: any) => {
            // Find category ID by matching categoryName
            const catId = categories.find(cat => cat.name === product.category?.categoryName)?.id || '';

            // Find subcategory ID by matching subcategory name
            const subcatId = subcategories.find(sub => sub.name === product.subCategory?.subcategory)?.id || '';

            // Extract variants from variantData
            const variants: string[] = [];
            if (product.hasVariation && Array.isArray(product.variantData) && product.variantData.length > 0) {
              product.variantData.forEach((variant: any) => {
                if (variant.variantTitle) {
                  variants.push(variant.variantTitle);
                }
              });
            }

            const currentQty = product.stock?.totalStock ?? product.totalQuantity ?? 0;

            return {
              id: product._id || product.id || '',
              name: product.productName || product.name || product.product?.productName || product.product?.name || '',
              sku: product.SKU || product.sku || product.product?.SKU || product.product?.sku || '',
              currentQty: typeof currentQty === 'number' ? currentQty : 0,
              categoryId: catId,
              subcategoryId: subcatId || undefined,
              companyName: product.brand?.brand || product.companyName || product.product?.brand?.brand || product.product?.companyName || '',
              variants: variants.length > 0 ? variants : undefined,
              variantData: product.hasVariation ? product.variantData : undefined,
            };
          }).filter((product: AdminTypes.StockTypes.Options.ProductOption) => product.id && product.name);

          setProducts(mappedProducts);
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoadingProducts(false);
      }
    };

    if (fromStoreId) {
      fetchProducts();
    }
  }, [fromStoreId, categories, subcategories]);

  // Filter products based on selected category and subcategory
  const filteredProducts = React.useMemo(() => {
    return products.filter(p => {
      // Must match category
      if (p.categoryId !== categoryId) {
        return false;
      }
      // If subcategory is selected, must match subcategory
      if (subCategoryId && p.subcategoryId !== subCategoryId) {
        return false;
      }
      return true;
    });
  }, [products, categoryId, subCategoryId]);

  // Filter stores: exclude selected store from the other dropdown
  const availableFromStores = React.useMemo(() => {
    return stores.filter(store => store.id !== toStoreId);
  }, [stores, toStoreId]);

  const availableToStores = React.useMemo(() => {
    return stores.filter(store => store.id !== fromStoreId);
  }, [stores, fromStoreId]);

  // Handle form submit with custom variant validation
  const onSubmitForm = async (data: FormData) => {
    // Validate variant before submitting if product has variants
    if (productId) {
      const selectedProduct = products.find(p => p.id === productId);
      const hasVariants = selectedProduct?.variants && selectedProduct.variants.length > 0;

      // Check if variant is empty (empty string, null, or undefined)
      const variantValue = data.variant || "";
      const variantEmpty = !variantValue || (typeof variantValue === "string" && variantValue.trim() === "");

      if (hasVariants && variantEmpty) {
        setError("variant", {
          type: "manual",
          message: "Variant is required for products with variants",
        });
        // Trigger validation to show the error
        await trigger("variant");
        return; // Prevent submission
      }
    }

    // Clear any variant errors if validation passes
    clearErrors("variant");

    // Helper function to safely check and format optional string fields
    const formatOptionalString = (value: string | undefined | null): string | undefined => {
      if (!value) return undefined;
      const trimmed = typeof value === "string" ? value.trim() : String(value).trim();
      return trimmed !== "" ? trimmed : undefined;
    };

    // Format data to ensure optional fields are properly handled
    // Convert empty strings to undefined for optional fields, but keep required fields as strings
    const formattedData: any = {
      fromStoreId: data.fromStoreId || "",
      toStoreId: data.toStoreId || "",
      categoryId: data.categoryId || "",
      productId: data.productId || "",
      quantity: typeof data.quantity === "number" ? data.quantity : Number(data.quantity) || 0,
      status: data.status || "pending",
    };

    // Only include optional fields if they have values (omit undefined)
    const subCategoryId = formatOptionalString(data.subCategoryId);
    if (subCategoryId !== undefined) {
      formattedData.subCategoryId = subCategoryId;
    }

    const variant = formatOptionalString(data.variant);
    if (variant !== undefined) {
      formattedData.variant = variant;
    }

    const SKU = formatOptionalString(data.SKU);
    if (SKU !== undefined) {
      formattedData.SKU = SKU;
    }

    const reason = formatOptionalString(data.reason);
    if (reason !== undefined) {
      formattedData.reason = reason;
    }

    onSubmit(formattedData as AdminTypes.StockTypes.Forms.TransferFormData);
  };

  // Sync form when defaultValues change
  React.useEffect(() => {
    if (defaultValues) {
      reset({
        fromStoreId: defaultValues.fromStoreId || "",
        toStoreId: defaultValues.toStoreId || "",
        categoryId: defaultValues.categoryId || "",
        subCategoryId: defaultValues.subCategoryId || "",
        productId: defaultValues.productId || "",
        variant: defaultValues.variant || "",
        SKU: defaultValues.SKU || "",
        quantity: defaultValues.quantity || 0,
        reason: defaultValues.reason || "",
        status: defaultValues.status || "pending",
      });
    }
  }, [defaultValues, reset]);

  // Validate variant field when productId or variant changes
  React.useEffect(() => {
    // Don't validate if products are still loading
    if (loadingProducts) {
      return;
    }

    if (productId && products.length > 0) {
      const selectedProduct = products.find(p => p.id === productId);
      const hasVariants = selectedProduct?.variants && selectedProduct.variants.length > 0;

      if (hasVariants && !variant) {
        setError("variant", {
          type: "manual",
          message: "Variant is required for products with variants",
        });
      } else {
        clearErrors("variant");
      }
    } else if (!productId) {
      // Clear errors when no product is selected
      clearErrors("variant");
    }
  }, [productId, variant, products, loadingProducts, setError, clearErrors]);

  return (
    <>
      {/* Form Content */}
      <div className="bg-white dark:bg-darkFilterbar rounded-[4px] mt-4">
        <form id="transfer-form" onSubmit={handleSubmit(onSubmitForm)}>
          <div className="p-4 sm:p-5 md:p-6 lg:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                <div>
                  <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="fromStore">From Store <span className="text-red-500">*</span></WebComponents.UiComponents.UiWebComponents.FormLabel>
                  <Controller
                    name="fromStoreId"
                    control={control}
                    render={({ field, fieldState }) => (
                      <>
                        <WebComponents.UiComponents.UiWebComponents.FormDropdown
                          id="fromStore"
                          name="fromStore"
                          value={field.value}
                          onChange={(e) => {
                            const newFromStoreId = e.target.value;
                            // If the new from store is the same as to store, clear to store
                            if (newFromStoreId === toStoreId) {
                              field.onChange(newFromStoreId);
                              setValue("toStoreId", "", { shouldValidate: true });
                            } else {
                              field.onChange(newFromStoreId);
                            }
                          }}
                          className={fieldState.invalid ? "border-red-500" : ""}
                        >
                          <WebComponents.UiComponents.UiWebComponents.FormOption value="">Select Store</WebComponents.UiComponents.UiWebComponents.FormOption>
                          {availableFromStores.map(s => <WebComponents.UiComponents.UiWebComponents.FormOption key={s.id} value={s.id}>{s.name}</WebComponents.UiComponents.UiWebComponents.FormOption>)}
                        </WebComponents.UiComponents.UiWebComponents.FormDropdown>
                        {fieldState.error && (
                          <p className="mt-1 text-sm text-red-500">{fieldState.error.message}</p>
                        )}
                      </>
                    )}
                  />
                </div>

                <div>
                  <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="category">Category <span className="text-red-500">*</span></WebComponents.UiComponents.UiWebComponents.FormLabel>
                  <Controller
                    name="categoryId"
                    control={control}
                    render={({ field, fieldState }) => (
                      <>
                        <WebComponents.UiComponents.UiWebComponents.FormDropdown
                          id="category"
                          name="category"
                          value={field.value}
                          onChange={(e) => {
                            field.onChange(e.target.value);
                            setValue("subCategoryId", "", { shouldValidate: false });
                            setValue("productId", "", { shouldValidate: false });
                          }}

                          className={fieldState.invalid ? "border-red-500" : ""}
                        >
                          <WebComponents.UiComponents.UiWebComponents.FormOption value="">Select Category</WebComponents.UiComponents.UiWebComponents.FormOption>
                          {categories.map(c => <WebComponents.UiComponents.UiWebComponents.FormOption key={c.id} value={c.id}>{c.name}</WebComponents.UiComponents.UiWebComponents.FormOption>)}
                        </WebComponents.UiComponents.UiWebComponents.FormDropdown>
                        {fieldState.error && (
                          <p className="mt-1 text-sm text-red-500">{fieldState.error.message}</p>
                        )}
                      </>
                    )}
                  />
                </div>

                {/* Product Column */}
                <div>
                  <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="product">Product <span className="text-red-500">*</span></WebComponents.UiComponents.UiWebComponents.FormLabel>
                  <Controller
                    name="productId"
                    control={control}
                    render={({ field, fieldState }) => {

                      return (
                        <>
                          <WebComponents.UiComponents.UiWebComponents.FormDropdown
                            id="product"
                            name="product"
                            value={field.value}
                            onChange={(e) => {
                              const selectedProductId = e.target.value;
                              const product = products.find(p => p.id === selectedProductId);
                              // Auto-populate SKU for non-variant products
                              let sku = '';
                              if (product && !product.variants) {
                                sku = product.sku || '';
                              }

                              field.onChange(selectedProductId);
                              setValue("variant", "", { shouldValidate: false });
                              setValue("SKU", sku, { shouldValidate: false });
                              if (product?.subcategoryId) {
                                setValue("subCategoryId", product.subcategoryId, { shouldValidate: false });
                              }
                            }}

                            disabled={!categoryId || loadingProducts}
                            className={fieldState.invalid ? "border-red-500" : ""}
                          >
                            <WebComponents.UiComponents.UiWebComponents.FormOption value="">
                              {loadingProducts ? "Loading Products..." :
                                !categoryId ? "Select Category First" : "Select Product"}
                            </WebComponents.UiComponents.UiWebComponents.FormOption>
                            {filteredProducts.map(p => <WebComponents.UiComponents.UiWebComponents.FormOption key={p.id} value={p.id}>{`${p.name} ${p.companyName ? `- ${p.companyName}` : ""} (${p.currentQty})`}</WebComponents.UiComponents.UiWebComponents.FormOption>)}
                          </WebComponents.UiComponents.UiWebComponents.FormDropdown>
                          {fieldState.error && (
                            <p className="mt-1 text-sm text-red-500">{fieldState.error.message}</p>
                          )}
                        </>
                      );
                    }}
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div>
                  <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="toStore">To Store <span className="text-red-500">*</span></WebComponents.UiComponents.UiWebComponents.FormLabel>
                  <Controller
                    name="toStoreId"
                    control={control}
                    render={({ field, fieldState }) => (
                      <>
                        <WebComponents.UiComponents.UiWebComponents.FormDropdown
                          id="toStore"
                          name="toStore"
                          value={field.value}
                          onChange={(e) => {
                            const newToStoreId = e.target.value;
                            // If the new to store is the same as from store, clear from store
                            if (newToStoreId === fromStoreId) {
                              field.onChange(newToStoreId);
                              setValue("fromStoreId", "", { shouldValidate: true });
                            } else {
                              field.onChange(newToStoreId);
                            }
                          }}
                          className={fieldState.invalid ? "border-red-500" : ""}
                        >
                          <WebComponents.UiComponents.UiWebComponents.FormOption value="">Select Store</WebComponents.UiComponents.UiWebComponents.FormOption>
                          {availableToStores.map(s => <WebComponents.UiComponents.UiWebComponents.FormOption key={s.id} value={s.id}>{s.name}</WebComponents.UiComponents.UiWebComponents.FormOption>)}
                        </WebComponents.UiComponents.UiWebComponents.FormDropdown>
                        {fieldState.error && (
                          <p className="mt-1 text-sm text-red-500">{fieldState.error.message}</p>
                        )}
                      </>
                    )}
                  />
                </div>

                <div>
                  <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="subcategory">Subcategory<span className="text-red-500">*</span></WebComponents.UiComponents.UiWebComponents.FormLabel>
                  <Controller
                    name="subCategoryId"
                    control={control}
                    render={({ field, fieldState }) => (
                      <>
                        <WebComponents.UiComponents.UiWebComponents.FormDropdown
                          id="subcategory"
                          name="subcategory"
                          value={field.value || ""}
                          onChange={(e) => {
                            field.onChange(e.target.value);
                            setValue("productId", "", { shouldValidate: false });
                          }}
                          disabled={!categoryId || subcategories.filter(sc => sc.categoryId === categoryId).length === 0}
                          className={fieldState.invalid ? "border-red-500" : ""}
                        >
                          <WebComponents.UiComponents.UiWebComponents.FormOption value="">
                            {!categoryId ? "Select Category First" :
                              subcategories.filter(sc => sc.categoryId === categoryId).length === 0 ? "No Subcategories" :
                                "Select Subcategory"}
                          </WebComponents.UiComponents.UiWebComponents.FormOption>
                          {categoryId && subcategories.filter(sc => sc.categoryId === categoryId).map(sc => (
                            <WebComponents.UiComponents.UiWebComponents.FormOption key={sc.id} value={sc.id}>{sc.name}</WebComponents.UiComponents.UiWebComponents.FormOption>
                          ))}
                        </WebComponents.UiComponents.UiWebComponents.FormDropdown>
                        {fieldState.error && (
                          <p className="mt-1 text-sm text-red-500">{fieldState.error.message}</p>
                        )}
                      </>
                    )}
                  />
                </div>

                {/* Conditionally render Variant or Quantity based on product variants */}
                {(() => {
                  const selectedProduct = products.find(p => p.id === productId);
                  const hasVariants = selectedProduct?.variants && selectedProduct.variants.length > 0;

                  if (hasVariants) {
                    // Show Variant field when product has variants
                    return (
                      <div>
                        <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="variant">
                          Variant<span className="text-red-500"> *</span>
                        </WebComponents.UiComponents.UiWebComponents.FormLabel>
                        <Controller
                          name="variant"
                          control={control}
                          render={({ field, fieldState }) => (
                            <>
                              <WebComponents.UiComponents.UiWebComponents.FormDropdown
                                id="variant"
                                name="variant"
                                value={field.value || ""}
                                onChange={(e) => {
                                  const selectedVariant = e.target.value;
                                  const product = products.find(p => p.id === productId);

                                  // Auto-populate SKU for variant products
                                  let sku = '';
                                  if (product && selectedVariant && product.variantData) {
                                    const variantData = product.variantData.find((v: any) => v.variantTitle === selectedVariant);
                                    sku = variantData?.SKU || variantData?.sku || '';
                                  }

                                  field.onChange(selectedVariant);
                                  setValue("SKU", sku, { shouldValidate: false });

                                  // Clear error when variant is selected
                                  if (selectedVariant) {
                                    clearErrors("variant");
                                  }
                                }}
                                className={fieldState.invalid ? "border-red-500" : ""}
                              >
                                <WebComponents.UiComponents.UiWebComponents.FormOption value="">
                                  Select Variant
                                </WebComponents.UiComponents.UiWebComponents.FormOption>
                                {selectedProduct?.variants?.map(variant => (
                                  <WebComponents.UiComponents.UiWebComponents.FormOption key={variant} value={variant}>{variant}</WebComponents.UiComponents.UiWebComponents.FormOption>
                                ))}
                              </WebComponents.UiComponents.UiWebComponents.FormDropdown>
                              {fieldState.error && (
                                <p className="mt-1 text-sm text-red-500">{fieldState.error.message}</p>
                              )}
                            </>
                          )}
                        />
                      </div>
                    );
                  } else {
                    // Show Quantity field when product has no variants
                    return (
                      <div>
                        <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="quantity">Quantity <span className="text-red-500">*</span></WebComponents.UiComponents.UiWebComponents.FormLabel>
                        <WebComponents.UiComponents.UiWebComponents.FormInput
                          id="quantity"
                          type="number"
                          placeholder="e.g. 10"
                          {...register("quantity", {
                            valueAsNumber: true,
                            onChange: (e) => {
                              const val = Number(e.target.value);
                              if (val < 0) {
                                setValue("quantity", 0, { shouldValidate: true });
                              }
                            }
                          })}
                          className={errors.quantity ? "border-red-500" : ""}
                        />
                        {errors.quantity && (
                          <p className="mt-1 text-sm text-red-500">{errors.quantity.message}</p>
                        )}
                      </div>
                    );
                  }
                })()}
              </div>
            </div>

            {/* Reason and Quantity Row - Conditionally rendered based on variant existence */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {/* Show Quantity here only if product has variants (otherwise it's shown above) */}
              {(() => {
                const selectedProduct = products.find(p => p.id === productId);
                const hasVariants = selectedProduct?.variants && selectedProduct.variants.length > 0;

                if (hasVariants) {
                  return (
                    <div>
                      <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="quantity-with-variant">Quantity <span className="text-red-500">*</span></WebComponents.UiComponents.UiWebComponents.FormLabel>
                      <WebComponents.UiComponents.UiWebComponents.FormInput
                        id="quantity-with-variant"
                        type="number"
                        placeholder="e.g. 10"
                        {...register("quantity", {
                          valueAsNumber: true,
                          onChange: (e) => {
                            const val = Number(e.target.value);
                            if (val < 0) {
                              setValue("quantity", 0, { shouldValidate: true });
                            }
                          }
                        })}
                        className={errors.quantity ? "border-red-500" : ""}
                      />
                      {errors.quantity && (
                        <p className="mt-1 text-sm text-red-500">{errors.quantity.message}</p>
                      )}
                    </div>
                  );
                }
                return null;
              })()}

              <div>
                <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="reason">Transfer Reason<span className="text-red-500">*</span></WebComponents.UiComponents.UiWebComponents.FormLabel>
                <Controller
                  name="reason"
                  control={control}
                  render={({ field, fieldState }) => (
                    <>
                      <WebComponents.UiComponents.UiWebComponents.Textarea
                        id="reason"
                        name="reason"
                        placeholder="Why transfer?"
                        value={field.value || ""}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => field.onChange(e.target.value)}
                        rows={3}
                        maxLength={250}
                        charCounter={false}
                        className={`dark:text-gray-400 border ${fieldState.invalid ? "border-red-500" : ""}`}
                      />
                      <div className="flex justify-between items-center mt-1">
                        <div>
                          {fieldState.error && (
                            <p className="text-sm text-red-500">{fieldState.error.message}</p>
                          )}
                        </div>
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
          Cancel
        </WebComponents.UiComponents.UiWebComponents.Button>
        <WebComponents.UiComponents.UiWebComponents.Button
          variant="save"
          type="submit"
          form="transfer-form"
          // disabled={disableSubmit}
          aria-label="Save transfer"
        >
          Save
        </WebComponents.UiComponents.UiWebComponents.Button>
      </div>
    </>
  );
}


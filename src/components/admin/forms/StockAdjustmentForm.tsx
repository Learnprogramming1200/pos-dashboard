"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { ServerActions } from "@/lib";
import { stockAdjustmentFormSchema } from "@/app/validation/ValidationSchema";
import { WebComponents } from "@/components";
import { AdminTypes } from "@/types";

interface StockAdjustmentFormProps {
    title: string;
    stores: AdminTypes.StockTypes.Options.StoreOption[];
    products: AdminTypes.StockTypes.Options.ProductOption[];
    categories: AdminTypes.StockTypes.Options.CategoryOption[];
    subcategories: AdminTypes.StockTypes.Options.SubcategoryOption[];
    defaultValues?: AdminTypes.StockTypes.Forms.AdjustmentFormData;
    onClose: () => void;
    onSubmit: (data: AdminTypes.StockTypes.Forms.AdjustmentFormData) => void;
}

type FormData = Yup.InferType<typeof stockAdjustmentFormSchema>;
export default function StockAdjustmentForm({
    title,
    stores,
    products: initialProducts,
    categories,
    subcategories,
    defaultValues,
    onClose,
    onSubmit
}: StockAdjustmentFormProps) {
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
        resolver: yupResolver(stockAdjustmentFormSchema) as any,
        mode: "onChange",
        defaultValues: {
            storeId: defaultValues?.storeId || "",
            categoryId: defaultValues?.categoryId || "",
            subcategoryId: defaultValues?.subcategoryId || "",
            productId: defaultValues?.productId || "",
            variant: defaultValues?.variant || "",
            actualStock: defaultValues?.actualStock ?? 0,
            reason: defaultValues?.reason || "",
        },
    });

    const storeId = watch("storeId");
    const categoryId = watch("categoryId");
    const subcategoryId = watch("subcategoryId");
    const productId = watch("productId");
    const variant = watch("variant");

    const [products, setProducts] = React.useState<AdminTypes.StockTypes.Options.ProductOption[]>(initialProducts);
    const [rawProducts, setRawProducts] = React.useState<any[]>([]);
    const [loadingProducts, setLoadingProducts] = React.useState(false);

    // Sync local products with props when parent updates
    React.useEffect(() => {
        if (initialProducts.length > 0) {
            setProducts(initialProducts);
        }
    }, [initialProducts]);
    React.useEffect(() => {
        const fetchProducts = async () => {
            if (!storeId) return;

            setLoadingProducts(true);
            try {
                const result = await ServerActions.ServerActionslib.getActiveProductsByStoreAction(storeId);
                if (result.success) {
                    const productsData = result.data?.data?.products || result.data?.data || result.data || [];
                    setRawProducts(Array.isArray(productsData) ? productsData : []);
                }
            } catch (error) {
                console.error("Failed to fetch products:", error);
            } finally {
                setLoadingProducts(false);
            }
        };

        if (storeId) {
            fetchProducts();
        }
    }, [storeId]);

    React.useEffect(() => {
        if (rawProducts.length === 0) return;

        const mappedProducts = rawProducts.map((product: any) => {
            const catId = categories.find(cat => cat.name === product.category?.categoryName)?.id || '';
            const subcatId = subcategories.find(sub => sub.name === product.subCategory?.subcategory)?.id || '';

            const variants: string[] = [];
            if (product.hasVariation && Array.isArray(product.variantData) && product.variantData.length > 0) {
                product.variantData.forEach((v: any) => {
                    const title = v.variantTitle || v.variantValues?.[0]?.value;
                    if (title) variants.push(title);
                });
            }

            const currentQty = product.stock?.totalStock ?? product.totalQuantity ?? 0;

            return {
                id: product._id || product.id || '',
                name: product.productName || product.name || '',
                sku: product.SKU || product.sku || '',
                currentQty: typeof currentQty === 'number' ? currentQty : 0,
                categoryId: catId,
                subcategoryId: subcatId || undefined,
                companyName: product.brand?.brand || product.companyName || '',
                variants: variants.length > 0 ? variants : undefined,
                variantData: product.hasVariation ? product.variantData : undefined,
            };
        }).filter((p: any) => p.id && p.name);

        setProducts(mappedProducts);
    }, [rawProducts, categories, subcategories]);

    const filteredProducts = React.useMemo(() => {
        return products.filter(p => {
            if (p.categoryId !== categoryId) return false;
            if (subcategoryId && p.subcategoryId !== subcategoryId) return false;
            return true;
        });
    }, [products, categoryId, subcategoryId]);

    const selectedProduct = React.useMemo(() => products.find(p => p.id === productId), [products, productId]);
    const hasVariants = !!(selectedProduct?.variants && selectedProduct.variants.length > 0);
    // Variant clearing logic is handled by manual dropdown changes

    const onSubmitForm = async (data: FormData) => {
        if (productId && hasVariants && !data.variant) {
            setError("variant", { type: "manual", message: "Variant is required" });
            await trigger("variant");
            return;
        }
        clearErrors("variant");
        const currentQty = selectedProduct?.currentQty || 0;
        onSubmit({
            ...data,
            currentQty,
            subcategoryId: data.subcategoryId || undefined,
            variant: hasVariants ? (data.variant || undefined) : undefined,
        } as AdminTypes.StockTypes.Forms.AdjustmentFormData);
    };

    React.useEffect(() => {
        if (defaultValues) {
            reset({
                storeId: defaultValues.storeId || "",
                categoryId: defaultValues.categoryId || "",
                subcategoryId: defaultValues.subcategoryId || "",
                productId: defaultValues.productId || "",
                variant: defaultValues.variant || "",
                actualStock: defaultValues.actualStock ?? 0,
                reason: defaultValues.reason || "",
            });
        }
    }, [defaultValues, reset]);

    return (
        <>
            <div className="bg-white dark:bg-darkFilterbar rounded-[4px] mt-4">
                <form id="adjustment-form" onSubmit={handleSubmit(onSubmitForm)}>
                    <div className="p-4 sm:p-5 md:p-6 lg:p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="store">Store <span className="text-red-500">*</span></WebComponents.UiComponents.UiWebComponents.FormLabel>
                                <Controller
                                    name="storeId"
                                    control={control}
                                    render={({ field, fieldState }) => (
                                        <>
                                            <WebComponents.UiComponents.UiWebComponents.FormDropdown
                                                {...field}
                                                value={field.value ?? ""}
                                                id="store"
                                                className={fieldState.invalid ? "border-red-500" : ""}
                                            >
                                                <WebComponents.UiComponents.UiWebComponents.FormOption value="">Select Store</WebComponents.UiComponents.UiWebComponents.FormOption>
                                                {stores.map(s => <WebComponents.UiComponents.UiWebComponents.FormOption key={s.id} value={s.id}>{s.name}</WebComponents.UiComponents.UiWebComponents.FormOption>)}
                                            </WebComponents.UiComponents.UiWebComponents.FormDropdown>
                                            {fieldState.error && <p className="mt-1 text-sm text-red-500">{fieldState.error.message}</p>}
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
                                                {...field}
                                                value={field.value ?? ""}
                                                id="category"
                                                onChange={(e) => {
                                                    field.onChange(e.target.value);
                                                    setValue("subcategoryId", "");
                                                    setValue("productId", "");
                                                }}
                                                className={fieldState.invalid ? "border-red-500" : ""}
                                            >
                                                <WebComponents.UiComponents.UiWebComponents.FormOption value="">Select Category</WebComponents.UiComponents.UiWebComponents.FormOption>
                                                {categories.map(c => <WebComponents.UiComponents.UiWebComponents.FormOption key={c.id} value={c.id}>{c.name}</WebComponents.UiComponents.UiWebComponents.FormOption>)}
                                            </WebComponents.UiComponents.UiWebComponents.FormDropdown>
                                            {fieldState.error && <p className="mt-1 text-sm text-red-500">{fieldState.error.message}</p>}
                                        </>
                                    )}
                                />
                            </div>

                            <div>
                                <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="subcategory">Subcategory <span className="text-red-500">*</span></WebComponents.UiComponents.UiWebComponents.FormLabel>
                                <Controller
                                    name="subcategoryId"
                                    control={control}
                                    render={({ field, fieldState }) => (
                                        <>
                                            <WebComponents.UiComponents.UiWebComponents.FormDropdown
                                                {...field}
                                                value={field.value ?? ""}
                                                id="subcategory"
                                                onChange={(e) => {
                                                    field.onChange(e.target.value);
                                                    setValue("productId", "");
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
                                            {fieldState.error && <p className="mt-1 text-sm text-red-500">{fieldState.error.message}</p>}
                                        </>
                                    )}
                                />
                            </div>

                            <div>
                                <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="product">Product <span className="text-red-500">*</span></WebComponents.UiComponents.UiWebComponents.FormLabel>
                                <Controller
                                    name="productId"
                                    control={control}
                                    render={({ field, fieldState }) => (
                                        <>
                                            <WebComponents.UiComponents.UiWebComponents.FormDropdown
                                                {...field}
                                                value={field.value ?? ""}
                                                id="product"
                                                onChange={(e) => {
                                                    field.onChange(e.target.value);
                                                    setValue("variant", "");
                                                }}
                                                disabled={!categoryId || loadingProducts}
                                                className={fieldState.invalid ? "border-red-500" : ""}
                                            >
                                                <WebComponents.UiComponents.UiWebComponents.FormOption value="">
                                                    {loadingProducts ? "Loading..." : !categoryId ? "Select Category First" : "Select Product"}
                                                </WebComponents.UiComponents.UiWebComponents.FormOption>
                                                {filteredProducts.map(p => (
                                                    <WebComponents.UiComponents.UiWebComponents.FormOption key={p.id} value={p.id}>
                                                        {`${p.name} ${p.companyName ? `- ${p.companyName}` : ""} (${p.currentQty})`}
                                                    </WebComponents.UiComponents.UiWebComponents.FormOption>
                                                ))}
                                            </WebComponents.UiComponents.UiWebComponents.FormDropdown>
                                            {fieldState.error && <p className="mt-1 text-sm text-red-500">{fieldState.error.message}</p>}
                                        </>
                                    )}
                                />
                            </div>

                            {hasVariants && (
                                <div>
                                    <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="variant">Variant <span className="text-red-500">*</span></WebComponents.UiComponents.UiWebComponents.FormLabel>
                                    <Controller
                                        name="variant"
                                        control={control}
                                        render={({ field, fieldState }) => (
                                            <>
                                                <WebComponents.UiComponents.UiWebComponents.FormDropdown
                                                    {...field}
                                                    value={field.value ?? ""}
                                                    id="variant"
                                                    disabled={!productId}
                                                    className={fieldState.invalid ? "border-red-500" : ""}
                                                >
                                                    <WebComponents.UiComponents.UiWebComponents.FormOption value="">
                                                        Select Variant
                                                    </WebComponents.UiComponents.UiWebComponents.FormOption>
                                                    {productId && selectedProduct?.variants?.map(v => (
                                                        <WebComponents.UiComponents.UiWebComponents.FormOption key={v} value={v}>{v}</WebComponents.UiComponents.UiWebComponents.FormOption>
                                                    ))}
                                                </WebComponents.UiComponents.UiWebComponents.FormDropdown>
                                                {fieldState.error && <p className="mt-1 text-sm text-red-500">{fieldState.error.message}</p>}
                                            </>
                                        )}
                                    />
                                </div>
                            )}

                            <div>
                                <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="actualStock">Actual Quantity <span className="text-red-500">*</span></WebComponents.UiComponents.UiWebComponents.FormLabel>
                                <WebComponents.UiComponents.UiWebComponents.FormInput
                                    {...register("actualStock", { valueAsNumber: true })}
                                    id="actualStock"
                                    type="number"
                                    placeholder="e.g. 100"
                                    className={errors.actualStock ? "border-red-500" : ""}
                                />
                                {errors.actualStock && <p className="mt-1 text-sm text-red-500">{errors.actualStock.message}</p>}
                            </div>

                            <div>
                                <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="reason">Adjustment Reason <span className="text-red-500">*</span></WebComponents.UiComponents.UiWebComponents.FormLabel>
                                <Controller
                                    name="reason"
                                    control={control}
                                    render={({ field, fieldState }) => (
                                        <>
                                            <WebComponents.UiComponents.UiWebComponents.Textarea
                                                {...field}
                                                id="reason"
                                                placeholder="Why adjust?"
                                                rows={3}
                                                maxLength={250}
                                                charCounter={false}
                                                className={fieldState.invalid ? "border-red-500" : ""}
                                            />
                                            <div className="flex justify-between items-center mt-1">
                                                {fieldState.error ? <p className="text-sm text-red-500">{fieldState.error.message}</p> : <div />}
                                                <div className="text-xs text-gray-500">{(field.value || "").length}/250</div>
                                            </div>
                                        </>
                                    )}
                                />
                            </div>
                        </div>
                    </div>
                </form>
            </div>

            <div className="pt-6 sm:pt-10 flex justify-end gap-3 px-4 sm:px-0">
                <WebComponents.UiComponents.UiWebComponents.Button variant="cancel" type="button" onClick={onClose}>
                    Cancel
                </WebComponents.UiComponents.UiWebComponents.Button>
                <WebComponents.UiComponents.UiWebComponents.Button variant="save" type="submit" form="adjustment-form">
                    Save
                </WebComponents.UiComponents.UiWebComponents.Button>
            </div>
        </>
    );
}

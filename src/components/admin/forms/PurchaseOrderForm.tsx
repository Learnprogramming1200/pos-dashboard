"use client";
import React from "react";
import { useForm, useFieldArray, Controller, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Trash2, Plus, Calendar, Copy } from "lucide-react";
import { UiWebComponents } from "@/components/ui";
import { Constants } from "@/constant";
import { AdminTypes } from "@/types";
import { purchaseOrderSchema } from "@/app/validation/ValidationSchema";

// Interfaces
interface PurchaseOrderFormProps {
    onSubmit: (data: AdminTypes.purchaseOrderTypes.PurchaseOrderFormData) => void;
    order?: AdminTypes.purchaseOrderTypes.PurchaseOrder;
    suppliers: AdminTypes.supplierTypes.Supplier[];
    products: AdminTypes.InventoryTypes.ProductTypes.Product[];
    taxes: AdminTypes.taxTypes.Tax[];
    stores: AdminTypes.storeTypes.Store[];
    id?: string;
}

export default function PurchaseOrderForm({
    onSubmit,
    order,
    suppliers,
    products,
    taxes,
    stores,
    id,
}: PurchaseOrderFormProps) {
    const {
        control,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(purchaseOrderSchema) as any,
        mode: "onChange",
        defaultValues: {
            supplierId: order?.supplierId || "",
            storeId: order?.storeId || "",
            storeName: order?.storeName || "",
            purchaseOrderNumber: order?.orderNumber || `PO-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
            purchaseDate: order?.purchaseDate ? new Date(order.purchaseDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            expectedDeliveryDate: order?.expectedDeliveryDate ? new Date(order.expectedDeliveryDate).toISOString().split('T')[0] : "",
            paymentTerms: order?.paymentTerms || "",
            paymentMethod: order?.paymentMethod || "Cash",
            shippingCharges: order?.shippingCharges || 0,
            status: order?.status || "Draft",

            shippingDetails: {
                address: order?.shippingDetails?.address || "",
                country: order?.shippingDetails?.country || "",
                state: order?.shippingDetails?.state || "",
                city: order?.shippingDetails?.city || "",
                postalCode: order?.shippingDetails?.postalCode || "",
                contactPerson: order?.shippingDetails?.contactPerson || "",
                phone: order?.shippingDetails?.phone || "",
            },

            items: order?.items?.map((item: any) => ({
                productId: item.productId,
                productName: item.productName || "",
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                taxAmount: item.taxAmount || 0,
                discountAmount: item.discountAmount || 0,
                total: (item.quantity || 0) * (item.unitPrice || 0),
                hasVariation: item.hasVariation || false,
                variantData: item.variantData || [],
                selectedVariation: item.selectedVariation || null,
                selectedVariantValue: item.selectedVariantValue || "",
                productTaxType: item.productTaxType || 'None',
                productTaxValue: item.productTaxValue || 0,
            })) || [{ productId: "", productName: "", quantity: 1, unitPrice: 0, taxAmount: 0, discountAmount: 0, total: 0 }],

            notes: order?.notes || "",
            discountPercentage: 0,
            discountAmount: order?.orderDiscountTax?.discountValue ?? order?.discountAmount ?? 0,
            discountType: order?.discountType || 'Percentage',
            taxPercentage: order?.orderDiscountTax?.taxValue ?? 0,
            taxAmount: order?.taxAmount || 0,
        },
    });

    const { fields, append, remove, update } = useFieldArray({
        control,
        name: "items",
    });

    // Watch all necessary fields
    const watchAllFields = watch();
    const {
        supplierId,
        storeId,
        purchaseOrderNumber,
        purchaseDate,
        expectedDeliveryDate,
        paymentTerms,
        shippingDetails,
        notes,
        discountAmount,
        discountType,
    } = watchAllFields;

    // Use useWatch for items to ensure we catch all updates (including deep nested ones from setValue)
    const items = useWatch({
        control,
        name: "items",
    });

    const shippingAddress = shippingDetails?.address || "";
    const shippingCountry = shippingDetails?.country || "";
    const shippingState = shippingDetails?.state || "";
    const shippingCity = shippingDetails?.city || "";
    const shippingPostalCode = shippingDetails?.postalCode || "";

    // Helper to set shipping details
    const setShippingAddress = (val: string) => setValue("shippingDetails.address", val, { shouldValidate: true });
    const setShippingCountry = (val: string) => setValue("shippingDetails.country", val, { shouldValidate: true });
    const setShippingState = (val: string) => setValue("shippingDetails.state", val, { shouldValidate: true });
    const setShippingCity = (val: string) => setValue("shippingDetails.city", val, { shouldValidate: true });
    const setShippingPostalCode = (val: string) => setValue("shippingDetails.postalCode", val, { shouldValidate: true });

    // Memoized data mapping
    const memoizedSuppliers = React.useMemo(() => {
        if (!Array.isArray(suppliers) || suppliers.length === 0) return [];
        return suppliers.map((supplier: any) => ({
            id: supplier._id || supplier.id,
            name: supplier.name,
            supplierCode: supplier.supplierCode || supplier.code || "",
            email: supplier.email || "",
            phone: supplier.phone || "",
            address: supplier.address?.street || "",
            city: supplier.address?.city || "",
            state: supplier.address?.state || "",
            country: supplier.address?.country || "",
            postalCode: supplier.address?.pincode || "",
            contactPerson: supplier.name,
            status: supplier.status || true,
            createdAt: supplier.createdAt || "",
            updatedAt: supplier.updatedAt || ""
        }));
    }, [suppliers]);

    const memoizedProducts = React.useMemo(() => Array.isArray(products) ? products : [], [products]);
    const memoizedTaxes = React.useMemo(() => Array.isArray(taxes) ? taxes : [], [taxes]);

    // Selected supplier info for display
    const selectedSupplierInfo = React.useMemo(() => {
        return memoizedSuppliers.find(s => s.id === supplierId);
    }, [supplierId, memoizedSuppliers]);

    // Derived states for Product Details mapping
    // We map 'items' from useForm to 'productRows' format expected by JSX logic
    const productRows = items?.map((item, index) => ({
        ...item,
        id: index // use index as ID for now since useFieldArray handles stable IDs internally but here we need a simple key
    })) || [];

    // Helper functions for product row manipulation
    const setProductRows = (newRows: any[]) => {
        // This is a bit tricky because the original code replaced the whole array.
        // We need to map back to form values.
        // Ideally we should update individual fields, but for compatibility with the logic:
        setValue("items", newRows.map(r => {
            const { id, ...rest } = r; // remove the temporary id
            return rest;
        }), { shouldValidate: true });
    };

    const addProductRow = () => {
        append({
            productId: "",
            productName: "",
            quantity: 0,
            unitPrice: 0,
            taxAmount: 0,
            discountAmount: 0,
            total: 0
        });
    };

    const removeProductRow = (index: number) => {
        remove(index);
    };

    const updateProductRow = (index: number, field: string, value: any) => {
        setValue(`items.${index}.${field}` as any, value, { shouldValidate: true });

        // Auto-calculate total if quantity or price changes
        const currentItem = items?.[index];
        if (field === 'quantity') {
            const price = currentItem?.unitPrice || 0;
            setValue(`items.${index}.total` as any, value * price, { shouldValidate: true });
        } else if (field === 'unitPrice') {
            const qty = currentItem?.quantity || 0;
            setValue(`items.${index}.total` as any, qty * value, { shouldValidate: true });
        }
    };

    // Calculate totals
    const totals = React.useMemo(() => {
        let subtotal = 0;
        let totalTax = 0;

        const productTaxes: { productName: string, taxAmount: number }[] = [];

        items?.forEach((item: any) => {
            const qty = Number(item.quantity) || 0;
            const price = Number(item.unitPrice) || 0;

            // Calculate item tax
            let itemTax = 0;
            if (item.productTaxType === 'Percentage') {
                itemTax = (qty * price * (item.productTaxValue || 0)) / 100;
            } else {
                itemTax = (item.productTaxValue || 0) * qty; // Fixed tax per unit
            }

            subtotal += qty * price;
            totalTax += itemTax;

            if (item.productName && itemTax > 0) {
                productTaxes.push({
                    productName: item.productName,
                    taxAmount: itemTax
                });
            }
        });

        const calculatedDiscount = discountType === 'Percentage'
            ? (subtotal * (Number(discountAmount) || 0)) / 100
            : (Number(discountAmount) || 0);

        const afterDiscount = Math.max(0, subtotal - calculatedDiscount);
        return {
            subtotal,
            discount: calculatedDiscount,
            tax: totalTax,
            afterDiscount,
            grandTotal: afterDiscount + totalTax,
            productTaxes
        };
    }, [items, discountAmount, discountType]);

    // Update form values with calculated totals when they change
    React.useEffect(() => {
        // Avoid infinite loops by only updating if changed significantly, or just rely on submit
    }, [totals]);

    const handleFormSubmit = (data: any) => {
        const payload = {
            ...data,
            // Override potentially null fields with undefined for strict typing
            expectedDeliveryDate: (data.expectedDeliveryDate || undefined) as string | undefined,
            paymentTerms: data.paymentTerms || undefined,
            discountType: data.discountType as "Percentage" | "Fixed Amount" | undefined,
            notes: data.notes || undefined,

            supplier: {
                supplierId: data.supplierId,
                supplierName: selectedSupplierInfo?.name || "",
            },
            orderDetails: {
                storeId: data.storeId,
                storeName: data.storeName,
                poNumber: data.purchaseOrderNumber,
                purchaseDate: data.purchaseDate,
                expectedDeliveryDate: data.expectedDeliveryDate || undefined,
                paymentTerms: data.paymentTerms || undefined,
            },
            shippingCharges: data.shippingCharges,
            status: data.status as any, // Cast to match strict status type
            shippingDetails: data.shippingDetails ? {
                address: data.shippingDetails.address || "",
                city: data.shippingDetails.city || "",
                state: data.shippingDetails.state || "",
                country: data.shippingDetails.country || "",
                postalCode: data.shippingDetails.postalCode || "",
                contactPerson: data.shippingDetails.contactPerson || "",
                phone: data.shippingDetails.phone || "",
            } : undefined,
            paymentMethod: data.paymentMethod as any,
            orderDiscountTax: {
                discountType: data.discountType,
                discountValue: data.discountAmount,
                taxType: 'Percentage',
                taxValue: data.taxPercentage,
                shippingFee: 0,
            },
            items: (data.items || []).map((item: any) => {
                const itemPayload: any = {
                    productId: item.productId,
                    productName: item.productName,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    taxAmount: item.taxAmount,
                    discountAmount: item.discountAmount,
                    total: item.total,
                    hasVariation: item.hasVariation,
                };

                if (item.hasVariation && item.selectedVariation) {
                    itemPayload.variants = [
                        {
                            variantId: item.selectedVariation._id || item.selectedVariation.id,
                            variantName: item.selectedVariation.variantTitle || item.selectedVariantValue,
                            variantValue: item.selectedVariantValue,
                            unitPrice: item.unitPrice,
                            quantity: item.quantity,
                            SKU: item.selectedVariation.SKU || "",
                        },
                    ];
                }
                return itemPayload;
            }),
            totalAmount: totals.grandTotal,
            subtotal: totals.subtotal,
            taxAmount: totals.tax,
            discountAmount: totals.discount,
        };
        onSubmit(payload);
    };

    const copyBillingToShipping = () => {
        if (selectedSupplierInfo) {
            setShippingAddress(selectedSupplierInfo.address || "");
            setShippingCity(selectedSupplierInfo.city || "");
            setShippingState(selectedSupplierInfo.state || "");
            setShippingCountry(selectedSupplierInfo.country || "");
            setShippingPostalCode(selectedSupplierInfo.postalCode || "");
        }
    };

    const getProductUnitPrice = (productName: string) => {
        const p = memoizedProducts.find((prod: any) => (prod.productName || prod.name) === productName);
        return p?.costPrice || p?.sellingPrice || 0;
    };

    return (
        <div className="bg-white dark:bg-darkFilterbar rounded-[4px] mx-auto mt-4">
            <form id={id || "order-form"} onSubmit={handleSubmit(handleFormSubmit)} className="p-4 sm:p-5 md:p-6 space-y-6 sm:space-y-8">
                {/* Top Section - Supplier and Order Details */}
                <div className="flex flex-col gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                        {/* Select Supplier */}
                        <div className="bg-white dark:bg-transparent rounded-[4px] border-[0.6px] border-[#D8D9D9] dark:border-[#616161] p-3 sm:p-4 md:p-5 lg:p-6 h-full">
                            <h3 className="text-formHeading font-poppins text-sm sm:text-sm md:text-base font-semibold leading-4 dark:text-white mb-4">
                                {Constants.adminConstants.supplierLabel || "Select Supplier"}
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <UiWebComponents.FormLabel htmlFor="supplierId" className="mb-2">Supplier Name</UiWebComponents.FormLabel>
                                    <UiWebComponents.FilterDropdown
                                        value={supplierId as string || null}
                                        onChange={(e) => {
                                            const val = e.value || '';
                                            setValue("supplierId", val, { shouldValidate: true });
                                        }}
                                        options={memoizedSuppliers.map(s => ({ name: s.name, value: s.id }))}
                                        optionLabel="name"
                                        optionValue="value"
                                        placeholder="Select Supplier"
                                        filter
                                        className="w-full"
                                    />
                                    {errors.supplierId && (
                                        <p className="text-red-500 text-xs mt-1">{errors.supplierId.message}</p>
                                    )}
                                </div>
                                {/* Supplier Details (below dropdown) */}
                                {supplierId && selectedSupplierInfo && (
                                    <div className="rounded-[4px] border border-[#D8D9D9] dark:border-[#616161] p-4 text-sm bg-gray-50 dark:bg-[#1B1B1B]">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-medium text-gray-700 dark:text-gray-300">{Constants.adminConstants.detailsLabel}</span>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">{selectedSupplierInfo?.name || "—"}</span>
                                        </div>
                                        <div className="flex items-center justify-between py-1">
                                            <span className="text-gray-500 dark:text-gray-400">{Constants.adminConstants.emailLabel}</span>
                                            <span className="text-gray-800 dark:text-gray-200 truncate max-w-[60%] text-right">{selectedSupplierInfo?.email || "—"}</span>
                                        </div>
                                        <div className="flex items-center justify-between py-1">
                                            <span className="text-gray-500 dark:text-gray-400">{Constants.adminConstants.phoneLabel}</span>
                                            <span className="text-gray-800 dark:text-gray-200">{selectedSupplierInfo?.phone || "—"}</span>
                                        </div>
                                        <div className="pt-2 mt-1 border-t border-gray-200 dark:border-gray-700">
                                            <div className="text-gray-500 dark:text-gray-400 mb-1">{Constants.adminConstants.addressLabel}</div>
                                            <div className="text-gray-800 dark:text-gray-200 line-clamp-2">
                                                {(selectedSupplierInfo as any)?.address || ""}
                                                {(selectedSupplierInfo as any)?.city ? `, ${(selectedSupplierInfo as any).city}` : ""}
                                                {(selectedSupplierInfo as any)?.state ? `, ${(selectedSupplierInfo as any).state}` : ""}
                                                {(selectedSupplierInfo as any)?.country ? `, ${(selectedSupplierInfo as any).country}` : ""}
                                                {(selectedSupplierInfo as any)?.postalCode ? `, ${(selectedSupplierInfo as any).postalCode}` : ""}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right: Shipping Details */}
                        <div className="bg-white dark:bg-transparent rounded-[4px] border-[0.6px] border-[#D8D9D9] dark:border-[#616161] p-3 sm:p-4 md:p-5 lg:p-6 h-full">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-formHeading font-poppins text-sm sm:text-sm md:text-base font-semibold leading-4 dark:text-white">
                                    {Constants.adminConstants.shippingDetailsLabel}
                                </h3>
                                <UiWebComponents.Button
                                    type="button"
                                    onClick={copyBillingToShipping}
                                    className="bg-blue-600 text-white hover:bg-blue-700 h-8 px-3 text-xs rounded-[4px]"
                                    title="Copy billing address to shipping"
                                >
                                    <Copy className="w-3 h-3 mr-1.5" />
                                    Copy
                                </UiWebComponents.Button>
                            </div>
                            <div className="flex flex-col gap-4">
                                <div>
                                    <UiWebComponents.FormLabel htmlFor="shippingAddress">{Constants.adminConstants.addressLabel}</UiWebComponents.FormLabel>
                                    <UiWebComponents.FormInput
                                        id="shippingAddress"
                                        name="shippingDetails.address"
                                        type="text"
                                        placeholder="House/Flat, Street, Area"
                                        value={shippingAddress}
                                        onChange={e => setShippingAddress(e.target.value)}
                                        className="h-10"
                                    />
                                    {errors.shippingDetails?.address && (
                                        <p className="text-red-500 text-xs mt-1">{errors.shippingDetails.address.message}</p>
                                    )}
                                </div>
                                <div>
                                    <UiWebComponents.CountryStateCitySelector
                                        selectedCountry={shippingCountry}
                                        onCountryChange={(value) => {
                                            setShippingCountry(value);
                                            setShippingState("");
                                            setShippingCity("");
                                        }}
                                        selectedState={shippingState}
                                        onStateChange={(value) => {
                                            setShippingState(value);
                                            setShippingCity("");
                                        }}
                                        selectedCity={shippingCity}
                                        onCityChange={(value) => setShippingCity(value)}
                                    />
                                </div>
                                <div>
                                    <UiWebComponents.FormLabel htmlFor="shippingPostalCode">{Constants.adminConstants.postalCodeLabel}</UiWebComponents.FormLabel>
                                    <UiWebComponents.FormInput
                                        id="shippingPostalCode"
                                        name="shippingDetails.postalCode"
                                        type="text"
                                        value={shippingPostalCode}
                                        onChange={e => setShippingPostalCode(e.target.value)}
                                        className="h-10"
                                    />
                                    {errors.shippingDetails?.postalCode && (
                                        <p className="text-red-500 text-xs mt-1">{errors.shippingDetails.postalCode.message}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order Details */}
                    <div className="bg-white dark:bg-transparent rounded-[4px] border-[0.6px] border-[#D8D9D9] dark:border-[#616161] p-3 sm:p-4 md:p-5 lg:p-6">
                        <h3 className="text-formHeading font-poppins text-sm sm:text-sm md:text-base font-semibold leading-4 dark:text-white mb-4">
                            {Constants.adminConstants.orderDetailsLabel}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                            <div>
                                <UiWebComponents.FormLabel htmlFor="purchaseOrderNumber">{Constants.adminConstants.purchaseOrderNumberLabel}</UiWebComponents.FormLabel>
                                <UiWebComponents.FormInput
                                    id="purchaseOrderNumber"
                                    name="purchaseOrderNumber"
                                    type="text"
                                    value={purchaseOrderNumber}
                                    onChange={e => setValue("purchaseOrderNumber", e.target.value, { shouldValidate: true })}
                                    required
                                    className="h-10"
                                />
                                {errors.purchaseOrderNumber && (
                                    <p className="text-red-500 text-xs mt-1">{errors.purchaseOrderNumber.message}</p>
                                )}
                            </div>
                            <div>
                                <UiWebComponents.FormLabel htmlFor="purchaseDate">{Constants.adminConstants.purchaseDateLabel}</UiWebComponents.FormLabel>
                                <UiWebComponents.SingleDatePicker
                                    value={purchaseDate}
                                    onChange={(displayDate: string) => {
                                        setValue("purchaseDate", displayDate, { shouldValidate: true });
                                    }}
                                    placeholder="YYYY-MM-DD"
                                />
                                {errors.purchaseDate && (
                                    <p className="text-red-500 text-xs mt-1">{errors.purchaseDate.message}</p>
                                )}
                            </div>
                            <div>
                                <UiWebComponents.FormLabel htmlFor="storeName">{Constants.adminConstants.storeLabel} <span className="text-required">*</span></UiWebComponents.FormLabel>
                                <UiWebComponents.FilterDropdown
                                    value={storeId as string || null}
                                    onChange={(e) => {
                                        setValue("storeId", e.value || '', { shouldValidate: true });
                                        const s = stores.find((st: any) => (st.id || st._id) === e.value);
                                        if (s) setValue("storeName", s.name || (s as any).storeName || '');
                                    }}
                                    options={[{ name: 'Select Store', value: '' }, ...(Array.isArray(stores) ? stores.map((s: any) => ({ name: s.name || s.storeName || 'Unnamed Store', value: s.id || s._id || '' })) : [])]}
                                    optionLabel="name"
                                    optionValue="value"
                                    placeholder="Select Store"
                                    filter={false}
                                    className="w-full"
                                />
                                {errors.storeId && (
                                    <p className="text-red-500 text-xs mt-1">{errors.storeId.message}</p>
                                )}
                            </div>
                            <div>
                                <UiWebComponents.FormLabel htmlFor="expectedDeliveryDate">
                                    {Constants.adminConstants.expectedDeliveryDateLabel} <span className="text-required">*</span>
                                </UiWebComponents.FormLabel>
                                <UiWebComponents.SingleDatePicker
                                    value={expectedDeliveryDate || ""}
                                    onChange={(displayDate: string) => {
                                        setValue("expectedDeliveryDate", displayDate, { shouldValidate: true });
                                    }}
                                    placeholder="YYYY-MM-DD"
                                />
                                {errors.expectedDeliveryDate && (
                                    <p className="text-red-500 text-xs mt-1">{errors.expectedDeliveryDate.message}</p>
                                )}
                            </div>
                            {/* Purchase Terms */}
                            <div>
                                <UiWebComponents.FormLabel htmlFor="paymentTerms">
                                    {Constants.adminConstants.purchaseTermsLabel} <span className="text-required">*</span>
                                </UiWebComponents.FormLabel>
                                <UiWebComponents.FormDropdown
                                    id="paymentTerms"
                                    name="paymentTerms"
                                    value={paymentTerms || ""}
                                    onChange={(e) => setValue("paymentTerms", e.target.value, { shouldValidate: true })}
                                    className="h-10"
                                >
                                    <UiWebComponents.FormOption value="">{Constants.adminConstants.selectTermsLabel}</UiWebComponents.FormOption>
                                    <UiWebComponents.FormOption value="Due on receipt">Due on receipt</UiWebComponents.FormOption>
                                    <UiWebComponents.FormOption value="Net 7">Net 7</UiWebComponents.FormOption>
                                    <UiWebComponents.FormOption value="Net 15">Net 15</UiWebComponents.FormOption>
                                    <UiWebComponents.FormOption value="Net 30">Net 30</UiWebComponents.FormOption>
                                    <UiWebComponents.FormOption value="Net 45">Net 45</UiWebComponents.FormOption>
                                    <UiWebComponents.FormOption value="Net 60">Net 60</UiWebComponents.FormOption>
                                    <UiWebComponents.FormOption value="50% advance, 50% on delivery">50% advance, 50% on delivery</UiWebComponents.FormOption>
                                    <UiWebComponents.FormOption value="Cash on delivery">Cash on delivery</UiWebComponents.FormOption>
                                </UiWebComponents.FormDropdown>
                                {errors.paymentTerms && (
                                    <p className="text-red-500 text-xs mt-1">{errors.paymentTerms.message}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Product Details - Tabular Format without Table Tag */}
                <div className="bg-white dark:bg-transparent rounded-[4px] border-[0.6px] border-[#D8D9D9] dark:border-[#616161] p-3 sm:p-4 md:p-5 lg:p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-formHeading font-poppins text-sm sm:text-sm md:text-base font-semibold leading-4 dark:text-white">
                            {Constants.adminConstants.productDetailsLabel}
                        </h3>
                    </div>
                    <div className="overflow-x-auto border border-gray-200 dark:border-gray-600 rounded-lg">
                        {/* Header Row */}
                        <div className="grid grid-cols-12 gap-4 py-2 px-4 bg-gray-50 dark:bg-[#333333] border-b border-gray-200 dark:border-[#444444] text-xs sm:text-sm md:text-base font-semibold text-gray-700 dark:text-white">
                            <div className="col-span-3 lg:col-span-2">
                                {Constants.adminConstants.productNameLabel} <span className="text-required">*</span>
                            </div>
                            <div className="col-span-2">{Constants.adminConstants.variantLabel}</div>
                            <div className="col-span-2">
                                {Constants.adminConstants.quantityLabel} <span className="text-required">*</span>
                            </div>
                            <div className="col-span-2">
                                {Constants.adminConstants.unitPriceLabel} <span className="text-required">*</span>
                            </div>
                            <div className="col-span-2">{Constants.adminConstants.totalAmountLabel}</div>
                            <div className="col-span-1">{Constants.adminConstants.actionsLabel}</div>
                        </div>
                        {/* Data Rows */}
                        {productRows.map((row: any, index: number) => {
                            const isLastRow = index === productRows.length - 1;
                            const isLastRowComplete = isLastRow && row.productName && row.quantity > 0 && row.unitPrice > 0;
                            return (
                                <div key={index} className="grid grid-cols-12 gap-4 py-4 px-4 border-b border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-transparent transition-colors items-center">
                                    {/* Product Name */}
                                    <div className="col-span-3 lg:col-span-2">
                                        <UiWebComponents.FilterDropdown
                                            value={row.productName || null}
                                            onChange={(e) => {
                                                const productName = e.value || '';
                                                const selectedProduct = memoizedProducts.find((p: any) => (p.productName || p.name) === productName);
                                                const hasVariation = selectedProduct?.hasVariation || false;
                                                const variantData = hasVariation ? (selectedProduct?.variantData || []) : [];

                                                let unitPrice = 0;
                                                if (hasVariation && variantData.length > 0) {
                                                    // Wait for variation selection
                                                    unitPrice = 0;
                                                } else {
                                                    unitPrice = selectedProduct?.costPrice || selectedProduct?.sellingPrice || getProductUnitPrice(productName) || 0;
                                                }

                                                let resolvedTax: any = (selectedProduct as any)?.tax;
                                                if (Array.isArray(resolvedTax) && resolvedTax.length > 0 && typeof resolvedTax[0] === 'string') {
                                                    resolvedTax = memoizedTaxes.find((t: any) => t.id === resolvedTax[0] || t._id === resolvedTax[0]);
                                                }

                                                const productTaxType = (selectedProduct as any)?.taxType || resolvedTax?.valueType || 'None';
                                                const productTaxValue = (selectedProduct as any)?.taxValue || resolvedTax?.value || (selectedProduct as any)?.taxPercent || 0;

                                                // Update row in React Hook Form
                                                setValue(`items.${index}.productId` as any, selectedProduct?._id || selectedProduct?._id || "", { shouldValidate: true });
                                                setValue(`items.${index}.productName` as any, productName, { shouldValidate: true });
                                                setValue(`items.${index}.unitPrice` as any, unitPrice, { shouldValidate: true });
                                                setValue(`items.${index}.hasVariation` as any, hasVariation);
                                                setValue(`items.${index}.variantData` as any, variantData);
                                                setValue(`items.${index}.selectedVariation` as any, null);
                                                setValue(`items.${index}.selectedVariantValue` as any, "");
                                                setValue(`items.${index}.productTaxType` as any, productTaxType);
                                                setValue(`items.${index}.productTaxValue` as any, Number(productTaxValue) || 0);
                                                setValue(`items.${index}.total` as any, (row.quantity || 1) * unitPrice, { shouldValidate: true });
                                            }}
                                            options={[{ name: 'Select Product', value: '' }, ...memoizedProducts.map((p: any) => ({ name: (p.productName || p.name), value: (p.productName || p.name) }))]}
                                            optionLabel="name"
                                            optionValue="value"
                                            placeholder="Select Product"
                                            filter
                                            className="w-full h-10"
                                        />
                                        {(errors.items && errors.items[index] && (errors.items[index] as any).productId) && (
                                            <p className="text-red-500 text-xs mt-1">{(errors.items[index] as any).productId.message}</p>
                                        )}
                                    </div>
                                    {/* Variation - Conditionally shown */}
                                    <div className="col-span-2">
                                        {row.hasVariation && row.variantData && row.variantData.length > 0 ? (
                                            <UiWebComponents.FilterDropdown
                                                value={row.selectedVariantValue || null}
                                                onChange={(e) => {
                                                    const selectedValue = e.value || '';
                                                    const variantItem = (row.variantData as any[]).find((v: any) =>
                                                        v.variantValues && v.variantValues.some((vv: any) => vv.value === selectedValue)
                                                    );
                                                    // Update unit price based on selected variation
                                                    const unitPrice = variantItem ? (variantItem.costPrice || variantItem.sellingPrice || 0) : 0;

                                                    const vTaxType = variantItem?.taxType || row.productTaxType || '';
                                                    const vTaxValue = variantItem?.taxValue || row.productTaxValue || 0;

                                                    setValue(`items.${index}.selectedVariation` as any, variantItem || null);
                                                    setValue(`items.${index}.selectedVariantValue` as any, selectedValue);
                                                    setValue(`items.${index}.unitPrice` as any, unitPrice);
                                                    setValue(`items.${index}.productTaxType` as any, vTaxType);
                                                    setValue(`items.${index}.productTaxValue` as any, Number(vTaxValue) || 0);
                                                    setValue(`items.${index}.total` as any, (row.quantity || 1) * unitPrice);
                                                }}
                                                options={[
                                                    { name: 'Select Variation', value: '' },
                                                    ...(row.variantData.flatMap((variant: any) =>
                                                        variant.variantValues?.map((vv: any) => ({
                                                            name: vv.value || 'N/A',
                                                            value: vv.value || ''
                                                        })) || []
                                                    ))
                                                ]}
                                                optionLabel="name"
                                                optionValue="value"
                                                placeholder="Select Variation"
                                                filter
                                                className="w-full h-10"
                                                disabled={!row.hasVariation || !row.productName}
                                            />
                                        ) : (
                                            <div className="text-sm text-gray-400 flex items-center h-10">
                                                {!row.productName ? 'Select product first' : 'No variations'}
                                            </div>
                                        )}
                                    </div>
                                    {/* Quantity */}
                                    <div className="col-span-2">
                                        <UiWebComponents.FormInput
                                            type="number"
                                            min="0"
                                            value={row.quantity}
                                            onChange={e => updateProductRow(index, "quantity", parseInt(e.target.value) || 0)}
                                            className="w-full h-10"
                                        />
                                        {(errors.items && errors.items[index] && (errors.items[index] as any).quantity) && (
                                            <p className="text-red-500 text-xs mt-1">{(errors.items[index] as any).quantity.message}</p>
                                        )}
                                    </div>
                                    {/* Unit Price */}
                                    <div className="col-span-2">
                                        <UiWebComponents.FormInput
                                            type="number"
                                            min="0"
                                            step="1"
                                            value={row.unitPrice}
                                            readOnly
                                            disabled
                                            className="w-full h-10 cursor-not-allowed"
                                        />
                                        {(errors.items && errors.items[index] && (errors.items[index] as any).unitPrice) && (
                                            <p className="text-red-500 text-xs mt-1">{(errors.items[index] as any).unitPrice.message}</p>
                                        )}
                                    </div>
                                    {/* Total */}
                                    <div className="col-span-2">
                                        <UiWebComponents.FormInput
                                            type="text"
                                            value={`₹${(Number(row.total) || 0).toFixed(2)}`}
                                            readOnly
                                            disabled
                                            className="w-full h-10 cursor-not-allowed"
                                        />
                                    </div>
                                    {/* Actions */}
                                    <div className="col-span-1 flex items-center gap-1 sm:gap-1.5 md:gap-2">
                                        <UiWebComponents.Button
                                            type="button"
                                            onClick={addProductRow}
                                            className="bg-[#0A75FF] hover:bg-blue-600 text-white p-1.5 sm:p-2 h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 flex items-center justify-center rounded"
                                            title="Add row"
                                        >
                                            <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
                                        </UiWebComponents.Button>
                                        {productRows.length > 1 && (
                                            <UiWebComponents.Button
                                                type="button"
                                                onClick={() => removeProductRow(index)}
                                                className="bg-red-600 hover:bg-red-700 text-white p-1.5 sm:p-2 h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 flex items-center justify-center rounded"
                                                title="Delete row"
                                            >
                                                <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
                                            </UiWebComponents.Button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Calculation Summary */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-transparent rounded-[4px] border-[0.6px] border-[#D8D9D9] dark:border-[#616161] p-3 sm:p-4 md:p-5 lg:p-6 h-full flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-formHeading font-poppins text-sm sm:text-sm md:text-base font-semibold leading-4 dark:text-white">{Constants.adminConstants.notesLabel}</h3>
                            <span className="text-sm text-gray-500">{(notes || "").length} {Constants.adminConstants.charactersLabel}</span>
                        </div>
                        <UiWebComponents.Textarea
                            value={notes || ""}
                            onChange={(e) => setValue("notes", e.target.value)}
                            placeholder="Enter any additional notes here..."
                            containerClassName="flex-1 flex flex-col min-h-[200px]"
                            className="flex-1 resize-none"
                        />
                    </div>
                    <div className="bg-white dark:bg-transparent rounded-[4px] border-[0.6px] border-[#D8D9D9] dark:border-[#616161] p-3 sm:p-4 md:p-5 lg:p-6 h-full">
                        <h3 className="text-formHeading font-poppins text-sm sm:text-sm md:text-base font-semibold leading-4 dark:text-white mb-4">{Constants.adminConstants.totalLabel}</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                                <span className="text-gray-600 dark:text-gray-400">{Constants.adminConstants.amountLabel}</span>
                                <span className="text-gray-900 dark:text-white">₹{totals.subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                                <span className="text-gray-600 dark:text-gray-400 whitespace-nowrap">{Constants.adminConstants.discountPercentageLabel} (Currently Amount)</span>
                                <UiWebComponents.FormInput
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={discountAmount}
                                    onChange={e => {
                                        setValue("discountType", 'Fixed' as any);
                                        setValue("discountAmount", Number(e.target.value));
                                    }}
                                    className="w-32 h-9 ml-auto text-right"
                                />
                            </div>
                            <div className="flex items-center justify-between py-2 border-t border-gray-100 dark:border-gray-800">
                                <span className="text-gray-600 dark:text-gray-400">Subtotal (After Discount)</span>
                                <span className="text-gray-900 dark:text-white">₹{totals.afterDiscount.toFixed(2)}</span>
                            </div>
                            {/* Display tax per product */}
                            {totals.productTaxes.map((productTax, index) => (
                                <div key={index} className="flex items-center justify-between py-2 border-t border-gray-100 dark:border-gray-800">
                                    <span className="text-gray-600 dark:text-gray-400 text-sm">{productTax.productName || `Product ${index + 1}`} Tax</span>
                                    <span className="text-gray-900 dark:text-white">₹{productTax.taxAmount.toFixed(2)}</span>
                                </div>
                            ))}

                            <div className="flex items-center justify-between py-2 border-t border-gray-100 dark:border-gray-800">
                                <span className="text-gray-600 dark:text-gray-400">{Constants.adminConstants.taxAmountLabel} (Total)</span>
                                <span className="text-gray-900 dark:text-white">₹{totals.tax.toFixed(2)}</span>
                            </div>
                            <div className="pt-4 mt-2 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                                <span className="text-gray-800 dark:text-gray-200 font-semibold">{Constants.adminConstants.totalLabel}</span>
                                <span className="text-2xl font-extrabold text-gray-900 dark:text-white">₹{totals.grandTotal.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}

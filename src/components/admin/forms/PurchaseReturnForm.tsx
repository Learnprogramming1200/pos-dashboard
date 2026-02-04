"use client";

import React from "react";
import { Constants } from "@/constant";
import { WebComponents } from "@/components";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { AdminTypes } from "@/types";
import { purchaseReturnSchema } from "@/app/validation/ValidationSchema";

interface PurchaseReturnFormProps {
    onSubmit: (data: any) => Promise<void>;
    onCancel: () => void;
    returnData?: AdminTypes.purchaseReturnTypes.PurchaseReturn;
    purchaseOrders: AdminTypes.purchaseOrderTypes.PurchaseOrder[];
    suppliers: AdminTypes.supplierTypes.Supplier[];
    stores: AdminTypes.storeTypes.Store[];
}
interface PurchaseReturnFormValues {
    purchaseOrderId: string;
    purchaseOrderNumber: string;
    supplierId: string;
    supplierName: string;
    storeId: string;
    storeName: string;
    returnDate: string;
    status: string;
    notes: string;
    items: AdminTypes.InventoryTypes.ProductTypes.ProductItem[];
}

export default function PurchaseReturnForm({
    onSubmit,
    onCancel,
    returnData,
    purchaseOrders,
    suppliers,
    stores
}: PurchaseReturnFormProps) {
    const {
        control,
        handleSubmit,
        setValue,
        watch,
        formState: { errors }
    } = useForm<PurchaseReturnFormValues>({
        resolver: yupResolver(purchaseReturnSchema) as any,
        defaultValues: {
            purchaseOrderId: typeof returnData?.purchaseOrderId === 'string'
                ? returnData.purchaseOrderId
                : returnData?.purchaseOrderId?._id || "",
            purchaseOrderNumber: returnData?.purchaseOrderId?.orderDetails?.poNumber || "",
            supplierId: typeof returnData?.supplierId === 'string'
                ? returnData.supplierId
                : returnData?.supplierId?._id || "",
            supplierName: returnData?.supplierId?.name || returnData?.supplierId?.displayName || "",
            storeId: returnData?.storeId || "",
            storeName: returnData?.storeName || "",
            returnDate: returnData?.returnDate ? new Date(returnData.returnDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            status: returnData?.status || "Draft",
            notes: returnData?.notes || "",
            items: [],
        }
    });

    const { fields, append, remove, replace } = useFieldArray({
        control,
        name: "items"
    });

    // Watch key fields
    const watchedPurchaseOrderId = useWatch({ control, name: "purchaseOrderId" });
    const watchedItems = useWatch({ control, name: "items" });
    const watchedStoreName = useWatch({ control, name: "storeName" });
    const watchedStatus = useWatch({ control, name: "status" });
    const watchedReturnDate = useWatch({ control, name: "returnDate" });
    const watchedNotes = useWatch({ control, name: "notes" });

    // State for selected order (keep this locally as it's for display mainly)
    const [selectedOrder, setSelectedOrder] = React.useState<AdminTypes.purchaseOrderTypes.PurchaseOrder | null>(null);
    const [loading, setLoading] = React.useState(false);

    // Date helpers
    const toDisplayDate = (iso: string | undefined): string => {
        if (!iso) {
            const d = new Date();
            const dd = `${d.getDate()}`.padStart(2, '0');
            const mm = `${d.getMonth() + 1}`.padStart(2, '0');
            const yyyy = d.getFullYear();
            return `${dd}-${mm}-${yyyy}`;
        }
        const parsed = new Date(iso);
        if (!isNaN(parsed.getTime())) {
            const dd = `${parsed.getDate()}`.padStart(2, '0');
            const mm = `${parsed.getMonth() + 1}`.padStart(2, '0');
            const yyyy = parsed.getFullYear();
            return `${dd}-${mm}-${yyyy}`;
        }
        if (/^\d{2}-\d{2}-\d{4}$/.test(iso)) return iso;
        return iso;
    };

    const toIsoDate = (display: string): string => {
        const m = /^(\d{2})-(\d{2})-(\d{4})$/.exec(display || "");
        if (!m) return display;
        const dd = m[1];
        const mm = m[2];
        const yyyy = m[3];
        return `${yyyy}-${mm}-${dd}`;
    };

    // Initial load for editing items
    React.useEffect(() => {
        if (returnData?.items && returnData.items.length > 0) {
            const mappedItems: AdminTypes.InventoryTypes.ProductTypes.ProductItem[] = returnData.items.map((item: any, idx: number) => ({
                id: `item-${Date.now()}-${idx}`,
                productId: typeof item.productId === 'string' ? item.productId : item.productId?._id || item.productId?.id || "",
                productName: item.productName || item.productId?.productName || "",
                variantId: item.variantId || "",
                variantName: item.variantName || "",
                hasVariation: !!item.variantId,
                variantData: [], // Would need to fetch this if we want full edit capability
                selectedVariantValue: "",
                quantity: String(item.returnQty || item.quantity || 0),
                price: String(item.unitCost || item.price || 0),
                taxRate: String(item.taxRate || 0),
                taxType: 'Percentage' as const, // Default or derived
                originalQuantity: 999999 // If editing, we might not know original PO qty unless we fetch the PO
            }));
            replace(mappedItems);
        } else if (!returnData) {
            replace([{
                id: `item-${Date.now()}`,
                productId: "",
                productName: "",
                variantId: "",
                variantName: "",
                hasVariation: false,
                variantData: [],
                selectedVariantValue: "",
                quantity: "",
                price: "",
                taxRate: "",
                taxType: 'None' as const
            }]);
        }
    }, [returnData, replace]);

    // Computed totals
    const totalAmount = React.useMemo(() => {
        return (watchedItems || []).reduce((sum: number, item: any) => {
            const qty = parseFloat(item.quantity) || 0;
            const unitPrice = parseFloat(item.price) || 0;
            return sum + (qty * unitPrice);
        }, 0);
    }, [watchedItems]);

    const taxAmount = React.useMemo(() => {
        return (watchedItems || []).reduce((sum: number, item: any) => {
            const qty = parseFloat(item.quantity) || 0;
            const unitPrice = parseFloat(item.price) || 0;
            const rate = parseFloat(item.taxRate) || 0;
            const itemTotal = qty * unitPrice;
            const itemTax = item.taxType === 'Fixed'
                ? rate
                : (itemTotal * rate / 100);
            return sum + itemTax;
        }, 0);
    }, [watchedItems]);

    const grandTotal = React.useMemo(() => totalAmount + taxAmount, [totalAmount, taxAmount]);



    // Effect to fetch Purchase Order Data
    // Effect to fetch Purchase Order Data
    React.useEffect(() => {
        const fetchPurchaseOrderData = async () => {
            if (watchedPurchaseOrderId) {
                const order = (purchaseOrders as any[]).find((po: any) => (po._id || po.id) === watchedPurchaseOrderId);
                setSelectedOrder(order || null);
                if (order) {
                    setValue("purchaseOrderNumber", order.orderDetails?.poNumber || order.poNumber || "");

                    // Handle supplier ID
                    const supplierId = order.supplier?.supplierId?._id || order.supplier?.supplierId || order.supplierId || "";
                    setValue("supplierId", supplierId);

                    // Handle supplier Name
                    const supplierName = order.supplier?.supplierName || order.supplierName || "Unknown Supplier";
                    setValue("supplierName", supplierName);

                    const storeIdFromOrder = order.orderDetails?.storeId || order.storeId || "";
                    let storeNameFromOrder = order.orderDetails?.storeName || order.storeName || "";

                    if (storeIdFromOrder) {
                        setValue("storeId", storeIdFromOrder);
                        const matchedStore = stores.find((store: any) => store._id === storeIdFromOrder);
                        if (matchedStore && matchedStore.name) {
                            storeNameFromOrder = matchedStore.name;
                        }
                    }
                    setValue("storeName", storeNameFromOrder);

                    if (order.items && order.items.length > 0) {
                        const mapped: AdminTypes.InventoryTypes.ProductTypes.ProductItem[] = [];
                        for (let idx = 0; idx < order.items.length; idx++) {
                            const itm: any = order.items[idx];
                            let extractedProductId = '';
                            if (typeof itm.productId === 'string') {
                                extractedProductId = itm.productId;
                            } else if (itm.productId?._id) {
                                extractedProductId = itm.productId._id;
                            }

                            const unitPrice = itm.unitPrice || 0;
                            const qty = itm.quantity || 0;
                            const variantId = itm._id || ""; // Using Item ID as fallback variant ID if not explicitly variant

                            mapped.push({
                                id: `item-${Date.now()}-${idx}`,
                                productId: extractedProductId,
                                productName: itm.productName || '',
                                variantId,
                                variantName: itm.hasVariation ? (itm.variants?.[0]?.variantName || '') : '',
                                hasVariation: itm.hasVariation || false,
                                variantData: itm.variants || [],
                                selectedVariantValue: "",
                                quantity: String(qty || 0),
                                price: String(unitPrice || 0),
                                taxRate: String(itm.taxValue || order.orderDiscountTax?.taxValue || 0),
                                taxType: 'Percentage',
                                originalQuantity: qty || 0
                            });
                        }
                        replace(mapped.length > 0 ? mapped : []);
                    }
                }
            } else {
                setSelectedOrder(null);
                setValue("purchaseOrderNumber", "");
                setValue("supplierId", "");
                setValue("supplierName", "");
                // Reset items
                replace([{
                    id: `item-${Date.now()}`,
                    productId: "",
                    productName: "",
                    variantId: "",
                    variantName: "",
                    hasVariation: false,
                    variantData: [],
                    selectedVariantValue: "",
                    quantity: "",
                    price: "",
                    taxRate: "",
                    taxType: 'None'
                }]);
            }
        };
        fetchPurchaseOrderData();
    }, [watchedPurchaseOrderId, purchaseOrders, setValue, stores, replace]);


    const handleFormSubmit = async (data: any) => {
        setLoading(true);
        try {
            const payload = {
                /** Relations */
                purchaseOrderId: data.purchaseOrderId,
                purchaseOrderNumber: data.purchaseOrderNumber,
                supplierId: data.supplierId,
                storeId: data.storeId,
                storeName: data.storeName,
                returnDate: toIsoDate(data.returnDate),
                status: data.status,

                reason: data.notes,
                notes: data.notes,

                /** Amounts */
                itemsSubtotal: totalAmount,
                itemsTaxTotal: taxAmount,
                totalCreditAmount: grandTotal,

                /** Items */
                items: data.items.map((item: any) => ({
                    productId: item.productId,
                    variantId: item.variantId || undefined,
                    purchaseOrderItemId: item.id && !item.id.toString().startsWith('item-') ? item.id : undefined, // Check if it's a real ID or temp

                    returnQty: parseInt(item.quantity) || 0,     // REQUIRED
                    unitCost: parseFloat(item.price) || 0,       // REQUIRED
                    taxRate: item.taxRate ? parseFloat(item.taxRate) : undefined
                }))
            };

            await onSubmit(payload);
        } catch (error) {
            console.error("Submission error", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-darkFilterbar rounded-[4px] mt-4">
            <form id="return-form" onSubmit={handleSubmit(handleFormSubmit)}>
                <div className="p-4 sm:p-5 md:p-6 lg:p-8">
                    <div className="bg-white dark:bg-transparent rounded-[4px] border-[0.6px] border-[#D8D9D9] dark:border-[#616161] p-3 sm:p-4 md:p-5 lg:p-6 mb-3 sm:mb-4 md:mb-5 lg:mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-5 lg:gap-6 xl:gap-7 2xl:gap-8">
                            <div className="col-span-1">
                                <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="purchaseOrderId">{Constants.adminConstants.purchaseOrderLabel}</WebComponents.UiComponents.UiWebComponents.FormLabel>
                                <WebComponents.UiComponents.UiWebComponents.FormDropdown
                                    id="purchaseOrderId"
                                    name="purchaseOrderId"
                                    value={watchedPurchaseOrderId}
                                    onChange={e => setValue("purchaseOrderId", e.target.value, { shouldValidate: true })}
                                >
                                    <WebComponents.UiComponents.UiWebComponents.FormOption value="">{Constants.adminConstants.selectPurchaseOrder}</WebComponents.UiComponents.UiWebComponents.FormOption>
                                    {purchaseOrders.filter((po: any) => !["Cancelled"].includes(po.status)).map((order: any) => {
                                        const poNum = order.orderDetails?.poNumber || order.poNumber || "Unknown PO";
                                        const suppName = order.supplier?.supplierName || order.supplierName || "Unknown Supplier";
                                        const label = `${poNum} - ${suppName} (${order.status})`;
                                        return (
                                            <WebComponents.UiComponents.UiWebComponents.FormOption key={order._id} value={order._id}>
                                                {label}
                                            </WebComponents.UiComponents.UiWebComponents.FormOption>
                                        );
                                    })}
                                </WebComponents.UiComponents.UiWebComponents.FormDropdown>
                                {errors.purchaseOrderId && <p className="text-red-500 text-xs mt-1">{errors.purchaseOrderId.message as string}</p>}
                            </div>
                            <div className="col-span-1">
                                <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="storeName">{Constants.adminConstants.storeLabel}</WebComponents.UiComponents.UiWebComponents.FormLabel>
                                <WebComponents.UiComponents.UiWebComponents.FormInput
                                    id="storeName"
                                    name="storeName"
                                    value={watchedStoreName}
                                    placeholder={Constants.adminConstants.selectStore}
                                    readOnly
                                    disabled
                                    className="cursor-not-allowed"
                                />
                            </div>
                            <div className="col-span-1">
                                <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="returnDate">{Constants.adminConstants.returnDateLabel}</WebComponents.UiComponents.UiWebComponents.FormLabel>
                                <WebComponents.UiComponents.UiWebComponents.SingleDatePicker
                                    value={watchedReturnDate}
                                    onChange={(v) => setValue("returnDate", v, { shouldValidate: true })}
                                />
                                {errors.returnDate && <p className="text-red-500 text-xs mt-1">{errors.returnDate.message as string}</p>}
                            </div>
                            <div className="col-span-1">
                                <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="status">{Constants.adminConstants.statusLabel}</WebComponents.UiComponents.UiWebComponents.FormLabel>
                                <WebComponents.UiComponents.UiWebComponents.FormDropdown
                                    id="status"
                                    name="status"
                                    value={watchedStatus}
                                    onChange={e => setValue("status", e.target.value as any, { shouldValidate: true })}
                                >
                                    <WebComponents.UiComponents.UiWebComponents.FormOption value="Draft">Draft</WebComponents.UiComponents.UiWebComponents.FormOption>
                                    <WebComponents.UiComponents.UiWebComponents.FormOption value="Approved">Approved</WebComponents.UiComponents.UiWebComponents.FormOption>
                                    <WebComponents.UiComponents.UiWebComponents.FormOption value="Returned">Returned</WebComponents.UiComponents.UiWebComponents.FormOption>
                                    <WebComponents.UiComponents.UiWebComponents.FormOption value="Credited">Credited</WebComponents.UiComponents.UiWebComponents.FormOption>
                                    <WebComponents.UiComponents.UiWebComponents.FormOption value="Cancelled">Cancelled</WebComponents.UiComponents.UiWebComponents.FormOption>
                                </WebComponents.UiComponents.UiWebComponents.FormDropdown>
                                {errors.status && <p className="text-red-500 text-xs mt-1">{errors.status.message as string}</p>}
                            </div>
                        </div>
                    </div>

                    {selectedOrder && (
                        <div className="bg-white dark:bg-transparent rounded-[4px] border-[0.6px] border-[#D8D9D9] dark:border-[#616161] p-3 sm:p-4 md:p-5 lg:p-6 mb-3 sm:mb-4 md:mb-5 lg:mb-6">
                            <h3 className="text-formHeading font-poppins text-sm sm:text-sm md:text-base font-semibold leading-4 dark:text-white mb-2 sm:mb-2.5 md:mb-3 flex items-center gap-2">{Constants.adminConstants.orderDetailsLabel}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-5 lg:gap-6 xl:gap-7 2xl:gap-8 text-sm pt-2 sm:pt-2.5 md:pt-3">
                                <div>
                                    <p className="text-gray-600 dark:text-gray-400">{Constants.adminConstants.orderNumberLabel}</p>
                                    <p className="font-medium text-gray-900 dark:text-white">{selectedOrder.orderNumber || selectedOrder.orderDetails?.poNumber || "-"}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600 dark:text-gray-400">{Constants.adminConstants.supplierLabel}</p>
                                    <p className="font-medium text-gray-900 dark:text-white">{selectedOrder.supplierName || selectedOrder.supplier?.supplierName || "-"}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600 dark:text-gray-400">{Constants.adminConstants.purchaseDateLabel}</p>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {new Date(selectedOrder.purchaseDate || selectedOrder.orderDetails?.purchaseDate || new Date()).toLocaleDateString()}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-600 dark:text-gray-400">{Constants.adminConstants.totalAmountLabel}</p>
                                    <p className="font-medium text-gray-900 dark:text-white">₹{(selectedOrder.totalAmount || selectedOrder.totals?.grandTotal || 0).toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="mb-3 sm:mb-4 md:mb-5 lg:mb-6">
                        <div className="bg-white dark:bg-transparent rounded-[4px] border-[0.6px] border-[#D8D9D9] dark:border-[#616161] p-3 sm:p-4 md:p-5 lg:p-6">
                            <div className="flex items-center justify-between mb-3 sm:mb-4 md:mb-5 lg:mb-6">
                                <h3 className="text-formHeading font-poppins text-sm sm:text-sm md:text-base font-semibold leading-4 dark:text-white flex items-center gap-2">
                                    {Constants.adminConstants.productDetailsLabel}
                                </h3>
                            </div>
                            {/* Product Items Table */}
                            <div className="overflow-x-auto border border-gray-200 dark:border-gray-600 rounded-lg">
                                <div className="grid grid-cols-12 gap-4 py-2 px-4 bg-gray-50 dark:bg-[#333333] border-b border-gray-200 dark:border-[#444444] text-xs sm:text-sm md:text-base font-semibold text-gray-700 dark:text-white">
                                    <div className="col-span-2 lg:col-span-2">{Constants.adminConstants.productNameLabel}</div>
                                    <div className="col-span-2">{Constants.adminConstants.variantLabel || "Variant"}</div>
                                    <div className="col-span-2">{Constants.adminConstants.returnQuantityLabel}</div>
                                    <div className="col-span-2">{Constants.adminConstants.unitPriceLabel}</div>
                                    <div className="col-span-2">{Constants.adminConstants.taxRateLabel}</div>
                                    <div className="col-span-2">{Constants.adminConstants.totalAmountLabel}</div>
                                </div>
                                {watchedItems?.map((item: any, index: number) => {
                                    const qty = parseFloat(item.quantity) || 0;
                                    const unitPrice = parseFloat(item.price) || 0;
                                    const taxRate = parseFloat(item.taxRate) || 0;
                                    const itemSubtotal = qty * unitPrice;
                                    const itemTaxAmount = item.taxType === 'Fixed' ? taxRate : (itemSubtotal * taxRate / 100);
                                    const itemTotal = itemSubtotal + itemTaxAmount;
                                    const availableProducts = selectedOrder?.items || [];

                                    // Filter unique product names for dropdown
                                    const productOptions = availableProducts.map((p: any) => ({
                                        name: p.productName || p.name || 'Unknown Product',
                                        value: p.productName || p.name || ''
                                    })).filter((v, i, a) => a.findIndex(t => t.value === v.value) === i);

                                    return (
                                        <div key={item.id} className="grid grid-cols-12 gap-4 py-4 px-4 border-b border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-transparent transition-colors items-center">
                                            {/* Product Name */}
                                            <div className="col-span-2 lg:col-span-2">
                                                <WebComponents.UiComponents.UiWebComponents.FilterDropdown
                                                    value={item.productName || null}
                                                    onChange={(e) => {
                                                        const productName = e.value || '';
                                                        // Identify the exact item from selectedOrder based on product name
                                                        // Note: If multiple items have same name but different variants, this logic might need refinement, 
                                                        // but usually filtering by name first is the pattern here. 
                                                        // Ideally we should filter variants after selecting product.
                                                        const selectedProduct: any = availableProducts.find((p: any) => (p.productName || p.name) === productName);

                                                        let productId = '';
                                                        let unitPrice = 0;
                                                        let taxRateValue = '';
                                                        let taxType: 'Percentage' | 'Fixed' | 'None' = item.taxType || 'None';
                                                        let variantId = '';
                                                        let hasVariation = false;
                                                        let variantData: any[] = [];

                                                        if (selectedProduct) {
                                                            if (selectedProduct.productId && typeof selectedProduct.productId === 'string') productId = selectedProduct.productId;
                                                            else if (selectedProduct._id) productId = selectedProduct._id;

                                                            unitPrice = selectedProduct?.unitPrice || selectedProduct?.costPrice || selectedProduct?.price || 0;

                                                            if (selectedProduct?.taxType && typeof selectedProduct.taxType === 'string') {
                                                                if (selectedProduct.taxType.toLowerCase() === 'percentage') taxType = 'Percentage';
                                                                else if (selectedProduct.taxType.toLowerCase() === 'fixed') taxType = 'Fixed';
                                                            }
                                                            if (selectedProduct?.taxValue && selectedProduct.taxValue > 0) {
                                                                taxRateValue = String(selectedProduct.taxValue);
                                                                if (!taxType || taxType === 'None') taxType = 'Percentage';
                                                            } else if (selectedProduct?.taxRate) {
                                                                taxRateValue = String(selectedProduct.taxRate);
                                                                if (!taxType || taxType === 'None') taxType = 'Percentage';
                                                            } else {
                                                                taxRateValue = item.taxRate || '';
                                                            }

                                                            hasVariation = selectedProduct.hasVariation || false;
                                                            // For return form, available variants should likely be constrained to what was ordered? 
                                                            // Or we just load product variants. 
                                                            // The `fetchPurchaseOrderData` effect populates items. 
                                                            // Here we are potentially changing the product of a row.
                                                            variantData = selectedProduct.variants || selectedProduct.variantData || [];
                                                        }

                                                        setValue(`items.${index}.productName`, productName, { shouldValidate: true });
                                                        setValue(`items.${index}.productId`, productId, { shouldValidate: true });
                                                        setValue(`items.${index}.price`, String(unitPrice), { shouldValidate: true });
                                                        setValue(`items.${index}.hasVariation`, hasVariation);
                                                        // Reset variant fields if product changes
                                                        setValue(`items.${index}.variantId`, "");
                                                        setValue(`items.${index}.variantName`, "");
                                                        // Note: We don't have deeply nested variantData in the form values interface explicitly 
                                                        // but we can assume we might need it for the dropdown. 
                                                        // However, for PO Return, we usually select from ORDER items which are already specific.

                                                        if (taxRateValue) setValue(`items.${index}.taxRate`, taxRateValue, { shouldValidate: true });
                                                        if (taxType) setValue(`items.${index}.taxType`, taxType, { shouldValidate: true });
                                                    }}
                                                    options={[{ name: 'Select Product', value: '' }, ...productOptions]}
                                                    optionLabel="name"
                                                    optionValue="value"
                                                    placeholder="Select Prod..."
                                                    filter
                                                    className="w-full h-10"
                                                />
                                                {errors.items && errors.items[index] && (errors.items[index] as any).productId && (
                                                    <p className="text-red-500 text-xs mt-1">{(errors.items[index] as any).productId.message}</p>
                                                )}
                                            </div>

                                            {/* Variant */}
                                            <div className="col-span-2">
                                                {item.hasVariation ? (
                                                    item.variantName || item.variantId ? (
                                                        <div className="h-10 flex items-center px-3 border border-gray-200 dark:border-gray-600 rounded bg-gray-50 dark:bg-transparent text-gray-700 dark:text-gray-300 overflow-hidden text-ellipsis whitespace-nowrap">
                                                            {item.variantName || "Variant Selected"}
                                                        </div>
                                                    ) : (
                                                        <div className="text-sm text-gray-400 flex items-center h-10">Select variation</div>
                                                    )
                                                    // Note: We could implement a dropdown here if we want to change variants, 
                                                    // but typically returns are for specific line items.
                                                    // For now, displaying the variant name is safer than allowing random switches if strict to PO.
                                                ) : (
                                                    <div className="text-sm text-gray-400 flex items-center h-10">
                                                        No variations
                                                    </div>
                                                )}
                                            </div>

                                            {/* Quantity */}
                                            <div className="col-span-2">
                                                <WebComponents.UiComponents.UiWebComponents.FormInput
                                                    type="number"
                                                    placeholder="0"
                                                    value={item.quantity}
                                                    onChange={e => {
                                                        const newVal = e.target.value;
                                                        if (item.originalQuantity && parseInt(newVal) > item.originalQuantity) {
                                                            WebComponents.UiComponents.UiWebComponents.SwalHelper.error({ text: `Return quantity cannot exceed ${item.originalQuantity}` });
                                                            return;
                                                        }
                                                        setValue(`items.${index}.quantity`, newVal, { shouldValidate: true });
                                                    }}
                                                    className="w-full h-10"
                                                    min="0"
                                                    max={item.originalQuantity || undefined}
                                                    step="1"
                                                    title={item.originalQuantity ? `Maximum: ${item.originalQuantity}` : ''}
                                                />
                                                {errors.items && errors.items[index] && (errors.items[index] as any).quantity && (
                                                    <p className="text-red-500 text-xs mt-1">{(errors.items[index] as any).quantity.message}</p>
                                                )}
                                            </div>

                                            {/* Unit Price */}
                                            <div className="col-span-2">
                                                <WebComponents.UiComponents.UiWebComponents.FormInput
                                                    type="number"
                                                    placeholder="0.00"
                                                    value={item.price}
                                                    readOnly
                                                    disabled
                                                    className="w-full h-10 cursor-not-allowed"
                                                    min="0"
                                                    step="0.01"
                                                />
                                                {errors.items && errors.items[index] && (errors.items[index] as any).price && (
                                                    <p className="text-red-500 text-xs mt-1">{(errors.items[index] as any).price.message}</p>
                                                )}
                                            </div>

                                            {/* Tax Rate */}
                                            <div className="col-span-2">
                                                <WebComponents.UiComponents.UiWebComponents.FormInput
                                                    type="number"
                                                    placeholder="0"
                                                    value={item.taxRate}
                                                    readOnly
                                                    disabled
                                                    className="w-full h-10 cursor-not-allowed"
                                                    min="0"
                                                    step="0.01"
                                                />
                                            </div>

                                            {/* Total */}
                                            <div className="col-span-2">
                                                <WebComponents.UiComponents.UiWebComponents.FormInput
                                                    type="text"
                                                    value={`₹${itemTotal.toFixed(2)}`}
                                                    readOnly
                                                    disabled
                                                    className="w-full h-10 cursor-not-allowed"
                                                />
                                            </div>


                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-5 lg:gap-6 xl:gap-7 2xl:gap-8 mb-3 sm:mb-4 md:mb-5 lg:mb-6">
                        <div className="bg-white dark:bg-transparent rounded-[4px] border-[0.6px] border-[#D8D9D9] dark:border-[#616161] p-3 sm:p-4 md:p-5 lg:p-6">
                            <div className="flex items-center justify-between mb-2 sm:mb-2.5 md:mb-3">
                                <h3 className="text-formHeading font-poppins text-sm sm:text-sm md:text-base font-semibold leading-4 dark:text-white flex items-center gap-2">{Constants.adminConstants.returnReasonNotesLabel}</h3>
                                <span className="text-sm text-gray-500 dark:text-gray-400">{(watchedNotes || "").length} {Constants.adminConstants.characters}</span>
                            </div>
                            <WebComponents.UiComponents.UiWebComponents.Textarea
                                value={watchedNotes}
                                onChange={(e) => setValue("notes", e.target.value, { shouldValidate: true })}
                                placeholder="Explain the reason for return..."
                                rows={8}
                                className="min-h-[200px] pt-2 sm:pt-2.5 md:pt-3"
                            />
                            {errors.notes && <p className="text-red-500 text-xs mt-1">{errors.notes.message as string}</p>}
                        </div>
                        <div className="bg-white dark:bg-transparent rounded-[4px] border-[0.6px] border-[#D8D9D9] dark:border-[#616161] p-3 sm:p-4 md:p-5 lg:p-6">
                            <h3 className="text-formHeading font-poppins text-sm sm:text-sm md:text-base font-semibold leading-4 dark:text-white mb-3 sm:mb-4 md:mb-5 lg:mb-6 flex items-center gap-2">{Constants.adminConstants.totalLabel}</h3>
                            <div className="space-y-3 sm:space-y-4 pt-2 sm:pt-2.5 md:pt-3">
                                <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                                    <span className="text-gray-600 dark:text-gray-400">{Constants.adminConstants.amountLabel}</span>
                                    <span className="text-gray-900 dark:text-white">₹{totalAmount.toFixed(2)}</span>
                                </div>
                                <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                                    <span className="text-gray-600 dark:text-gray-400">{Constants.adminConstants.taxLabel}</span>
                                    <span className="text-gray-900 dark:text-white">₹{taxAmount.toFixed(2)}</span>
                                </div>
                                <div className="flex items-center justify-between py-2 border-t border-gray-100 dark:border-gray-700 pt-3">
                                    <span className="text-gray-900 dark:text-white font-semibold">{Constants.adminConstants.grandTotalLabel}</span>
                                    <span className="text-gray-900 dark:text-white font-semibold">₹{grandTotal.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}

"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { createSaleSchema } from "@/app/validation/ValidationSchema";
import { Plus, Trash2, X } from "lucide-react";
import { ServerActions } from "@/lib";
import { WebComponents } from '@/components';
import { AdminTypes } from "@/types";

// --- Types ---
type ProductTax = {
    _id?: string;
    taxName?: string;
    taxType?: 'Exclusive' | 'Inclusive';
    valueType?: 'Percentage' | 'Fixed';
    value: number;
};

type PosCustomer = {
    id: string;
    code: string;
    customerName: string;
    phone: string;
    email: string
};

type PosProduct = {
    id: string;
    name: string;
    sku: string;
    barcode?: string;
    price: number;
    taxes: ProductTax[] | null;
    taxPercent: number;
    taxType: 'Exclusive' | 'Inclusive';
    taxable: boolean;
    discount: number;
    discountType: 'Percentage' | 'Fixed';
    stock: number;
    categoryId?: string;
    subcategoryId?: string
};

type CartItem = {
    product: PosProduct;
    quantity: number;
    discount: number;
    discountType: 'Percentage' | 'Fixed';
    discountAmount: number;
    taxAmount: number;
    taxBreakdown: any[];
    total: number;
};

// --- Helpers ---
function calculateItemDiscount(
    price: number,
    quantity: number,
    discount: number,
    discountType: 'Percentage' | 'Fixed' = 'Percentage'
): number {
    if (!discount || discount <= 0) return 0;
    const subtotal = price * quantity;
    if (discountType === 'Percentage') {
        return (subtotal * discount) / 100;
    } else {
        return discount * quantity;
    }
}

function calculateItemTaxes(
    basePrice: number,
    quantity: number,
    discountAmount: number,
    taxes: ProductTax[] | null | undefined
) {
    const subtotal = basePrice * quantity;
    const discountedPrice = subtotal - discountAmount;

    if (!taxes || !Array.isArray(taxes) || taxes.length === 0) {
        return {
            taxAmount: 0,
            taxableAmount: discountedPrice,
            netAmount: discountedPrice,
            finalPayable: discountedPrice,
            taxBreakdown: [],
            hasExclusiveTax: false,
            hasInclusiveTax: false,
        };
    }

    let exclusiveTaxTotal = 0;
    let inclusiveTaxTotal = 0;
    let hasExclusiveTax = false;
    let hasInclusiveTax = false;
    const taxBreakdown: any[] = [];

    // Filter taxes by type
    const inclusiveTaxes = taxes.filter(t => (t.taxType || 'Exclusive').toLowerCase() === 'inclusive');
    const exclusiveTaxes = taxes.filter(t => (t.taxType || 'Exclusive').toLowerCase() !== 'inclusive');

    // To calculate net taxable amount from a price that is inclusive of taxes:
    // Net = Gross / (1 + sum(inclusivePercentageRates)/100)
    let totalInclusivePercentageRate = 0;
    let totalInclusiveFixedAmount = 0;

    for (const tax of inclusiveTaxes) {
        if (!tax.value || tax.value <= 0) continue;
        hasInclusiveTax = true;
        if ((tax.valueType || 'Percentage') === 'Percentage') {
            totalInclusivePercentageRate += tax.value;
        } else {
            totalInclusiveFixedAmount += tax.value * quantity;
        }
    }

    // Calculate actual net taxable amount
    const priceAfterFixedInclusive = discountedPrice - totalInclusiveFixedAmount;
    const netTaxableAmount = priceAfterFixedInclusive / (1 + totalInclusivePercentageRate / 100);

    // Populate inclusive tax breakdown
    for (const tax of inclusiveTaxes) {
        if (!tax.value || tax.value <= 0) continue;
        let itemTaxAmount = 0;
        if ((tax.valueType || 'Percentage') === 'Percentage') {
            itemTaxAmount = (netTaxableAmount * tax.value) / 100;
        } else {
            itemTaxAmount = tax.value * quantity;
        }
        inclusiveTaxTotal += itemTaxAmount;
        taxBreakdown.push({
            taxId: tax._id || '',
            taxName: tax.taxName || 'Tax',
            taxType: 'Inclusive',
            valueType: tax.valueType || 'Percentage',
            value: tax.value,
            taxAmount: itemTaxAmount,
        });
    }

    // Now calculate exclusive taxes based on netTaxableAmount
    for (const tax of exclusiveTaxes) {
        if (!tax.value || tax.value <= 0) continue;
        hasExclusiveTax = true;
        let itemTaxAmount = 0;
        const taxRate = tax.value;
        const valueType = tax.valueType || 'Percentage';
        if (valueType === 'Percentage') {
            itemTaxAmount = (netTaxableAmount * taxRate) / 100;
        } else {
            itemTaxAmount = taxRate * quantity;
        }
        exclusiveTaxTotal += itemTaxAmount;
        taxBreakdown.push({
            taxId: tax._id || '',
            taxName: tax.taxName || 'Tax',
            taxType: 'Exclusive',
            valueType,
            value: taxRate,
            taxAmount: itemTaxAmount,
        });
    }

    const totalTaxAmount = inclusiveTaxTotal + exclusiveTaxTotal;
    const finalPayable = discountedPrice + exclusiveTaxTotal;

    return {
        taxAmount: totalTaxAmount,
        taxableAmount: netTaxableAmount,
        netAmount: netTaxableAmount,
        finalPayable,
        taxBreakdown,
        hasExclusiveTax,
        hasInclusiveTax,
    };
}

type CreateSaleFormData = Yup.InferType<typeof createSaleSchema>;

interface SalesFormProps {
    readonly onSubmit: (data: any) => Promise<void>;
    readonly onCancel: () => void;
    readonly sale?: AdminTypes.SalesTypes.Sales.Sales | null;
    readonly initialCustomers?: any[];
    readonly initialStores?: any[];
    readonly initialProducts?: any[];
    readonly initialCategories?: any[];
    readonly initialSubcategories?: any[];
}

export default function SalesForm({
    onSubmit,
    onCancel,
    sale: editingSale,
    initialCustomers = [],
    initialStores = [],
    initialProducts = [],
    initialCategories = [],
    initialSubcategories = [],
}: SalesFormProps) {
    const [customers, setCustomers] = React.useState<PosCustomer[]>(() =>
        initialCustomers.map((c: any) => ({
            id: c._id || c.id,
            code: c.customerCode || c.code || '',
            customerName: c.customerName || c.fullName || c.name || '',
            phone: c.phone || c.mobile || '',
            email: c.email || ''
        }))
    );
    const [stores, setStores] = React.useState<Array<{ id: string; name: string }>>(() =>
        initialStores.map((s: any) => ({
            id: s._id || s.id,
            name: s.name || s.storeName || ''
        }))
    );
    const [categories, setCategories] = React.useState<any[]>(initialCategories);
    const [subCategories, setSubCategories] = React.useState<any[]>(initialSubcategories);
    const [products, setProducts] = React.useState<PosProduct[]>([]);
    const [cart, setCart] = React.useState<CartItem[]>([]);
    const [customer, setCustomer] = React.useState<PosCustomer | null>(null);
    const [selectedStore, setSelectedStore] = React.useState<{ id: string; name: string } | null>(null);
    const [customerSearch, setCustomerSearch] = React.useState<string>('');
    const [productQuery, setProductQuery] = React.useState<string>('');
    const [showCustomerModal, setShowCustomerModal] = React.useState<boolean>(false);
    const [newCustomerForm, setNewCustomerForm] = React.useState<{ customerCode: string; customerName: string; phone: string; email: string }>({
        customerCode: '',
        customerName: '',
        phone: '',
        email: ''
    });
    const [countryCode, setCountryCode] = React.useState('+91');
    const [productCategoryFilter, setProductCategoryFilter] = React.useState<string>("All");
    const [productSubcategoryFilter, setProductSubcategoryFilter] = React.useState<string>("All");
    const [isSavingCustomer, setIsSavingCustomer] = React.useState<boolean>(false);
    const [loading, setLoading] = React.useState(false);
    const [showTaxDetails, setShowTaxDetails] = React.useState(false);
    const [showInclusiveTaxDetails, setShowInclusiveTaxDetails] = React.useState(false);

    const inclusiveTaxDetailsList = React.useMemo(() => {
        const details: any[] = [];
        cart.forEach(item => {
            item.taxBreakdown?.forEach(t => {
                if (t.taxType === 'Inclusive') {
                    const itemSubtotal = item.product.price * item.quantity - item.discountAmount;
                    details.push({
                        productName: item.product.name,
                        taxName: t.taxName,
                        taxAmount: t.taxAmount,
                        taxRate: t.valueType === 'Percentage' ? `${t.value}%` : `$${t.value}`,
                        taxableAmount: itemSubtotal - t.taxAmount
                    });
                }
            });
        });
        return details;
    }, [cart]);

    const exclusiveTaxDetailsList = React.useMemo(() => {
        const details: any[] = [];
        cart.forEach(item => {
            item.taxBreakdown?.forEach(t => {
                if (t.taxType === 'Exclusive') {
                    details.push({
                        productName: item.product.name,
                        taxName: t.taxName,
                        taxAmount: t.taxAmount,
                        taxRate: t.valueType === 'Percentage' ? `${t.value}%` : `$${t.value}`
                    });
                }
            });
        });
        return details;
    }, [cart]);

    const hasFetchedData = React.useRef(false);

    // --- Form Setup ---
    const {
        control,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
        trigger,
    } = useForm<CreateSaleFormData>({
        resolver: yupResolver(createSaleSchema) as any,
        defaultValues: {
            store: "",
            customerId: "",
            paymentMethod: "Cash",
            receivedAmount: 0,
            products: [],
            notes: "",
        },
    });

    const watchedPaymentMethod = watch("paymentMethod");
    const watchedReceivedAmount = watch("receivedAmount");

    // --- Product Mapping Logic ---
    const mapProducts = React.useCallback((inputProducts: any[]) => {
        const mappedProducts: PosProduct[] = [];
        const getObjId = (obj: any): string => {
            if (!obj) return '';
            if (typeof obj === 'string') return obj;
            return obj._id || obj.id || '';
        };

        inputProducts.forEach((product: any) => {
            const id = product._id || product.id || '';
            const name = product.productName || product.name || '';
            if (!id || !name) return;

            const sku = product.SKU || product.sku || '';
            const barcode = product.barcode || product.barCode || '';

            // Common Tax Mapping helper
            const getTaxes = (item: any) => {
                let productTaxes: ProductTax[] | null = null;
                let taxPercent = 0;

                if (Array.isArray(item.tax)) {
                    const mappedTaxes: ProductTax[] = item.tax.map((t: any) => ({
                        _id: t._id || t.id,
                        taxName: t.taxName || t.name || 'Tax',
                        taxType: t.taxType || 'Exclusive',
                        valueType: t.valueType || 'Percentage',
                        value: Number(t.value || 0)
                    }));
                    productTaxes = mappedTaxes;
                    taxPercent = mappedTaxes.reduce((sum, t) => sum + (t.taxType === 'Exclusive' ? Number(t.value || 0) : 0), 0);
                } else if (typeof item.tax === 'object' && item.tax !== null) {
                    const singleTax: ProductTax = {
                        _id: item.tax._id || item.tax.id,
                        taxName: item.tax.taxName || item.tax.name || 'Tax',
                        taxType: item.tax.taxType || 'Exclusive',
                        valueType: item.tax.valueType || 'Percentage',
                        value: Number(item.tax.value || 0)
                    };
                    productTaxes = [singleTax];
                    taxPercent = singleTax.taxType === 'Exclusive' ? singleTax.value : 0;
                }
                return { productTaxes, taxPercent };
            };

            const { productTaxes, taxPercent } = getTaxes(product);

            if (product.hasVariation && Array.isArray(product.variantData) && product.variantData.length > 0) {
                product.variantData.forEach((variant: any) => {
                    if (variant.status === false) return; // Skip inactive variants

                    const variantId = variant._id || variant.id || '';
                    const variantTitle = variant.variantTitle || '';
                    const variantName = variantTitle ? `${name} (${variantTitle})` : name;
                    const variantSku = variant.SKU || variant.sku || sku;
                    const variantBarcode = variant.barcode || barcode;
                    const variantPrice = Number(variant.sellingPrice ?? product.sellingPrice ?? 0);

                    let variantStock = 0;
                    if (Array.isArray(variant.stock?.storeStock)) {
                        const storeStock = variant.stock.storeStock.find((stock: any) =>
                            selectedStore ? stock.storeId === selectedStore.id : true
                        );
                        variantStock = storeStock?.quantity || 0;
                    } else if (typeof variant.totalStock === 'number') {
                        variantStock = variant.totalStock;
                    }

                    const subcategoryId = getObjId(product.subCategory) || product.subCategoryId || '';
                    const categoryId = typeof product.category === 'object' ? (product.category?._id || product.category?.id) : product.category || '';

                    mappedProducts.push({
                        id: variantId || `${id}-${variantSku}`,
                        name: variantName,
                        sku: variantSku,
                        barcode: variantBarcode,
                        price: variantPrice,
                        taxes: productTaxes,
                        taxPercent: taxPercent,
                        taxType: (productTaxes?.some(t => t.taxType === 'Inclusive') ? 'Inclusive' : 'Exclusive'),
                        taxable: (productTaxes?.length ?? 0) > 0,
                        discount: Number(variant.discount ?? product.discount ?? 0),
                        discountType: (variant.discountType ?? product.discountType ?? 'Percentage') as 'Percentage' | 'Fixed',
                        stock: variantStock,
                        categoryId: categoryId,
                        subcategoryId: subcategoryId,
                    });
                });
            } else {
                const price = Number(product.sellingPrice ?? product.price ?? 0);

                let stockQty = 0;
                if (Array.isArray(product.stock?.storeStock)) {
                    const storeStock = product.stock.storeStock.find((stock: any) =>
                        selectedStore ? stock.storeId === selectedStore.id : true
                    );
                    stockQty = storeStock?.quantity || 0;
                } else if (typeof product.totalQuantity === 'number') {
                    stockQty = product.totalQuantity;
                } else if (typeof product.quantity === 'number') {
                    stockQty = product.quantity;
                }

                const subcategoryId = getObjId(product.subCategory) || product.subCategoryId || '';
                const categoryId = typeof product.category === 'object' ? (product.category?._id || product.category?.id) : product.category || '';

                mappedProducts.push({
                    id,
                    name,
                    sku,
                    barcode,
                    price,
                    taxes: productTaxes,
                    taxPercent: taxPercent,
                    taxType: (productTaxes?.some(t => t.taxType === 'Inclusive') ? 'Inclusive' : 'Exclusive'),
                    taxable: (productTaxes?.length ?? 0) > 0,
                    discount: Number(product.discount ?? 0),
                    discountType: (product.discountType ?? 'Percentage') as 'Percentage' | 'Fixed',
                    stock: stockQty,
                    categoryId: categoryId,
                    subcategoryId: subcategoryId,
                });
            }
        });

        return mappedProducts;
    }, [selectedStore]);

    // --- Effects ---

    // Fetch initial data
    React.useEffect(() => {
        const fetchInitialData = async () => {
            if (hasFetchedData.current) return;
            try {
                hasFetchedData.current = true;
                const allData = await ServerActions.ServerActionslib.getAllPosProductsAction();
                const responseData = allData?.data?.data || allData?.data || {};
                let currentStores: any[] = [];

                if (allData?.success) {
                    if (responseData.customers && Array.isArray(responseData.customers)) {
                        setCustomers(responseData.customers.map((c: any) => ({
                            id: c._id || c.id,
                            code: c.customerCode || c.code || '',
                            customerName: c.customerName || c.fullName || c.name || '',
                            phone: c.phone || c.mobile || '',
                            email: c.email || ''
                        })));
                    }
                    if (responseData.stores && Array.isArray(responseData.stores)) {
                        currentStores = responseData.stores.map((s: any) => ({
                            id: s._id || s.id,
                            name: s.name || s.storeName || ''
                        }));
                        setStores(currentStores);
                    }
                    if (responseData.categories && Array.isArray(responseData.categories)) {
                        setCategories(responseData.categories);
                    }
                    if (responseData.subCategories && Array.isArray(responseData.subCategories)) {
                        setSubCategories(responseData.subCategories);
                    } else if (responseData.subcategories && Array.isArray(responseData.subcategories)) {
                        setSubCategories(responseData.subcategories);
                    }
                }

                let targetStoreId = selectedStore?.id;
                if (!targetStoreId && currentStores.length > 0 && !editingSale) {
                    targetStoreId = currentStores[0].id;
                    setSelectedStore(currentStores[0]);
                }

                if (targetStoreId) {
                    const categoryId = productCategoryFilter !== 'All' ? productCategoryFilter : undefined;
                    const response = await ServerActions.ServerActionslib.getActiveProductsAction(targetStoreId, categoryId);

                    if (response.success) {
                        const productsData = response?.data?.data?.products || response?.data?.data || response?.data || [];
                        setProducts(mapProducts(productsData));
                    }
                }
            } catch (error) {
                console.error("Failed to fetch data", error);
                hasFetchedData.current = false;
            }
        };

        fetchInitialData();
    }, []);

    React.useEffect(() => {
        if (!hasFetchedData.current && !editingSale) return;

        const fetchFilteredProducts = async () => {
            const storeId = selectedStore?.id;
            if (!storeId) return;

            try {
                const categoryId = productCategoryFilter !== 'All' ? productCategoryFilter : undefined;
                const response = await ServerActions.ServerActionslib.getActiveProductsAction(storeId, categoryId);
                if (response.success) {
                    const level1 = response.data;
                    const level2 = response.data?.data;
                    let productsList: any[] = [];
                    if (Array.isArray(level2?.products)) {
                        productsList = level2.products;
                    } else if (Array.isArray(level1?.products)) {
                        productsList = level1.products;
                    } else if (Array.isArray(level2)) {
                        productsList = level2;
                    } else if (Array.isArray(level1)) {
                        productsList = level1;
                    }
                    setProducts(mapProducts(productsList));
                }
            } catch (error) {
                console.error("Failed to fetch filtered products", error);
            }
        };

        if (selectedStore?.id || productCategoryFilter !== 'All') {
            fetchFilteredProducts();
        }
    }, [selectedStore, productCategoryFilter, mapProducts, editingSale]);

    // Initialize editing sale
    React.useEffect(() => {
        if (editingSale) {
            // Customer mapping
            const customerId = editingSale.customerId || editingSale.customer || (editingSale.customerSnapshot as any)?.id;
            const foundCustomer = customers.find(c => c.id === customerId);
            if (foundCustomer) {
                setCustomer(foundCustomer);
                setCustomerSearch(foundCustomer.customerName);
            } else if (editingSale.customerSnapshot) {
                // Fallback to snapshot if not in current customers list
                const snap = editingSale.customerSnapshot;
                const snapCust: PosCustomer = {
                    id: customerId as string,
                    customerName: snap.customerName,
                    code: snap.customerCode,
                    phone: snap.phone,
                    email: snap.email
                };
                setCustomer(snapCust);
                setCustomerSearch(snap.customerName);
            }

            // Store mapping
            const storeId = editingSale.storeId || (typeof editingSale.store === 'string' ? editingSale.store : (editingSale.store as any)?._id || (editingSale.store as any)?.id);
            const foundStore = stores.find(s => s.id === storeId || s.name === storeId);
            if (foundStore) {
                setSelectedStore(foundStore);
            }

            // Products / Cart mapping
            const itemsToMap = (Array.isArray(editingSale.products) && editingSale.products.length > 0)
                ? editingSale.products
                : (Array.isArray(editingSale.items) ? editingSale.items : []);

            if (itemsToMap.length > 0) {
                const mappedCartItems: CartItem[] = itemsToMap.map((item: any) => {
                    const productId = item.productId || item.id || item.product;

                    // Try to find the actual product from the loaded list to get latest metadata
                    // but prioritize the snapshot data for what was actually sold
                    const matchedProduct = products.find(p => p.id === productId);

                    // Reconstruct taxes from snapshots if available
                    let itemTaxes: ProductTax[] | null = null;
                    if (Array.isArray(item.taxSnapshots)) {
                        itemTaxes = item.taxSnapshots.map((ts: any) => ({
                            taxName: ts.taxName,
                            taxType: ts.taxType || 'Exclusive',
                            valueType: ts.valueType || 'Percentage',
                            value: ts.percentage || ts.value || 0,
                            _id: ts.taxId
                        }));
                    }

                    const productData: PosProduct = {
                        id: productId,
                        name: item.productName || item.name || matchedProduct?.name || 'Unknown',
                        sku: item.sku || item.SKU || matchedProduct?.sku || '',
                        price: item.unitPrice || item.sellingPrice || item.price || matchedProduct?.price || 0,
                        taxes: itemTaxes || item.taxes || matchedProduct?.taxes || null,
                        taxPercent: item.taxPercent || matchedProduct?.taxPercent || 0,
                        taxType: (item.taxType || matchedProduct?.taxType || 'Exclusive') as 'Exclusive' | 'Inclusive',
                        taxable: true,
                        stock: matchedProduct?.stock || 0,
                        categoryId: item.category || matchedProduct?.categoryId || "",
                        subcategoryId: item.subCategory || matchedProduct?.subcategoryId || "",
                        discount: item.productDiscountPercent || matchedProduct?.discount || 0,
                        discountType: (item.discountType || matchedProduct?.discountType || 'Percentage') as 'Percentage' | 'Fixed'
                    };

                    const qty = item.quantity || 1;
                    const discount = productData.discount;
                    const discountType = productData.discountType;
                    const discountAmount = item.productDiscountAmount || calculateItemDiscount(productData.price, qty, discount, discountType);
                    const { taxAmount, taxBreakdown, finalPayable } = calculateItemTaxes(productData.price, qty, discountAmount, productData.taxes);

                    return {
                        product: productData,
                        quantity: qty,
                        discount: discount,
                        discountType: discountType as 'Percentage' | 'Fixed',
                        discountAmount: discountAmount,
                        taxAmount: item.taxAmount || taxAmount,
                        taxBreakdown: item.taxBreakdown || taxBreakdown,
                        total: item.netAmount ? (item.netAmount + (item.exclusiveTaxAmount || 0)) : finalPayable
                    };
                });
                setCart(mappedCartItems);
            }

            // Payment and notes
            setValue("paymentMethod", editingSale.paymentMethod || (editingSale.paymentDetails?.[0]?.method ? (editingSale.paymentDetails[0].method.charAt(0).toUpperCase() + editingSale.paymentDetails[0].method.slice(1)) : "Cash") as any);
            setValue("notes", editingSale.notes || "");
            setValue("receivedAmount", editingSale.billingSummary?.amountPaid ?? editingSale.totalPaid ?? 0);
        }
    }, [editingSale, customers, stores, products, setValue]);

    // Sync form values
    React.useEffect(() => {
        setValue("store", selectedStore?.id || "");
        if (selectedStore?.id) trigger("store");
    }, [selectedStore, setValue, trigger]);

    React.useEffect(() => {
        setValue("customerId", customer?.id || "");
        if (customer?.id) trigger("customerId");
    }, [customer, setValue, trigger]);

    React.useEffect(() => {
        setValue("products", cart);
        if (cart.length > 0) trigger("products");
    }, [cart, setValue, trigger]);

    // --- Handlers ---
    const calculateTotals = () => {
        const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
        const discount = cart.reduce((sum, item) => sum + (item.discountAmount || 0), 0);

        // Separate inclusive and exclusive taxes
        let inclusiveTax = 0;
        let exclusiveTax = 0;

        cart.forEach(item => {
            item.taxBreakdown?.forEach(t => {
                if (t.taxType === 'Inclusive') inclusiveTax += t.taxAmount;
                if (t.taxType === 'Exclusive') exclusiveTax += t.taxAmount;
            });
        });

        const rawTotal = cart.reduce((sum, item) => sum + (item.total || 0), 0);

        // Round to nearest integer (commercial rounding)
        const grandTotal = Math.round(rawTotal);
        // Avoid floating point errors (e.g. 0.300000000004)
        const roundOff = Math.round((grandTotal - rawTotal) * 100) / 100;

        const hasInclusiveTax = cart.some(item =>
            item.taxBreakdown?.some((t: any) => t.taxType === 'Inclusive')
        );
        const hasExclusiveTax = cart.some(item =>
            item.taxBreakdown?.some((t: any) => t.taxType === 'Exclusive')
        );

        return {
            subtotal,
            discount,
            tax: exclusiveTax, // For UI display (the additive part)
            totalTax: inclusiveTax + exclusiveTax, // For API reporting
            inclusiveTax,
            exclusiveTax,
            grandTotal,
            roundOff,
            hasInclusiveTax,
            hasExclusiveTax
        };
    };

    const totals = calculateTotals();

    // Auto-fill Received Amount with Grand Total
    React.useEffect(() => {
        setValue("receivedAmount", totals.grandTotal);
    }, [totals.grandTotal, setValue]);
    const changeReturn = Math.max(0, Number(watchedReceivedAmount) - totals.grandTotal);

    const addToCart = (product: PosProduct) => {
        if (product.stock <= 0) {
            WebComponents.UiComponents.UiWebComponents.SwalHelper.warning({ text: "Product out of stock" });
            return;
        }

        setCart(prev => {
            const existing = prev.find(p => p.product.id === product.id);
            if (existing) {
                if (existing.quantity >= product.stock) {
                    WebComponents.UiComponents.UiWebComponents.SwalHelper.warning({ text: `Stock limit reached (${product.stock})` });
                    return prev;
                }
                const newQty = existing.quantity + 1;
                const discountAmount = calculateItemDiscount(product.price, newQty, existing.discount, existing.discountType);
                const { taxAmount, taxBreakdown, finalPayable } = calculateItemTaxes(product.price, newQty, discountAmount, product.taxes);

                return prev.map(p => p.product.id === product.id ? {
                    ...p,
                    quantity: newQty,
                    discountAmount,
                    taxAmount,
                    taxBreakdown,
                    total: finalPayable
                } : p);
            }

            const discountAmount = calculateItemDiscount(product.price, 1, product.discount, product.discountType);
            const { taxAmount, taxBreakdown, finalPayable } = calculateItemTaxes(product.price, 1, discountAmount, product.taxes);

            return [...prev, {
                product,
                quantity: 1,
                discount: product.discount || 0,
                discountType: product.discountType || 'Percentage',
                discountAmount,
                taxAmount,
                taxBreakdown,
                total: finalPayable
            }];
        });
    };

    const removeFromCart = (productId: string) => {
        setCart(prev => prev.filter(p => p.product.id !== productId));
    };

    const updateQty = (productId: string, qty: number) => {
        if (qty < 1) return;
        setCart(prev => prev.map(p => {
            if (p.product.id === productId) {
                const finalQty = Math.min(qty, p.product.stock);
                if (qty > p.product.stock) {
                    WebComponents.UiComponents.UiWebComponents.SwalHelper.warning({ text: `Stock limit reached (${p.product.stock})` });
                }
                const discountAmount = calculateItemDiscount(p.product.price, finalQty, p.discount, p.discountType);
                const { taxAmount, taxBreakdown, finalPayable } = calculateItemTaxes(p.product.price, finalQty, discountAmount, p.product.taxes);

                return {
                    ...p,
                    quantity: finalQty,
                    discountAmount,
                    taxAmount,
                    taxBreakdown,
                    total: finalPayable
                };
            }
            return p;
        }));
    };

    const handleSaveCustomer = async () => {
        setIsSavingCustomer(true);
        try {
            const fullPhone = `${countryCode}${newCustomerForm.phone}`.trim();
            const customerPayload = {
                customerCode: newCustomerForm.customerCode,
                customerName: newCustomerForm.customerName,
                email: newCustomerForm.email,
                phone: fullPhone,
                isActive: true
            };
            const result = await ServerActions.ServerActionslib.createCustomerAction(customerPayload as any);
            if (result?.success) {
                const newCustData = result.data.data || result.data || {};
                const newCust: PosCustomer = {
                    id: newCustData._id || newCustData.id,
                    code: newCustData.customerCode || newCustData.code || '',
                    customerName: newCustData.customerName || newCustData.fullName || newCustData.name || '',
                    phone: newCustData.phone || '',
                    email: newCustData.email || ''
                };
                setCustomers(prev => [...prev, newCust]);
                setCustomer(newCust);
                setCustomerSearch(newCust.customerName);
                setShowCustomerModal(false);
                setNewCustomerForm({ customerCode: '', customerName: '', phone: '', email: '' });
                setCountryCode('+91');
                WebComponents.UiComponents.UiWebComponents.SwalHelper.success({ text: 'Customer added' });
            } else {
                throw new Error(result?.error || 'Failed');
            }
        } catch (e: any) {
            WebComponents.UiComponents.UiWebComponents.SwalHelper.error({ text: e.message });
        } finally {
            setIsSavingCustomer(false);
        }
    };

    const handleOpenCustomerModal = () => {
        const customerCode = `CUST-${Date.now().toString().slice(-4)}`;
        setNewCustomerForm({ customerCode, customerName: '', phone: '', email: '' });
        setShowCustomerModal(true);
    };

    const onFormSubmit = async (data: CreateSaleFormData) => {
        setLoading(true);
        try {
            const totals = calculateTotals();

            // 1. Build products array matching POS format
            const payloadProducts = cart.map(item => {
                const lineTotal = item.product.price * item.quantity;

                return {
                    product: item.product.id,
                    productName: item.product.name,
                    SKU: item.product.sku,
                    category: item.product.categoryId || "",
                    quantity: item.quantity,
                    netAmount: lineTotal,
                    taxAmount: item.taxAmount, // Use pre-calculated tax
                };
            });

            // 2. Build billing summary matching POS format
            const isCreditSale = data.paymentMethod === 'Credit Sale';
            const billingSummary = {
                subTotal: totals.subtotal - totals.discount,
                taxableAmount: totals.subtotal - totals.discount,
                taxTotal: totals.totalTax, // Accurate reporting of all taxes (Inc + Exc)
                grandTotal: totals.grandTotal,
                amountPaid: isCreditSale ? 0 : totals.grandTotal,
                balanceDue: isCreditSale ? totals.grandTotal : 0,
                roundingAdjustment: totals.roundOff,
            };

            // 3. Build payment details matching POS format
            const paymentDetails = [{
                method: data.paymentMethod.toLowerCase(),
                amount: isCreditSale ? 0 : totals.grandTotal,
                cashReceived: isCreditSale ? 0 : (data.receivedAmount || 0),
                changeReturned: isCreditSale ? 0 : Math.max(0, (data.receivedAmount || 0) - totals.grandTotal),
            }];

            // 4. Final Payload matching POS screen structure
            const finalPayload = {
                store: selectedStore?.id || data.store, // Use selectedStore.id for certainty
                customer: data.customerId,
                products: payloadProducts,
                billingSummary: billingSummary,
                paymentDetails: paymentDetails,
                saleStatus: data.paymentMethod === 'Credit Sale' ? 'pending' : 'completed',
                notes: data.notes,
            };

            await onSubmit(finalPayload as any);
        } catch (error) {
            console.error("Submission error:", error);
        } finally {
            setLoading(false);
        }
    };

    // --- Helpers for Render ---
    const productCategories = categories.map((c: any) => ({
        name: c.categoryName || c.name,
        value: c._id || c.id
    }));

    const suggestedProducts = products.filter(p => {
        const matchesSearch = productQuery ? (p.name.toLowerCase().includes(productQuery.toLowerCase()) || p.sku.toLowerCase().includes(productQuery.toLowerCase())) : true;
        return matchesSearch && p.stock > 0;
    });

    return (
        <>
            <div className="bg-white dark:bg-darkFilterbar rounded-[4px] mt-4">
                <form id="sales-form" onSubmit={handleSubmit(onFormSubmit)}>
                    <div className="p-4 sm:p-5 md:p-6 lg:p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6 lg:gap-8">

                            {/* Customer Selection */}
                            <div className="col-span-1">
                                <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="customerId">
                                    Customer <span className="text-required">*</span>
                                </WebComponents.UiComponents.UiWebComponents.FormLabel>
                                <div className="flex gap-2">
                                    <div className="flex-1">
                                        <Controller
                                            name="customerId"
                                            control={control}
                                            render={({ field }) => (
                                                <WebComponents.UiComponents.UiWebComponents.FormDropdown
                                                    id="customerId"
                                                    value={field.value || ""}
                                                    onChange={(e: any) => {
                                                        const val = e.target.value;
                                                        const c = customers.find(cust => cust.id === val);
                                                        setCustomer(c || null);
                                                        field.onChange(val);
                                                    }}
                                                    className={errors.customerId ? "border-red-500" : ""}
                                                >
                                                    <WebComponents.UiComponents.UiWebComponents.FormOption value="" disabled>Select Customer</WebComponents.UiComponents.UiWebComponents.FormOption>
                                                    {customers.map((c) => (
                                                        <WebComponents.UiComponents.UiWebComponents.FormOption key={c.id} value={c.id}>
                                                            {`${c.customerName} ${c.email ? `- ${c.email}` : `(${c.phone})`}`}
                                                        </WebComponents.UiComponents.UiWebComponents.FormOption>
                                                    ))}
                                                </WebComponents.UiComponents.UiWebComponents.FormDropdown>
                                            )}
                                        />
                                    </div>
                                    <WebComponents.UiComponents.UiWebComponents.Button type="button" variant="outline" size="icon" onClick={handleOpenCustomerModal}>
                                        <Plus className="w-4 h-4" />
                                    </WebComponents.UiComponents.UiWebComponents.Button>
                                </div>
                                {errors.customerId && (
                                    <p className="mt-1 text-sm text-required">{errors.customerId.message}</p>
                                )}
                            </div>

                            {/* Store Selection */}
                            <div className="col-span-1">
                                <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="store">
                                    Store <span className="text-required">*</span>
                                </WebComponents.UiComponents.UiWebComponents.FormLabel>
                                <Controller
                                    name="store"
                                    control={control}
                                    render={({ field }) => (
                                        <WebComponents.UiComponents.UiWebComponents.FormDropdown
                                            id="store"
                                            value={selectedStore?.id || ""}
                                            onChange={(e: any) => {
                                                const val = e.target.value;
                                                const s = stores.find(st => st.id === val);
                                                setSelectedStore(s || null);
                                                field.onChange(s?.id || "");
                                            }}
                                            className={errors.store ? "border-red-500" : ""}
                                        >
                                            <WebComponents.UiComponents.UiWebComponents.FormOption value="" disabled>Select Store</WebComponents.UiComponents.UiWebComponents.FormOption>
                                            {stores.map((s) => (
                                                <WebComponents.UiComponents.UiWebComponents.FormOption key={s.id} value={s.id}>
                                                    {s.name}
                                                </WebComponents.UiComponents.UiWebComponents.FormOption>
                                            ))}
                                        </WebComponents.UiComponents.UiWebComponents.FormDropdown>
                                    )}
                                />
                                {errors.store && (
                                    <p className="mt-1 text-sm text-required">{errors.store.message}</p>
                                )}
                            </div>

                            {/* Product Selection Area */}
                            <div className="col-span-1 md:col-span-2 border-[0.6px] border-[#D8D9D9] dark:border-[#616161] rounded-lg p-4">
                                <h3 className="font-semibold mb-3 text-textMain dark:text-white">Product Selection</h3>
                                <div className="flex flex-col sm:flex-row gap-3 mb-3">
                                    <div className="w-full sm:w-1/4">
                                        <WebComponents.UiComponents.UiWebComponents.FormDropdown
                                            value={productCategoryFilter}
                                            onChange={(e: any) => {
                                                setProductCategoryFilter(e.target.value);
                                                setProductSubcategoryFilter("All");
                                            }}
                                        >
                                            <WebComponents.UiComponents.UiWebComponents.FormOption value="All">All Categories</WebComponents.UiComponents.UiWebComponents.FormOption>
                                            {productCategories.map(c => (
                                                <WebComponents.UiComponents.UiWebComponents.FormOption key={c.value} value={c.value}>{c.name}</WebComponents.UiComponents.UiWebComponents.FormOption>
                                            ))}
                                        </WebComponents.UiComponents.UiWebComponents.FormDropdown>
                                    </div>
                                    <div className="w-full sm:w-3/4">
                                        <WebComponents.UiComponents.UiWebComponents.FormInput
                                            placeholder="Search Product by name or SKU..."
                                            value={productQuery}
                                            onChange={(e: any) => setProductQuery(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {!selectedStore && <div className="text-center py-4 text-gray-500">Select a store to view products</div>}

                                {selectedStore && (
                                    <div className="max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-md">
                                        {suggestedProducts.length > 0 ? (
                                            suggestedProducts.map(p => (
                                                <div key={p.id} className="flex justify-between items-center p-2 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer" onClick={() => addToCart(p)}>
                                                    <div>
                                                        <div className="font-medium text-sm text-textMain dark:text-white">{p.name}</div>
                                                        <div className="text-xs text-gray-500">Stock: {p.stock} | SKU: {p.sku} | Price: {p.price}</div>
                                                    </div>
                                                    <WebComponents.UiComponents.UiWebComponents.Button type="button" size="icon" variant="outline" className="h-6 w-6">
                                                        <Plus className="w-3 h-3" />
                                                    </WebComponents.UiComponents.UiWebComponents.Button>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-4 text-gray-500">No products found for this store/filter</div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Cart Area */}
                            <div className="col-span-1 md:col-span-2 border-[0.6px] border-[#D8D9D9] dark:border-[#616161] rounded-lg p-4">
                                <div className="flex justify-between mb-2">
                                    <h3 className="font-semibold text-textMain dark:text-white">Cart</h3>
                                    <WebComponents.UiComponents.UiWebComponents.Button type="button" variant="outline" size="sm" onClick={() => setCart([])}>Clear</WebComponents.UiComponents.UiWebComponents.Button>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead>
                                            <tr className="border-b dark:border-gray-600">
                                                <th className="py-2 text-textMain dark:text-white">Product</th>
                                                <th className="text-center text-textMain dark:text-white">Qty</th>
                                                <th className="text-center text-textMain dark:text-white">Price</th>
                                                <th className="text-right text-textMain dark:text-white">Total</th>
                                                <th></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {cart.map(item => (
                                                <tr key={item.product.id} className="border-b dark:border-gray-700">
                                                    <td className="py-2 text-textMain dark:text-white">{item.product.name}</td>
                                                    <td className="text-center">
                                                        <input
                                                            type="number"
                                                            className="w-16 text-center border rounded p-1 bg-transparent dark:text-white"
                                                            value={item.quantity}
                                                            min={1}
                                                            max={item.product.stock}
                                                            onChange={(e) => updateQty(item.product.id, parseInt(e.target.value) || 1)}
                                                        />
                                                    </td>
                                                    <td className="text-center text-textMain dark:text-white">{item.product.price}</td>
                                                    <td className="text-right text-textMain dark:text-white">{item.total.toFixed(2)}</td>
                                                    <td className="text-right">
                                                        <button type="button" onClick={() => removeFromCart(item.product.id)} className="text-red-500 hover:text-red-700">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {cart.length === 0 && (
                                                <tr>
                                                    <td colSpan={5} className="text-center py-4 text-gray-500">Cart is empty</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Summary and Payment */}
                            <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="border-[0.6px] border-[#D8D9D9] dark:border-[#616161] rounded-lg p-4 h-fit">
                                    <h3 className="font-semibold mb-3 text-textMain dark:text-white">Totals</h3>
                                    <div className="space-y-2 text-sm text-textMain dark:text-white">
                                        <div className="flex justify-between"><span>Subtotal (Gross)</span><span>{totals.subtotal.toFixed(2)}</span></div>
                                        {totals.discount > 0 && (
                                            <>
                                                <div className="flex justify-between text-required"><span>Discount</span><span>-{totals.discount.toFixed(2)}</span></div>
                                                <div className="flex justify-between font-medium">
                                                    <span>Subtotal</span>
                                                    <span>{(totals.subtotal - totals.discount).toFixed(2)}</span>
                                                </div>
                                            </>
                                        )}
                                        {totals.hasInclusiveTax && (
                                            <div className="flex justify-between text-gray-500 text-xs italic relative">
                                                <span className="inline-flex items-center gap-1">
                                                    Inclusive Tax (Included)
                                                    {inclusiveTaxDetailsList.length > 0 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowInclusiveTaxDetails(!showInclusiveTaxDetails)}
                                                            className="text-gray-400 hover:text-blue-500 transition-colors"
                                                        >
                                                            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" /></svg>
                                                        </button>
                                                    )}
                                                </span>
                                                <span>{totals.inclusiveTax.toFixed(2)}</span>

                                                {showInclusiveTaxDetails && inclusiveTaxDetailsList.length > 0 && (
                                                    <div className="absolute left-0 top-full mt-1 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-3 min-w-[280px]">
                                                        <div className="flex items-center justify-between mb-2 pb-2 border-b dark:border-gray-700">
                                                            <h4 className="text-xs font-semibold">Inclusive Tax Details</h4>
                                                            <button type="button" onClick={() => setShowInclusiveTaxDetails(false)}><X className="w-3 h-3 text-gray-400" /></button>
                                                        </div>
                                                        <div className="space-y-2 max-h-40 overflow-y-auto">
                                                            {inclusiveTaxDetailsList.map((detail, idx) => (
                                                                <div key={idx} className="text-[10px] p-1.5 bg-gray-50 dark:bg-gray-700/50 rounded flex flex-col gap-1">
                                                                    <div className="flex justify-between">
                                                                        <span className="font-medium truncate max-w-[150px]">{detail.productName}</span>
                                                                    </div>
                                                                    <div className="flex justify-between text-gray-500">
                                                                        <span>Taxable Value:</span>
                                                                        <span className="font-bold text-gray-700 dark:text-gray-200">${detail.taxableAmount.toFixed(2)}</span>
                                                                    </div>
                                                                    <div className="flex gap-1.5">
                                                                        <span className="px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded">{detail.taxName}</span>
                                                                        <span className="px-1.5 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded">{detail.taxRate}</span>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        <div className="flex justify-between relative">
                                            <span className="inline-flex items-center gap-1">
                                                Tax (Excl.)
                                                {totals.hasExclusiveTax && exclusiveTaxDetailsList.length > 0 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowTaxDetails(!showTaxDetails)}
                                                        className="text-gray-400 hover:text-blue-500 transition-colors"
                                                    >
                                                        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" /></svg>
                                                    </button>
                                                )}
                                            </span>
                                            <span>{totals.tax.toFixed(2)}</span>

                                            {showTaxDetails && exclusiveTaxDetailsList.length > 0 && (
                                                <div className="absolute left-0 top-full mt-1 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-3 min-w-[280px]">
                                                    <div className="flex items-center justify-between mb-2 pb-2 border-b dark:border-gray-700">
                                                        <h4 className="text-xs font-semibold">Exclusive Tax Details</h4>
                                                        <button type="button" onClick={() => setShowTaxDetails(false)}><X className="w-3 h-3 text-gray-400" /></button>
                                                    </div>
                                                    <div className="space-y-2 max-h-40 overflow-y-auto">
                                                        {exclusiveTaxDetailsList.map((detail, idx) => (
                                                            <div key={idx} className="text-[10px] p-1.5 bg-gray-50 dark:bg-gray-700/50 rounded flex flex-col gap-1">
                                                                <div className="flex justify-between">
                                                                    <span className="font-medium truncate max-w-[150px]">{detail.productName}</span>
                                                                    <span className="font-bold">${detail.taxAmount.toFixed(2)}</span>
                                                                </div>
                                                                <div className="flex gap-1.5">
                                                                    <span className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">{detail.taxName}</span>
                                                                    <span className="px-1.5 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded">{detail.taxRate}</span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        {Math.abs(totals.roundOff) > 0 && (
                                            <div className="flex justify-between text-gray-400 italic text-xs"><span>Round Off</span><span>{totals.roundOff > 0 ? '+' : ''}{totals.roundOff.toFixed(2)}</span></div>
                                        )}
                                        <div className="flex justify-between font-bold text-lg pt-2 border-t dark:border-gray-600"><span>Net Payable</span><span>{totals.grandTotal.toFixed(2)}</span></div>
                                    </div>
                                </div>
                                <div className="border-[0.6px] border-[#D8D9D9] dark:border-[#616161] rounded-lg p-4 space-y-4">
                                    <div>
                                        <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="paymentMethod">Payment Method</WebComponents.UiComponents.UiWebComponents.FormLabel>
                                        <Controller
                                            name="paymentMethod"
                                            control={control}
                                            render={({ field }) => (
                                                <WebComponents.UiComponents.UiWebComponents.FormDropdown id="paymentMethod" {...field}>
                                                    <WebComponents.UiComponents.UiWebComponents.FormOption value="Cash">Cash</WebComponents.UiComponents.UiWebComponents.FormOption>
                                                    <WebComponents.UiComponents.UiWebComponents.FormOption value="Card">Card</WebComponents.UiComponents.UiWebComponents.FormOption>
                                                    <WebComponents.UiComponents.UiWebComponents.FormOption value="Credit Sale">Credit Sale</WebComponents.UiComponents.UiWebComponents.FormOption>
                                                </WebComponents.UiComponents.UiWebComponents.FormDropdown>
                                            )}
                                        />
                                    </div>
                                    {watchedPaymentMethod !== 'Credit Sale' && (
                                        <div>
                                            <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="receivedAmount">Received Amount</WebComponents.UiComponents.UiWebComponents.FormLabel>
                                            <Controller
                                                name="receivedAmount"
                                                control={control}
                                                render={({ field }) => (
                                                    <WebComponents.UiComponents.UiWebComponents.FormInput
                                                        id="receivedAmount"
                                                        type="number"
                                                        {...field}
                                                        onChange={(e: any) => field.onChange(parseFloat(e.target.value))}
                                                    />
                                                )}
                                            />
                                            <div className="text-xs mt-1 text-gray-500">Change Return: {changeReturn}</div>
                                        </div>
                                    )}
                                    <div>
                                        <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="notes">Notes</WebComponents.UiComponents.UiWebComponents.FormLabel>
                                        <Controller
                                            name="notes"
                                            control={control}
                                            render={({ field }) => (
                                                <WebComponents.UiComponents.UiWebComponents.Textarea id="notes" {...field} value={field.value ?? ""} placeholder="Add specific notes here..." />
                                            )}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>



            {/* Customer Creation Modal */}
            {showCustomerModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white dark:bg-darkFilterbar p-6 rounded-lg w-full max-w-md shadow-xl border border-gray-200 dark:border-gray-600 animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg text-textMain dark:text-white">Add New Customer</h3>
                            <button type="button" onClick={() => setShowCustomerModal(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Customer Name */}
                            <div>
                                <WebComponents.UiComponents.UiWebComponents.FormLabel>Customer Name</WebComponents.UiComponents.UiWebComponents.FormLabel>
                                <WebComponents.UiComponents.UiWebComponents.FormInput
                                    placeholder="Enter Customer Name"
                                    value={newCustomerForm.customerName}
                                    onChange={(e: any) => setNewCustomerForm({ ...newCustomerForm, customerName: e.target.value })}
                                />
                            </div>

                            {/* Phone with Country Code */}
                            <div>
                                <WebComponents.UiComponents.UiWebComponents.FormLabel>Phone No</WebComponents.UiComponents.UiWebComponents.FormLabel>
                                <WebComponents.UiComponents.UiWebComponents.PhoneInputWithCountryCode
                                    countryCode={countryCode}
                                    phoneNumber={newCustomerForm.phone}
                                    onCountryCodeChange={setCountryCode}
                                    onPhoneNumberChange={(val: any) => setNewCustomerForm({ ...newCustomerForm, phone: val })}
                                    placeholder="Enter Phone Number"
                                    required
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <WebComponents.UiComponents.UiWebComponents.FormLabel>Email</WebComponents.UiComponents.UiWebComponents.FormLabel>
                                <WebComponents.UiComponents.UiWebComponents.FormInput
                                    placeholder="Enter Email Address"
                                    type="email"
                                    value={newCustomerForm.email}
                                    onChange={(e: any) => setNewCustomerForm({ ...newCustomerForm, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-3 pt-4 border-t dark:border-gray-700">
                            <WebComponents.UiComponents.UiWebComponents.Button type="button" variant="outline" onClick={() => setShowCustomerModal(false)}>Cancel</WebComponents.UiComponents.UiWebComponents.Button>
                            <WebComponents.UiComponents.UiWebComponents.Button
                                type="button"
                                onClick={handleSaveCustomer}
                                disabled={isSavingCustomer}
                            >
                                {isSavingCustomer ? 'Saving...' : 'Save Customer'}
                            </WebComponents.UiComponents.UiWebComponents.Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

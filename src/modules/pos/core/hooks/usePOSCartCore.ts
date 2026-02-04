'use client';

import { useState, useCallback, useMemo } from 'react';
import { customerAPI, couponAPI, posAPI } from '../pos.api';
import type { Product, OrderItem, Customer, Coupon, PaymentMethodType, ProductTax, RedemptionRule } from '../pos.types';

const DEFAULT_SHIPPING = 0;

// Helper function to calculate discount amount for an item
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
        // Fixed discount per unit
        return discount * quantity;
    }
}

// Tax breakdown item type
interface TaxBreakdownItem {
    taxId: string;
    taxName: string;
    taxType: 'Exclusive' | 'Inclusive';
    valueType: 'Percentage' | 'Fixed';
    value: number;
    taxAmount: number;
}

/**
 * GLOBAL TAX CALCULATION LOGIC (AUTHORITATIVE)
 * 
 * Core Rules:
 * 1. Discount is always applied first
 * 2. Tax is calculated on the net (discounted) amount
 * 3. A product CAN have BOTH inclusive and exclusive taxes
 * 4. Inclusive tax is extracted (never added again)
 * 5. Exclusive tax is added on top
 * 
 * EXCLUSIVE TAX: Tax is NOT included in product price → add tax on top after discount
 * INCLUSIVE TAX: Tax is already included in the price → extract tax only, don't add
 * 
 * If product has BOTH:
 * - Calculate inclusive taxes (extract from discountedPrice)
 * - Calculate exclusive taxes (add on top of discountedPrice)
 * - finalPayable = discountedPrice + exclusiveTaxTotal
 */
function calculateItemTaxes(
    basePrice: number,      // Product price (per unit)
    quantity: number,       // Quantity ordered
    discountAmount: number, // Absolute discount amount (already calculated)
    taxes: ProductTax[] | null | undefined
): {
    taxAmount: number;           // Total calculated tax (inclusive + exclusive)
    taxableAmount: number;       // Amount on which tax is calculated (after discount)
    netAmount: number;           // Net amount after extracting inclusive tax
    finalPayable: number;        // Final amount customer pays
    taxBreakdown: TaxBreakdownItem[];
    hasExclusiveTax: boolean;
    hasInclusiveTax: boolean;
    exclusiveTaxAmount: number;  // Only exclusive taxes
    inclusiveTaxAmount: number;  // Only inclusive taxes (extracted)
} {
    const subtotal = basePrice * quantity;
    // Rule 1: Discount is always applied first
    const discountedPrice = subtotal - discountAmount;

    // No taxes - return simple calculation
    if (!taxes || !Array.isArray(taxes) || taxes.length === 0) {
        return {
            taxAmount: 0,
            taxableAmount: discountedPrice,
            netAmount: discountedPrice,
            finalPayable: discountedPrice,
            taxBreakdown: [],
            hasExclusiveTax: false,
            hasInclusiveTax: false,
            exclusiveTaxAmount: 0,
            inclusiveTaxAmount: 0
        };
    }

    let exclusiveTaxTotal = 0;
    let inclusiveTaxTotal = 0;
    let hasExclusiveTax = false;
    let hasInclusiveTax = false;
    const taxBreakdown: TaxBreakdownItem[] = [];

    // Separate taxes by type
    const inclusiveTaxes = taxes.filter(t => (t.taxType || 'Exclusive').toUpperCase() === 'INCLUSIVE');
    const exclusiveTaxes = taxes.filter(t => (t.taxType || 'Exclusive').toUpperCase() !== 'INCLUSIVE');

    // 1. Calculate Inclusive Taxes FIRST
    // These are extracted from the discountedPrice
    for (const tax of inclusiveTaxes) {
        if (!tax.value || tax.value <= 0) continue;

        hasInclusiveTax = true;
        let itemTaxAmount = 0;
        const taxRate = tax.value;
        const valueType = tax.valueType || 'Percentage';

        if (valueType === 'Percentage') {
            // Formula: taxAmount = discountedPrice × taxRate / (100 + taxRate)
            itemTaxAmount = (discountedPrice * taxRate) / (100 + taxRate);
        } else {
            // Fixed tax per unit (already included)
            itemTaxAmount = taxRate * quantity;
        }

        inclusiveTaxTotal += itemTaxAmount;

        taxBreakdown.push({
            taxId: tax._id || '',
            taxName: tax.taxName || 'Tax',
            taxType: 'Inclusive',
            valueType,
            value: taxRate,
            taxAmount: itemTaxAmount,
        });
    }

    // 2. Determine Net Taxable Amount used for Exclusive Taxes
    // If inclusive taxes exist, the "Taxable Value" is the price *minus* those taxes.
    const netTaxableAmount = discountedPrice - inclusiveTaxTotal;

    // 3. Calculate Exclusive Taxes
    // These are added ON TOP of the netTaxableAmount (or discountedPrice if no inclusive tax)
    for (const tax of exclusiveTaxes) {
        if (!tax.value || tax.value <= 0) continue;

        hasExclusiveTax = true;
        let itemTaxAmount = 0;
        const taxRate = tax.value;
        const valueType = tax.valueType || 'Percentage';

        if (valueType === 'Percentage') {
            // Formula: taxAmount = netTaxableAmount × taxRate / 100
            // This ensures we don't tax the tax if inclusive tax is present
            itemTaxAmount = (netTaxableAmount * taxRate) / 100;
        } else {
            // Fixed tax per unit
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

    // Total tax = inclusive (extracted for display) + exclusive (added)
    const totalTaxAmount = inclusiveTaxTotal + exclusiveTaxTotal;

    // Final Payable:
    // - Inclusive tax is ALREADY in discountedPrice, so don't need to add it again
    // - Exclusive tax must be ADDED on top
    // However, conceptually: Final = NetAmount + InclusiveTax + ExclusiveTax
    // Which is: (discountedPrice - InclusiveTax) + InclusiveTax + ExclusiveTax = discountedPrice + ExclusiveTax
    const finalPayable = discountedPrice + exclusiveTaxTotal;

    return {
        taxAmount: totalTaxAmount,
        taxableAmount: netTaxableAmount, // Return net amount solely as the "Taxable Amount"
        netAmount: netTaxableAmount,
        finalPayable,
        taxBreakdown,
        hasExclusiveTax,
        hasInclusiveTax,
        exclusiveTaxAmount: exclusiveTaxTotal,
        inclusiveTaxAmount: inclusiveTaxTotal
    };
}

export interface UsePOSCartCoreReturn {
    // Order Items
    orderItems: OrderItem[];
    currentOrderNumber: string;

    // Customer
    customers: Customer[];
    selectedCustomer: Customer | null;
    isLoadingCustomers: boolean;

    // Coupon
    coupons: Coupon[];
    appliedCoupon: Coupon | null;

    // Redemption Rules
    redemptionRules: RedemptionRule[];

    // Payment
    selectedPaymentMethod: PaymentMethodType | null;

    // Calculations
    productPrice: number;
    discount: number;
    productDiscount: number;
    couponDiscount: number;
    loyaltyDiscount: number;
    giftCardDiscount: number;
    subTotal: number;
    shipping: number;
    tax: number;
    hasInclusiveTax: boolean;
    hasExclusiveTax: boolean;
    grandTotal: number;
    roundOff: number;

    // Actions
    addToOrder: (product: Product) => void;
    updateOrderItemQuantity: (itemId: string, quantity: number) => void;
    removeFromOrder: (itemId: string) => void;
    clearOrder: () => void;
    setSelectedCustomer: (customer: Customer | null) => void;
    setSelectedPaymentMethod: (method: PaymentMethodType | null) => void;
    applyCoupon: (code: string) => Promise<boolean>;
    removeCoupon: () => void;
    applyLoyalty: (amount: number) => void;
    removeLoyalty: () => void;
    applyGiftCard: (amount: number) => void;
    removeGiftCard: () => void;
    fetchCustomers: () => Promise<Customer[]>;
    fetchCoupons: () => Promise<Coupon[]>;
    createCustomer: (data: { name: string; phone: string; email?: string; code?: string }) => Promise<void>;
    getOrderItemByProductId: (productId: string) => OrderItem | null;

    // Data setters (for unified API)
    setCustomersData: (customers: Customer[]) => void;
    setCouponsData: (coupons: Coupon[]) => void;
    setRedemptionRulesData: (rules: RedemptionRule[]) => void;

    // Reset (called on store change)
    resetCart: () => void;
}

export function usePOSCartCore(): UsePOSCartCoreReturn {
    // Order Items
    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
    const [currentOrderNumber, setCurrentOrderNumber] = useState<string>(
        () => `#${Date.now().toString().slice(-7)}`
    );

    // Customer
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);

    // Coupon
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

    // Redemption Rules
    const [redemptionRules, setRedemptionRules] = useState<RedemptionRule[]>([]);

    // Loyalty Discount
    const [loyaltyDiscount, setLoyaltyDiscount] = useState<number>(0);

    // Gift Card Discount
    const [giftCardDiscount, setGiftCardDiscount] = useState<number>(0);

    // Payment
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethodType | null>(null);

    // Calculations - Product Price (sum of price * quantity for all items)
    const productPrice = useMemo(() => {
        return orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    }, [orderItems]);

    // Product Discount - sum of all item-level discounts
    const productDiscount = useMemo(() => {
        return orderItems.reduce((sum, item) => {
            return sum + (item.discountAmount || 0);
        }, 0);
    }, [orderItems]);

    const shipping = useMemo(() => {
        return orderItems.length > 0 ? DEFAULT_SHIPPING : 0;
    }, [orderItems.length]);

    // Coupon Discount - calculated based on subtotal after product discount
    const couponDiscount = useMemo(() => {
        if (!appliedCoupon) return 0;

        const discountableAmount = productPrice - productDiscount;

        if (appliedCoupon.type === 'percentage') {
            const discountAmount = discountableAmount * (appliedCoupon.value / 100);
            return appliedCoupon.maxDiscount
                ? Math.min(discountAmount, appliedCoupon.maxDiscount)
                : discountAmount;
        } else {
            return Math.min(appliedCoupon.value, discountableAmount);
        }
    }, [productPrice, productDiscount, appliedCoupon]);

    // SubTotal - amount after product and coupon discounts, before tax
    const subTotal = useMemo(() => {
        return Math.max(0, productPrice - productDiscount - couponDiscount);
    }, [productPrice, productDiscount, couponDiscount]);

    // Total Discount (sum of all discounts)
    const discount = useMemo(() => {
        return productDiscount + couponDiscount + loyaltyDiscount + giftCardDiscount;
    }, [productDiscount, couponDiscount, loyaltyDiscount, giftCardDiscount]);

    // Adjusted Order Items - Distribute coupon discount and recalculate taxes
    const adjustedOrderItems = useMemo(() => {
        // If there's no coupon discount, return original items
        // We still need to return a new array to ensure reference consistency if we were engaging in complex logic,
        // but simple return is okay if we treat orderItems as immutable enough.
        // However, to be safe and consistent with the types, we'll map if needed.
        if (couponDiscount <= 0) return orderItems;

        const totalDiscountable = productPrice - productDiscount;
        // Avoid division by zero
        if (totalDiscountable <= 0) return orderItems;

        return orderItems.map(item => {
            // Calculate item's share of the coupon discount
            // Share = (Item Subtotal / Total Discountable) * Coupon Discount
            const itemSubtotal = item.price * item.quantity - (item.discountAmount || 0);
            const ratio = itemSubtotal / totalDiscountable;
            const itemCouponShare = couponDiscount * ratio;

            // Total discount for this item (Product Discount + Coupon Share)
            const totalItemDiscount = (item.discountAmount || 0) + itemCouponShare;

            // Recalculate taxes based on the new total discount
            const { taxAmount, taxBreakdown, finalPayable } = calculateItemTaxes(
                item.price,
                item.quantity,
                totalItemDiscount,
                item.taxes
            );

            return {
                ...item,
                // Update discount amount to include coupon share so UI 'taxable value' calculation works
                discountAmount: totalItemDiscount,
                taxAmount,
                taxBreakdown,
                total: finalPayable
            };
        });
    }, [orderItems, couponDiscount, productPrice, productDiscount]);

    // Tax - sum of all item-level taxes (using adjusted items)
    const tax = useMemo(() => {
        return adjustedOrderItems.reduce((sum, item) => {
            return sum + (item.taxAmount || 0);
        }, 0);
    }, [adjustedOrderItems]);

    // Check if any items have inclusive or exclusive taxes
    const hasInclusiveTax = useMemo(() => {
        return adjustedOrderItems.some(item =>
            item.taxBreakdown?.some(tax => tax.taxType === 'Inclusive')
        );
    }, [adjustedOrderItems]);

    const hasExclusiveTax = useMemo(() => {
        return adjustedOrderItems.some(item =>
            item.taxBreakdown?.some(tax => tax.taxType === 'Exclusive')
        );
    }, [adjustedOrderItems]);

    // Grand Total
    // Each item.total in adjustedOrderItems already contains:
    // (Price - ProdDiscount - CouponShare) + ExclusiveTax
    // So Sum(item.total) = GrandTotal (excluding shipping)
    // Grand Total & Round Off
    // Calculate raw total, then round to nearest integer
    const { grandTotal, roundOff } = useMemo(() => {
        const itemsTotal = adjustedOrderItems.reduce((sum, item) => sum + (item.total || 0), 0);
        const rawTotal = Math.max(0, itemsTotal + shipping - loyaltyDiscount - giftCardDiscount);

        // Round to nearest integer (commercial rounding)
        const roundedTotal = Math.round(rawTotal);
        const diff = roundedTotal - rawTotal;

        return {
            grandTotal: roundedTotal,
            // Avoid floating point errors (e.g. 0.300000000004)
            roundOff: Math.round(diff * 100) / 100
        };
    }, [adjustedOrderItems, shipping, loyaltyDiscount, giftCardDiscount]);

    // Get order item by product ID
    const getOrderItemByProductId = useCallback((productId: string): OrderItem | null => {
        return orderItems.find(item => item.productId === productId) || null;
    }, [orderItems]);

    // Add product to order
    // Handles both simple products and variants
    const addToOrder = useCallback((product: Product) => {
        setOrderItems(prev => {
            // Check if product already exists in cart
            const existingItem = prev.find(item => item.productId === product._id);

            if (existingItem) {
                // Check stock before increasing quantity
                const newQty = existingItem.quantity + 1;
                if (product.stock > 0 && newQty > product.stock) {
                    console.warn(`Cannot add more. Stock limit reached: ${product.stock}`);
                    return prev;
                }

                // Recalculate discount and tax for new quantity
                const discountAmount = calculateItemDiscount(
                    existingItem.price,
                    newQty,
                    existingItem.discount,
                    existingItem.discountType
                );
                const { taxAmount, taxBreakdown, finalPayable } = calculateItemTaxes(
                    existingItem.price,
                    newQty,
                    discountAmount,
                    existingItem.taxes
                );

                return prev.map(item =>
                    item.productId === product._id
                        ? {
                            ...item,
                            quantity: newQty,
                            discountAmount,
                            taxAmount,
                            taxBreakdown,
                            subtotal: item.price * newQty,
                            total: finalPayable
                        }
                        : item
                );
            }

            // Check if product is in stock
            if (product.stock <= 0) {
                console.warn('Product out of stock:', product.name);
                // Still allow adding if we want to track out-of-stock orders
                // return prev;
            }

            // Calculate initial discount and tax amounts
            const discountAmount = calculateItemDiscount(
                product.price,
                1,
                product.discount,
                product.discountType
            );
            const { taxAmount, taxBreakdown, finalPayable } = calculateItemTaxes(
                product.price,
                1,
                discountAmount,
                product.taxes
            );

            // Create new order item with all product details including tax and discount
            const newItem: OrderItem = {
                id: product._id,
                productId: product._id,
                name: product.name,
                price: product.price,
                quantity: 1,

                // Discount info
                discount: product.discount || 0,
                discountType: product.discountType || 'Percentage',
                discountAmount: discountAmount,

                // Tax info (array of taxes)
                taxes: product.taxes || null,
                taxBreakdown: taxBreakdown,
                taxAmount: taxAmount,

                // Totals
                subtotal: product.price,
                total: finalPayable,

                image: product.image || '',
                sku: product.sku || '',
                barcode: product.barcode || '',
                isVariant: product.isVariant,
                variantAttributes: product.variantAttributes || [],
                notes: '',
            };

            return [...prev, newItem];
        });
    }, []);

    // Update item quantity - recalculates discount and tax amounts
    const updateOrderItemQuantity = useCallback((itemId: string, quantity: number) => {
        if (quantity <= 0) {
            setOrderItems(prev => prev.filter(item => item.id !== itemId));
        } else {
            setOrderItems(prev =>
                prev.map(item => {
                    if (item.id !== itemId) return item;

                    // Recalculate discount and tax for new quantity
                    const discountAmount = calculateItemDiscount(
                        item.price,
                        quantity,
                        item.discount,
                        item.discountType
                    );
                    const { taxAmount, taxBreakdown, finalPayable } = calculateItemTaxes(
                        item.price,
                        quantity,
                        discountAmount,
                        item.taxes
                    );

                    return {
                        ...item,
                        quantity,
                        discountAmount,
                        taxAmount,
                        taxBreakdown,
                        subtotal: item.price * quantity,
                        total: finalPayable
                    };
                })
            );
        }
    }, []);

    // Remove item from order
    const removeFromOrder = useCallback((itemId: string) => {
        setOrderItems(prev => prev.filter(item => item.id !== itemId));
    }, []);

    // Clear all order items
    const clearOrder = useCallback(() => {
        setOrderItems([]);
        setAppliedCoupon(null);
        setLoyaltyDiscount(0);
        setGiftCardDiscount(0);
        setSelectedPaymentMethod(null);
        // Generate new order number
        setCurrentOrderNumber(`#${Date.now().toString().slice(-7)}`);
    }, []);

    // Reset cart (called on store change)
    const resetCart = useCallback(() => {
        setOrderItems([]);
        setAppliedCoupon(null);
        setLoyaltyDiscount(0);
        setGiftCardDiscount(0);
        setSelectedPaymentMethod(null);
        setSelectedCustomer(null);
        setCurrentOrderNumber(`#${Date.now().toString().slice(-7)}`);
    }, []);

    // Fetch customers
    const fetchCustomers = useCallback(async (): Promise<Customer[]> => {
        setIsLoadingCustomers(true);

        try {
            // Use unified POS initialization API to refresh customers
            const response = await posAPI.initialize();

            if (response.success) {
                setCustomers(response.data.customers);
                return response.data.customers;
            }

            return [];
        } catch (err) {
            console.error('Error fetching customers:', err);
            return [];
        } finally {
            setIsLoadingCustomers(false);
        }
    }, []);

    // Fetch coupons
    const fetchCoupons = useCallback(async (): Promise<Coupon[]> => {
        try {
            // Use unified POS initialization API to refresh coupons
            const response = await posAPI.initialize();

            if (response.success) {
                setCoupons(response.data.coupons);
                return response.data.coupons;
            }

            return [];
        } catch (err) {
            console.error('Error fetching coupons:', err);
            return [];
        }
    }, []);

    // Apply coupon
    const applyCoupon = useCallback(async (code: string): Promise<boolean> => {
        try {
            // Updated to use server-side validation with customer ID
            const customerId = selectedCustomer?._id;
            const response = await couponAPI.validateCoupon(code, customerId);

            if (response.success && response.data) {
                setAppliedCoupon(response.data);
                return true;
            }

            return false;
        } catch (err) {
            console.error('Error applying coupon:', err);
            return false;
        }
    }, [selectedCustomer, productPrice]);

    // Remove coupon
    const removeCoupon = useCallback(() => {
        setAppliedCoupon(null);
    }, []);

    // Apply loyalty discount
    const applyLoyalty = useCallback((amount: number) => {
        setLoyaltyDiscount(amount);
    }, []);

    // Remove loyalty discount
    const removeLoyalty = useCallback(() => {
        setLoyaltyDiscount(0);
    }, []);

    // Apply gift card discount
    const applyGiftCard = useCallback((amount: number) => {
        setGiftCardDiscount(amount);
    }, []);

    // Remove gift card discount
    const removeGiftCard = useCallback(() => {
        setGiftCardDiscount(0);
    }, []);

    // Create customer
    const createCustomer = useCallback(async (data: { name: string; phone: string; email?: string; code?: string }) => {
        try {
            const response = await customerAPI.createCustomer(data);
            if (response.success && response.data) {
                const newCustomer = response.data;
                setCustomers((prev) => [...prev, newCustomer]);
                setSelectedCustomer(newCustomer);
            } else {
                console.error('Failed to create customer:', response.error);
                throw new Error(response.error || 'Failed to create customer');
            }
        } catch (error) {
            console.error('Error in createCustomer:', error);
            throw error;
        }
    }, []);

    // Data setters for unified API
    const setCustomersData = useCallback((customersData: Customer[]) => {
        setCustomers(customersData);
    }, []);

    const setCouponsData = useCallback((couponsData: Coupon[]) => {
        setCoupons(couponsData);
    }, []);

    const setRedemptionRulesData = useCallback((rulesData: RedemptionRule[]) => {
        setRedemptionRules(rulesData);
    }, []);

    return {
        // Return adjusted items so UI shows correct tax breakdowns and internal values
        orderItems: adjustedOrderItems,
        currentOrderNumber,
        customers,
        selectedCustomer,
        isLoadingCustomers,
        coupons,
        appliedCoupon,
        redemptionRules,
        selectedPaymentMethod,
        productPrice,
        discount,
        productDiscount,
        couponDiscount,
        loyaltyDiscount,
        giftCardDiscount,
        subTotal,
        shipping,
        tax,
        hasInclusiveTax,
        hasExclusiveTax,
        grandTotal,
        roundOff,
        addToOrder,
        updateOrderItemQuantity,
        removeFromOrder,
        clearOrder,
        setSelectedCustomer,
        setSelectedPaymentMethod,
        applyCoupon,
        removeCoupon,
        applyLoyalty,
        removeLoyalty,
        applyGiftCard,
        removeGiftCard,
        fetchCustomers,
        fetchCoupons,
        resetCart,
        createCustomer,
        getOrderItemByProductId,
        setCustomersData,
        setCouponsData,
        setRedemptionRulesData,
    };
}

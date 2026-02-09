'use client';

import React from 'react';
import {
    Trash2,
    Minus,
    Plus,
    ChevronDown,
    UserPlus,
    Printer,
    ShoppingBag,
    ShoppingCart,
    X,
    CreditCard,
    Wallet,
    Banknote,
    Coins,
    Gift,
    Clock,
    ScanLine,
    Tag,
    type LucideIcon,
} from 'lucide-react';
import type { OrderItem, Customer, Coupon, PaymentMethodType, RedemptionRule, AssignedGiftCard } from '../core/pos.types';
import type { PosOrderPanelConfig, PosCashPopupConfig } from './pos-ui.config';
import { redemptionRuleAPI, giftCardAPI } from '../core/pos.api';
import PosReceipt from '../receipts/PosReceipt';

// Payment method type
interface PaymentMethod {
    name: string;
    icon: LucideIcon;
}

// Default payment methods with icons
const paymentMethodsWithIcons: PaymentMethod[] = [
    { name: 'Cash', icon: Banknote },
    { name: 'Scan', icon: ScanLine },
    { name: 'Card', icon: CreditCard },
    { name: 'Loyalty Points', icon: Coins },
    { name: 'Gift Card', icon: Gift },
    { name: 'Pay Later', icon: Clock },
];

// Default config (used as fallback)
const DEFAULT_CONFIG: PosOrderPanelConfig = {
    wrapperClass: 'flex flex-col h-full',
    innerContainerClass: 'p-4 h-full flex flex-col overflow-y-auto',
    headerClass: 'flex items-center justify-between mb-4',
    headerRightClass: '',
    titleClass: 'text-lg font-semibold text-blue-600 dark:text-blue-400',
    orderNumberClass: 'text-sm text-purple-600 dark:text-purple-400',
    closeButtonClass: '',
    closeButtonIconClass: '',
    customerSectionClass: '',
    customerLabelClass: '',
    customerRowClass: '',
    customerDropdownClass: 'w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm',
    customerDropdownTextClass: '',
    customerDropdownIconClass: '',
    addCustomerButtonClass: 'bg-slate-700 text-white px-3 py-1 rounded text-sm hover:bg-orange-600 transition-colors',
    addCustomerIconClass: '',
    scrollableContentClass: '',
    orderDetailsSectionClass: '',
    orderDetailsCardClass: '',
    orderDetailsHeaderClass: 'flex items-center justify-between mb-3',
    orderDetailsTitleClass: 'font-medium text-blue-600 dark:text-blue-400',
    orderDetailsHeaderRightClass: 'flex items-center gap-2',
    itemsCountClass: 'text-sm text-gray-500 dark:text-gray-400',
    clearAllButtonClass: 'text-orange-500 hover:text-orange-600 transition-colors',
    tableClass: 'w-full',
    tableHeaderRowClass: 'bg-gray-100',
    tableHeaderCellClass: 'px-3 py-2 text-left text-xs font-medium text-gray-600',
    tableHeaderCellCenterClass: 'px-3 py-2 text-center text-xs font-medium text-gray-600',
    tableHeaderCellRightClass: 'px-3 py-2 text-right text-xs font-medium text-gray-600',
    orderItemClass: 'bg-gray-50 dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600',
    orderItemNameClass: 'font-medium text-sm text-gray-800 dark:text-gray-200',
    orderItemQtyContainerClass: 'px-3 py-2',
    orderItemQtyWrapperClass: 'flex items-center justify-center gap-1',
    quantityButtonClass: 'w-6 h-6 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center hover:bg-gray-300 transition-colors',
    quantityButtonIconClass: 'w-3 h-3 text-gray-600',
    quantityTextClass: 'w-8 text-center text-sm text-gray-800 dark:text-gray-200',
    itemPriceClass: 'font-medium text-gray-800 dark:text-gray-200',
    itemActionCellClass: 'px-3 py-2 text-center',
    removeButtonClass: 'text-red-500 hover:text-red-700 transition-colors',
    removeButtonIconClass: 'w-4 h-4',
    summarySectionClass: '',
    summaryCardClass: '',
    summaryTitleClass: 'text-base font-semibold text-blue-600 p-3',
    summaryDividerClass: '',
    summaryContainerClass: 'bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4',
    summaryRowClass: 'flex justify-between text-gray-700 dark:text-gray-300 text-sm',
    summaryLabelClass: '',
    summaryValueClass: 'font-medium',
    summaryDiscountValueClass: 'text-red-500',
    totalRowClass: 'border-t pt-2 flex justify-between font-bold text-lg text-gray-900 dark:text-gray-100',
    paymentSectionClass: '',
    paymentCardClass: '',
    paymentTitleClass: 'text-base font-semibold text-blue-600 p-3',
    paymentDividerClass: '',
    paymentMethodsContainerClass: '',
    paymentMethodsGridClass: 'grid grid-cols-3 gap-2 p-3',
    paymentMethodsGridMarginClass: '',
    paymentMethodButtonClass: 'flex flex-col items-center justify-center gap-1 py-2 rounded-md border-2 transition-all bg-white border-gray-200 text-gray-700 hover:border-gray-300',
    paymentMethodActiveClass: 'bg-blue-600 border-blue-600 text-white',
    actionsSectionClass: '',
    actionsCardClass: '',
    actionButtonsGridClass: 'grid grid-cols-2 gap-2',
    actionButtonClass: 'flex items-center justify-center gap-2 py-2 rounded-md font-medium',
    actionButtonIconClass: 'w-4 h-4',
    payButtonClass: 'flex items-center justify-center gap-2 py-3 rounded-lg bg-teal-500 text-white font-medium hover:bg-teal-600 transition-colors',
    payButtonIconClass: 'w-5 h-5',
    printButtonClass: 'flex items-center justify-center gap-2 py-2 rounded-md border border-gray-300 text-gray-700 font-medium hover:bg-gray-50',
    variant: 'default',
    showTable: false,
    showCustomerInHeader: false,
    showGrandTotalSeparate: false,
    showActionButtons: true,
    showPaymentMethods: true,
    usePaymentIcons: true,
    emptyStateClass: 'text-center text-gray-500 py-8 text-sm',
    emptyStateText: 'No items in cart',
};

export interface OrderPanelUIProps {
    orderItems: OrderItem[];
    orderNumber: string;
    selectedCustomer: Customer | null;
    customers: Customer[];
    onCustomerChange: (customer: Customer | null) => void;
    onAddCustomerClick: () => void;
    onUpdateQuantity: (itemId: string, quantity: number) => void;
    onRemoveItem: (itemId: string) => void;
    onClearAll: () => void;
    productPrice: number;
    productDiscount?: number;
    couponDiscount?: number;
    subTotal?: number;
    tax: number;
    hasInclusiveTax?: boolean;
    hasExclusiveTax?: boolean;
    loyaltyPoints?: number;
    giftCard?: number;
    roundOff?: number;
    grandTotal: number;
    taxLabel?: string;
    variant?: 'default' | 'compact' | 'table';
    className?: string;
    uiConfig?: PosOrderPanelConfig;
    onClose?: () => void;
    // Coupon props
    coupons?: Coupon[];
    appliedCoupon?: Coupon | null;
    onApplyCoupon?: (code: string) => Promise<boolean>;
    onRemoveCoupon?: () => void;
    onApplyLoyalty?: (discountAmount: number) => void;
    redemptionRules?: RedemptionRule[];
    onApplyGiftCard?: (discountAmount: number) => void;
    cashPopupConfig?: PosCashPopupConfig;
    onPlaceOrder?: (cashInfo?: { cashReceived: number; changeReturned: number }, promoInfo?: { couponCode?: string; giftCardNumber?: string; loyaltyPointsRedeemed?: number }) => void | Promise<void>;
}

export function OrderPanelUI({
    orderItems,
    orderNumber,
    selectedCustomer,
    customers,
    onCustomerChange,
    onAddCustomerClick,
    onUpdateQuantity,
    onRemoveItem,
    onClearAll,
    productPrice,
    productDiscount = 0,
    couponDiscount = 0,
    subTotal = 0,
    tax,
    hasInclusiveTax = false,
    hasExclusiveTax = false,
    loyaltyPoints = 0,
    giftCard = 0,
    roundOff = 0,
    grandTotal,
    taxLabel = 'Tax :',
    className = '',
    uiConfig,
    onClose,
    coupons = [],
    appliedCoupon = null,
    onApplyCoupon,
    onRemoveCoupon,
    onApplyLoyalty,
    redemptionRules = [],
    onApplyGiftCard,
    cashPopupConfig,
    onPlaceOrder,
}: OrderPanelUIProps) {
    const [selectedPaymentMethod, setSelectedPaymentMethod] = React.useState<string>('Cash');
    const [showTaxDetails, setShowTaxDetails] = React.useState(false);
    const [showInclusiveTaxDetails, setShowInclusiveTaxDetails] = React.useState(false);
    const [showCouponPopup, setShowCouponPopup] = React.useState(false);
    const [showLoyaltyPopup, setShowLoyaltyPopup] = React.useState(false);
    const [couponCode, setCouponCode] = React.useState('');
    const [isApplyingCoupon, setIsApplyingCoupon] = React.useState(false);
    const [couponError, setCouponError] = React.useState<string | null>(null);

    // Gift Card State
    const [showGiftCardPopup, setShowGiftCardPopup] = React.useState(false);
    const [selectedGiftCardNumber, setSelectedGiftCardNumber] = React.useState<string>('');
    const [giftCardSearch, setGiftCardSearch] = React.useState('');
    const [isApplyingGiftCard, setIsApplyingGiftCard] = React.useState(false);
    const [giftCardError, setGiftCardError] = React.useState<string | null>(null);
    const [showReceipt, setShowReceipt] = React.useState(false);

    // Ref for Pay/Place Order Button
    const payButtonRef = React.useRef<HTMLButtonElement>(null);

    // Cash Popup State
    const [showCashPopup, setShowCashPopup] = React.useState(false);
    const [cashTendered, setCashTendered] = React.useState<string>('');
    const cashAmount = parseFloat(cashTendered) || 0;
    const changeAmount = Math.max(0, cashAmount - grandTotal);

    const [appliedCash, setAppliedCash] = React.useState<{ amount: number; change: number } | null>(null);

    React.useEffect(() => {
        if (showCashPopup) {
            if (appliedCash) {
                setCashTendered(appliedCash.amount.toFixed(2));
            } else {
                setCashTendered(grandTotal.toFixed(2));
            }
        }
    }, [showCashPopup, grandTotal, appliedCash]);

    // Reset applied cash if grand total changes
    React.useEffect(() => {
        setAppliedCash(null);
    }, [grandTotal]);

    const renderAppliedCashInfo = () => {
        if (!appliedCash) return null;
        return (
            <>
                <div className={config.summaryRowClass}>
                    <span className={config.summaryLabelClass}>Cash Received:</span>
                    <span className={config.summaryValueClass}>${appliedCash.amount.toFixed(2)}</span>
                </div>
                <div className={config.summaryRowClass}>
                    <span className={config.summaryLabelClass}>Balance Returned:</span>
                    <span className={config.summaryValueClass}>${appliedCash.change.toFixed(2)}</span>
                </div>
            </>
        );
    };

    // Merge config with defaults
    const config = { ...DEFAULT_CONFIG, ...uiConfig };

    // Get INCLUSIVE tax details for all items - shown with SubTotal
    const inclusiveTaxDetailsList = React.useMemo(() => {
        const allTaxDetails: Array<{
            productName: string;
            taxName: string;
            taxType: 'Exclusive' | 'Inclusive';
            taxRate: string;
            taxAmount: number;
            taxableAmount: number;
        }> = [];

        orderItems.forEach(item => {
            if (item.taxBreakdown && item.taxBreakdown.length > 0) {
                item.taxBreakdown.forEach(taxItem => {
                    if (taxItem.taxType === 'Inclusive') {
                        // Calculate taxable amount (price after discount minus inclusive tax)
                        const itemSubtotal = item.price * item.quantity - (item.discountAmount || 0);
                        const taxableAmount = itemSubtotal - taxItem.taxAmount;
                        allTaxDetails.push({
                            productName: item.name,
                            taxName: taxItem.taxName,
                            taxType: taxItem.taxType,
                            taxRate: taxItem.valueType === 'Fixed'
                                ? `$${taxItem.value.toFixed(2)}`
                                : `${taxItem.value}%`,
                            taxAmount: taxItem.taxAmount,
                            taxableAmount: taxableAmount,
                        });
                    }
                });
            }
        });

        return allTaxDetails;
    }, [orderItems]);

    // Get EXCLUSIVE tax details for all items - shown with Tax
    const exclusiveTaxDetailsList = React.useMemo(() => {
        const allTaxDetails: Array<{
            productName: string;
            taxName: string;
            taxType: 'Exclusive' | 'Inclusive';
            taxRate: string;
            taxAmount: number;
        }> = [];

        orderItems.forEach(item => {
            if (item.taxBreakdown && item.taxBreakdown.length > 0) {
                item.taxBreakdown.forEach(taxItem => {
                    if (taxItem.taxType === 'Exclusive') {
                        allTaxDetails.push({
                            productName: item.name,
                            taxName: taxItem.taxName,
                            taxType: taxItem.taxType,
                            taxRate: taxItem.valueType === 'Fixed'
                                ? `$${taxItem.value.toFixed(2)}`
                                : `${taxItem.value}%`,
                            taxAmount: taxItem.taxAmount,
                        });
                    }
                });
            }
        });

        return allTaxDetails;
    }, [orderItems]);

    // Calculate total inclusive and exclusive tax amounts
    const totalInclusiveTax = React.useMemo(() => {
        return inclusiveTaxDetailsList.reduce((sum, item) => sum + item.taxAmount, 0);
    }, [inclusiveTaxDetailsList]);

    const totalExclusiveTax = React.useMemo(() => {
        return exclusiveTaxDetailsList.reduce((sum, item) => sum + item.taxAmount, 0);
    }, [exclusiveTaxDetailsList]);

    // Render Order Items - Table or Card based on config
    const renderOrderItems = () => {
        if (orderItems.length === 0) {
            return <div className={config.emptyStateClass}>{config.emptyStateText}</div>;
        }

        if (config.showTable) {
            // Table Layout
            return (
                <div className="overflow-x-auto">
                    <table className={config.tableClass}>
                        <thead>
                            <tr className={config.tableHeaderRowClass}>
                                <th className={config.tableHeaderCellClass}>Product</th>
                                <th className={config.tableHeaderCellCenterClass}>QTY</th>
                                <th className={config.tableHeaderCellRightClass}>Price</th>
                                <th className={config.tableHeaderCellRightClass}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orderItems.map((item) => (
                                <tr key={item.id} className={config.orderItemClass}>
                                    <td className={config.orderItemNameClass}>{item.name}</td>
                                    <td className={config.orderItemQtyContainerClass}>
                                        <div className={config.orderItemQtyWrapperClass}>
                                            <button
                                                onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                                                className={config.quantityButtonClass}
                                            >
                                                <Minus className={config.quantityButtonIconClass} />
                                            </button>
                                            <span className={config.quantityTextClass}>{item.quantity}</span>
                                            <button
                                                onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                                                className={config.quantityButtonClass}
                                            >
                                                <Plus className={config.quantityButtonIconClass} />
                                            </button>
                                        </div>
                                    </td>
                                    <td className={config.itemPriceClass}>${(item.price * item.quantity).toFixed(2)}</td>
                                    <td className={config.itemActionCellClass}>
                                        <button onClick={() => onRemoveItem(item.id)} className={config.removeButtonClass}>
                                            <Trash2 className={config.removeButtonIconClass} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
        }

        // Card Layout
        return (
            <div className={config.itemsWrapperClass || "space-y-2"}>
                {orderItems.map((item) => (
                    <div key={item.id} className={config.orderItemClass}>
                        {/* Left Side: Name and Price */}
                        <div className="flex flex-col flex-1 mr-2">
                            <span className={config.orderItemNameClass}>{item.name}</span>
                            <span className={config.itemPriceClass}>${(item.price * item.quantity).toFixed(2)}</span>
                        </div>

                        {/* Right Side: Quantity and Remove */}
                        <div className="flex items-center gap-2">
                            {/* Quantity Controls */}
                            <button
                                onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                                className={config.quantityButtonClass}
                            >
                                <Minus className={config.quantityButtonIconClass} />
                            </button>

                            <span className={config.quantityTextClass}>{item.quantity}</span>

                            <button
                                onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                                className={config.quantityButtonClass}
                            >
                                <Plus className={config.quantityButtonIconClass} />
                            </button>

                            {/* Remove Button */}
                            <button onClick={() => onRemoveItem(item.id)} className={config.removeButtonClass}>
                                <Trash2 className={config.removeButtonIconClass} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    // Render Payment Methods
    const renderPaymentMethods = () => {
        if (!config.showPaymentMethods) return null;

        // Check if selected customer has loyalty points and gift cards
        const hasLoyaltyPoints = selectedCustomer && (
            (selectedCustomer.loyaltyPointsData?.availablePoints && selectedCustomer.loyaltyPointsData.availablePoints > 0) ||
            (typeof selectedCustomer.loyaltyPoints === 'number'
                ? selectedCustomer.loyaltyPoints > 0
                : (selectedCustomer.loyaltyPoints?.availablePoints || 0) > 0)
        );
        const hasGiftCards = selectedCustomer &&
            selectedCustomer.assignedGiftCards &&
            selectedCustomer.assignedGiftCards.length > 0;

        // Helper function to get highlight class for payment method buttons
        const getMethodHighlightClass = (methodName: string) => {
            if (methodName === 'Cash' && appliedCash) {
                return 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-500 shadow-md !text-emerald-700 dark:!text-emerald-400';
            }
            if (methodName === 'Loyalty Points' && hasLoyaltyPoints) {
                return 'ring-2 ring-orange-400 ring-offset-1 bg-orange-50 dark:bg-orange-900/30 border-orange-400 shadow-[0_0_10px_rgba(251,146,60,0.5)]';
            }
            if (methodName === 'Gift Card' && hasGiftCards) {
                return 'ring-2 ring-pink-400 ring-offset-1 bg-pink-50 dark:bg-pink-900/30 border-pink-400 shadow-[0_0_10px_rgba(236,72,153,0.5)]';
            }
            return '';
        };

        // Handle payment method button click
        const handlePaymentMethodClick = (methodName: string) => {
            setSelectedPaymentMethod(methodName);
            if (methodName === 'Cash') {
                setShowCashPopup(true);
            }
            if (methodName === 'Loyalty Points' && hasLoyaltyPoints) {
                setShowLoyaltyPopup(true);
            }
            if (methodName === 'Gift Card' && hasGiftCards) {
                setShowGiftCardPopup(true);
            }
        };

        return (
            <div className={config.paymentSectionClass}>
                <div className={config.paymentCardClass}>
                    {config.paymentTitleClass && (
                        <>
                            <h3 className={config.paymentTitleClass}>Payment Methods</h3>
                            <hr className={config.paymentDividerClass} />
                        </>
                    )}
                    <div className={config.paymentMethodsGridClass}>
                        {config.usePaymentIcons ? (
                            // With Icons
                            paymentMethodsWithIcons.map((method) => {
                                const Icon = method.icon;
                                const isSelected = selectedPaymentMethod === method.name;
                                const highlightClass = getMethodHighlightClass(method.name);
                                return (
                                    <button
                                        key={method.name}
                                        onClick={() => handlePaymentMethodClick(method.name)}
                                        className={`${config.paymentMethodButtonClass} ${isSelected ? config.paymentMethodActiveClass : ''} ${highlightClass}`}
                                    >
                                        <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                                        <span className="text-xs font-medium">{method.name}</span>
                                        {method.name === 'Loyalty Points' && hasLoyaltyPoints && (
                                            <span className="text-[10px] font-bold mt-0.5">
                                                {selectedCustomer?.loyaltyPointsData?.availablePoints ||
                                                    (typeof selectedCustomer?.loyaltyPoints === 'number' ? selectedCustomer.loyaltyPoints : selectedCustomer?.loyaltyPoints?.availablePoints) || 0} pts
                                            </span>
                                        )}
                                        {method.name === 'Gift Card' && hasGiftCards && (
                                            <span className="text-[10px] font-bold mt-0.5">
                                                {selectedCustomer?.assignedGiftCards?.length || 0} Cards
                                            </span>
                                        )}
                                    </button>
                                );
                            })
                        ) : (
                            // Text only
                            paymentMethodsWithIcons.map((m) => m.name).map((method) => {
                                const highlightClass = getMethodHighlightClass(method);
                                return (
                                    <button
                                        key={method}
                                        onClick={() => handlePaymentMethodClick(method)}
                                        className={`${config.paymentMethodButtonClass} ${selectedPaymentMethod === method ? config.paymentMethodActiveClass : ''} ${highlightClass}`}
                                    >
                                        <span className="truncate">{method}</span>
                                        {method === 'Loyalty Points' && hasLoyaltyPoints && (
                                            <span className="text-[10px] font-bold leading-none">
                                                {selectedCustomer?.loyaltyPointsData?.availablePoints ||
                                                    (typeof selectedCustomer?.loyaltyPoints === 'number' ? selectedCustomer.loyaltyPoints : selectedCustomer?.loyaltyPoints?.availablePoints) || 0} pts
                                            </span>
                                        )}
                                        {method === 'Gift Card' && hasGiftCards && (
                                            <span className="text-[10px] font-bold leading-none">
                                                {selectedCustomer?.assignedGiftCards?.length || 0} Cards
                                            </span>
                                        )}
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        );
    };

    // UNIFIED LAYOUT - Single structure for all screens
    return (
        <div className={config.wrapperClass || className}>
            <div className={config.innerContainerClass}>
                {/* Header Section */}
                <div className={config.headerClass}>
                    <div className="flex items-center justify-between w-full mb-2">
                        <div className="flex items-center gap-2">
                            <h2 className={config.titleClass}>Order List</h2>
                            {(!config.showOrderNumberInHeaderRight && orderNumber) && <span className={config.orderNumberClass} suppressHydrationWarning>{orderNumber}</span>}
                        </div>
                        <div className={config.headerRightClass}>
                            {config.showOrderNumberInHeaderRight && orderNumber ? (
                                <span className={config.orderNumberClass} suppressHydrationWarning>{orderNumber}</span>
                            ) : (
                                config.showAddCustomerInHeader !== false && (
                                    <button onClick={onAddCustomerClick} className={config.addCustomerButtonClass}>
                                        {config.addCustomerIconClass ? <UserPlus className={config.addCustomerIconClass} /> : 'Add Customer'}
                                    </button>
                                )
                            )}
                            {onClose && (
                                <button onClick={onClose} className={config.closeButtonClass}>
                                    <X className={config.closeButtonIconClass || 'w-5 h-5'} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Customer Section - Inside Header if configured */}
                    {config.showCustomerInHeader && (
                        <div className={`${config.customerDropdownClass} relative`}>
                            <span className={config.customerDropdownTextClass || 'text-gray-700 text-sm'}>
                                {selectedCustomer?.name || 'Walk In Customer'}
                            </span>
                            <ChevronDown className={config.customerDropdownIconClass || 'w-4 h-4 text-gray-400'} />
                            <select
                                value={selectedCustomer?._id || 'walk-in'}
                                onChange={(e) => {
                                    const customerId = e.target.value;
                                    if (customerId === 'walk-in') {
                                        onCustomerChange(null);
                                    } else {
                                        const customer = customers.find((c) => c._id === customerId);
                                        if (customer) onCustomerChange(customer);
                                    }
                                }}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer appearance-none z-10"
                            >
                                <option value="walk-in">Walk in Customer</option>
                                {customers.map((customer) => (
                                    <option key={customer._id} value={customer._id}>{customer.name}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                {/* Customer Section - Separate if NOT in header */}
                {!config.showCustomerInHeader && (
                    config.customerSectionClass ? (
                        <div className={config.customerSectionClass}>
                            <label className={config.customerLabelClass}>Customer Information</label>
                            <div className={config.customerRowClass}>
                                <div className={`${config.customerDropdownClass} relative`}>
                                    <span className={config.customerDropdownTextClass}>
                                        {selectedCustomer?.name || 'Walk In Customer'}
                                    </span>
                                    <ChevronDown className={config.customerDropdownIconClass} />
                                    <select
                                        value={selectedCustomer?._id || 'walk-in'}
                                        onChange={(e) => {
                                            const customerId = e.target.value;
                                            if (customerId === 'walk-in') {
                                                onCustomerChange(null);
                                            } else {
                                                const customer = customers.find((c) => c._id === customerId);
                                                if (customer) onCustomerChange(customer);
                                            }
                                        }}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer appearance-none z-10"
                                    >
                                        <option value="walk-in">Walk in Customer</option>
                                        {customers.map((customer) => (
                                            <option key={customer._id} value={customer._id}>{customer.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <button onClick={onAddCustomerClick} className={config.addCustomerButtonClass}>
                                    {config.addCustomerIconClass ? <UserPlus className={config.addCustomerIconClass} /> : <UserPlus size={16} />}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="mb-4">
                            <select
                                value={selectedCustomer?._id || 'walk-in'}
                                onChange={(e) => {
                                    const customerId = e.target.value;
                                    if (customerId === 'walk-in') {
                                        onCustomerChange(null);
                                    } else {
                                        const customer = customers.find((c) => c._id === customerId);
                                        if (customer) onCustomerChange(customer);
                                    }
                                }}
                                className={config.customerDropdownClass}
                            >
                                <option value="walk-in">Walk in Customer</option>
                                {customers.map((customer) => (
                                    <option key={customer._id} value={customer._id}>{customer.name}</option>
                                ))}
                            </select>
                        </div>
                    )
                )}

                {/* Scrollable Content */}
                <div className={config.scrollableContentClass}>
                    {/* Order Details Section */}
                    <div className={config.orderDetailsSectionClass}>
                        <div className={config.orderDetailsCardClass}>
                            <div className={config.orderDetailsHeaderClass}>
                                <h3 className={config.orderDetailsTitleClass}>Order Details</h3>
                                <div className={config.orderDetailsHeaderRightClass}>
                                    <span className={config.itemsCountClass}>Items: {orderItems.length}</span>
                                    {orderItems.length > 0 && (
                                        <button onClick={onClearAll} className={config.clearAllButtonClass}>Clear all</button>
                                    )}
                                </div>
                            </div>
                            {renderOrderItems()}
                        </div>
                    </div>

                    {/* Apply Coupon Field */}
                    <div className="mb-4 relative">
                        <div
                            role="button"
                            tabIndex={0}
                            onClick={() => {
                                setShowCouponPopup(true);
                                setCouponError(null);
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    setShowCouponPopup(true);
                                    setCouponError(null);
                                }
                            }}
                            className={`w-full flex items-center justify-between p-3 border rounded-lg transition-all group cursor-pointer ${appliedCoupon
                                ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700'
                                : 'bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-700 hover:from-purple-100 hover:to-blue-100 dark:hover:from-purple-900/30 dark:hover:to-blue-900/30'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <Tag className={`w-5 h-5 ${appliedCoupon ? 'text-green-600 dark:text-green-400' : 'text-purple-600 dark:text-purple-400'}`} />
                                <span className={`text-sm font-medium ${appliedCoupon ? 'text-green-700 dark:text-green-300' : 'text-purple-700 dark:text-purple-300'}`}>
                                    {appliedCoupon
                                        ? `${appliedCoupon.code} - ${appliedCoupon.type === 'percentage' ? `${appliedCoupon.value}% OFF` : `$${appliedCoupon.value} OFF`}`
                                        : 'Apply Coupon'
                                    }
                                </span>
                            </div>
                            {appliedCoupon ? (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onRemoveCoupon?.();
                                        setCouponCode('');
                                    }}
                                    className="text-red-500 hover:text-red-700 text-xs font-medium px-2 py-1 bg-red-100 dark:bg-red-900/30 rounded"
                                >
                                    Remove
                                </button>
                            ) : (
                                <span className="text-purple-600 dark:text-purple-400 text-sm group-hover:translate-x-1 transition-transform">
                                    →
                                </span>
                            )}
                        </div>

                        {/* Coupon Popup */}
                        {showCouponPopup && (
                            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-md mx-4 animate-in fade-in zoom-in duration-200">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <Tag className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Apply Coupon</h3>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setShowCouponPopup(false);
                                                setCouponError(null);
                                            }}
                                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Coupon Code
                                            </label>
                                            <input
                                                type="text"
                                                value={couponCode}
                                                onChange={(e) => {
                                                    setCouponCode(e.target.value.toUpperCase());
                                                    setCouponError(null);
                                                }}
                                                placeholder="Enter coupon code"
                                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                            />
                                            {couponError && (
                                                <p className="mt-1 text-xs text-red-500">{couponError}</p>
                                            )}
                                        </div>

                                        {/* Available Coupons Section */}
                                        <div className="pt-2">
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                                {coupons.length > 0 ? 'Available Coupons' : 'No coupons available'}
                                            </p>
                                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                                {coupons.map((coupon) => (
                                                    <button
                                                        key={coupon._id}
                                                        onClick={() => setCouponCode(coupon.code)}
                                                        className={`w-full text-left p-3 border rounded-lg transition-all ${couponCode === coupon.code
                                                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                                                            : 'border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-600'
                                                            }`}
                                                    >
                                                        <div className="flex items-start gap-3">
                                                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                                                <Tag className="w-5 h-5 text-white" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center justify-between gap-2">
                                                                    <span className="font-semibold text-gray-800 dark:text-gray-200">{coupon.code}</span>
                                                                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${coupon.type === 'fixed'
                                                                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                                                        : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                                                        }`}>
                                                                        {coupon.type === 'percentage'
                                                                            ? `${coupon.value}% OFF`
                                                                            : `$${coupon.value} OFF`
                                                                        }
                                                                    </span>
                                                                </div>
                                                                {coupon.description && (
                                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                                                                        {coupon.description}
                                                                    </p>
                                                                )}
                                                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                                    {coupon.minPurchase ? (
                                                                        <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-1.5 py-0.5 rounded">
                                                                            Min: ${coupon.minPurchase}
                                                                        </span>
                                                                    ) : null}
                                                                    {coupon.endDate && (
                                                                        <span className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-1.5 py-0.5 rounded">
                                                                            Valid till: {new Date(coupon.endDate).toLocaleDateString()}
                                                                        </span>
                                                                    )}
                                                                    {couponCode === coupon.code && (
                                                                        <span className="text-xs bg-purple-600 text-white px-2 py-0.5 rounded ml-auto">
                                                                            Selected
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 mt-6">
                                        <button
                                            onClick={() => {
                                                if (appliedCoupon) {
                                                    onRemoveCoupon?.();
                                                }
                                                setCouponCode('');
                                                setCouponError(null);
                                                setShowCouponPopup(false);
                                            }}
                                            className="flex-1 py-3 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                        >
                                            {appliedCoupon ? 'Remove' : 'Clear'}
                                        </button>
                                        <button
                                            onClick={async () => {
                                                if (!couponCode.trim()) {
                                                    setCouponError('Please enter a coupon code');
                                                    return;
                                                }
                                                if (onApplyCoupon) {
                                                    setIsApplyingCoupon(true);
                                                    setCouponError(null);
                                                    try {
                                                        const success = await onApplyCoupon(couponCode);
                                                        if (success) {
                                                            setShowCouponPopup(false);
                                                        } else {
                                                            setCouponError('Invalid coupon code or minimum purchase not met');
                                                        }
                                                    } catch (err) {
                                                        setCouponError('Failed to apply coupon');
                                                    } finally {
                                                        setIsApplyingCoupon(false);
                                                    }
                                                } else {
                                                    setShowCouponPopup(false);
                                                }
                                            }}
                                            disabled={isApplyingCoupon}
                                            className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isApplyingCoupon ? 'Applying...' : 'Apply Coupon'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Loyalty Points Popup */}
                    {showLoyaltyPopup && selectedCustomer && (
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-md mx-4 animate-in fade-in zoom-in duration-200">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg flex items-center justify-center">
                                            <Coins className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Loyalty Points</h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{selectedCustomer.name}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowLoyaltyPopup(false)}
                                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Loyalty Points Summary Card */}
                                <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl p-4 mb-4 border border-orange-200 dark:border-orange-800">
                                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/50 rounded-xl p-6 mb-6 text-center">
                                        <div className="text-amber-600 dark:text-amber-500 font-medium mb-1">Available Points</div>
                                        <div className="text-4xl font-bold text-orange-600 dark:text-orange-500 mb-2">
                                            {selectedCustomer.loyaltyPointsData?.availablePoints ||
                                                (typeof selectedCustomer.loyaltyPoints === 'number' ? selectedCustomer.loyaltyPoints : selectedCustomer.loyaltyPoints?.availablePoints) ||
                                                0}
                                        </div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">Points available for redemption</div>

                                        {(() => {
                                            const points = selectedCustomer.loyaltyPointsData?.availablePoints ||
                                                (typeof selectedCustomer.loyaltyPoints === 'number' ? selectedCustomer.loyaltyPoints : selectedCustomer.loyaltyPoints?.availablePoints) || 0;

                                            const eligibleRule = redemptionRules
                                                .filter(r => r.status && points >= r.pointFrom)
                                                .sort((a, b) => b.pointFrom - a.pointFrom)[0];

                                            if (eligibleRule) {
                                                return (
                                                    <div className="mt-4 pt-4 border-t border-amber-200 dark:border-amber-800/50">
                                                        <div className="text-sm font-medium text-amber-800 dark:text-amber-400">
                                                            Eligible for: <span className="font-bold">{eligibleRule.ruleName}</span>
                                                        </div>
                                                        <div className="text-xs text-amber-600/80 dark:text-amber-500/80 mt-1">
                                                            Redeem {eligibleRule.pointFrom} pts for ${eligibleRule.amount.toFixed(2)} discount
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        })()}
                                    </div>
                                </div>

                                {/* Detailed Points Breakdown */}
                                {selectedCustomer.loyaltyPointsData && (
                                    <div className="space-y-3">
                                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                            <span className="w-1 h-4 bg-orange-500 rounded-full"></span>
                                            Points History
                                        </h4>

                                        <div className="grid grid-cols-2 gap-3">
                                            {/* Total Earned */}
                                            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-200 dark:border-green-800">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                                        <Plus className="w-3 h-3 text-white" />
                                                    </div>
                                                    <span className="text-xs text-green-600 dark:text-green-400 font-medium">Total Earned</span>
                                                </div>
                                                <p className="text-xl font-bold text-green-600 dark:text-green-400">
                                                    {selectedCustomer.loyaltyPointsData.totalEarned}
                                                </p>
                                            </div>

                                            {/* Total Redeemed */}
                                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                                        <Minus className="w-3 h-3 text-white" />
                                                    </div>
                                                    <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">Redeemed</span>
                                                </div>
                                                <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                                                    {selectedCustomer.loyaltyPointsData.totalRedeemed}
                                                </p>
                                            </div>

                                            {/* Total Expired */}
                                            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 border border-red-200 dark:border-red-800">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                                                        <Clock className="w-3 h-3 text-white" />
                                                    </div>
                                                    <span className="text-xs text-red-600 dark:text-red-400 font-medium">Expired</span>
                                                </div>
                                                <p className="text-xl font-bold text-red-600 dark:text-red-400">
                                                    {selectedCustomer.loyaltyPointsData.totalExpired}
                                                </p>
                                            </div>

                                            {/* Current Balance */}
                                            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 border border-purple-200 dark:border-purple-800">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                                                        <Wallet className="w-3 h-3 text-white" />
                                                    </div>
                                                    <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">Balance</span>
                                                </div>
                                                <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                                                    {selectedCustomer.loyaltyPointsData.currentBalance}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="mt-6 flex gap-3">
                                    <button
                                        onClick={() => setShowLoyaltyPopup(false)}
                                        className="flex-1 py-3 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        Close
                                    </button>
                                    <button
                                        onClick={async () => {
                                            if (selectedCustomer) {
                                                try {
                                                    const response = await redemptionRuleAPI.validate(selectedCustomer._id);
                                                    const discountAmount = response.data?.data?.discountAmount || 0;
                                                    if (discountAmount > 0 && onApplyLoyalty) {
                                                        onApplyLoyalty(discountAmount);
                                                    }
                                                } catch (e) {
                                                    console.error('Failed to validate redemption rule:', e);
                                                }
                                            }
                                            setShowLoyaltyPopup(false);
                                        }}
                                        className="flex-1 py-3 px-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg font-medium hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg shadow-orange-500/25"
                                    >
                                        Apply
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Gift Card Popup */}
                    {showGiftCardPopup && selectedCustomer && (
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                                            <Gift className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Gift Cards</h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{selectedCustomer.name}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowGiftCardPopup(false)}
                                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Search gift card number..."
                                            value={giftCardSearch}
                                            onChange={(e) => setGiftCardSearch(e.target.value)}
                                            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                    </div>
                                </div>

                                <div className="max-h-[300px] overflow-y-auto p-4 space-y-3">
                                    {selectedCustomer.assignedGiftCards
                                        ?.filter(card => card.number.includes(giftCardSearch))
                                        .map(card => (
                                            <button
                                                key={card._id}
                                                onClick={() => setSelectedGiftCardNumber(card.number)}
                                                className={`w-full text-left p-3 border rounded-lg transition-all ${selectedGiftCardNumber === card.number
                                                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                                                    : 'border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-600'
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <span className="font-semibold text-gray-900 dark:text-white block">{card.number}</span>
                                                        <span className="text-xs text-gray-500 dark:text-gray-400">{card.name}</span>
                                                    </div>
                                                    <span className="font-bold text-green-600 dark:text-green-400">${card.value}</span>
                                                </div>
                                            </button>
                                        ))}
                                    {(!selectedCustomer.assignedGiftCards || selectedCustomer.assignedGiftCards.length === 0) && (
                                        <p className="text-center text-gray-500 dark:text-gray-400 py-4">No gift cards found</p>
                                    )}
                                </div>

                                {giftCardError && (
                                    <div className="px-6 py-2">
                                        <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg text-center font-medium animate-pulse">
                                            {giftCardError}
                                        </p>
                                    </div>
                                )}

                                <div className="p-6 border-t border-gray-100 dark:border-gray-700 flex gap-3">
                                    <button
                                        onClick={() => setShowGiftCardPopup(false)}
                                        className="flex-1 py-3 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={async () => {
                                            if (!selectedGiftCardNumber) {
                                                setGiftCardError('Please select a gift card');
                                                return;
                                            }
                                            setIsApplyingGiftCard(true);
                                            setGiftCardError(null);
                                            try {
                                                const response = await giftCardAPI.validate({
                                                    number: selectedGiftCardNumber,
                                                    customerId: selectedCustomer._id,
                                                    purchaseAmount: grandTotal
                                                });
                                                if (response.success && onApplyGiftCard) {
                                                    const giftCardValue = response.data?.data?.giftCard?.value;
                                                    const amount = giftCardValue || response.data?.discountAmount || response.data?.amount || 0;
                                                    if (amount > 0) {
                                                        onApplyGiftCard(amount);
                                                        setShowGiftCardPopup(false);
                                                    } else {
                                                        setGiftCardError('Gift card has no value or application failed');
                                                    }
                                                } else {
                                                    setGiftCardError(response.error || 'Failed to apply gift card');
                                                }
                                            } catch (e) {
                                                console.error('Failed to validate gift card:', e);
                                                setGiftCardError('An error occurred');
                                            } finally {
                                                setIsApplyingGiftCard(false);
                                            }
                                        }}
                                        disabled={isApplyingGiftCard}
                                        className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg shadow-purple-500/25 disabled:opacity-50"
                                    >
                                        {isApplyingGiftCard ? 'Applying...' : 'Apply'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Payment Summary */}
                    <div className={config.summarySectionClass}>
                        <div className={config.summaryCardClass}>
                            {config.summaryTitleClass && (
                                <>
                                    <h3 className={config.summaryTitleClass}>Payment Summary</h3>
                                    <hr className={config.summaryDividerClass} />
                                </>
                            )}
                            <div className={config.summaryContainerClass}>
                                <div className={config.summaryRowClass}>
                                    <span className={config.summaryLabelClass}>Product Price:</span>
                                    <span className={config.summaryValueClass}>${productPrice.toFixed(2)}</span>
                                </div>
                                <div className={config.summaryRowClass}>
                                    <span className={config.summaryLabelClass}>
                                        Product Discount{productDiscount > 0 && productPrice > 0 ? ` (${((productDiscount / productPrice) * 100).toFixed(0)}%)` : ''}:
                                    </span>
                                    <span className={config.summaryDiscountValueClass || 'text-green-600'}>{productDiscount > 0 ? `-$${productDiscount.toFixed(2)}` : '$0.00'}</span>
                                </div>
                                <div className={config.summaryRowClass}>
                                    <span className={config.summaryLabelClass}>Coupon Discount:</span>
                                    <span className={config.summaryDiscountValueClass || 'text-green-600'}>{couponDiscount > 0 ? `-$${couponDiscount.toFixed(2)}` : '$0.00'}</span>
                                </div>
                                <div className={`${config.summaryRowClass} relative`}>
                                    <span className={`${config.summaryLabelClass} inline-flex items-center gap-1`}>
                                        SubTotal:
                                        {hasInclusiveTax && inclusiveTaxDetailsList.length > 0 && (
                                            <button
                                                onClick={() => setShowInclusiveTaxDetails(!showInclusiveTaxDetails)}
                                                className="inline-flex items-center justify-center text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                                                title="View inclusive tax details"
                                            >
                                                <svg
                                                    viewBox="0 0 612 612"
                                                    className="w-7 h-7 fill-current"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <path d="M0 0 C0.76828125 0.65484375 1.5365625 1.3096875 2.328125 1.984375 C3.15828125 2.68046875 3.9884375 3.3765625 4.84375 4.09375 C11.10835792 9.51282802 16.24245564 15.46477631 21.328125 21.984375 C22.20210938 23.02464844 22.20210938 23.02464844 23.09375 24.0859375 C46.96799918 52.98047272 56.11927181 92.559179 52.86157227 129.33813477 C48.64733084 169.0823895 28.7252426 204.12371227 -1.70751953 229.69482422 C-5.8804349 233.01680026 -10.21103752 236.06354233 -14.671875 238.984375 C-15.63996094 239.62503906 -16.60804688 240.26570313 -17.60546875 240.92578125 C-50.13964865 261.09607032 -90.93285687 266.76524937 -128.03857422 258.46289062 C-165.62919719 249.41831013 -198.68223317 226.67203834 -219.671875 193.984375 C-220.06810059 193.36804199 -220.46432617 192.75170898 -220.87255859 192.11669922 C-240.98979369 160.12292434 -247.99251029 119.08681822 -239.63671875 82.19140625 C-229.67160633 41.25174732 -205.57258068 7.89259348 -169.68945312 -14.23828125 C-153.01484531 -24.25296147 -133.89991719 -30.3717692 -114.671875 -33.015625 C-113.42792969 -33.19738281 -112.18398438 -33.37914062 -110.90234375 -33.56640625 C-70.9104117 -38.41056705 -30.76862459 -25.47071572 0 0 Z M-191.18554688 29.30712891 C-209.2948074 49.74251323 -221.71942248 77.48230858 -222.671875 104.984375 C-222.7234375 106.25925781 -222.775 107.53414063 -222.828125 108.84765625 C-223.79692641 144.46111621 -211.19771446 176.5881501 -187.109375 202.76953125 C-164.31865379 226.32215157 -133.61503914 240.99392693 -100.671875 241.984375 C-99.73730469 242.02433594 -98.80273438 242.06429688 -97.83984375 242.10546875 C-64.0631458 242.89097335 -31.44389022 230.12234097 -6.86328125 207.08203125 C17.96055008 183.25916086 32.1041739 152.10240458 33.45703125 117.70703125 C34.10282549 80.12180625 19.65868494 48.13234966 -6.046875 21.296875 C-27.01559901 1.03080665 -56.2360657 -12.99620303 -85.671875 -14.015625 C-86.94675781 -14.0671875 -88.22164062 -14.11875 -89.53515625 -14.171875 C-128.83536452 -15.2409679 -164.47149669 0.49461519 -191.18554688 29.30712891 Z" transform="translate(400.671875,192.015625)" />
                                                    <path d="M0 0 C1.42009709 3.92919301 0.74500723 7.64731725 0.21142578 11.68334961 C0.1156424 12.45309113 0.01985901 13.22283264 -0.0788269 14.01589966 C-0.39732131 16.56228713 -0.72609576 19.10724132 -1.0546875 21.65234375 C-1.27865485 23.43143174 -1.50187959 25.21061335 -1.72439575 26.98988342 C-2.31287376 31.68254227 -2.90963478 36.37410778 -3.50866699 41.06542969 C-4.46219104 48.54110907 -5.4046548 56.01818072 -6.34436417 63.49560738 C-6.67192186 66.09081732 -7.00386811 68.6854368 -7.33639526 71.28001404 C-10.38691234 86.01820607 -10.38691234 86.01820607 -9 100 C-6.15391165 99.6567218 -5.155113 99.17450213 -3.21875 96.99609375 C0.26960181 91.8032064 3.37042766 86.67987625 6 81 C7.65 81.33 9.3 81.66 11 82 C9.69014812 94.90204104 1.67794083 107.24341207 -7.953125 115.71875 C-15.19656156 121.13558082 -22.79321929 122.61775364 -31.6875 121.5625 C-36.50141476 119.29178549 -39.30033388 116.57708854 -42 112 C-44.03223594 103.09466891 -42.5631001 93.9503235 -41.34765625 85.03125 C-41.1655615 83.61999994 -40.98479759 82.2085776 -40.80528259 80.79699707 C-40.33399118 77.11123697 -39.84927797 73.42739097 -39.36016846 69.74395752 C-38.57859215 63.85208689 -37.81134582 57.95843337 -37.05639458 52.06309509 C-36.79288641 50.02843781 -36.51962632 47.99526912 -36.24537659 45.96203613 C-34.45016231 34.48366495 -34.45016231 34.48366495 -35 23 C-37.07562033 21.01105319 -38.28429313 20.09795258 -41.140625 19.70703125 C-43.09375 19.8046875 -45.046875 19.90234375 -47 20 C-47.625 18.1875 -47.625 18.1875 -48 16 C-45.89223359 12.83835038 -45.559495 12.5623479 -42.19628906 11.46606445 C-41.4149762 11.20602127 -40.63366333 10.94597809 -39.82867432 10.67805481 C-38.98286804 10.40917953 -38.13706177 10.14030426 -37.265625 9.86328125 C-36.39484314 9.57897751 -35.52406128 9.29467377 -34.62689209 9.00175476 C-32.78255412 8.4024986 -30.93648659 7.80854356 -29.08886719 7.21948242 C-26.2704592 6.31903646 -23.45933932 5.39818436 -20.6484375 4.47460938 C-18.85456702 3.89459366 -17.06030789 3.31577832 -15.265625 2.73828125 C-14.42791565 2.46333328 -13.5902063 2.18838531 -12.72711182 1.90510559 C-8.34591331 0.52226098 -4.65537429 -0.32910623 0 0 Z" transform="translate(324,268)" />
                                                    <path d="M0 0 C4.24307052 3.74969023 6.14313939 7.37901108 7.625 12.8125 C7.71814772 18.12191976 6.69082501 22.2375031 2.99609375 26.1796875 C-2.26187436 30.7680605 -5.54712306 31.72949087 -12.55078125 31.65625 C-17.70052556 31.13180645 -20.32622397 28.49455658 -23.625 24.75 C-27.26407701 19.62833606 -27.10306875 14.5076644 -26.3125 8.375 C-24.27351136 3.62739176 -21.21794946 0.43037711 -16.5 -1.6875 C-10.6128738 -3.42099414 -5.44947192 -2.67332585 0 0 Z" transform="translate(322.3125,224.625)" />
                                                </svg>
                                            </button>
                                        )}
                                    </span>
                                    <span className={config.summaryValueClass}>${subTotal.toFixed(2)}</span>

                                    {/* Inclusive Tax Details Popup */}
                                    {showInclusiveTaxDetails && inclusiveTaxDetailsList.length > 0 && (
                                        <div className="absolute left-0 top-full mt-1 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 min-w-[280px] max-w-[350px]">
                                            <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-200 dark:border-gray-700">
                                                <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Inclusive Tax Details</h4>
                                                <button
                                                    onClick={() => setShowInclusiveTaxDetails(false)}
                                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <div className="space-y-2 max-h-[200px] overflow-y-auto">
                                                {inclusiveTaxDetailsList.map((detail, index) => (
                                                    <div key={index} className="flex flex-col gap-0.5 text-xs p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                                                        <div className="flex justify-between">
                                                            <span className="font-medium text-gray-700 dark:text-gray-300 truncate max-w-[180px]" title={detail.productName}>
                                                                {detail.productName}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between text-gray-500 dark:text-gray-400">
                                                            <span>Taxable Value:</span>
                                                            <span className="font-semibold text-gray-800 dark:text-gray-200">
                                                                ${detail.taxableAmount.toFixed(2)}
                                                            </span>
                                                        </div>
                                                        <div className="flex gap-2 text-gray-500 dark:text-gray-400">
                                                            <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded text-[10px]">
                                                                {detail.taxName}
                                                            </span>
                                                            <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-1.5 py-0.5 rounded text-[10px]">
                                                                Inclusive
                                                            </span>
                                                            <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-1.5 py-0.5 rounded text-[10px]">
                                                                {detail.taxRate}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="flex justify-between mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 text-sm font-bold text-gray-800 dark:text-gray-200">
                                                <span>Total Inclusive Tax:</span>
                                                <span>${totalInclusiveTax.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className={`${config.summaryRowClass} relative`}>
                                    <span className={`${config.summaryLabelClass} inline-flex items-center gap-1`}>
                                        {taxLabel}
                                        {hasExclusiveTax && exclusiveTaxDetailsList.length > 0 && (
                                            <button
                                                onClick={() => setShowTaxDetails(!showTaxDetails)}
                                                className="inline-flex items-center justify-center text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                                                title="View exclusive tax details"
                                            >
                                                <svg
                                                    viewBox="0 0 612 612"
                                                    className="w-7 h-7 fill-current"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <path d="M0 0 C0.76828125 0.65484375 1.5365625 1.3096875 2.328125 1.984375 C3.15828125 2.68046875 3.9884375 3.3765625 4.84375 4.09375 C11.10835792 9.51282802 16.24245564 15.46477631 21.328125 21.984375 C22.20210938 23.02464844 22.20210938 23.02464844 23.09375 24.0859375 C46.96799918 52.98047272 56.11927181 92.559179 52.86157227 129.33813477 C48.64733084 169.0823895 28.7252426 204.12371227 -1.70751953 229.69482422 C-5.8804349 233.01680026 -10.21103752 236.06354233 -14.671875 238.984375 C-15.63996094 239.62503906 -16.60804688 240.26570313 -17.60546875 240.92578125 C-50.13964865 261.09607032 -90.93285687 266.76524937 -128.03857422 258.46289062 C-165.62919719 249.41831013 -198.68223317 226.67203834 -219.671875 193.984375 C-220.06810059 193.36804199 -220.46432617 192.75170898 -220.87255859 192.11669922 C-240.98979369 160.12292434 -247.99251029 119.08681822 -239.63671875 82.19140625 C-229.67160633 41.25174732 -205.57258068 7.89259348 -169.68945312 -14.23828125 C-153.01484531 -24.25296147 -133.89991719 -30.3717692 -114.671875 -33.015625 C-113.42792969 -33.19738281 -112.18398438 -33.37914062 -110.90234375 -33.56640625 C-70.9104117 -38.41056705 -30.76862459 -25.47071572 0 0 Z M-191.18554688 29.30712891 C-209.2948074 49.74251323 -221.71942248 77.48230858 -222.671875 104.984375 C-222.7234375 106.25925781 -222.775 107.53414063 -222.828125 108.84765625 C-223.79692641 144.46111621 -211.19771446 176.5881501 -187.109375 202.76953125 C-164.31865379 226.32215157 -133.61503914 240.99392693 -100.671875 241.984375 C-99.73730469 242.02433594 -98.80273438 242.06429688 -97.83984375 242.10546875 C-64.0631458 242.89097335 -31.44389022 230.12234097 -6.86328125 207.08203125 C17.96055008 183.25916086 32.1041739 152.10240458 33.45703125 117.70703125 C34.10282549 80.12180625 19.65868494 48.13234966 -6.046875 21.296875 C-27.01559901 1.03080665 -56.2360657 -12.99620303 -85.671875 -14.015625 C-86.94675781 -14.0671875 -88.22164062 -14.11875 -89.53515625 -14.171875 C-128.83536452 -15.2409679 -164.47149669 0.49461519 -191.18554688 29.30712891 Z" transform="translate(400.671875,192.015625)" />
                                                    <path d="M0 0 C1.42009709 3.92919301 0.74500723 7.64731725 0.21142578 11.68334961 C0.1156424 12.45309113 0.01985901 13.22283264 -0.0788269 14.01589966 C-0.39732131 16.56228713 -0.72609576 19.10724132 -1.0546875 21.65234375 C-1.27865485 23.43143174 -1.50187959 25.21061335 -1.72439575 26.98988342 C-2.31287376 31.68254227 -2.90963478 36.37410778 -3.50866699 41.06542969 C-4.46219104 48.54110907 -5.4046548 56.01818072 -6.34436417 63.49560738 C-6.67192186 66.09081732 -7.00386811 68.6854368 -7.33639526 71.28001404 C-10.38691234 86.01820607 -10.38691234 86.01820607 -9 100 C-6.15391165 99.6567218 -5.155113 99.17450213 -3.21875 96.99609375 C0.26960181 91.8032064 3.37042766 86.67987625 6 81 C7.65 81.33 9.3 81.66 11 82 C9.69014812 94.90204104 1.67794083 107.24341207 -7.953125 115.71875 C-15.19656156 121.13558082 -22.79321929 122.61775364 -31.6875 121.5625 C-36.50141476 119.29178549 -39.30033388 116.57708854 -42 112 C-44.03223594 103.09466891 -42.5631001 93.9503235 -41.34765625 85.03125 C-41.1655615 83.61999994 -40.98479759 82.2085776 -40.80528259 80.79699707 C-40.33399118 77.11123697 -39.84927797 73.42739097 -39.36016846 69.74395752 C-38.57859215 63.85208689 -37.81134582 57.95843337 -37.05639458 52.06309509 C-36.79288641 50.02843781 -36.51962632 47.99526912 -36.24537659 45.96203613 C-34.45016231 34.48366495 -34.45016231 34.48366495 -35 23 C-37.07562033 21.01105319 -38.28429313 20.09795258 -41.140625 19.70703125 C-43.09375 19.8046875 -45.046875 19.90234375 -47 20 C-47.625 18.1875 -47.625 18.1875 -48 16 C-45.89223359 12.83835038 -45.559495 12.5623479 -42.19628906 11.46606445 C-41.4149762 11.20602127 -40.63366333 10.94597809 -39.82867432 10.67805481 C-38.98286804 10.40917953 -38.13706177 10.14030426 -37.265625 9.86328125 C-36.39484314 9.57897751 -35.52406128 9.29467377 -34.62689209 9.00175476 C-32.78255412 8.4024986 -30.93648659 7.80854356 -29.08886719 7.21948242 C-26.2704592 6.31903646 -23.45933932 5.39818436 -20.6484375 4.47460938 C-18.85456702 3.89459366 -17.06030789 3.31577832 -15.265625 2.73828125 C-14.42791565 2.46333328 -13.5902063 2.18838531 -12.72711182 1.90510559 C-8.34591331 0.52226098 -4.65537429 -0.32910623 0 0 Z" transform="translate(324,268)" />
                                                    <path d="M0 0 C4.24307052 3.74969023 6.14313939 7.37901108 7.625 12.8125 C7.71814772 18.12191976 6.69082501 22.2375031 2.99609375 26.1796875 C-2.26187436 30.7680605 -5.54712306 31.72949087 -12.55078125 31.65625 C-17.70052556 31.13180645 -20.32622397 28.49455658 -23.625 24.75 C-27.26407701 19.62833606 -27.10306875 14.5076644 -26.3125 8.375 C-24.27351136 3.62739176 -21.21794946 0.43037711 -16.5 -1.6875 C-10.6128738 -3.42099414 -5.44947192 -2.67332585 0 0 Z" transform="translate(322.3125,224.625)" />
                                                </svg>
                                            </button>
                                        )}
                                    </span>
                                    <span className={config.summaryValueClass}>${totalExclusiveTax.toFixed(2)}</span>

                                    {/* Exclusive Tax Details Popup */}
                                    {showTaxDetails && exclusiveTaxDetailsList.length > 0 && (
                                        <div className="absolute left-0 top-full mt-1 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 min-w-[280px] max-w-[350px]">
                                            <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-200 dark:border-gray-700">
                                                <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Exclusive Tax Details</h4>
                                                <button
                                                    onClick={() => setShowTaxDetails(false)}
                                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <div className="space-y-2 max-h-[200px] overflow-y-auto">
                                                {exclusiveTaxDetailsList.map((detail, index) => (
                                                    <div key={index} className="flex flex-col gap-0.5 text-xs p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                                                        <div className="flex justify-between">
                                                            <span className="font-medium text-gray-700 dark:text-gray-300 truncate max-w-[180px]" title={detail.productName}>
                                                                {detail.productName}
                                                            </span>
                                                            <span className="font-semibold text-gray-800 dark:text-gray-200">
                                                                ${detail.taxAmount.toFixed(2)}
                                                            </span>
                                                        </div>
                                                        <div className="flex gap-2 text-gray-500 dark:text-gray-400">
                                                            <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded text-[10px]">
                                                                {detail.taxName}
                                                            </span>
                                                            <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-1.5 py-0.5 rounded text-[10px]">
                                                                Exclusive
                                                            </span>
                                                            <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-1.5 py-0.5 rounded text-[10px]">
                                                                {detail.taxRate}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="flex justify-between mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 text-sm font-bold text-gray-800 dark:text-gray-200">
                                                <span>Total Exclusive Tax:</span>
                                                <span>${totalExclusiveTax.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className={config.summaryRowClass}>
                                    <span className={config.summaryLabelClass}>Loyalty Points:</span>
                                    <span className={config.summaryDiscountValueClass || 'text-green-600'}>{loyaltyPoints > 0 ? `-$${loyaltyPoints.toFixed(2)}` : '$0.00'}</span>
                                </div>
                                <div className={config.summaryRowClass}>
                                    <span className={config.summaryLabelClass}>Gift Card:</span>
                                    <span className={config.summaryDiscountValueClass || 'text-green-600'}>{giftCard > 0 ? `-$${giftCard.toFixed(2)}` : '$0.00'}</span>
                                </div>
                                <div className={config.summaryRowClass}>
                                    <span className={config.summaryLabelClass}>Round Off:</span>
                                    <span className={config.summaryValueClass}>{roundOff >= 0 ? `$${roundOff.toFixed(2)}` : `-$${Math.abs(roundOff).toFixed(2)}`}</span>
                                </div>
                                {!config.showGrandTotalSeparate && (
                                    <>
                                        <div className={config.totalRowClass}>
                                            <span>Final Payable:</span>
                                            <span>${grandTotal.toFixed(2)}</span>
                                        </div>
                                        {renderAppliedCashInfo()}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Separate Grand Total (if showGrandTotalSeparate) */}
                    {config.showGrandTotalSeparate && (
                        <>
                            <div className={config.totalRowClass}>
                                <span>Final Payable</span>
                                <span>${grandTotal.toFixed(2)}</span>
                            </div>
                            <div className="px-1 space-y-1 mb-2">
                                {renderAppliedCashInfo()}
                            </div>
                        </>
                    )}

                    {/* Payment Methods */}
                    {renderPaymentMethods()}

                    {/* Action Buttons */}
                    {config.showActionButtons && (
                        <div className={config.actionsSectionClass}>
                            <div className={config.actionsCardClass}>
                                <div className={config.actionButtonsGridClass}>
                                    {config.printButtonClass && (
                                        <button className={config.printButtonClass}>
                                            <Printer className={config.actionButtonIconClass} />
                                            <span>Print Order</span>
                                        </button>
                                    )}
                                    <button
                                        ref={payButtonRef}
                                        className={config.payButtonClass}
                                        onClick={async () => {
                                            if (onPlaceOrder) {
                                                const cashInfo = appliedCash ? {
                                                    cashReceived: appliedCash.amount,
                                                    changeReturned: appliedCash.change
                                                } : undefined;

                                                // Build promo info
                                                const promoInfo: { couponCode?: string; giftCardNumber?: string; loyaltyPointsRedeemed?: number } = {};
                                                if (appliedCoupon?.code) {
                                                    promoInfo.couponCode = appliedCoupon.code;
                                                }
                                                if (selectedGiftCardNumber && giftCard > 0) {
                                                    promoInfo.giftCardNumber = selectedGiftCardNumber;
                                                }
                                                // Calculate loyalty points redeemed from redemption rule
                                                // Find the rule that matches the discount amount (loyaltyPoints)
                                                if (loyaltyPoints > 0 && redemptionRules.length > 0) {
                                                    // Find rule with matching amount, prefer the one with highest pointFrom if multiple matches
                                                    const matchingRules = redemptionRules.filter(r => r.status && Math.abs(r.amount - loyaltyPoints) < 0.01);
                                                    if (matchingRules.length > 0) {
                                                        // Sort by pointFrom descending and take the first (highest points)
                                                        const bestMatch = matchingRules.sort((a, b) => b.pointFrom - a.pointFrom)[0];
                                                        promoInfo.loyaltyPointsRedeemed = bestMatch.pointFrom;
                                                    } else {
                                                        promoInfo.loyaltyPointsRedeemed = 0;
                                                    }
                                                } else {
                                                    promoInfo.loyaltyPointsRedeemed = 0;
                                                }

                                                await onPlaceOrder(cashInfo, Object.keys(promoInfo).length > 0 ? promoInfo : undefined);
                                                setShowReceipt(true);
                                            }
                                        }}
                                    >
                                        <ShoppingCart className={config.payButtonIconClass} />
                                        <span>Place Order</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Pay Button (when no action buttons) */}
                    {!config.showActionButtons && (
                        <button
                            ref={payButtonRef}
                            className={config.payButtonClass}
                            onClick={async () => {
                                if (onPlaceOrder) {
                                    const cashInfo = appliedCash ? {
                                        cashReceived: appliedCash.amount,
                                        changeReturned: appliedCash.change
                                    } : undefined;

                                    // Build promo info
                                    const promoInfo: { couponCode?: string; giftCardNumber?: string; loyaltyPointsRedeemed?: number } = {};
                                    if (appliedCoupon?.code) {
                                        promoInfo.couponCode = appliedCoupon.code;
                                    }
                                    if (selectedGiftCardNumber && giftCard > 0) {
                                        promoInfo.giftCardNumber = selectedGiftCardNumber;
                                    }
                                    // Calculate loyalty points redeemed from redemption rule
                                    if (loyaltyPoints > 0 && redemptionRules.length > 0) {
                                        const matchingRule = redemptionRules.find(r => r.status && r.amount === loyaltyPoints);
                                        if (matchingRule) {
                                            promoInfo.loyaltyPointsRedeemed = matchingRule.pointFrom;
                                        } else {
                                            promoInfo.loyaltyPointsRedeemed = 0;
                                        }
                                    } else {
                                        promoInfo.loyaltyPointsRedeemed = 0;
                                    }

                                    await onPlaceOrder(cashInfo, Object.keys(promoInfo).length > 0 ? promoInfo : undefined);
                                    setShowReceipt(true);
                                }
                            }}
                        >
                            Pay: ${grandTotal.toFixed(2)}
                        </button>
                    )}

                    {/* Cash Payment Popup */}
                    {showCashPopup && cashPopupConfig && (
                        <div className={cashPopupConfig.overlayClass}>
                            <div className={cashPopupConfig.modalClass}>
                                {/* Header */}
                                <div className={cashPopupConfig.headerClass}>
                                    <h3 className={cashPopupConfig.titleClass}>CASH</h3>
                                    <button
                                        onClick={() => setShowCashPopup(false)}
                                        className={cashPopupConfig.closeButtonClass}
                                    >
                                        <X className={cashPopupConfig.closeButtonIconClass} />
                                    </button>
                                </div>
                                {/* Content */}
                                <div className={cashPopupConfig.contentClass}>
                                    {/* Payable Amount (Read Only) */}
                                    <div className={cashPopupConfig.rowClass}>
                                        <label className={cashPopupConfig.labelClass}>Payable Amount</label>
                                        <div className={cashPopupConfig.inputWrapperClass}>
                                            <span className={cashPopupConfig.currencySymbolClass}>$</span>
                                            <input
                                                type="text"
                                                readOnly
                                                value={grandTotal.toFixed(2)}
                                                className={cashPopupConfig.readOnlyInputClass}
                                            />
                                        </div>
                                    </div>

                                    {/* Cash Amount (Editable) */}
                                    <div className={cashPopupConfig.rowClass}>
                                        <label className={cashPopupConfig.labelClass}>Cash Amount</label>
                                        <div className={cashPopupConfig.inputWrapperClass}>
                                            <span className={cashPopupConfig.currencySymbolClass}>$</span>
                                            <input
                                                type="number"
                                                value={cashTendered}
                                                onChange={(e) => setCashTendered(e.target.value)}
                                                className={cashPopupConfig.inputClass}
                                                autoFocus
                                                onFocus={(e) => e.target.select()}
                                            />
                                        </div>
                                    </div>

                                    {/* Change Amount (Read Only) */}
                                    <div className={cashPopupConfig.rowClass}>
                                        <label className={cashPopupConfig.labelClass}>Change Amount</label>
                                        <div className={cashPopupConfig.inputWrapperClass}>
                                            <span className={cashPopupConfig.currencySymbolClass}>$</span>
                                            <input
                                                type="text"
                                                readOnly
                                                value={changeAmount.toFixed(2)}
                                                className={cashPopupConfig.readOnlyInputClass}
                                            />
                                        </div>
                                    </div>
                                </div>
                                {/* Footer */}
                                <div className={cashPopupConfig.footerClass}>
                                    <button
                                        onClick={() => {
                                            setAppliedCash(null);
                                            setShowCashPopup(false);
                                        }}
                                        className={cashPopupConfig.cancelButtonClass}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => {
                                            setAppliedCash({ amount: cashAmount, change: changeAmount });
                                            setShowCashPopup(false);
                                            setTimeout(() => {
                                                if (payButtonRef.current) {
                                                    payButtonRef.current.focus();
                                                }
                                            }, 100);
                                        }}
                                        className={cashPopupConfig.confirmButtonClass}
                                    >
                                        Apply
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                {/* Receipt Modal */}
                {showReceipt && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
                        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-fit max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
                            <button
                                onClick={() => setShowReceipt(false)}
                                className="absolute top-2 right-2 p-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full text-gray-600 dark:text-gray-300 z-10 transition-colors border border-gray-200 dark:border-gray-600"
                            >
                                <X className="w-4 h-4" />
                            </button>
                            <div className="p-0">
                                <PosReceipt />
                            </div>
                        </div>
                    </div>
                )}
            </div >
        </div >
    );
}

export default OrderPanelUI;

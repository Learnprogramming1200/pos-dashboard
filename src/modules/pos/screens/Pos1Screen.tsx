'use client';

import React from 'react';
import { X } from 'lucide-react';

import { POSProvider, usePOS, usePOSReady, posAPI } from '@/modules/pos/core';
import {
    PosHeaderUI,
    PosCategoryUI,
    PosProductUI,
    OrderPanelUI,
    CalculatorUI,
    ActionPanelUI,
    CustomerModalUI,
    POS_UI_CONFIG
} from '@/modules/pos/ui';


import PosReceipt from '../receipts/PosReceipt';

const uiConfig = POS_UI_CONFIG.POS_1;

function Pos1Inner() {
    const pos = usePOS();
    const { isReady, loading } = usePOSReady();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
    const [isCartOpen, setIsCartOpen] = React.useState(false);
    const [isPlacingOrder, setIsPlacingOrder] = React.useState(false);
    const [showReceipt, setShowReceipt] = React.useState(false);
    const [receiptData, setReceiptData] = React.useState<any>(null);

    const handlePlaceOrder = React.useCallback(async (cashInfo?: { cashReceived: number; changeReturned: number }, promoInfo?: { couponCode?: string; giftCardNumber?: string; loyaltyPointsRedeemed?: number }) => {
        if (!pos.selectedStore?._id) {
            alert('Please select a store');
            return;
        }

        if (pos.orderItems.length === 0) {
            alert('Please add items to the order');
            return;
        }

        setIsPlacingOrder(true);
        try {
            // Build products array
            const products = pos.orderItems.map((item) => {
                // Find product to get categoryId
                const product = pos.products.find(p => p._id === item.productId || p._id === item.id);
                const categoryId = product?.categoryId || '';

                // Calculate netAmount (original price * quantity, before discount)
                const netAmount = item.price * item.quantity;

                return {
                    product: item.productId || item.id,
                    productName: item.name,
                    SKU: item.sku || '',
                    category: categoryId,
                    quantity: item.quantity,
                    netAmount: netAmount,
                    taxAmount: item.taxAmount || 0,
                };
            });

            // Build billing summary
            const billingSummary = {
                subTotal: pos.subTotal,
                taxableAmount: pos.subTotal,
                taxTotal: pos.tax,
                grandTotal: pos.grandTotal,
                amountPaid: pos.grandTotal,
                balanceDue: 0,
                roundingAdjustment: pos.roundOff,
            };

            // Build payment details with cash received and change returned
            const cashReceived = cashInfo?.cashReceived || pos.grandTotal;
            const changeReturned = cashInfo?.changeReturned || 0;
            const paymentDetails = [{
                method: 'cash',
                amount: pos.grandTotal,
                cashReceived: cashReceived,
                changeReturned: changeReturned,
            }];

            // Build payload
            const payload: any = {
                store: pos.selectedStore._id,
                customer: pos.selectedCustomer?._id || null,
                products: products,
                billingSummary: billingSummary,
                paymentDetails: paymentDetails,
                saleStatus: 'completed',
            };

            // Add coupon if applied
            if (promoInfo?.couponCode) {
                payload.coupon = {
                    code: promoInfo.couponCode,
                };
            }

            // Add loyalty points if redeemed
            payload.loyalty = {
                pointsRedeemed: promoInfo?.loyaltyPointsRedeemed ?? 0,
            };

            // Add gift card if applied
            if (promoInfo?.giftCardNumber) {
                payload.giftCard = {
                    number: promoInfo.giftCardNumber,
                };
            }

            // Call API
            const result = await posAPI.order.createSale(payload);

            if (result.success) {
                // Call preview billing API using the sale ID from the response
                if (result.data?.data?._id) {
                    try {
                        const billingResult = await posAPI.order.previewBilling(result.data.data._id);

                        if (billingResult.success && billingResult.data?.data) {
                            setReceiptData(billingResult.data.data);
                            setShowReceipt(true);
                        }
                    } catch (billingError) {
                        console.error('Error fetching billing preview:', billingError);
                    }
                }

                alert('Order placed successfully!');
                pos.clearOrder();
            } else {
                alert(`Failed to place order: ${result.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error placing order:', error);
            alert('An error occurred while placing the order');
        } finally {
            setIsPlacingOrder(false);
        }
    }, [pos]);

    const OrderPanelContent = (
        <OrderPanelUI
            orderItems={pos.orderItems}
            onUpdateQuantity={pos.updateOrderItemQuantity}
            onRemoveItem={pos.removeFromOrder}
            onClearAll={pos.clearOrder}

            productPrice={pos.productPrice}
            productDiscount={pos.productDiscount}
            couponDiscount={pos.couponDiscount}
            subTotal={pos.subTotal}
            tax={pos.tax}
            hasInclusiveTax={pos.hasInclusiveTax}
            hasExclusiveTax={pos.hasExclusiveTax}
            loyaltyPoints={pos.loyaltyDiscount}
            onApplyLoyalty={pos.applyLoyalty}
            roundOff={pos.roundOff}
            grandTotal={pos.grandTotal}

            customers={pos.customers}
            selectedCustomer={pos.selectedCustomer}
            onCustomerChange={pos.setSelectedCustomer}
            onAddCustomerClick={() => pos.setIsAddCustomerModalOpen(true)}

            coupons={pos.coupons}
            appliedCoupon={pos.appliedCoupon}
            onApplyCoupon={pos.applyCoupon}
            onRemoveCoupon={pos.removeCoupon}

            orderNumber={pos.currentOrderNumber}
            variant={uiConfig.orderPanel.variant}
            uiConfig={uiConfig.orderPanel}
            redemptionRules={pos.redemptionRules}
            giftCard={pos.giftCardDiscount}
            onApplyGiftCard={pos.applyGiftCard}
            cashPopupConfig={uiConfig.cashPopup}
            onPlaceOrder={handlePlaceOrder}
        />
    );

    return (
        <div className={uiConfig.layout.mainContainerClass}>
            {/* Header */}
            <PosHeaderUI
                cashierInfo={pos.cashierInfo}
                registerInfo={pos.registerInfo}
                formattedDate={pos.formattedDate}
                formattedTime={pos.formattedTime}
                stores={pos.stores}
                selectedStore={pos.selectedStore}
                onStoreChange={pos.setSelectedStore}
                canChangeStore={pos.canChangeStore}
                isFullscreen={pos.isFullscreen}
                onToggleFullscreen={pos.toggleFullscreen}
                darkMode={pos.darkMode}
                onToggleDarkMode={pos.toggleDarkMode}
                onBack={pos.handleBack}
                searchQuery={pos.searchQuery}
                onSearchChange={pos.setSearchQuery}
                isCalculatorOpen={pos.isCalculatorOpen}
                onToggleCalculator={() => pos.setIsCalculatorOpen(!pos.isCalculatorOpen)}
                onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                onToggleCart={() => setIsCartOpen(!isCartOpen)}
                cartItemCount={pos.orderItems.reduce((acc, item) => acc + item.quantity, 0)}
                uiConfig={uiConfig.header}
            />

            {/* Mobile Category Drawer */}
            {isMobileMenuOpen && (
                <div className={uiConfig.mobile.overlayClass} onClick={() => setIsMobileMenuOpen(false)}>
                    <div className={uiConfig.mobile.categoryDrawerClass} onClick={(e) => e.stopPropagation()}>
                        <div className="p-4 h-full flex flex-col">
                            <div className={uiConfig.mobile.categoryDrawerHeaderClass}>
                                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Categories</h2>
                                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 rounded-lg bg-slate-700 hover:bg-slate-800">
                                    <X className="w-5 h-5 text-white" />
                                </button>
                            </div>
                            <div className="flex-1 space-y-2 overflow-y-auto">
                                <PosCategoryUI
                                    categories={pos.categories}
                                    selectedCategoryId={pos.selectedCategoryId}
                                    onCategorySelect={(id) => {
                                        pos.setSelectedCategory(id);
                                        setIsMobileMenuOpen(false);
                                    }}
                                    uiConfig={uiConfig.categorySidebar}
                                    variant="mobile"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Mobile Order Drawer */}
            {isCartOpen && (
                <div className={uiConfig.mobile.overlayClass} onClick={() => setIsCartOpen(false)}>
                    <div className={uiConfig.mobile.orderDrawerClass} onClick={(e) => e.stopPropagation()}>
                        <div className={uiConfig.mobile.orderDrawerHeaderClass}>
                            <h2 className={uiConfig.orderPanel.titleClass}>Current Order</h2>
                            <button onClick={() => setIsCartOpen(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-hidden h-full">
                            {OrderPanelContent}
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className={uiConfig.layout.contentAreaClass}>

                {/* Left Category Sidebar (Desktop) */}
                <div className={uiConfig.categorySidebar.wrapperClass}>
                    <div className={uiConfig.categorySidebar.innerContainerClass}>
                        <PosCategoryUI
                            categories={pos.categories}
                            selectedCategoryId={pos.selectedCategoryId}
                            onCategorySelect={pos.setSelectedCategory}
                            uiConfig={uiConfig.categorySidebar}
                            variant="vertical"
                        />
                    </div>
                </div>

                {/* Product Area */}
                <div className="flex-1 flex flex-col overflow-hidden relative">
                    <div className={uiConfig.layout.productAreaClass}>
                        {/* Mobile Horizontal Category Selector */}
                        <div className={uiConfig.categorySidebar.mobileHorizontalWrapperClass}>
                            <PosCategoryUI
                                categories={pos.categories}
                                selectedCategoryId={pos.selectedCategoryId}
                                onCategorySelect={pos.setSelectedCategory}
                                uiConfig={uiConfig.categorySidebar}
                                variant="horizontal"
                            />
                        </div>

                        {/* Product Grid */}
                        <PosProductUI
                            products={pos.filteredProducts}
                            isLoading={pos.loading.products}
                            onAddToOrder={pos.addToOrder}
                            gridCols={uiConfig.productGrid.gridClass}
                            cardConfig={uiConfig.productGrid.card}
                        />
                    </div>
                    {/* Bottom Action Bar - Product Side Only */}
                    {uiConfig.bottomActionBar.show && (
                        <ActionPanelUI
                            uiConfig={{
                                ...uiConfig.bottomActionBar,
                                buttonsContainerClass: uiConfig.bottomActionBar.containerClass
                            }}
                            onCancel={pos.clearOrder}
                        />
                    )}
                </div>

                {/* Order Panel */}
                <div className={uiConfig.layout.orderSidebarClass}>
                    {OrderPanelContent}
                </div>
            </div>



            {/* Add Customer Modal */}
            <CustomerModalUI
                isOpen={pos.isAddCustomerModalOpen}
                onClose={() => pos.setIsAddCustomerModalOpen(false)}
                onSubmit={(data) => pos.createCustomer({ name: data.customerName, phone: data.phone, email: data.email })}
                uiConfig={uiConfig.customerModal}
            />

            {/* Calculator */}
            {
                pos.isCalculatorOpen && (
                    <CalculatorUI
                        isOpen={pos.isCalculatorOpen}
                        onClose={() => pos.setIsCalculatorOpen(false)}
                    />
                )
            }

            {/* Receipt Modal */}
            {
                showReceipt && receiptData && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
                            <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center bg-white dark:bg-gray-800 z-10">
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Receipt</h2>
                                <button onClick={() => setShowReceipt(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                                    <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                                </button>
                            </div>
                            <div className="overflow-y-auto p-4 flex-1 bg-gray-50 dark:bg-gray-900 flex justify-center">
                                <PosReceipt receiptData={receiptData} />
                            </div>
                            <div className="p-4 border-t dark:border-gray-700 bg-white dark:bg-gray-800 flex gap-3">
                                <button
                                    onClick={() => window.print()}
                                    className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-sm"
                                >
                                    Print Reciept
                                </button>
                                <button
                                    onClick={() => setShowReceipt(false)}
                                    className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-2.5 rounded-lg font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div>
    );
}

export default function Pos1Screen() {
    return (
        <POSProvider>
            <Pos1Inner />
        </POSProvider>
    );
}

'use client';

import React from 'react';
import { X } from 'lucide-react';

import { POSProvider, usePOS } from '@/modules/pos/core';
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
import { ServerActions } from '@/lib';

const uiConfig = POS_UI_CONFIG.POS_4;

function Pos4Inner() {
    const pos = usePOS();
    const [isCategorySidebarOpen, setIsCategorySidebarOpen] = React.useState(false);
    const [isOrderSidebarOpen, setIsOrderSidebarOpen] = React.useState(false);
    const [isPlacingOrder, setIsPlacingOrder] = React.useState(false);

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
            const result = await ServerActions.ServerActionslib.createSaleAction(payload);

            if (result.success) {
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

    return (
        <>
            <div className={uiConfig.layout.mainContainerClass}>
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
                    onToggleMobileMenu={() => setIsCategorySidebarOpen(!isCategorySidebarOpen)}
                    onToggleCart={() => setIsOrderSidebarOpen(!isOrderSidebarOpen)}
                    cartItemCount={pos.orderItems.length}
                    uiConfig={uiConfig.header}
                />

                <div className={uiConfig.layout.contentAreaClass}>
                    {/* Category Sidebar */}
                    <div className={uiConfig.layout.categorySidebarClass}>
                        <PosCategoryUI
                            categories={pos.categories}
                            selectedCategoryId={pos.selectedCategoryId}
                            onCategorySelect={pos.setSelectedCategory}
                            uiConfig={uiConfig.categorySidebar}
                        />
                    </div>

                    {/* Mobile Category Drawer */}
                    {isCategorySidebarOpen && (
                        <div className={uiConfig.mobile.overlayClass} onClick={() => setIsCategorySidebarOpen(false)}>
                            <div className={uiConfig.mobile.categoryDrawerClass} onClick={(e) => e.stopPropagation()}>
                                <div className={uiConfig.mobile.categoryDrawerHeaderClass}>
                                    <h2 className="text-lg font-semibold">Categories</h2>
                                    <button onClick={() => setIsCategorySidebarOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                <PosCategoryUI
                                    categories={pos.categories}
                                    selectedCategoryId={pos.selectedCategoryId}
                                    onCategorySelect={(id) => {
                                        pos.setSelectedCategory(id);
                                        setIsCategorySidebarOpen(false);
                                    }}
                                    uiConfig={uiConfig.categorySidebar}
                                    variant="mobile"
                                />
                            </div>
                        </div>
                    )}

                    {/* Product Grid */}
                    <div className={uiConfig.layout.productAreaClass}>
                        <ActionPanelUI
                            uiConfig={uiConfig.actionPanel}
                            onCancel={pos.clearOrder}
                        />
                        <PosProductUI
                            products={pos.filteredProducts}
                            isLoading={pos.loading.products}
                            onAddToOrder={pos.addToOrder}
                            gridCols={uiConfig.productGrid.gridClass}
                            cardConfig={uiConfig.productGrid.card}
                        />
                    </div>

                    {/* Order Panel */}
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
                        roundOff={0}
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

                    {/* Mobile Order Drawer */}
                    {isOrderSidebarOpen && (
                        <div className={uiConfig.mobile.orderDrawerClass} onClick={() => setIsOrderSidebarOpen(false)}>
                            <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-xl p-3 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                                <div className={uiConfig.mobile.orderDrawerHeaderClass}>
                                    <h2 className="text-lg font-semibold">Order Details</h2>
                                    <button onClick={() => setIsOrderSidebarOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
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
                                    roundOff={0}
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
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {pos.isCalculatorOpen && (
                <CalculatorUI
                    isOpen={pos.isCalculatorOpen}
                    onClose={() => pos.setIsCalculatorOpen(false)}
                />
            )}

            <CustomerModalUI
                isOpen={pos.isAddCustomerModalOpen}
                onClose={() => pos.setIsAddCustomerModalOpen(false)}
                onSubmit={(data) => pos.createCustomer({ name: data.customerName, phone: data.phone, email: data.email })}
                uiConfig={uiConfig.customerModal}
            />
        </>
    );
}

export default function Pos4Screen() {
    return (
        <POSProvider>
            <Pos4Inner />
        </POSProvider>
    );
}

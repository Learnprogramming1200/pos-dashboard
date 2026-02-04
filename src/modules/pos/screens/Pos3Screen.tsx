'use client';

import React from 'react';
import { X } from 'lucide-react';

import { POSProvider, usePOS, usePOSReady } from '@/modules/pos/core';
import {
    PosHeaderUI,
    PosCategoryUI,
    PosProductUI,
    OrderPanelUI,
    PosLoadingUI,
    CalculatorUI,
    ActionPanelUI,
    CustomerModalUI,
    POS_UI_CONFIG
} from '@/modules/pos/ui';
import { PosLayoutTop } from '@/modules/pos/layouts';
import { ServerActions } from '@/lib';

const uiConfig = POS_UI_CONFIG.POS_3;
function Pos3Inner() {
    const pos = usePOS();
    const { isReady, loading } = usePOSReady();
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

    // Error state
    if (pos.error) {
        return (
            <div className="fixed inset-0 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 z-50">
                <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl max-w-md w-full text-center border border-red-200 dark:border-red-900">
                    <div className="text-red-500 mb-4 flex justify-center">
                        <X className="w-12 h-12" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Error Initializing POS</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">{pos.error.message}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    // // Loading state: Only show if initializing or not ready (but ensure no error exits first)
    // // If not initializing, no error, but not ready -> No active stores
    // if (loading.initializing) {
    //     return <PosLoadingUI message="Initializing POS..." fullScreen />;
    // }

    // if (!isReady && !loading.initializing && !pos.error) {
    //     return (
    //         <div className="fixed inset-0 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 z-50">
    //             <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl max-w-md w-full text-center">
    //                 <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">System Not Ready</h2>
    //                 <p className="text-gray-600 dark:text-gray-400 mb-6">
    //                     No active stores found or store selection failed.
    //                     Please check your store configuration.
    //                 </p>
    //                 <button
    //                     onClick={() => window.location.reload()}
    //                     className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
    //                 >
    //                     Retry
    //                 </button>
    //             </div>
    //         </div>
    //     );
    // }

    // Action Panel (Middle buttons specific to Pos3)
    const ActionPanel = uiConfig.actionPanel.show ? (
        <ActionPanelUI
            uiConfig={uiConfig.actionPanel}
            onCancel={pos.clearOrder}
        />
    ) : null;

    return (
        <>
            <PosLayoutTop
                header={
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
                        uiConfig={uiConfig.header}
                    />
                }
                productGrid={
                    <div className={uiConfig.productGrid.wrapperClass}>
                        {/* Mobile/Tablet Category Horizontal List (hidden on lg) */}
                        <div className={uiConfig.categorySidebar.mobileHorizontalWrapperClass || 'lg:hidden mb-4'}>
                            <PosCategoryUI
                                categories={pos.categories}
                                selectedCategoryId={pos.selectedCategoryId}
                                onCategorySelect={pos.setSelectedCategory}
                                uiConfig={uiConfig.categorySidebar}
                            />
                        </div>

                        <PosProductUI
                            products={pos.filteredProducts}
                            isLoading={pos.loading.products}
                            onAddToOrder={pos.addToOrder}
                            gridCols={uiConfig.productGrid.gridClass}
                            cardConfig={uiConfig.productGrid.card}
                            orderItems={pos.orderItems}
                            onUpdateQuantity={pos.updateOrderItemQuantity}
                        />
                    </div>
                }
                actionPanel={ActionPanel}
                orderPanel={
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
                }
                // Calculator is global overlay
                calculatorOverlay={
                    pos.isCalculatorOpen && (
                        <CalculatorUI
                            isOpen={pos.isCalculatorOpen}
                            onClose={() => pos.setIsCalculatorOpen(false)}
                        />
                    )
                }
            />

            <CustomerModalUI
                isOpen={pos.isAddCustomerModalOpen}
                onClose={() => pos.setIsAddCustomerModalOpen(false)}
                onSubmit={(data) => pos.createCustomer({ name: data.customerName, phone: data.phone, email: data.email })}
                uiConfig={uiConfig.customerModal}
            />
        </>
    );
}

export default function Pos3Screen() {
    return (
        <POSProvider>
            <Pos3Inner />
        </POSProvider>
    );
}

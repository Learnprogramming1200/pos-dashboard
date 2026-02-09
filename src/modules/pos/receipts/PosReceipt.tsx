import React from "react";
import { format } from "date-fns";

interface PosReceiptProps {
    receiptData?: any; // Using any for flexibility based on the provided JSON structure, but ideally should be typed
}

const PosReceipt: React.FC<PosReceiptProps> = ({ receiptData }) => {
    if (!receiptData) return null;

    const {
        storeSnapshot,
        customerSnapshot,
        invoiceNumber,
        saleDate,
        lineItems,
        billingSummary,
        paymentMode,
        cashReceived,
        changeReturned,
        discountedPrice,
        productDiscount,
        couponDiscount,
        grandTotal
    } = receiptData;

    const totalQty = lineItems?.reduce((acc: number, item: any) => acc + (item.quantity || 0), 0) || 0;
    const summaryAmount = (couponDiscount || 0) + (discountedPrice || 0);

    // Helper components for lines
    const DashedLine = () => <div className="border-b border-dashed border-black my-2" />;
    const DoubleLine = () => <div className="border-b-4 border-double border-black my-2" />;

    return (
        <div className="w-[80mm] font-mono text-xs leading-tight bg-white text-black p-4 mx-auto shadow-sm">
            {/* HEADER */}
            <div className="text-center font-bold text-base mb-1">{storeSnapshot?.name || "Store Name"}</div>
            <div className="text-center">{storeSnapshot?.location?.address}</div>
            <div className="text-center">
                {[storeSnapshot?.location?.city, storeSnapshot?.location?.state, storeSnapshot?.location?.country].filter(Boolean).join(", ")}
            </div>
            {storeSnapshot?.gst && <div className="text-center">GSTIN: {storeSnapshot.gst}</div>}
            {storeSnapshot?.phone && <div className="text-center">Ph: {storeSnapshot.phone}</div>}

            <DashedLine />

            {/* META */}
            <div className="flex justify-between">
                <span>Receipt No</span>
                <span>{invoiceNumber}</span>
            </div>
            <div className="flex justify-between">
                <span>Date</span>
                <span>{saleDate ? format(new Date(saleDate), "dd-MMM-yyyy HH:mm") : ""}</span>
            </div>
            {/* Terminal and Cashier are not explicitly in the provided JSON, might need to be passed or are part of meta data not shown */}
            {/* <div className="flex justify-between">
                <span>Terminal</span>
                <span>POS-01</span>
            </div> 
            */}
            {customerSnapshot?.customerName && (
                <div className="flex justify-between">
                    <span>Customer</span>
                    <span>{customerSnapshot.customerName}</span>
                </div>
            )}

            {/* <DashedLine /> */}

            {/* ITEMS */}
            {/* ITEMS */}
            <div className="border-b border-dashed border-black my-2" />
            <div className="grid grid-cols-12 gap-1 font-bold text-[10px] mb-1">
                <span className="col-span-4">Product</span>
                <span className="col-span-2 text-right">Price</span>
                <span className="col-span-1 text-center">Qty</span>
                <span className="col-span-2 text-right">Discount</span>
                <span className="col-span-3 text-right">Amount</span>
            </div>
            <div className="border-b border-dashed border-black my-1" />

            {lineItems?.map((item: any, i: number) => (
                <div key={i} className="grid grid-cols-12 gap-1 text-[10px] my-1 items-start">
                    <span className="col-span-4 leading-tight break-words">{item.productName}</span>
                    <span className="col-span-2 text-right">{item.sellingPrice?.toFixed(2)}</span>
                    <span className="col-span-1 text-center">{item.quantity}</span>
                    <span className="col-span-2 text-right">{item.totalDiscount?.toFixed(2)}</span>
                    <span className="col-span-3 text-right">{item.discountedGrossAmount?.toFixed(2)}</span>
                </div>
            ))}

            <div className="border-b border-dashed border-black my-1" />

            {/* ITEMS SUMMARY ROW */}
            <div className="grid grid-cols-12 gap-1 text-[10px] font-bold mb-2">
                <span className="col-span-4"></span>
                <span className="col-span-2 text-right"></span>
                <span className="col-span-1 text-center">{totalQty}</span>
                <span className="col-span-2 text-right">{productDiscount?.toFixed(2)}</span>
                <span className="col-span-3 text-right">{summaryAmount?.toFixed(2)}</span>
            </div>

            {billingSummary?.couponDiscount > 0 && (
                <div className="flex justify-between">
                    <span>Coupon Discount</span>
                    <span>-{billingSummary.couponDiscount.toFixed(2)}</span>
                </div>
            )}

            {/* SUMMARY */}
            <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{discountedPrice?.toFixed(2)}</span>
            </div>

            <DashedLine />

            {billingSummary?.discountTotal > 0 && (
                <div className="flex justify-between">
                    <span>Total Savings</span>
                    <span>-{billingSummary.discountTotal.toFixed(2)}</span>
                </div>
            )}

            <DashedLine />

            {/* TAX BREAKDOWN */}
            {/* <DashedLine /> */}

            {(lineItems && lineItems.length > 0) && (() => {
                const { inclusiveGroups, exclusiveGroups } = lineItems.reduce((acc: any, item: any) => {
                    // Handle Inclusive
                    if (item.inclusiveTaxAmount > 0) {
                        let percentage = 0;
                        const inclusiveSnapshot = item.taxSnapshots?.find((t: any) => t.taxType === 'Inclusive');
                        if (inclusiveSnapshot) percentage = inclusiveSnapshot.percentage;
                        else if (item.taxSnapshot?.taxType === 'Inclusive') percentage = item.taxSnapshot.percentage;

                        if (percentage > 0) {
                            if (!acc.inclusiveGroups[percentage]) {
                                acc.inclusiveGroups[percentage] = { rate: percentage, taxable: 0, tax: 0 };
                            }
                            acc.inclusiveGroups[percentage].taxable += item.taxableValue || 0;
                            acc.inclusiveGroups[percentage].tax += item.inclusiveTaxAmount || 0;
                        }
                    }

                    // Handle Exclusive
                    if (item.exclusiveTaxAmount > 0) {
                        let percentage = 0;
                        const exclusiveSnapshot = item.taxSnapshots?.find((t: any) => t.taxType === 'Exclusive');
                        if (exclusiveSnapshot) percentage = exclusiveSnapshot.percentage;
                        else if (item.taxSnapshot?.taxType === 'Exclusive') percentage = item.taxSnapshot.percentage;

                        if (percentage > 0) {
                            if (!acc.exclusiveGroups[percentage]) {
                                acc.exclusiveGroups[percentage] = { rate: percentage, taxable: 0, tax: 0 };
                            }
                            acc.exclusiveGroups[percentage].taxable += item.taxableValue || 0;
                            acc.exclusiveGroups[percentage].tax += item.exclusiveTaxAmount || 0;
                        }
                    }
                    return acc;
                }, { inclusiveGroups: {}, exclusiveGroups: {} });

                const inclusiveRows: any[] = Object.values(inclusiveGroups).sort((a: any, b: any) => a.rate - b.rate);
                const exclusiveRows: any[] = Object.values(exclusiveGroups).sort((a: any, b: any) => a.rate - b.rate);

                return (
                    <div className="mb-1">
                        <div className="grid grid-cols-[0.6fr_2fr_0.8fr_1.6fr] gap-1 text-[10px] font-bold text-right mb-1">
                            <span className="text-left">TAX</span>
                            <span className="whitespace-nowrap">TAXABLE VALUE</span>
                            <span className="text-center">GST</span>
                            <span>TAX AMT</span>
                        </div>
                        <div className="border-b border-dashed border-black my-1" />

                        {inclusiveRows.map((row: any, i: number) => (
                            <div key={`inc-${i}`} className="grid grid-cols-[0.6fr_2fr_0.8fr_1.6fr] gap-1 text-[10px] text-right">
                                <span className="text-left">Inc</span>
                                <span>{row.taxable.toFixed(2)}</span>
                                <span className="text-center">{row.rate}%</span>
                                <span>{row.tax.toFixed(2)}</span>
                            </div>
                        ))}

                        {(inclusiveRows.length > 0) && (
                            <div className="grid grid-cols-[0.6fr_2fr_0.8fr_1.6fr] gap-1 text-[10px] text-right">
                                <span className="col-span-3"></span>
                                <div className="flex flex-col items-end">
                                    <span className="border-b border-dashed border-black w-full my-1"></span>
                                    <span>{discountedPrice?.toFixed(2)}</span>
                                </div>
                            </div>
                        )}

                        {exclusiveRows.map((row: any, i: number) => (
                            <div key={`exc-${i}`} className="grid grid-cols-[0.6fr_2fr_0.8fr_1.6fr] gap-1 text-[10px] text-right mt-1">
                                <span className="text-left">Exc</span>
                                <span>{discountedPrice?.toFixed(2)}</span>
                                <span className="text-center">{row.rate}%</span>
                                <span>{row.tax.toFixed(2)}</span>
                            </div>
                        ))}

                        {(exclusiveRows.length > 0) && (
                            <div className="grid grid-cols-[0.6fr_2fr_0.8fr_1.6fr] gap-1 text-[10px] text-right">
                                <span className="col-span-3"></span>
                                <div className="flex flex-col items-end">
                                    <span className="border-b border-dashed border-black w-full my-1"></span>
                                    <span>{grandTotal?.toFixed(2)}</span>
                                </div>
                            </div>
                        )}
                        <div className="border-b border-dashed border-black my-1" />
                    </div>
                );
            })()}


            {/* Break down discounts if needed, based on specific values if > 0 */}
            {billingSummary?.loyaltyDiscount > 0 && (
                <div className="flex justify-between">
                    <span>Loyalty Redeemed</span>
                    <span>-{billingSummary.loyaltyDiscount.toFixed(2)}</span>
                </div>
            )}
            {billingSummary?.giftCardDiscount > 0 && (
                <div className="flex justify-between">
                    <span>Gift Card</span>
                    <span>-{billingSummary.giftCardDiscount.toFixed(2)}</span>
                </div>
            )}

            {/* <div className="flex justify-between font-bold">
                <span>Net Payable</span>
                <span>{billingSummary?.netPayable?.toFixed(2)}</span>
            </div> */}


            {billingSummary?.roundingAdjustment ? (
                <div className="flex justify-between">
                    <span>Round Off</span>
                    <span>{billingSummary.roundingAdjustment.toFixed(2)}</span>
                </div>
            ) : null}

            <DoubleLine />

            {/* TOTAL */}
            <div className="flex justify-between font-bold text-lg">
                <span>TOTAL PAYABLE</span>
                <span>{billingSummary?.netPayable?.toFixed(2)}</span>
            </div>
            {/* <div className="flex justify-between text-sm">
                <span>Amount Paid</span>
                <span>{billingSummary?.amountPaid?.toFixed(2)}</span>
            </div> */}
            {billingSummary?.balanceDue > 0 && (
                <div className="flex justify-between text-sm font-bold">
                    <span>Balance Due</span>
                    <span>{billingSummary.balanceDue.toFixed(2)}</span>
                </div>
            )}


            <DoubleLine />

            {/* PAYMENT */}
            <div className="flex justify-between">
                <span>Payment Mode</span>
                <span>{paymentMode}</span>
            </div>
            {paymentMode === 'CASH' && (
                <>
                    <div className="flex justify-between">
                        <span>Cash Received</span>
                        <span>{cashReceived?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Change Returned</span>
                        <span>{changeReturned?.toFixed(2)}</span>
                    </div>
                </>
            )}

            <DashedLine />

            {/* FOOTER */}
            <div className="text-center mt-2">Thank you for shopping with us</div>
            <div className="text-center">Goods once sold cannot be returned</div>
            <div className="text-center">https://pos-dashboard-qchj.vercel.app</div>
        </div>
    );
};

export default PosReceipt;

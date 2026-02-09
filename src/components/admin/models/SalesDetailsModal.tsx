"use client";

import { Calendar, Clock, FileText, Tag, Hash, User, Store, DollarSign, ShoppingBag, CreditCard, Gift, MapPin, Mail, Phone, Info, CheckCircle2 } from "lucide-react";
import { Constants } from "@/constant";
import { WebComponents } from "@/components";
import { AdminTypes } from "@/types";

const SalesDetailsModal = ({
    sale,
    onClose,
}: AdminTypes.SalesTypes.Sales.SalesDetailsModalProps) => {
    const statusLabel = sale.saleStatus || 'N/A';
    const statusColor = sale.saleStatus === "completed" ? "active" : (sale.saleStatus === "cancelled" ? "inactive" : "pending");

    return (
        <WebComponents.WebCommonComponents.CommonComponents.DetailsModalLayout
            title="Sale Details"
            subtitle={`Invoice #${sale.invoiceNumber}`}
            icon={<ShoppingBag size={32} className="text-white" />}
            statusLabel={statusLabel}
            statusColor={statusColor}
            onClose={onClose}
        >
            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Customer & Store Info */}
                <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoCard
                    title="Customer & Store Info"
                    icon={<User size={18} className="text-white" />}
                >
                    <div className="space-y-4">
                        <div>
                            <h4 className="text-[10px] font-bold text-gray-400 uppercase mb-2 tracking-wider flex items-center gap-1">
                                <User size={10} /> Customer Details
                            </h4>
                            <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
                                label="Name"
                                icon={<User size={16} />}
                                value={sale.customerSnapshot?.customerName || (sale.isWalkInCustomer ? "Walk-in Customer" : "N/A")}
                            />
                            {sale.customerSnapshot?.customerCode && (
                                <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
                                    label="Code"
                                    icon={<Hash size={16} />}
                                    value={sale.customerSnapshot.customerCode}
                                />
                            )}
                            {sale.customerSnapshot?.phone && (
                                <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
                                    label="Phone"
                                    icon={<Phone size={16} />}
                                    value={sale.customerSnapshot.phone}
                                />
                            )}
                            {sale.customerSnapshot?.email && (
                                <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
                                    label="Email"
                                    icon={<Mail size={16} />}
                                    value={sale.customerSnapshot.email}
                                />
                            )}
                        </div>

                        <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                            <h4 className="text-[10px] font-bold text-gray-400 uppercase mb-2 tracking-wider flex items-center gap-1">
                                <Store size={10} /> Store Details
                            </h4>
                            <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
                                label="Store"
                                icon={<Store size={16} />}
                                value={sale.storeSnapshot?.name || "N/A"}
                            />
                            {sale.storeSnapshot?.location && (sale.storeSnapshot.location.city || sale.storeSnapshot.location.address) && (
                                <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
                                    label="Location"
                                    icon={<MapPin size={16} />}
                                    value={`${sale.storeSnapshot.location.address ? sale.storeSnapshot.location.address + ', ' : ''}${sale.storeSnapshot.location.city}${sale.storeSnapshot.location.state ? ', ' + sale.storeSnapshot.location.state : ''}`}
                                />
                            )}
                        </div>
                    </div>
                </WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoCard>

                {/* Financial Info */}
                <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoCard
                    title="Payment Summary"
                    icon={<DollarSign size={18} className="text-white" />}
                >
                    <div className="space-y-1">
                        <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
                            label="Sub Total"
                            icon={<DollarSign size={16} />}
                            value={`$${sale.billingSummary?.subTotal?.toFixed(2) || "0.00"}`}
                        />

                        {(sale.billingSummary?.discountTotal || 0) > 0 && (
                            <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
                                label="Product Discount"
                                icon={<Tag size={16} className="text-orange-500" />}
                                value={`-$${sale.billingSummary?.discountTotal?.toFixed(2)}`}
                            />
                        )}

                        {(sale.billingSummary?.couponDiscount || 0) > 0 && (
                            <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
                                label="Coupon Discount"
                                icon={<Tag size={16} className="text-blue-500" />}
                                value={`-$${sale.billingSummary?.couponDiscount?.toFixed(2)}`}
                            />
                        )}

                        {(sale.billingSummary?.loyaltyDiscount || 0) > 0 && (
                            <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
                                label="Loyalty Discount"
                                icon={<Gift size={16} className="text-purple-500" />}
                                value={`-$${sale.billingSummary?.loyaltyDiscount?.toFixed(2)}`}
                            />
                        )}

                        {(sale.billingSummary?.giftCardDiscount || 0) > 0 && (
                            <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
                                label="Gift Card Discount"
                                icon={<CreditCard size={16} className="text-indigo-500" />}
                                value={`-$${sale.billingSummary?.giftCardDiscount?.toFixed(2)}`}
                            />
                        )}

                        <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
                            label="Tax Amount"
                            icon={<Info size={16} className="text-cyan-500" />}
                            value={`$${sale.billingSummary?.taxTotal?.toFixed(2) || "0.00"}`}
                        />

                        {sale.billingSummary?.roundingAdjustment !== 0 && (
                            <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
                                label="Rounding"
                                icon={<Clock size={16} />}
                                value={`${(sale.billingSummary?.roundingAdjustment || 0) > 0 ? '+' : ''}${sale.billingSummary?.roundingAdjustment?.toFixed(2)}`}
                            />
                        )}

                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 space-y-2">
                            <div>
                                <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoLabel
                                    label="Grand Total"
                                    icon={<DollarSign size={18} className="text-primary font-bold" />}
                                />
                                <p className="text-lg font-bold text-gray-900 dark:text-white ml-6">
                                    ${sale.billingSummary?.roundedGrandTotal?.toFixed(2) || "0.00"}
                                </p>
                            </div>
                            <div>
                                <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoLabel
                                    label="Amount Paid"
                                    icon={<CheckCircle2 size={16} className="text-green-600" />}
                                />
                                <p className="text-lg font-semibold text-green-600 ml-6">
                                    ${sale.billingSummary?.amountPaid?.toFixed(2) || "0.00"}
                                </p>
                            </div>
                            {(sale.billingSummary?.balanceDue || 0) > 0 && (
                                <div>
                                    <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoLabel
                                        label="Balance Due"
                                        icon={<DollarSign size={16} className="text-red-600" />}
                                    />
                                    <p className="text-lg font-semibold text-red-600 ml-6">
                                        ${sale.billingSummary?.balanceDue?.toFixed(2) || "0.00"}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoCard>
            </div>

            {/* Tax Breakdown */}
            {sale.appliedTaxes && sale.appliedTaxes.length > 0 && (
                <div className="mt-6">
                    <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoCard
                        title="Tax Breakdown"
                        icon={<Tag size={18} className="text-white" />}
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {sale.appliedTaxes.map((tax: any, idx: number) => (
                                <div key={idx} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700">
                                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{tax.taxName} ({tax.percentage}%)</div>
                                    <div className="text-lg font-bold text-gray-900 dark:text-white">${tax.amount?.toFixed(2)}</div>
                                </div>
                            ))}
                        </div>
                    </WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoCard>
                </div>
            )}

            {/* Payment History */}
            {sale.paymentDetails && sale.paymentDetails.length > 0 && (
                <div className="mt-6">
                    <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoCard
                        title="Payment History"
                        icon={<CreditCard size={18} className="text-white" />}
                    >
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-[10px] text-gray-500 uppercase bg-gray-50 dark:bg-gray-900/50 dark:text-gray-400 font-bold tracking-wider">
                                    <tr>
                                        <th className="px-6 py-3">Method</th>
                                        <th className="px-6 py-3">Amount</th>
                                        <th className="px-6 py-3">Status</th>
                                        <th className="px-6 py-3">Cash Details</th>
                                        <th className="px-6 py-3">Paid At</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {sale.paymentDetails.map((payment: any, idx: number) => (
                                        <tr key={idx} className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="p-1.5 rounded-md bg-gray-100 dark:bg-gray-700">
                                                        {payment.method === 'cash' ? <DollarSign size={14} /> : <CreditCard size={14} />}
                                                    </div>
                                                    <span className="capitalize font-semibold text-gray-900 dark:text-white">{payment.method}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">${payment.amount?.toFixed(2)}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${payment.status === 'completed'
                                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                    : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                    }`}>
                                                    {payment.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-xs">
                                                {payment.method === 'cash' ? (
                                                    <div className="space-y-0.5 text-gray-600 dark:text-gray-400">
                                                        <div className="flex justify-between w-24"><span>Received:</span> <span className="font-medium">${payment.cashReceived?.toFixed(2)}</span></div>
                                                        <div className="flex justify-between w-24"><span>Change:</span> <span className="font-medium">${payment.changeReturned?.toFixed(2)}</span></div>
                                                    </div>
                                                ) : <span className="text-gray-400">—</span>}
                                            </td>
                                            <td className="px-6 py-4 text-xs text-gray-500">
                                                <div className="flex flex-col">
                                                    <span>{payment.paidAt ? new Date(payment.paidAt).toLocaleDateString() : 'N/A'}</span>
                                                    <span className="text-[10px] opacity-70">{payment.paidAt ? new Date(payment.paidAt).toLocaleTimeString() : ''}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoCard>
                </div>
            )}

            {/* Items Table */}
            <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                <div className="bg-gray-50 dark:bg-gray-900/50 px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <ShoppingBag size={18} className="text-primary" />
                        Purchased Items ({sale.products?.length || 0})
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-[10px] text-gray-500 uppercase bg-gray-50 dark:bg-gray-900/50 dark:text-gray-400 font-bold tracking-wider">
                            <tr>
                                <th className="px-6 py-3">Product Description</th>
                                <th className="px-6 py-3 text-center">Qty</th>
                                <th className="px-6 py-3 text-right">Unit Price</th>
                                <th className="px-6 py-3 text-right">Tax</th>
                                <th className="px-6 py-3 text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {sale.products?.map((item: any, index: number) => (
                                <tr key={index} className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors align-top">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-gray-900 dark:text-white">
                                            {item.productName || item.name || "Unknown Product"}
                                        </div>
                                        <div className="text-[11px] text-gray-500 mt-1 space-y-1">
                                            <div className="flex items-center gap-1.5">
                                                <span className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-[10px] font-mono">SKU: {item.sku || item.SKU}</span>
                                                {item.categoryName && <span className="text-primary/70">• {item.categoryName}</span>}
                                            </div>
                                            {item.variantCombination && item.variantCombination.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {item.variantCombination.map((v: any, idx: number) => (
                                                        <span key={idx} className="bg-primary/10 text-primary text-[10px] px-1.5 py-0.5 rounded-sm font-medium border border-primary/20">
                                                            {v.name}: {v.value}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center font-medium">
                                        {item.quantity} <span className="text-xs text-gray-400">{item.unitSnapshot?.shortName || item.unitSnapshot?.unit || ''}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="text-gray-900 dark:text-white font-medium">${(item.unitPrice || item.sellingPrice || item.price || 0).toFixed(2)}</div>
                                        {(item.productDiscountAmount || 0) > 0 && (
                                            <div className="text-[10px] text-red-500 font-bold flex items-center justify-end gap-1">
                                                <Tag size={10} /> -${item.productDiscountAmount.toFixed(2)}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="text-gray-900 dark:text-white font-medium">${(item.taxAmount || 0).toFixed(2)}</div>
                                        <div className="text-[9px] text-gray-400 italic">
                                            {item.taxSnapshots?.map((ts: any) => `${ts.taxName} (${ts.percentage}%)`).join(', ')}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="font-bold text-gray-900 dark:text-white">
                                            ${((item.netAmount || 0) + (item.exclusiveTaxAmount || 0)).toFixed(2)}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Timeline & Metadata */}
            <div className="mt-6 bg-gradient-to-br from-slate-50 to-gray-50 dark:from-gray-800 dark:to-gray-900/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-inner">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Clock size={18} className="text-gray-400" />
                    Activity Timeline
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <WebComponents.UiComponents.UiWebComponents.DetailsCommon.TimelineItem
                        icon={<Calendar size={18} className="text-blue-500" />}
                        label="Ordered Date"
                        value={
                            sale.saleDate
                                ? new Date(sale.saleDate).toLocaleDateString() + ' ' + new Date(sale.saleDate).toLocaleTimeString()
                                : "N/A"
                        }
                    />
                    <WebComponents.UiComponents.UiWebComponents.DetailsCommon.TimelineItem
                        icon={<Clock size={18} className="text-orange-500" />}
                        label="Last Updated"
                        value={
                            sale.updatedAt
                                ? new Date(sale.updatedAt).toLocaleDateString() + ' ' + new Date(sale.updatedAt).toLocaleTimeString()
                                : "N/A"
                        }
                    />
                    <WebComponents.UiComponents.UiWebComponents.DetailsCommon.TimelineItem
                        icon={<User size={18} className="text-green-500" />}
                        label="Source"
                        value={sale.isWalkInCustomer ? "POS Terminal (Walk-in)" : "POS Terminal (Customer)"}
                    />
                </div>
            </div>
        </WebComponents.WebCommonComponents.CommonComponents.DetailsModalLayout>
    );
};

export default SalesDetailsModal;


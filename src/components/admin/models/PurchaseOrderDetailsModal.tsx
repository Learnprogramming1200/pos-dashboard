"use client";
import { Receipt, Mail, Package, Calendar, Clock, MapPin, Phone, User, Building2, FileText, Printer, Hash } from "lucide-react";
import { Constants } from "@/constant";
import { WebComponents } from "@/components";
import { AdminTypes } from "@/types";
import { useState } from "react";
import { sendPurchaseOrderEmailAction } from "@/lib/server-actions";

interface PurchaseOrderDetailsModalProps {
    order: AdminTypes.purchaseOrderTypes.PurchaseOrder;
    onClose: () => void;
    onEdit?: (order: AdminTypes.purchaseOrderTypes.PurchaseOrder) => void;
    onUpdateStatus?: (orderId: string, status: string, orderData?: AdminTypes.purchaseOrderTypes.PurchaseOrder) => Promise<void>;
    onReceive?: (order: AdminTypes.purchaseOrderTypes.PurchaseOrder) => void;
    getAllowedNextStatuses?: (status: string) => string[];
    getStatusDisplayName?: (status: string) => string;
}

const PurchaseOrderDetailsModal = ({
    order,
    onClose,
    onUpdateStatus,
    onReceive,
    getAllowedNextStatuses,
    getStatusDisplayName,
}: PurchaseOrderDetailsModalProps) => {
    const [isSendingEmail, setIsSendingEmail] = useState(false);
    const strings = Constants.adminConstants;
    const { Button, SwalHelper } = WebComponents.UiComponents.UiWebComponents;

    const formatAddressLine = (
        address?: string,
        city?: string,
        state?: string,
        postalCode?: string,
        country?: string
    ) => {
        const parts = [
            address?.trim() || '',
            city?.trim() || '',
            [state?.trim() || '', postalCode?.trim() || ''].filter(Boolean).join(' '),
            country?.trim() || ''
        ].filter(Boolean);
        const formatted = parts.join(', ');
        return formatted || 'N/A';
    };

    const currentStatus = order.status || order.orderDetails?.status || 'Draft';

    const statusColor = (() => {
        switch (currentStatus) {
            case 'Received': return 'active';
            case 'Draft': return 'inactive';
            case 'Approved': return 'active';
            case 'Billed': return 'active';
            case 'Cancelled': return 'inactive';
            default: return 'active';
        }
    })();

    const formatDate = (date: any): string => {
        if (!date) return '-';
        try {
            // Handle MongoDB date format with $date
            if (typeof date === 'string' && date.includes('$date')) {
                const parsed = JSON.parse(date);
                date = parsed.$date;
            } else if (date && typeof date === 'object' && '$date' in date) {
                date = (date as any).$date;
            }

            const d = new Date(date);
            if (isNaN(d.getTime())) return '-';
            return d.toLocaleDateString();
        } catch {
            return '-';
        }
    };

    const poNumber = order.orderDetails?.poNumber || order.orderNumber || 'N/A';
    const purchaseDate = formatDate(order.orderDetails?.purchaseDate || order.purchaseDate);
    const expectedDelivery = formatDate(order.orderDetails?.expectedDeliveryDate || order.expectedDeliveryDate);
    const supplierName = order.supplier?.supplierName || order.supplierName || 'N/A';
    const supplierEmail = order.supplier?.email || order.supplierEmail || order.supplier.shippingAddress.email || 'N/A';
    const phone = order.shippingDetails?.phone || order.supplier.shippingAddress.phone || (order as any).supplierPhone || 'N/A';

    const subtotal = Number(order.totals?.subtotal || (order as any).subtotal || 0);
    const totalDiscount = Number(order.totals?.totalDiscount || (order as any).discountAmount || 0);
    const totalTax = Number(order.totals?.totalTax || (order as any).taxAmount || 0);
    const grandTotal = Number(order.totals?.grandTotal || (order as any).totalAmount || (subtotal - totalDiscount + totalTax));

    return (
        <WebComponents.WebCommonComponents.CommonComponents.DetailsModalLayout
            title={strings.purchaseOrderDetailsLabel}
            subtitle={strings.completePurchaseOrderInformationAndDetailsLabel}
            icon={<Receipt size={32} className="text-white" />}
            statusLabel={getStatusDisplayName ? getStatusDisplayName(currentStatus) : currentStatus}
            statusColor={statusColor}
            onClose={onClose}
        >
            <div className="flex flex-col gap-6">
                {/* Actions Bar */}
                <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={async () => {
                                try {
                                    setIsSendingEmail(true);
                                    const result = await sendPurchaseOrderEmailAction(order.id || (order as any)._id);
                                    if (result.success) {
                                        SwalHelper.success({ text: result.message || "Email sent successfully" });
                                    } else {
                                        SwalHelper.error({ text: result.error || "Failed to send email" });
                                    }
                                } catch (error) {
                                    SwalHelper.error({ text: "An error occurred while sending email" });
                                } finally {
                                    setIsSendingEmail(false);
                                }
                            }}
                            disabled={isSendingEmail}
                            className="flex items-center gap-2"
                        >
                            <Mail size={16} />
                            {isSendingEmail ? "Sending..." : strings.sendEmailLabel}
                        </Button>

                        {/* <Button
                            size="sm"
                            variant="outline"
                            onClick={handleGeneratePDF}
                            className="flex items-center gap-2"
                        >
                            <Printer size={16} />
                            Print PDF
                        </Button> */}
                        {/* 
                        {onReceive && (['Approved', 'InTransit', 'Ordered'].includes(order.status)) && (
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onReceive(order)}
                                className="flex items-center gap-2"
                            >
                                <Package size={16} />
                                {strings.receiveButtonLabel}
                            </Button>
                        )} */}
                    </div>

                    {onUpdateStatus && getAllowedNextStatuses && getAllowedNextStatuses(order.status).length > 0 && (
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-gray-500 uppercase">{strings.changeStatusLabel}:</span>
                            <select
                                onChange={async (e) => {
                                    const newStatus = e.target.value;
                                    if (newStatus) {
                                        await onUpdateStatus(order.id, newStatus, order);
                                    }
                                }}
                                className="h-9 px-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                defaultValue=""
                            >
                                <option value="">Select Status</option>
                                {getAllowedNextStatuses(order.status).map((status) => (
                                    <option key={status} value={status}>
                                        {getStatusDisplayName ? getStatusDisplayName(status) : status}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                {/* Main Info Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoCard title={strings.orderInformationLabel} icon={<Receipt size={18} className="text-white" />}>
                        <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow label={strings.orderNumberLabel} icon={<Hash size={16} className="text-gray-500" />} value={poNumber} />
                        <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow label={strings.purchaseDateLabel} icon={<Calendar size={16} className="text-gray-500" />} value={purchaseDate} />
                        <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow label={strings.expectedDeliveryLabel} icon={<Clock size={16} className="text-gray-500" />} value={expectedDelivery} />
                        <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow label={strings.paymentTermsLabel} icon={<FileText size={16} className="text-gray-500" />} value={order.orderDetails?.paymentTerms || order.paymentTerms || 'N/A'} />
                    </WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoCard>

                    <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoCard title={strings.supplierLabel} icon={<Building2 size={18} className="text-white" />}>
                        <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow label={strings.supplierLabel} icon={<User size={16} className="text-gray-500" />} value={supplierName} />
                        <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow label={strings.supplierEmailLabel} icon={<Mail size={16} className="text-gray-500" />} value={supplierEmail} />
                        <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow label={strings.phoneLabel || "Phone"} icon={<Phone size={16} className="text-gray-500" />} value={phone} />
                        <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow label="Address" icon={<MapPin size={16} className="text-gray-500" />} value={formatAddressLine(
                            order.shippingDetails?.address || order.supplier?.address || (order.supplier?.billingAddress?.address1),
                            order.shippingDetails?.city || order.supplier?.city || (order.supplier?.billingAddress?.city),
                            order.shippingDetails?.state || order.supplier?.state || (order.supplier?.billingAddress?.state),
                            order.shippingDetails?.postalCode || order.supplier?.postalCode || (order.supplier?.billingAddress?.postalCode),
                            order.shippingDetails?.country || order.supplier?.country || (order.supplier?.billingAddress?.country)
                        )} />
                    </WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoCard>
                </div>

                {/* Items Table */}
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="bg-gray-50 dark:bg-gray-800/50 px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
                        <Package size={18} className="text-primary" />
                        <h3 className="font-bold text-gray-900 dark:text-white">{strings.itemsLabel}</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-semibold uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">{strings.productNameLabel}</th>
                                    <th className="px-6 py-4">{strings.skuLabel}</th>
                                    <th className="px-6 py-4 text-center">{strings.quantityLabel}</th>
                                    <th className="px-6 py-4 text-right">{strings.unitPriceLabel}</th>
                                    <th className="px-6 py-4 text-right">{strings.lineTotalLabel}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {order.items?.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                            {item.productName}
                                            {item.variant && <span className="ml-2 text-xs text-gray-500">({item.variant})</span>}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{(item as any).sku || (item as any).SKU || (item as any).productCode || 'N/A'}</td>
                                        <td className="px-6 py-4 text-center text-gray-900 dark:text-white">{item.quantity}</td>
                                        <td className="px-6 py-4 text-right text-gray-900 dark:text-white">₹{(item.unitPrice || 0).toLocaleString()}</td>
                                        <td className="px-6 py-4 text-right font-semibold text-gray-900 dark:text-white">₹{((item as any).lineTotal || (Number(item.quantity || 0) * Number(item.unitPrice || 0))).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Totals Summary */}
                <div className="flex justify-end mt-4">
                    <div className="w-full lg:w-1/3 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700 space-y-3">
                        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                            <span>{strings.subTotalLabel}</span>
                            <span className="font-medium">₹{subtotal.toLocaleString()}</span>
                        </div>
                        {totalDiscount > 0 && (
                            <div className="flex justify-between text-sm text-red-600 dark:text-red-400">
                                <span>{strings.discountAmountLabel}</span>
                                <span className="font-medium">-₹{totalDiscount.toLocaleString()}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                            <span>{strings.taxAmountLabel}</span>
                            <span className="font-medium">₹{totalTax.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white pt-3 border-t border-gray-200 dark:border-gray-700">
                            <span>{strings.totalAmountLabel}</span>
                            <span>₹{grandTotal.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {/* Timeline */}
                <div className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                        <Clock size={20} className="text-gray-600 dark:text-gray-300" />
                        {strings.activityTimelineLabel}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <WebComponents.UiComponents.UiWebComponents.DetailsCommon.TimelineItem
                            icon={<Calendar size={20} />}
                            label={strings.createdOnLabel}
                            value={order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                        />
                        <WebComponents.UiComponents.UiWebComponents.DetailsCommon.TimelineItem
                            icon={<Clock size={20} />}
                            label={strings.lastModifiedLabel}
                            value={order.updatedAt ? new Date(order.updatedAt).toLocaleDateString() : 'N/A'}
                        />
                    </div>
                </div>
            </div>
        </WebComponents.WebCommonComponents.CommonComponents.DetailsModalLayout>
    );
};

export default PurchaseOrderDetailsModal;

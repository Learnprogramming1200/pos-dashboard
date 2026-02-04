"use client";
import React from "react";
import { Receipt, User, Building2, Tag, Clock, CreditCard, FileText, Calendar } from "lucide-react";
import { Constants } from "@/constant";
import { WebComponents } from "@/components";
import { AdminTypes } from "@/types";

interface ExpenseDetailsModalProps {
    expense: AdminTypes.ExpenseTypes.Expense.Expense;
    onClose: () => void;
}

const ExpenseDetailsModal: React.FC<ExpenseDetailsModalProps> = ({ expense, onClose }) => {
    const formatDate = (dateStr: string | undefined | null) => {
        if (!dateStr || dateStr === "N/A") return "N/A";
        try {
            const datePart = dateStr.split("T")[0];
            const parts = datePart.split("-");
            if (parts.length === 3) {
                const [y, m, d] = parts;
                return `${d}-${m}-${y}`;
            }
            return dateStr;
        } catch (e) {
            return dateStr;
        }
    };

    const expenseData = {
        store: expense?.store?.name || "N/A",
        categoryName: expense?.category?.name || "N/A",
        amount: expense.amount || 0,
        description: expense.description || "N/A",
        expenseDate: formatDate(expense.expenseDate),
        paymentMethod: expense.paymentMethod || "N/A",
        status: expense.status || "Pending",
        cardNumber: expense.cardNumber || "N/A",
        cardHolderName: expense.cardHolderName || "N/A",
        cardType: expense.cardType || "N/A",
        expiryMonth: expense.expiryMonth || "N/A",
        expiryYear: expense.expiryYear || "N/A",
        bankName: expense.bankName || "N/A",
        branchName: expense.branchName || "N/A",
        accountNumber: expense.accountNumber || "N/A",
        ifscCode: expense.ifscCode || "N/A",
        chequeNumber: expense.chequeNumber || "N/A",
        createdDate: expense.createdAt ? new Date(expense.createdAt).toLocaleDateString() : "N/A",
        lastUpdated: expense.updatedAt ? new Date(expense.updatedAt).toLocaleDateString() : "N/A",
    };

    const statusColor =
        expenseData.status === "approved" ? "active" :
            expenseData.status === "rejected" ? "inactive" : "pending";

    return (
        <WebComponents.WebCommonComponents.CommonComponents.DetailsModalLayout
            title={Constants.adminConstants.expenseDetailsLabel || "Expense Details"}
            subtitle={Constants.adminConstants.completeExpenseInformationAndDetailsLabel || "Complete expense information and details"}
            icon={<Receipt size={32} className="text-white" />}
            statusLabel={expenseData.status}
            statusColor={statusColor as any}
            onClose={onClose}
        >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Expense Information Card */}
                <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoCard
                    title={Constants.adminConstants.expenseInformationLabel || "Expense Information"}
                    icon={<Receipt size={18} className="text-white" />}
                >
                    <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
                        label={Constants.adminConstants.storeLabel || "Store"}
                        icon={<Building2 size={16} />}
                        value={expenseData.store}
                    />
                    <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
                        label={Constants.adminConstants.categoryLabel || "Category"}
                        icon={<Tag size={16} />}
                        value={expenseData.categoryName}
                    />
                    <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
                        label="Amount"
                        icon={<Tag size={16} />}
                        value={`₹${expenseData.amount.toLocaleString()}`}
                    />
                    <div>
                        <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoLabel
                            icon={<FileText size={16} />}
                            label="Description"
                        />
                        <p className="text-base text-gray-700 ml-6 dark:text-gray-300">
                            {expenseData.description}
                        </p>
                    </div>
                </WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoCard>

                {/* Payment Information Card */}
                <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoCard
                    title="Payment Information"
                    icon={<CreditCard size={18} className="text-white" />}
                >
                    <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
                        label="Expense Date"
                        icon={<Calendar size={16} />}
                        value={expenseData.expenseDate}
                    />
                    <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
                        label="Payment Method"
                        icon={<CreditCard size={16} />}
                        value={expenseData.paymentMethod}
                    />

                    {expenseData.paymentMethod === "Credit Card" && (
                        <>
                            <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
                                label="Card Number"
                                icon={<CreditCard size={16} />}
                                value={expenseData.cardNumber}
                            />
                            <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
                                label="Card Holder"
                                icon={<User size={16} />}
                                value={expenseData.cardHolderName}
                            />
                            <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
                                label="Card Type"
                                icon={<Tag size={16} />}
                                value={expenseData.cardType}
                            />
                            <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
                                label="Expiry"
                                icon={<Calendar size={16} />}
                                value={`${expenseData.expiryMonth}/${expenseData.expiryYear}`}
                            />
                        </>
                    )}

                    {expenseData.paymentMethod === "Bank Transfer" && (
                        <>
                            <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
                                label="Bank Name"
                                icon={<Building2 size={16} />}
                                value={expenseData.bankName}
                            />
                            <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
                                label="Branch Name"
                                icon={<Building2 size={16} />}
                                value={expenseData.branchName}
                            />
                            <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
                                label="Account Number"
                                icon={<CreditCard size={16} />}
                                value={expenseData.accountNumber}
                            />
                            <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
                                label="IFSC Code"
                                icon={<Tag size={16} />}
                                value={expenseData.ifscCode}
                            />
                        </>
                    )}

                    {expenseData.paymentMethod === "Cheque" && (
                        <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
                            label="Cheque Number"
                            icon={<FileText size={16} />}
                            value={expenseData.chequeNumber}
                        />
                    )}

                </WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoCard>
            </div>

            {/* Timeline Section */}
            <div className="mt-4 bg-gradient-to-r from-slate-50 to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <Clock size={20} className="text-gray-600 dark:text-gray-300" />
                    {Constants.adminConstants.activityTimelineLabel || "Activity Timeline"}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <WebComponents.UiComponents.UiWebComponents.DetailsCommon.TimelineItem
                        icon={<Calendar size={20} />}
                        label={Constants.adminConstants.createdOnLabel || "Created On"}
                        value={expenseData.createdDate}
                    />
                    <WebComponents.UiComponents.UiWebComponents.DetailsCommon.TimelineItem
                        icon={<Clock size={20} />}
                        label={Constants.adminConstants.lastModifiedLabel || "Last Modified"}
                        value={expenseData.lastUpdated}
                    />
                </div>
            </div>
        </WebComponents.WebCommonComponents.CommonComponents.DetailsModalLayout>
    );
};

export default ExpenseDetailsModal;

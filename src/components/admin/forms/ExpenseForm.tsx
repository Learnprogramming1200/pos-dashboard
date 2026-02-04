"use client";
import React from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { Constants } from "@/constant";
import { expenseFormSchema } from "@/app/validation/ValidationSchema";
import { WebComponents } from "@/components";
import { AdminTypes } from "@/types";

interface ExpenseFormProps {
    onSubmit: (data: any) => void;
    expense?: AdminTypes.ExpenseTypes.Expense.Expense;
    categories: AdminTypes.ExpenseTypes.Expense.ExpenseCategory[];
    stores: AdminTypes.storeTypes.Store[];
}

type FormData = Yup.InferType<typeof expenseFormSchema> & {
    cardNumber?: string;
    cardHolderName?: string;
    cardType?: string;
    expiryMonth?: string;
    expiryYear?: string;
    bankName?: string;
    branchName?: string;
    accountNumber?: string;
    ifscCode?: string;
    chequeNumber?: string;
};

const ExpenseForm = ({ onSubmit, expense, categories, stores }: ExpenseFormProps) => {
    const formatDateForInput = (dateStr: string | undefined | null) => {
        if (!dateStr) return new Date().toISOString().split("T")[0];
        try {
            // If it contains 'T', it's likely an ISO string
            if (dateStr.includes("T")) {
                return dateStr.split("T")[0];
            }
            // If it's already YYYY-MM-DD
            if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
                return dateStr;
            }
            // Handle other common formats if necessary, but ISO is expected
            return new Date(dateStr).toISOString().split("T")[0];
        } catch (e) {
            return new Date().toISOString().split("T")[0];
        }
    };

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
        reset,
        watch,
    } = useForm<FormData>({
        resolver: yupResolver(expenseFormSchema) as any,
        defaultValues: {
            store: expense?.store?._id || (typeof expense?.store === 'string' ? expense.store : "") || "",
            categoryId: expense?.category?._id || expense?.categoryId || "",
            amount: expense?.amount || 0,
            description: expense?.description || "",
            expenseDate: formatDateForInput(expense?.expenseDate),
            paymentMethod: expense?.paymentMethod || "Cash",
            cardNumber: expense?.cardNumber || "",
            cardHolderName: expense?.cardHolderName || "",
            cardType: expense?.cardType || "",
            expiryMonth: expense?.expiryMonth || "",
            expiryYear: expense?.expiryYear || "",
            bankName: expense?.bankName || "",
            branchName: expense?.branchName || "",
            accountNumber: expense?.accountNumber || "",
            ifscCode: expense?.ifscCode || "",
            chequeNumber: expense?.chequeNumber || "",
        },
    });

    const paymentMethod = watch("paymentMethod");
    const description = watch("description");

    React.useEffect(() => {
        if (expense) {
            reset({
                store: expense.store?._id || (typeof expense.store === 'string' ? expense.store : "") || "",
                categoryId: expense.category?._id || expense.categoryId || "",
                amount: expense.amount || 0,
                description: expense.description || "",
                expenseDate: formatDateForInput(expense.expenseDate),
                paymentMethod: expense.paymentMethod || "Cash",
                cardNumber: expense.cardNumber || "",
                cardHolderName: expense.cardHolderName || "",
                cardType: expense.cardType || "",
                expiryMonth: expense.expiryMonth || "",
                expiryYear: expense.expiryYear || "",
                bankName: expense.bankName || "",
                branchName: expense.branchName || "",
                accountNumber: expense.accountNumber || "",
                ifscCode: expense.ifscCode || "",
                chequeNumber: expense.chequeNumber || "",
            });
        }
    }, [expense, reset]);

    const onSubmitForm = (data: FormData) => {
        onSubmit(data);
    };

    return (
        <form id="expense-form" onSubmit={handleSubmit(onSubmitForm)}>
            <div className="p-4 sm:p-5 md:p-6 lg:p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6 lg:gap-8">
                    {/* Store */}
                    <div>
                        <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="store">
                            Store <span className="text-required">{Constants.adminConstants.requiredstar}</span>
                        </WebComponents.UiComponents.UiWebComponents.FormLabel>
                        <Controller
                            name="store"
                            control={control}
                            render={({ field }) => (
                                <WebComponents.UiComponents.UiWebComponents.FormDropdown
                                    {...field}
                                    id="store"
                                    placeholder="Select Store"
                                    className={errors.store ? "border-red-500" : ""}
                                >
                                    <WebComponents.UiComponents.UiWebComponents.FormOption value="">Select Store</WebComponents.UiComponents.UiWebComponents.FormOption>
                                    {stores.map(s => (
                                        <WebComponents.UiComponents.UiWebComponents.FormOption key={s._id} value={s._id}>
                                            {s.name}
                                        </WebComponents.UiComponents.UiWebComponents.FormOption>
                                    ))}
                                </WebComponents.UiComponents.UiWebComponents.FormDropdown>
                            )}
                        />
                        {errors.store && (
                            <p className="mt-1 text-sm text-red-500">{errors.store.message}</p>
                        )}
                    </div>

                    {/* Category */}
                    <div>
                        <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="categoryId">
                            Expense Category <span className="text-required">{Constants.adminConstants.requiredstar}</span>
                        </WebComponents.UiComponents.UiWebComponents.FormLabel>
                        <Controller
                            name="categoryId"
                            control={control}
                            render={({ field }) => (
                                <WebComponents.UiComponents.UiWebComponents.FormDropdown
                                    {...field}
                                    id="categoryId"
                                    placeholder="Select Category"
                                    className={errors.categoryId ? "border-red-500" : ""}
                                >
                                    <WebComponents.UiComponents.UiWebComponents.FormOption value="">Select Category</WebComponents.UiComponents.UiWebComponents.FormOption>
                                    {categories.map(c => (
                                        <WebComponents.UiComponents.UiWebComponents.FormOption key={c._id} value={c._id}>
                                            {c.name}
                                        </WebComponents.UiComponents.UiWebComponents.FormOption>
                                    ))}
                                </WebComponents.UiComponents.UiWebComponents.FormDropdown>
                            )}
                        />
                        {errors.categoryId && (
                            <p className="mt-1 text-sm text-red-500">{errors.categoryId.message}</p>
                        )}
                    </div>

                    {/* Amount */}
                    <div>
                        <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="amount">
                            Amount <span className="text-required">{Constants.adminConstants.requiredstar}</span>
                        </WebComponents.UiComponents.UiWebComponents.FormLabel>
                        <WebComponents.UiComponents.UiWebComponents.FormInput
                            id="amount"
                            type="number"
                            placeholder="0.00"
                            {...register("amount")}
                            className={errors.amount ? "border-red-500" : ""}
                        />
                        {errors.amount && (
                            <p className="mt-1 text-sm text-red-500">{errors.amount.message}</p>
                        )}
                    </div>

                    {/* Expense Date */}
                    <div>
                        <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="expenseDate">
                            Expense Date <span className="text-required">{Constants.adminConstants.requiredstar}</span>
                        </WebComponents.UiComponents.UiWebComponents.FormLabel>
                        <WebComponents.UiComponents.UiWebComponents.FormInput
                            id="expenseDate"
                            type="date"
                            {...register("expenseDate")}
                            className={errors.expenseDate ? "border-red-500" : ""}
                        />
                        {errors.expenseDate && (
                            <p className="mt-1 text-sm text-red-500">{errors.expenseDate.message}</p>
                        )}
                    </div>

                    {/* Payment Method */}
                    <div>
                        <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="paymentMethod">
                            Payment Method <span className="text-required">{Constants.adminConstants.requiredstar}</span>
                        </WebComponents.UiComponents.UiWebComponents.FormLabel>
                        <Controller
                            name="paymentMethod"
                            control={control}
                            render={({ field }) => (
                                <WebComponents.UiComponents.UiWebComponents.FormDropdown
                                    {...field}
                                    id="paymentMethod"
                                    placeholder="Select Payment Method"
                                    className={errors.paymentMethod ? "border-red-500" : ""}
                                >
                                    <WebComponents.UiComponents.UiWebComponents.FormOption value="Cash">Cash</WebComponents.UiComponents.UiWebComponents.FormOption>
                                    <WebComponents.UiComponents.UiWebComponents.FormOption value="Bank Transfer">Bank Transfer</WebComponents.UiComponents.UiWebComponents.FormOption>
                                    <WebComponents.UiComponents.UiWebComponents.FormOption value="Credit Card">Credit Card</WebComponents.UiComponents.UiWebComponents.FormOption>
                                    <WebComponents.UiComponents.UiWebComponents.FormOption value="Cheque">Cheque</WebComponents.UiComponents.UiWebComponents.FormOption>
                                    <WebComponents.UiComponents.UiWebComponents.FormOption value="Digital Wallet">Digital Wallet</WebComponents.UiComponents.UiWebComponents.FormOption>
                                    <WebComponents.UiComponents.UiWebComponents.FormOption value="Other">Other</WebComponents.UiComponents.UiWebComponents.FormOption>
                                </WebComponents.UiComponents.UiWebComponents.FormDropdown>
                            )}
                        />
                        {errors.paymentMethod && (
                            <p className="mt-1 text-sm text-red-500">{errors.paymentMethod.message}</p>
                        )}
                    </div>

                    {/* Description */}
                    <div>
                        <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="description">
                            Description <span className="text-required">{Constants.adminConstants.requiredstar}</span>
                        </WebComponents.UiComponents.UiWebComponents.FormLabel>
                        <WebComponents.UiComponents.UiWebComponents.Textarea
                            id="description"
                            rows={3}
                            maxLength={250}
                            charCounter={false}
                            placeholder="Brief description"
                            {...register("description")}
                            className={errors.description ? "border-red-500" : ""}
                        />
                        <div className="flex justify-between items-center mt-1">
                            <div>
                                {errors.description && (
                                    <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>
                                )}
                            </div>
                            <div className="text-xs text-gray-500 text-right">
                                {(description || "").length}/250
                            </div>
                        </div>

                    </div>

                    {/* Conditional Fields for Credit Card */}
                    {paymentMethod === "Credit Card" && (
                        <>
                            <div>
                                <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="cardNumber">
                                    Card Number <span className="text-required">{Constants.adminConstants.requiredstar}</span>
                                </WebComponents.UiComponents.UiWebComponents.FormLabel>
                                <WebComponents.UiComponents.UiWebComponents.FormInput
                                    id="cardNumber"
                                    {...register("cardNumber")}
                                    placeholder="XXXX XXXX XXXX XXXX"
                                    className={errors.cardNumber ? "border-red-500" : ""}
                                />
                                {errors.cardNumber && (
                                    <p className="mt-1 text-sm text-red-500">{errors.cardNumber.message}</p>
                                )}
                            </div>
                            <div>
                                <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="cardHolderName">
                                    Card Holder Name <span className="text-required">{Constants.adminConstants.requiredstar}</span>
                                </WebComponents.UiComponents.UiWebComponents.FormLabel>
                                <WebComponents.UiComponents.UiWebComponents.FormInput
                                    id="cardHolderName"
                                    {...register("cardHolderName")}
                                    placeholder="John Doe"
                                    className={errors.cardHolderName ? "border-red-500" : ""}
                                />
                                {errors.cardHolderName && (
                                    <p className="mt-1 text-sm text-red-500">{errors.cardHolderName.message}</p>
                                )}
                            </div>
                            <div>
                                <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="cardType">
                                    Card Type <span className="text-required">{Constants.adminConstants.requiredstar}</span>
                                </WebComponents.UiComponents.UiWebComponents.FormLabel>
                                <WebComponents.UiComponents.UiWebComponents.FormInput
                                    id="cardType"
                                    {...register("cardType")}
                                    placeholder="Visa / MasterCard"
                                    className={errors.cardType ? "border-red-500" : ""}
                                />
                                {errors.cardType && (
                                    <p className="mt-1 text-sm text-red-500">{errors.cardType.message}</p>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <WebComponents.UiComponents.UiWebComponents.FormLabel>
                                        Expiry Month <span className="text-required">{Constants.adminConstants.requiredstar}</span>
                                    </WebComponents.UiComponents.UiWebComponents.FormLabel>
                                    <WebComponents.UiComponents.UiWebComponents.FormInput
                                        {...register("expiryMonth")}
                                        placeholder="MM"
                                        className={errors.expiryMonth ? "border-red-500" : ""}
                                    />
                                    {errors.expiryMonth && (
                                        <p className="mt-1 text-sm text-red-500">{errors.expiryMonth.message}</p>
                                    )}
                                </div>
                                <div>
                                    <WebComponents.UiComponents.UiWebComponents.FormLabel>
                                        Expiry Year <span className="text-required">{Constants.adminConstants.requiredstar}</span>
                                    </WebComponents.UiComponents.UiWebComponents.FormLabel>
                                    <WebComponents.UiComponents.UiWebComponents.FormInput
                                        {...register("expiryYear")}
                                        placeholder="YY"
                                        className={errors.expiryYear ? "border-red-500" : ""}
                                    />
                                    {errors.expiryYear && (
                                        <p className="mt-1 text-sm text-red-500">{errors.expiryYear.message}</p>
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                    {/* Conditional Fields for Bank Transfer */}
                    {paymentMethod === "Bank Transfer" && (
                        <>
                            <div>
                                <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="bankName">
                                    Bank Name <span className="text-required">{Constants.adminConstants.requiredstar}</span>
                                </WebComponents.UiComponents.UiWebComponents.FormLabel>
                                <WebComponents.UiComponents.UiWebComponents.FormInput
                                    id="bankName"
                                    {...register("bankName")}
                                    placeholder="Enter bank name"
                                    className={errors.bankName ? "border-red-500" : ""}
                                />
                                {errors.bankName && (
                                    <p className="mt-1 text-sm text-red-500">{errors.bankName.message}</p>
                                )}
                            </div>
                            <div>
                                <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="branchName">
                                    Branch Name <span className="text-required">{Constants.adminConstants.requiredstar}</span>
                                </WebComponents.UiComponents.UiWebComponents.FormLabel>
                                <WebComponents.UiComponents.UiWebComponents.FormInput
                                    id="branchName"
                                    {...register("branchName")}
                                    placeholder="Enter branch name"
                                    className={errors.branchName ? "border-red-500" : ""}
                                />
                                {errors.branchName && (
                                    <p className="mt-1 text-sm text-red-500">{errors.branchName.message}</p>
                                )}
                            </div>
                            <div>
                                <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="accountNumber">
                                    Account Number <span className="text-required">{Constants.adminConstants.requiredstar}</span>
                                </WebComponents.UiComponents.UiWebComponents.FormLabel>
                                <WebComponents.UiComponents.UiWebComponents.FormInput
                                    id="accountNumber"
                                    {...register("accountNumber")}
                                    placeholder="Enter account number"
                                    className={errors.accountNumber ? "border-red-500" : ""}
                                />
                                {errors.accountNumber && (
                                    <p className="mt-1 text-sm text-red-500">{errors.accountNumber.message}</p>
                                )}
                            </div>
                            <div>
                                <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="ifscCode">
                                    IFSC Code <span className="text-required">{Constants.adminConstants.requiredstar}</span>
                                </WebComponents.UiComponents.UiWebComponents.FormLabel>
                                <WebComponents.UiComponents.UiWebComponents.FormInput
                                    id="ifscCode"
                                    {...register("ifscCode")}
                                    placeholder="Enter IFSC code"
                                    className={errors.ifscCode ? "border-red-500" : ""}
                                />
                                {errors.ifscCode && (
                                    <p className="mt-1 text-sm text-red-500">{errors.ifscCode.message}</p>
                                )}
                            </div>
                        </>
                    )}

                    {/* Conditional Fields for Cheque */}
                    {paymentMethod === "Cheque" && (
                        <div>
                            <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="chequeNumber">Cheque Number</WebComponents.UiComponents.UiWebComponents.FormLabel>
                            <WebComponents.UiComponents.UiWebComponents.FormInput id="chequeNumber" {...register("chequeNumber")} placeholder="Enter cheque number" />
                        </div>
                    )}


                </div>
            </div>
        </form>
    );
};

export default ExpenseForm;

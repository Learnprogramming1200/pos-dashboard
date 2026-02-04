"use client";

import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { Constants } from "@/constant";
import { leaveTypeFormSchema } from "@/app/validation/ValidationSchema";
import { WebComponents } from "@/components";
import { AdminTypes } from "@/types";

export interface LeaveTypeFormProps {
    title: string;
    leaveType?: AdminTypes.hrmTypes.leaveTypes.LeaveType | null;
    onClose: () => void;
    onSubmit: (data: AdminTypes.hrmTypes.leaveTypes.LeaveTypeFormData) => void;
}

type FormData = Yup.InferType<typeof leaveTypeFormSchema>;

export function LeaveTypeForm({ title, leaveType, onClose, onSubmit }: LeaveTypeFormProps) {
    const {
        register,
        handleSubmit,
        control,
        formState: { errors, isSubmitting },
    } = useForm<FormData>({
        resolver: yupResolver(leaveTypeFormSchema) as any,
        defaultValues: {
            name: leaveType?.name || "",
            isPaid: leaveType?.isPaid || false,
            paidCount: leaveType?.paidCount || 1,
            description: leaveType?.description || "",
            status: (leaveType?.status === false || (leaveType as any)?.status === "Inactive") ? "Inactive" : "Active"
        }
    });

    const onSubmitForm = async (data: FormData) => {
        await onSubmit(data as AdminTypes.hrmTypes.leaveTypes.LeaveTypeFormData);
    };

    const submitText = title === "Edit" ? Constants.adminConstants.updateLabel : Constants.adminConstants.saveButtonLabel;

    return (
        <WebComponents.UiComponents.UiWebComponents.AdminFormModal
            formId="leave-type-form"
            onClose={onClose}
            submitText={submitText}
            cancelText={Constants.adminConstants.cancelButtonLabel}
            loading={isSubmitting}
            loadingText={Constants.adminConstants.processingLabel}
            wrapInForm
            onSubmit={handleSubmit(onSubmitForm)}
        >
            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="name">
                            {Constants.adminConstants.leaveTypeManagementStrings.nameLabel} <span className="text-red-500">{Constants.adminConstants.requiredstar}</span>
                        </WebComponents.UiComponents.UiWebComponents.FormLabel>
                        <WebComponents.UiComponents.UiWebComponents.FormInput
                            id="name"
                            type="text"
                            placeholder="e.g., Annual Leave"
                            {...register("name")}
                        />
                        {errors.name && (
                            <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
                        )}
                    </div>
                    <div>
                        <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="isPaid">
                            {Constants.adminConstants.leaveTypeManagementStrings.typeLabel} <span className="text-red-500">{Constants.adminConstants.requiredstar}</span>
                        </WebComponents.UiComponents.UiWebComponents.FormLabel>
                        <Controller
                            name="isPaid"
                            control={control}
                            render={({ field }) => (
                                <WebComponents.UiComponents.UiWebComponents.FormDropdown
                                    id="isPaid"
                                    value={field.value ? 'Paid' : 'Unpaid'}
                                    onChange={(e) => field.onChange(e.target.value === 'Paid')}
                                >
                                    <WebComponents.UiComponents.UiWebComponents.FormOption value="Paid">{Constants.adminConstants.leaveTypeManagementStrings.paidLabel}</WebComponents.UiComponents.UiWebComponents.FormOption>
                                    <WebComponents.UiComponents.UiWebComponents.FormOption value="Unpaid">{Constants.adminConstants.leaveTypeManagementStrings.unpaidLabel}</WebComponents.UiComponents.UiWebComponents.FormOption>
                                </WebComponents.UiComponents.UiWebComponents.FormDropdown>
                            )}
                        />
                        {errors.isPaid && (
                            <p className="mt-1 text-sm text-red-500">{errors.isPaid.message}</p>
                        )}
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="paidCount">
                            {Constants.adminConstants.leaveTypeManagementStrings.leaveCountLabel} <span className="text-red-500">{Constants.adminConstants.requiredstar}</span>
                        </WebComponents.UiComponents.UiWebComponents.FormLabel>
                        <WebComponents.UiComponents.UiWebComponents.FormInput
                            id="paidCount"
                            type="number"
                            placeholder="e.g., 21"
                            {...register("paidCount", { valueAsNumber: true })}
                        />
                        {errors.paidCount && (
                            <p className="mt-1 text-sm text-red-500">{errors.paidCount.message}</p>
                        )}
                    </div>
                    <div>
                        <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="leave-type-status-toggle">{Constants.adminConstants.leaveTypeManagementStrings.statusLabel}</WebComponents.UiComponents.UiWebComponents.FormLabel>
                        <div className="h-[44px] border-[0.6px] border-[#D8D9D9] dark:border-[#616161] rounded-[4px] bg-textMain2 dark:bg-[#1B1B1B] w-full">
                            <div className="flex items-center justify-between px-3 py-[10px]">
                                <Controller
                                    name="status"
                                    control={control}
                                    render={({ field }) => (
                                        <>
                                            <span className="text-sm font-interTight font-medium leading-[14px] text-textMain dark:text-white">
                                                {field.value}
                                            </span>
                                            <WebComponents.UiComponents.UiWebComponents.Switch
                                                id="leave-type-status-toggle"
                                                checked={field.value === 'Active'}
                                                onCheckedChange={(checked) => field.onChange(checked ? 'Active' : 'Inactive')}
                                            />
                                        </>
                                    )}
                                />
                            </div>
                        </div>
                        {errors.status && (
                            <p className="mt-1 text-sm text-red-500">{errors.status.message}</p>
                        )}
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="description">
                                {Constants.adminConstants.leaveTypeManagementStrings.descriptionLabel} <span className="text-red-500">{Constants.adminConstants.requiredstar}</span>
                            </WebComponents.UiComponents.UiWebComponents.FormLabel>
                            <p className="text-textSmall dark:text-gray-400 font-interTight font-normal text-xs sm:text-sm leading-[8px]">
                                Max 250 characters
                            </p>
                        </div>
                        <Controller
                            name="description"
                            control={control}
                            render={({ field }) => (
                                <>
                                    <WebComponents.UiComponents.UiWebComponents.Textarea
                                        {...field}
                                        id="description"
                                        placeholder="Description of the leave type"
                                        rows={3}
                                        charCounter={false}
                                        autoComplete="off"
                                    />
                                    <div className="flex justify-between items-center mt-1">
                                        {errors.description ? (
                                            <p className="text-sm text-red-500">{errors.description.message}</p>
                                        ) : (
                                            <div />
                                        )}
                                        <div className="text-xs text-textSmall font-interTight">
                                            {(field.value || "").length}/250
                                        </div>
                                    </div>
                                </>
                            )}
                        />
                    </div>
                </div>
            </div>
        </WebComponents.UiComponents.UiWebComponents.AdminFormModal>
    );
}

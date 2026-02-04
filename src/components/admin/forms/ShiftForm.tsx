"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { shiftFormSchema } from "@/app/validation/ValidationSchema";
import { Constants } from "@/constant";
import { WebComponents } from "@/components";
import { AdminTypes } from "@/types";

type FormData = Yup.InferType<typeof shiftFormSchema>;

export default function ShiftForm({ title, onClose, onSubmit, shift }: AdminTypes.hrmTypes.shiftTypes.ShiftFormProps) {
    const {
        register,
        handleSubmit,
        control,
        formState: { errors, isSubmitting },
        reset,
    } = useForm<FormData>({
        resolver: yupResolver(shiftFormSchema) as any,
        defaultValues: {
            title: shift?.title || "",
            breakDuration: shift?.breakDuration || undefined,
            startTime: shift?.startTime || "",
            endTime: shift?.endTime || "",
            status: shift?.status ? shift.status === "Active" : true,
            weekOff: (shift?.weekOff as string[]) || [],
        },
    });

    // Update form values when shift prop changes
    React.useEffect(() => {
        if (shift) {
            reset({
                title: shift.title || "",
                breakDuration: shift.breakDuration || undefined,
                startTime: shift.startTime || "",
                endTime: shift.endTime || "",
                status: shift.status === "Active",
                weekOff: (shift.weekOff as string[]) || [],
            });
        } else {
            reset({
                title: "",
                breakDuration: undefined,
                startTime: "",
                endTime: "",
                status: true,
                weekOff: [],
            });
        }
    }, [shift, reset]);

    const onSubmitForm = async (data: FormData) => {
        await onSubmit({
            ...data,
            breakDuration: data.breakDuration ? Number(data.breakDuration) : undefined,
            weekOff: (data.weekOff || []) as AdminTypes.hrmTypes.commonTypes.WeekDay[],
        } as AdminTypes.hrmTypes.shiftTypes.ShiftFormData);
    };

    return (
        <WebComponents.UiComponents.UiWebComponents.AdminFormModal
            formId="shift-form"
            onClose={onClose}
            submitText={Constants.adminConstants.shiftStrings.save}
            cancelText={Constants.adminConstants.shiftStrings.cancel}
            loading={isSubmitting}
            loadingText={Constants.adminConstants.processingLabel}
            wrapInForm
            onSubmit={handleSubmit(onSubmitForm)}
        >
            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="title">
                            {Constants.adminConstants.shiftStrings.titleLabel}{" "}
                            <span className="text-red-500">{Constants.superadminConstants.requiredstar}</span>
                        </WebComponents.UiComponents.UiWebComponents.FormLabel>
                        <WebComponents.UiComponents.UiWebComponents.FormInput
                            id="title"
                            placeholder="Enter shift title"
                            {...register("title")}
                            className={errors.title ? "border-red-500" : ""}
                        />
                        {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
                    </div>
                    <div>
                        <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="breakDuration">
                            {Constants.adminConstants.shiftManagementStrings.breakDurationLabel}{" "}
                            <span className="text-red-500">{Constants.superadminConstants.requiredstar}</span>
                        </WebComponents.UiComponents.UiWebComponents.FormLabel>
                        <WebComponents.UiComponents.UiWebComponents.FormInput
                            id="breakDuration"
                            type="number"
                            min={0}
                            placeholder="e.g., 30"
                            {...register("breakDuration", { valueAsNumber: true })}
                            className={errors.breakDuration ? "border-red-500" : ""}
                        />
                        {errors.breakDuration && <p className="mt-1 text-xs text-red-500">{errors.breakDuration.message}</p>}
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="startTime">
                            {Constants.adminConstants.shiftManagementStrings.startTimeLabel}{" "}
                            <span className="text-red-500">{Constants.superadminConstants.requiredstar}</span>
                        </WebComponents.UiComponents.UiWebComponents.FormLabel>
                        <Controller
                            name="startTime"
                            control={control}
                            render={({ field: { value, onChange } }) => (
                                <WebComponents.UiComponents.UiWebComponents.TimePicker
                                    id="startTime"
                                    value={value}
                                    onChange={onChange}
                                    className={errors.startTime ? "border-red-500" : ""}
                                />
                            )}
                        />
                        {errors.startTime && <p className="mt-1 text-xs text-red-500">{errors.startTime.message}</p>}
                    </div>
                    <div>
                        <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="endTime">
                            {Constants.adminConstants.shiftManagementStrings.endTimeLabel}{" "}
                            <span className="text-red-500">{Constants.superadminConstants.requiredstar}</span>
                        </WebComponents.UiComponents.UiWebComponents.FormLabel>
                        <Controller
                            name="endTime"
                            control={control}
                            render={({ field: { value, onChange } }) => (
                                <WebComponents.UiComponents.UiWebComponents.TimePicker
                                    id="endTime"
                                    value={value}
                                    onChange={onChange}
                                    className={errors.endTime ? "border-red-500" : ""}
                                />
                            )}
                        />
                        {errors.endTime && <p className="mt-1 text-xs text-red-500">{errors.endTime.message}</p>}
                    </div>
                </div>
                <div className="mb-6">
                    <WebComponents.UiComponents.UiWebComponents.FormLabel>
                        {Constants.adminConstants.shiftManagementStrings.weekOffLabel}{" "}
                        <span className="text-red-500">{Constants.superadminConstants.requiredstar}</span>
                    </WebComponents.UiComponents.UiWebComponents.FormLabel>

                    <Controller
                        name="weekOff"
                        control={control}
                        render={({ field: { value, onChange } }) => (
                            <div className="flex items-center gap-4 mt-2 overflow-x-auto whitespace-nowrap px-1 pb-2">
                                {(
                                    ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as AdminTypes.hrmTypes.commonTypes.WeekDay[]
                                ).map((day) => {
                                    const checked = (value || []).includes(day);
                                    return (
                                        <label
                                            key={day}
                                            className="inline-flex items-center gap-2 text-sm text-textMain dark:text-white cursor-pointer hover:text-primary transition-colors"
                                        >
                                            <WebComponents.UiComponents.UiWebComponents.Checkbox
                                                checked={checked}
                                                onChange={(e) => {
                                                    const isChecked = (e.target as HTMLInputElement).checked;
                                                    const nextValue = isChecked
                                                        ? [...(value || []), day]
                                                        : (value || []).filter((d) => d !== day);
                                                    onChange(nextValue);
                                                }}
                                            />
                                            <span>{day}</span>
                                        </label>
                                    );
                                })}
                            </div>
                        )}
                    />
                    {errors.weekOff && <p className="mt-1 text-xs text-red-500">{errors.weekOff.message}</p>}
                </div>
                <div className="mb-2">
                    <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="status">
                        {Constants.adminConstants.shiftStrings.statusLabel}
                    </WebComponents.UiComponents.UiWebComponents.FormLabel>
                    <Controller
                        name="status"
                        control={control}
                        render={({ field: { value, onChange } }) => (
                            <div className="h-[44px] border-[0.6px] border-[#D8D9D9] dark:border-[#616161] rounded-[4px] bg-textMain2 dark:bg-[#1B1B1B] w-full md:w-[calc(50%-0.75rem)]">
                                <div className="flex items-center justify-between px-3 py-[10px]">
                                    <span className="text-sm font-interTight font-medium leading-[14px] text-textMain dark:text-white">
                                        {value ? "Active" : "Inactive"}
                                    </span>
                                    <WebComponents.UiComponents.UiWebComponents.Switch
                                        id="shift-status-toggle"
                                        checked={!!value}
                                        onCheckedChange={onChange}
                                    />
                                </div>
                            </div>
                        )}
                    />
                    {errors.status && <p className="mt-1 text-xs text-red-500">{errors.status.message}</p>}
                </div>
            </div>
        </WebComponents.UiComponents.UiWebComponents.AdminFormModal>
    );
}

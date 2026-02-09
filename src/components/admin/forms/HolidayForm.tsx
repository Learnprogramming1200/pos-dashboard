"use client";
import React from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { holidayFormSchema } from "@/app/validation/ValidationSchema";
import { Constants } from "@/constant";
import { WebComponents } from "@/components";
import { AdminTypes } from "@/types";
type FormData = Yup.InferType<typeof holidayFormSchema>;
const HolidayForm = ({ onSubmit, holiday }: AdminTypes.hrmTypes.holidayTypes.HolidayFormProps) => {
    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
        reset,
    } = useForm<FormData>({
        resolver: yupResolver(holidayFormSchema) as any,
        defaultValues: {
            name: holiday?.name || "",
            date: holiday?.date || "",
            description: holiday?.description || "",
            isRecurring: holiday?.isRecurring ?? false,
            status: holiday?.status || "Active",
        },
    });

    // Local range state in DD-MM-YYYY
    const [range, setRange] = React.useState<{ start: string; end: string }>(() => {
        const today = new Date();
        const pad = (n: number) => String(n).padStart(2, '0');
        const fmt = (d: Date) => `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()}`;

        // Prefer startDate and endDate from API
        if (holiday?.startDate && holiday?.endDate) {
            const start = Constants.dateUtils.convertToDisplayFormat(holiday.startDate);
            const end = Constants.dateUtils.convertToDisplayFormat(holiday.endDate);
            if (start && end) return { start, end };
        }

        // Fallback: If editing and date contains a range like "dd-mm-yyyy - dd-mm-yyyy"
        const m = /^(\d{2}-\d{2}-\d{4})\s*[-to]+\s*(\d{2}-\d{2}-\d{4})$/i.exec(holiday?.date || "");
        if (m) return { start: m[1], end: m[2] };

        // Fallback: Single date in DD-MM-YYYY format
        const single = holiday?.date;
        if (single && /\d{2}-\d{2}-\d{4}/.test(single)) return { start: single, end: single };

        // Fallback: Try to convert from YYYY-MM-DD format
        if (holiday?.date) {
            const converted = Constants.dateUtils.convertToDisplayFormat(holiday.date);
            if (converted) return { start: converted, end: converted };
        }

        // Default: today
        const t = fmt(today);
        return { start: t, end: t };
    });

    // Update form values when holiday prop changes
    React.useEffect(() => {
        if (holiday) {
            reset({
                name: holiday.name || "",
                date: holiday.date || "",
                description: holiday.description || "",
                isRecurring: holiday.isRecurring ?? false,
                status: holiday.status || "Active",
            });

            // Update range state
            if (holiday.startDate && holiday.endDate) {
                const start = Constants.dateUtils.convertToDisplayFormat(holiday.startDate);
                const end = Constants.dateUtils.convertToDisplayFormat(holiday.endDate);
                if (start && end) {
                    setRange({ start, end });
                }
            }
        }
    }, [holiday, reset]);

    const onSubmitForm = (data: FormData) => {
        onSubmit({
            name: data.name.trim(),
            date: data.date,
            description: data.description?.trim(),
            isRecurring: data.isRecurring,
            status: data.status,
        });
    };

    return (
        <form id="holiday-form" onSubmit={handleSubmit(onSubmitForm)}>
            <div className="p-4 sm:p-5 md:p-6 lg:p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 md:gap-6 lg:gap-8">
                    {/* Holiday Name */}
                    <div className="col-span-1">
                        <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="name">
                            {Constants.adminConstants.holidayManagementStrings.holidayNameLabel} <span className="text-required">{Constants.adminConstants.requiredstar}</span>
                        </WebComponents.UiComponents.UiWebComponents.FormLabel>
                        <WebComponents.UiComponents.UiWebComponents.FormInput
                            id="name"
                            type="text"
                            placeholder="e.g., New Year's Day"
                            {...register("name")}
                            autoComplete="off"
                            className={errors.name ? "border-red-500" : ""}
                        />
                        {errors.name && (
                            <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
                        )}
                    </div>

                    {/* Date Range */}
                    <div className="col-span-1">
                        <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="date">
                            Date Range <span className="text-required">{Constants.adminConstants.requiredstar}</span>
                        </WebComponents.UiComponents.UiWebComponents.FormLabel>
                        <Controller
                            name="date"
                            control={control}
                            render={({ field }) => (
                                <>
                                    <WebComponents.UiComponents.UiWebComponents.DateRangePicker
                                        start={range.start}
                                        end={range.end}
                                        onChange={(r: any) => {
                                            setRange(r);
                                            field.onChange(`${r.start} - ${r.end}`);
                                        }}
                                    />
                                    {errors.date && (
                                        <p className="mt-1 text-sm text-red-500">{errors.date.message}</p>
                                    )}
                                </>
                            )}
                        />
                    </div>

                    {/* Recurring Checkbox */}
                    <div className="col-span-1 flex items-middle">
                        <div className="flex items-center space-x-2">
                            <Controller
                                name="isRecurring"
                                control={control}
                                render={({ field: { value, onChange } }) => (
                                    <>
                                        <input
                                            type="checkbox"
                                            id="isRecurring"
                                            checked={value}
                                            onChange={(e) => onChange(e.target.checked)}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="isRecurring" className="text-sm font-medium text-gray-900 dark:text-white">
                                            {Constants.adminConstants.holidayManagementStrings.recurringHolidayLabel} ({Constants.adminConstants.holidayManagementStrings.repeatsEveryYearLabel})
                                        </WebComponents.UiComponents.UiWebComponents.FormLabel>
                                    </>
                                )}
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex justify-between items-center mb-1">
                            <WebComponents.UiComponents.UiWebComponents.FormLabel>
                                {Constants.adminConstants.descriptionLabel}
                            </WebComponents.UiComponents.UiWebComponents.FormLabel>
                            <p className="text-textSmall dark:text-gray-400 font-interTight font-normal text-xs sm:text-sm leading-[8px]">
                                Max 500 characters
                            </p>
                        </div>
                        <Controller
                            name="description"
                            control={control}
                            render={({ field, fieldState }) => (
                                <>
                                    <WebComponents.UiComponents.UiWebComponents.Textarea
                                        {...field}
                                        placeholder="Description of the holiday"
                                        rows={3}
                                        charCounter={false}
                                        autoComplete="off"
                                        className={fieldState.invalid ? "border-red-500" : ""}
                                    />
                                    <div className="flex justify-between items-center mt-1">
                                        {fieldState.error ? (
                                            <p className="text-sm text-red-500">{fieldState.error.message}</p>
                                        ) : (
                                            <div />
                                        )}
                                        <div className="text-xs text-textSmall font-interTight">
                                            {(field.value || "").length}/500
                                        </div>
                                    </div>
                                </>
                            )}
                        />
                    </div>

                    {/* Status Toggle */}
                    <div className="col-span-1">
                        <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="status-toggle">
                            {Constants.adminConstants.statusLabel} <span className="text-required">{Constants.adminConstants.requiredstar}</span>
                        </WebComponents.UiComponents.UiWebComponents.FormLabel>
                        <Controller
                            name="status"
                            control={control}
                            render={({ field: { value, onChange } }) => (
                                <div className="h-[44px] w-full rounded-[4px] border-[0.6px] border-[#D8D9D9] dark:border-[#616161] bg-textMain2 dark:bg-[#1B1B1B]">
                                    <div className="flex items-center justify-between px-3 sm:px-4 py-[10px]">
                                        <span className="text-xs sm:text-sm font-interTight font-medium leading-[14px] text-textMain dark:text-white">
                                            {value === 'Active' ? Constants.adminConstants.activestatus : Constants.adminConstants.inactivestatus}
                                        </span>
                                        <WebComponents.UiComponents.UiWebComponents.Switch
                                            id="status-toggle"
                                            checked={value === 'Active'}
                                            onCheckedChange={(checked) => onChange(checked ? 'Active' : 'Inactive')}
                                            aria-label="Toggle holiday status"
                                        />
                                    </div>
                                </div>
                            )}
                        />
                        {errors.status && (
                            <p className="mt-1 text-sm text-red-500">{errors.status.message}</p>
                        )}
                    </div>
                </div>
            </div>
        </form>
    );
};

export default HolidayForm;

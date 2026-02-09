"use client";
import React from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { ServerActions } from "@/lib";
import { Constants } from "@/constant";
import { WebComponents } from "@/components";
import { faqSchema } from "@/app/validation/ValidationSchema";
import { SuperAdminTypes } from "@/types";

interface FAQFormData {
    question: string;
    answer: string;
    isPublished: boolean;
    categoryId?: string | null;
}

const FAQFormModel = ({
    title,
    onClose,
    onSubmit,
    formData: initialData,
    setFormData,
    faqLoading,
    faqCategories,
}: {
    title: string;
    onClose: () => void;
    onSubmit: () => void;
    formData: FAQFormData;
    setFormData: React.Dispatch<React.SetStateAction<FAQFormData>>;
    faqLoading?: boolean;
    faqCategories: SuperAdminTypes.LandingSettingPageTypes.FAQCategoryRow[];
}) => {
    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
        watch,
    } = useForm<FAQFormData>({
        resolver: yupResolver(faqSchema) as any,
        defaultValues: {
            question: initialData.question || "",
            answer: initialData.answer || "",
            isPublished: initialData.isPublished ?? true,
            categoryId: initialData.categoryId || "",
        },
    });

    const [categories, setCategories] = React.useState<SuperAdminTypes.LandingSettingPageTypes.FAQCategoryRow[]>(faqCategories || []);

    React.useEffect(() => {
        const fetchCategories = async () => {
            const result = await ServerActions.ServerActionslib.getActiveFAQCategoriesAction();
            if (result.success && result.data) {
                // Handle various response structures (direct array or nested in data)
                const categoriesData = result.data?.data || result.data;
                if (Array.isArray(categoriesData)) {
                    setCategories(categoriesData);
                }
            }
        };
        fetchCategories();
    }, []);

    // Sync form values with parent state
    React.useEffect(() => {
        const subscription = watch((value) => {
            setFormData({
                question: value.question || "",
                answer: value.answer || "",
                isPublished: value.isPublished ?? true,
                categoryId: value.categoryId || "",
            });
        });
        return () => subscription.unsubscribe();
    }, [watch, setFormData]);

    const handleFormSubmit = (data: FAQFormData) => {
        setFormData(data);
        onSubmit();
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-darkFilterbar w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg p-4 sm:p-6 shadow-xl relative">
                <div className="flex justify-between items-center border-b pb-3 mb-4 border-[#F4F5F5] dark:border-[#616161]">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">{title}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white text-2xl" aria-label="Close modal">&times;</button>
                </div>
                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
                    <div className="space-y-6">
                        {/* Question */}
                        <div>
                            <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="faq-question">
                                {Constants.superadminConstants.question} <span className="text-required">{Constants.superadminConstants.requiredstar}</span>
                            </WebComponents.UiComponents.UiWebComponents.FormLabel>
                            <WebComponents.UiComponents.UiWebComponents.FormInput
                                id="faq-question"
                                type="text"
                                placeholder="Enter Question"
                                {...register("question")}
                                autoComplete="off"
                            />
                            {errors.question && (
                                <p className="mt-1 text-sm text-required">{errors.question.message}</p>
                            )}
                        </div>

                        {/* Answer */}
                        <div>
                            <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="faq-answer">
                                {Constants.superadminConstants.answer} <span className="text-required">{Constants.superadminConstants.requiredstar}</span>
                            </WebComponents.UiComponents.UiWebComponents.FormLabel>
                            <WebComponents.UiComponents.UiWebComponents.Textarea
                                id="faq-answer"
                                placeholder="Enter Answer"
                                charCounter={false}
                                {...register("answer")}
                            />
                            <div className="flex justify-between items-center mt-1">
                                {errors.answer ? (
                                    <p className="text-sm text-required">{errors.answer.message}</p>
                                ) : (
                                    <div />
                                )}
                                <div className="text-xs text-textSmall font-interTight font-normal">
                                    {(watch("answer") || "").length}/250
                                </div>
                            </div>
                        </div>

                        {/* Category */}
                        <div>
                            <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="faq-category">
                                FAQ Category <span className="text-required">{Constants.superadminConstants.requiredstar}</span>
                            </WebComponents.UiComponents.UiWebComponents.FormLabel>
                            <Controller
                                name="categoryId"
                                control={control}
                                render={({ field: { value, onChange } }) => (
                                    <WebComponents.UiComponents.UiWebComponents.FormDropdown
                                        id="faq-category"
                                        value={value ?? ""}
                                        onChange={onChange}
                                        className="w-full"
                                    >
                                        <WebComponents.UiComponents.UiWebComponents.FormOption value="">
                                            Select FAQ Category
                                        </WebComponents.UiComponents.UiWebComponents.FormOption>
                                        {(Array.isArray(categories) ? categories : []).map(cat => (
                                            <WebComponents.UiComponents.UiWebComponents.FormOption key={cat._id} value={cat._id}>
                                                {cat.categoryName}
                                            </WebComponents.UiComponents.UiWebComponents.FormOption>
                                        ))}
                                    </WebComponents.UiComponents.UiWebComponents.FormDropdown>
                                )}
                            />
                            {errors.categoryId && (
                                <p className="mt-1 text-sm text-required">{errors.categoryId.message}</p>
                            )}
                        </div>

                        {/* Status */}
                        <div>
                            <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="faq-status-toggle">
                                {Constants.superadminConstants.statuslabel} <span className="text-required">{Constants.superadminConstants.requiredstar}</span>
                            </WebComponents.UiComponents.UiWebComponents.FormLabel>
                            <Controller
                                name="isPublished"
                                control={control}
                                render={({ field: { value, onChange } }) => (
                                    <div className="h-[44px] w-full rounded-[4px] border-[0.6px] border-[#D8D9D9] dark:border-[#616161] bg-textMain2 dark:bg-[#1B1B1B]">
                                        <div className="flex items-center justify-between px-3 sm:px-4 py-[10px]">
                                            <span className="text-xs sm:text-sm font-interTight font-medium leading-[14px] text-textMain dark:text-white">
                                                {value ? Constants.superadminConstants.activestatus : Constants.superadminConstants.inactivestatus}
                                            </span>
                                            <WebComponents.UiComponents.UiWebComponents.Switch
                                                id="faq-status-toggle"
                                                checked={value}
                                                onCheckedChange={onChange}
                                                aria-label="Toggle FAQ status"
                                            />
                                        </div>
                                    </div>
                                )}
                            />
                            {errors.isPublished && (
                                <p className="mt-1 text-sm text-required">{errors.isPublished.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
                        <WebComponents.UiComponents.UiWebComponents.Button
                            variant="cancel"
                            type="button"
                            onClick={onClose}
                            aria-label="Cancel form"
                        >
                            {Constants.superadminConstants.cancelbutton}
                        </WebComponents.UiComponents.UiWebComponents.Button>
                        <WebComponents.UiComponents.UiWebComponents.Button
                            variant="save"
                            type="submit"
                            disabled={faqLoading}
                        >
                            {Constants.superadminConstants.save}
                        </WebComponents.UiComponents.UiWebComponents.Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FAQFormModel;

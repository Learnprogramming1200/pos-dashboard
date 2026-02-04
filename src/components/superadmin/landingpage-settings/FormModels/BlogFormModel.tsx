"use client";
import React from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { Constants } from "@/constant";
import { WebComponents } from "@/components";
import { blogSchema } from "@/app/validation/ValidationSchema";

type FormData = Yup.InferType<typeof blogSchema>;

const BlogFormModel = ({
    title,
    onClose,
    onSubmit,
    formData: initialData,
    setFormData,
    blogLoading,
    setSelectedFile
}: {
    title: string;
    onClose: () => void;
    onSubmit: () => void;
    formData: {
        title: string;
        overview: string;
        description: string;
        tags: string[];
        createdBy: string;
        readTime: number;
        blogImage: string | File | undefined;
        isPublished: boolean;
    };
    setFormData: React.Dispatch<React.SetStateAction<{
        title: string;
        overview: string;
        description: string;
        tags: string[];
        createdBy: string;
        readTime: number;
        blogImage: string | File | undefined;
        isPublished: boolean;
    }>>;
    blogLoading?: boolean;
    setSelectedFile: (file: File | null) => void;
}) => {
    const [tagInput, setTagInput] = React.useState("");

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
        watch,
        setValue
    } = useForm<FormData>({
        resolver: yupResolver(blogSchema) as any,
        defaultValues: {
            title: initialData.title || "",
            overview: initialData.overview || "",
            description: initialData.description || "",
            tags: initialData.tags || [],
            createdBy: initialData.createdBy || "",
            readTime: initialData.readTime || 0,
            blogImage: initialData.blogImage as any,
            isPublished: initialData.isPublished ?? true
        },
    });

    const tags = watch("tags") || [];

    // Sync form values with parent state
    React.useEffect(() => {
        const subscription = watch((value) => {
            setFormData({
                title: value.title || "",
                overview: value.overview || "",
                description: value.description || "",
                tags: (value.tags as string[]) || [],
                createdBy: value.createdBy || "",
                readTime: value.readTime || 0,
                blogImage: (value.blogImage as string | File | undefined),
                isPublished: value.isPublished ?? true
            });
        });
        return () => subscription.unsubscribe();
    }, [watch, setFormData]);

    const handleFormSubmit = (data: FormData) => {
        // Update parent state before calling onSubmit
        setFormData({
            title: data.title,
            overview: data.overview,
            description: data.description,
            tags: data.tags as string[],
            createdBy: data.createdBy,
            readTime: data.readTime,
            blogImage: (data.blogImage as string | File | undefined),
            isPublished: data.isPublished
        });
        onSubmit();
    };

    const handleAddTag = () => {
        if (tagInput.trim() && !(tags || []).includes(tagInput.trim())) {
            const newTags = [...(tags || []), tagInput.trim()];
            setValue("tags", newTags, { shouldValidate: true });
            setTagInput("");
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        const newTags = (tags || []).filter((tag) => tag !== tagToRemove);
        setValue("tags", newTags, { shouldValidate: true });
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-darkFilterbar w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-lg p-4 sm:p-6 shadow-xl relative">
                <div className="flex justify-between items-center border-b pb-3 mb-4 border-[#F4F5F5] dark:border-[#616161]">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">{title}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white text-2xl">&times;</button>
                </div>
                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
                    <div className="space-y-6">
                        {/* Title */}
                        <div>
                            <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="blog-title">
                                {Constants.superadminConstants.titlelabel} <span className="text-required">{Constants.superadminConstants.requiredstar}</span>
                            </WebComponents.UiComponents.UiWebComponents.FormLabel>
                            <WebComponents.UiComponents.UiWebComponents.FormInput
                                id="blog-title"
                                type="text"
                                placeholder="Enter blog title"
                                {...register("title")}
                                autoComplete="off"
                            />
                            {errors.title && (
                                <p className="mt-1 text-sm text-required">{errors.title.message}</p>
                            )}
                        </div>

                        {/* Overview */}
                        <div>
                            <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="blog-overview">
                                Overview <span className="text-required">{Constants.superadminConstants.requiredstar}</span>
                            </WebComponents.UiComponents.UiWebComponents.FormLabel>
                            <Controller
                                name="overview"
                                control={control}
                                render={({ field, fieldState }) => (
                                    <>
                                        <WebComponents.UiComponents.UiWebComponents.Textarea
                                            {...field}
                                            id="blog-overview"
                                            placeholder="Enter overview"
                                            rows={3}
                                            charCounter={false}
                                            autoComplete="off"
                                        />
                                        <div className="flex justify-between items-center mt-1">
                                            {fieldState.error ? (
                                                <p className="text-sm text-required">{fieldState.error.message}</p>
                                            ) : (
                                                <div />
                                            )}
                                            <div className="text-xs text-textSmall font-interTight font-normal">
                                                {(field.value || "").length}/250
                                            </div>
                                        </div>
                                    </>
                                )}
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="blog-description">
                                {Constants.superadminConstants.descriptionlabel} <span className="text-required">{Constants.superadminConstants.requiredstar}</span>
                            </WebComponents.UiComponents.UiWebComponents.FormLabel>
                            <Controller
                                name="description"
                                control={control}
                                render={({ field, fieldState }) => (
                                    <>
                                        <WebComponents.UiComponents.UiWebComponents.Textarea
                                            {...field}
                                            id="blog-description"
                                            placeholder="Enter description"
                                            rows={6}
                                            charCounter={false}
                                            autoComplete="off"
                                        />
                                        <div className="flex justify-between items-center mt-1">
                                            {fieldState.error ? (
                                                <p className="text-sm text-required">{fieldState.error.message}</p>
                                            ) : (
                                                <div />
                                            )}
                                            <div className="text-xs text-textSmall font-interTight font-normal">
                                                {(field.value || "").length}/250
                                            </div>
                                        </div>
                                    </>
                                )}
                            />
                        </div>

                        {/* Tags */}
                        <div>
                            <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="blog-tags">
                                Tags <span className="text-required">{Constants.superadminConstants.requiredstar}</span>
                            </WebComponents.UiComponents.UiWebComponents.FormLabel>
                            <div className="flex gap-2">
                                <WebComponents.UiComponents.UiWebComponents.FormInput
                                    id="blog-tags"
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleAddTag();
                                        }
                                    }}
                                    placeholder="Add a tag and press Enter"
                                />
                                <WebComponents.UiComponents.UiWebComponents.Button
                                    type="button"
                                    onClick={handleAddTag}
                                    variant="default"
                                >
                                    Add
                                </WebComponents.UiComponents.UiWebComponents.Button>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {(tags || []).map((tag, index) => (
                                    <span
                                        key={index}
                                        className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                                    >
                                        {tag || ""}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveTag(tag || "")}
                                            className="hover:text-red-500"
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                            {errors.tags && (
                                <p className="mt-1 text-sm text-required">{errors.tags.message}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Created By */}
                            <div>
                                <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="blog-createdBy">
                                    Created By <span className="text-required">{Constants.superadminConstants.requiredstar}</span>
                                </WebComponents.UiComponents.UiWebComponents.FormLabel>
                                <WebComponents.UiComponents.UiWebComponents.FormInput
                                    id="blog-createdBy"
                                    type="text"
                                    placeholder="Enter author name"
                                    {...register("createdBy")}
                                    autoComplete="off"
                                />
                                {errors.createdBy && (
                                    <p className="mt-1 text-sm text-required">{errors.createdBy.message}</p>
                                )}
                            </div>

                            {/* Read Time */}
                            <div>
                                <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="blog-readTime">
                                    Read Time (minutes) <span className="text-required">{Constants.superadminConstants.requiredstar}</span>
                                </WebComponents.UiComponents.UiWebComponents.FormLabel>
                                <WebComponents.UiComponents.UiWebComponents.FormInput
                                    id="blog-readTime"
                                    type="number"
                                    placeholder="Enter read time"
                                    {...register("readTime")}
                                    autoComplete="off"
                                />
                                {errors.readTime && (
                                    <p className="mt-1 text-sm text-required">{errors.readTime.message}</p>
                                )}
                            </div>
                        </div>

                        {/* Blog Image */}
                        <div>
                            <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="blog-image">
                                {Constants.superadminConstants.imagelabel}
                            </WebComponents.UiComponents.UiWebComponents.FormLabel>
                            <div className="mt-1">
                                <Controller
                                    name="blogImage"
                                    control={control}
                                    render={({ field }) => (
                                        <WebComponents.UiComponents.UiWebComponents.ImageCropUpload
                                            id="blog-image"
                                            value={field.value as any}
                                            onChange={(val) => {
                                                field.onChange(val as any);
                                                setSelectedFile(val instanceof File ? val : null);
                                            }}
                                            accept="image/*"
                                            aspect={16 / 9}
                                            shape="rect"
                                            previewMask="rect"
                                            previewSize={{ width: 640, height: 360 }}
                                            viewSize={640}
                                            uploadButtonText="Upload"
                                            removeButtonText="Remove"
                                            layout="vertical"
                                        />
                                    )}
                                />
                                {errors.blogImage && (
                                    <p className="mt-1 text-sm text-required">{errors.blogImage.message as string}</p>
                                )}
                            </div>
                        </div>

                        {/* Is Published */}
                        <div>
                            <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="blog-isPublished-toggle">
                                {Constants.superadminConstants.statuslabel} <span className="text-required">{Constants.superadminConstants.requiredstar}</span>
                            </WebComponents.UiComponents.UiWebComponents.FormLabel>
                            <Controller
                                name="isPublished"
                                control={control}
                                render={({ field: { value, onChange } }) => (
                                    <div className="h-[44px] w-full rounded-[4px] border-[0.6px] border-[#D8D9D9] dark:border-[#616161] bg-textMain2 dark:bg-[#1B1B1B]">
                                        <div className="flex items-center justify-between px-3 sm:px-4 py-[10px]">
                                            <span className="text-xs sm:text-sm font-interTight font-medium leading-[14px] text-textMain dark:text-white">
                                                {value ? "Published" : "Unpublished"}
                                            </span>
                                            <WebComponents.UiComponents.UiWebComponents.Switch
                                                id="blog-isPublished-toggle"
                                                checked={value}
                                                onCheckedChange={onChange}
                                                aria-label="Toggle blog publish status"
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
                            disabled={blogLoading}
                        >
                            {Constants.superadminConstants.save}
                        </WebComponents.UiComponents.UiWebComponents.Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BlogFormModel;

"use client";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { advertisementFormSchema } from "@/app/validation/ValidationSchema";
import { Constants } from "@/constant";
import { WebComponents } from "@/components";
import {SuperAdminTypes} from "@/types";

type FormData = Yup.InferType<typeof advertisementFormSchema>;

export default function AdvertisementForm({onSubmit,advertisement}: {
  readonly onSubmit: (data: SuperAdminTypes.AdvertisementTypes.AdvertisementFormInput) => Promise<void> | void;
  readonly advertisement?:SuperAdminTypes.AdvertisementTypes.Advertisement;
}) {
  const formatDateForInput = (dateString: string | undefined) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } catch {
      return "";
    }
  };
  const toISOFromYmd = (ymd: string) => {
    const d = new Date(ymd);
    return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
  };

  const [loading, setLoading] = React.useState(false);

  const getDefaultValues = React.useCallback((): FormData => {
    const startYmd = formatDateForInput(advertisement?.startDate);
    const endYmd = formatDateForInput(advertisement?.endDate);

    const urlType = (advertisement?.urlType || "Local") as SuperAdminTypes.AdvertisementTypes.AdvertisementUrlType;

    return {
      adName: advertisement?.adName || "",
      selectType: (advertisement?.selectType || "Image") as SuperAdminTypes.AdvertisementTypes.AdvertisementSelectType,
      urlType,
      placement: (advertisement?.placement || "Hero Section") as SuperAdminTypes.AdvertisementTypes.AdvertisementPlacement,
      position: (advertisement?.position || "Center") as SuperAdminTypes.AdvertisementTypes.AdvertisementPosition,
      redirectUrl: advertisement?.redirectUrl || "",
      mediaUrl: urlType === "Url" ? (advertisement?.mediaContent?.url || "") : "",
      mediaContent: urlType === "Local" ? (advertisement?.mediaContent?.url || null) : null,
      startDate: advertisement ? startYmd : "",
      endDate: advertisement ? endYmd : "",
      status: advertisement ? !!advertisement.status : true,
    };
  }, [advertisement]);

  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(advertisementFormSchema) as any,
    defaultValues: getDefaultValues(),
  });

  const urlType = watch("urlType");
  const selectType = watch("selectType");
  const startDate = watch("startDate");
  const prevUrlTypeRef = React.useRef(urlType);
  const prevSelectTypeRef = React.useRef(selectType);

  // Re-validate end date when start date changes
  React.useEffect(() => {
    if (startDate) trigger("endDate");
  }, [startDate, trigger]);

  // Reset when editing item changes
  React.useEffect(() => {
    const defaults = getDefaultValues();
    reset(defaults);
    // Keep refs in sync so we don't clear media on reset/edit load
    prevUrlTypeRef.current = defaults.urlType as any;
    prevSelectTypeRef.current = defaults.selectType as any;
  }, [getDefaultValues, reset]);

  // Clear fields ONLY when user changes URL type (avoid clearing on edit load/reset)
  React.useEffect(() => {
    const prev = prevUrlTypeRef.current;
    if (prev !== urlType) {
      if (urlType === "Url") {
        setValue("mediaContent", null);
      } else {
        setValue("mediaUrl", "");
      }
      prevUrlTypeRef.current = urlType;
    }
  }, [urlType, setValue]);

  // If user changes media type (Image <-> Video) while Local upload is active, clear upload.
  React.useEffect(() => {
    const prev = prevSelectTypeRef.current;
    if (prev !== selectType) {
      if (urlType === "Local") {
        setValue("mediaContent", null);
      }
      prevSelectTypeRef.current = selectType;
    }
  }, [selectType, urlType, setValue]);

  const onFormSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const mediaContent = data.mediaContent;
      const uploadedUrl = typeof mediaContent === "string" ? mediaContent : "";
      const mediaFile = mediaContent instanceof File ? mediaContent : null;

      // When urlType is "Local", mediaFile should be the uploaded URL string (from upload route)
      // or the File object if upload hasn't happened yet
      const finalMediaFile = (data.urlType as SuperAdminTypes.AdvertisementTypes.AdvertisementUrlType) === "Local" 
        ? (uploadedUrl || mediaFile) 
        : null;

      await onSubmit({
        adName: data.adName.trim(),
        selectType: data.selectType as SuperAdminTypes.AdvertisementTypes.AdvertisementSelectType,
        urlType: data.urlType as SuperAdminTypes.AdvertisementTypes.AdvertisementUrlType,
        placement: data.placement as SuperAdminTypes.AdvertisementTypes.AdvertisementPlacement,
        position: data.position as SuperAdminTypes.AdvertisementTypes.AdvertisementPosition,
        redirectUrl: data.redirectUrl,
        mediaUrl: (data.urlType as SuperAdminTypes.AdvertisementTypes.AdvertisementUrlType) === "Url" ? data.mediaUrl : uploadedUrl,
        mediaFile: finalMediaFile as any, // Backend accepts URL string or File
        startDate: toISOFromYmd(data.startDate),
        endDate: toISOFromYmd(data.endDate),
        status: data.status,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-darkFilterbar rounded-[4px] mt-4">
      <form id="advertisement-form" onSubmit={handleSubmit(onFormSubmit)} noValidate>
        <div className="p-4 sm:p-5 md:p-6 lg:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6 lg:gap-8">
            <div className="col-span-1 md:col-span-2">
              <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="adName">
                {Constants.superadminConstants.adnamelabel} <span className="text-required">{Constants.superadminConstants.requiredstar}</span>
              </WebComponents.UiComponents.UiWebComponents.FormLabel>
              <WebComponents.UiComponents.UiWebComponents.FormInput
                id="adName"
                type="text"
                placeholder="e.g., Summer Sale Banner"
                {...register("adName")}
             
              />
              {errors.adName && <p className="mt-1 text-sm text-required">{errors.adName.message}</p>}
            </div>
            <div className="col-span-1">
              <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="selectType">
                {Constants.superadminConstants.selecttypelabel} <span className="text-required">{Constants.superadminConstants.requiredstar}</span>
              </WebComponents.UiComponents.UiWebComponents.FormLabel>
              <Controller
                name="selectType"
                control={control}
                render={({ field }) => (
                  <WebComponents.UiComponents.UiWebComponents.FormDropdown
                    id="selectType"
                    name="selectType"
                    value={field.value}
                    onChange={e => field.onChange(e.target.value as SuperAdminTypes.AdvertisementTypes.AdvertisementSelectType)}
                  >
                    <WebComponents.UiComponents.UiWebComponents.FormOption value="Image">Image</WebComponents.UiComponents.UiWebComponents.FormOption>
                    <WebComponents.UiComponents.UiWebComponents.FormOption value="Video">Video</WebComponents.UiComponents.UiWebComponents.FormOption>
                  </WebComponents.UiComponents.UiWebComponents.FormDropdown>
                )}
              />
              {errors.selectType && <p className="mt-1 text-sm text-required">{errors.selectType.message as any}</p>}
            </div>
            <div className="col-span-1">
              <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="urlType">
                {Constants.superadminConstants.urltypelabel} <span className="text-required">{Constants.superadminConstants.requiredstar}</span>
              </WebComponents.UiComponents.UiWebComponents.FormLabel>
              <Controller
                name="urlType"
                control={control}
                render={({ field }) => (
                  <WebComponents.UiComponents.UiWebComponents.FormDropdown
                    id="urlType"
                    name="urlType"
                    value={field.value}
                    onChange={e => field.onChange(e.target.value as SuperAdminTypes.AdvertisementTypes.AdvertisementUrlType)}
                  >
                    <WebComponents.UiComponents.UiWebComponents.FormOption value="Local">Local</WebComponents.UiComponents.UiWebComponents.FormOption>
                    <WebComponents.UiComponents.UiWebComponents.FormOption value="Url">Url</WebComponents.UiComponents.UiWebComponents.FormOption>
                  </WebComponents.UiComponents.UiWebComponents.FormDropdown>
                )}
              />
              {errors.urlType && <p className="mt-1 text-sm text-required">{errors.urlType.message as any}</p>}
            </div>
            {urlType === "Url" && (
              <div className="col-span-1 md:col-span-2">
                <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="mediaUrl">
                  {Constants.superadminConstants.mediacontentlabel} <span className="text-required">{Constants.superadminConstants.requiredstar}</span>
                </WebComponents.UiComponents.UiWebComponents.FormLabel>
                <WebComponents.UiComponents.UiWebComponents.FormInput
                  id="mediaUrl"
                  type="url"
                  placeholder="https://example.com/media/image.jpg"
                  {...register("mediaUrl")}
                />
                {errors.mediaUrl && <p className="mt-1 text-sm text-required">{errors.mediaUrl.message}</p>}
              </div>
            )}
            {urlType === "Local" && (
              <div className="col-span-1 md:col-span-2 md:grid md:grid-cols-[minmax(250px,360px)_minmax(0,1fr)] gap-4 sm:gap-5 md:gap-6 lg:gap-8">
                <div>
                  <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="mediaFile">
                    {Constants.superadminConstants.mediacontentlabel} <span className="text-required">{Constants.superadminConstants.requiredstar}</span>
                  </WebComponents.UiComponents.UiWebComponents.FormLabel>
                  <Controller
                    name="mediaContent"
                    control={control}
                    render={({ field }) => (
                      <>
                        {selectType === "Image" ? (
                          <div className="max-w-md w-full">
                            <WebComponents.UiComponents.UiWebComponents.ImageCropUpload
                              id="mediaFile"
                              value={field.value as any}
                              onChange={(val) => field.onChange(val as any)}
                              accept="image/*"
                              aspect={1}
                              shape="rect"
                              previewMask="rect"
                              previewSize={{ width: 120, height: 120 }}
                              viewSize={300}
                              uploadButtonText="Upload"
                              removeButtonText="Remove"
                              layout="vertical"
                            />
                          </div>
                        ) : (
                          <div className="max-w-md w-full">
                            <WebComponents.UiComponents.UiWebComponents.VideoCropUpload
                              id="mediaFile"
                              value={field.value as any}
                              onChange={(val) => field.onChange(val as any)}
                              accept="video/*"
                              previewSize={{ width: 240, height: 120 }}
                              maxSize={{ sizeMB: 100 }}
                              uploadButtonText="Upload"
                              removeButtonText="Remove"
                              layout="vertical"
                              showControls={false}
                            />
                          </div>
                        )}
                      </>
                    )}
                  />
                  {errors.mediaContent && <p className="mt-1 text-sm text-required">{errors.mediaContent.message as any}</p>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3 md:gap-3 lg:gap-4">
                  <div>
                    <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="placement">
                      {Constants.superadminConstants.placementlabel} <span className="text-required">{Constants.superadminConstants.requiredstar}</span>
                    </WebComponents.UiComponents.UiWebComponents.FormLabel>
                    <Controller
                      name="placement"
                      control={control}
                      render={({ field }) => (
                        <WebComponents.UiComponents.UiWebComponents.FormDropdown
                          id="placement"
                          name="placement"
                          value={field.value}
                          onChange={e => field.onChange(e.target.value as SuperAdminTypes.AdvertisementTypes.AdvertisementPlacement)}
                        >
                          <WebComponents.UiComponents.UiWebComponents.FormOption value="Home Page">Home Page</WebComponents.UiComponents.UiWebComponents.FormOption>
                          <WebComponents.UiComponents.UiWebComponents.FormOption value="Hero Section">Hero Section</WebComponents.UiComponents.UiWebComponents.FormOption>
                          <WebComponents.UiComponents.UiWebComponents.FormOption value="Pricing">Pricing</WebComponents.UiComponents.UiWebComponents.FormOption>
                        </WebComponents.UiComponents.UiWebComponents.FormDropdown>
                      )}
                    />
                    {errors.placement && <p className="mt-1 text-sm text-required">{errors.placement.message as any}</p>}
                  </div>
                  <div>
                    <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="position">
                      {Constants.superadminConstants.positionlabel} <span className="text-required">{Constants.superadminConstants.requiredstar}</span>
                    </WebComponents.UiComponents.UiWebComponents.FormLabel>
                    <Controller
                      name="position"
                      control={control}
                      render={({ field }) => (
                        <WebComponents.UiComponents.UiWebComponents.FormDropdown
                          id="position"
                          name="position"
                          value={field.value}
                          onChange={e => field.onChange(e.target.value as SuperAdminTypes.AdvertisementTypes.AdvertisementPosition)}
                        >
                          <WebComponents.UiComponents.UiWebComponents.FormOption value="Left">Left</WebComponents.UiComponents.UiWebComponents.FormOption>
                          <WebComponents.UiComponents.UiWebComponents.FormOption value="Center">Center</WebComponents.UiComponents.UiWebComponents.FormOption>
                          <WebComponents.UiComponents.UiWebComponents.FormOption value="Right">Right</WebComponents.UiComponents.UiWebComponents.FormOption>
                        </WebComponents.UiComponents.UiWebComponents.FormDropdown>
                      )}
                    />
                    {errors.position && <p className="mt-1 text-sm text-required">{errors.position.message as any}</p>}
                  </div>
                  <div>
                    <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="startDate">
                      {Constants.superadminConstants.startdatelabel} <span className="text-required">{Constants.superadminConstants.requiredstar}</span>
                    </WebComponents.UiComponents.UiWebComponents.FormLabel>
                    <Controller
                      name="startDate"
                      control={control}
                      render={({ field }) => (
                        <WebComponents.UiComponents.UiWebComponents.SingleDatePicker
                          value={field.value || ""}
                          onChange={(v) => {
                            field.onChange(v || "");
                            field.onBlur();
                          }}
                           // placeholder="DD-MM-YYYY"
                        />
                      )}
                    />
                    {errors.startDate && <p className="mt-1 text-sm text-required">{errors.startDate.message}</p>}
                  </div>
                  <div>
                    <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="endDate">
                      {Constants.superadminConstants.enddatelabel} <span className="text-required">{Constants.superadminConstants.requiredstar}</span>
                    </WebComponents.UiComponents.UiWebComponents.FormLabel>
                    <Controller
                      name="endDate"
                      control={control}
                      render={({ field }) => (
                        <WebComponents.UiComponents.UiWebComponents.SingleDatePicker
                          value={field.value || ""}
                          onChange={(v) => {
                            field.onChange(v || "");
                            field.onBlur();
                          }}
                          // placeholder="DD-MM-YYYY"
                        />
                      )}
                    />
                    {errors.endDate && <p className="mt-1 text-sm text-required">{errors.endDate.message}</p>}
                  </div>
                  <div className="col-span-1">
                    <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="redirectUrl">
                      {Constants.superadminConstants.redirecturllabel} <span className="text-required">{Constants.superadminConstants.requiredstar}</span>
                    </WebComponents.UiComponents.UiWebComponents.FormLabel>
                    <WebComponents.UiComponents.UiWebComponents.FormInput
                      id="redirectUrl"
                      type="url"
                      placeholder="https://example.com"
                      {...register("redirectUrl")}
                    />
                    {errors.redirectUrl && <p className="mt-1 text-sm text-required">{errors.redirectUrl.message}</p>}
                  </div>
                  <div className="col-span-1">
                    <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="ad-status-toggle">
                      {Constants.superadminConstants.statuslabel}
                    </WebComponents.UiComponents.UiWebComponents.FormLabel>
                    <Controller
                      name="status"
                      control={control}
                      render={({ field }) => (
                        <div className="h-[44px] w-full rounded-[4px] border-[0.6px] border-[#D8D9D9] dark:border-[#616161] bg-textMain2 dark:bg-[#1B1B1B]">
                          <div className="flex items-center justify-between px-3 sm:px-4 py-[10px]">
                            <span className="text-xs sm:text-sm font-interTight font-medium leading-[14px] text-textMain dark:text-white">
                              {field.value ? Constants.superadminConstants.activestatus : Constants.superadminConstants.inactivestatus}
                            </span>
                            <WebComponents.UiComponents.UiWebComponents.Switch
                              id="ad-status-toggle"
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              aria-label="Toggle advertisement status"
                            />
                          </div>
                        </div>
                      )}
                    />
                  </div>
                </div>
              </div>
            )}
            {urlType === "Url" && (
              <>
                <div className="col-span-1">
                  <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="placement">
                    {Constants.superadminConstants.placementlabel} <span className="text-required">{Constants.superadminConstants.requiredstar}</span>
                  </WebComponents.UiComponents.UiWebComponents.FormLabel>
                  <Controller
                    name="placement"
                    control={control}
                    render={({ field }) => (
                      <WebComponents.UiComponents.UiWebComponents.FormDropdown
                        id="placement"
                        name="placement"
                        value={field.value}
                        onChange={e => field.onChange(e.target.value as SuperAdminTypes.AdvertisementTypes.AdvertisementPlacement)}
                      >
                        <WebComponents.UiComponents.UiWebComponents.FormOption value="Home Page">Home Page</WebComponents.UiComponents.UiWebComponents.FormOption>
                        <WebComponents.UiComponents.UiWebComponents.FormOption value="Hero Section">Hero Section</WebComponents.UiComponents.UiWebComponents.FormOption>
                        <WebComponents.UiComponents.UiWebComponents.FormOption value="Pricing">Pricing</WebComponents.UiComponents.UiWebComponents.FormOption>
                      </WebComponents.UiComponents.UiWebComponents.FormDropdown>
                    )}
                  />
                  {errors.placement && <p className="mt-1 text-sm text-required">{errors.placement.message as any}</p>}
                </div>
                <div className="col-span-1">
                  <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="position">
                    {Constants.superadminConstants.positionlabel} <span className="text-required">{Constants.superadminConstants.requiredstar}</span>
                  </WebComponents.UiComponents.UiWebComponents.FormLabel>
                  <Controller
                    name="position"
                    control={control}
                    render={({ field }) => (
                      <WebComponents.UiComponents.UiWebComponents.FormDropdown
                        id="position"
                        name="position"
                        value={field.value}
                        onChange={e => field.onChange(e.target.value as SuperAdminTypes.AdvertisementTypes.AdvertisementPosition)}
                      >
                        <WebComponents.UiComponents.UiWebComponents.FormOption value="Left">Left</WebComponents.UiComponents.UiWebComponents.FormOption>
                        <WebComponents.UiComponents.UiWebComponents.FormOption value="Center">Center</WebComponents.UiComponents.UiWebComponents.FormOption>
                        <WebComponents.UiComponents.UiWebComponents.FormOption value="Right">Right</WebComponents.UiComponents.UiWebComponents.FormOption>
                      </WebComponents.UiComponents.UiWebComponents.FormDropdown>
                    )}
                  />
                  {errors.position && <p className="mt-1 text-sm text-required">{errors.position.message as any}</p>}
                </div>
                <div className="col-span-1">
                  <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="startDate">
                    {Constants.superadminConstants.startdatelabel} <span className="text-required">{Constants.superadminConstants.requiredstar}</span>
                  </WebComponents.UiComponents.UiWebComponents.FormLabel>
                  <Controller
                    name="startDate"
                    control={control}
                    render={({ field }) => (
                      <WebComponents.UiComponents.UiWebComponents.SingleDatePicker
                        value={field.value || ""}
                        onChange={(v) => {
                          field.onChange(v || "");
                          field.onBlur();
                        }}
                        placeholder="DD-MM-YYYY"
                      />
                    )}
                  />
                  {errors.startDate && <p className="mt-1 text-sm text-required">{errors.startDate.message}</p>}
                </div>
                <div className="col-span-1">
                  <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="endDate">
                    {Constants.superadminConstants.enddatelabel} <span className="text-required">{Constants.superadminConstants.requiredstar}</span>
                  </WebComponents.UiComponents.UiWebComponents.FormLabel>
                  <Controller
                    name="endDate"
                    control={control}
                    render={({ field }) => (
                      <WebComponents.UiComponents.UiWebComponents.SingleDatePicker
                        value={field.value || ""}
                        onChange={(v) => {
                          field.onChange(v || "");
                          field.onBlur();
                        }}
                        placeholder="DD-MM-YYYY"
                      />
                    )}
                  />
                  {errors.endDate && <p className="mt-1 text-sm text-required">{errors.endDate.message}</p>}
                </div>
                <div className="col-span-1">
                  <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="redirectUrl">
                    {Constants.superadminConstants.redirecturllabel} <span className="text-required">{Constants.superadminConstants.requiredstar}</span>
                  </WebComponents.UiComponents.UiWebComponents.FormLabel>
                  <WebComponents.UiComponents.UiWebComponents.FormInput
                    id="redirectUrl"
                    type="url"
                    placeholder="https://example.com"
                    {...register("redirectUrl")}
                  />
                  {errors.redirectUrl && <p className="mt-1 text-sm text-required">{errors.redirectUrl.message}</p>}
                </div>
                <div className="col-span-1">
                  <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="ad-status-toggle">
                    {Constants.superadminConstants.statuslabel}
                  </WebComponents.UiComponents.UiWebComponents.FormLabel>
                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <div className="h-[44px] w-full rounded-[4px] border-[0.6px] border-[#D8D9D9] dark:border-[#616161] bg-textMain2 dark:bg-[#1B1B1B]">
                        <div className="flex items-center justify-between px-3 sm:px-4 py-[10px]">
                          <span className="text-xs sm:text-sm font-interTight font-medium leading-[14px] text-textMain dark:text-white">
                            {field.value ? Constants.superadminConstants.activestatus : Constants.superadminConstants.inactivestatus}
                          </span>
                          <WebComponents.UiComponents.UiWebComponents.Switch
                            id="ad-status-toggle"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            aria-label="Toggle advertisement status"
                          />
                        </div>
                      </div>
                    )}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

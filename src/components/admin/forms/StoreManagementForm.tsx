"use client";
import React from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Constants } from "@/constant";
import { storeManagementFormSchema } from "@/app/validation/ValidationSchema";
import * as Yup from "yup";
import { WebComponents } from "@/components";
import { AdminTypes } from "@/types";

interface StoreManagementFormProps {
  onSubmit: (data: AdminTypes.storeTypes.storeManagementForm) => void;
  store?: AdminTypes.storeTypes.Store;
}

// Parse phone number to extract country code and number
const parsePhoneNumber = (phone: string | undefined): { countryCode: string; phoneNumber: string } => {
  if (!phone) return { countryCode: "+1", phoneNumber: "" };
  // Try to extract country code (common patterns: +1, +44, etc.)
  const phoneRegex = /^(\+\d{1,4})\s*(.+)$/;
  const phoneMatch = phoneRegex.exec(phone);
  if (phoneMatch) {
    return { countryCode: phoneMatch[1], phoneNumber: phoneMatch[2] };
  }
  // If phone starts with + but no space, try to find the code
  if (phone.startsWith("+")) {
    // Common country code lengths: 1-4 digits after +
    const codeRegex = /^(\+\d{1,4})(\d+)$/;
    const codeMatch = codeRegex.exec(phone);
    if (codeMatch) {
      return { countryCode: codeMatch[1], phoneNumber: codeMatch[2] };
    }
  }
  // Default: assume US/Canada (+1) if no code found
  return { countryCode: "+1", phoneNumber: phone };
};

type FormData = Yup.InferType<typeof storeManagementFormSchema>;

const StoreManagementForm = ({ onSubmit, store }: StoreManagementFormProps) => {
  const initialPhone = parsePhoneNumber(store?.contactNumber);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: yupResolver(storeManagementFormSchema) as any,
    defaultValues: {
      name: store?.name || "",
      description: store?.description || undefined,
      email: store?.email || "",
      countryCode: initialPhone.countryCode,
      phoneNumber: initialPhone.phoneNumber,
      poc: undefined,
      address: store?.location?.address || "",
      country: store?.location?.country || "",
      state: store?.location?.state || "",
      city: store?.location?.city || "",
      postalCode: store?.location?.postalCode || "",
      latitude: store?.geoLocation?.coordinates?.[1]?.toString() || "",
      longitude: store?.geoLocation?.coordinates?.[0]?.toString() || "",
      status: store?.status
        ? typeof store.status === "boolean"
          ? store.status
          : store.status === "Active"
        : true,
    },
  });

  // Update form values when store prop changes
  React.useEffect(() => {
    if (store) {
      const phone = parsePhoneNumber(store.contactNumber);
      reset({
        name: store.name || "",
        description: store.description || undefined,
        email: store.email || "",
        countryCode: phone.countryCode,
        phoneNumber: phone.phoneNumber,
        poc: undefined,
        address: store.location?.address || "",
        country: store.location?.country || "",
        state: store.location?.state || "",
        city: store.location?.city || "",
        postalCode: store.location?.postalCode || "",
        latitude: store.geoLocation?.coordinates?.[1]?.toString() || "",
        longitude: store.geoLocation?.coordinates?.[0]?.toString() || "",
        status: typeof store.status === "boolean"
          ? store.status
          : store.status === "Active",
      });
    }
  }, [store, reset]);

  const onSubmitForm = (data: FormData) => {
    // Combine country code and phone number without space
    const fullPhone = `${data.countryCode}${data.phoneNumber}`.trim();
    onSubmit({
      name: data.name,
      description: data.description || "",
      address: data.address,
      city: data.city || "",
      state: data.state || "",
      country: data.country,
      postalCode: data.postalCode,
      latitude: data.latitude,
      longitude: data.longitude,
      status: data.status ? "Active" : "Inactive",
      email: data.email,
      contactNumber: fullPhone,
      poc: data.poc || "",
    });
  };

  return (
    <form id="store-form" onSubmit={handleSubmit(onSubmitForm)}>
      <div className="p-4 sm:p-5 md:p-6 lg:p-8">
        <div className="space-y-4 sm:space-y-5 md:space-y-6 lg:space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 md:gap-6 lg:gap-8">
            <div>
              <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="name">
                {Constants.adminConstants.storelabel} <span className="text-required">{Constants.adminConstants.requiredstar}</span>
              </WebComponents.UiComponents.UiWebComponents.FormLabel>
              <WebComponents.UiComponents.UiWebComponents.FormInput
                id="name"
                type="text"
                placeholder="Enter store name"
                {...register("name")}
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-required">{errors.name.message}</p>
              )}
            </div>
            <div>
              <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="description">{Constants.adminConstants.descriptionLabel}</WebComponents.UiComponents.UiWebComponents.FormLabel>
              <WebComponents.UiComponents.UiWebComponents.FormInput
                id="description"
                type="text"
                placeholder="Enter store description"
                {...register("description")}
                className={errors.description ? "border-red-500" : ""}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-required">{errors.description.message}</p>
              )}
            </div>
            <div>
              <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="email">
                {Constants.adminConstants.emailLabel} <span className="text-required">{Constants.adminConstants.requiredstar}</span>
              </WebComponents.UiComponents.UiWebComponents.FormLabel>
              <WebComponents.UiComponents.UiWebComponents.FormInput
                id="email"
                type="email"
                placeholder="Enter email address"
                {...register("email")}
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-required">{errors.email.message}</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 md:gap-6 lg:gap-8">
            <div>
              <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="contactNumber">
                {Constants.adminConstants.phoneLabel} <span className="text-required">{Constants.adminConstants.requiredstar}</span>
              </WebComponents.UiComponents.UiWebComponents.FormLabel>
              <Controller
                name="countryCode"
                control={control}
                render={({ field: { value: countryCodeValue, onChange: onCountryCodeChange } }) => (
                  <Controller
                    name="phoneNumber"
                    control={control}
                    render={({ field: { value: phoneValue, onChange: onPhoneChange } }) => (
                      
                      <WebComponents.UiComponents.UiWebComponents.PhoneInputWithCountryCode
                        countryCode={countryCodeValue}
                        phoneNumber={phoneValue}
                        onCountryCodeChange={onCountryCodeChange}
                        onPhoneNumberChange={onPhoneChange}
                        placeholder="Enter phone number"
                      />
                    )}
                  />
                )}
              />
              {errors.phoneNumber && (
                <p className="mt-1 text-sm text-required">{errors.phoneNumber.message}</p>
              )}
              {errors.countryCode && (
                <p className="mt-1 text-sm text-required">{errors.countryCode.message}</p>
              )}
            </div>
            <div>
              <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="poc">{Constants.adminConstants.pocLabel}</WebComponents.UiComponents.UiWebComponents.FormLabel>
              <WebComponents.UiComponents.UiWebComponents.FormInput
                id="poc"
                type="text"
                placeholder="Enter point of contact"
                {...register("poc")}
                className={errors.poc ? "border-red-500" : ""}
              />
              {errors.poc && (
                <p className="mt-1 text-sm text-required">{errors.poc.message}</p>
              )}
            </div>
            <div>
              <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="address">
                {Constants.adminConstants.addressLabel} <span className="text-required">{Constants.adminConstants.requiredstar}</span>
              </WebComponents.UiComponents.UiWebComponents.FormLabel>
              <WebComponents.UiComponents.UiWebComponents.FormInput
                id="address"
                type="text"
                placeholder="Enter address"
                {...register("address")}
                className={errors.address ? "border-red-500" : ""}
              />
              {errors.address && (
                <p className="mt-1 text-sm text-required">{errors.address.message}</p>
              )}
            </div>
          </div>
          <div>
            <Controller
              name="country"
              control={control}
              render={({ field: { value, onChange } }) => {
                const countryValue = value;
                return (
                  <Controller
                    name="state"
                    control={control}
                    render={({ field: { value: stateValue, onChange: onStateChange } }) => (
                      <Controller
                        name="city"
                        control={control}
                        render={({ field: { value: cityValue, onChange: onCityChange } }) => (
                          <WebComponents.UiComponents.UiWebComponents.CountryStateCitySelector
                            selectedCountry={countryValue}
                            onCountryChange={(newCountry) => {
                              onChange(newCountry);
                              // Reset state and city when country changes
                              onStateChange("");
                              onCityChange("");
                            }}
                            selectedState={stateValue}
                            onStateChange={(newState) => {
                              onStateChange(newState);
                              // Reset city when state changes
                              onCityChange("");
                            }}
                            selectedCity={cityValue}
                            onCityChange={onCityChange}
                            countryError={errors.country?.message}
                            stateError={countryValue && countryValue.length > 0 ? errors.state?.message : undefined}
                            cityError={stateValue && stateValue.length > 0 ? errors.city?.message : undefined}
                          />
                        )}
                      />
                    )}
                  />
                );
              }}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 md:gap-6 lg:gap-8">
            <div>
              <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="postalCode">
                {Constants.adminConstants.postalCodeLabel} <span className="text-required">{Constants.adminConstants.requiredstar}</span>
              </WebComponents.UiComponents.UiWebComponents.FormLabel>
              <WebComponents.UiComponents.UiWebComponents.FormInput
                id="postalCode"
                type="text"
                placeholder="Enter postal code"
                {...register("postalCode")}
                className={errors.postalCode ? "border-red-500" : ""}
              />
              {errors.postalCode && (
                <p className="mt-1 text-sm text-required">{errors.postalCode.message}</p>
              )}
            </div>
            <div>
              <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="latitude">
                {Constants.adminConstants.latitudeLabel} <span className="text-required">{Constants.adminConstants.requiredstar}</span>
              </WebComponents.UiComponents.UiWebComponents.FormLabel>
              <WebComponents.UiComponents.UiWebComponents.FormInput
                id="latitude"
                type="number"
                step="any"
                placeholder="Enter latitude"
                {...register("latitude")}
                className={errors.latitude ? "border-red-500" : ""}
              />
              {errors.latitude && (
                <p className="mt-1 text-sm text-required">{errors.latitude.message}</p>
              )}
            </div>
            <div>
              <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="longitude">
                {Constants.adminConstants.longitudeLabel} <span className="text-required">{Constants.adminConstants.requiredstar}</span>
              </WebComponents.UiComponents.UiWebComponents.FormLabel>
              <WebComponents.UiComponents.UiWebComponents.FormInput
                id="longitude"
                type="number"
                step="any"
                placeholder="Enter longitude"
                {...register("longitude")}
                className={errors.longitude ? "border-red-500" : ""}
              />
              {errors.longitude && (
                <p className="mt-1 text-sm text-required">{errors.longitude.message}</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 md:gap-6 lg:gap-8">
            <div>
              <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="status-toggle">
                {Constants.adminConstants.statusLabel} <span className="text-required">{Constants.adminConstants.requiredstar}</span>
              </WebComponents.UiComponents.UiWebComponents.FormLabel>
              <Controller
                name="status"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <div className="h-[44px] border-[0.6px] border-[#D8D9D9] dark:border-[#616161] rounded-[4px] bg-textMain2 dark:bg-[#1B1B1B] w-full">
                    <div className="flex items-center justify-between px-3 py-[10px]">
                      <span className="text-sm font-interTight font-medium leading-[14px] text-textMain dark:text-white">
                        {value ? "Active" : "Inactive"}
                      </span>
                      <WebComponents.UiComponents.UiWebComponents.Switch 
                        id="status-toggle" 
                        checked={value} 
                        onCheckedChange={onChange} 
                      />
                    </div>
                  </div>
                )}
              />
              {errors.status && (
                <p className="mt-1 text-sm text-required">{errors.status.message}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default StoreManagementForm;


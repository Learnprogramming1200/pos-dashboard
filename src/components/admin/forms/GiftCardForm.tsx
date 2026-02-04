"use client";
import React from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { ServerActions } from "@/lib";
import * as Yup from "yup";
import { Constants } from "@/constant";
import { giftCardFormSchema } from "@/app/validation/ValidationSchema";
import { WebComponents } from "@/components";
import { AdminTypes } from "@/types";

// Generate a unique-looking alphanumeric code (5-6 chars) for auto mode
const generateNumber = (): string => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no confusing chars
  const length = Math.random() < 0.5 ? 5 : 6;
  let code = "";
  for (let i = 0; i < length; i += 1) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
};

// Helper function to convert ISO date to YYYY-MM-DD format
const formatDateForInput = (dateString: string | undefined): string => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    return date.toISOString().split('T')[0]; // Convert to YYYY-MM-DD format
  } catch (error) {
    console.error('Error formatting date:', error);
    return "";
  }
};

// Customer type for dropdown
interface Customer {
  id: string;
  name: string;
  email: string;
}

// Helper to extract customer IDs from assignedCustomerIds (handles both string[] and object[])
const extractCustomerIds = (ids: any[] | undefined): string[] => {
  if (!ids) return [];
  return ids.map((item) => (typeof item === "string" ? item : item?.id || "")).filter(Boolean);
};

interface GiftCardFormProps {
  onSubmit: (data: AdminTypes.giftCardTypes.GiftCard) => void;
  giftCard?: AdminTypes.giftCardTypes.GiftCard;
}

const GiftCardForm = ({ onSubmit, giftCard }: GiftCardFormProps) => {
  const [numberGenerationType, setNumberGenerationType] =
    React.useState<AdminTypes.giftCardTypes.NumberGenerationType>(
      giftCard?.numberGenerationType || "Auto"
    );
  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const [loadingCustomers, setLoadingCustomers] = React.useState(false);

  type FormData = Yup.InferType<typeof giftCardFormSchema>;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<FormData>({
    resolver: yupResolver(giftCardFormSchema) as any,
    defaultValues: {
      name: giftCard?.name ?? "",
      number: giftCard?.number ?? generateNumber(),
      value: giftCard?.value ?? 0,
      thresholdAmount: giftCard?.thresholdAmount ?? undefined,
      validity: giftCard?.validity
        ? formatDateForInput(giftCard.validity)
        : new Date().toISOString().slice(0, 10),
      assignedCustomerIds: extractCustomerIds(giftCard?.assignedCustomerIds),
      terms: giftCard?.terms ?? "",
      giftCardImage: giftCard?.giftCardImage ?? null,
      status: giftCard?.status === "Active",
      sendMail: giftCard?.options?.sendEmail ?? false,
    },
  });

  const selectedCustomers = watch("assignedCustomerIds") || [];

  // Determine customer scope based on selected customers
  const getCustomerScope = (): AdminTypes.giftCardTypes.CustomerScope => {
    // If no customers are selected, it's for all customers
    if (!selectedCustomers || selectedCustomers.length === 0) {
      return "All";
    }
    
    // If all available customers are selected, it's also considered "All"
    const allCustomerIds = customers?.map(c => c.id) || [];
    const allSelected = allCustomerIds.length > 0 && 
                      selectedCustomers.length === allCustomerIds.length && 
                      allCustomerIds.every(id => selectedCustomers.includes(id));
    
    return allSelected ? "All" : "Specific";
  };

  // Update form values when giftCard prop changes
  React.useEffect(() => {
    if (giftCard) {
      const validityStr = formatDateForInput(giftCard.validity);
      reset({
        name: giftCard.name || "",
        number: giftCard.number || generateNumber(),
        value: giftCard.value || 0,
        thresholdAmount: giftCard.thresholdAmount ?? undefined,
        validity: validityStr || new Date().toISOString().slice(0, 10),
        assignedCustomerIds: extractCustomerIds(giftCard.assignedCustomerIds),
        terms: giftCard.terms || "",
        giftCardImage: giftCard.giftCardImage || null,
        status: giftCard.status === "Active",
        sendMail: giftCard.options?.sendEmail ?? false,
      });
      setNumberGenerationType(giftCard.numberGenerationType || "Auto");
    }
  }, [giftCard, reset]);

  // Fetch active customers on mount
  React.useEffect(() => {
    const fetchCustomers = async () => {
      setLoadingCustomers(true);
      try {
        const result =
          await ServerActions.ServerActionslib.getAllActiveCustomersAction();
        if (result?.success && result.data) {
          // Extract customers from API response
          let customersData: any[] = [];
          if (Array.isArray(result.data)) {
            customersData = result.data;
          } else if (result.data?.data && Array.isArray(result.data.data)) {
            customersData = result.data.data;
          } else if (
            result.data?.data?.data &&
            Array.isArray(result.data.data.data)
          ) {
            customersData = result.data.data.data;
          }

          // Transform API response to Customer format
          const transformedCustomers: Customer[] = customersData
            .filter(
              (customer: any) => customer && (customer._id || customer.id)
            )
            .map((customer: any) => ({
              id: customer._id || customer.id,
              name:
                customer.name || customer.fullName || customer.user?.name || "",
              email: customer.email || customer.user?.email || "",
            }))
            .filter((customer: Customer) => customer.name && customer.id);

          setCustomers(transformedCustomers);
        } else {
          console.error("Failed to fetch customers:", result?.error);
          setCustomers([]);
        }
      } catch (error) {
        console.error("Error fetching customers:", error);
        setCustomers([]);
      } finally {
        setLoadingCustomers(false);
      }
    };

    fetchCustomers();
  }, []);

  // Generate gift card number function
  const generateGiftCardNumber = () => {
    const newNumber = generateNumber();
    setValue("number", newNumber);
    setNumberGenerationType("Auto");
  };

  const onSubmitForm = (data: FormData) => {
    const customerScope = getCustomerScope();

    onSubmit({
      name: data.name.trim(),
      number: data.number.toUpperCase().trim(),
      numberGenerationType,
      value: data.value,
      thresholdAmount: data.thresholdAmount ?? undefined,
      validity: data.validity,
      customerScope: customerScope,
      assignedCustomerIds: customerScope === "Specific" ? selectedCustomers : "",
      terms: data.terms || "",
      giftCardImage: data.giftCardImage || undefined,
      status: data.status ? "Active" : "Inactive",
      options: { sendEmail: data.sendMail },
    } as AdminTypes.giftCardTypes.GiftCard);
  };

  return (
    <form id="gift-card-form" onSubmit={handleSubmit(onSubmitForm)}>
      <div className="p-4 sm:p-5 md:p-6 lg:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6 lg:gap-8">
          {/* Left Side: Image Upload */}
          <div className="col-span-1">
            <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="giftCardImage">
              Gift Card Image
            </WebComponents.UiComponents.UiWebComponents.FormLabel>
            <div className="mt-2">
              <Controller
                name="giftCardImage"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <WebComponents.UiComponents.UiWebComponents.ImageCropUpload
                    id="gift-card-image"
                    accept="image/*"
                    onChange={(val) => {
                      onChange(typeof val === "string" ? val : null);
                    }}
                    value={value || null}
                  
                    viewSize={300}  previewSize={{ width: 200, height: 250 }}
                    aspect={1}
                    shape="rect"
                    previewMask="rect"
                    layout="vertical"
                    uploadButtonText="Upload"
                    removeButtonText="Remove"
                    useAdminUpload={true}
                  />
                )}
              />
            </div>
          </div>

          {/* Right Side: Gift Card Name, Number, and Value */}
          <div className="col-span-1 space-y-4 sm:space-y-5 md:space-y-6">
            {/* Gift Card Name */}
            <div>
              <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="name">
                {Constants.adminConstants.giftCardNameLabel}{" "}
                <span className="text-required">
                  {Constants.adminConstants.requiredstar}
                </span>
              </WebComponents.UiComponents.UiWebComponents.FormLabel>
              <WebComponents.UiComponents.UiWebComponents.FormInput
                id="name"
                type="text"
                placeholder={Constants.adminConstants.giftCardNamePlaceholder}
                {...register("name")}
                autoComplete="off"
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-required">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Gift Card Number */}
            <div>
              <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="number">
                {Constants.adminConstants.giftCardNumberLabel}{" "}
                <span className="text-required">
                  {Constants.adminConstants.requiredstar}
                </span>
              </WebComponents.UiComponents.UiWebComponents.FormLabel>
              <div className="flex gap-2">
                <WebComponents.UiComponents.UiWebComponents.FormInput
                  id="number"
                  type="text"
                  placeholder={
                    Constants.adminConstants.giftCardNumberPlaceholder
                  }
                  {...register("number")}
                  onChange={(e) => {
                    register("number").onChange(e);
                    setNumberGenerationType("Manual");
                  }}
                  autoComplete="off"
                  className={`flex-1 ${errors.number ? "border-red-500" : ""}`}
                />
                <WebComponents.UiComponents.UiWebComponents.Button
                  type="button"
                  variant="outline"
                  onClick={generateGiftCardNumber}
                  className="whitespace-nowrap"
                >
                  Generate Gift Card
                </WebComponents.UiComponents.UiWebComponents.Button>
              </div>
              {errors.number && (
                <p className="mt-1 text-sm text-required">
                  {errors.number.message}
                </p>
              )}
            </div>

            {/* Gift Card Value */}
            <div>
              <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="value">
                {Constants.adminConstants.giftCardValueLabel}{" "}
                <span className="text-required">
                  {Constants.adminConstants.requiredstar}
                </span>
              </WebComponents.UiComponents.UiWebComponents.FormLabel>
              <WebComponents.UiComponents.UiWebComponents.FormInput
                id="value"
                type="number"
                min="0"
                step="0.01"
                placeholder={Constants.adminConstants.giftCardValuePlaceholder}
                {...register("value", { valueAsNumber: true })}
                autoComplete="off"
                className={errors.value ? "border-red-500" : ""}
              />
              {errors.value && (
                <p className="mt-1 text-sm text-required">
                  {errors.value.message}
                </p>
              )}
            </div>
          </div>

          {/* Threshold Amount */}
          <div className="col-span-1">
            <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="thresholdAmount">
              {Constants.adminConstants.thresholdAmountLabel}
            </WebComponents.UiComponents.UiWebComponents.FormLabel>
            <WebComponents.UiComponents.UiWebComponents.FormInput
              id="thresholdAmount"
              type="number"
              min="0"
              step="0.01"
              placeholder={Constants.adminConstants.thresholdAmountPlaceholder}
              {...register("thresholdAmount", { valueAsNumber: true })}
              autoComplete="off"
              className={errors.thresholdAmount ? "border-red-500" : ""}
            />
            {errors.thresholdAmount && (
              <p className="mt-1 text-sm text-required">
                {errors.thresholdAmount.message}
              </p>
            )}
          </div>

          {/* Validity */}
          <div className="col-span-1">
            <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="validity">
              {Constants.adminConstants.validityLabel}{" "}
              <span className="text-required">
                {Constants.adminConstants.requiredstar}
              </span>
            </WebComponents.UiComponents.UiWebComponents.FormLabel>
            <Controller
              name="validity"
              control={control}
              render={({ field }) => (
                <WebComponents.UiComponents.UiWebComponents.SingleDatePicker
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="DD-MM-YYYY"
                  className={errors.validity ? "border-red-500" : ""}
                />
              )}
            />
          </div>

          {/* Customers */}
          <div className="col-span-1">
            <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="assignedCustomerIds">
              {Constants.adminConstants.customersLabel}{" "}
              <span className="text-required">
                {Constants.adminConstants.requiredstar}
              </span>
            </WebComponents.UiComponents.UiWebComponents.FormLabel>
            {loadingCustomers ? (
              <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                Loading customers...
              </div>
            ) : (
              <Controller
                name="assignedCustomerIds"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <WebComponents.UiComponents.UiWebComponents.FormDropdown
                    id="assignedCustomerIds"
                    value={(value || []).filter((v): v is string => typeof v === "string")}
                    onChange={(e) => {
                      const newValue = Array.isArray(e.target.value)
                        ? e.target.value.filter((v): v is string => typeof v === "string")
                        : [];
                      onChange(newValue);
                    }}
                    multiselect
                    selectall
                    autoComplete="off"
                  >

                    {customers.map((customer) => (

                      <WebComponents.UiComponents.UiWebComponents.FormOption
                        key={customer.id}
                        value={customer.id}
                        label={customer.id}
                      >
                        {customer.name}
                      </WebComponents.UiComponents.UiWebComponents.FormOption>
                    ))}
                  </WebComponents.UiComponents.UiWebComponents.FormDropdown>
                )}
              />
            )}
          </div>

          {/* Send in Mail */}
          <div className="col-span-1">
            <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="send-mail-toggle">
              Send in Mail
            </WebComponents.UiComponents.UiWebComponents.FormLabel>
            <Controller
              name="sendMail"
              control={control}
              render={({ field: { value, onChange } }) => (
                <>
                  <div className="h-[44px] w-full rounded-[4px] border-[0.6px] border-[#D8D9D9] dark:border-[#616161] bg-textMain2 dark:bg-[#1B1B1B]">
                    <div className="flex items-center justify-between px-3 sm:px-4 py-[10px]">
                      <span className="text-xs sm:text-sm font-interTight font-medium leading-[14px] text-textMain dark:text-white">
                        {value ? "Yes" : "No"}
                      </span>
                      <WebComponents.UiComponents.UiWebComponents.Switch
                        id="send-mail-toggle"
                        checked={value}
                        onCheckedChange={onChange}
                        aria-label="Toggle send gift card in mail"
                      />
                    </div>
                  </div>
                </>
              )}
            />
          </div>

          {/* Status toggle */}
          <div className="col-span-1">
            <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="status-toggle">
              {Constants.adminConstants.statuslabel}{" "}
              <span className="text-required">
                {Constants.adminConstants.requiredstar}
              </span>
            </WebComponents.UiComponents.UiWebComponents.FormLabel>
            <Controller
              name="status"
              control={control}
              render={({ field: { value, onChange } }) => (
                <>
                  <div className="h-[44px] w-full rounded-[4px] border-[0.6px] border-[#D8D9D9] dark:border-[#616161] bg-textMain2 dark:bg-[#1B1B1B]">
                    <div className="flex items-center justify-between px-3 sm:px-4 py-[10px]">
                      <span className="text-xs sm:text-sm font-interTight font-medium leading-[14px] text-textMain dark:text-white">
                        {value
                          ? Constants.adminConstants.activeStatus
                          : Constants.adminConstants.inactiveStatus}
                      </span>
                      <WebComponents.UiComponents.UiWebComponents.Switch
                        id="status-toggle"
                        checked={value}
                        onCheckedChange={onChange}
                        aria-label="Toggle gift card status"
                      />
                    </div>
                  </div>
                  {errors.status && (
                    <p className="mt-1 text-sm text-required">
                      {errors.status.message}
                    </p>
                  )}
                </>
              )}
            />
          </div>
        </div>

        {/* Terms and Conditions */}
        <div className="col-span-1 md:col-span-2 mt-4">
          <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="terms">
            {Constants.adminConstants.termsAndConditionsLabel}
          </WebComponents.UiComponents.UiWebComponents.FormLabel>
          <Controller
            name="terms"
            control={control}
            render={({ field: { value, onChange } }) => (
              <WebComponents.UiComponents.UiWebComponents.RichTextEditor
                value={value || ""}
                onChange={onChange}
                placeholder="Enter terms and conditions..."
                height={200}
              />
            )}
          />
        </div>

      </div>
    </form>
  );
};

export default GiftCardForm;


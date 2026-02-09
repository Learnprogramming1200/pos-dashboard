"use client";

import React from 'react';
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { subscriptionFormSchema } from '@/app/validation/ValidationSchema';
import { Constants } from '@/constant';
import { WebComponents } from '@/components';
import { plansAPI, businessOwnersAPI } from '@/lib/api';
import { SuperAdminTypes } from '@/types';

type FormData = Yup.InferType<typeof subscriptionFormSchema>;

// Currency formatting utility function
const formatCurrency = (amount: number | undefined | null, currency: any) => {
  const safeAmount = amount ?? 0;
  const numAmount = typeof safeAmount === 'number' && !isNaN(safeAmount) ? safeAmount : 0;
  if (!currency) {
    return numAmount.toFixed(2);
  }
  const formattedAmount = numAmount.toFixed(2);
  const symbol = currency.symbol || currency.currencySymbol || '';
  const position = String(currency.position || currency.currencyPosition || 'Left').trim();
  const isRight = position.toLowerCase() === 'right';

  if (isRight) {
    return `${formattedAmount}${symbol}`;
  } else {
    return `${symbol}${formattedAmount}`;
  }
};

interface SubscriptionFormProps {
  readonly onSubmit: (data: SuperAdminTypes.SubscriptionTypes.SubscriptionFormData) => void;
  readonly onClose?: () => void;
}

export default function SubscriptionForm({ onSubmit, onClose }: SubscriptionFormProps) {
  const [plans, setPlans] = React.useState<any[]>([]);
  const [plansLoading, setPlansLoading] = React.useState(false);
  const [businessOwners, setBusinessOwners] = React.useState<any[]>([]);
  const [businessOwnersLoading, setBusinessOwnersLoading] = React.useState(false);
  const hasFetchedPlans = React.useRef(false);
  const hasFetchedBusinessOwners = React.useRef(false);

  const [selectedPlanTax, setSelectedPlanTax] = React.useState<any>(null);
  const [selectedPlanCurrency, setSelectedPlanCurrency] = React.useState<any>(null);
  const [selectedPlanTotalPrice, setSelectedPlanTotalPrice] = React.useState<number | null>(null);
  const [taxAmount, setTaxAmount] = React.useState(0);
  const [totalAmount, setTotalAmount] = React.useState(0);
  const [loading, setLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(subscriptionFormSchema) as any,
    mode: "onChange", // Validate on change to show errors immediately
    defaultValues: {
      purchaseDate: '', // Start with empty to allow validation
      planName: '',
      userId: '',
      amount: '',
      discount: '0',
      discountType: 'Fixed',
      status: 'Active',
      selectTax: undefined,
    },
  });

  const watchedAmount = watch('amount');
  const watchedDiscount = watch('discount');
  const watchedDiscountType = watch('discountType');
  const watchedPlanName = watch('planName');
  const watchedSelectTax = watch('selectTax');

  // Fetch plans when component mounts (only once)
  React.useEffect(() => {
    if (hasFetchedPlans.current) return;
    
    const fetchPlans = async () => {
      try {
        hasFetchedPlans.current = true;
        setPlansLoading(true);
        const response = await plansAPI.getAll();
        const plansData = response?.data?.data?.data || response?.data?.data || response?.data || [];
        setPlans(Array.isArray(plansData) ? plansData : []);
      } catch (error) {
        console.error('Error fetching plans:', error);
        setPlans([]);
        hasFetchedPlans.current = false;
      } finally {
        setPlansLoading(false);
      }
    };

    fetchPlans();
  }, []);

  // Fetch business owners when component mounts (only once)
  React.useEffect(() => {
    if (hasFetchedBusinessOwners.current) return;
    
    const fetchBusinessOwners = async () => {
      try {
        hasFetchedBusinessOwners.current = true;
        setBusinessOwnersLoading(true);
        const response = await businessOwnersAPI.getAllBusnessOwnerData();
        const ownersData = response?.data?.data?.data || response?.data?.data || response?.data || [];
        setBusinessOwners(Array.isArray(ownersData) ? ownersData : []);
      } catch (error) {
        console.error('Error fetching business owners:', error);
        setBusinessOwners([]);
        hasFetchedBusinessOwners.current = false;
      } finally {
        setBusinessOwnersLoading(false);
      }
    };

    fetchBusinessOwners();
  }, []);

  // Auto-populate fields when plan is selected
  React.useEffect(() => {
    if (watchedPlanName) {
      const selectedPlan = plans.find(plan => plan._id === watchedPlanName);
      if (selectedPlan) {
        // Auto-populate amount
        if (selectedPlan.price) {
          setValue('amount', selectedPlan.price.toString());
        }

        // Auto-populate tax if the plan has a tax field
        if (selectedPlan.tax) {
          setValue('selectTax', selectedPlan._id || undefined);
          setSelectedPlanTax(selectedPlan.tax);
        } else {
          setValue('selectTax', undefined);
          setSelectedPlanTax(null);
        }

        // Store the selected plan currency
        if (selectedPlan.currency) {
          setSelectedPlanCurrency(selectedPlan.currency);
        } else {
          setSelectedPlanCurrency(null);
        }

        // Store the selected plan's totalPrice if available
        if (selectedPlan.totalPrice !== undefined && selectedPlan.totalPrice !== null) {
          setSelectedPlanTotalPrice(selectedPlan.totalPrice);
        } else {
          setSelectedPlanTotalPrice(null);
        }
      } else {
        setSelectedPlanTotalPrice(null);
      }
    }
  }, [watchedPlanName, plans, setValue]);

  // Calculate totals
  React.useEffect(() => {
    // If plan has totalPrice, use it directly
    if (selectedPlanTotalPrice !== null && selectedPlanTotalPrice !== undefined) {
      setTotalAmount(selectedPlanTotalPrice);
      // Calculate tax amount for display purposes
      const amount = parseFloat(watchedAmount || '0') || 0;
      let calculatedTax = 0;
      if (selectedPlanTax) {
        if (selectedPlanTax.type === 'Fixed') {
          calculatedTax = selectedPlanTax.value;
        } else {
          calculatedTax = (amount * selectedPlanTax.value) / 100;
        }
      }
      setTaxAmount(calculatedTax);
      return;
    }

    // Otherwise, calculate as before
    const amount = parseFloat(watchedAmount || '0') || 0;
    const discount = parseFloat(watchedDiscount || '0') || 0;

    let calculatedTax = 0;
    if (selectedPlanTax) {
      if (selectedPlanTax.type === 'Fixed') {
        calculatedTax = selectedPlanTax.value;
      } else {
        calculatedTax = (amount * selectedPlanTax.value) / 100;
      }
    }

    let finalDiscount = discount;
    if (watchedDiscountType === 'Percentage') {
      finalDiscount = (amount * discount) / 100;
    }

    setTaxAmount(calculatedTax);
    setTotalAmount(amount - finalDiscount + calculatedTax);
  }, [watchedAmount, watchedDiscount, watchedDiscountType, watchedSelectTax, watchedPlanName, selectedPlanTax, selectedPlanCurrency, selectedPlanTotalPrice]);

  const onFormSubmit = async (data: FormData) => {
    // Get selected plan to extract duration
    const selectedPlan = plans.find(plan => plan._id === data.planName);
    const duration = selectedPlan?.duration || '';

    setLoading(true);
    try {
      onSubmit({
        ...data,
        purchaseDate: data.purchaseDate,
        taxAmount,
        totalAmount,
        duration: typeof duration === 'string' ? duration : String(duration),
      } as any);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Form Content */}
      <div className="bg-white dark:bg-darkFilterbar rounded-[4px] mt-4">
        <form id="subscription-form" onSubmit={handleSubmit(onFormSubmit)}>
          <div className="p-4 sm:p-5 md:p-6 lg:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6 lg:gap-8">

              {/* Purchase Date */}
              <div>
                <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="purchaseDate">
                  {Constants.superadminConstants.purchasedatelabel} <span className="text-required">{Constants.superadminConstants.requiredstar}</span>
                </WebComponents.UiComponents.UiWebComponents.FormLabel>
                <Controller
                  name="purchaseDate"
                  control={control}
                  render={({ field, fieldState }) => (
                    <>
                      <WebComponents.UiComponents.UiWebComponents.SingleDatePicker
                        value={field.value}
                        onChange={(v) => field.onChange(v)}
                        disablePast
                      />
                      {fieldState.error && (
                        <p className="mt-1 text-sm text-required">{fieldState.error.message}</p>
                      )}
                    </>
                  )}
                />
              </div>

              {/* Business Owner Name */}
              <div>
                <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="userId">
                  {Constants.superadminConstants.ownername} <span className="text-required">{Constants.superadminConstants.requiredstar}</span>
                </WebComponents.UiComponents.UiWebComponents.FormLabel>
                <Controller
                  name="userId"
                  control={control}
                  render={({ field, fieldState }) => (
                    <>
                      <WebComponents.UiComponents.UiWebComponents.FormDropdown
                        id="businessOwnerName"
                        name="businessOwnerName"
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                        disabled={businessOwnersLoading}
                        className={fieldState.invalid ? "border-red-500" : ""}
                      >
                        <WebComponents.UiComponents.UiWebComponents.FormOption value="">
                          {businessOwnersLoading ? 'Loading business owners...' : 'Select Business Owner'}
                        </WebComponents.UiComponents.UiWebComponents.FormOption>
                        {businessOwners.map(user => (
                          <WebComponents.UiComponents.UiWebComponents.FormOption key={user._id} value={user._id}>{user.name}</WebComponents.UiComponents.UiWebComponents.FormOption>
                        ))}
                      </WebComponents.UiComponents.UiWebComponents.FormDropdown>
                      {fieldState.error && (
                        <p className="mt-1 text-sm text-required">{fieldState.error.message}</p>
                      )}
                    </>
                  )}
                />
              </div>

              {/* Plan Name */}
              <div>
                <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="planName">
                  {Constants.superadminConstants.plannamelabel} <span className="text-required">{Constants.superadminConstants.requiredstar}</span>
                </WebComponents.UiComponents.UiWebComponents.FormLabel>
                <Controller
                  name="planName"
                  control={control}
                  render={({ field, fieldState }) => (
                    <>
                      <WebComponents.UiComponents.UiWebComponents.FormDropdown
                        id="planName"
                        name="planName"
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                        disabled={plansLoading}
                        className={fieldState.invalid ? "border-red-500" : ""}
                      >
                        <WebComponents.UiComponents.UiWebComponents.FormOption value="">
                          {plansLoading ? 'Loading plans...' : 'Select Plan'}
                        </WebComponents.UiComponents.UiWebComponents.FormOption>
                        {plans.map(plan => (
                          <WebComponents.UiComponents.UiWebComponents.FormOption key={plan._id} value={plan._id}>{`${plan.name}${plan.duration ? ` (${plan.duration})` : ''}`}</WebComponents.UiComponents.UiWebComponents.FormOption>
                        ))}
                      </WebComponents.UiComponents.UiWebComponents.FormDropdown>
                      {fieldState.error && (
                        <p className="mt-1 text-sm text-required">{fieldState.error.message}</p>
                      )}
                    </>
                  )}
                />
              </div>

              {/* Total Amount (Calculated) */}
              <div>
                <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="totalAmount">
                  {Constants.superadminConstants.totalamountlabel} <span className="text-required">{Constants.superadminConstants.requiredstar}</span>
                </WebComponents.UiComponents.UiWebComponents.FormLabel>
                <WebComponents.UiComponents.UiWebComponents.FormInput
                  id="totalAmount"
                  name="totalAmount"
                  type="text"
                  value={formatCurrency(totalAmount, selectedPlanCurrency)}
                  readOnly
                  className="bg-gray-100  cursor-not-allowed font-bold text-base sm:text-lg"
                />
              </div>

              {/* Status */}
              <div>
                <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="status-toggle">
                  {Constants.superadminConstants.statuslabel} <span className="text-required">{Constants.superadminConstants.requiredstar}</span>
                </WebComponents.UiComponents.UiWebComponents.FormLabel>
                <div className="h-[44px] w-full rounded-[4px] border-[0.6px] border-[#D8D9D9] dark:border-[#616161] bg-textMain2 dark:bg-[#1B1B1B] opacity-60 cursor-not-allowed">
                  <div className="flex items-center justify-between px-3 sm:px-4 py-[10px]">
                    <span className="text-xs sm:text-sm font-interTight font-medium leading-[14px] text-textMain dark:text-white">
                      {watch('status') === 'Active' ? Constants.superadminConstants.activestatus : Constants.superadminConstants.inactivestatus}
                    </span>
                    <WebComponents.UiComponents.UiWebComponents.Switch
                      id="status-toggle"
                      checked={watch('status') === 'Active'}
                      disabled
                      aria-label="Toggle subscription status"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Footer */}
      <div className="pt-6 sm:pt-10 md:pt-14 lg:pt-[40px] flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 px-4 sm:px-0">
        <WebComponents.UiComponents.UiWebComponents.Button variant="cancel" type="button" onClick={onClose || (() => {})}>
          {Constants.superadminConstants.cancelbutton}
        </WebComponents.UiComponents.UiWebComponents.Button>
        <WebComponents.UiComponents.UiWebComponents.Button
          variant="save"
          type="submit"
          form="subscription-form"
          disabled={loading}
        >
          {loading ? Constants.superadminConstants.saving : Constants.superadminConstants.save}
        </WebComponents.UiComponents.UiWebComponents.Button>
      </div>
    </>
  );
}

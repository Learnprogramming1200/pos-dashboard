"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { redeemFormSchema } from "@/app/validation/ValidationSchema";
import { Constants } from "@/constant";
import { WebComponents } from "@/components";
import { AdminTypes } from "@/types";

const RedeemForm = ({
  onSubmit,
  redeem,
}: {
  onSubmit: (data: AdminTypes.loyaltyTypes.RedeemPointFormData) => void;
  redeem?: AdminTypes.loyaltyTypes.RedeemPointServerResponse;
}) => {
  const {
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<AdminTypes.loyaltyTypes.RedeemPointFormData>({
    resolver: yupResolver(redeemFormSchema) as any,
    defaultValues: {
      ruleName: redeem?.ruleName || "",
      pointFrom: redeem?.pointFrom || 0,
      pointTo: redeem?.pointTo || 0,
      amount: redeem?.amount || 0,
      status: redeem?.status ?? true,
    },
  });

  // Watch form values for display
  const formValues = watch();

  // Update form values when redeem prop changes
  React.useEffect(() => {
    if (redeem) {
      reset({
        ruleName: redeem.ruleName || "",
        pointFrom: redeem.pointFrom || 0,
        pointTo: redeem.pointTo || 0,
        amount: redeem.amount || 0,
        status: redeem.status ?? true,
      });
    } else {
      reset({
        ruleName: "",
        pointFrom: 0,
        pointTo: 0,
        amount: 0,
        status: true,
      });
    }
  }, [redeem, reset]);

  const onSubmitForm = (data: AdminTypes.loyaltyTypes.RedeemPointFormData) => {
    const formData: AdminTypes.loyaltyTypes.RedeemPointFormData = {
      ruleName: data.ruleName,
      pointFrom: Number(data.pointFrom) || 0,
      pointTo: Number(data.pointTo) || 0,
      amount: Number(data.amount) || 0,
      status: data.status,
    };

    onSubmit(formData);
  };

  React.useEffect(() => {
    if (Object.keys(errors).length > 0) {
    }
  }, [errors]);

  return (
    <form id="redeem-form" onSubmit={handleSubmit(onSubmitForm)}>
      <div className="p-4 sm:p-5 md:p-6 lg:p-8 space-y-6 sm:space-y-8">
        {/* Redeem Calculation Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Redeem Calculation</h2>

          {/* Form Fields in Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {/* Rule Name */}
            <div>
              <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="ruleName">
                Rule Name <span className="text-required">{Constants.adminConstants.requiredstar}</span>
              </WebComponents.UiComponents.UiWebComponents.FormLabel>
              <WebComponents.UiComponents.UiWebComponents.FormInput
                id="ruleName"
                type="text"
                placeholder="Enter Name"
                value={formValues.ruleName || ""}
                onChange={(e) => setValue("ruleName", e.target.value)}
                required
              />
            </div>

            {/* Point From */}
            <div>
              <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="pointFrom">
                Point From <span className="text-required">{Constants.adminConstants.requiredstar}</span>
              </WebComponents.UiComponents.UiWebComponents.FormLabel>
              <WebComponents.UiComponents.UiWebComponents.FormInput
                id="pointFrom"
                type="number"
                placeholder="Enter Value"
                value={formValues.pointFrom ?? ""}
                onChange={(e) => setValue("pointFrom", e.target.value === "" ? 0 : Number(e.target.value))}
                required
              />
            </div>

            {/* Point To */}
            <div>
              <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="pointTo">
                Point To <span className="text-required">{Constants.adminConstants.requiredstar}</span>
              </WebComponents.UiComponents.UiWebComponents.FormLabel>
              <WebComponents.UiComponents.UiWebComponents.FormInput
                id="pointTo"
                type="number"
                placeholder="Enter Value"
                value={formValues.pointTo ?? ""}
                onChange={(e) => setValue("pointTo", e.target.value === "" ? 0 : Number(e.target.value))}
                required
              />
            </div>

            {/* Amount */}
            <div>
              <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="amount">
                Amount <span className="text-required">{Constants.adminConstants.requiredstar}</span>
              </WebComponents.UiComponents.UiWebComponents.FormLabel>
              <WebComponents.UiComponents.UiWebComponents.FormInput
                id="amount"
                type="number"
                placeholder="Enter Amount"
                value={formValues.amount ?? ""}
                onChange={(e) => setValue("amount", e.target.value === "" ? 0 : Number(e.target.value))}
                required
              />
            </div>

            {/* Status */}
            <div>
              <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="status-toggle">
                Status
              </WebComponents.UiComponents.UiWebComponents.FormLabel>
              <div className="h-[44px] w-full rounded-[4px] border-[0.6px] border-[#D8D9D9] dark:border-[#616161] bg-textMain2 dark:bg-[#1B1B1B]">
                <div className="flex items-center justify-between px-3 sm:px-4 py-[10px]">
                  <span className="text-xs sm:text-sm font-interTight font-medium leading-[14px] text-textMain dark:text-white">
                    {formValues.status ? "Active" : "Inactive"}
                  </span>
                  <WebComponents.UiComponents.UiWebComponents.Switch
                    id="status-toggle"
                    checked={formValues.status ?? true}
                    onCheckedChange={(checked) => setValue("status", checked)}
                    aria-label="Toggle status"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default RedeemForm;

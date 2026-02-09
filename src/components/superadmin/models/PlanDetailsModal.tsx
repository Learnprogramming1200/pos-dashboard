"use client";

import React from "react";
import { FaBuilding, FaCalendar, FaClock, FaFileAlt, FaTag } from "react-icons/fa";
import { Constants } from "@/constant";
import { WebComponents } from "@/components";
import { SuperAdminTypes } from "@/types";

type Plan = SuperAdminTypes.PlanTypes.Plan;
type Tax = SuperAdminTypes.TaxTypes.Tax;

type CurrencyLike = {
  symbol?: string;
  position?: string;
};

interface PlanDetailsModalProps {
  readonly plan: Plan;
  readonly taxes: Tax[];
  readonly onClose: () => void;
}

const formatPrice = (
  price: number | string | undefined | null,
  currency?: CurrencyLike,
  formattedPrice?: string
) => {
  if (price === null || price === undefined || price === "") {
    return "-";
  }

  const priceValue =
    formattedPrice || (typeof price === "number" ? price.toFixed(2) : String(price));

  if (!currency || typeof currency !== "object" || !currency.symbol) {
    return `$${priceValue}`;
  }

  const symbol = currency.symbol || "";
  const position = String(currency.position || "Left").trim();
  const isRight = position.toLowerCase() === "right";

  return isRight ? `${priceValue}${symbol}` : `${symbol}${priceValue}`;
};

const formatDiscount = (
  discount: number | string | undefined | null,
  discountType: string | undefined | null,
  currency?: CurrencyLike
) => {
  if (discount === null || discount === undefined || !discountType) {
    return "-";
  }

  const discountValue =
    typeof discount === "number" ? discount : parseFloat(String(discount));
  if (isNaN(discountValue)) {
    return "-";
  }

  const typeLower = String(discountType).toLowerCase();

  if (typeLower === "percentage") {
    return `${discountValue}%`;
  }

  if (typeLower === "fixed") {
    if (!currency || typeof currency !== "object" || !currency.symbol) {
      return `${discountValue}`;
    }
    const symbol = currency.symbol || "";
    const position = String(currency.position || "Left").trim();
    const isRight = position.toLowerCase() === "right";
    return isRight ? `${discountValue}${symbol}` : `${symbol}${discountValue}`;
  }

  return "-";
};

const formatTaxValue = (
  taxValue: number | string | undefined | null,
  taxType: string | undefined | null,
  currency?: CurrencyLike
) => {
  if (taxValue === null || taxValue === undefined || !taxType) {
    return "";
  }

  const value = typeof taxValue === "number" ? taxValue : parseFloat(String(taxValue));
  if (isNaN(value)) {
    return "";
  }

  if (String(taxType) === "Percentage") {
    return `${value}%`;
  }

  if (!currency || typeof currency !== "object" || !currency.symbol) {
    return `${value}`;
  }

  const symbol = currency.symbol || "";
  const position = String(currency.position || "Left").trim();
  const isRight = position.toLowerCase() === "right";
  return isRight ? `${value}${symbol}` : `${symbol}${value}`;
};

export default function PlanDetailsModal({ plan, taxes, onClose }: PlanDetailsModalProps) {
  const currency = (plan as any).currency as CurrencyLike | undefined;

  const isActive =
    typeof (plan as any).status === "boolean"
      ? Boolean((plan as any).status)
      : (plan as any).Status === "Active";

  const statusLabel = isActive
    ? Constants.superadminConstants.activestatus
    : Constants.superadminConstants.inactivestatus;

  const statusColor = isActive ? "active" : "inactive";

  const getTaxName = (tax: any) => {
    if (!tax || tax === "no-tax") return "-";

    // Handle tax as object (populated)
    if (typeof tax === "object" && tax !== null) {
      const taxName = (tax as any).name || "Unnamed Tax";
      const taxValue = formatTaxValue((tax as any).value, (tax as any).type, currency);
      return `${taxName} (${taxValue})`;
    }

    // Handle tax as string ID
    const taxId = typeof tax === "string" ? tax : (tax as any)?._id;
    if (!taxId) return "-";

    const foundTax = taxes.find((t) => (t as any)._id === taxId);
    if (foundTax) {
      const taxName = (foundTax as any).name || "Unnamed Tax";
      const taxValue = formatTaxValue(
        (foundTax as any).value,
        (foundTax as any).type,
        currency
      );
      return `${taxName} (${taxValue})`;
    }

    return "Tax Selected";
  };

  const getTaxesDisplay = (planTaxes: any) => {
    if (!planTaxes) {
      const legacyTax = (plan as any).tax;
      if (legacyTax) {
        return getTaxName(legacyTax);
      }
      return "-";
    }

    if (!Array.isArray(planTaxes) || planTaxes.length === 0) {
      return "-";
    }

    return planTaxes
      .map((tax: any) => getTaxName(tax))
      .filter(Boolean)
      .join(", ");
  };

  const getPlanType = () => {
    const explicit = (plan as any).Plan_Type as string | undefined;
    if (explicit) return explicit;
    const type = (plan as any).type as string | undefined;
    if (type) return type;
    const duration = (plan as any).duration as string | undefined;
    if (!duration) return "-";
    const durationLower = String(duration).toLowerCase();
    if (durationLower.includes("year")) return "Yearly";
    if (durationLower.includes("month")) return "Monthly";
    if (durationLower.includes("week")) return "Weekly";
    if (durationLower.includes("day")) return "Daily";
    return "Monthly";
  };

  const getPrice = () => {
    const price = (plan as any).price ?? (plan as any).Price ?? "";
    const formattedPrice = (plan as any).formattedPrice;
    return formatPrice(price, currency, formattedPrice);
  };

  const getDiscount = () => {
    const discountType = (plan as any).discountType || (plan as any).Discount_Type;
    const discount = (plan as any).discount ?? (plan as any).Discount;
    if (!discountType || discount === null || discount === undefined || discount === "") {
      return "-";
    }
    return formatDiscount(discount, discountType, currency);
  };

  const getTotalPrice = () => {
    const totalPrice = (plan as any).totalPrice;
    return formatPrice(totalPrice, currency);
  };

  const modules: string[] = Array.isArray((plan as any).modules)
    ? (plan as any).modules
    : Array.isArray((plan as any).Modules)
      ? (plan as any).Modules
      : [];

  const screens: string[] = Array.isArray((plan as any).screens)
    ? (plan as any).screens
    : Array.isArray((plan as any).Pos_Screen)
      ? (plan as any).Pos_Screen
      : (plan as any).Pos_Screen
        ? [(plan as any).Pos_Screen]
        : [];

  const storeLimit = (plan as any).storeLimit ?? (plan as any).Total_Stores ?? "-";
  const staffLimit = (plan as any).staffLimit ?? (plan as any).Staff ?? "-";

  return (
    <WebComponents.WebCommonComponents.CommonComponents.DetailsModalLayout
      title={Constants.superadminConstants.plandetails}
      subtitle={Constants.superadminConstants.completeplaninformation}
      icon={<FaBuilding size={32} className="text-white" />}
      statusLabel={statusLabel}
      statusColor={statusColor}
      onClose={onClose}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoCard
          title={Constants.superadminConstants.basicinformation}
          icon={<FaBuilding size={18} className="text-white" />}
        >
          <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
            label={Constants.superadminConstants.plannamelabel}
            icon={<FaTag size={16} />}
            value={plan.name || (plan as any).Plan_Name || "-"}
          />

          <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
            label={Constants.superadminConstants.plandurationlabel}
            icon={<FaTag size={16} />}
            value={(plan as any).duration || (plan as any).Duration || "-"}
          />

          <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
            label={Constants.superadminConstants.plantypelabel}
            icon={<FaTag size={16} />}
            value={getPlanType()}
          />

          <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
            label={Constants.superadminConstants.planpricelabel}
            icon={<FaTag size={16} />}
            value={getPrice()}
          />

          <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
            label={Constants.superadminConstants.discountlabel}
            icon={<FaTag size={16} />}
            value={getDiscount()}
          />

          <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
            label={Constants.superadminConstants.taxlabel}
            icon={<FaTag size={16} />}
            value={getTaxesDisplay((plan as any).taxes)}
          />

          <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
            label={Constants.superadminConstants.totalpricelabel}
            icon={<FaTag size={16} />}
            value={getTotalPrice()}
          />

          <div>
            <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoLabel
              icon={<FaFileAlt size={16} />}
              label={Constants.superadminConstants.descriptionlabel}
            />
            <p className="text-base text-gray-700 ml-6 dark:text-gray-300">
              {(plan as any).description || (plan as any).Description || "No description provided"}
            </p>
          </div>
        </WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoCard>

        <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoCard
          title={Constants.superadminConstants.limitsandfeatures}
          icon={<FaTag size={18} className="text-white" />}
        >
          <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
            label={Constants.superadminConstants.storecountlabel}
            icon={<FaBuilding size={16} />}
            value={String(storeLimit)}
          />

          <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoRow
            label={Constants.superadminConstants.staffcountlabel}
            icon={<FaTag size={16} />}
            value={String(staffLimit)}
          />

          <div>
            <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoLabel
              icon={<FaTag size={16} />}
              label={Constants.superadminConstants.screenselectionlabel}
            />
            <div className="ml-6 flex flex-wrap gap-2">
              {screens.length > 0 ? (
                screens.map((screen, index) => (
                  <span
                    key={`${screen}-${index}`}
                    className="px-3 py-1 bg-primary text-white rounded-lg text-sm font-semibold"
                  >
                    {screen}
                  </span>
                ))
              ) : (
                <span className="text-base text-gray-700 dark:text-gray-300">-</span>
              )}
            </div>
          </div>

          <div>
            <WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoLabel
              icon={<FaTag size={16} />}
              label={Constants.superadminConstants.planmodulelabel}
            />
            <div className="ml-6 flex flex-wrap gap-2">
              {modules.length > 0 ? (
                modules.map((module, index) => (
                  <span
                    key={`${module}-${index}`}
                    className="px-3 py-1 bg-primary text-white rounded-lg text-sm font-semibold"
                  >
                    {module}
                  </span>
                ))
              ) : (
                <span className="text-base text-gray-700 dark:text-gray-300">-</span>
              )}
            </div>
          </div>
        </WebComponents.UiComponents.UiWebComponents.DetailsCommon.InfoCard>

        <div className="bg-gradient-to-br from-slate-50 to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700 lg:col-span-2">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <FaClock size={18} className="text-white" />
            </div>
            {Constants.superadminConstants.activitytimeline}
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <WebComponents.UiComponents.UiWebComponents.DetailsCommon.TimelineItem
              icon={<FaCalendar size={20} />}
              label={Constants.superadminConstants.createdonlabel}
              value={(plan as any).createdAt ? new Date((plan as any).createdAt).toLocaleDateString() : "-"}
            />
            <WebComponents.UiComponents.UiWebComponents.DetailsCommon.TimelineItem
              icon={<FaClock size={20} />}
              label={Constants.superadminConstants.lastmodifiedlabel}
              value={(plan as any).updatedAt ? new Date((plan as any).updatedAt).toLocaleDateString() : "-"}
            />
          </div>
        </div>
      </div>
    </WebComponents.WebCommonComponents.CommonComponents.DetailsModalLayout>
  );
}


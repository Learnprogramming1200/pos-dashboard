"use client";
import React from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "react-toastify";
import { customHooks } from "@/hooks";
import { useSession } from "next-auth/react";
import { WebComponents } from "@/components";
import { landingStrings } from "@/constant/common";
import RazorpayConfigChecker from "@/components/RazorpayConfigChecker";
import PayPalConfigChecker from "@/components/PayPalConfigChecker";
import { publicAPI, paymentGatewaysAPI, userSubscriptionAPI } from "@/lib/api";
import { HomeTypes } from "@/types";
import { plansTypes } from "@/types";

interface ChoosePlanProps {
  user?: HomeTypes.IPlan | any; // Keep compatibility if needed, but user in props might be User type
  loading?: boolean;
  onLogin?: () => void;
  onLogout?: () => void;
}

const paymentMethods = landingStrings.choosePlan.paymentMethods;

export default function ChoosePlan({
  user,
  loading,
  onLogin,
  onLogout,
}: ChoosePlanProps) {
  const searchParams = useSearchParams();
  const planQuery = searchParams.get("plan");
  const subscriptionId = searchParams.get("subscriptionId");
  const { data: session } = useSession();
  const authUser = session?.user;
  const {
    initializePayment,
    loading: paymentLoading,
    error: paymentError,
    PayPalComponent,
  } = customHooks.usePayment();

  // Transform API plan to ExtendedPlan format for compatibility
  const [selectedPlan, setSelectedPlan] = React.useState<plansTypes.ExtendedPlan | null>(null);
  const [subscriptionData, setSubscriptionData] = React.useState<any | null>(null);
  const [apiLoading, setApiLoading] = React.useState(false);
  const [apiError, setApiError] = React.useState<string | null>(null);

  // Payment gateways state
  const [paymentGateways, setPaymentGateways] = React.useState<any[]>([]);
  const [gatewaysLoading, setGatewaysLoading] = React.useState(false);
  const [gatewaysError, setGatewaysError] = React.useState<string | null>(null);

  // Fetch subscription by subscriptionId to get planSnapshot
  React.useEffect(() => {
    if (subscriptionId) {
      setApiLoading(true);
      setApiError(null);

      userSubscriptionAPI
        .getSubscriptionById(subscriptionId)
        .then((response) => {
          // Handle subscription response structure: { message, status, data: { subscription data } }
          const subscription = response.data?.data;
          if (!subscription || typeof subscription !== "object") {
            throw new Error("Invalid subscription response format");
          }
          if (!subscription.planSnapshot) {
            throw new Error(
              "Plan snapshot is missing from subscription response",
            );
          }

          // Store subscription data
          setSubscriptionData(subscription);

          // Extract plan data from planSnapshot
          const planSnapshot = subscription.planSnapshot;
          const currencyInfo = planSnapshot.currencyId || {};

          const transformedPlan: plansTypes.ExtendedPlan = {
            _id: planSnapshot._id || subscription.planName,
            id: planSnapshot._id || subscription.planName,
            name: planSnapshot.name,
            Plan_Name: planSnapshot.name,
            Plan_Type: planSnapshot.type,
            type: planSnapshot.type,
            price: planSnapshot.price || 0,
            totalPrice: planSnapshot.totalPrice,
            Total_Stores:
              planSnapshot.storeLimit === -1
                ? "Unlimited"
                : String(planSnapshot.storeLimit || 0),
            Price: String(planSnapshot.price || 0),
            Created_Date: subscription.createdAt
              ? new Date(subscription.createdAt).toLocaleDateString()
              : new Date().toLocaleDateString(),
            Status: String(subscription.status),
            Plan_Position: String(planSnapshot.storeLimit || 0),
            Discount_Type: planSnapshot.discountType || "None",
            Discount: String(planSnapshot.discount || 0),
            StaffLimit:
              planSnapshot.staffLimit === -1
                ? "Unlimited"
                : planSnapshot.staffLimit,
            Pos_Theme: (planSnapshot.themes || []).join(", "),
            Modules: planSnapshot.modules || [],
            Is_Recommended: (planSnapshot.storeLimit || 0) > 1,
            Description: planSnapshot.description || "",
            color: getPlanColor(planSnapshot.storeLimit || 0),
            textColor: getPlanTextColor(planSnapshot.storeLimit || 0),
            features: generateFeatures({
              storeLimit: planSnapshot.storeLimit,
              staffLimit: planSnapshot.staffLimit,
              modules: planSnapshot.modules || [],
              themes: planSnapshot.themes || [],
              description: planSnapshot.description,
            } as HomeTypes.IPlan),
            max_locations: planSnapshot.storeLimit,
            max_users: planSnapshot.staffLimit,
            support_level: getSupportLevel(planSnapshot.storeLimit || 0),
            popular: planSnapshot.storeLimit === 3,
            isRecommended: (planSnapshot.storeLimit || 0) > 1,
            posTheme: (planSnapshot.themes || [])[0] || "Classic",
            planPosition: planSnapshot.storeLimit,
            discountType: planSnapshot.discountType,
            discount: planSnapshot.discount || 0,
            annual_price:
              planSnapshot.type === "Yearly"
                ? planSnapshot.price || 0
                : (planSnapshot.price || 0) * 12,
            duration: String(planSnapshot.duration || ""),
            createdAt: subscription.createdAt,
            updatedAt: subscription.updatedAt,
            storeLimit: planSnapshot.storeLimit,
            staffLimit: planSnapshot.staffLimit,
            themes: planSnapshot.themes || [],
            modules: planSnapshot.modules || [],
            tax: planSnapshot.tax,
            description: planSnapshot.description,
            status: subscription.status,
            currencyId:
              typeof currencyInfo === "object" && currencyInfo._id
                ? currencyInfo._id
                : currencyInfo,
            currency:
              typeof currencyInfo === "object" && currencyInfo.currencySymbol
                ? {
                    symbol: currencyInfo.currencySymbol,
                    code: currencyInfo.currencyCode || "USD",
                    position: (currencyInfo.currencyPosition || "Left") as
                      | "Left"
                      | "Right",
                  }
                : undefined,
          };
          setSelectedPlan(transformedPlan);
        })
        .catch((error) => {
          console.error("ChoosePlan: Error fetching subscription:", error);
          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            "Failed to fetch subscription details";
          setApiError(errorMessage);
        })
        .finally(() => {
          setApiLoading(false);
        });
    }
  }, [subscriptionId]);

  // Call payment gateways API when component loads
  React.useEffect(() => {
    const fetchPaymentGateways = async () => {
      try {
        setGatewaysLoading(true);
        setGatewaysError(null);

        const response = await paymentGatewaysAPI.getAll();

        // Handle the response structure: { data: [...] }
        const gateways = response.data?.data || response.data || [];
        setPaymentGateways(gateways);

        // Log available payment methods
        const enabledGateways = gateways.filter(
          (gateway: any) => gateway.enabled,
        );
      } catch (error: any) {
        console.error("Error fetching payment gateways:", error);
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch payment gateways";
        setGatewaysError(errorMessage);
        toast.error(`Payment gateways error: ${errorMessage}`);
      } finally {
        setGatewaysLoading(false);
      }
    };

    fetchPaymentGateways();
  }, []);

  // Fetch dynamic coupon data from API
  React.useEffect(() => {
    const fetchCoupons = async () => {
      // Extract plan ID from subscription data or planQuery
      let planIdString: string | null = null;

      // Try to get planId from subscriptionData.planName
      if (subscriptionData?.planName) {
        if (typeof subscriptionData.planName === "string") {
          planIdString = subscriptionData.planName.trim();
        } else if (
          typeof subscriptionData.planName === "object" &&
          subscriptionData.planName !== null
        ) {
          // If planName is an object, try to get _id from it
          planIdString = (subscriptionData.planName as any)?._id
            ? String((subscriptionData.planName as any)._id)
            : null;
        }
      }

      // Fallback to planQuery if not found
      if (!planIdString && planQuery) {
        if (typeof planQuery === "string") {
          planIdString = planQuery.trim();
        } else if (typeof planQuery === "object" && planQuery !== null) {
          // If planQuery is an object, try to get _id from it
          planIdString = (planQuery as any)?._id
            ? String((planQuery as any)._id)
            : null;
        }
      }

      // Validate planIdString - must be a non-empty string and not '[object Object]'
      if (
        !planIdString ||
        planIdString === "undefined" ||
        planIdString === "null" ||
        planIdString === "[object Object]" ||
        planIdString.length === 0
      ) {
        console.warn("Invalid planId for coupons API, skipping call:", {
          subscriptionDataPlanName: subscriptionData?.planName,
          planQuery,
          planIdString,
        });
        return;
      }

      try {
        setCouponsLoading(true);
        setCouponsError(null);

        const response = await publicAPI.getCoupons(planIdString);

        // Handle the response structure: { message, status, data: [...] }
        const couponsData = response.data?.data || [];
        setCoupons(couponsData);

      } catch (error: any) {
        console.error("Error fetching coupons:", error);
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch coupons";
        setCouponsError(errorMessage);
        toast.error(`Coupons error: ${errorMessage}`);
      } finally {
        setCouponsLoading(false);
      }
    };

    fetchCoupons();
  }, [subscriptionData, planQuery]);

  const [paymentMethod, setPaymentMethod] = React.useState("Razorpay");
  const [showTaxBreakdown, setShowTaxBreakdown] = React.useState(false);
  const [showDiscountBreakdown, setShowDiscountBreakdown] = React.useState(false);
  const [showCouponBreakdown, setShowCouponBreakdown] = React.useState(false);
  const [showTaxModal, setShowTaxModal] = React.useState(false);
  const [showDiscountModal, setShowDiscountModal] = React.useState(false);
  const [showCouponModal, setShowCouponModal] = React.useState(false);

  // Coupon state
  const [showCoupon, setShowCoupon] = React.useState(false);
  const [coupons, setCoupons] = React.useState<any[]>([]);
  const [selectedCoupon, setSelectedCoupon] = React.useState<any>(null);
  const [couponsLoading, setCouponsLoading] = React.useState(false);
  const [couponsError, setCouponsError] = React.useState<string | null>(null);
  const [effectiveTotalLoading, setEffectiveTotalLoading] = React.useState(false);
  const [effectiveTotals, setEffectiveTotals] = React.useState<{
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
    // MainUnit amounts for when coupon is applied
    subtotalMainUnit?: number;
    discountMainUnit?: number;
    taxMainUnit?: number;
    totalMainUnit?: number;
    couponApplied?: boolean;
  } | null>(null);

  // Log payment method changes
  React.useEffect(() => {
  }, [paymentMethod]);

  // Coupon handler functions
  const validateCoupon = (coupon: any) => {
    if (!coupon) return { valid: false, message: "Invalid coupon" };

    // Check if coupon is active
    if (!coupon.status) {
      return { valid: false, message: "Coupon is not active" };
    }

    // Check date validity
    const now = new Date();
    const startDate = new Date(coupon.start_date);
    const endDate = new Date(coupon.end_date);

    if (now < startDate) {
      return { valid: false, message: "Coupon is not yet active" };
    }

    if (now > endDate) {
      return { valid: false, message: "Coupon has expired" };
    }

    // Check if coupon is applicable for this plan
    let planIdString: string | null = null;

    // Try to get planId from subscriptionData.planName
    if (subscriptionData?.planName) {
      if (typeof subscriptionData.planName === "string") {
        planIdString = subscriptionData.planName.trim();
      } else if (
        typeof subscriptionData.planName === "object" &&
        subscriptionData.planName !== null
      ) {
        planIdString = (subscriptionData.planName as any)?._id
          ? String((subscriptionData.planName as any)._id)
          : null;
      }
    }

    // Fallback to planQuery if not found
    if (!planIdString && planQuery) {
      if (typeof planQuery === "string") {
        planIdString = planQuery.trim();
      } else if (typeof planQuery === "object" && planQuery !== null) {
        planIdString = (planQuery as any)?._id
          ? String((planQuery as any)._id)
          : null;
      }
    }

    // Validate planIdString
    if (
      coupon.applicableFor !== "all" &&
      planIdString &&
      planIdString !== "undefined" &&
      planIdString !== "null" &&
      planIdString !== "[object Object]" &&
      !coupon.plans?.includes(planIdString)
    ) {
      return { valid: false, message: "Coupon not applicable for this plan" };
    }

    // Check usage limits
    if (
      coupon.usageCount >= coupon.maxUsagePerUser &&
      coupon.maxUsagePerUser !== -1
    ) {
      return { valid: false, message: "Coupon usage limit reached" };
    }

    // Check minimum order amount
    if (selectedPlan && coupon.minOrderAmount > selectedPlan.price) {
      return { valid: false, message: "Minimum order amount not met" };
    }

    return { valid: true, message: "Valid coupon" };
  };

  const handleApplyCoupon = async (coupon: any) => {
    if (!subscriptionId) {
      toast.error("Subscription ID is missing. Cannot apply coupon.");
      return;
    }

    try {
      setEffectiveTotalLoading(true);

      // Call the apply coupon API
      const response = await publicAPI.applyCoupon(subscriptionId, coupon.code);

      // If API call is successful, set the selected coupon
      setSelectedCoupon(coupon);

      // Immediately fetch effective totals after applying coupon
      try {
        const totalsRes = await publicAPI.getEffectiveTotal(subscriptionId);
        const data = totalsRes.data?.data || totalsRes.data || {};

        // Use MainUnit amounts when coupon is applied, fallback to smallest unit amounts
        const subtotal = Number(
          data.amountAfterCouponMainUnit ??
            data.originalAmountMainUnit ??
            data.subtotal ??
            data.subTotal ??
            data.baseAmount ??
            selectedPlan?.price ??
            0,
        );
        const discount = Number(
          data.discountAmountMainUnit ??
            data.discount ??
            data.discountAmount ??
            data.couponDiscount ??
            0,
        );
        const tax = Number(
          data.taxAmountMainUnit ?? data.tax ?? data.taxAmount ?? 0,
        );
        const total = Number(
          data.finalAmountMainUnit ??
            data.total ??
            data.totalAmount ??
            subtotal - discount + tax,
        );

        const effectiveTotalsData = {
          subtotal,
          discount,
          tax,
          total,
          // Store MainUnit amounts for reference
          subtotalMainUnit:
            data.amountAfterCouponMainUnit ?? data.originalAmountMainUnit,
          discountMainUnit: data.discountAmountMainUnit,
          taxMainUnit: data.taxAmountMainUnit,
          totalMainUnit: data.finalAmountMainUnit,
          couponApplied: data.couponApplied ?? true,
        };

        setEffectiveTotals(effectiveTotalsData);
      } catch (etErr: any) {
        console.error("Error fetching effective totals:", etErr);
        // Do not block UX if totals fetch fails; keep fallback UI
      }

      toast.success("Coupon applied successfully!");
    } catch (error: any) {
      console.error("Error applying coupon:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to apply coupon";
      toast.error(`Coupon application failed: ${errorMessage}`);
    } finally {
      setEffectiveTotalLoading(false);
    }
  };

  const handleRemoveCoupon = async () => {
    if (!subscriptionId) {
      toast.error("Subscription ID is missing. Cannot remove coupon.");
      return;
    }

    try {
      setEffectiveTotalLoading(true);

      // Call the remove coupon API
      const response = await publicAPI.removeCoupon(subscriptionId);

      // If API call is successful, clear the selected coupon
      setSelectedCoupon(null);

      // Refresh effective totals after removal (may return base totals)
      try {
        const totalsRes = await publicAPI.getEffectiveTotal(subscriptionId);
        const data = totalsRes.data?.data || totalsRes.data || {};

        // After removing coupon, use original amounts (MainUnit if available, otherwise smallest unit)
        const subtotal = Number(
          data.originalAmountMainUnit ??
            data.subtotal ??
            data.subTotal ??
            data.baseAmount ??
            selectedPlan?.price ??
            0,
        );
        const discount = Number(
          data.discountAmountMainUnit ??
            data.discount ??
            data.discountAmount ??
            data.couponDiscount ??
            0,
        );
        const tax = Number(
          data.taxAmountMainUnit ?? data.tax ?? data.taxAmount ?? 0,
        );
        const total = Number(
          data.finalAmountMainUnit ??
            data.total ??
            data.totalAmount ??
            subtotal - discount + tax,
        );

        const effectiveTotalsData = {
          subtotal,
          discount,
          tax,
          total,
          // Store MainUnit amounts for reference
          subtotalMainUnit: data.originalAmountMainUnit,
          discountMainUnit: data.discountAmountMainUnit,
          taxMainUnit: data.taxAmountMainUnit,
          totalMainUnit: data.finalAmountMainUnit,
          couponApplied: data.couponApplied ?? false,
        };

        setEffectiveTotals(effectiveTotalsData);
      } catch (etErr: any) {
        console.error("Error fetching effective totals after removal:", etErr);
        // If backend no longer has effective totals, clear to fall back to local calc
        setEffectiveTotals(null);
      }

      toast.success("Coupon removed successfully!");
    } catch (error: any) {
      console.error("Error removing coupon:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to remove coupon";
      toast.error(`Coupon removal failed: ${errorMessage}`);
    } finally {
      setEffectiveTotalLoading(false);
    }
  };

  // Helper function to get currency from subscription or plan
  const getCurrency = () => {
    const planSnapshot = subscriptionData?.planSnapshot;
    const currencyInfo = planSnapshot?.currencyId;
    if (
      currencyInfo &&
      typeof currencyInfo === "object" &&
      "currencySymbol" in currencyInfo
    ) {
      return {
        symbol:
          currencyInfo.currencySymbol || selectedPlan?.currency?.symbol || "$",
        code:
          currencyInfo.currencyCode || selectedPlan?.currency?.code || "USD",
        position: (currencyInfo.currencyPosition ||
          selectedPlan?.currency?.position ||
          "Left") as "Left" | "Right",
      };
    }
    return (
      selectedPlan?.currency || {
        symbol: "$",
        code: "USD",
        position: "Left" as const,
      }
    );
  };

  // Handle payment submission
  const handlePayment = async () => {
    if (!selectedPlan || !authUser) {
      toast.error("Please select a plan and ensure you are logged in.");
      return;
    }

    if (!subscriptionId) {
      toast.error(
        "Subscription ID is missing. Please go back to the landing page and try again.",
      );
      return;
    }

    if (!selectedPlan.currencyId) {
      toast.error("Currency information is missing. Please try again.");
      return;
    }

    try {
      // Get gateway credentials for the selected payment method
      const selectedGateway = paymentGateways.find(
        (gateway: any) =>
          gateway.provider.toLowerCase() === paymentMethod.toLowerCase(),
      );

      // Check if the selected gateway is enabled and has required credentials
      if (!selectedGateway) {
        toast.error(
          `Payment method "${paymentMethod}" is not available. Please select a different payment method.`,
        );
        return;
      }

      if (!selectedGateway.enabled) {
        toast.error(
          `Payment method "${paymentMethod}" is currently disabled. Please select a different payment method.`,
        );
        return;
      }

      // For PayPal, check if Client ID is configured
      if (paymentMethod.toLowerCase() === "paypal") {
        const hasClientId =
          selectedGateway.credentials?.clientId ||
          "AVWcpfi4dgZWzvQRMn0LqId1zdvR31geNtwhhNTpmH6YQ6uzfTYpY1telJ_8KpiUpQIpnUBTouehJi0X";
        if (!hasClientId) {
          toast.error(
            "PayPal Client ID is not configured. Please contact administrator to configure PayPal credentials.",
          );
          return;
        }
      }

      const currentCurrency = getCurrency();
      await initializePayment({
        subscriptionId: subscriptionId,
        paymentProvider: paymentMethod.toLowerCase(),
        currencyId: selectedPlan.currencyId,
        gatewayCredentials: selectedGateway.credentials || {},
        amount: displayTotal, // Use the final total amount (including coupon discount and tax)
        currency: currentCurrency.code || "USD",
      });
    } catch (error) {
      console.error("Payment initialization failed:", error);
      toast.error("Failed to initialize payment. Please try again.");
    }
  };

  // Helper functions for plan transformation
  const getPlanColor = (storeLimit: number): string => {
    if (!storeLimit || storeLimit === 0) return "bg-gray-500";
    if (storeLimit === 1) return "bg-orange-500";
    if (storeLimit === 3) return "bg-green-500";
    return "bg-red-500";
  };

  const getPlanTextColor = (storeLimit: number): string => {
    if (!storeLimit || storeLimit === 0) return "text-gray-600";
    if (storeLimit === 1) return "text-orange-600";
    if (storeLimit === 3) return "text-green-600";
    return "text-red-600";
  };

  const getSupportLevel = (storeLimit: number): string => {
    if (!storeLimit || storeLimit === 0) return "Basic";
    if (storeLimit === 1) return "Basic";
    if (storeLimit === 3) return "Priority";
    return "Enterprise";
  };

  const generateFeatures = (plan: HomeTypes.IPlan): string[] => {
    const features = [];

    const storeLimit = plan.storeLimit || 0;
    const staffLimit = plan.staffLimit || 0;
    const modules = plan.modules || [];
    const themes = plan.themes || [];

    if (storeLimit === 1) {
      features.push(`Up to ${storeLimit} location`);
    } else if (storeLimit === -1) {
      features.push("Unlimited locations");
    } else {
      features.push(`Up to ${storeLimit} locations`);
    }

    if (staffLimit === 1) {
      features.push(`${staffLimit} staff member`);
    } else if (staffLimit === -1) {
      features.push("Unlimited staff members");
    } else {
      features.push(`Up to ${staffLimit} staff members`);
    }

    features.push(`${modules.length} modules included`);

    if (themes.length > 0) {
      features.push(`${themes.length} POS themes`);
    }

    if (plan.description) {
      features.push("Custom branding");
    }

    return features;
  };

  // Calculate tax and discount based on planSnapshot from subscription
  const calculateTax = () => {
    if (!selectedPlan) return null;

    // Use planSnapshot data from subscription if available
    if (subscriptionData?.planSnapshot) {
      const planSnapshot = subscriptionData.planSnapshot;
      if (
        planSnapshot.tax &&
        typeof planSnapshot.tax === "object" &&
        "value" in planSnapshot.tax
      ) {
        const tax = planSnapshot.tax as {
          type: string;
          value: number;
          name: string;
        };
        if (tax.type === "Percentage") {
          const taxRate = tax.value;
          // For percentage tax, calculate on price (before discount)
          const taxAmount = +(planSnapshot.price * (taxRate / 100)).toFixed(2);
          return { taxAmount, taxRate, taxTitle: tax.name || "Tax" };
        } else if (tax.type === "Fixed") {
          // For fixed tax, use the value directly from planSnapshot
          const taxAmount = tax.value;
          const taxRate = 0;
          return { taxAmount, taxRate, taxTitle: tax.name || "Tax" };
        }
      }
    }

    // Fallback to plan tax information
    if (
      selectedPlan.tax &&
      typeof selectedPlan.tax === "object" &&
      "value" in selectedPlan.tax
    ) {
      const tax = selectedPlan.tax as {
        type: string;
        value: number;
        name: string;
      };
      if (tax.type === "Percentage") {
        const taxRate = tax.value;
        const taxAmount = +(selectedPlan.price * (taxRate / 100)).toFixed(2);
        return { taxAmount, taxRate, taxTitle: tax.name || "Tax" };
      } else if (tax.type === "Fixed") {
        const taxAmount = tax.value;
        const taxRate = 0;
        return { taxAmount, taxRate, taxTitle: tax.name || "Tax" };
      }
    }

    // No tax available - return null instead of fallback
    return null;
  };

  // Show loading state while fetching plans
  if (apiLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 pt-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Fetching plan details from API...
          </p>
        </div>
      </div>
    );
  }

  // Show error state
  if (apiError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 pt-20">
        <div className="text-center">
          <div className="text-red-500 text-2xl mb-4">⚠️</div>
          <p className="text-gray-600 dark:text-gray-400">
            Failed to load plans. Please try again later.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {apiError}
          </p>
          <div className="mt-6">
            <Link
              href="/#pricing"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              View Pricing Plans
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Show empty state when no subscription ID is provided
  if (!subscriptionId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 pt-20">
        <div className="text-center">
          <div className="text-gray-400 text-2xl mb-4">📋</div>
          <p className="text-gray-600 dark:text-gray-400">
            No subscription ID provided. Please choose a plan from the pricing
            section.
          </p>
          <div className="mt-6">
            <Link
              href="/#pricing"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              View Pricing Plans
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Show empty state when plan is not found
  if (!selectedPlan) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 pt-20">
        <div className="text-center">
          <div className="text-gray-400 text-2xl mb-4">📋</div>
          <p className="text-gray-600 dark:text-gray-400">
            Plan not found. Please choose a plan from the pricing section.
          </p>
          <div className="mt-6">
            <Link
              href="/#pricing"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              View Pricing Plans
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Get values from planSnapshot if available, otherwise from selectedPlan
  const planSnapshot = subscriptionData?.planSnapshot;
  const planPrice =
    planSnapshot?.price ?? (selectedPlan ? selectedPlan.price : 0);
  const discount = planSnapshot?.discount ?? selectedPlan?.discount ?? 0;
  const discountType =
    planSnapshot?.discountType ?? selectedPlan?.discountType ?? "None";
  const taxInfo = calculateTax();
  const taxAmount = taxInfo?.taxAmount ?? 0;
  const taxRate = taxInfo?.taxRate ?? 0;
  const taxTitle = taxInfo?.taxTitle ?? "Tax";
  const hasTax = taxInfo !== null;
  const totalPrice =
    planSnapshot?.totalPrice ??
    selectedPlan?.totalPrice ??
    planPrice + (hasTax ? taxAmount : 0);

  // Get currency info from planSnapshot first, then fallback to selectedPlan
  const currency = getCurrency();

  // Calculate discount amount based on discount type (Plan Discount - always shown separately)
  const calculatedDiscountAmount =
    discount > 0 && discountType
      ? discountType.toLowerCase() === "percentage"
        ? (planPrice * discount) / 100
        : discount // Fixed discount
      : 0;

  // Plan discount should always be the calculated discount amount (not affected by coupon)
  const displayDiscount = calculatedDiscountAmount;

  // Coupon discount amount (only when coupon is applied)
  const displayCouponDiscount =
    effectiveTotals && effectiveTotals.couponApplied
      ? effectiveTotals.discount
      : 0;

  // Calculate tax amount - tax is calculated on price after both discounts
  const priceAfterDiscount =
    planPrice - calculatedDiscountAmount - displayCouponDiscount;
  const calculatedTaxAmount =
    hasTax && taxInfo
      ? taxInfo.taxRate > 0
        ? (priceAfterDiscount * taxInfo.taxRate) / 100
        : taxInfo.taxAmount // Fixed tax
      : 0;

  // Use MainUnit amounts when coupon is applied, otherwise use calculated values
  const displayTaxAmount = effectiveTotals
    ? effectiveTotals.tax
    : calculatedTaxAmount;
  const displayTotal = effectiveTotals ? effectiveTotals.total : totalPrice;

  // For plan price display, use MainUnit amount when coupon is applied
  const displayPlanPrice =
    effectiveTotals && effectiveTotals.couponApplied
      ? (effectiveTotals.subtotalMainUnit ?? effectiveTotals.subtotal)
      : planPrice;

  // Get taxes as an array for the modal display
  const getTaxesForModal = () => {
    if (!hasTax || !taxInfo) return [];

    // Get the original tax object to access type and value
    let taxType = "Percentage";
    let taxValue = taxInfo.taxRate;

    if (
      subscriptionData?.planSnapshot?.tax &&
      typeof subscriptionData.planSnapshot.tax === "object" &&
      "type" in subscriptionData.planSnapshot.tax
    ) {
      const tax = subscriptionData.planSnapshot.tax as {
        type: string;
        value: number;
        name: string;
      };
      taxType = tax.type;
      taxValue = tax.value;
    } else if (
      selectedPlan?.tax &&
      typeof selectedPlan.tax === "object" &&
      "type" in selectedPlan.tax
    ) {
      const tax = selectedPlan.tax as {
        type: string;
        value: number;
        name: string;
      };
      taxType = tax.type;
      taxValue = tax.value;
    }

    // Use the displayed tax amount for consistency with the payment summary
    const taxAmountToShow = displayTaxAmount;

    return [
      {
        name: taxInfo.taxTitle,
        type: taxType,
        value: taxValue,
        rate: taxInfo.taxRate,
        amount: taxAmountToShow,
      },
    ];
  };

  // Get discount data for the modal display
  const getDiscountForModal = () => {
    if (discount <= 0) return null;

    return {
      type: discountType,
      value: discount,
      amount: displayDiscount,
      originalAmount: planPrice,
    };
  };

  // Get coupon data for the modal display
  const getCouponForModal = () => {
    if (!effectiveTotals || !effectiveTotals.couponApplied || !selectedCoupon)
      return null;

    // Use the displayCouponDiscount which already handles API values
    const couponDiscountAmount = displayCouponDiscount;

    return {
      code: selectedCoupon.code,
      description: selectedCoupon.description || "Special Discount",
      type: selectedCoupon.type,
      discountAmount: selectedCoupon.discount_amount,
      amount: couponDiscountAmount,
      originalAmount:
        effectiveTotals.subtotalMainUnit ??
        effectiveTotals.subtotal ??
        planPrice - calculatedDiscountAmount,
    };
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-slate-900 pt-20">
      <RazorpayConfigChecker />
      {/* Header with Back Button */}
      <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/#pricing"
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-slate-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors"
              >
                ← Back to Pricing
              </Link>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Choose Your Plan</h1>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Subscription ID: {subscriptionId}
              <br />
              <span className="text-xs">
                API: /admin/subscription/{subscriptionId} (getSubscriptionById)
                API: /admin/subscription/${subscriptionId} (getSubscriptionById)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Plan Details */}
      <div className="pt-8 flex flex-col lg:flex-row w-full max-w-7xl mx-auto mb-8 px-4 sm:px-6 lg:px-8 gap-8">
        {/* Selected Plan Card */}
        <aside className="w-full lg:w-96">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Selected Plan</h2>

            {/* Plan Details */}
            <div className="space-y-4">
              <div className="p-4 border-2 border-gray-200 dark:border-slate-700 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-4">
                    <div
                      className={`w-12 h-12 ${selectedPlan.color || "bg-gray-500"} rounded-lg flex items-center justify-center`}
                    >
                      <div className="w-6 h-6 bg-white rounded flex items-center justify-center"></div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-gray-900 dark:text-white">
                        {selectedPlan.Plan_Name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {selectedPlan.duration || selectedPlan.Plan_Type}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {currency.position === "Left"
                        ? `${currency.symbol}${totalPrice.toFixed(2)}`
                        : `${totalPrice.toFixed(2)}${currency.symbol}`}
                    </div>
                  </div>
                </div>

                {/* Plan Description */}
                {selectedPlan.Description && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {selectedPlan.Description}
                    </p>
                  </div>
                )}

                {/* Plan Features */}
                {selectedPlan.features && selectedPlan.features.length > 0 && (
                  <div className="mt-3">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Key Features:
                    </div>
                    <div className="space-y-1">
                      {selectedPlan.features.map((feature: string, index: number) => (
                        <div key={index} className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                          <span className="w-1 h-1 bg-green-500 rounded-full mr-2"></span>
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Plan Modules */}
                {selectedPlan.Modules && selectedPlan.Modules.length > 0 && (
                  <div className="mt-3">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Included Modules:
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {selectedPlan.Modules.map((module: string, index: number) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs text-gray-600 dark:text-gray-400 rounded">
                          {module}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Plan Specifications */}
                <div className="mt-3">
                  <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex justify-between">
                      <span>POS Theme:</span>
                      <span>{selectedPlan.Pos_Theme}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Payment Section */}
        <section className="flex-1">
          <div className="space-y-6">
            {/* Payment Method Card */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-lg">💳</span>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {landingStrings.choosePlan.paymentMethod.title}
                </h2>
              </div>

              {/* Payment Gateways Status */}
              {gatewaysLoading && (
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    <span className="text-sm text-blue-800 dark:text-blue-200">
                      Loading available payment methods...
                    </span>
                  </div>
                </div>
              )}

              {gatewaysError && (
                <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-yellow-600 mr-2">⚠️</span>
                    <span className="text-sm text-yellow-800 dark:text-yellow-200">
                      Using default payment method. Error: {gatewaysError}
                    </span>
                  </div>
                </div>
              )}

              {/* User Authentication Check */}
              {!authUser ? (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <span className="text-yellow-400">⚠</span>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        Please log in to proceed with payment
                      </p>
                      <div className="mt-2">
                        <Link
                          href="/login"
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-yellow-800 bg-yellow-100 hover:bg-yellow-200 transition-colors"
                        >
                          Login
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <span className="text-green-400">✓</span>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-green-800 dark:text-green-200">
                        Logged in as: {authUser.email}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <select
                className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-3 text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-base appearance-none cursor-pointer"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                disabled={gatewaysLoading}
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: "right 0.75rem center",
                  backgroundRepeat: "no-repeat",
                  backgroundSize: "1.5em 1.5em",
                }}
              >
                {gatewaysLoading ? (
                  <option value="" className="text-gray-700 dark:text-gray-300">
                    Loading payment methods...
                  </option>
                ) : gatewaysError ? (
                  <option
                    value="Razorpay"
                    className="text-gray-700 dark:text-gray-300"
                  >
                    Razorpay (Default)
                  </option>
                ) : paymentGateways.length > 0 ? (
                  paymentGateways
                    .filter((gateway: any) => gateway.enabled)
                    .map((gateway: any, index: number) => (
                      <option key={gateway._id} value={gateway.provider} className="text-gray-700 dark:text-gray-300">
                        {gateway.provider.charAt(0).toUpperCase() + gateway.provider.slice(1)}
                      </option>
                    ))
                ) : (
                  <option
                    value="Razorpay"
                    className="text-gray-700 dark:text-gray-300"
                  >
                    Razorpay (Default)
                  </option>
                )}
              </select>

              {/* Configuration Status Indicator */}
              {paymentMethod.toLowerCase() === "paypal" &&
                (() => {
                  const paypalGateway = paymentGateways.find(
                    (gateway: any) =>
                      gateway.provider.toLowerCase() === "paypal",
                  );
                  const hasClientId =
                    paypalGateway?.credentials?.clientId ||
                    "AVWcpfi4dgZWzvQRMn0LqId1zdvR31geNtwhhNTpmH6YQ6uzfTYpY1telJ_8KpiUpQIpnUBTouehJi0X";
                  const isEnabled = paypalGateway?.enabled;

                  return (
                    <div
                      className={`mt-3 p-3 rounded-lg border ${
                        isEnabled && hasClientId
                          ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                          : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center ${
                            isEnabled && hasClientId
                              ? "bg-green-500"
                              : "bg-red-500"
                          }`}
                        >
                          <span className="text-white text-xs">
                            {isEnabled && hasClientId ? "✓" : "✗"}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p
                            className={`text-sm font-medium ${
                              isEnabled && hasClientId
                                ? "text-green-800 dark:text-green-200"
                                : "text-red-800 dark:text-red-200"
                            }`}
                          >
                            PayPal Configuration Status
                          </p>
                          <p
                            className={`text-xs mt-1 ${
                              isEnabled && hasClientId
                                ? "text-green-700 dark:text-green-300"
                                : "text-red-700 dark:text-red-300"
                            }`}
                          >
                            {!isEnabled
                              ? "PayPal is disabled in payment gateway settings"
                              : !hasClientId
                                ? "PayPal Client ID is not configured in gateway settings or environment"
                                : "PayPal is properly configured and ready to use"}
                          </p>
                        </div>
                      </div>
                      {(!isEnabled || !hasClientId) && (
                        <div className="mt-2 text-xs text-red-600 dark:text-red-400">
                          Contact administrator to configure PayPal in payment
                          gateway settings.
                        </div>
                      )}
                    </div>
                  );
                })()}
            </div>

            {/* Coupon Section */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setShowCoupon(!showCoupon)}
                className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-indigo-500/10 dark:bg-indigo-400/20 text-indigo-600 dark:text-indigo-300 flex items-center justify-center">
                    💠
                  </div>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">
                    Apply coupon
                  </span>
                </div>
                <svg
                  className={`w-4 h-4 text-gray-500 dark:text-gray-400 mr-1 transition-transform ${showCoupon ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {showCoupon && (
                <div className="px-6 pb-6 pt-2">
                  <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
                    {/* Coupons Loading State */}
                    {couponsLoading && (
                      <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                          <span className="text-sm text-blue-800 dark:text-blue-200">
                            Loading available coupons...
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Coupons Error State */}
                    {couponsError && (
                      <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <div className="flex items-center">
                          <span className="text-red-600 mr-2">⚠️</span>
                          <span className="text-sm text-red-800 dark:text-red-200">
                            Error loading coupons: {couponsError}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Available Coupons */}
                    {!couponsLoading && !couponsError && coupons.length > 0 && (
                      <div className="mb-4">
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                          Available Coupons:
                        </h3>
                        <div className="space-y-2">
                          {coupons.map((coupon: any, index: number) => {
                            const validation = validateCoupon(coupon);
                            const isValid = validation.valid;

                            return (
                              <div
                                key={coupon._id || index}
                                className={`rounded-md border border-dashed ${
                                  isValid
                                    ? "border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/20"
                                    : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/20"
                                }`}
                              >
                                <div className="flex items-stretch justify-between px-4 py-4">
                                  <div className="flex items-start gap-3">
                                    <input
                                      type="radio"
                                      name="coupon"
                                      checked={
                                        selectedCoupon?._id === coupon._id
                                      }
                                      onChange={() => handleApplyCoupon(coupon)}
                                      disabled={
                                        effectiveTotalLoading || !isValid
                                      }
                                      className={`mt-1 h-4 w-4 ${
                                        isValid
                                          ? "text-indigo-600 border-indigo-300 dark:border-indigo-700 accent-indigo-600 dark:accent-indigo-400 cursor-pointer"
                                          : "text-gray-400 border-gray-300 dark:border-gray-600 cursor-not-allowed"
                                      } disabled:opacity-50`}
                                    />
                                    <div>
                                      <div className="text-sm text-indigo-800 dark:text-indigo-200 font-medium">
                                        {coupon.description ||
                                          "Special Discount"}
                                      </div>
                                      <div className="text-sm mt-1 text-indigo-700 dark:text-indigo-300">
                                        <span className="mr-2 opacity-80">
                                          Code:
                                        </span>
                                        <span className="font-semibold text-indigo-900 dark:text-white">
                                          {coupon.code}
                                        </span>
                                      </div>
                                      <div className="text-xs mt-1 text-indigo-600 dark:text-indigo-400">
                                        Discount:{" "}
                                        {coupon.type === "Percentage"
                                          ? `${coupon.discount_amount}%`
                                          : `${coupon.discount_amount} ${currency.symbol}`}
                                      </div>
                                      {coupon.minOrderAmount > 0 && (
                                        <div className="text-xs mt-1 text-indigo-600 dark:text-indigo-400">
                                          Min. Order:{" "}
                                          {currency.position === "Left"
                                            ? `${currency.symbol}${coupon.minOrderAmount}`
                                            : `${coupon.minOrderAmount}${currency.symbol}`}
                                        </div>
                                      )}
                                      <div className="text-xs mt-1 text-indigo-600 dark:text-indigo-400">
                                        Usage: {coupon.usageCount}/
                                        {coupon.maxUsagePerUser === -1
                                          ? "∞"
                                          : coupon.maxUsagePerUser}{" "}
                                        per user
                                      </div>
                                      <div className="text-xs mt-1 text-indigo-600 dark:text-indigo-400">
                                        Valid:{" "}
                                        {new Date(
                                          coupon.start_date,
                                        ).toLocaleDateString()}{" "}
                                        -{" "}
                                        {new Date(
                                          coupon.end_date,
                                        ).toLocaleDateString()}
                                      </div>
                                      {!isValid && (
                                        <div className="text-xs mt-1 text-red-600 dark:text-red-400 font-medium">
                                          {validation.message}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (selectedCoupon?._id === coupon._id) {
                                        handleRemoveCoupon();
                                      } else {
                                        handleApplyCoupon(coupon);
                                      }
                                    }}
                                    disabled={effectiveTotalLoading || !isValid}
                                    className={`font-medium transition-colors disabled:opacity-50 ${
                                      selectedCoupon?._id === coupon._id
                                        ? "text-red-500 hover:text-red-400"
                                        : isValid
                                          ? "text-indigo-500 hover:text-indigo-400"
                                          : "text-gray-400 cursor-not-allowed"
                                    }`}
                                  >
                                    {effectiveTotalLoading ? (
                                      <div className="flex items-center space-x-1">
                                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                                        <span>Processing...</span>
                                      </div>
                                    ) : selectedCoupon?._id === coupon._id ? (
                                      "Remove"
                                    ) : isValid ? (
                                      "Apply"
                                    ) : (
                                      "Not Valid"
                                    )}
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* No Coupons Available */}
                    {!couponsLoading &&
                      !couponsError &&
                      coupons.length === 0 && (
                        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                          <div className="text-center">
                            <span className="text-gray-400 text-2xl mb-2 block">
                              🎫
                            </span>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              No coupons available for this plan
                            </p>
                          </div>
                        </div>
                      )}

                    {/* Manual Coupon Input (Optional) */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Or enter coupon code manually:
                      </label>
                      <input
                        type="text"
                        placeholder="Enter coupon code..."
                        className="w-full px-4 py-3 rounded-md bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-400 border border-dashed border-indigo-300 dark:border-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        disabled={couponsLoading}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Summary Card */}
            <div className="bg-slate-800 dark:bg-slate-900 rounded-lg shadow-sm border border-slate-700 dark:border-slate-600 p-6">
              <h2 className="text-2xl font-bold text-white mb-6">
                Payment Details
              </h2>

              <div className="space-y-4">
                {/* Amount - Always shown first */}
                <div className="flex justify-between items-center">
                  <span className="text-white">Amount</span>
                  <span className="text-white">
                    {currency.position === "Left"
                      ? `${currency.symbol}${planPrice.toFixed(2)}`
                      : `${planPrice.toFixed(2)}${currency.symbol}`}
                  </span>
                </div>

                {/* Discount - Always show if discount exists */}
                {discount > 0 && (
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-white">Discount</span>
                      <div
                        className="w-4 h-4 rounded-full bg-gray-400 flex items-center justify-center cursor-pointer hover:bg-gray-500 transition-colors"
                        title={`Discount ${discountType === "Percentage" ? `(${discount}%)` : `(${discountType})`}`}
                        onClick={() => setShowDiscountModal(true)}
                      >
                        <span className="text-white text-xs font-semibold">
                          i
                        </span>
                      </div>
                    </div>
                    <span className="text-white">
                      {currency.position === "Left"
                        ? `-${currency.symbol}${displayDiscount.toFixed(2)}`
                        : `-${displayDiscount.toFixed(2)}${currency.symbol}`}
                    </span>
                  </div>
                )}

                {/* Coupon Discount - Show only when coupon is applied */}
                {effectiveTotals &&
                  effectiveTotals.couponApplied &&
                  displayCouponDiscount > 0 && (
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-white">Coupon Discount</span>
                        <div
                          className="w-4 h-4 rounded-full bg-gray-400 flex items-center justify-center cursor-pointer hover:bg-gray-500 transition-colors"
                          title={`Coupon: ${selectedCoupon?.code || "N/A"}`}
                          onClick={() => setShowCouponModal(true)}
                        >
                          <span className="text-white text-xs font-semibold">
                            i
                          </span>
                        </div>
                      </div>
                      <span className="text-white">
                        {currency.position === "Left"
                          ? `-${currency.symbol}${displayCouponDiscount.toFixed(2)}`
                          : `-${displayCouponDiscount.toFixed(2)}${currency.symbol}`}
                      </span>
                    </div>
                  )}

                {/* Tax - Only show if tax exists */}
                {hasTax && (
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-white">Tax</span>
                      <div
                        className="w-4 h-4 rounded-full bg-gray-400 flex items-center justify-center cursor-pointer hover:bg-gray-500 transition-colors"
                        title={`${taxTitle} ${taxRate > 0 ? `(${taxRate}%)` : ""}`}
                        onClick={() => setShowTaxModal(true)}
                      >
                        <span className="text-white text-xs font-semibold">
                          i
                        </span>
                      </div>
                    </div>
                    <span className="text-red-500">
                      {currency.position === "Left"
                        ? `+${currency.symbol}${displayTaxAmount.toFixed(2)}`
                        : `+${displayTaxAmount.toFixed(2)}${currency.symbol}`}
                    </span>
                  </div>
                )}

                {/* Total */}
                <div className="flex justify-between items-center">
                  <span className="text-white">Total</span>
                  <span className="text-white">
                    {currency.position === "Left"
                      ? `${currency.symbol}${displayTotal.toFixed(2)}`
                      : `${displayTotal.toFixed(2)}${currency.symbol}`}
                  </span>
                </div>

                {/* Separator Line */}
                <div className="border-t border-gray-500 my-2"></div>

                {/* Total Payment */}
                <div className="flex justify-between items-center">
                  <span className="text-white font-bold">Total Payment</span>
                  <span className="text-white font-bold">
                    {currency.position === "Left"
                      ? `${currency.symbol}${displayTotal.toFixed(2)}`
                      : `${displayTotal.toFixed(2)}${currency.symbol}`}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Error Display */}
            {paymentError && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <span className="text-red-400">⚠</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-800 dark:text-red-200">
                      {paymentError}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Section */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="font-medium">
                    {landingStrings.choosePlan.actionSection.secureCheckout}
                  </span>
                </div>
                <button
                  onClick={handlePayment}
                  disabled={!authUser || paymentLoading}
                  className={`px-8 py-3 rounded-lg font-semibold text-lg transition-all duration-200 w-full sm:w-auto ${
                    authUser && !paymentLoading
                      ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md"
                      : "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {paymentLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Processing...</span>
                    </div>
                  ) : !authUser ? (
                    "Please Login to Continue"
                  ) : (
                    "Proceed to Payment"
                  )}
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* PayPal Payment Modal */}
      {PayPalComponent}

      {/* Configuration Checkers */}
      <RazorpayConfigChecker />
      {paymentMethod.toLowerCase() === "paypal" && <PayPalConfigChecker />}

      {/* Tax Modal */}
      {showTaxModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowTaxModal(false)}
        >
          <div
            className="bg-slate-900 rounded-lg shadow-xl max-w-md w-full mx-4 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowTaxModal(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
              aria-label="Close"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Modal Header */}
            <div className="px-6 pt-6 pb-4">
              <h2 className="text-xl font-bold text-white text-center">
                Applied Taxes
              </h2>
            </div>

            {/* Modal Content */}
            <div className="px-6 pb-6">
              {getTaxesForModal().length > 0 ? (
                <div className="space-y-0">
                  {getTaxesForModal().map((tax, index) => {
                    // Format tax value based on type (percentage or fixed)
                    const isPercentage =
                      tax.type?.toLowerCase() === "percentage";
                    const taxValueDisplay = isPercentage
                      ? `(${tax.value}%)`
                      : `(${currency.position === "Left" ? `${currency.symbol}${tax.value}` : `${tax.value}${currency.symbol}`})`;

                    return (
                      <div key={index}>
                        <div className="flex justify-between items-center py-4">
                          <span className="text-white">
                            {tax.name} {taxValueDisplay}
                          </span>
                          <span className="text-white">
                            {currency.position === "Left"
                              ? `${currency.symbol}${tax.amount.toFixed(2)}`
                              : `${tax.amount.toFixed(2)}${currency.symbol}`}
                          </span>
                        </div>
                        {index < getTaxesForModal().length - 1 && (
                          <div className="border-t border-gray-600"></div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-4 text-center text-white">
                  No taxes applied
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Discount Modal */}
      {showDiscountModal && getDiscountForModal() && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowDiscountModal(false)}
        >
          <div
            className="bg-slate-900 rounded-lg shadow-xl max-w-md w-full mx-4 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowDiscountModal(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
              aria-label="Close"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Modal Header */}
            <div className="px-6 pt-6 pb-4">
              <h2 className="text-xl font-bold text-white text-center">
                Applied Discount
              </h2>
            </div>

            {/* Modal Content */}
            <div className="px-6 pb-6">
              {(() => {
                const discountData = getDiscountForModal();
                if (!discountData) return null;

                // Format discount value based on type (percentage or fixed)
                const isPercentage =
                  discountData.type?.toLowerCase() === "percentage";
                const discountValueDisplay = isPercentage
                  ? `(${discountData.value}%)`
                  : `(${currency.position === "Left" ? `${currency.symbol}${discountData.value}` : `${discountData.value}${currency.symbol}`})`;

                return (
                  <div className="space-y-0">
                    <div className="flex justify-between items-center py-4">
                      <span className="text-white">
                        Discount{discountValueDisplay}
                      </span>
                      <span className="text-white">
                        {currency.position === "Left"
                          ? `${currency.symbol}${discountData.amount.toFixed(2)}`
                          : `${discountData.amount.toFixed(2)}${currency.symbol}`}
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Coupon Modal */}
      {showCouponModal && getCouponForModal() && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowCouponModal(false)}
        >
          <div
            className="bg-slate-900 rounded-lg shadow-xl max-w-md w-full mx-4 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowCouponModal(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
              aria-label="Close"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Modal Header */}
            <div className="px-6 pt-6 pb-4">
              <h2 className="text-xl font-bold text-white text-center">
                Applied Coupon
              </h2>
            </div>

            {/* Modal Content */}
            <div className="px-6 pb-6">
              {(() => {
                const couponData = getCouponForModal();
                if (!couponData) return null;

                // Format coupon discount value based on type (percentage or fixed)
                const isPercentage =
                  couponData.type?.toLowerCase() === "percentage";
                const couponValueDisplay = isPercentage
                  ? `(${couponData.discountAmount}%)`
                  : `(${currency.position === "Left" ? `${currency.symbol}${couponData.discountAmount}` : `${couponData.discountAmount}${currency.symbol}`})`;

                return (
                  <div className="space-y-0">
                    <div className="flex justify-between items-center py-4">
                      <span className="text-white">
                        Coupon Discount{couponValueDisplay}
                      </span>
                      <span className="text-white">
                        {currency.position === "Left"
                          ? `${currency.symbol}${couponData.amount.toFixed(2)}`
                          : `${couponData.amount.toFixed(2)}${currency.symbol}`}
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

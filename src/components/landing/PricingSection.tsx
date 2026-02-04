"use client"
import React from "react";
import Link from "next/link";
import { Star, Zap, Crown, Sparkles, ArrowRight, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { WebComponents } from "@/components";
import { landingStrings } from "@/constant/common";
import { userSubscriptionAPI } from "@/lib/api";
import { generateUUID } from "@/utils/uuid";
import { HomeTypes } from "@/types";

interface PricingSectionProps {
  plans: HomeTypes.IPlan[];
  loading?: boolean;
  error?: string | null;
  initialTrialDays?: number;
}

export default function PricingSection({ plans, loading = false, error = null, initialTrialDays }: PricingSectionProps) {
  const router = useRouter();
  const [isAnnual, setIsAnnual] = React.useState(false);
  const [hoveredPlan, setHoveredPlan] = React.useState<string | number | null>(null);
  const [processingPlan, setProcessingPlan] = React.useState<string | number | null>(null);

  // Use only SSR data for trial days, no client-side API calls
  const trialDays = initialTrialDays || 7; // Default to initial or 7 days

  // Handle Choose Plan click with API call
  const handleChoosePlan = async (plan: HomeTypes.IPlan) => {
    const planId = plan._id;
    if (!planId) {
      console.error('Plan ID is missing');
      return;
    }
    try {
      setProcessingPlan(planId);

      // Call the user/subscriptions API
      const correlationId = generateUUID();

      const subscriptionResponse = await userSubscriptionAPI.createSubscription({
        planId: String(planId),
        amount: plan.totalPrice ?? plan.price,
        currency: 'USD',
        paymentMethod: 'Razorpay',
        correlationId: correlationId,
      });

      // Show success notification
      toast.success(`Subscription created for ${plan.name}`);

      // After successful API call, redirect to choose plan page with subscription ID
      setTimeout(() => {
        // Handle new API response structure: { message: "...", data: { _id: "...", ... } }
        const subscriptionId = subscriptionResponse.data?.data?._id || subscriptionResponse.data?._id;
        router.push(`/chooseplan?plan=${String(planId)}&subscriptionId=${subscriptionId}`);
      }, 1000);
    } catch (error: unknown) {
      console.error('Error creating subscription:', error);

      // Extract error message from backend response
      const errorMessage = (error as { response?: { data?: { message?: string }; status?: number }; message?: string })?.response?.data?.message || (error as { message?: string })?.message || 'Failed to create subscription';

      // Check if user already has an active subscription for this plan
      if ((error as { response?: { status?: number; data?: { message?: string } } })?.response?.status === 400 && (error as { response?: { data?: { message?: string } } })?.response?.data?.message?.includes('already have')) {
        toast.error(errorMessage);
        // Don't redirect to chooseplan page if user already has this plan
        return;
      }

      // For other errors, show error message but still redirect (fallback behavior)
      toast.error(errorMessage);
      setTimeout(() => {
        router.push(`/chooseplan?plan=${String(planId)}`);
      }, 2000);
    } finally {
      setProcessingPlan(null);
    }
  };

  // Filter plans based on toggle selection
  const filteredPlans = plans.filter(plan => {
    if (isAnnual) {
      // Show only yearly plans when annual toggle is selected
      return plan.type?.toLowerCase() === 'yearly' || plan.type?.toLowerCase() === 'annual';
    } else {
      // Show only monthly plans when monthly toggle is selected
      return plan.type?.toLowerCase() === 'monthly';
    }
  });

  const getPlanIcon = (index: number) => {
    const icons = [Star, Zap, Crown];
    const IconComponent = icons[index % icons.length];
    return <IconComponent className="w-5 h-5" />;
  };

  const getPlanGradient = (index: number, isPopular: boolean) => {
    if (isPopular) {
      return "from-blue-500 via-purple-500 to-indigo-600";
    }
    const gradients = [
      "from-slate-400 to-slate-600",
      "from-emerald-400 to-cyan-500",
      "from-orange-400 to-pink-500"
    ];
    return gradients[index % gradients.length];
  };

  if (loading) {
    return (
      <section className="py-10 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-slate-300 dark:bg-slate-600 rounded w-64 mx-auto mb-4" />
              <div className="h-4 bg-slate-300 dark:bg-slate-600 rounded w-96 mx-auto" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-10 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto">
          <div className="text-center">
            <div className="text-red-600 dark:text-red-400 mb-4">
              <p>Failed to load plans: {error}</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!plans || plans.length === 0) {
    return (
      <section className="py-10 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto">
          <div className="text-center">
            <div className="text-gray-500 dark:text-slate-400">
              <p>No plans available at the moment.</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 relative overflow-hidden">

      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/10 dark:bg-blue-400/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400/10 dark:bg-purple-400/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-400/5 dark:bg-indigo-400/2 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          {/* Pricing Label */}
          <div className="font-caveat text-primary dark:text-blue-400 text-[22px] leading-[32px] mb-2">
            Pricing
          </div>

          {/* Main Heading */}
          <h2 className="text-4xl font-bold mb-4">
            <span className="text-gray-800 dark:text-white">Choose Your Perfect </span>
            <span className="text-blue-500 dark:text-blue-400">Plan</span>
          </h2>

          {/* Subtitle */}
          <p className="font-interTight text-[18px] leading-[28px] font-normal text-textSmall dark:text-slate-400 max-w-3xl mx-auto mb-8">
            {landingStrings.pricing.subtitle}
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center bg-white dark:bg-slate-800 rounded-full p-1 shadow-lg border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${!isAnnual
                ? "bg-blue-600 text-white shadow-md"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
            >
              {landingStrings.common.monthly}
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 ${isAnnual
                ? "bg-blue-600 text-white shadow-md"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
            >
              {landingStrings.common.annual}
              <span className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full text-xs font-semibold">
                {landingStrings.common.saveUpTo}
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className={`${filteredPlans.length > 3
          ? "flex overflow-x-auto gap-8 pb-4 px-4 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent scroll-smooth"
          : "grid grid-cols-1 md:grid-cols-3 gap-8"
          } max-w-6xl mx-auto mt-20`}>
          {filteredPlans.map((plan, index) => {
            const planPrice = plan.totalPrice ?? plan.price ?? 0;
            const isYearlyPlan = plan.type?.toLowerCase() === 'yearly' || plan.type?.toLowerCase() === 'annual';
            const isMonthlyPlan = plan.type?.toLowerCase() === 'monthly';

            // Always format planPrice (which uses totalPrice when available, otherwise price)
            const formattedPrice = plan.formattedPrice || planPrice.toFixed(2);

            // Get currency symbol and position from API with fallbacks
            const currencySymbol = plan.currency?.symbol || '$';
            const currencyPosition = plan.currency?.position || 'Left';

            // Format price with currency symbol based on position
            const displayPrice = currencyPosition === 'Left'
              ? `${currencySymbol}${formattedPrice}`
              : `${formattedPrice}${currencySymbol}`;

            // Calculate monthly equivalent for yearly plans to show savings
            const monthlyEquivalent = isYearlyPlan ? planPrice / 12 : planPrice;
            const monthlySavings = isYearlyPlan && isMonthlyPlan ? Math.round(monthlyEquivalent - planPrice) : null;
            const isHovered = hoveredPlan === (plan.id || plan._id);

            return (
              <div
                key={plan.id || plan._id}
                className={`relative flex flex-col h-full transition-all duration-500 hover:scale-105 group ${filteredPlans.length > 3
                  ? "min-w-[320px] max-w-[380px] flex-shrink-0"
                  : ""
                  }`}
                onMouseEnter={() => setHoveredPlan(plan.id || plan._id || null)}
                onMouseLeave={() => setHoveredPlan(null)}
              >
                {/* Most Popular Badge - moved outside overflow-hidden */}
                {plan.isMostPopular && (
                  <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 z-40 pointer-events-none">
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full font-semibold shadow-lg flex items-center gap-2 text-sm">
                      <Crown className="w-4 h-4" /> Most Popular
                    </span>
                  </div>
                )}
                {/* Main card */}
                <div className={`relative flex flex-col h-full bg-white/80 dark:bg-slate-800 rounded-3xl shadow-xl border-2 transition-all duration-500 overflow-hidden ${isHovered
                  ? "border-blue-500 shadow-2xl shadow-blue-500/20"
                  : "border-slate-200 dark:border-slate-700"
                  }`}>


                  {/* Card header */}
                  <div className="p-8 pb-6 text-center relative">
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                      {plan.name}
                    </h3>

                    <div className="mb-6">
                      <div className="flex items-baseline justify-center gap-2">
                        <span className="text-4xl font-bold text-slate-900 dark:text-white">
                          {displayPrice}
                        </span>
                        <span className="text-slate-500 dark:text-slate-400 font-medium">
                          /{isYearlyPlan ? "year" : "month"}
                        </span>
                      </div>

                      {/* Show monthly equivalent for yearly plans */}
                      {isYearlyPlan && (
                        <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                          {currencyPosition === 'Left'
                            ? `${currencySymbol}${Math.round(monthlyEquivalent)}`
                            : `${Math.round(monthlyEquivalent)}${currencySymbol}`}/month when billed annually
                        </div>
                      )}

                      {/* Show annual savings if applicable */}
                      {monthlySavings && monthlySavings > 0 && (
                        <div className="text-sm text-green-600 dark:text-green-400 mt-1 font-medium">
                          Save {currencyPosition === 'Left'
                            ? `${currencySymbol}${monthlySavings}`
                            : `${monthlySavings}${currencySymbol}`}/month with annual billing
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="px-8 pb-6 flex-1">
                    {plan.description && (
                      <div className="mb-8">
                        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                          {plan.description}
                        </p>
                      </div>
                    )}

                    {/* Modules */}
                    {plan.modules && plan.modules.length > 0 && (
                      <div className="mb-6 space-y-3 p-6 bg-slate-50/50 dark:bg-slate-700 rounded-xl border border-slate-200/50 dark:border-slate-600">
                        <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                          Modules:
                        </div>
                        <ul className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
                          {plan.modules.map((module, i) => (
                            <li key={i} className="flex items-center gap-2 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                              <span>{module}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Limits */}
                    <div className="space-y-3 p-6 bg-slate-50/50 dark:bg-slate-700 rounded-xl border border-slate-200/50 dark:border-slate-600">
                      <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                        Limits:
                      </div>
                      <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
                        <div className="flex items-center gap-2 whitespace-nowrap">
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                          <span className="text-slate-600 dark:text-slate-400">
                            {plan.storeLimit === -1 ? 'Unlimited' : plan.storeLimit} stores
                          </span>
                        </div>
                        <div className="flex items-center gap-2 whitespace-nowrap">
                          <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0"></div>
                          <span className="text-slate-600 dark:text-slate-400">
                            {plan.staffLimit === -1 ? 'Unlimited' : plan.staffLimit} users
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <div className="p-8 pt-6">
                    <WebComponents.UiWebComponents.UiWebComponents.Button
                      onClick={() => handleChoosePlan(plan)}
                      disabled={processingPlan === (plan.id || plan._id)}
                      className="font-interTight font-semibold text-xs sm:text-sm md:text-base lg:text-base xl:text-base 2xl:text-base leading-5 sm:leading-6 md:leading-7 lg:leading-7 xl:leading-[24px] 2xl:leading-[24px] w-full py-4 rounded-xl transition-all duration-300 group/btn"
                    >
                      <span className="flex items-center justify-center gap-2">
                        {processingPlan === (plan.id || plan._id) ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                            Processing...
                          </>
                        ) : (
                          <>
                            {planPrice === 0 ? landingStrings.common.startFreeTrial : landingStrings.common.choosePlan}
                            <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2 group-hover/btn:translate-x-1" />
                          </>
                        )}
                      </span>
                    </WebComponents.UiWebComponents.UiWebComponents.Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom section */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center gap-6 bg-white/60 dark:bg-slate-800 rounded-2xl px-8 py-4 shadow-lg border border-white/20 dark:border-slate-700">
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-black dark:text-white text-sm">{trialDays}-day free trial</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-black dark:text-white text-sm">No setup fees</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-black dark:text-white text-sm">24/7 support</span>
            </div>
          </div>

          <p className="text-slate-500 dark:text-slate-400 mt-6 text-sm">
            {landingStrings.common.needCustomSolution} <button className="text-blue-600 dark:text-blue-400 hover:underline font-medium">{landingStrings.common.contactSalesTeam}</button>
          </p>
        </div>

        {/* Explore in Details Button */}
        <div className="text-center pt-6 sm:pt-8 md:pt-12 lg:pt-16 xl:pt-20 2xl:pt-[60px]">
          <WebComponents.UiWebComponents.UiWebComponents.Button
            variant="outline"
            className="font-interTight font-semibold text-xs sm:text-sm md:text-base lg:text-base xl:text-base 2xl:text-base leading-5 sm:leading-6 md:leading-7 lg:leading-7 xl:leading-[24px] 2xl:leading-[24px] w-fit"
          >
            <Link href="/plancomparison" className="flex items-center">
              Explore in Details
              <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" />
            </Link>
          </WebComponents.UiWebComponents.UiWebComponents.Button>
        </div>
      </div>

      {/* Custom animations */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
        
        .animate-slide-up {
          animation: slide-up 0.6s ease-out both;
        }
      `}</style>
    </section>
  );
};
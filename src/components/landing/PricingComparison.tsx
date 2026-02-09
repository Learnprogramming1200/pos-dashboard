"use client";
import React from "react";
import { Check, Star, Zap, Crown, ArrowRight, CheckCircle, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { WebComponents } from "@/components";
import { HomeTypes } from "@/types";
import { landingStrings } from "@/constant/common";
import { userSubscriptionAPI } from "@/lib/api";
import { generateUUID } from "@/utils/uuid";
import { Constants } from "@/constant";
import Image from "next/image";

interface PricingComparisonProps {
  plans: HomeTypes.IPlan[];
  loading?: boolean;
  error?: string | null;
}

export default function PricingComparison({ plans, loading = false, error = null }: PricingComparisonProps) {
  const router = useRouter();
  const [isAnnual, setIsAnnual] = React.useState(false);
  const [hoveredPlan, setHoveredPlan] = React.useState<string | number | null>(null);
  const [processingPlan, setProcessingPlan] = React.useState<string | number | null>(null);

  // Handle Choose Plan click with API call
  const handleChoosePlan = async (plan: HomeTypes.IPlan) => {
    const planId = plan.id || plan._id;
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
        currency: plan.currency?.code || 'USD',
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
      return plan.type?.toLowerCase() === 'yearly' || plan.type?.toLowerCase() === 'annual';
    } else {
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

  // Modules master list for comparison grid
  const allModules: string[] = [
    'sales',
    'inventory',
    'pos',
    'dashboard',
    'reports',
    'customer',
    'employee',
    'purchase',
    'returns',
    'finance',
    'tax',
  ];

  // Limits we want to show
  const limitRows = [
    { key: 'storeLimit', label: 'Store Limit' },
    { key: 'staffLimit', label: 'Staff Limit' },
  ];

  if (loading) {
    return (
      <div>
        <div className="bg-black relative">
          <div className="w-full h-[600px] bg-gray-800 dark:bg-gray-900 opacity-40 animate-pulse" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center">
            <div className="space-y-4">
              <div className="h-10 w-80 bg-gray-600 dark:bg-gray-700 rounded mx-auto animate-pulse" />
              <div className="h-6 w-96 bg-gray-600 dark:bg-gray-700 rounded mx-auto animate-pulse" />
            </div>
          </div>
        </div>
        <div className="w-full bg-white dark:bg-gray-900 pt-10">
          <div className="container mx-auto">
            <div className="pt-12">
              <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent scroll-smooth">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <td className="bg-white dark:bg-gray-900 shadow-sm lg:border-0 p-8 transition-all duration-300 h-[420px] w-[350px] min-w-[350px] max-w-[350px] flex-shrink-0 border-r border-gray-200 dark:border-gray-700 sticky left-0 z-10">
                        <div className="text-center h-full flex flex-col justify-between">
                          <div className="flex-1 flex flex-col justify-center">
                            <div className="h-8 bg-slate-300 dark:bg-slate-600 rounded w-60 mx-auto mb-2 animate-pulse" />
                            <div className="h-4 bg-slate-300 dark:bg-slate-600 rounded w-76 animate-pulse" />
                          </div>
                          <div className="mt-auto pt-4">
                            <div className="inline-flex items-center bg-white dark:bg-gray-800 rounded-md p-1.5 shadow-lg border border-slate-200 dark:border-gray-600">
                              <div className="h-8 w-20 bg-slate-300 dark:bg-slate-600 rounded-md animate-pulse" />
                              <div className="h-8 w-20 bg-slate-300 dark:bg-slate-600 rounded-md animate-pulse ml-1" />
                            </div>
                          </div>
                        </div>
                      </td>
                      {[1, 2, 3].map((index) => (
                        <td
                          key={`skeleton-plan-${index}`}
                          className="relative bg-white dark:bg-gray-900 shadow-sm border border-gray-200 dark:border-gray-700 p-8 transition-all duration-300 h-[420px] min-w-[300px] max-w-[350px] flex-shrink-0"
                        >
                          <div className="h-6 bg-slate-300 dark:bg-slate-600 rounded w-32 mx-auto mb-4 animate-pulse" />
                          <div className="h-4 bg-slate-300 dark:bg-slate-600 rounded w-48 mx-auto mb-6 animate-pulse" />
                          <div className="h-8 bg-slate-300 dark:bg-slate-600 rounded w-24 mx-auto mb-2 animate-pulse" />
                          <div className="h-4 bg-slate-300 dark:bg-slate-600 rounded w-16 mx-auto mb-6 animate-pulse" />
                          <div className="absolute inset-x-0 bottom-8 px-8">
                            <div className="h-10 bg-slate-300 dark:bg-slate-600 rounded w-full animate-pulse" />
                          </div>
                        </td>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="bg-[#f0f1f2] dark:bg-gray-800 p-6 mb-0 flex items-center min-h-[72px] sticky left-0 z-10">
                        <div className="h-5 bg-slate-400 dark:bg-slate-600 rounded w-20 animate-pulse" />
                      </td>
                      {[1, 2, 3].map((index) => (
                        <td key={`skeleton-module-header-${index}`} className="bg-[#f0f1f2] dark:bg-gray-800 p-6 min-h-[72px]" />
                      ))}
                    </tr>
                    {allModules.map((moduleKey) => (
                      <tr key={`skeleton-module-${moduleKey}`}>
                        <td className="p-6 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700 flex items-center sticky left-0 z-10">
                          <div className="h-5 bg-slate-300 dark:bg-slate-600 rounded w-24 animate-pulse capitalize" />
                        </td>
                        {[1, 2, 3].map((index) => (
                          <td key={`skeleton-module-${moduleKey}-${index}`} className="p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 text-center">
                            <div className="w-5 h-5 bg-slate-300 dark:bg-slate-600 rounded-full mx-auto animate-pulse" />
                          </td>
                        ))}
                      </tr>
                    ))}
                    <tr>
                      <td className="bg-[#f0f1f2] dark:bg-gray-800 p-6 mb-0 flex items-center min-h-[72px] sticky left-0 z-10">
                        <div className="h-5 bg-slate-400 dark:bg-slate-600 rounded w-16 animate-pulse" />
                      </td>
                      {[1, 2, 3].map((index) => (
                        <td key={`skeleton-limit-header-${index}`} className="bg-[#f0f1f2] dark:bg-gray-800 p-6 min-h-[72px]" />
                      ))}
                    </tr>
                    {limitRows.map((feature) => (
                      <tr key={`skeleton-limit-${feature.key}`}>
                        <td className="p-6 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700 hover:bg-cyan-50 dark:hover:bg-gray-800 transition-colors flex items-center sticky left-0 z-10">
                          <div className="h-5 bg-slate-300 dark:bg-slate-600 rounded w-28 animate-pulse" />
                        </td>
                        {[1, 2, 3].map((index) => (
                          <td key={`skeleton-limit-${feature.key}-${index}`} className="p-6 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700 hover:bg-cyan-50 dark:hover:bg-gray-800 transition-colors text-center">
                            <div className="h-6 bg-slate-300 dark:bg-slate-600 rounded w-16 mx-auto animate-pulse" />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 bg-gray-50 min-h-screen">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <p>Failed to load plans: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!plans || plans.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 bg-gray-50 min-h-screen">
        <div className="text-center">
          <div className="text-gray-500">
            <p>No plans available at the moment.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-black relative">
        <Image
          src={Constants.assetsIcon.assets.footerBgDesign}
          alt="Hero Image"
          width={1000}
          height={600}
          className="w-full h-full blur-[1.5px] opacity-40"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center">
          <h1 className="text-4xl font-bold">
            Affordable pricing
          </h1>
          <p className="text-[20px] font-semibold mt-4 px-4">
            Get started with a free trial and setup your store. Activate a plan <br /> when you're ready.
          </p>
        </div>
      </div>
      <div className="w-full bg-white dark:bg-gray-900 pt-10">
        <div className="container mx-auto">
          <div className="pt-12">

            {/* Scrollable Table Container */}
            <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent scroll-smooth">
              <table className="w-full border-collapse">
                <thead>
                  {/* Pricing Cards Row */}
                  <tr>
                    <td className="bg-white dark:bg-gray-900 shadow-sm lg:border-0 p-8 transition-all duration-300 h-[420px] w-[350px] min-w-[350px] max-w-[350px] flex-shrink-0 border-r border-gray-200 dark:border-gray-700 sticky left-0 z-10">
                      <div className="text-center h-full flex flex-col justify-between">
                        <div className="flex-1 flex flex-col justify-center">
                          <h1 className="text-primary font-poppins font-bold text-2xl pt-6 pb-2">
                            Simple, transparent pricing plans
                          </h1>
                          <p className="text-textSmall font-interTight text-sm sm:text-base md:text-lg lg:text-lg xl:text-lg 2xl:text-lg leading-5 sm:leading-6 md:leading-7 lg:leading-7 xl:leading-7 2xl:leading-7">
                            Easily compare all pricing plans side by side, so you choose the perfect option for your needs.
                          </p>


                        </div>

                        {/* Billing Toggle - Fixed at bottom */}
                        <div className="mt-auto pt-4">
                          <div className="inline-flex items-center bg-white dark:bg-gray-800 rounded-md p-1.5 shadow-lg border border-slate-200 dark:border-gray-600">
                            <button
                              onClick={() => setIsAnnual(false)}
                              className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 ${!isAnnual
                                ? "bg-blue-600 text-white shadow-md"
                                : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100"
                                }`}
                            >
                              {landingStrings.common.monthly}
                            </button>
                            <button
                              onClick={() => setIsAnnual(true)}
                              className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2 ${isAnnual
                                ? "bg-blue-600 text-white shadow-md"
                                : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100"
                                }`}
                            >
                              {landingStrings.common.annual}
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>
                    {(() => {
                      const plansToRender: (HomeTypes.IPlan | null)[] = [...filteredPlans];
                      const minPlans = 3;

                      // Add empty placeholder plans if we have fewer than 3
                      while (plansToRender.length < minPlans) {
                        plansToRender.push(null);
                      }

                      return plansToRender.map((plan, index) => {
                        // Render empty placeholder cell
                        if (!plan) {
                          return (
                            <td
                              key={`empty-${index}`}
                              className="relative bg-textMain2 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-8 transition-all duration-300 h-[420px] min-w-[300px] max-w-[350px] flex-shrink-0 border-r"
                            >
                              <div className="h-full flex items-center justify-center">
                                <Image
                                  src={Constants.assetsIcon.assets.comingSoon}
                                  alt="Coming Soon"
                                  width={64}
                                  height={64}
                                  className="w-16 h-16"
                                />
                              </div>
                            </td>
                          );
                        }

                        const planPrice = plan.totalPrice ?? plan.price ?? 0;
                        const isYearlyPlan = plan.type?.toLowerCase() === 'yearly' || plan.type?.toLowerCase() === 'annual';
                        const isMonthlyPlan = plan.type?.toLowerCase() === 'monthly';

                        // Always format planPrice (which uses totalPrice when available, otherwise price)
                        const formattedPrice = plan.formattedPrice || planPrice.toFixed(2);
                        const currencySymbol = plan.currency?.symbol || '$';
                        const currencyPosition = plan.currency?.position || 'Left';
                        const duration = plan.duration || 'month';
                        const displayPrice = currencyPosition === 'Left'
                          ? `${currencySymbol}${formattedPrice}`
                          : `${formattedPrice}${currencySymbol}`;

                        const monthlyEquivalent = isYearlyPlan ? planPrice / 12 : planPrice;
                        const monthlySavings = isYearlyPlan && isMonthlyPlan ? Math.round(monthlyEquivalent - planPrice) : null;
                        const isHovered = hoveredPlan === (plan.id || plan._id);

                        return (
                          <td
                            key={plan.id || plan._id}
                            className={`relative bg-white dark:bg-gray-900 shadow-sm border border-gray-200 dark:border-gray-700 p-8 transition-all duration-300 h-[420px] ${plan.popular ? 'ring-2 ring-blue-500 shadow-lg' : ''
                              } min-w-[300px] max-w-[350px] flex-shrink-0 border-r`}
                            onMouseEnter={() => setHoveredPlan(plan.id || plan._id || null)}
                            onMouseLeave={() => setHoveredPlan(null)}
                          >
                            {/* Most Popular Badge */}
                            {plan.popular && (
                              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                                <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-full font-semibold shadow-lg flex items-center gap-2 text-sm">
                                  <Crown className="w-4 h-4" /> Most Popular
                                </span>
                              </div>
                            )}

                            <h3 className="text-center text-[30px] font-bold text-gray-900 dark:text-white pb-6">{plan.name}</h3>
                            <p className="text-center text-base font-interTight font-medium text-gray-600 dark:text-gray-300 pb-6 leading-relaxed">{plan.description || 'Complete POS solution for your business'}</p>

                            <div className="mb-6">
                              <div className="flex items-baseline pb-2 justify-center">
                                <span className="text-2xl font-bold text-gray-900 dark:text-white">{displayPrice}</span>
                                <span className="text-base font-semibold text-gray-600 dark:text-gray-300 pl-1">/{duration}</span>
                              </div>

                              {/* Show monthly equivalent for yearly plans */}
                              {isYearlyPlan && (
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                  {currencyPosition === 'Left'
                                    ? `${currencySymbol}${Math.round(monthlyEquivalent)}`
                                    : `${Math.round(monthlyEquivalent)}${currencySymbol}`}/month when billed annually
                                </p>
                              )}

                              {/* Show annual savings if applicable */}
                              {monthlySavings && monthlySavings > 0 && (
                                <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                                  Save {currencyPosition === 'Left'
                                    ? `${currencySymbol}${monthlySavings}`
                                    : `${monthlySavings}${currencySymbol}`}/month with annual billing
                                </p>
                              )}
                            </div>

                            {/* Choose Plan button pinned to bottom for uniform alignment */}
                            <div className="absolute inset-x-0 bottom-8 px-8">
                              <WebComponents.AdminComponents.AdminWebComponents.Button
                                onClick={() => handleChoosePlan(plan)}
                                disabled={processingPlan === (plan.id || plan._id)}
                                className="w-full justify-center gap-2 bg-primary hover:bg-primaryHover font-poppins font-semibold text-white"
                                aria-label={`Choose ${plan.name} plan`}
                              >
                                {processingPlan === (plan.id || plan._id) ? 'Processing…' : 'Choose Plan'}
                                {processingPlan !== (plan.id || plan._id) && (
                                  <ArrowRight className="w-4 h-4" />
                                )}
                              </WebComponents.AdminComponents.AdminWebComponents.Button>
                            </div>
                          </td>
                        );
                      });
                    })()}
                  </tr>
                </thead>
                <tbody>
                  {/* Modules Header Row */}
                  <tr>
                    <td className="bg-[#f0f1f2] dark:bg-gray-800 p-6 mb-0 flex items-center min-h-[72px] sticky left-0 z-10">
                      <h4 className="text-textMain dark:text-white font-bold text-base leading-[20px]">
                        MODULES
                      </h4>
                    </td>
                    {(() => {
                      const plansToRender: (HomeTypes.IPlan | null)[] = [...filteredPlans];
                      const minPlans = 3;

                      // Add empty placeholder plans if we have fewer than 3
                      while (plansToRender.length < minPlans) {
                        plansToRender.push(null);
                      }

                      return plansToRender.map((plan, index) => (
                        <td key={`module-header-${plan?.id || plan?._id || `empty-${index}`}`} className="bg-[#f0f1f2] dark:bg-gray-800 p-6 min-h-[72px]">
                          {/* Empty header to align with left side MODULES header */}
                        </td>
                      ));
                    })()}
                  </tr>
                  {/* Modules comparison rows */}
                  {allModules.map((moduleKey, index) => (
                    <tr key={`module-row-${moduleKey}`}>
                      <td className="p-6 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700 flex items-center sticky left-0 z-10">
                        <div className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                          {moduleKey}
                        </div>
                      </td>
                      {(() => {
                        const plansToRender: (HomeTypes.IPlan | null)[] = [...filteredPlans];
                        const minPlans = 3;

                        // Add empty placeholder plans if we have fewer than 3
                        while (plansToRender.length < minPlans) {
                          plansToRender.push(null);
                        }

                        return plansToRender.map((plan, index) => {
                          if (!plan) {
                            return (
                              <td key={`module-${moduleKey}-empty-${index}`} className="p-6 bg-textMain2 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-center">
                                <span className="text-gray-300 dark:text-gray-500 text-xl">–</span>
                              </td>
                            );
                          }

                          const hasModule = (plan.modules || []).some((m: string) => m.toLowerCase() === moduleKey.toLowerCase());
                          return (
                            <td key={`module-${moduleKey}-${plan.id || plan._id}`} className="p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 text-center">
                              {hasModule ? (
                                <CheckCircle className="inline-block w-5 h-5 text-green-600 dark:text-green-400" />
                              ) : (
                                <XCircle className="inline-block w-5 h-5 text-red-500 dark:text-red-400" />
                              )}
                            </td>
                          );
                        });
                      })()}
                    </tr>
                  ))}

                  {/* Limits Header Row */}
                  <tr>
                    <td className="bg-[#f0f1f2] dark:bg-gray-800 p-6 mb-0 flex items-center min-h-[72px] sticky left-0 z-10">
                      <h4 className="text-textMain dark:text-white font-bold text-base leading-[20px]">
                        LIMITS
                      </h4>
                    </td>
                    {(() => {
                      const plansToRender: (HomeTypes.IPlan | null)[] = [...filteredPlans];
                      const minPlans = 3;

                      // Add empty placeholder plans if we have fewer than 3
                      while (plansToRender.length < minPlans) {
                        plansToRender.push(null);
                      }

                      return plansToRender.map((plan, index) => (
                        <td key={"limit-header-" + (plan?.id || plan?._id || "empty-" + index)} className="bg-[#f0f1f2] dark:bg-gray-800 p-6 min-h-[72px]">
                          {/* Empty header to align with left side LIMITS header */}
                        </td>
                      ));
                    })()}
                  </tr>

                  {/* Plan Limits Rows */}
                  {limitRows.map((feature, index) => (
                    <tr key={feature.key}>
                      <td className="p-6 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700 hover:bg-cyan-50 dark:hover:bg-gray-800 transition-colors flex items-center sticky left-0 z-10">
                        <div className="text-lg font-semibold text-gray-900 dark:text-white">
                          {feature.label}
                        </div>
                      </td>
                      {(() => {
                        const plansToRender: (HomeTypes.IPlan | null)[] = [...filteredPlans];
                        const minPlans = 3;

                        // Add empty placeholder plans if we have fewer than 3
                        while (plansToRender.length < minPlans) {
                          plansToRender.push(null);
                        }

                        return plansToRender.map((plan, index) => {
                          if (!plan) {
                            return (
                              <td key={"limit-" + feature.key + "-empty-" + index} className="p-6 bg-textMain2 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 text-center">
                                <span className="text-gray-300 dark:text-gray-500 text-xl">–</span>
                              </td>
                            );
                          }

                          let value = '';
                          let isBoolean = false;

                          switch (feature.key) {
                            case 'storeLimit':
                              value = (plan.storeLimit ?? -1) === -1 ? 'Unlimited' : String(plan.storeLimit);
                              break;
                            case 'staffLimit':
                              value = (plan.staffLimit ?? -1) === -1 ? 'Unlimited' : String(plan.staffLimit);
                              break;
                            default:
                              value = 'N/A';
                          }

                          return (
                            <td key={plan.id || plan._id} className="p-6 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700 hover:bg-cyan-50 dark:hover:bg-gray-800 transition-colors text-center">
                              {isBoolean ? (
                                value === 'true' ? (
                                  <div className="inline-flex items-center justify-center w-8 h-8 bg-cyan-100 rounded-full">
                                    <Check className="w-5 h-5 text-cyan-600" />
                                  </div>
                                ) : (
                                  <span className="text-gray-400 dark:text-gray-500 text-xl">–</span>
                                )
                              ) : (
                                <span className="text-gray-900 dark:text-white font-semibold bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full text-sm">
                                  {value}
                                </span>
                              )}
                            </td>
                          );
                        });
                      })()}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

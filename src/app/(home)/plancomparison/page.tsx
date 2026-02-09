import React from "react";
import PricingComparison from "@/components/landing/PricingComparison";
import { publicAPI } from "@/lib/api";
import { planUtils } from "@/utils";
import { HomeTypes } from "@/types";

export default async function PlanComparisonPage() {
  let plans: HomeTypes.IPlan[] = [];
  let error: string | null = null;

  try {
    const response = await publicAPI.getPlans();
    // The API typically returns { data: { data: [...] } } or { data: { data: { data: [...] } } }
    const rawPlans = response.data?.data?.data || response.data?.data || response.data || [];
    plans = planUtils.normalizePlans(rawPlans);
  } catch (err) {
    console.error('Error fetching plans in SSR:', err);
    error = 'Failed to load plans. Please try again later.';
  }

  return (
    <PricingComparison
      plans={plans}
      loading={false}
      error={error}
    />
  );
}

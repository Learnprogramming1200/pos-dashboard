"use client";
import React from "react";
// import { runAllSettled } from "@/lib";
import { BlogPost } from "@/constant/BlogPost";
import { customHooks } from "@/hooks";
import { publicAPI } from "@/lib/api";
import type { Advertisement } from "@/types/superadmin/Advertisement";
import { runAllSettled } from "@/lib/concurrency";

type LandingData = {
  plans: any[];
  faqs: any[];
  advertisements: Advertisement[];
  blogPosts: any[];
  isRagEnabled: boolean;
  loading: boolean;
  error?: string;
};

export default function useLandingData(): LandingData {
  const [state, setState] = React.useState<LandingData>({
    plans: [],
    faqs: [],
    advertisements: [],
    blogPosts: [],
    isRagEnabled: false,
    loading: true,
  });

  const getLandingPlans = async () => {
    const response = await publicAPI.getPlans();
    const list = Array.isArray(response?.data?.data?.data)
      ? (response.data.data.data as any[])
      : [];
    return list
  };

  const getLandingFAQs = async () => {
    const response = await publicAPI.getFAQs();
    const list = Array.isArray(response?.data?.data)
      ? (response.data.data as any[])
      : [];
    return list;
  };
  const { advertisements } = customHooks.useAdvertisements();
  const { isEnabled: isRagEnabled } = customHooks.useRagToggle();

  React.useEffect(() => {
    const load = async () => {
      const tasks = {
        plans: async () => getLandingPlans(),
        faqs: async () => getLandingFAQs(),
        blogPosts: async () => BlogPost.getBlogs(),
        misc: async () => publicAPI.getMiscellaneousSettings(),
      };
      const settled = await runAllSettled(tasks);
      const plans =
        settled.plans.status === "fulfilled" && Array.isArray(settled.plans.value)
          ? settled.plans.value
          : [];
      const faqs =
        settled.faqs.status === "fulfilled" && Array.isArray(settled.faqs.value)
          ? settled.faqs.value
          : [];
      const blogPosts =
        settled.blogPosts.status === "fulfilled" && Array.isArray(settled.blogPosts.value)
          ? settled.blogPosts.value
          : [];
      setState({
        plans,
        faqs,
        advertisements: Array.isArray(advertisements) ? advertisements : [],
        blogPosts,
        isRagEnabled: !!isRagEnabled,
        loading: false,
      });
    };
    load();
  }, []);

  React.useEffect(() => {
    setState(prev => ({
      ...prev,
      advertisements: Array.isArray(advertisements) ? advertisements : [],
      isRagEnabled: !!isRagEnabled,
    }));
  }, [advertisements, isRagEnabled]);

  return state;
}

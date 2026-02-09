"use client";

import React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Constants } from "@/constant";
import BusinessType from "./BusinessType";
import Features from "./Features";
import FAQCategory from "./FAQCategory";
import FAQ from "./FAQ";
import SocialMedia from "./SocialMedia";
import Footer from "./Footer";
import ProductOverview from "./ProductOverview";
import Blog from "./Blog";
import Hero from "./Hero";
import { SuperAdminTypes, PaginationType } from "@/types";

export default function LandingPageSettings({
    initialHeroSection,
    initialBusinessTypes,
    initialBusinessTypesPagination,
    initialFeatures,
    initialFeaturesPagination,
    initialProductOverview,
    initialProductOverviewPagination,
    initialBlogs,
    initialBlogsPagination,
    initialFAQCategories,
    initialFAQCategoriesPagination,
    initialActiveFAQCategories,
    initialFAQs,
    initialFAQsPagination,
    initialFooterSection,
    initialSocialMediaSection,
}: {
    readonly initialHeroSection: SuperAdminTypes.LandingSettingPageTypes.HeroSection[];
    readonly initialBusinessTypes: SuperAdminTypes.LandingSettingPageTypes.BusinessTypeRow[];
    readonly initialBusinessTypesPagination: PaginationType.Pagination;
    readonly initialFeatures: SuperAdminTypes.LandingSettingPageTypes.FeatureRow[];
    readonly initialFeaturesPagination: PaginationType.Pagination;
    readonly initialProductOverview: SuperAdminTypes.LandingSettingPageTypes.ProductOverviewRow[];
    readonly initialProductOverviewPagination: PaginationType.Pagination;
    readonly initialBlogs: SuperAdminTypes.LandingSettingPageTypes.BlogRow[];
    readonly initialBlogsPagination: PaginationType.Pagination;
    readonly initialFAQCategories: SuperAdminTypes.LandingSettingPageTypes.FAQCategoryRow[];
    readonly initialFAQCategoriesPagination: PaginationType.Pagination;
    readonly initialActiveFAQCategories: SuperAdminTypes.LandingSettingPageTypes.FAQCategoryRow[];
    readonly initialFAQs: SuperAdminTypes.LandingSettingPageTypes.FAQRow[];
    readonly initialFAQsPagination: PaginationType.Pagination;
    readonly initialFooterSection: SuperAdminTypes.LandingSettingPageTypes.FooterSection;
    readonly initialSocialMediaSection?: SuperAdminTypes.LandingSettingPageTypes.SocialMediaSettings;
}) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const searchParamsString = searchParams.toString();
    const [activeTab, setActiveTab] = React.useState(() => searchParams.get("tab") || "hero");

    const handleTabChange = (tabId: string) => {
        setActiveTab(tabId);
        const params = new URLSearchParams(searchParams.toString());
        params.set("tab", tabId);
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };

    // Sync activeTab with URL tab parameter
    React.useEffect(() => {
        const tab = searchParams.get("tab");
        if (tab && tab !== activeTab) {
            setActiveTab(tab);
        }
    }, [searchParamsString, activeTab]);

    const tabs = [
        { id: "hero", label: Constants.superadminConstants.tabHero },
        { id: "businessTypes", label: Constants.superadminConstants.tabBusinessTypes },
        { id: "features", label: Constants.superadminConstants.tabFeatures },
        { id: "productOverview", label: Constants.superadminConstants.tabProductOverview },
        { id: "faqCategory", label: Constants.superadminConstants.tabFAQCategory },
        { id: "faq", label: Constants.superadminConstants.tabFAQ },
        { id: "blog", label: Constants.superadminConstants.tabBlog },
        { id: "footer", label: Constants.superadminConstants.tabFooter },
        { id: "socialMedia", label: Constants.superadminConstants.tabSocialMedia }
    ];

    return (
        <div className="min-h-screen">
            <div className="bg-white dark:bg-darkFilterbar border-b border-[#616161]">
                <div className="px-6 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        {Constants.superadminConstants.landingpageheading}
                    </h1>
                </div>
            </div>

            <div className="bg-white dark:bg-darkFilterbar">
                <div className="px-6 border-b border-[#616161]">
                    <div className="flex space-x-8 overflow-x-auto">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => handleTabChange(tab.id)}
                                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === tab.id
                                    ? "border-blue-600 text-blue-600 dark:text-blue-400"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-slate-400 dark:hover:text-slate-300"
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {activeTab === "hero" && <Hero initialHeroSection={initialHeroSection} />}
                {activeTab === "businessTypes" && <BusinessType initialBusinessTypes={initialBusinessTypes} businessTypesPagination={initialBusinessTypesPagination} />}
                {activeTab === "faqCategory" && <FAQCategory initialFAQCategories={initialFAQCategories} faqCategoriesPagination={initialFAQCategoriesPagination} />}
                {activeTab === "faq" && <FAQ initialFAQs={initialFAQs} faqsPagination={initialFAQsPagination} faqCategories={initialActiveFAQCategories} />}
                {activeTab === "blog" && <Blog initialBlogs={initialBlogs} blogsPagination={initialBlogsPagination} />}
                {activeTab === "features" && <Features initialFeatures={initialFeatures} featuresPagination={initialFeaturesPagination} />}
                {activeTab === "productOverview" && <ProductOverview initialProductOverview={initialProductOverview} productOverviewPagination={initialProductOverviewPagination} />}
                {activeTab === "footer" && <Footer initialFooterSection={initialFooterSection} />}
                {activeTab === "socialMedia" && <SocialMedia initialSocialMediaSection={initialSocialMediaSection} />}
            </div>
        </div>
    );
}

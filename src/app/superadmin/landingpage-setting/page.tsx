import { WebComponents } from "@/components";
import { ServerActions } from "@/lib/server-lib";
import { SearchParams } from "@/types/SearchParams";

export default async function SuperadminLandingPageSetting({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const limit = parseInt(params.limit || "25", 10);
  const search =
    typeof params.search === "string" && params.search.trim() !== ""
      ? params.search.trim()
      : undefined;
  const isActive = params.isActive;
  const activeTab = params.tab || "hero";

  const defaultPagination = {
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  };

  let landingPageData: any = [];
  let pagination = { ...defaultPagination };

  // Helper function to fetch data with error handling
  const fetchData = async (apiCall: Promise<any>, tabName: string) => {
    try {
      const response = await apiCall;
      return response?.data?.data;
    } catch (err) {
      console.error(`Failed to fetch ${tabName}:`, err);
      return null;
    }
  };

  // Fetch data based on active tab
  switch (activeTab) {
    case "hero":
      const heroData = await fetchData(
        ServerActions.ServerApilib.ssrHeroSectionAPI.getAll(),
        "hero section"
      );
      landingPageData = heroData?.data || [];
      pagination = heroData?.pagination || defaultPagination;
      break;

    case "businessTypes":
      const businessData = await fetchData(
        ServerActions.ServerApilib.ssrBusinessTypesAPI.getAll(page, limit, search, isActive),
        "business types"
      );
      landingPageData = businessData?.data || [];
      pagination = businessData?.pagination || defaultPagination;
      break;

    case "features":
      const featuresData = await fetchData(
        ServerActions.ServerApilib.ssrFeaturesAPI.getAll(page, limit, search),
        "features"
      );
      landingPageData = featuresData?.data || [];
      pagination = featuresData?.pagination || defaultPagination;
      break;

    case "productOverview":
      const productData = await fetchData(
        ServerActions.ServerApilib.ssrProductOverviewAPI.getAll(page, limit, search),
        "product overview"
      );
      landingPageData = productData?.data || [];
      pagination = productData?.pagination || defaultPagination;
      break;

    case "blog":
      const blogsData = await fetchData(
        ServerActions.ServerApilib.ssrBlogsAPI.getAll(page, limit, search),
        "blogs"
      );
      landingPageData = blogsData?.data || [];
      pagination = blogsData?.pagination || defaultPagination;
      break;

    case "faqCategory":
      const faqCategoriesData = await fetchData(
        ServerActions.ServerApilib.ssrFAQCategoryAPI.getAll(page, limit, search),
        "FAQ categories"
      );
      landingPageData = faqCategoriesData?.data || [];
      pagination = faqCategoriesData?.pagination || defaultPagination;
      break;

    case "faq":
      const faqsData = await fetchData(
        ServerActions.ServerApilib.ssrFAQAPI.getAll(page, limit, search),
        "FAQs"
      );
      landingPageData = faqsData?.data || [];
      pagination = faqsData?.pagination || defaultPagination;
      break;

    case "footer":
      const footerData = await fetchData(
        ServerActions.ServerApilib.ssrFooterSectionAPI.getAll(),
        "footer section"
      );
      landingPageData = footerData || {};
      break;

    case "socialMedia":
      const socialMediaData = await fetchData(
        ServerActions.ServerApilib.ssrSocialMediaLinksAPI.getAll(),
        "social media"
      );
      landingPageData = socialMediaData || {};
      break;
  }

  // Prepare data for component props
  const heroSection = activeTab === "hero" ? landingPageData : [];
  const businessTypes = activeTab === "businessTypes" ? landingPageData : [];
  const feature = activeTab === "features" ? landingPageData : []
  const productOverview = activeTab === "productOverview" ? landingPageData : []
  const blogs = activeTab === "blog" ? landingPageData : []
  const faqCategories = activeTab === "faqCategory" ? landingPageData : []
  const faqs = activeTab === "faq" ? landingPageData : []
  const activeFAQCategories: any[] = [];
  const footerSection = activeTab === "footer" ? landingPageData : {};
  const socialMediaSection = activeTab === "socialMedia" ? landingPageData : {};

  return (
    <WebComponents.SuperAdminComponents.SuperadminWebComponents.SuperadminLandingPageSettingsWebComponents.LandingPageSettingsComponent
      initialHeroSection={heroSection}
      initialBusinessTypes={businessTypes}
      initialBusinessTypesPagination={
        activeTab === "businessTypes"
          ? pagination
          : { ...defaultPagination, itemsPerPage: limit }
      }
      initialFeatures={feature}
      initialFeaturesPagination={
        activeTab === "features"
          ? pagination
          : { ...defaultPagination, itemsPerPage: limit }
      }
      initialProductOverview={productOverview}
      initialProductOverviewPagination={
        activeTab === "productOverview"
          ? pagination
          : { ...defaultPagination, itemsPerPage: limit }
      }
      initialBlogs={blogs}
      initialBlogsPagination={
        activeTab === "blog"
          ? pagination
          : { ...defaultPagination, itemsPerPage: limit }
      }
      initialFAQCategories={faqCategories}
      initialFAQCategoriesPagination={
        activeTab === "faqCategory"
          ? pagination
          : { ...defaultPagination, itemsPerPage: limit }
      }
      initialActiveFAQCategories={activeFAQCategories}
      initialFAQs={faqs}
      initialFAQsPagination={
        activeTab === "faq"
          ? pagination
          : { ...defaultPagination, itemsPerPage: limit }
      }
      initialFooterSection={footerSection}
      initialSocialMediaSection={socialMediaSection}
    />
  );
}

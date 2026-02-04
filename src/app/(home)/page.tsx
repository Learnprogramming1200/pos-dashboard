
import { ssrPublicAPI } from "@/lib/ssr-api";
export const revalidate = 600;
import { LandingPageWrapper } from "@/components/landing/LandingPageWrapper";

// Helper to extract data safely
const getData = (res: any) => res?.data?.data || res?.data || null;

export default async function Landing() {
  // Fetch all data in parallel on the server
  const [
    heroResponse,
    featuresResponse,
    dashboardResponse,
    plansResponse,
    businessTypesResponse,
    faqsResponse,
    blogsResponse
  ] = await Promise.all([
    ssrPublicAPI.getHeroSection().catch(() => null),
    ssrPublicAPI.getFeatures().catch(() => null),
    ssrPublicAPI.getProductOverview().catch(() => null),
    ssrPublicAPI.getPlans().catch(() => null),
    ssrPublicAPI.getBusinessTypes().catch(() => null),
    ssrPublicAPI.getFAQs().catch(() => null),
    ssrPublicAPI.getBlogs().catch(() => null)
  ]);

  const heroData = getData(heroResponse);
  const featuresData = getData(featuresResponse);
  const dashboardData = getData(dashboardResponse);
  const plansData = plansResponse?.data?.data?.data || getData(plansResponse);
  const businessTypesData = getData(businessTypesResponse);
  const faqsData = getData(faqsResponse);
  const blogsData = getData(blogsResponse);

  return (
    <LandingPageWrapper
      heroData={heroData}
      featuresData={featuresData}
      dashboardData={dashboardData}
      plansData={plansData}
      businessTypesData={businessTypesData}
      faqsData={faqsData}
      blogsData={blogsData}
    />
  );
}

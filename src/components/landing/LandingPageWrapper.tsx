"use client";

import { LandingPageComponents } from "@/components/landing";
import { DemoRequestProvider } from "@/contexts/DemoRequestContext";

interface LandingPageWrapperProps {
  heroData: any;
  featuresData: any;
  dashboardData: any;
  plansData: any;
  businessTypesData: any;
  faqsData: any;
  blogsData: any;
}

export function LandingPageWrapper({
  heroData,
  featuresData,
  dashboardData,
  plansData,
  businessTypesData,
  faqsData,
  blogsData,
}: LandingPageWrapperProps) {
  return (
    <DemoRequestProvider>
      <div className="w-full">
        <section id="home">
          <LandingPageComponents.HeroSection user={null} initialHero={heroData} />
        </section>

        <LandingPageComponents.FeaturesGrid initialFeatures={featuresData || []} />

        <LandingPageComponents.ProductOverview initialDashboards={dashboardData} />

        <section id="pricing">
          <LandingPageComponents.PricingSection
            plans={plansData || []}
            loading={false}
          />
        </section>

        <LandingPageComponents.BusinessTypesSection initialBusinessTypes={businessTypesData || []} />

        <LandingPageComponents.TestimonialsSection testimonials={[]} />

        <section id="faq">
          <LandingPageComponents.FAQSection
            faqs={faqsData || []}
            loading={false}
          />
        </section>

        <section id="blog">
          <LandingPageComponents.BlogPreview blogPosts={blogsData || []} />
        </section>
      </div>
    </DemoRequestProvider>
  );
}

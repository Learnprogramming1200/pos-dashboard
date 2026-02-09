"use client";
import React from "react";
import Image from "next/image";
import { WebComponents } from "@/components";
import { FiArrowRight } from "react-icons/fi";
import { CheckCircle } from "lucide-react";
import { Constants } from "@/constant";
import { LandingTypes } from "@/types";
import { publicAPI } from "@/lib/api";

interface HeroSectionProps {
  user: { name?: string; email?: string } | null;
  initialHero?: LandingTypes.Hero.IHeroSection | null;
}

export default function HeroSection({ user, initialHero }: HeroSectionProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  // Use only SSR data, no client-side API calls
  const hero = initialHero || null;

  const title1 = hero?.title1 || `${Constants.commonConstants.landingStrings.hero.mainTitle}`;
  const title2 = hero?.title2 || "";
  const subtitle = hero?.subtitle || Constants.commonConstants.landingStrings.hero.subtitle;
  const defaultFeatures = Constants.commonConstants.landingStrings.hero.keyFeatures;
  // Use sublist fields from hero data if available, otherwise fall back to defaults
  const keyFeatures = [
    hero?.sublist1 || defaultFeatures[0] || "",
    hero?.sublist2 || defaultFeatures[1] || "",
    hero?.sublist3 || defaultFeatures[2] || "",
    hero?.sublist4 || defaultFeatures[3] || "",
  ].filter(Boolean); // Remove empty strings
  const heroImage = hero?.heroImage || " ";

  const isVideoUrl = (url: string | undefined | null) => {
    if (!url) return false;
    const lower = url.toLowerCase();
    if (/\.(mp4|webm|ogg)(\?|#|$)/.test(lower)) return true;
    if (lower.includes('res.cloudinary.com') && lower.includes('/video/upload')) return true;
    return false;
  };

  const handleStartFreeTrial = async () => {
    try {
      setIsLoading(true);
      const response = await publicAPI.getDemoRequest();
    } catch (error) {
      console.error('Demo request failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative overflow-hidden -mt-[72px] pt-[72px] bg-slate-950">

      {hero && (
        <div className="absolute top-0 left-0 w-full h-full z-0" style={{ top: '-72px', height: 'calc(100% + 72px)' }}>
          {isVideoUrl(heroImage) ? (
            <video
              src={heroImage}
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <Image
              src={heroImage}
              alt="POSPro dashboard background"
              fill
              priority
              className="object-cover"
            />
          )}
          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-black/70"></div>
        </div>
      )}
      <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-10 2xl:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 md:gap-10 lg:gap-12 xl:gap-16 2xl:gap-[79px] items-center">
          {/* Hero Text Section */}
          <div className="py-8 sm:py-10 md:py-12 lg:py-16 xl:py-20 2xl:pt-[76px] 2xl:pb-[94px] w-full max-w-full lg:max-w-[626px] order-2 lg:order-1">
            {/* Tagline */}
            <div className="text-white font-caveat text-sm sm:text-base md:text-lg lg:text-xl 2xl:text-[22px] leading-relaxed mb-2 sm:mb-3">
              The All-in-One POS Advantage
            </div>

            {/* Main Titles */}
            <div className="mb-3 sm:mb-4 md:mb-5">
              <h1 className="text-primary font-poppins font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-[68px] 2xl:text-[68px] leading-tight sm:leading-tight md:leading-tight lg:leading-tight xl:leading-[78px] 2xl:leading-[78px]">
                {title1}
              </h1>
              <h2 className="text-white font-poppins font-semibold text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-[68px] 2xl:text-[68px] leading-tight sm:leading-tight md:leading-tight lg:leading-tight xl:leading-[78px] 2xl:leading-[78px] italic">
                {title2}
              </h2>
            </div>

            {/* Subtitle */}
            <p className="text-[#F2F2F2] font-interTight text-sm sm:text-base md:text-lg lg:text-lg leading-relaxed mb-6 sm:mb-8 md:mb-10 lg:mb-12">
              {subtitle}
            </p>

            {/* Key Features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-5 mb-6 sm:mb-8 md:mb-10 lg:mb-12">
              {keyFeatures.map((feature) => (
                <div key={feature} className="flex items-start gap-3 text-[#F2F2F2] font-interTight font-medium text-sm sm:text-base leading-relaxed">
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 md:w-[22px] md:h-[22px] text-[#34C759] flex-shrink-0 mt-0.5" />
                  <span className="flex-1">{feature}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-5">
              <WebComponents.UiComponents.UiWebComponents.Button
                onClick={handleStartFreeTrial}
                className="h-11 sm:h-12 md:h-[44px] w-full sm:w-auto sm:min-w-[160px] lg:min-w-[179px] rounded-[4px] px-5 sm:px-6 md:px-[20px] gap-2 text-sm sm:text-base"
                disabled={isLoading}
              >
                {isLoading ? "Starting..." : "Start Free Trial "}
                <FiArrowRight className="w-4 h-4 text-white flex-shrink-0" />
              </WebComponents.UiComponents.UiWebComponents.Button>

              <WebComponents.UiComponents.UiWebComponents.Button
                variant="outline"
                className="h-11 sm:h-12 md:h-[44px] w-full sm:w-auto sm:min-w-[160px] lg:min-w-[179px] rounded-[4px] px-5 sm:px-6 md:px-[20px] gap-2 text-sm sm:text-base"
              >
                <span className="font-interTight font-semibold">
                  View Live Demo
                </span>
                <FiArrowRight className="w-4 h-4 text-[#475467] flex-shrink-0" />
              </WebComponents.UiComponents.UiWebComponents.Button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
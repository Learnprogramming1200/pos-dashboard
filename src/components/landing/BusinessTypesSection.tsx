"use client";

import React from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { WebComponents } from "@/components";
import { landingStrings } from "@/constant/common";
import { Constants } from "@/constant";
import { LandingTypes } from "@/types";

interface BusinessTypesSectionProps {
  initialBusinessTypes?: LandingTypes.BusinessType.IBusinessType[];
}

export default function BusinessTypesSection({ initialBusinessTypes }: BusinessTypesSectionProps) {
  // Use only SSR data, no client-side API calls
  const [showAll, setShowAll] = React.useState(false);

  // Use SSR data or fallback to static business types
  const businessTypes = React.useMemo(() => {
    if (initialBusinessTypes && initialBusinessTypes.length > 0) {
      return initialBusinessTypes;
    }

    // Fallback to static data
    return landingStrings.testimonials.dummyBusinessTypes;
  }, [initialBusinessTypes]);

  // Filter only active business types (if status field exists)
  const activeBusinessTypes = React.useMemo(() => {
    return businessTypes.filter((type: any) =>
      type.status !== false // Show all if status is undefined or true
    );
  }, [businessTypes]);

  // Function to get frame icon based on index (cycles through 1-6)
  const getFrameIcon = (index: number) => {
    const frameNumber = (index % 6) + 1; // Cycles through 1-6
    const frames = [
      Constants.assetsIcon.assets.businessTypeFrame1,
      Constants.assetsIcon.assets.businessTypeFrame2,
      Constants.assetsIcon.assets.businessTypeFrame3,
      Constants.assetsIcon.assets.businessTypeFrame4,
      Constants.assetsIcon.assets.businessTypeFrame5,
      Constants.assetsIcon.assets.businessTypeFrame6,
    ];
    return frames[frameNumber - 1];
  };

  // Function to handle view more click
  const handleViewMore = () => {
    setShowAll(true);
  };

  // Get business types to display (first 6 or all based on showAll state)
  const displayedBusinessTypes = showAll ? activeBusinessTypes : activeBusinessTypes.slice(0, 6);

  return (
    <div className="bg-[#F6FBFF] dark:bg-[#0D1117] relative">
      <div
        className="absolute inset-0 bg-cover bg-center dark:opacity-45"
        style={{ backgroundImage: `url(${Constants.assetsIcon.assets.bgDesign.src})` }}
      ></div>
      <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-10 2xl:px-8 py-12 sm:py-16 md:py-20 lg:py-24 xl:py-28 2xl:py-[130px] relative z-10">

        {/* Header */}
        <div className="text-center">
          <p className="text-primary font-caveat text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-[22px] leading-4 sm:leading-5 md:leading-6 lg:leading-7 xl:leading-8 2xl:leading-[32px]">Built to Fit Any Business</p>
          <p className="text-textMain dark:text-white font-poppins font-semibold text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl 2xl:text-[50px] leading-5 sm:leading-6 md:leading-7 lg:leading-8 xl:leading-9 2xl:leading-[60px] pt-1">
            Perfect for <span className="text-primary font-poppins font-semibold italic text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl 2xl:text-[50px] leading-5 sm:leading-6 md:leading-7 lg:leading-8 xl:leading-9 2xl:leading-[60px]">Every Business </span>
            Type
          </p>

          {/* Description */}
          <p className="text-textSmall dark:text-neutral font-interTight text-xs sm:text-sm md:text-base lg:text-lg xl:text-lg 2xl:text-lg leading-4 sm:leading-5 md:leading-6 lg:leading-7 xl:leading-7 2xl:leading-[26px] px-2 sm:px-4 md:px-8 lg:px-12 xl:px-16 2xl:px-[68px] pt-2 sm:pt-3 md:pt-4 lg:pt-5 xl:pt-6 2xl:pt-5">
            From small retail stores to large enterprises, POSPro adapts to your business needs.
          </p>
        </div>

        {/* Business Types Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 auto-rows-fr items-stretch gap-3 sm:gap-4 md:gap-5 lg:gap-6 xl:gap-6 2xl:gap-[30px] pt-6 sm:pt-8 md:pt-12 lg:pt-16 xl:pt-20 2xl:pt-[60px]">
          {displayedBusinessTypes.map((businessType: any, index: any) => (
            <div key={businessType._id || index} className="px-3 sm:px-4 md:px-6 lg:px-8 xl:px-8 2xl:px-[30px] py-4 sm:py-6 md:py-8 lg:py-10 xl:py-10 2xl:py-[34px] rounded-[8px] sm:rounded-[10px] md:rounded-[10px] lg:rounded-[10px] xl:rounded-[10px] 2xl:rounded-[10px] bg-secondary dark:bg-[#0A192F]">
              {/* Icon */}
              <div className="">
                <Image
                  src={getFrameIcon(index)}
                  alt={businessType.title}
                  width={60}
                  height={60}
                  className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 xl:w-16 xl:h-16 2xl:w-[60px] 2xl:h-[60px]"
                />
              </div>

              {/* Content */}
              <div className="pt-3 sm:pt-4 md:pt-6 lg:pt-8 xl:pt-8 2xl:pt-[30px]">
                <h3 className="text-textMain dark:text-white font-poppins font-semibold text-sm sm:text-base md:text-lg lg:text-xl xl:text-xl 2xl:text-[20px] leading-4 sm:leading-5 md:leading-6 lg:leading-7 xl:leading-7 2xl:leading-[30px]">{businessType.title}</h3>
                <p className="pt-1 sm:pt-2 md:pt-3 lg:pt-4 xl:pt-5 2xl:pt-[10px] text-textSmall dark:text-neutral font-interTight font-normal text-xs sm:text-sm md:text-base lg:text-lg xl:text-lg 2xl:text-lg leading-3 sm:leading-4 md:leading-5 lg:leading-6 xl:leading-6 2xl:leading-[26px] line-clamp-2">{businessType.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* View More Button */}
        {businessTypes.length > 6 && !showAll && (
          <div className="pt-6 sm:pt-8 md:pt-12 lg:pt-16 xl:pt-20 2xl:pt-[60px] text-center">
            <WebComponents.UiComponents.UiWebComponents.Button
              onClick={handleViewMore}
              variant="outline"
              className="font-interTight font-semibold text-base leading-[26px] h-8 sm:h-9 md:h-10 lg:h-11 xl:h-12 2xl:h-[44px] w-full sm:w-auto lg:w-[179px] xl:w-[179px] 2xl:w-[179px] rounded-[4px] pt-[8px] sm:pt-[9px] md:pt-[10px] lg:pt-[10px] xl:pt-[10px] 2xl:pt-[10px] pb-[8px] sm:pb-[9px] md:pb-[10px] lg:pb-[10px] xl:pb-[10px] 2xl:pb-[10px] pl-[16px] sm:pl-[18px] md:pl-[20px] lg:pl-[20px] xl:pl-[20px] 2xl:pl-[20px] pr-[16px] sm:pr-[18px] md:pr-[20px] lg:pr-[20px] xl:pr-[20px] 2xl:pr-[20px] gap-2"
            >
              View More
              <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 md:w-4 md:h-4 lg:w-4 lg:h-4 xl:w-4 xl:h-4 2xl:w-4 2xl:h-4" />
            </WebComponents.UiComponents.UiWebComponents.Button>
          </div>
        )}
      </div>
    </div>
  );
}

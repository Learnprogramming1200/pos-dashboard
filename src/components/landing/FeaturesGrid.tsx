import React from "react";
import Image from "next/image";
import { landingStrings } from "@/constant/common";
import { Constants } from "@/constant";
import { LandingTypes } from "@/types";
import { ArrowRight } from "lucide-react";
import { Button } from "../ui/button";

interface FeaturesGridProps {
  initialFeatures?: LandingTypes.Feature.IFeature[];
}

export default function FeaturesGrid({ initialFeatures }: FeaturesGridProps) {
  // Use only SSR data, no client-side API calls
  const [showAll, setShowAll] = React.useState(false);

  // Use SSR data or fallback to static features
  const features = React.useMemo(() => {
    if (initialFeatures && initialFeatures.length > 0) {
      return initialFeatures;
    }

    // Fallback to static data
    return landingStrings.featuresGrid.features.map(feature => ({
      _id: Math.random().toString(),
      title: feature.title,
      description: feature.description,
      status: true,
      color: undefined,
      icon: ""
    }));
  }, [initialFeatures]);

  // Function to get frame icon based on index (cycles through 1-8)
  const getFrameIcon = (index: number) => {
    const frameNumber = (index % 8) + 1; // Cycles through 1-8
    const frames = [
      Constants.assetsIcon.assets.featureFrame1,
      Constants.assetsIcon.assets.featureFrame2,
      Constants.assetsIcon.assets.featureFrame3,
      Constants.assetsIcon.assets.featureFrame4,
      Constants.assetsIcon.assets.featureFrame5,
      Constants.assetsIcon.assets.featureFrame6,
      Constants.assetsIcon.assets.featureFrame7,
      Constants.assetsIcon.assets.featureFrame8,
    ];
    return frames[frameNumber - 1];
  };

  // Filter features by status (only show active features)
  const activeFeatures = features.filter(feature => feature.status !== false);

  // Function to handle view more click
  const handleViewMore = () => {
    setShowAll(true);
  };

  // Get features to display (first 6 or all based on showAll state)
  const displayedFeatures = showAll ? activeFeatures : activeFeatures.slice(0, 6);

  return (
    <div className="bg-white dark:bg-dark">
      <div className="pt-12 sm:pt-16 md:pt-20 lg:pt-24 xl:pt-28 2xl:pt-[130px] pb-10 sm:pb-12 md:pb-16 lg:pb-20 xl:pb-24 2xl:pb-[99px]">
        {/* Header */}
        <div className="text-center px-3 sm:px-4 md:px-6 lg:px-8 xl:px-10 2xl:px-8">
          <p className="text-primary font-caveat text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-[22px] leading-4 sm:leading-5 md:leading-6 lg:leading-7 xl:leading-8 2xl:leading-[32px] tracking-[4%] pb-1 sm:pb-2">The All-in-One POS Advantage</p>
          <p className="text-textMain dark:text-white font-poppins font-semibold text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl 2xl:text-[50px] leading-5 sm:leading-6 md:leading-7 lg:leading-8 xl:leading-9 2xl:leading-[60px]">
            Powerful Future for <span className="text-primary font-poppins font-semibold italic text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl 2xl:text-[50px] leading-5 sm:leading-6 md:leading-7 lg:leading-8 xl:leading-9 2xl:leading-[60px]">Modern Business</span>
          </p>
          <p className="pt-2 sm:pt-3 md:pt-4 lg:pt-5 xl:pt-6 2xl:pt-5 text-textSmall dark:text-neutral font-interTight text-xs sm:text-sm md:text-base lg:text-lg xl:text-lg 2xl:text-lg leading-4 sm:leading-5 md:leading-6 lg:leading-7 xl:leading-7 2xl:leading-[28px] max-w-xs sm:max-w-2xl lg:max-w-3xl xl:max-w-3xl 2xl:max-w-3xl mx-auto">
            {landingStrings.featuresGrid.subtitle}
          </p>
        </div>

        {/* Features Card Grid */}
        <div className="pt-6 sm:pt-8 md:pt-12 lg:pt-16 xl:pt-20 2xl:pt-[60px] px-3 sm:px-4 md:px-6 lg:px-8 xl:px-10 2xl:px-[99px]">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 auto-rows-fr items-stretch gap-3 sm:gap-4 md:gap-5 lg:gap-6 xl:gap-6 2xl:gap-[30px]">
            {displayedFeatures.map((feature, index) => {
              return (
                <div
                  key={feature._id}
                  className="pt-4 sm:pt-6 md:pt-8 lg:pt-10 xl:pt-12 2xl:pt-[40px] pb-3 sm:pb-4 md:pb-6 lg:pb-8 xl:pb-10 2xl:pb-[30px] px-2 sm:px-3 md:px-4 lg:px-6 xl:px-8 2xl:px-[9px] rounded-[8px] sm:rounded-[10px] md:rounded-[10px] lg:rounded-[10px] xl:rounded-[10px] 2xl:rounded-[10px] bg-textMain2 dark:bg-[#242930] text-center shadow-sm hover:shadow-md dark:shadow-gray-900/20 transition-all h-full flex flex-col"
                >
                  <div className="flex items-center justify-center">
                    <Image
                      src={feature.icon || getFrameIcon(index) || ""}
                      alt={feature.title}
                      width={66}
                      height={66}
                      className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 xl:w-16 xl:h-16 2xl:w-[66px] 2xl:h-[66px]"
                    />
                  </div>
                  <div className="pt-3 sm:pt-4 md:pt-6 lg:pt-8 xl:pt-10 2xl:pt-[30px]">
                    <h3 className="text-textMain dark:text-white font-poppins font-semibold text-sm sm:text-base md:text-lg lg:text-xl xl:text-xl 2xl:text-[22px] leading-4 sm:leading-5 md:leading-6 lg:leading-7 xl:leading-7 2xl:leading-[32px]">{feature.title}</h3>
                    <p className="pt-1 sm:pt-2 md:pt-3 lg:pt-4 xl:pt-5 2xl:pt-[10px] text-textSmall dark:text-neutral font-interTight font-normal text-xs sm:text-sm md:text-base lg:text-base xl:text-lg 2xl:text-lg leading-3 sm:leading-4 md:leading-5 lg:leading-6 xl:leading-6 2xl:leading-[22px] line-clamp-2 sm:line-clamp-3 md:line-clamp-3 lg:line-clamp-2 xl:line-clamp-3 2xl:line-clamp-3">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* View More Button */}
        {activeFeatures.length > 8 && !showAll && (
          <div className="pt-6 sm:pt-8 md:pt-12 lg:pt-16 xl:pt-20 2xl:pt-[60px] text-center">
            <Button
              onClick={handleViewMore}
              variant="outline"
              className="font-interTight font-semibold text-base leading-[26px] h-8 sm:h-9 md:h-10 lg:h-11 xl:h-12 2xl:h-[44px] w-full sm:w-auto lg:w-[179px] xl:w-[179px] 2xl:w-[179px] rounded-[4px] pt-[8px] sm:pt-[9px] md:pt-[10px] lg:pt-[10px] xl:pt-[10px] 2xl:pt-[10px] pb-[8px] sm:pb-[9px] md:pb-[10px] lg:pb-[10px] xl:pb-[10px] 2xl:pb-[10px] pl-[16px] sm:pl-[18px] md:pl-[20px] lg:pl-[20px] xl:pl-[20px] 2xl:pl-[20px] pr-[16px] sm:pr-[18px] md:pr-[20px] lg:pr-[20px] xl:pr-[20px] 2xl:pr-[20px] gap-2"
            >
              View More
              <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-5 lg:h-5 xl:w-5 xl:h-5 2xl:w-5 2xl:h-5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
"use client"

import Image from "next/image";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';
import { WebComponents } from "@/components";
import { Constants } from "@/constant";
import { LandingTypes } from "@/types";

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

interface ProductOverviewProps {
  initialDashboards?: LandingTypes.ProductOverviewRow.IProductOverviewRow[];
}

export default function ProductOverview({ initialDashboards }: ProductOverviewProps) {
  const dashboards: LandingTypes.ProductOverviewRow.IProductOverviewRow[] = initialDashboards && initialDashboards.length > 0
    ? initialDashboards
    : [
      {
        _id: "dashboard-1",
        title: "Analytics Dashboard",
        description: "Deep dive into your business data with advanced charts, trends analysis, and performance insights.",
        overviewImage: Constants.assetsIcon.assets.analyticsDashboard.src,
        color: "#EDF5FF",
        status: true,
        createdAt: "",
        updatedAt: "",
      },
      {
        _id: "dashboard-2",
        title: "Main Dashboard",
        description: "Comprehensive overview with key metrics and quick actions.",
        overviewImage: Constants.assetsIcon.assets.mainDashboard.src,
        color: "#FFFFFF",
        status: true,
        createdAt: "",
        updatedAt: "",
      },
      {
        _id: "dashboard-3",
        title: "Sales Dashboard",
        description: "Track sales performance and monitor revenue trends.",
        overviewImage: Constants.assetsIcon.assets.salesDashboard.src,
        color: "#F3F0FF",
        status: true,
        createdAt: "",
        updatedAt: "",
      },
    ];

  return (
    <>
      <div className="bg-[#F6FBFF] dark:bg-[#0A192F] overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-8 py-12 sm:py-16 md:py-20 lg:py-24 xl:py-28 2xl:py-[130px]">
          {/* Header */}
          <div className="text-left">
            {/* Product Overview Label */}
            <p className="text-primary font-caveat text-sm sm:text-base md:text-lg lg:text-xl 2xl:text-[22px] leading-relaxed mb-1 sm:mb-2">
              The All-in-One POS Advantage
            </p>              <h2 className="text-textMain dark:text-white font-poppins font-semibold text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-[50px] leading-tight mb-2 sm:mb-3">
              Our Product <span className="text-primary font-poppins font-semibold italic">Overview</span>
            </h2>
            {/* Description */}
            <p className="text-textSmall dark:text-neutral font-interTight text-xs sm:text-sm md:text-base lg:text-lg leading-relaxed max-w-full sm:max-w-2xl md:max-w-3xl">
              From payment processing to advanced analytics, POSPro provides everything you need to run and grow your business efficiently.
            </p>
          </div>

          {/* Swiper Carousel - Scrollable on Mobile */}
          <WebComponents.UiComponents.UiWebComponents.ScrollAnimation className="w-full pt-6 sm:pt-8 md:pt-10 lg:pt-12 xl:pt-16 2xl:pt-[30px] overflow-x-auto">
            <Swiper
              modules={[Navigation, Pagination, Autoplay, EffectFade]}
              spaceBetween={16}
              slidesPerView={1}
              loop={true}
              autoplay={{
                delay: 2000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
                reverseDirection: false,
              }}
              pagination={{
                dynamicBullets: true,
                clickable: true,
              }}
              breakpoints={{
                320: {
                  slidesPerView: 1,
                  spaceBetween: 12,
                },
                640: {
                  slidesPerView: 2,
                  spaceBetween: 16,
                },
                1024: {
                  slidesPerView: 3,
                  spaceBetween: 20,
                },
                1280: {
                  slidesPerView: 4,
                  spaceBetween: 24,
                },
              }}
              className="product-overview-swiper !py-6 sm:!py-8"
            >
              {dashboards.map((dashboard, index) => (
                <SwiperSlide key={`${dashboard._id}-${index}`} className="!px-1 sm:!px-2">
                  <div className="bg-white dark:bg-[#203452] rounded-xl sm:rounded-2xl md:rounded-[16px] p-3 sm:p-4 md:p-5 lg:p-6 h-full flex flex-col transition-all duration-500 ">
                    {/* Image Container - Responsive Size */}
                    <div className="relative w-full h-[180px] sm:h-[200px] md:h-[240px] lg:h-[280px] overflow-hidden mb-3 sm:mb-4 md:mb-5 lg:mb-6 rounded-lg sm:rounded-xl md:rounded-[14px] lg:rounded-[16px] flex-shrink-0">
                      <Image
                        src={dashboard.overviewImage}
                        alt={dashboard.title}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Content Section - Responsive */}
                    <div className="flex flex-col flex-1 min-h-[90px] sm:min-h-[100px] md:min-h-[110px] lg:min-h-[120px]">
                      <h3 className="text-textMain dark:text-white font-poppins font-semibold text-base sm:text-lg md:text-xl mb-1.5 sm:mb-2 line-clamp-1">
                        {dashboard.title}
                      </h3>
                      <p className="text-textSmall dark:text-neutral font-interTight font-normal text-xs sm:text-sm md:text-base leading-relaxed line-clamp-3">
                        {dashboard.description}
                      </p>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </WebComponents.UiComponents.UiWebComponents.ScrollAnimation>
        </div>
      </div>
    </>
  );
}
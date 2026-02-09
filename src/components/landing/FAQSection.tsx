import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Constants } from "@/constant";
import { LandingTypes } from "@/types";
import { WebComponents } from "@/components";
import { landingStrings } from "@/constant/common";

interface FAQSectionProps {
  faqs: LandingTypes.FAQ.IFAQ[];
  loading?: boolean;
  error?: string | null;
}

export default function FAQSection({ faqs, loading = false, error = null }: FAQSectionProps) {
  const [openIndex, setOpenIndex] = React.useState<number>(0);

  // Use dummy data if no FAQs provided
  const displayFaqs = (!faqs || faqs.length === 0) ? landingStrings.faq.dummyFaqs : faqs;

  // Show loading state
  if (loading) {
    return (
      <section className="py-10 sm:py-12 md:py-16 lg:py-20 xl:py-24 2xl:py-16 bg-white dark:bg-slate-900">
        <div className="max-w-3xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-10 2xl:px-8">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-3 sm:h-4 md:h-5 lg:h-6 xl:h-6 2xl:h-6 bg-gray-300 dark:bg-slate-600 rounded w-10 sm:w-12 md:w-14 lg:w-16 xl:w-16 2xl:w-16 mx-auto mb-2 sm:mb-3 md:mb-4 lg:mb-4 xl:mb-4 2xl:mb-4"></div>
              <div className="h-5 sm:h-6 md:h-7 lg:h-8 xl:h-8 2xl:h-8 bg-gray-300 dark:bg-slate-600 rounded w-56 sm:w-64 md:w-72 lg:w-80 xl:w-80 2xl:w-80 mx-auto mb-2 sm:mb-3 md:mb-4 lg:mb-4 xl:mb-4 2xl:mb-4"></div>
              <div className="h-2 sm:h-3 md:h-4 lg:h-4 xl:h-4 2xl:h-4 bg-gray-300 dark:bg-slate-600 rounded w-72 sm:w-80 md:w-96 lg:w-96 xl:w-96 2xl:w-96 mx-auto"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Show error state
  if (error) {
    return (
      <section className="py-10 sm:py-12 md:py-16 lg:py-20 xl:py-24 2xl:py-16 bg-white dark:bg-slate-900">
        <div className="max-w-3xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-10 2xl:px-8">
          <div className="text-center">
            <div className="text-red-600 dark:text-red-400 mb-2 sm:mb-3 md:mb-4 lg:mb-4 xl:mb-4 2xl:mb-4">
              <p className="text-xs sm:text-sm md:text-base lg:text-base xl:text-base 2xl:text-base">Failed to load FAQs: {error}</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Show empty state - now uses dummy data instead
  if (!faqs || faqs.length === 0) {
    // Continue to render with dummy data instead of showing empty state
  }

  return (
    <div className="bg-white dark:bg-[#0D1117]">
      <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-16 2xl:px-[320px] py-12 sm:py-16 md:py-20 lg:py-24 xl:py-28 2xl:py-[130px]">
        {/* Header */}
        <div className="text-center">
          <p className="text-primary font-caveat text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-[22px] leading-4 sm:leading-5 md:leading-6 lg:leading-7 xl:leading-8 2xl:leading-[32px]">
            FAQ
          </p>
          <p className="text-textMain dark:text-white font-poppins font-semibold text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl 2xl:text-[50px] leading-5 sm:leading-6 md:leading-7 lg:leading-8 xl:leading-9 2xl:leading-[60px] pt-1">
            Frequently Asked <span className="text-primary font-poppins font-semibold italic text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl 2xl:text-[50px] leading-5 sm:leading-6 md:leading-7 lg:leading-8 xl:leading-9 2xl:leading-[60px]">Question</span>
          </p>

          {/* Description */}
          <p className="text-textSmall dark:text-neutral font-interTight text-xs sm:text-sm md:text-base lg:text-lg xl:text-lg 2xl:text-lg leading-4 sm:leading-5 md:leading-6 lg:leading-7 xl:leading-7 2xl:leading-[28px] font-normal pt-2 sm:pt-3 md:pt-4 lg:pt-5 xl:pt-6 2xl:pt-5">
            Flexible pricing options designed to grow with your business. Start free and upgrade anytime.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="pt-6 sm:pt-8 md:pt-12 lg:pt-16 xl:pt-20 2xl:pt-[60px]">
          {displayFaqs.slice(0, 5).map((faq, index) => (
            <div key={faq.id || faq._id || index} className="border-b border-gray-200 dark:border-slate-700 last:border-b-0">
              <button
                type="button"
                className="w-full py-3 sm:py-4 md:py-5 lg:py-6 xl:py-6 2xl:py-6 flex justify-between items-start sm:items-center hover:bg-transparent transition-colors duration-200"
                onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
              >
                <div className="flex text-left">
                  <h6 className="text-textMain dark:text-white font-poppins font-semibold text-sm sm:text-base md:text-lg lg:text-xl xl:text-xl 2xl:text-[20px] leading-4 sm:leading-5 md:leading-6 lg:leading-7 xl:leading-7 2xl:leading-[30px] tracking-[1%]">Q.</h6>
                  <h6 className="text-textMain dark:text-white font-poppins font-semibold text-sm sm:text-base md:text-lg lg:text-xl xl:text-xl 2xl:text-[20px] leading-4 sm:leading-5 md:leading-6 lg:leading-7 xl:leading-7 2xl:leading-[30px] tracking-[1%] pl-3 sm:pl-4 md:pl-4 lg:pl-4 xl:pl-4 2xl:pl-4 pr-3 sm:pr-4 md:pr-4 lg:pr-4 xl:pr-4 2xl:pr-4">{faq.question}</h6>
                </div>
                <div className="flex-shrink-0 ml-1 sm:ml-2 md:ml-4 lg:ml-4 xl:ml-4 2xl:ml-4">
                  {openIndex === index ? (
                    <Image
                      src={Constants.assetsIcon.assets.faqIcon}
                      alt="Minus icon"
                      width={20}
                      height={20}
                      className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-5 lg:h-5 xl:w-5 xl:h-5 2xl:w-5 2xl:h-5"
                    />
                  ) : (
                    <Image
                      src={Constants.assetsIcon.assets.faqIconPlus}
                      alt="Plus icon"
                      width={20}
                      height={20}
                      className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-5 lg:h-5 xl:w-5 xl:h-5 2xl:w-5 2xl:h-5"
                    />
                  )}
                </div>
              </button>

              {openIndex === index && (
                <div className="pt-1 sm:pt-2 md:pt-3 lg:pt-4 xl:pt-4 2xl:pt-4 pl-[30px] sm:pl-[34px] md:pl-[36px] lg:pl-[38px] xl:pl-[38px] 2xl:pl-[38px] pr-[32px] sm:pr-[36px] md:pr-[38px] lg:pr-[40px] xl:pr-[40px] 2xl:pr-[40px] pb-[24px] sm:pb-[28px] md:pb-[30px] lg:pb-[32px] xl:pb-[32px] 2xl:pb-[32px]">
                  <p className="text-textSmall dark:text-neutral font-interTight text-xs sm:text-sm md:text-base lg:text-base xl:text-base 2xl:text-base leading-4 sm:leading-5 md:leading-6 lg:leading-6 xl:leading-6 2xl:leading-[28px]">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Explore More Button */}
        {faqs.length > 5 && (
          <div className="text-center pt-6 sm:pt-8 md:pt-12 lg:pt-16 xl:pt-20 2xl:pt-[60px]">
            <WebComponents.UiComponents.UiWebComponents.Button
              variant="outline"
              className="font-interTight font-semibold text-base leading-[24px] h-8 sm:h-9 md:h-10 lg:h-11 xl:h-12 2xl:h-[44px] w-full sm:w-auto lg:w-[179px] xl:w-[179px] 2xl:w-[179px] rounded-[4px] pt-[8px] sm:pt-[9px] md:pt-[10px] lg:pt-[10px] xl:pt-[10px] 2xl:pt-[10px] pb-[8px] sm:pb-[9px] md:pb-[10px] lg:pb-[10px] xl:pb-[10px] 2xl:pb-[10px] pl-[16px] sm:pl-[18px] md:pl-[20px] lg:pl-[20px] xl:pl-[20px] 2xl:pl-[20px] pr-[16px] sm:pr-[18px] md:pr-[20px] lg:pr-[20px] xl:pr-[20px] 2xl:pr-[20px] gap-2"
            >
              <Link href="/faq" className="flex items-center">
                Explore More
                <ArrowRight className="w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4 lg:w-4 lg:h-4 xl:w-4 xl:h-4 2xl:w-4 2xl:h-4 ml-1 sm:ml-1 md:ml-2 lg:ml-2 xl:ml-2 2xl:ml-2" />
              </Link>
            </WebComponents.UiComponents.UiWebComponents.Button>
          </div>
        )}

        {/* Bottom CTA */}
        <div className="text-center pt-6 sm:pt-8 md:pt-12 lg:pt-16 xl:pt-20 2xl:pt-[60px]">
          <div className="text-textMain dark:text-white font-interTight text-xs sm:text-sm md:text-base lg:text-lg xl:text-lg 2xl:text-lg leading-4 sm:leading-5 md:leading-6 lg:leading-6 xl:leading-6 2xl:leading-[26px]">
            <span className="block sm:inline">Still have questions? we&apos;re here to help.</span>{" "}
            <button className="text-primary font-interTight text-xs sm:text-sm md:text-base lg:text-lg xl:text-lg 2xl:text-lg leading-4 sm:leading-5 md:leading-6 lg:leading-6 xl:leading-6 2xl:leading-[26px] hover:underline inline-block">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";
import React from "react";
import Image from "next/image";
import { Constants } from "@/constant";
import { WebComponents } from "@/components";
import { LandingTypes } from "@/types";

interface ExploreFaqSectionProps {
  faqs: LandingTypes.FAQ.IFAQ[];
  loading?: boolean;
  error?: string | null;
}

export default function ExploreFaqSection({ faqs, loading = false, error = null }: ExploreFaqSectionProps) {
  const [openIndex, setOpenIndex] = React.useState<number>(0);
  const [selectedCategory, setSelectedCategory] = React.useState<string>("");

  const categories = React.useMemo(() => {
    if (!faqs) return [];
    const uniqueCategories: { id: string; name: string }[] = [];
    const seenIds = new Set();

    (faqs as any[]).forEach((faq) => {
      if (faq.categoryId && !seenIds.has(faq.categoryId._id)) {
        seenIds.add(faq.categoryId._id);
        uniqueCategories.push({
          id: faq.categoryId._id,
          name: faq.categoryId.categoryName
        });
      }
    });
    return uniqueCategories;
  }, [faqs]);

  React.useEffect(() => {
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0].id);
    }
  }, [categories, selectedCategory]);

  const filteredFaqs = React.useMemo(() => {
    if (!selectedCategory) return [];
    return (faqs as any[]).filter(faq => faq.categoryId?._id === selectedCategory);
  }, [faqs, selectedCategory]);

  if (loading) {
    return (
      <div className="py-20 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-slate-300 dark:bg-slate-600 rounded w-64 mx-auto mb-4"></div>
              <div className="h-4 bg-slate-300 dark:bg-slate-600 rounded w-96 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-20 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-red-600 dark:text-red-400 mb-4">
              <p className="text-sm sm:text-base">Failed to load FAQs: {error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!faqs || faqs.length === 0) {
    return (
      <div className="py-20 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-gray-500 dark:text-slate-400">
              <p className="text-sm sm:text-base">No FAQs available at the moment.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-20 bg-white dark:bg-slate-900">

      <div className="bg-gray-300 dark:bg-slate-800">
        <div className="flex justify-center items-center py-7">
          <WebComponents.Breadcrumbs items={[
            { label: "Home", href: "/" },
            { label: "FAQ" }
          ]} />
        </div>
      </div>

      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-primary font-caveat text-sm sm:text-base md:text-lg lg:text-[22px] leading-5 sm:leading-6 md:leading-7 lg:leading-[32px]">
            FAQ
          </p>
          <h1 className="text-textMain dark:text-white font-poppins font-semibold text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-[50px] leading-6 sm:leading-7 md:leading-8 lg:leading-9 xl:leading-[60px] pt-1">
            Frequently Asked <span className="text-primary font-poppins font-semibold italic text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-[50px] leading-6 sm:leading-7 md:leading-8 lg:leading-9 xl:leading-[60px]">Questions</span>
          </h1>
          <p className="text-textSmall dark:text-neutral font-interTight text-sm sm:text-base md:text-lg leading-5 sm:leading-6 md:leading-7 lg:leading-[28px] font-normal pt-3 sm:pt-4 lg:pt-5 max-w-2xl mx-auto">
            Find answers to common questions about our POS system and services.
          </p>
        </div>

        {/* Category Tabs */}
        {categories.length > 0 && (
          <div className="flex flex-wrap justify-center gap-4 sm:gap-8 mb-8 sm:mb-12 px-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => {
                  setSelectedCategory(category.id);
                  setOpenIndex(0); // Reset open index when category changes
                }}
                className={`text-sm sm:text-base font-semibold uppercase tracking-wider transition-colors duration-200 ${selectedCategory === category.id
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        )}

        {/* FAQ Accordion */}
        <div className="max-w-4xl mx-auto">
          {filteredFaqs.map((faq, index) => (
            <div key={faq.id || faq._id} className="border-b border-gray-200 dark:border-slate-700 last:border-b-0">
              <button
                className="w-full py-4 sm:py-5 lg:py-6 flex justify-between items-start sm:items-center hover:bg-transparent transition-colors duration-200"
                onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
              >
                <div className="flex text-left">
                  <h6 className="text-textMain dark:text-white font-poppins font-semibold text-base sm:text-lg lg:text-[20px] leading-5 sm:leading-6 lg:leading-[30px] tracking-[1%]">Q.</h6>
                  <h6 className="text-textMain dark:text-white font-poppins font-semibold text-base sm:text-lg lg:text-[20px] leading-5 sm:leading-6 lg:leading-[30px] tracking-[1%] pl-4 pr-4">{faq.question}</h6>
                </div>
                <div className="flex-shrink-0 ml-2 sm:ml-4">
                  {openIndex === index ? (
                    <Image
                      src={Constants.assetsIcon.assets.faqIcon}
                      alt="Minus icon"
                      width={20}
                      height={20}
                      className="w-4 h-4 sm:w-5 sm:h-5"
                    />
                  ) : (
                    <Image
                      src={Constants.assetsIcon.assets.faqIconPlus}
                      alt="Plus icon"
                      width={20}
                      height={20}
                      className="w-4 h-4 sm:w-5 sm:h-5"
                    />
                  )}
                </div>
              </button>

              {openIndex === index && (
                <div className="pt-2 sm:pt-3 lg:pt-4 pl-[38px] pr-[40px] pb-[32px]">
                  <p className="text-textSmall dark:text-neutral font-interTight text-sm sm:text-base leading-5 sm:leading-6 lg:leading-[28px]">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center pt-8 sm:pt-12 md:pt-16 lg:pt-[60px]">
          <div className="text-textMain dark:text-white font-interTight text-sm sm:text-base md:text-lg leading-5 sm:leading-6 lg:leading-[26px]">
            <span className="block sm:inline">Still have questions? we&apos;re here to help.</span>{" "}
            <button className="text-primary font-interTight text-sm sm:text-base md:text-lg leading-5 sm:leading-6 lg:leading-[26px] hover:underline inline-block">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


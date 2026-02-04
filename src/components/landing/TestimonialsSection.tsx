import React from "react";
import { Star } from "lucide-react";
import { HomeTypes } from "@/types";
import { landingStrings } from "@/constant/common";

interface TestimonialsSectionProps {
  testimonials: HomeTypes.Testimonial[];
}

export default function TestimonialsSection({ testimonials: initialTestimonials }: TestimonialsSectionProps) {
  const testimonials = initialTestimonials?.length > 0
    ? initialTestimonials
    : landingStrings.testimonials.dummyTestimonials;
  if (!testimonials || testimonials.length === 0) {
    return (
      <section className="py-10 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-800 dark:to-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-slate-300 dark:bg-slate-600 rounded w-64 mx-auto mb-4"></div>
              <div className="h-4 bg-slate-300 dark:bg-slate-600 rounded w-96 mx-auto"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-800 dark:to-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            {landingStrings.testimonials.title}
          </h2>
          <p className="font-interTight text-[18px] leading-[28px] font-normal text-textSmall max-w-2xl mx-auto">
            {landingStrings.testimonials.subtitle}
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg hover-lift animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Rating */}
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${i < testimonial.rating
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300 dark:text-gray-600'
                      }`}
                  />
                ))}
              </div>

              {/* Testimonial Text */}
              <blockquote className="text-slate-700 dark:text-slate-300 mb-6 leading-relaxed">
                &quot;{testimonial.testimonial}&quot;
              </blockquote>

              {/* Customer Info */}
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-semibold text-lg">
                    {testimonial.customer_name ? testimonial.customer_name.charAt(0) : "?"}
                  </span>
                </div>
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">
                    {testimonial.customer_name}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    {testimonial.position} at {testimonial.business_name}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {testimonial.business_type}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="mt-16 bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div className="animate-fade-in">
              <div className="text-3xl font-bold text-blue-600 mb-2">{landingStrings.testimonials.stats.activeBusinesses}</div>
              <div className="text-slate-600 dark:text-slate-400">{landingStrings.common.activeBusinesses}</div>
            </div>
            <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="text-3xl font-bold text-green-600 mb-2">{landingStrings.testimonials.stats.uptime}</div>
              <div className="text-slate-600 dark:text-slate-400">{landingStrings.common.uptime}</div>
            </div>
            <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="text-3xl font-bold text-purple-600 mb-2">{landingStrings.testimonials.stats.customerRating}</div>
              <div className="text-slate-600 dark:text-slate-400">{landingStrings.common.customerRating}</div>
            </div>
            <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="text-3xl font-bold text-orange-600 mb-2">{landingStrings.testimonials.stats.support}</div>
              <div className="text-slate-600 dark:text-slate-400">{landingStrings.common.support}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 
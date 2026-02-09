"use client";
import React from "react";
import Image from "next/image";
import { useTheme } from "next-themes";
import { WebComponents } from "@/components";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createPageUrl } from "@/utils";
import { ArrowRight, CheckCircle, Mail, Phone, Facebook, Instagram, Youtube, Twitter } from "lucide-react";
import DemoRequestForm from "./DemoRequestForm";
import { DemoRequestProvider } from "@/contexts/DemoRequestContext";
import { publicAPI } from "@/lib/api";
import { Constants } from "@/constant";
import { useGeneralSettings } from "@/contexts/GeneralSettingsContext";
import { HomeTypes, SuperAdminTypes } from "@/types";
interface LandingFooterProps {
  user: { name?: string; email?: string; roleId?: number } | null;
  trialDays?: number;
  footerSection?: HomeTypes.FooterSection | null;
  socialMedia?: SuperAdminTypes.LandingSettingPageTypes.SocialMediaSettings | null;
}

export default function LandingFooter({ user, trialDays = 7, footerSection = null, socialMedia = null }: LandingFooterProps) {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const [showDemoForm, setShowDemoForm] = React.useState(false);
  const { generalSettings } = useGeneralSettings();
  const [isLoading, setIsLoading] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

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

  const handleGetStarted = () => {
    if (!user) {
      router.push("/login");
    } else {
      router.push(createPageUrl("DemoRequest"));
    }
  };

  const handleRequestDemo = () => {
    setShowDemoForm(true);
  };

  const logoUrl = mounted ? (resolvedTheme === 'dark' ? generalSettings?.logos?.darkLogo?.url : generalSettings?.logos?.lightLogo?.url) : null;

  const description = generalSettings?.siteDescription || footerSection?.description ||
    "Transform your business with our cloud-based POS system. Simplify your operations, track inventory in real time, and deliver a seamless checkout experience, all from one powerful platform.";
  const ctaTitle = footerSection?.cta?.title ?? "Ready to Take Your Business to the Next Level?";
  const ctaSubtitle = footerSection?.cta?.subtitle ?? "Join over 50,000 thriving businesses already growing with POSPro. Start your free trial today and see how a modern POS system can help.";

  // Static links that should always be present
  const staticLinks = [
    { _id: "features", title: "Features", link: "#features", active: true },
    { _id: "pricing", title: "Pricing", link: "#pricing", active: true },
    { _id: "faq", title: "FAQ", link: "#faq", active: true },
    { _id: "contact", title: "Contact us", link: "/contact", active: true },
  ];

  // Dynamic links from API response
  // Get links from the correct location in the response structure
  const apiLinks = footerSection?.data?.links || footerSection?.links || [];

  const dynamicLinks = apiLinks.filter((link: HomeTypes.FooterLink) => {
    return link.status === true;
  });

  // Combine static and dynamic links
  const allLinks = [...staticLinks, ...dynamicLinks];

  return (

    <div
      style={{
        backgroundImage: `url(${Constants.assetsIcon.assets.footerBgDesign.src})`,
      }}
      className="bg-cover bg-center"
    >

      {/* Main Footer Content */}
      <div className="container mx-auto px-3 sm:px-4 md:px-5 lg:px-6 xl:px-8 2xl:px-10 py-4 sm:py-6 md:py-8 lg:py-10 xl:py-12 2xl:py-16 pb-2 sm:pb-3 md:pb-4 lg:pb-5 xl:pb-6 2xl:pb-8">
        <div className="flex flex-col xl:flex-row flex-1">
          {/* Left Section - Company Info */}
          <div className="w-full xl:w-auto">
            {/* Brand Name */}
            <div className="text-center xl:text-left">
              {logoUrl ? (
                <div className="relative h-12 w-auto mb-2">
                  <Image
                    src={logoUrl}
                    alt={generalSettings?.appName || "Logo"}
                    width={0}
                    height={0}
                    sizes="100vw"
                    className="h-full w-auto object-contain"
                  />
                </div>
              ) : (
                <p className="text-primary font-interTight font-black text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl 2xl:text-[40px] leading-[100%] sm:leading-[100%] md:leading-[100%] lg:leading-[100%] xl:leading-[100%] 2xl:leading-[100%] tracking-[6%] uppercase">
                  POS<span className="text-white font-interTight font-normal text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl 2xl:text-[40px] leading-[100%] tracking-[6%] italic uppercase">Pro</span>
                </p>
              )}
              <p className="w-full max-w-[300px] sm:max-w-[350px] md:max-w-[400px] lg:max-w-[451px] xl:max-w-[451px] 2xl:max-w-[451px] mx-auto xl:mx-0 xl:w-[451px] 2xl:w-[451px] h-auto xl:h-[112px] 2xl:h-[112px] text-[#F2F2F2] font-interTight font-normal text-xs sm:text-sm md:text-base lg:text-lg xl:text-lg 2xl:text-lg leading-6 sm:leading-7 md:leading-8 lg:leading-9 xl:leading-[28px] 2xl:leading-[28px] pt-1 sm:pt-2 md:pt-2 lg:pt-2 xl:pt-[10px] 2xl:pt-[10px]">
                {description}
              </p>
            </div>

            {/* Contact Information */}
            <div className="pt-4 sm:pt-6 md:pt-8 lg:pt-10 xl:pt-12 2xl:pt-[40px] flex flex-col gap-3 sm:gap-4 md:gap-5 lg:gap-5 xl:gap-6 2xl:gap-6">
              <div className="flex items-center justify-center xl:justify-start gap-2 xl:gap-[7px] 2xl:gap-[7px]">
                <Mail className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-5 lg:h-5 xl:w-5 xl:h-5 2xl:w-5 2xl:h-5 text-white" />
                <span className="text-white font-interTight font-normal text-xs sm:text-sm md:text-base lg:text-base xl:text-lg 2xl:text-lg leading-5 sm:leading-6 md:leading-7 lg:leading-7 xl:leading-[26px] 2xl:leading-[26px]">{generalSettings?.inquiryEmail || 'pospro@demo.com'}</span>
              </div>
              <div className="flex items-center justify-center xl:justify-start gap-2 xl:gap-[7px] 2xl:gap-[7px]">
                <Phone className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-5 lg:h-5 xl:w-5 xl:h-5 2xl:w-5 2xl:h-5 text-white" />
                <span className="text-white font-interTight font-normal text-xs sm:text-sm md:text-base lg:text-base xl:text-lg 2xl:text-lg leading-5 sm:leading-6 md:leading-7 lg:leading-7 xl:leading-[26px] 2xl:leading-[26px]">{generalSettings?.contactNumber || '+1898-545-5267'}</span>
              </div>

              {/* Social Media Icons */}
              <div className="flex items-center justify-center xl:justify-start gap-2 sm:gap-3 md:gap-3 lg:gap-3 xl:gap-[10px] 2xl:gap-[10px]">
                {socialMedia?.FacebookLink && (
                  <a
                    href={socialMedia.FacebookLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary transition-colors"
                  >
                    <Facebook className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-6 lg:h-6 xl:w-7 xl:h-7 2xl:w-7 2xl:h-7 text-white cursor-pointer" />
                  </a>
                )}
                {socialMedia?.InstagramLink && (
                  <a
                    href={socialMedia.InstagramLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary transition-colors"
                  >
                    <Instagram className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-6 lg:h-6 xl:w-7 xl:h-7 2xl:w-7 2xl:h-7 text-white cursor-pointer" />
                  </a>
                )}
                {socialMedia?.YoutubeLink && (
                  <a
                    href={socialMedia.YoutubeLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary transition-colors"
                  >
                    <Youtube className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-6 lg:h-6 xl:w-7 xl:h-7 2xl:w-7 2xl:h-7 text-white cursor-pointer" />
                  </a>
                )}
                {socialMedia?.TwitterLink && (
                  <a
                    href={socialMedia.TwitterLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary transition-colors"
                  >
                    <Twitter className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-6 lg:h-6 xl:w-7 xl:h-7 2xl:w-7 2xl:h-7 text-white cursor-pointer" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Vertical Divider Line - Hidden on mobile/tablet, visible on xl */}
          <div className="hidden xl:block pl-6 xl:pl-6 2xl:pl-[45px]">
            <div className="h-[220px] xl:h-[260px] 2xl:h-[300px] min-h-[1em] w-[0.3px] self-stretch bg-white"></div>
          </div>

          {/* Right Section - Links */}
          <div className="w-full xl:w-auto mt-6 sm:mt-8 md:mt-8 lg:mt-8 xl:mt-0">
            <div className="text-center xl:text-left xl:pl-8 2xl:pl-12">
              {/* Slogan */}
              <p className="text-[#F2F2F2] font-caveat font-normal text-sm sm:text-base md:text-lg lg:text-xl xl:text-xl 2xl:text-[22px] leading-6 sm:leading-7 md:leading-8 lg:leading-9 xl:leading-9 2xl:leading-[32px] tracking-[4%]">
                Grow Smarter, Sell Faster.
              </p>

              {/* Main Heading */}
              <h2 className="text-white font-poppins font-semibold text-lg sm:text-xl md:text-2xl lg:text-2xl xl:text-3xl 2xl:text-[36px] leading-tight xl:leading-[44px] 2xl:leading-[48px] pt-1 line-clamp-2 xl:line-clamp-none">
                {ctaTitle}
              </h2>

              {/* Description */}
              <p className="text-[#F2F2F2] font-interTight font-normal text-xs sm:text-sm md:text-base lg:text-base xl:text-base 2xl:text-base leading-5 sm:leading-6 md:leading-6 lg:leading-6 xl:leading-[24px] 2xl:leading-[24px] pt-2 sm:pt-2 md:pt-3 lg:pt-3 xl:pt-4 2xl:pt-4 max-w-xs sm:max-w-sm md:max-w-lg lg:max-w-xl xl:max-w-2xl 2xl:max-w-2xl mx-auto xl:mx-0">
                {ctaSubtitle}
              </p>
            </div>

            {/* Benefits */}
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4 md:gap-6 lg:gap-6 xl:gap-8 2xl:gap-10 pt-4 sm:pt-5 md:pt-6 lg:pt-6 xl:pt-8 2xl:pt-8 justify-center xl:justify-start xl:pl-6 2xl:pl-8">
              <div className="flex items-center gap-2 sm:gap-3 md:gap-3 lg:gap-3 xl:gap-3 2xl:gap-3 justify-center xl:justify-start">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 md:w-5 md:h-5 lg:w-5 lg:h-5 xl:w-6 xl:h-6 2xl:w-6 2xl:h-6 text-[#D6FF79] flex-shrink-0" />
                <span className="text-white font-interTight font-normal text-xs sm:text-sm md:text-base lg:text-base xl:text-lg 2xl:text-lg leading-5 sm:leading-6 md:leading-7 lg:leading-7 xl:leading-[26px] 2xl:leading-[26px]">{`${trialDays}-day free trial`}</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 md:gap-3 lg:gap-3 xl:gap-3 2xl:gap-3 justify-center xl:justify-start">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 md:w-5 md:h-5 lg:w-5 lg:h-5 xl:w-6 xl:h-6 2xl:w-6 2xl:h-6 text-[#D6FF79] flex-shrink-0" />
                <span className="text-white font-interTight font-normal text-xs sm:text-sm md:text-base lg:text-base xl:text-lg 2xl:text-lg leading-5 sm:leading-6 md:leading-7 lg:leading-7 xl:leading-[26px] 2xl:leading-[26px]">No setup fees</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 md:gap-3 lg:gap-3 xl:gap-3 2xl:gap-3 justify-center xl:justify-start">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 md:w-5 md:h-5 lg:w-5 lg:h-5 xl:w-6 xl:h-6 2xl:w-6 2xl:h-6 text-[#D6FF79] flex-shrink-0" />
                <span className="text-white font-interTight font-normal text-xs sm:text-sm md:text-base lg:text-base xl:text-lg 2xl:text-lg leading-5 sm:leading-6 md:leading-7 lg:leading-7 xl:leading-[26px] 2xl:leading-[26px]">24/7 Expert Support</span>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4 lg:gap-4 xl:gap-4 2xl:gap-4 pt-4 sm:pt-6 md:pt-8 lg:pt-8 xl:pt-10 2xl:pt-12 justify-center xl:justify-start xl:pl-8 2xl:pl-12">
              <WebComponents.UiComponents.UiWebComponents.Button
                onClick={handleStartFreeTrial}
                disabled={isLoading}
                className="font-interTight font-semibold text-xs sm:text-sm md:text-base lg:text-base xl:text-base 2xl:text-base leading-5 sm:leading-6 md:leading-7 lg:leading-7 xl:leading-[24px] 2xl:leading-[24px]"
              >
                {isLoading ? "Starting..." : "Start Free Trial "}
                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" />
              </WebComponents.UiComponents.UiWebComponents.Button>

              <WebComponents.UiComponents.UiWebComponents.Button
                variant="outline"
                onClick={handleRequestDemo}
                className="font-interTight font-semibold text-xs sm:text-sm md:text-base lg:text-base xl:text-base 2xl:text-base leading-5 sm:leading-6 md:leading-7 lg:leading-7 xl:leading-[24px] 2xl:leading-[24px]"
              >
                View Live Demo
                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" />
              </WebComponents.UiComponents.UiWebComponents.Button>
            </div>

          </div>
        </div>

      </div>

      {/* Bottom Navigation Bar */}
      <div className="flex justify-center pt-2 sm:pt-3 md:pt-3 lg:pt-3 xl:pt-3 2xl:pt-3">
        <div className="bg-[#FFFFFF0F] rounded-[8px] sm:rounded-[10px] md:rounded-[10px] lg:rounded-[10px] xl:rounded-[10px] 2xl:rounded-[10px] max-w-4xl sm:max-w-5xl md:max-w-6xl lg:max-w-6xl xl:max-w-6xl 2xl:max-w-6xl">
          {/* Navigation Items */}
          <div className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-3 md:space-x-4 lg:space-x-5 xl:space-x-6 2xl:space-x-8 py-2 sm:py-3 md:py-3 lg:py-3 xl:py-4 2xl:py-5 px-3 sm:px-4 md:px-5 lg:px-6 xl:px-8 2xl:px-24">
            {allLinks.map((link, index) => {
              // Generate href based on link type
              let href;

              // For static links, use the predefined link property
              if (link._id === "features" || link._id === "pricing" || link._id === "faq" || link._id === "contact") {
                href = (link as any).link || `#${link.title.toLowerCase()}`;
              }
              // For dynamic footer links, use the footer-link route
              else if (link._id) {
                href = `/footer-link/${link._id}`;
              }
              // Fallback for any other links
              else {
                href = `/${link.title.toLowerCase().replace(/\s+/g, '')}`;
              }

              return (
                <Link
                  key={link._id || index}
                  href={href}
                  className={`font-interTight font-medium text-xs sm:text-sm md:text-base lg:text-base xl:text-base 2xl:text-base leading-4 sm:leading-5 md:leading-6 lg:leading-6 xl:leading-[18px] 2xl:leading-[18px] tracking-[5%] ${link._id === "features"
                    ? "text-primary"
                    : "text-[#F2F2F2]"
                    }`}
                >
                  {link.title}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <div className="border-t-[1px] sm:border-t-[1.5px] md:border-t-[1.5px] lg:border-t-[1.5px] xl:border-t-[1.5px] 2xl:border-t-[1.5px] border-[#2B2E40] mt-6 sm:mt-8 md:mt-8 lg:mt-8 xl:mt-8 2xl:mt-10">
        {/* Copyright text */}
        <div className="flex justify-center items-center py-4 sm:py-6 md:py-6 lg:py-6 xl:py-6 2xl:py-6">
          <p className="text-white font-interTight font-normal text-sm sm:text-base md:text-base lg:text-base xl:text-base 2xl:text-base leading-5 sm:leading-6 md:leading-7 lg:leading-7 xl:leading-[28px] 2xl:leading-[28px] text-center">
            {generalSettings?.footerText || 'Copyright 2025. Made with love by Iqonic Design.'}
          </p>
        </div>
      </div>

      {/* Demo Request Form */}
      {showDemoForm ? (
        <DemoRequestProvider>
          <DemoRequestForm
            isOpen={showDemoForm}
            onClose={() => setShowDemoForm(false)}
          />
        </DemoRequestProvider>
      ) : null}
    </div>
  );
}

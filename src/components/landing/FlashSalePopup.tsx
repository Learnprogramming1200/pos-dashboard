"use client";

import React from "react";
import { X } from "lucide-react";
import { SuperAdminTypes } from "@/types";
import Image from "next/image";
interface FlashSalePopupProps {
  isOpen: boolean;
  onClose: () => void;
  ads: SuperAdminTypes.AdvertisementTypes.Advertisement[];
}

export default function FlashSalePopup({ isOpen, onClose, ads }: FlashSalePopupProps) {
  const handleAdClick = (ad: SuperAdminTypes.AdvertisementTypes.Advertisement) => {
    if (ad.redirectUrl) {
      window.open(ad.redirectUrl, '_blank');
    }
  };

  // Don't render popup if it's closed or there is no ad content
  if (!isOpen || ads.length === 0) return null;

  const ad = ads[0];
  if (!ad) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Transparent overlay that allows scrolling */}
      <div
        className="absolute inset-0 bg-black/20"
        onClick={onClose}
      />

      {/* Popup Content: backend ad only */}
      <div className="relative max-w-4xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 text-gray-500 hover:text-gray-700"
        >
          <X className="h-5 w-5" />
        </button>

        {ads.length > 0 && (
          <div
            className="cursor-pointer"
            onClick={() => handleAdClick(ad)}
          >
            {/* Optional title from backend */}
            {ad.adName && (
              <div className="px-5 pt-5">
                <h2 className="text-2xl font-semibold text-gray-900">{ad.adName}</h2>
              </div>
            )}

            <div className="p-5">
              {ad.selectType === 'Image' && ad.mediaContent?.url && (
                <div className="relative w-full h-[300px] sm:h-[360px] md:h-[420px] lg:h-[480px] rounded-lg overflow-hidden">
                  <Image
                    src={ad.mediaContent.url}
                    alt={ad.adName}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              {ad.selectType === 'Video' && ad.mediaContent?.url && (
                <video
                  src={ad.mediaContent.url}
                  className="w-full h-[300px] sm:h-[360px] md:h-[420px] lg:h-[480px] rounded-lg object-cover"
                  controls
                  onClick={(e) => e.stopPropagation()}
                />
              )}
              {ad.selectType !== 'Image' && ad.selectType !== 'Video' && (
                <div className="text-gray-800 text-base">{ad.adName}</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
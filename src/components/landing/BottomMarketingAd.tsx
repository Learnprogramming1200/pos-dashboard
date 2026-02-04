"use client";

import React from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { Constants } from "@/constant";
import { SuperAdminTypes } from "@/types";

export interface BottomMarketingAdProps {
  isVisible: boolean;
  onClose: () => void;
  ads: SuperAdminTypes.AdvertisementTypes.Advertisement[];
  position: 'Left' | 'Right';
}

export default function BottomMarketingAd({ isVisible, onClose, ads, position }: BottomMarketingAdProps) {
  const [email, setEmail] = React.useState("");
  const [timeLeft, setTimeLeft] = React.useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Countdown timer - 3 days from now
  React.useEffect(() => {
    const targetTime = new Date().getTime() + (3 * 24 * 60 * 60 * 1000); // 3 days from now

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetTime - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleAdClick = (ad: SuperAdminTypes.AdvertisementTypes.Advertisement) => {
    if (ad.redirectUrl) {
      window.open(ad.redirectUrl, '_blank');
    }
  };

  const handleGetCoupon = () => {
    if (email) {
      alert("Coupon sent to your email!");
      onClose();
    }
  };

  const handleDecline = () => {
    onClose();
  };

  // Don't show if no ads or not visible
  if (!isVisible || ads.length === 0) return null;

  return (
    <div className={`fixed bottom-6 z-40 ${position === 'Left' ? 'left-6' : 'right-6'}`}>
      {ads.map((ad) => (
        <div key={ad._id} className="bg-white rounded-2xl border border-gray-300 shadow-2xl overflow-hidden w-80 max-h-96 mb-4">
          {/* Close Button */}
          <div className="absolute top-2 right-2 z-10">
            <button
              onClick={onClose}
              className="w-6 h-6 bg-white rounded border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              <X className="h-3 w-3 text-gray-600" />
            </button>
          </div>

          {/* Ad Content */}
          <div
            className="cursor-pointer"
            onClick={() => handleAdClick(ad)}
          >
            {ad.selectType === 'Image' && (
              <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                <Image
                  src={ad.mediaContent?.url || ''}
                  alt={ad.adName}
                  className="w-full h-full object-cover rounded-t-2xl"
                />
              </div>
            )}

            {ad.selectType === 'Text' && (
              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-800 mb-2">{ad.adName}</h3>
                <p className="text-sm text-gray-600">Click to learn more</p>
              </div>
            )}

            {ad.selectType === 'Video' && (
              <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                <video
                  src={ad.mediaContent?.url || ''}
                  className="w-full h-full object-cover rounded-t-2xl"
                  controls
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}
          </div>

          {/* Ad Info */}
          <div className="p-3 bg-gray-50">
            <p className="text-xs text-gray-500 text-center">
              Advertisement • {ad.clickCount} clicks
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

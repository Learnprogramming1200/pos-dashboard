"use client";

import Image from "next/image";
import { Constants } from "@/constant";
type SubscriptionSummaryVariant = "total" | "active" | "expired" | "expiringSoon";

type SubscriptionSummaryCardProps = Readonly<{
  variant: SubscriptionSummaryVariant;
  value: string;
  change?: string;
}>;

const CARD_CONFIG: Record<SubscriptionSummaryVariant, { title: string; iconSrc: string; iconBg: string }> = {
  total: {
    title: "Total Subscription",
    iconSrc: Constants.assetsIcon.assets.crown1,
    iconBg: "bg-[#FAF5FF]",
  },
  active: {
    title: "Active Subscription",
    iconSrc: Constants.assetsIcon.assets.crown2,
    iconBg: "bg-[#EFF6FE]",
  },
  expired: {
    title: "Expired Subscription",
    iconSrc: Constants.assetsIcon.assets.expiringSoon,
    iconBg: "bg-[#FDF0F4]",
  },
  expiringSoon: {
    title: "Expiring Soon",
    iconSrc: Constants.assetsIcon.assets.expiringSoon,
    iconBg: "bg-[#FFF7ED]",
  },
};

export default function SubscriptionSummaryCard({
  variant,
  value,
  change,
}: SubscriptionSummaryCardProps) {
  const config = CARD_CONFIG[variant];
  const { title, iconSrc, iconBg } = config;

  return (
    <div className="bg-white dark:bg-[#333333] rounded-[6px] border border-[#EBEBEB] dark:border-[#444444]">
      <div className="flex flex-col px-4 py-4 sm:px-5 sm:py-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col">
            <p className="text-sm font-medium text-[#6C757D] dark:text-gray-300">
              {title}
            </p>
            <p className="text-[20px] font-bold text-[#1C1F34] dark:text-white leading-9">
              {value}
            </p>
          </div>
          <div className={`${iconBg} rounded-[6px] p-3`}>
            <Image src={iconSrc} alt={title} width={20} height={20} />
          </div>
        </div>
        {change && (
          <div className="pt-3">
            {change === "-" ? (
              <p className="text-sm font-regular text-[#6C757D] dark:text-gray-400">
                {change}
              </p>
            ) : (
              <p className="text-sm font-regular">
                <span
                  className={
                    change.startsWith("+")
                      ? "text-[#1AC769] dark:text-green-400"
                      : change.startsWith("-")
                        ? "text-red-500 dark:text-red-400"
                        : "text-[#1AC769] dark:text-green-400"
                  }
                >
                  {change.split(" From Last Month")[0]}
                </span>
                <span className="text-[#6C757D] dark:text-gray-400">
                  {change.includes("From Last Month") ? " From Last Month" : ""}
                </span>
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}



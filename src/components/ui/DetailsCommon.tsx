import React from "react";

export const InfoCard = ({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) => (
  <div className="bg-gradient-to-br from-slate-50 to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
      <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
        {icon}
      </div>
      {title}
    </h3>
    <div className="space-y-5">{children}</div>
  </div>
);

export const InfoLabel = ({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) => (
  <div className="flex items-center gap-2 mb-2">
    {icon}
    <label className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
      {label}
    </label>
  </div>
);

export const InfoRow = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <div>
    <InfoLabel icon={icon} label={label} />
    <p className="text-lg font-semibold text-gray-900 dark:text-white ml-6">{value}</p>
  </div>
);

export const TimelineItem = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <div className="flex items-start gap-3">
    <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center flex-shrink-0 text-white">
      {icon}
    </div>
    <div>
      <label className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide block mb-1">
        {label}
      </label>
      <p className="text-base font-semibold text-gray-900 dark:text-white">{value}</p>
    </div>
  </div>
);

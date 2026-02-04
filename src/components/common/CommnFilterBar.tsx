"use client";

import React from "react";
import Image from "next/image";
import { Constants } from "@/constant";
import { WebComponents } from "..";

type SimpleOption = { name: string; value: string };
type StatusOption = { label: string; value: string };
export interface CommonFilterBarProps {
  /** Bulk action filter (e.g. "All" | "Status") */
  actionFilter?: string;
  onActionFilterChange?: (value: string) => void;
  actionOptions?: SimpleOption[];

  /** Secondary status to apply in bulk (Active / Inactive) */
  activeStatusFilter?: string;
  onActiveStatusFilterChange?: (value: string) => void;
  activeStatusOptions?: SimpleOption[];

  /** Number of currently selected rows */
  selectedCount?: number;
  /** Called when the Apply button is clicked */
  onApply?: () => void | Promise<void>;
  /** Category filter (left side) */
  categoryFilter?: string;
  onCategoryFilterChange?: (value: string) => void;
  categoryOptions?: SimpleOption[];
  /** Main status filter (right side) */
  statusFilter?: string;
  onStatusFilterChange?: (value: string) => void;
  statusOptions?: StatusOption[];
  /** Search term */
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  renderExports?: React.ReactNode;
  /** Optional actions that should appear next to the search bar */
  renderSearchActions?: React.ReactNode;
  categoryPlaceholder?: string;
  statusPlaceholder?: string;
  searchPlaceholder?: string;
  showActionSection?: boolean;
  showCategoryFilter?: boolean;
  showSearch?: boolean;
  categoryLabel?: string;
  statusLabel?: string;
  customStatusFilter?: string;
  onCustomStatusFilterChange?: (value: string) => void;
  customStatusOptions?: SimpleOption[];
  customStatusLabel?: string;
}


const CommonFilterBar: React.FC<CommonFilterBarProps> = ({
  actionFilter,
  onActionFilterChange,
  actionOptions,
  activeStatusFilter,
  onActiveStatusFilterChange,
  activeStatusOptions,
  selectedCount,
  onApply,
  categoryFilter,
  onCategoryFilterChange,
  categoryOptions,
  statusFilter,
  onStatusFilterChange,
  statusOptions,
  searchTerm,
  onSearchTermChange,
  renderExports,
  renderSearchActions,
  categoryPlaceholder = "All Categories",
  statusPlaceholder = "All Status",
  searchPlaceholder = "Search",
  showActionSection = true,
  showCategoryFilter = true,
  showSearch = true,
  categoryLabel,
  statusLabel,
  customStatusFilter,
  onCustomStatusFilterChange,
  customStatusOptions,
  customStatusLabel,
}) => {
  const isDisabled = selectedCount === 0;

  const handleActionChange = (value: string) => {
    onActionFilterChange?.(value);
    // Reset active status filter when action is not "Status"
    if (value !== "Status") {
      onActiveStatusFilterChange?.("All");
    }
  };

  return (
    <div className="p-3 sm:p-4 md:p-4 lg:p-4 xl:p-4 2xl:p-4 w-full overflow-hidden">
      <div className="flex flex-col lg:flex-row items-stretch justify-start lg:justify-between gap-3 sm:gap-4 md:gap-4 lg:gap-6 xl:gap-8 2xl:gap-10 w-full min-w-0 max-w-full">
        {/* Left group: bulk actions + exports */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-2 md:gap-2.5 lg:gap-3 xl:gap-3 2xl:gap-3 w-full lg:w-auto lg:flex-shrink-0 items-stretch min-w-0">
          {showActionSection && actionOptions && actionOptions.length > 0 && (
            <>
              {/* Action filter */}
              <div className="w-full sm:w-auto sm:flex-shrink-0 min-w-0 max-w-full">
                <WebComponents.UiComponents.UiWebComponents.FilterDropdown
                  value={actionFilter === "All" ? null : actionFilter}
                  onChange={(e: any) => handleActionChange(e.value ?? "All")}
                  options={[{ name: "No Action", value: "All" }, ...(actionOptions || [])]}
                  optionLabel="name"
                  optionValue="value"
                  placeholder="No Action"
                  filter={false}
                  className={`w-full sm:min-w-[140px] sm:w-auto md:min-w-[150px] lg:min-w-[160px] xl:min-w-[170px] 2xl:min-w-[180px] max-w-full ${isDisabled ? "opacity-50 cursor-not-allowed dark:opacity-40" : ""
                    }`}
                  disabled={isDisabled}
                />
              </div>

              {/* Bulk status filter when action is "Status" */}
              {actionFilter === "Status" && !isDisabled && (
                <div className="w-full sm:w-auto sm:flex-shrink-0 min-w-0 max-w-full">
                  <WebComponents.UiComponents.UiWebComponents.FilterDropdown
                    value={activeStatusFilter === "All" ? null : activeStatusFilter}
                    onChange={(e: any) =>
                      onActiveStatusFilterChange?.(e.value ?? "All")
                    }
                    options={activeStatusOptions}
                    optionLabel="name"
                    optionValue="value"
                    placeholder="Select Status"
                    filter={false}
                    className="w-full sm:min-w-[140px] sm:w-auto md:min-w-[150px] lg:min-w-[160px] xl:min-w-[170px] 2xl:min-w-[180px] max-w-full"
                  />
                </div>
              )}

              {/* Apply button */}
              <div className="w-full sm:w-auto sm:flex-shrink-0 min-w-0 max-w-full">
                <WebComponents.UiComponents.UiWebComponents.Button
                  variant={isDisabled ? "disabled" : "default"}
                  size="sm"
                  className={`w-full rounded-[4px] sm:w-auto h-[44px] px-3 sm:px-4 md:px-4 lg:px-5 xl:px-5 2xl:px-6 text-[15px] transition-all duration-200 whitespace-nowrap ${isDisabled
                    ? "border border-[#D8D9D9] text-gray-800 dark:text-gray-200 text-opacity-50"
                    : "bg-primary dark:bg-primary hover:bg-primaryHover"
                    }`}
                  disabled={isDisabled}
                  onClick={onApply}
                  aria-label="Apply bulk action"
                >
                  Apply
                </WebComponents.UiComponents.UiWebComponents.Button>
              </div>
            </>
          )}

          {/* Export buttons (CSV / PDF) */}
          <div className="flex items-center gap-2 sm:gap-2 md:gap-2.5 lg:gap-3 xl:gap-3 2xl:gap-3 flex-shrink-0">
            {renderExports ?? (
              <>
                <IconButton src={Constants.assetsIcon.assets.csv.src} label="Download CSV" />
                <IconButton src={Constants.assetsIcon.assets.pdf.src} label="Download PDF" />
              </>
            )}
          </div>
        </div>

        {/* Right group: category, status and search filters */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-2.5 md:gap-3 lg:gap-3 xl:gap-4 2xl:gap-4 w-full lg:w-auto lg:flex-shrink-0 min-w-0 max-w-full">
          {/* Category filter (optional) */}
          {showCategoryFilter && (
            <div className="w-full sm:w-auto sm:flex-shrink-0 min-w-0 max-w-full">
              <WebComponents.UiComponents.UiWebComponents.FilterDropdown
                value={categoryFilter === "All" ? null : categoryFilter}
                onChange={(e: any) =>
                  onCategoryFilterChange?.(e.value ?? "All")
                }
                options={categoryOptions}
                optionLabel="name"
                optionValue="value"
                placeholder={categoryLabel || categoryPlaceholder}
                filter
                className="w-full sm:min-w-[140px] sm:w-auto md:min-w-[150px] lg:min-w-[160px] xl:min-w-[170px] 2xl:min-w-[180px] max-w-full"
              />
            </div>
          )}

          {/* Custom Status filter (optional) e.g. Designation */}
          {onCustomStatusFilterChange && customStatusOptions && (
            <div className="w-full sm:w-auto sm:flex-shrink-0 min-w-0 max-w-full">
              <WebComponents.UiComponents.UiWebComponents.FilterDropdown
                value={customStatusFilter === "All" ? null : customStatusFilter}
                onChange={(e: any) =>
                  onCustomStatusFilterChange?.(e.value ?? "All")
                }
                options={customStatusOptions}
                optionLabel="name"
                optionValue="value"
                placeholder={customStatusLabel || "Select Option"}
                filter
                className="w-full sm:min-w-[140px] sm:w-auto md:min-w-[150px] lg:min-w-[160px] xl:min-w-[170px] 2xl:min-w-[180px] max-w-full"
              />
            </div>
          )}

          {/* Status filter - only show if statusOptions has items */}
          {statusOptions && statusOptions.length > 0 && (
            <div className="w-full sm:w-auto sm:flex-shrink-0 min-w-0 max-w-full">
              <WebComponents.UiComponents.UiWebComponents.FilterDropdown
                value={statusFilter === "All" ? null : statusFilter}
                onChange={(e: any) => onStatusFilterChange?.(e.value ?? "All")}
                placeholder={statusLabel || statusPlaceholder}
                options={statusOptions}
                optionLabel="label"
                optionValue="value"
                className="w-full sm:min-w-[140px] sm:w-auto md:min-w-[150px] lg:min-w-[160px] xl:min-w-[170px] 2xl:min-w-[180px] max-w-full"
              />
            </div>
          )}

          {/* Search */}
          {showSearch && (
            <div className="w-full sm:flex-1 min-w-0 max-w-full">
              <div className="flex items-center gap-2 w-full">
                <WebComponents.UiComponents.UiWebComponents.SearchBar
                  placeholder={searchPlaceholder}
                  value={searchTerm}
                  onChange={(e: any) => onSearchTermChange(e.target.value)}
                  containerClassName="w-full sm:w-64 md:w-80"
                />
                {renderSearchActions && (
                  <div className="flex items-center flex-shrink-0 gap-2">
                    {renderSearchActions}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const IconButton = ({ src, label }: { src: string; label: string }) => (
  <button
    type="button"
    aria-label={label}
    title={label}
    className="rounded-[4px] bg-[#ffffff] dark:bg-[#3A3A3A] border border-[#D8D9D9] border-opacity-50 font-interTight font-normal hover:bg-[#e0e0e0] dark:hover:bg-[#4A4A4A] shadow-sm transition-colors duration-200 cursor-pointer flex-shrink-0 sm:px-1 md:px-2 lg:px-2 xl:px-2 2xl:px-2 px-2 py-[6.9px]"
  >
    <Image
      src={src}
      alt={label}
      width={28}
      height={28}
      className="w-5 h-5 sm:w-6 sm:h-6 md:w-6 md:h-6 lg:w-7 lg:h-7 xl:w-7 xl:h-7 2xl:w-7 2xl:h-7"
    />
  </button>
);

export default CommonFilterBar;
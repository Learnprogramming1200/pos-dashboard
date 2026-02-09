import { X } from "lucide-react";
import { Constants } from "@/constant";
import { WebComponents } from "@/components";
import { Slider } from "primereact/slider";
import { FiltersTypes } from "@/types";

export default function ExtendedFiltersModal({
  isOpen,
  onClose,
  onApply,
  onReset,
  filters,
  setFilters,
  filterConfig,
}: Readonly<FiltersTypes.ExtendedFiltersModalProps>) {
  const handleInputChange = (key: string, value: string) => {
    setFilters({ ...filters, [key]: value });
  };

  const renderField = (field: FiltersTypes.FilterFieldConfig, index: number) => {
    switch (field.type) {
      case "select":
        return (
          <div key={index}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {field.label}
            </label>
            <WebComponents.UiComponents.UiWebComponents.FilterDropdown
              value={filters[field.key!]}
              onChange={(e: any) => handleInputChange(field.key!, e.value ?? "")}
              options={field.options ?? []}
              optionLabel="label"
              optionValue="value"
              placeholder={field.placeholder ?? "Select"}
              className="w-full"
              filter={false}
              showClear={false}
            />
          </div>
        );

      case "date":
        return (
          <div key={index}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {field.label}
            </label>
            <WebComponents.UiComponents.UiWebComponents.SingleDatePicker
              value={filters[field.key!] || ""}
              onChange={(isoDate) => handleInputChange(field.key!, isoDate)}
              className="w-full h-[44px] bg-white dark:bg-[#1B1B1B] text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
              placeholder="mm/dd/yyyy"
              maxDate={new Date()}
            />
          </div>
        );

      case "text":
      case "number":
        return (
          <div key={index}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {field.label}
            </label>
            <WebComponents.UiComponents.UiWebComponents.Input
              type={field.type}
              placeholder={field.placeholder}
              value={filters[field.key!]}
              onChange={(e) => handleInputChange(field.key!, e.target.value)}
              className="w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
            />
          </div>
        );

      case "range": {
        const maxRaw = Number.parseFloat(filters[field.maxKey!] ?? "100000");
        const maxVal = Number.isNaN(maxRaw) ? 100000 : maxRaw; // Default max if empty, logic might need refinement based on actual data limits
        const sliderMax = 100000; // This should probably be dynamic in config
        const isAtMax = maxVal >= sliderMax;

        return (
          <div key={index}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {field.label}
            </label>
            <div className="px-1 mt-2 mb-2">
              <Slider
                value={maxVal}
                onChange={(e: any) => {
                  if (typeof e.value === "number") {
                    // Update only maxKey, implicitly min is 0
                    handleInputChange(field.maxKey!, e.value.toString());
                    // Ensure minKey is set to 0 if not present, though usually handled by report logic
                    if (!filters[field.minKey!]) {
                      handleInputChange(field.minKey!, "0");
                    }
                  }
                }}
                min={0}
                max={sliderMax}
                className="w-full primary-slider"
              />
            </div>
            <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
              <span>
                {field.prefix ?? "$"}
                {0}
              </span>
              <span>
                {field.prefix ?? "$"}
                {`${maxVal.toLocaleString()}${isAtMax ? "+" : ""}`}
              </span>
            </div>
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 overflow-hidden ${isOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
    >
      {/* Backdrop */}
      <button
        type="button"
        className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ease-in-out ${isOpen ? "opacity-100" : "opacity-0"
          }`}
        aria-label={Constants.adminReportsConstants.advancedFiltersTitle}
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            e.preventDefault();
            onClose();
          }
        }}
      />

      {/* Modal Panel - Slide from Right */}
      <div
        className={`absolute right-0 top-0 h-full w-80 bg-white dark:bg-[#333333] shadow-xl transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {Constants.adminReportsConstants.advancedFiltersTitle}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Filter Form */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {filterConfig.map((field, index) => renderField(field, index))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex gap-2">
          <button
            onClick={onApply}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-md transition-colors"
          >
            {Constants.adminReportsConstants.searchPlaceholder.toUpperCase()}
          </button>
          <button
            onClick={onReset}
            className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 font-semibold py-2.5 px-4 rounded-md transition-colors"
          >
            {Constants.adminReportsConstants.resetFilters.toUpperCase()}
          </button>
        </div>
      </div>
    </div>
  );
}

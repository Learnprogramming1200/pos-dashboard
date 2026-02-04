"use client";

import * as React from "react";
import { useState, useMemo, useEffect, useRef } from "react";
import { ChevronDown, ChevronUp, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface OptionData {
  value: string;
  label: string;
}

interface FormDropdownProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'value' | 'onChange'> {
  searchable?: boolean;
  multiselect?: boolean;
  selectall?: boolean;
  value?: string | string[];
  onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  placeholder?: string;
}

const FormDropdown = React.forwardRef<HTMLSelectElement, FormDropdownProps>(
  ({ className, children, value, onChange, searchable = false, multiselect = false, selectall = false, ...props }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [keyboardSearch, setKeyboardSearch] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Extract options from FormOption children
    const options = useMemo(() => {
      const opts: OptionData[] = [];
      React.Children.forEach(children, (child) => {
        if (React.isValidElement(child)) {
          const props = child.props as React.OptionHTMLAttributes<HTMLOptionElement>;
          const childValue = props.value ?? "";
          const childValueStr = Array.isArray(childValue)
            ? childValue[0]?.toString() ?? ""
            : String(childValue ?? "");
          const childLabel = typeof props.children === "string"
            ? props.children
            : childValueStr;
          opts.push({ value: childValueStr, label: childLabel });
        }
      });
      return opts;
    }, [children]);

    // Get selected values as array (for multiselect) or single value
    const selectedValues = useMemo(() => {
      if (multiselect) {
        if (Array.isArray(value)) {
          return value.map(v => String(v));
        }
        if (value != null) {
          return [String(value)];
        }
        return [];
      }
      return value != null ? [String(value)] : [];
    }, [value, multiselect]);

    const selectedOption = useMemo(() => {
      if (multiselect) {
        return null; // For multiselect, we'll show count or labels
      }
      const valueStr = value != null ? String(value) : "";
      return options.find(opt => opt.value === valueStr) || null;
    }, [options, value, multiselect]);

    // Get selected options for multiselect display
    const selectedOptions = useMemo(() => {
      if (!multiselect) return [];
      return options.filter(opt => selectedValues.includes(opt.value));
    }, [options, selectedValues, multiselect]);

    // Check if all options are selected (for select all functionality)
    const allSelected = useMemo(() => {
      if (!multiselect || !selectall) return false;
      const selectableOptions = options.filter(opt => opt.value !== "");
      return selectableOptions.length > 0 && selectableOptions.every(opt => selectedValues.includes(opt.value));
    }, [options, selectedValues, multiselect, selectall]);

    // Combine search term from input (if searchable) and keyboard search
    // Prioritize search input if searchable, otherwise use keyboard search
    const activeSearchTerm = useMemo(() => {
      if (searchable && searchTerm) return searchTerm;
      if (keyboardSearch) return keyboardSearch;
      return "";
    }, [searchable, searchTerm, keyboardSearch]);

    const filteredOptions = useMemo(() => {
      if (!activeSearchTerm) return options;
      const search = activeSearchTerm.toLowerCase();
      return options.filter(opt =>
        opt.label.toLowerCase().includes(search) ||
        opt.value.toLowerCase().includes(search)
      );
    }, [options, activeSearchTerm]);

    const isPlaceholder = useMemo(() => {
      if (multiselect) {
        return selectedValues.length === 0;
      }
      return value === "" || value === undefined || !selectedOption;
    }, [multiselect, selectedValues, value, selectedOption]);

    const handleSelect = React.useCallback((optionValue: string) => {
      if (onChange) {
        if (multiselect) {
          const currentValues = Array.isArray(value) ? [...value] : (value != null ? [String(value)] : []);
          const valueStr = String(optionValue);
          const isSelected = currentValues.includes(valueStr);

          let newValues: string[];
          if (isSelected) {
            // Remove from selection
            newValues = currentValues.filter(v => String(v) !== valueStr);
          } else {
            // Add to selection
            newValues = [...currentValues, valueStr];
          }

          const syntheticEvent = {
            target: { value: newValues },
          } as unknown as React.ChangeEvent<HTMLSelectElement>;
          onChange(syntheticEvent);
        } else {
          const syntheticEvent = {
            target: { value: optionValue },
          } as React.ChangeEvent<HTMLSelectElement>;
          onChange(syntheticEvent);
          setIsOpen(false);
          setSearchTerm("");
          setKeyboardSearch("");
        }
      } else if (!multiselect) {
        setIsOpen(false);
        setSearchTerm("");
        setKeyboardSearch("");
      }
    }, [onChange, multiselect, value]);

    const handleSelectAll = React.useCallback(() => {
      if (!multiselect || !selectall || !onChange) return;

      const selectableOptions = options.filter(opt => opt.value !== "");
      const allValues = selectableOptions.map(opt => opt.value);

      if (allSelected) {
        // Deselect all
        const syntheticEvent = {
          target: { value: [] },
        } as unknown as React.ChangeEvent<HTMLSelectElement>;
        onChange(syntheticEvent);
      } else {
        // Select all
        const syntheticEvent = {
          target: { value: allValues },
        } as unknown as React.ChangeEvent<HTMLSelectElement>;
        onChange(syntheticEvent);
      }
    }, [multiselect, selectall, onChange, options, allSelected]);

    // Handle keyboard search when dropdown is open
    useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (!isOpen) return;

        // Don't handle if searchable and user is typing in the search input
        if (searchable && searchInputRef.current && document.activeElement === searchInputRef.current) {
          return;
        }

        // Handle Escape key
        if (event.key === "Escape") {
          setIsOpen(false);
          setKeyboardSearch("");
          setSearchTerm("");
          return;
        }

        // Handle Enter key - select first matching option
        if (event.key === "Enter" && filteredOptions.length > 0) {
          event.preventDefault();
          const firstMatch = filteredOptions.find(opt => opt.value !== "") || filteredOptions[0];
          if (firstMatch) {
            handleSelect(firstMatch.value);
            // Don't close dropdown in multiselect mode
            if (!multiselect) {
              setIsOpen(false);
              setSearchTerm("");
              setKeyboardSearch("");
            }
          }
          return;
        }

        // Handle Arrow keys for navigation (optional enhancement)
        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
          // Could add keyboard navigation here if needed
          return;
        }

        // Handle Backspace
        if (event.key === "Backspace") {
          event.preventDefault();
          setKeyboardSearch(prev => prev.slice(0, -1));
          // Clear search after 1 second of no typing
          if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
          }
          searchTimeoutRef.current = setTimeout(() => {
            setKeyboardSearch("");
          }, 1000);
          return;
        }

        // Handle printable characters (letters, numbers, spaces)
        if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
          event.preventDefault();
          setKeyboardSearch(prev => prev + event.key);

          // Clear search after 1 second of no typing
          if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
          }
          searchTimeoutRef.current = setTimeout(() => {
            setKeyboardSearch("");
          }, 1000);
        }
      };

      if (isOpen) {
        window.addEventListener("keydown", handleKeyDown);
      }

      return () => {
        window.removeEventListener("keydown", handleKeyDown);
        if (searchTimeoutRef.current) {
          clearTimeout(searchTimeoutRef.current);
        }
      };
    }, [isOpen, searchable, multiselect, filteredOptions, handleSelect]);

    // Clear keyboard search when dropdown closes
    useEffect(() => {
      if (!isOpen) {
        setKeyboardSearch("");
        if (searchTimeoutRef.current) {
          clearTimeout(searchTimeoutRef.current);
        }
      }
    }, [isOpen]);

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target as Node) &&
          buttonRef.current &&
          !buttonRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
          setSearchTerm("");
          setKeyboardSearch("");
        }
      };

      if (isOpen) {
        document.addEventListener("mousedown", handleClickOutside);
      }

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [isOpen]);

    return (
      <div className={cn("relative w-full", className)}>
        {/* Button that looks like the select input */}
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          disabled={props.disabled}
          className={cn(
            "min-h-[44px] h-auto w-full rounded-[4px] border-[0.6px] border-[#D8D9D9] dark:border-[#616161] bg-textMain2 dark:bg-[#1B1B1B] pl-3 pr-3 py-1 font-interTight font-medium text-sm leading-[14px] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-between",
            isPlaceholder
              ? "text-textSmall font-normal"
              : "text-textMain dark:text-white"
          )}
        >
          <div className="flex flex-wrap gap-1.5 flex-1 min-w-0">
            {multiselect ? (
              selectedOptions.length > 0 ? (
                selectedOptions.map((option) => (
                  <span
                    key={option.value}
                    className="inline-flex items-center gap-1 bg-primary text-white text-[11px] px-1.5 py-0.5 rounded-[4px] font-medium"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelect(option.value);
                    }}
                  >
                    <X className="w-2.5 h-2.5" />
                    {option.label}
                  </span>
                ))
              ) : (
                <span className="truncate">{(props as any).placeholder || "Select options"}</span>
              )
            ) : (
              <span className="truncate">
                {selectedOption ? selectedOption.label : (props as any).placeholder || "Select an option"}
              </span>
            )}
          </div>
          {isOpen ? (
            <ChevronUp className="w-3 h-3 ml-2 flex-shrink-0 text-textMain dark:text-white" />
          ) : (
            <ChevronDown className="w-3 h-3 ml-2 flex-shrink-0 text-textMain dark:text-white" />
          )}
        </button>

        {/* Hidden select for form compatibility */}
        <select
          ref={ref}
          value={multiselect ? (Array.isArray(value) ? value : []) : value}
          onChange={onChange}
          multiple={multiselect}
          className="sr-only"
          {...props}
        >
          {children}
        </select>

        {/* Dropdown Menu */}
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => {
                setIsOpen(false);
                setSearchTerm("");
                setKeyboardSearch("");
              }}
            />
            <div
              ref={dropdownRef}
              className="absolute z-50 mt-1 w-full bg-white dark:bg-[#1B1B1B] border border-gray-200 dark:border-[#616161] rounded-[4px] shadow-lg max-h-[300px] overflow-hidden"
            >
              {/* Search Bar - Only show when searchable is true */}
              {searchable && (
                <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                  <Input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-9"
                    autoFocus
                  />
                </div>
              )}
              {/* Select All Option - Only show when multiselect and selectall are true */}
              {multiselect && selectall && (
                <div className="py-2 border-b border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-left text-sm font-interTight text-textMain dark:text-white rounded"
                  >
                    <div className={cn(
                      "w-4 h-4 border-2 rounded flex items-center justify-center flex-shrink-0",
                      allSelected
                        ? "bg-blue-500 border-blue-500"
                        : "border-gray-300 dark:border-gray-600"
                    )}>
                      {allSelected && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium">
                        Select All
                      </div>
                    </div>
                  </button>
                </div>
              )}
              {/* Options List */}
              <div className={cn(
                "overflow-y-auto",
                searchable || (multiselect && selectall) ? "max-h-[240px]" : "max-h-[300px]"
              )}>
                {filteredOptions.length > 0 ? (
                  filteredOptions.map((option, index) => {
                    const isSelected = multiselect
                      ? selectedValues.includes(option.value)
                      : (value != null ? String(value) : "") === option.value;

                    return (
                      <button
                        key={`${option.value}-${index}`}
                        type="button"
                        onClick={() => handleSelect(option.value)}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-left text-sm font-interTight",
                          isSelected
                            ? "bg-blue-50 dark:bg-blue-900/20 text-textMain dark:text-white"
                            : "text-textMain dark:text-white"
                        )}
                      >
                        {multiselect && (
                          <div className={cn(
                            "w-4 h-4 border-2 rounded flex items-center justify-center flex-shrink-0",
                            isSelected
                              ? "bg-blue-500 border-blue-500"
                              : "border-gray-300 dark:border-gray-600"
                          )}>
                            {isSelected && (
                              <Check className="w-3 h-3 text-white" />
                            )}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">
                            {option.label}
                          </div>
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="px-3 py-2 text-sm text-textSmall dark:text-gray-400 text-center">
                    No options found
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    );
  }
);
FormDropdown.displayName = "FormDropdown";

const FormOption = React.forwardRef<HTMLOptionElement, React.OptionHTMLAttributes<HTMLOptionElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <option
        ref={ref}
        className={cn(
          "bg-textMain2 dark:bg-gray-800 pl-3 pr-3 text-textMain dark:text-white font-interTight font-normal text-sm leading-[14px]",
          className
        )}
        {...props}
      >
        {children}
      </option>
    );
  }
);
FormOption.displayName = "FormOption";

export { FormDropdown, FormOption };

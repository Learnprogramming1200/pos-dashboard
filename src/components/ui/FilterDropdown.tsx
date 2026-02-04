import * as React from "react";
import { Dropdown } from "primereact/dropdown";
// PrimeReact CSS - loaded only when this component is used
import "primereact/resources/themes/lara-light-cyan/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

import { cn } from "@/lib/utils";

export type FilterDropdownProps = React.ComponentProps<typeof Dropdown> & {
    className?: string;
};

export const FilterDropdown: React.FC<FilterDropdownProps> = ({ className, filter, showClear, placeholder, options, optionLabel, pt, panelClassName, ...props }) => {
    const computedOptions = React.useMemo(() => {
        if (!options) return options as any;
        if (placeholder !== "All Categories") return options as any;

        const getLabel = (opt?: string | Record<string, any>) => {
            if (!opt) return undefined;
            if (typeof opt === "string") return opt;
            if (optionLabel && opt[optionLabel] !== undefined) return opt[optionLabel];
            if (opt.label !== undefined) return opt.label;
            return undefined;
        };

        if (Array.isArray(options)) {
            return options.filter((opt: any) => getLabel(opt) !== placeholder) as any;
        }
        return options as any;
    }, [options, optionLabel, placeholder]);

    const mergedPt = React.useMemo(() => {
        const defaults = {
            root: { className: "rounded-[4px] bg-white dark:bg-[#1F1F1F] dark:text-[#F2F2F2] border border-[#D8D9D9] transition-shadow font-dmsans text-sm leading-[18px] font-normal shadow-none focus:shadow-none focus:ring-0 focus:outline-none [&.p-focus]:shadow-none [&.p-focus]:ring-0" },
            label: { className: "overflow-visible whitespace-nowrap dark:text-[#F2F2F2]" },
            input: { className: "py-3 text-[#111636] dark:text-[#F2F2F2] dark:bg-[#1F1F1F] overflow-visible [&.p-placeholder]:text-[15px]" },
            trigger: { className: "textMain dark:text-[#F2F2F2]" },
            panel: { className: "dark:bg-[#1F1F1F] dark:text-[#F2F2F2] dark:border dark:border-[#2A2A2A]" },
            header: { className: "p-3 border-b border-gray-200 dark:border-[#383838] dark:bg-[#1F1F1F] dark:text-[#F2F2F2]" },
            filterContainer: { className: "relative dark:bg-[#1F1F1F]" },
            filterInput: { className: "w-full rounded-[4px] border border-gray-300 dark:border-[#3F3F3F] bg-gray-50 dark:bg-[#2A2A2A] text-gray-900 dark:text-[#F2F2F2] text-sm pl-3 pr-10 py-2 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/40 dark:focus:ring-primary/50" },
            filterIcon: { className: "pointer-events-none absolute right-3 top-1/2 -translate-y-2/2 textMain dark:text-[#F2F2F2] h-[18px] w-[18px]" },
            items: { className: "max-h-72 dark:bg-[#1F1F1F]" },
            item: { className: "px-3 py-2 text-sm text-gray-900 dark:text-[#F2F2F2] hover:bg-gray-200 dark:hover:bg-[#2A2A2A] focus:bg-gray-200 dark:focus:bg-[#2A2A2A] cursor-pointer [&.p-focus]:bg-gray-200 [&.p-focus]:dark:bg-[#2A2A2A] [&.p-highlight]:bg-blue-100 [&.p-highlight]:dark:bg-blue-900/30 [&.p-highlight]:text-gray-900 [&.p-highlight]:dark:text-[#F2F2F2] [&.p-highlight.p-focus]:bg-blue-100 [&.p-highlight.p-focus]:dark:bg-blue-900/30" },
            clearIcon: { className: "mr-1 textMain dark:text-[#F2F2F2] h-[14px] w-[14px]" },
            dropdownIcon: { className: "mr-2 textMain dark:text-[#F2F2F2] h-[13px] w-[13px]" },
        } as any;

        if (!pt) return defaults;

        const out: any = { ...defaults };
        Object.keys(pt).forEach((key) => {
            const section = (pt as any)[key];
            if (!section) return;
            const existing = out[key] || {};
            out[key] = {
                ...existing,
                ...(typeof section === "object" ? section : {}),
                className: [existing.className, section.className].filter(Boolean).join(" "),
            };
        });
        return out;
    }, [pt]);

    return (
        <Dropdown
            filter={filter ?? true}
            showClear={showClear ?? true}
            placeholder={placeholder ?? "Select"}
            options={computedOptions}
            optionLabel={optionLabel as any}
            pt={mergedPt}
            panelClassName={cn(panelClassName)}
            {...props}
            className={cn(className)}
        />
    );
};

FilterDropdown.displayName = "FilterDropdown";

export default FilterDropdown;



import * as React from "react";
import { cn } from "@/lib/utils";
import { Search as SearchIcon } from "lucide-react";

export type SearchBarProps = React.InputHTMLAttributes<HTMLInputElement> & {
  className?: string;
  containerClassName?: string;
  icon?: React.ReactNode;
};

export const SearchBar = React.forwardRef<HTMLInputElement, SearchBarProps>(
  ({ className, containerClassName, placeholder, value, onChange, icon, ...props }, ref) => {
    return (
      <div
        className={cn(
          "rounded-[4px] bg-white dark:bg-[#1F1F1F] border border-[#D8D9D9] transition-shadow text-[#111636] dark:text-[#F2F2F2] font-dmsans text-[15px] leading-[18px] font-normal focus-within:ring-0 focus-within:shadow-none",
          containerClassName
        )}
      >
        <div className="relative">
          <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] dark:text-gray-400">
            {icon ?? <SearchIcon className="h-5 w-5" />}
          </div>
          <input
            ref={ref}
            type="text"
            aria-label="Search"
            placeholder={placeholder ?? "Search"}
            className={cn(
              "w-full bg-transparent outline-none border-0 pl-10 pr-3 py-3 placeholder:text-[#9CA3AF] dark:placeholder:text-gray-400 placeholder:font-dmsans placeholder:text-[15px] placeholder:font-regular placeholder:leading-[100%]",
              className
            )}
            value={value}
            onChange={onChange}
            {...props}
          />
        </div>
      </div>
    );
  }
);

SearchBar.displayName = "SearchBar";

export default SearchBar;



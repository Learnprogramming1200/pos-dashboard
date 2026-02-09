import * as React from "react";
import { cn } from "@/lib/utils";

const FormInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "h-[44px] w-full rounded-[4px] bg-textMain2 dark:bg-[#1B1B1B] pl-3 pr-3 text-textMain dark:text-white border-[0.6px] border-[#D8D9D9] dark:border-[#616161]  font-interTight font-medium text-sm leading-[14px] placeholder:text-textSmall placeholder:font-interTight placeholder:font-normal placeholder:text-sm placeholder:leading-[14px] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
FormInput.displayName = "FormInput";

export { FormInput };

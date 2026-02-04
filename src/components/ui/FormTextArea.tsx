import * as React from "react";
import { cn } from "@/lib/utils";

export const FormTextArea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        "w-full rounded-[4px] border-[0.6px] border-[#D8D9D9] dark:border-gray-600 bg-textMain2 dark:bg-gray-800 pl-3 pr-3 pt-3 pb-8 text-textMain dark:text-white font-interTight font-medium text-sm leading-[14px] placeholder:text-textSmall dark:placeholder-gray-400 placeholder:font-interTight placeholder:font-normal placeholder:text-sm placeholder:leading-[14px] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 resize-none",
        className
      )}
      {...props}
    />
  );
});

FormTextArea.displayName = "FormTextArea";

export default FormTextArea;



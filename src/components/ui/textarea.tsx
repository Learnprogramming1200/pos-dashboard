import * as React from "react";
import { cn } from "@/lib/utils";

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  charLength?: number;
  charCounter?: boolean;
  containerClassName?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, charLength, charCounter = true, onChange, containerClassName, ...props }, ref) => {
    const limit = charLength ?? 250;
    const [charCount, setCharCount] = React.useState(
      props.value
        ? String(props.value).length
        : props.defaultValue
          ? String(props.defaultValue).length
          : 0
    );

    React.useEffect(() => {
      if (props.value !== undefined) {
        setCharCount(String(props.value).length);
      }
    }, [props.value]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCharCount(e.target.value.length);
      if (onChange) {
        onChange(e);
      }
    };

    return (
      <div className={cn("relative w-full", containerClassName)}>
        <textarea
          maxLength={limit}
          className={cn(
            "flex min-h-[60px] w-full bg-textMain2 dark:bg-[#1B1B1B] rounded-[4px] border-[0.6px] border-[#D8D9D9] dark:border-[#616161] p-3 text-textMain dark:text-white font-interTight font-medium text-sm leading-[14px] placeholder:text-textSmall placeholder:font-interTight placeholder:font-normal placeholder:text-sm placeholder:leading-[14px] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500",
            className
          )}
          ref={ref}
          onChange={handleChange}
          {...props}
        />
        {charCounter && (
          <div className="text-sm text-textSmall text-right mt-1 font-interTight">
            {charCount}/{limit}
          </div>
        )}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
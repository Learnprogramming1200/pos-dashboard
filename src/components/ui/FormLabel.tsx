import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const formLabelVariants = cva(
  "text-formHeading dark:text-white font-poppins text-sm leading-2 font-medium sm:text-sm sm:leading-2 sm:font-medium md:text-sm md:leading-3 md:font-medium lg:text-sm lg:leading-4 lg:font-semibold"
);

const FormLabel = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & VariantProps<typeof formLabelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(formLabelVariants(), className)}
    {...props}
  />
));
FormLabel.displayName = LabelPrimitive.Root.displayName;

export { FormLabel };

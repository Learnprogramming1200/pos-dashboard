import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[6px] text-sm font-poppins font-semibold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        addBackButton: "bg-primary text-white rounded-[4px] hover:bg-primaryHover h-16 w-24 py-3 px-6 dark:bg-primary dark:hover:bg-primaryHover",
        default: "bg-primary text-white shadow hover:bg-primaryHover py-5 px-8 dark:bg-primary dark:hover:bg-primaryHover",
        destructive: "bg-danger text-white shadow-sm hover:bg-danger/90 dark:bg-danger dark:text-white dark:hover:bg-danger/90 py-5 px-8",
        outline: "bg-white text-[#475467] hover:bg-white/50 border border-border2 shadow dark:hover:bg-white/90 py-5 px-8",
        save: "bg-primary text-white shadow hover:bg-primaryHover py-5 px-6 dark:bg-primary dark:hover:bg-primaryHover rounded-[6px]",
        cancel: "bg-background hover:bg-neutralLight text-textSmall border border-input shadow py-5 px-5 dark:bg-dark dark:hover:bg-[#334155] dark:text-neutral dark:border-border rounded-[6px]",
        secondary: "bg-secondary text-textMain shadow-sm hover:bg-secondary/80 dark:bg-dark dark:text-white dark:hover:bg-neutral",
        ghost: "hover:bg-neutralLight hover:text-textMain dark:hover:bg-neutral dark:hover:text-white dark:text-white",
        link: "text-primary underline-offset-4 hover:underline dark:text-primary",
        printaction: "bg-[#fffcf5] text-[#08CB00] hover:bg-[#59AC77] hover:text-white border-[1.5px] border-[#59AC77] rounded-[4px] dark:bg-[#2d1b00] dark:text-[#fbbf24] dark:hover:bg-[#f59e0b] dark:hover:text-[#1f2937] dark:border-[#f59e0b]",
        downloadaction: "bg-[#F0FDF4] text-[#16A34A] hover:bg-[#16A34A] hover:text-white border-[1.5px] border-[#16A34A] rounded-[4px] dark:bg-[#1a2e1f] dark:text-[#4ade80] dark:hover:bg-[#22c55e] dark:hover:text-white dark:border-[#22c55e]",
        mailaction: "bg-[#FAF5FF] text-[#9333EA] hover:bg-[#9333EA] hover:text-white border-[1.5px] border-[#9333EA] rounded-[4px] dark:bg-[#2d1b3d] dark:text-[#a855f7] dark:hover:bg-[#9333EA] dark:hover:text-white dark:border-[#9333EA]",
        viewaction: "bg-[#fffcf5] text-[#B7791F] hover:bg-[#e87400] hover:text-white border-[1.5px] border-[#e87400] rounded-[4px] dark:bg-[#2d1b00] dark:text-[#fbbf24] dark:hover:bg-[#f59e0b] dark:hover:text-white dark:border-[#f59e0b]",
        editaction: "bg-[#FAFCFF] text-primary hover:bg-primary hover:text-white border-[1.5px] border-primary rounded-[4px] dark:bg-[#1e293b] dark:text-[#60a5fa] dark:hover:bg-[#3b82f6] dark:hover:text-white dark:border-[#3b82f6]",
        deleteaction: "bg-[#FFFAFA] text-[#DE4B37] hover:bg-[#c7432f] hover:text-white border-[1.5px] border-[#DE4B37] rounded-[4px] dark:bg-[#2d1b1b] dark:text-[#f87171] dark:hover:bg-[#ef4444] dark:hover:text-white dark:border-[#ef4444]",
        disabled: "opacity-50 cursor-not-allowed",
        permissionButton: "bg-primary text-white rounded-[4px] hover:bg-primaryHover h-16 w-24 py-3 px-6 dark:bg-primary dark:hover:bg-primaryHover",
        deleteactionPermission: "bg-[#c7432f] text-white  border-[1.5px] border-[#DE4B37] rounded-[4px] dark:border-[#ef4444]",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants }; 
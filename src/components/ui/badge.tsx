import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:none",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground",
        success: "bg-success text-white",
        danger: "bg-danger text-white",
        warning: "bg-warning text-white",
        info: "bg-info text-white",
      },
      overlay: {
        true: "absolute pointer-events-none",
        false: "",
      },
      placement: {
        "top-left": "top-1 left-1",
        "top-right": "top-1 right-1",
        "bottom-left": "bottom-1 left-1",
        "bottom-right": "bottom-1 right-1",
      },
    },
    defaultVariants: {
      variant: "default",
      overlay: false,
    },
  }
);

interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, overlay, placement, ...props }: BadgeProps) {
  const classes = cn(
    badgeVariants({ variant, overlay, placement }),
    className
  );
  return <div className={classes} {...props} />;
}

export { Badge, badgeVariants };

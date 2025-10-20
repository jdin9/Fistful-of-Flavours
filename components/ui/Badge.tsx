import * as React from "react";

import { cn } from "@/lib/utils";

type BadgeVariant = "neutral" | "accent";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const badgeStyles: Record<BadgeVariant, string> = {
  neutral: "bg-white/10 text-text",
  accent: "bg-accent/15 text-accent"
};

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(({ className, variant = "neutral", ...props }, ref) => (
  <span
    ref={ref}
    className={cn(
      "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em]",
      badgeStyles[variant],
      className
    )}
    {...props}
  />
));
Badge.displayName = "Badge";

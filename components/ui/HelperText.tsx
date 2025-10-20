import * as React from "react";

import { cn } from "@/lib/utils";

export interface HelperTextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  icon?: React.ReactNode;
}

export const HelperText = React.forwardRef<HTMLParagraphElement, HelperTextProps>(
  ({ className, icon, children, ...props }, ref) => (
    <p ref={ref} className={cn("mt-2 flex items-start gap-2 text-sm text-muted", className)} {...props}>
      {icon && <span className="mt-0.5 inline-flex h-4 w-4 items-center justify-center text-muted">{icon}</span>}
      <span>{children}</span>
    </p>
  )
);
HelperText.displayName = "HelperText";

import * as React from "react";

import { cn } from "@/lib/utils";

export interface ToggleProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  pressed?: boolean;
}

export const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(
  ({ className, pressed = false, children, type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      aria-pressed={pressed}
      className={cn(
        "inline-flex items-center gap-2 rounded-2xl border border-transparent px-4 py-2 text-sm font-medium transition",
        pressed
          ? "bg-primary text-white shadow-card"
          : "bg-card text-text border-zinc-200/40 dark:border-white/10 hover:border-zinc-300/60 dark:hover:border-white/20",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
);
Toggle.displayName = "Toggle";

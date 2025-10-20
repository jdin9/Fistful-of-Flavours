import * as React from "react";

import { cn } from "@/lib/utils";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "block w-full rounded-xl border border-zinc-200/70 bg-white/95 px-4 py-3 text-base text-text shadow-sm transition focus:border-primary/40 focus:ring-2 focus:ring-ring dark:border-zinc-800 dark:bg-zinc-900",
      className
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";

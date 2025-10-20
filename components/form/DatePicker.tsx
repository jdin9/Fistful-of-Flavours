import * as React from "react";

import { cn } from "@/lib/utils";

export interface DatePickerProps extends React.InputHTMLAttributes<HTMLInputElement> {
  isDisabled?: (date: Date) => boolean;
}

export const DatePicker = React.forwardRef<HTMLInputElement, DatePickerProps>(
  ({ className, isDisabled, onChange, ...props }, ref) => (
    <input
      ref={ref}
      type="date"
      className={cn(
        "block w-full rounded-xl border border-zinc-200/70 bg-white/95 px-4 py-3 text-base text-text shadow-sm transition focus:border-primary/40 focus:ring-2 focus:ring-ring dark:border-zinc-800 dark:bg-zinc-900",
        className
      )}
      onChange={(event) => {
        const value = event.target.value;
        if (isDisabled && value) {
          const date = new Date(value);
          if (isDisabled(date)) {
            event.preventDefault();
            return;
          }
        }
        onChange?.(event);
      }}
      {...props}
    />
  )
);
DatePicker.displayName = "DatePicker";

import * as React from "react";

import { cn } from "@/lib/utils";

export interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  htmlFor: string;
  hint?: React.ReactNode;
  error?: string;
  required?: boolean;
  labelAccessory?: React.ReactNode;
  children: (field: { id: string; describedBy?: string }) => React.ReactNode;
}

export const FormField = ({
  className,
  label,
  htmlFor,
  hint,
  error,
  required,
  labelAccessory,
  children,
  ...props
}: FormFieldProps) => {
  const hintId = React.useId();
  const errorId = React.useId();
  const describedBy = [hint ? hintId : undefined, error ? errorId : undefined]
    .filter(Boolean)
    .join(" ") || undefined;

  const labelContent = (
    <span className="inline-flex items-center gap-1">
      <span>{label}</span>
      {required && <span className="text-primary">*</span>}
    </span>
  );

  return (
    <div className={cn("space-y-2", className)} {...props}>
      <label
        htmlFor={htmlFor}
        className={cn(
          "flex items-center justify-between gap-2 text-sm font-medium text-text",
          labelAccessory ? "pr-1" : undefined
        )}
      >
        {labelContent}
        {labelAccessory ? <span className="inline-flex items-center gap-1 text-muted">{labelAccessory}</span> : null}
      </label>
      {children({ id: htmlFor, describedBy })}
      {hint && (
        <p id={hintId} className="text-sm text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  );
};

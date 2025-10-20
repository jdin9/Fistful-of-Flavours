import * as React from "react";
import { Slot } from "@radix-ui/react-slot";

import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

type ButtonRef = React.ElementRef<"button">;
type ButtonElementProps = React.ComponentPropsWithoutRef<"button">;

export interface ButtonProps extends ButtonElementProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  asChild?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-primary text-white shadow-card transition-shadow hover:bg-primary-600 hover:shadow-hover",
  secondary:
    "bg-card text-text border border-zinc-200/40 dark:border-white/10 shadow-card hover:shadow-hover hover:border-zinc-300/60 dark:hover:border-white/20",
  ghost: "bg-transparent text-text hover:bg-white/5 dark:hover:bg-white/10"
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-5 text-base",
  lg: "h-12 px-6 text-base"
};

export const Button = React.forwardRef<ButtonRef, ButtonProps>(
  ({ className, variant = "primary", size = "md", fullWidth, asChild = false, type = "button", ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-2xl font-medium tracking-tight transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-70",
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && "w-full",
          className
        )}
        type={asChild ? undefined : type}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

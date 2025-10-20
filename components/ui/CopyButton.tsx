"use client";

import * as React from "react";

import { Button, type ButtonProps } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

interface CopyButtonProps extends Omit<ButtonProps, "onClick"> {
  value: string;
  label?: string;
  copiedLabel?: string;
}

export const CopyButton: React.FC<CopyButtonProps> = ({
  value,
  label = "Copy details",
  copiedLabel = "Copied!",
  variant = "secondary",
  size = "sm",
  ...props
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleClick = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Unable to copy deposit memo", error);
    }
  };

  return (
    <Button onClick={handleClick} variant={variant} size={size} {...props}>
      <Icon name={copied ? "Check" : "Copy"} className="h-4 w-4" aria-hidden />
      <span>{copied ? copiedLabel : label}</span>
    </Button>
  );
};

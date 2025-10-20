import * as React from "react";

import { cn } from "@/lib/utils";

export type ContainerProps = React.HTMLAttributes<HTMLDivElement>;

export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("container mx-auto w-full", className)} {...props} />
));
Container.displayName = "Container";

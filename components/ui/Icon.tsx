import * as Icons from "lucide-react";
import type { LucideProps } from "lucide-react";

import { cn } from "@/lib/utils";

export type IconName = keyof typeof Icons;

export interface IconProps extends LucideProps {
  name: IconName;
}

export const Icon = ({ name, className, ...props }: IconProps) => {
  const IconComponent = Icons[name];

  if (!IconComponent) {
    return null;
  }

  return <IconComponent className={cn("h-5 w-5", className)} {...props} />;
};

export { Icons };

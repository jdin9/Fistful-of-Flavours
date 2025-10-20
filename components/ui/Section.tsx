import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";
import { Container } from "./Container";

export interface SectionProps extends HTMLAttributes<HTMLElement> {
  eyebrow?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}

export const Section = ({
  className,
  eyebrow,
  title,
  description,
  actions,
  children,
  ...props
}: SectionProps) => (
  <section className={cn("py-16 md:py-24", className)} {...props}>
    <Container className="flex flex-col gap-12">
      {(eyebrow || title || description || actions) && (
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl space-y-4">
            {eyebrow && <p className="text-eyebrow">{eyebrow}</p>}
            {title && <h2 className="text-h2 text-text">{title}</h2>}
            {description && <p className="text-body text-text/80">{description}</p>}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-3 md:justify-end">{actions}</div>}
        </div>
      )}
      {children}
    </Container>
  </section>
);

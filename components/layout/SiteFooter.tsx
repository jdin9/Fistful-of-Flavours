import Link from "next/link";

import { Container } from "@/components/ui/Container";

const neighborhoods = ["Queen West", "King West", "Yorkville", "Harbourfront"];

const policyLinks = [
  { href: "/book#reschedule", label: "Reschedule policy" },
  { href: "/book#dietary", label: "Family-style notes" },
  { href: "/book#alcohol", label: "Alcohol add-ons" }
];

export const SiteFooter = () => (
  <footer className="border-t border-white/10 bg-background py-12 text-sm text-text/80">
    <Container className="grid gap-10 md:grid-cols-3">
      <div className="space-y-3">
        <h3 className="text-h3 text-text">Fistful of Flavours</h3>
        <p className="text-body text-text/80">
          Queen West, King West, Yorkville, and Harbourfront. Walkable routes. Great vibes. Carefully chosen kitchens.
        </p>
        <p className="text-body text-text/70">
          Have questions? After booking we’ll open a WhatsApp group with your whole party.
        </p>
      </div>
      <div className="space-y-3">
        <h4 className="text-eyebrow">Neighborhoods</h4>
        <ul className="space-y-2">
          {neighborhoods.map((neighborhood) => (
            <li key={neighborhood} className="text-text">
              {neighborhood}
            </li>
          ))}
        </ul>
      </div>
      <div className="space-y-3">
        <h4 className="text-eyebrow">Policies</h4>
        <ul className="space-y-2">
          {policyLinks.map((policy) => (
            <li key={policy.href}>
              <Link href={policy.href} className="text-text/80 transition hover:text-text">
                {policy.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </Container>
    <Container className="mt-12 border-t border-white/10 pt-6 text-xs text-text/60">
      © {new Date().getFullYear()} Fistful of Flavours — curated by locals.
    </Container>
  </footer>
);

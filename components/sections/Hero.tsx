import Link from "next/link";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

const neighborhoods = ["Queen West", "King West", "Yorkville", "Harbourfront"];

export const Hero = () => (
  <section className="relative overflow-hidden py-24">
    <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-background to-accent/10" aria-hidden />
    <Container className="flex flex-col gap-16 md:flex-row md:items-center md:justify-between">
      <div className="max-w-2xl space-y-6">
        <p className="text-eyebrow">Curated & carefree</p>
        <h1 className="text-display text-text">A chef-curated, surprise food crawl — planned end-to-end.</h1>
        <p className="text-body text-text/80">You show up. We handle the rest.</p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button asChild>
            <Link href="/book">Book now</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="#how-it-works">How it works</Link>
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-4 md:items-end">
        <div className="grid grid-cols-2 gap-3">
          {neighborhoods.map((neighborhood) => (
            <Badge key={neighborhood} className="justify-center" variant={neighborhood === "Yorkville" ? "accent" : "neutral"}>
              {neighborhood}
            </Badge>
          ))}
        </div>
        <p className="text-sm text-text/60 md:text-right">
          Walkable routes, surprise menus, and thoughtful pacing across Toronto’s tastiest blocks.
        </p>
      </div>
    </Container>
  </section>
);

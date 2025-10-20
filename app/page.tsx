import Link from "next/link";

import { Hero } from "@/components/sections/Hero";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Neighborhoods } from "@/components/sections/Neighborhoods";
import { PoliciesSummary } from "@/components/sections/PoliciesSummary";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Section } from "@/components/ui/Section";

export default function HomePage() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <Neighborhoods />
      <Section
        eyebrow="Investment snapshot"
        title="Transparent pricing, thoughtful pacing."
        description="Your flat deposit holds the crawl while we coordinate kitchens. The more notice you give, the more playful we can be with the lineup."
        actions={
          <Button asChild>
            <Link href="/book">Start a booking</Link>
          </Button>
        }
      >
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <Badge variant="accent" className="w-fit">
                Deposit
              </Badge>
              <CardTitle className="text-h3">$75 holds your night.</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Pay the deposit via Interac e-transfer once we confirm availability. It’s non-refundable, but transferable once with 3 days’ notice.
              </CardDescription>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Badge className="w-fit">Planning runway</Badge>
              <CardTitle className="text-h3">More time = more options.</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Submitting at least 3 weeks ahead lets us secure the most in-demand tables and weave in extra surprises for your group.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </Section>
      <PoliciesSummary />
      <Section
        className="pb-24"
        eyebrow="Next step"
        title="Let’s plan an evening your crew will rave about."
        actions={
          <Button asChild>
            <Link href="/book">Book now</Link>
          </Button>
        }
      >
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr]">
          <div className="space-y-5">
            <p className="text-body text-text/80">
              Share who’s coming, your preferred date, and how adventurous you’d like to go. We’ll reply within two business days with availability, route options, and deposit instructions.
            </p>
            <p className="text-body text-text/70">
              Day-of, expect polished WhatsApp or SMS nudges (coming soon) to guide you between stops—no awkward tour guide tagging along.
            </p>
          </div>
          <Card className="self-start">
            <CardHeader>
              <CardTitle>What’s included</CardTitle>
              <CardDescription>
                Chef-aligned menus, tax, and tip. Drinks are à la carte unless you add wine pairings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-text/80">
              <p>• Three hand-picked restaurants matched to your vibe.</p>
              <p>• Seamless pacing so every arrival feels like magic.</p>
              <p>• Dietary coordination for one shared set of notes.</p>
              <p>• Optional wine pairings from $75 per guest.</p>
            </CardContent>
          </Card>
        </div>
      </Section>
    </>
  );
}

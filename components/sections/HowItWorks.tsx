import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Section } from "@/components/ui/Section";

const steps: { title: string; description: string; icon: IconName }[] = [
  {
    title: "Tell us your vibe & budget.",
    description: "Share the neighbourhoods you love, dietary notes, and what kind of night you're craving.",
    icon: "Sparkles"
  },
  {
    title: "Hold your date with a $75 deposit.",
    description: "We secure your route, lock in tables, and coordinate menu pairings across the crawl.",
    icon: "CalendarCheck"
  },
  {
    title: "Follow the texts on the night.",
    description: "Day-of messages guide you from bar stools to dessert—no guide, no awkward group tour.",
    icon: "MessageCircle"
  }
];

export const HowItWorks = () => (
  <Section
    id="how-it-works"
    eyebrow="How it works"
    title="Premium casual from first ping to last plate."
    description="We handle the logistics so you can relax into the evening. Here’s the playbook."
  >
    <div className="grid gap-6 md:grid-cols-3">
      {steps.map((step) => (
        <Card key={step.title}>
          <CardHeader>
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Icon name={step.icon} className="h-6 w-6" aria-hidden />
            </span>
            <CardTitle>{step.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>{step.description}</CardDescription>
          </CardContent>
        </Card>
      ))}
    </div>
  </Section>
);

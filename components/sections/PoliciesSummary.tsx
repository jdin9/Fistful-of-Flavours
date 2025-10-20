import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Section } from "@/components/ui/Section";

const policies: { title: string; description: string; icon: IconName }[] = [
  {
    title: "Reschedule policy",
    description: "Reschedule up to 3 days before; new date must be ≥ 3 weeks out from the request; one reschedule.",
    icon: "RefreshCw"
  },
  {
    title: "Family-style",
    description: "Family-style: one restriction applies to all.",
    icon: "UtensilsCrossed"
  },
  {
    title: "Alcohol",
    description: "Alcohol: 19+ for pairings; no refunds if service is declined due to ID/intoxication.",
    icon: "Wine"
  }
];

export const PoliciesSummary = () => (
  <Section
    eyebrow="Policies"
    title="Thoughtful guardrails for a relaxed night."
    description="Transparent terms keep everyone on the same page before the first course lands."
  >
    <div className="grid gap-6 md:grid-cols-3">
      {policies.map((policy) => (
        <Card key={policy.title} className="border-white/5 bg-card">
          <CardHeader className="flex flex-row items-center gap-4">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Icon name={policy.icon} className="h-5 w-5" aria-hidden />
            </span>
            <CardTitle className="text-lg md:text-xl">{policy.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>{policy.description}</CardDescription>
          </CardContent>
        </Card>
      ))}
    </div>
  </Section>
);

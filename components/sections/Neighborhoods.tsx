import { Badge } from "@/components/ui/Badge";
import { Section } from "@/components/ui/Section";

const neighborhoods = ["Queen West", "King West", "Yorkville", "Harbourfront"];

export const Neighborhoods = () => (
  <Section
    id="neighborhoods"
    eyebrow="Neighbourhoods"
    title="Queen West, King West, Yorkville, and Harbourfront. Walkable routes. Great vibes. Carefully chosen kitchens."
  >
    <div className="flex flex-wrap gap-3">
      {neighborhoods.map((neighborhood) => (
        <Badge key={neighborhood} className="px-4 py-2 text-sm">
          {neighborhood}
        </Badge>
      ))}
    </div>
  </Section>
);

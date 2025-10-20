import Link from "next/link";

import BookingForm from "@/components/BookingForm";
import { Section } from "@/components/ui/Section";

export const metadata = {
  title: "Book a Toronto Food Crawl | Fistful of Flavours",
  description:
    "Request your curated, multi-restaurant food crawl across Toronto. Share your guests, budget, and vibe—we’ll handle the rest."
};

export default function BookPage() {
  return (
    <Section
      className="pb-24"
      eyebrow="Boutique planning, zero guesswork"
      title="Let’s plan your crawl"
      description="Submit your request at least three weeks before your preferred date. We’ll confirm availability within two business days, lock in the deposit, and share your curated lineup."
    >
      <div className="space-y-8">
        <p className="text-sm text-text/70">
          Have questions first? <Link href="mailto:hello@fistfulofflavours.com">hello@fistfulofflavours.com</Link>
        </p>
        <BookingForm />
      </div>
    </Section>
  );
}

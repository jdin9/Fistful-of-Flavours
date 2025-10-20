import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { CopyButton } from "@/components/ui/CopyButton";
import { HelperText } from "@/components/ui/HelperText";
import { Section } from "@/components/ui/Section";
import { DEPOSIT } from "@/lib/constants";
import { findBooking } from "@/lib/storage";
import { DEPOSIT_DETAILS } from "@/lib/validation";

const currencyFormatter = new Intl.NumberFormat("en-CA", {
  style: "currency",
  currency: "CAD",
  maximumFractionDigits: 0
});

const dateFormatter = new Intl.DateTimeFormat("en-CA", {
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric"
});

type ThanksPageProps = {
  searchParams: {
    ref?: string;
  };
};

export const metadata = {
  title: "Thanks for booking | Fistful of Flavours",
  description: "Next steps to finalize your Toronto food crawl reservation."
};

export default async function ThanksPage({ searchParams }: ThanksPageProps) {
  const ref = searchParams.ref?.trim();

  if (!ref) {
    notFound();
  }

  const booking = await findBooking(ref);

  if (!booking) {
    notFound();
  }

  const formattedDate = dateFormatter.format(new Date(booking.contact.date));
  const depositMemo = `Fistful of Flavours — ${ref}`;

  return (
    <Section
      className="pb-24"
      eyebrow="You’re locked in"
      title="Next steps for your crawl"
      description="Here’s everything you need to secure the night and keep your guests in the loop."
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Booking snapshot</CardTitle>
              <CardDescription>Your curated night out details at a glance.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1 text-sm text-text/80">
                <p className="text-text">Neighbourhood</p>
                <p>{booking.contact.neighborhood}</p>
              </div>
              <div className="space-y-1 text-sm text-text/80">
                <p className="text-text">Date</p>
                <p>{formattedDate}</p>
              </div>
              <div className="space-y-1 text-sm text-text/80">
                <p className="text-text">Start time</p>
                <p>{booking.contact.time}</p>
              </div>
              <div className="space-y-1 text-sm text-text/80">
                <p className="text-text">Party size</p>
                <p>{booking.party.partySize} guests</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Secure your date</CardTitle>
              <CardDescription>Send in the flat deposit within 24 hours to hold your crawl.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-text/80">
              <div className="rounded-xl border border-white/10 bg-card p-4">
                <p className="font-semibold text-text">Deposit due now</p>
                <p className="mt-1">{currencyFormatter.format(DEPOSIT)} (non-refundable).</p>
                <p className="mt-3 text-text">{DEPOSIT_DETAILS.instructions}.</p>
                <p className="mt-2 text-text">Use memo: {depositMemo}.</p>
              </div>
            </CardContent>
            <CardFooter className="flex flex-wrap items-center gap-3">
              <CopyButton value={depositMemo} label="Copy deposit memo" copiedLabel="Memo copied" />
              <HelperText className="mt-0">Add the memo so we can match your transfer quickly.</HelperText>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Policy highlights</CardTitle>
              <CardDescription>A few friendly reminders before we send your restaurant line-up.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-text/80">
              <ul className="space-y-2">
                <li>• Reschedule up to 3 days before; new date must be ≥ 3 weeks out from the request; one reschedule.</li>
                <li>• Family-style: One restriction applies to all.</li>
                <li>• Alcohol: 19+ for pairings; no refunds if service is declined due to ID/intoxication.</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Stay connected</CardTitle>
              <CardDescription>Share every guest’s number so we can loop everyone in.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-text/80">
              <p>We’ll spin up a WhatsApp group closer to the night so you get real-time updates, reveals, and timing nudges.</p>
              <p>Haven’t shared all attendee phone numbers yet? Reply to your confirmation email with any missing contacts.</p>
            </CardContent>
            <CardFooter className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/">Back to home</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/book">Plan another crawl</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your reference</CardTitle>
              <CardDescription>Keep this handy if you reach out with updates.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-text/80">
              <p>
                Confirmation reference: <span className="font-semibold text-text">{ref}</span>
              </p>
              <p>We’ll email when your line-up is confirmed and send the final balance closer to the date.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Section>
  );
}

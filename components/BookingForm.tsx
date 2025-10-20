"use client";

import { useMemo, useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { PhoneListField } from "@/components/form/PhoneListField";
import { DatePicker } from "@/components/form/DatePicker";
import { FormField } from "@/components/form/FormField";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/Card";
import { HelperText } from "@/components/ui/HelperText";
import { Icon } from "@/components/ui/Icon";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Toggle } from "@/components/ui/Toggle";
import {
  DEPOSIT,
  MAX_GUESTS,
  MIN_GUESTS,
  MIN_MEAL_BUDGET,
  MINIMUM_NOTICE_DAYS,
  MIN_WINE_BUDGET,
  NEIGHBOURHOODS,
  SUGGESTED_MEAL_BUDGET,
  SUGGESTED_WINE_BUDGET,
  VIBES
} from "@/lib/constants";
import {
  addDays,
  getTorontoToday,
  isSelectableBookingDate,
  isoStringToDateInput,
  toTorontoDateISOString
} from "@/lib/datetime";
import type { BookingFormValues, BookingRecord } from "@/lib/validation";
import { bookingSchema } from "@/lib/validation";

const currencyFormatter = new Intl.NumberFormat("en-CA", {
  style: "currency",
  currency: "CAD",
  maximumFractionDigits: 0
});

const formatCurrency = (value: number) => currencyFormatter.format(value);

const DEFAULT_EVENT_TIME = "19:00";

const toDateInputString = (date: Date) => date.toISOString().slice(0, 10);

const ADVANCE_NOTICE_MESSAGE = `More time = more options. Book at least ${Math.ceil(
  MINIMUM_NOTICE_DAYS / 7
)} weeks in advance — the earlier you book, the more incredible restaurants we can line up for you.`;

const buildTorontoISO = (dateInput: string) => {
  const iso = toTorontoDateISOString(dateInput);
  return iso ?? `${dateInput}T00:00:00-05:00`;
};

type BookingPayload = Omit<BookingRecord, "id" | "createdAt">;

type PolicyErrorGroup = {
  acceptsTerms?: string;
  acknowledgesFamilyStyle?: string;
  acknowledgesAlcoholPolicy?: string;
};

export function BookingForm() {
  const router = useRouter();
  const { minDateInput, defaultIsoDate } = useMemo(() => {
    const torontoToday = getTorontoToday();
    const minimumDate = addDays(torontoToday, MINIMUM_NOTICE_DAYS);
    const minimumInput = toDateInputString(minimumDate);
    const defaultIso = buildTorontoISO(minimumInput);

    return {
      minDateInput: minimumInput,
      defaultIsoDate: defaultIso
    };
  }, []);

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    mode: "onSubmit",
    defaultValues: {
      contact: {
        bookerName: "",
        bookerEmail: "",
        partyPhoneNumbers: ["", ""],
        neighborhood: NEIGHBOURHOODS[0],
        date: defaultIsoDate,
        time: DEFAULT_EVENT_TIME
      },
      party: {
        partySize: MIN_GUESTS,
        mobilityNeeds: false,
        accessibilityNotes: undefined
      },
      preferences: {
        vibe: VIBES[0],
        cuisinesLiked: [],
        cuisinesAvoid: [],
        likesAboutRestaurants: "",
        dietaryRestrictions: ""
      },
      pricing: {
        mealBudgetPerPersonMax: SUGGESTED_MEAL_BUDGET,
        winePairings: {
          include: false,
          budgetPerPersonMax: SUGGESTED_WINE_BUDGET
        }
      },
      policyAcknowledgements: {
        acceptsTerms: false,
        acknowledgesFamilyStyle: false,
        acknowledgesAlcoholPolicy: false
      },
      misc: {
        notes: ""
      }
    }
  });

  const {
    handleSubmit,
    watch,
    control,
    formState: { errors }
  } = form;

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const partySize = watch("party.partySize") || MIN_GUESTS;
  const mealBudget = watch("pricing.mealBudgetPerPersonMax") || MIN_MEAL_BUDGET;
  const includeWine = watch("pricing.winePairings.include");
  const wineBudget = includeWine ? watch("pricing.winePairings.budgetPerPersonMax") || MIN_WINE_BUDGET : 0;

  const perPersonFood = Math.max(mealBudget, MIN_MEAL_BUDGET);
  const perPersonWine = includeWine ? Math.max(wineBudget, MIN_WINE_BUDGET) : 0;
  const perPersonTotal = perPersonFood + perPersonWine;
  const estimatedMealMax = perPersonFood * partySize;
  const estimatedWineMax = includeWine ? perPersonWine * partySize : 0;
  const estimatedTotal = perPersonTotal * partySize;
  const balanceDue = Math.max(estimatedTotal - DEPOSIT, 0);

  const policyErrors: PolicyErrorGroup = {
    acceptsTerms: errors.policyAcknowledgements?.acceptsTerms?.message,
    acknowledgesFamilyStyle: errors.policyAcknowledgements?.acknowledgesFamilyStyle?.message,
    acknowledgesAlcoholPolicy: errors.policyAcknowledgements?.acknowledgesAlcoholPolicy?.message
  };

  const onSubmit = async (values: BookingFormValues) => {
    setSubmitting(true);
    setSubmitError(null);

    const sanitized: BookingFormValues = {
      ...values,
      contact: {
        ...values.contact,
        partyPhoneNumbers: values.contact.partyPhoneNumbers.map((phone) => phone.trim())
      },
      preferences: {
        ...values.preferences,
        cuisinesLiked: values.preferences.cuisinesLiked.map((item) => item.trim()).filter(Boolean),
        cuisinesAvoid: values.preferences.cuisinesAvoid.map((item) => item.trim()).filter(Boolean)
      },
      pricing: {
        ...values.pricing,
        winePairings: values.pricing.winePairings.include
          ? {
              include: true,
              budgetPerPersonMax: values.pricing.winePairings.budgetPerPersonMax
            }
          : { include: false, budgetPerPersonMax: undefined }
      },
      party: {
        ...values.party,
        accessibilityNotes: values.party.accessibilityNotes?.trim() || undefined
      },
      misc: {
        notes: values.misc.notes?.trim() || undefined
      }
    };

    const payload: BookingPayload = {
      ...sanitized,
      totals: {
        perPersonFood,
        perPersonWine,
        perPersonTotal,
        estimatedTotal,
        depositDue: DEPOSIT,
        balanceDue
      }
    };

    try {
      const response = await fetch("/api/book", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error("We couldn’t save your request. Please try again.");
      }

      const data: { ref: string } = await response.json();
      router.push(`/thanks?ref=${data.ref}`);
    } catch (error) {
      console.error(error);
      setSubmitError(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-10 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Who’s booking?</CardTitle>
              <CardDescription>We’ll reach out within two business days to confirm availability.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                htmlFor="bookerName"
                label="Full name"
                required
                error={errors.contact?.bookerName?.message}
              >
                {({ id, describedBy }) => (
                  <Input
                    id={id}
                    aria-describedby={describedBy}
                    placeholder="Jordan Lee"
                    {...form.register("contact.bookerName")}
                  />
                )}
              </FormField>
              <FormField
                htmlFor="bookerEmail"
                label="Email"
                required
                error={errors.contact?.bookerEmail?.message}
              >
                {({ id, describedBy }) => (
                  <Input
                    id={id}
                    type="email"
                    aria-describedby={describedBy}
                    placeholder="you@email.com"
                    {...form.register("contact.bookerEmail")}
                  />
                )}
              </FormField>
              <PhoneListField />
              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  htmlFor="neighborhood"
                  label="Neighbourhood"
                  required
                  error={errors.contact?.neighborhood?.message}
                >
                  {({ id, describedBy }) => (
                    <Select
                      id={id}
                      aria-describedby={describedBy}
                      {...form.register("contact.neighborhood")}
                    >
                      {NEIGHBOURHOODS.map((option) => (
                        <option value={option} key={option}>
                          {option}
                        </option>
                      ))}
                    </Select>
                  )}
                </FormField>
                <FormField
                  htmlFor="partySize"
                  label="Guest count"
                  required
                  hint={`2–6 guests keeps things intimate.`}
                  error={errors.party?.partySize?.message}
                >
                  {({ id, describedBy }) => (
                    <Input
                      id={id}
                      type="number"
                      min={MIN_GUESTS}
                      max={MAX_GUESTS}
                      aria-describedby={describedBy}
                      {...form.register("party.partySize", { valueAsNumber: true })}
                    />
                  )}
                </FormField>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                <Controller
                  control={control}
                  name="contact.date"
                  render={({ field }) => (
                    <FormField
                      htmlFor="eventDate"
                      label="Preferred date"
                      required
                      hint={ADVANCE_NOTICE_MESSAGE}
                      labelAccessory={
                        <button
                          type="button"
                          className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-transparent bg-transparent text-muted transition hover:text-text"
                          aria-label={ADVANCE_NOTICE_MESSAGE}
                          title={ADVANCE_NOTICE_MESSAGE}
                        >
                          <Icon name="Info" className="h-4 w-4" aria-hidden="true" />
                        </button>
                      }
                      error={errors.contact?.date?.message}
                    >
                      {({ id, describedBy }) => (
                        <DatePicker
                          id={id}
                          aria-describedby={describedBy}
                          min={minDateInput}
                          value={isoStringToDateInput(field.value)}
                          isDisabled={(date) => !isSelectableBookingDate(date)}
                          onChange={(event) => {
                            const nextValue = event.target.value;
                            const iso = nextValue ? buildTorontoISO(nextValue) : "";
                            field.onChange(iso);
                          }}
                          onBlur={field.onBlur}
                        />
                      )}
                    </FormField>
                  )}
                />
                <FormField
                  htmlFor="eventTime"
                  label="Preferred start time"
                  required
                  hint="We’ll fine-tune with the restaurants."
                  error={errors.contact?.time?.message}
                >
                  {({ id, describedBy }) => (
                    <Input
                      id={id}
                      type="time"
                      aria-describedby={describedBy}
                      step={900}
                      {...form.register("contact.time")}
                    />
                  )}
                </FormField>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your guests</CardTitle>
              <CardDescription>Help us tailor pacing and routes that work for everyone.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                htmlFor="mobilityNeeds"
                label="Mobility needs"
                error={errors.party?.mobilityNeeds?.message}
              >
                {({ id, describedBy }) => (
                  <div className="flex items-center gap-3">
                    <input
                      id={id}
                      type="checkbox"
                      aria-describedby={describedBy}
                      className="h-5 w-5 rounded border-zinc-300 text-primary focus:ring-2 focus:ring-ring"
                      {...form.register("party.mobilityNeeds")}
                    />
                    <span className="text-sm text-text/80">Check if anyone prefers elevators, minimal walking, or step-free access.</span>
                  </div>
                )}
              </FormField>
              <FormField
                htmlFor="accessibilityNotes"
                label="Accessibility notes"
                hint="Share anything else that helps us plan smooth transitions."
                error={errors.party?.accessibilityNotes?.message}
              >
                {({ id, describedBy }) => (
                  <Textarea
                    id={id}
                    aria-describedby={describedBy}
                    rows={4}
                    placeholder="Two guests prefer limited stairs; please avoid narrow patios."
                    {...form.register("party.accessibilityNotes")}
                  />
                )}
              </FormField>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your vibe & menu cues</CardTitle>
              <CardDescription>Tell us what makes a great night for your crew.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                htmlFor="vibe"
                label="Preferred vibe"
                required
                error={errors.preferences?.vibe?.message}
              >
                {({ id, describedBy }) => (
                  <Select id={id} aria-describedby={describedBy} {...form.register("preferences.vibe")}>
                    {VIBES.map((option) => (
                      <option value={option} key={option}>
                        {option}
                      </option>
                    ))}
                  </Select>
                )}
              </FormField>
              <Controller
                control={control}
                name="preferences.cuisinesLiked"
                render={({ field }) => (
                  <FormField
                    htmlFor="cuisinesLiked"
                    label="Cuisines you love"
                    required
                    hint="One per line—think Thai, tapas, omakase, etc."
                    error={errors.preferences?.cuisinesLiked?.message}
                  >
                    {({ id, describedBy }) => (
                      <Textarea
                        id={id}
                        aria-describedby={describedBy}
                        rows={4}
                        placeholder={"Sushi omakase\nModern Italian"}
                        value={field.value.join("\n")}
                        onChange={(event) => {
                          const entries = event.target.value
                            .split(/\n+/)
                            .map((item) => item.trim())
                            .filter(Boolean);
                          field.onChange(entries);
                        }}
                      />
                    )}
                  </FormField>
                )}
              />
              <Controller
                control={control}
                name="preferences.cuisinesAvoid"
                render={({ field }) => (
                  <FormField
                    htmlFor="cuisinesAvoid"
                    label="Cuisines to skip"
                    hint="Optional—note cuisines or ingredients you’d rather avoid."
                    error={errors.preferences?.cuisinesAvoid?.message}
                  >
                    {({ id, describedBy }) => (
                      <Textarea
                        id={id}
                        aria-describedby={describedBy}
                        rows={3}
                        placeholder={"No shellfish\nNo super spicy"}
                        value={field.value.join("\n")}
                        onChange={(event) => {
                          const entries = event.target.value
                            .split(/\n+/)
                            .map((item) => item.trim())
                            .filter(Boolean);
                          field.onChange(entries);
                        }}
                      />
                    )}
                  </FormField>
                )}
              />
              <FormField
                htmlFor="likesAboutRestaurants"
                label="What you love about restaurants"
                required
                hint="Tell us about ambience, energy, service touches—whatever makes the night."
                error={errors.preferences?.likesAboutRestaurants?.message}
              >
                {({ id, describedBy }) => (
                  <Textarea
                    id={id}
                    aria-describedby={describedBy}
                    rows={4}
                    placeholder="Cozy rooms with vinyl, shareable plates, lots of storytelling from the staff."
                    {...form.register("preferences.likesAboutRestaurants")}
                  />
                )}
              </FormField>
              <FormField
                htmlFor="dietaryRestrictions"
                label="Shared dietary notes"
                required
                hint="One set of notes applies to the whole group—family-style dining keeps things cohesive."
                error={errors.preferences?.dietaryRestrictions?.message}
              >
                {({ id, describedBy }) => (
                  <Textarea
                    id={id}
                    aria-describedby={describedBy}
                    rows={3}
                    placeholder="One guest is pescatarian; everyone avoids peanuts."
                    {...form.register("preferences.dietaryRestrictions")}
                  />
                )}
              </FormField>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Investment details</CardTitle>
              <CardDescription>Set the ceiling per guest—we’ll curate within it.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                htmlFor="mealBudget"
                label="Meal budget per guest"
                required
                hint={`Minimum $${MIN_MEAL_BUDGET}. We suggest ~ $${SUGGESTED_MEAL_BUDGET}.`}
                error={errors.pricing?.mealBudgetPerPersonMax?.message}
              >
                {({ id, describedBy }) => (
                  <Input
                    id={id}
                    type="number"
                    min={MIN_MEAL_BUDGET}
                    aria-describedby={describedBy}
                    {...form.register("pricing.mealBudgetPerPersonMax", { valueAsNumber: true })}
                  />
                )}
              </FormField>
              <div className="space-y-4 rounded-2xl border border-white/10 bg-card/80 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-text">Wine pairings</p>
                    <p className="text-sm text-text/70">Optional add-on—flat pours at each stop.</p>
                  </div>
                  <Controller
                    control={control}
                    name="pricing.winePairings.include"
                    render={({ field }) => (
                      <Toggle
                        type="button"
                        pressed={field.value}
                        onClick={() => field.onChange(!field.value)}
                      >
                        {field.value ? "Included" : "Add wine"}
                      </Toggle>
                    )}
                  />
                </div>
                {includeWine && (
                  <FormField
                    htmlFor="wineBudget"
                    label="Wine budget per guest"
                    required
                    hint={`Minimum $${MIN_WINE_BUDGET}. We suggest ~ $${SUGGESTED_WINE_BUDGET}.`}
                    error={errors.pricing?.winePairings?.budgetPerPersonMax?.message}
                  >
                    {({ id, describedBy }) => (
                      <Input
                        id={id}
                        type="number"
                        min={MIN_WINE_BUDGET}
                        aria-describedby={describedBy}
                        {...form.register("pricing.winePairings.budgetPerPersonMax", { valueAsNumber: true })}
                      />
                    )}
                  </FormField>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Policies</CardTitle>
              <CardDescription>We keep crawls smooth with clear commitments.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="flex items-start gap-3 text-sm text-text/90">
                  <input
                    type="checkbox"
                    className="mt-1 h-5 w-5 rounded border-zinc-300 text-primary focus:ring-2 focus:ring-ring"
                    aria-describedby={policyErrors.acceptsTerms ? "policy-terms-error" : undefined}
                    {...form.register("policyAcknowledgements.acceptsTerms")}
                  />
                  <span>
                    I’ve reviewed the booking terms and understand the $75 non-refundable deposit to hold the date.
                  </span>
                </label>
                {policyErrors.acceptsTerms && (
                  <p id="policy-terms-error" className="text-sm text-red-500">
                    {policyErrors.acceptsTerms}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label className="flex items-start gap-3 text-sm text-text/90">
                  <input
                    type="checkbox"
                    className="mt-1 h-5 w-5 rounded border-zinc-300 text-primary focus:ring-2 focus:ring-ring"
                    aria-describedby={policyErrors.acknowledgesFamilyStyle ? "policy-family-error" : undefined}
                    {...form.register("policyAcknowledgements.acknowledgesFamilyStyle")}
                  />
                  <span>
                    Our group can commit to one shared set of dietary notes so courses can be served family-style.
                  </span>
                </label>
                {policyErrors.acknowledgesFamilyStyle && (
                  <p id="policy-family-error" className="text-sm text-red-500">
                    {policyErrors.acknowledgesFamilyStyle}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label className="flex items-start gap-3 text-sm text-text/90">
                  <input
                    type="checkbox"
                    className="mt-1 h-5 w-5 rounded border-zinc-300 text-primary focus:ring-2 focus:ring-ring"
                    aria-describedby={policyErrors.acknowledgesAlcoholPolicy ? "policy-alcohol-error" : undefined}
                    {...form.register("policyAcknowledgements.acknowledgesAlcoholPolicy")}
                  />
                  <span>
                    I understand reschedules require 3 days’ notice and that alcohol service is subject to venue policies.
                  </span>
                </label>
                {policyErrors.acknowledgesAlcoholPolicy && (
                  <p id="policy-alcohol-error" className="text-sm text-red-500">
                    {policyErrors.acknowledgesAlcoholPolicy}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Anything else?</CardTitle>
              <CardDescription>Surprises, celebrations, or extra context.</CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                htmlFor="additionalNotes"
                label="Notes for our concierge team"
                hint="Optional—let us know about proposals, corporate cards, or timing quirks."
                error={errors.misc?.notes?.message}
              >
                {({ id, describedBy }) => (
                  <Textarea
                    id={id}
                    aria-describedby={describedBy}
                    rows={4}
                    placeholder="Celebrating a 5-year anniversary; would love a dessert finale with candles."
                    {...form.register("misc.notes")}
                  />
                )}
              </FormField>
            </CardContent>
          </Card>

          {submitError && (
            <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
              {submitError}
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Submitting…" : "Submit booking request"}
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/">Cancel</Link>
            </Button>
          </div>
        </div>

        <aside className="space-y-6">
          <Card className="md:sticky md:top-6">
            <CardHeader>
              <Badge variant="accent" className="w-fit">
                Booking summary
              </Badge>
              <CardTitle>Your investment snapshot</CardTitle>
              <CardDescription>
                Numbers update as you tweak guests and budgets—final lineup confirmed after we chat with restaurants.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 text-sm text-text/85">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-text">
                  <span className="font-medium">Deposit due now</span>
                  <span className="font-semibold">{formatCurrency(DEPOSIT)}</span>
                </div>
                <HelperText className="mt-0 text-xs text-text/70">
                  Non-refundable. We’ll email e-transfer instructions once availability is confirmed.
                </HelperText>
              </div>
              <div className="space-y-3 rounded-xl border border-white/10 bg-card p-4">
                <div className="flex items-center justify-between">
                  <span>Guests</span>
                  <span>{partySize}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Estimated meal max</span>
                  <span>{formatCurrency(estimatedMealMax)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Estimated wine max</span>
                  <span>{includeWine ? formatCurrency(estimatedWineMax) : "—"}</span>
                </div>
              </div>
              <div className="rounded-xl border border-white/10 bg-card/80 p-4 text-xs text-text/75">
                Final balance will be emailed later based on actual spend (for example, $154.85 per person).
              </div>
            </CardContent>
            <CardFooter>
              <HelperText className="mt-0">
                Reschedule with 3+ days’ notice; new dates must be at least three weeks out.
              </HelperText>
            </CardFooter>
          </Card>
        </aside>
      </form>
    </FormProvider>
  );
}

export default BookingForm;

import { NextResponse } from "next/server";

import { DEPOSIT } from "@/lib/constants";
import { calculateTotals } from "@/lib/pricing";
import { addBooking } from "@/lib/storage";
import { bookingSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const parsed = bookingSchema.safeParse({
      ...payload,
      contact: {
        ...payload.contact,
        bookerName: payload.contact?.bookerName ?? "",
        bookerEmail: payload.contact?.bookerEmail ?? "",
        partyPhoneNumbers: Array.isArray(payload.contact?.partyPhoneNumbers)
          ? payload.contact.partyPhoneNumbers.map((phone: unknown) => String(phone))
          : [],
        neighborhood: payload.contact?.neighborhood,
        date: typeof payload.contact?.date === "string" ? payload.contact.date : "",
        time: typeof payload.contact?.time === "string" ? payload.contact.time : ""
      },
      party: {
        partySize: Number(payload.party?.partySize),
        mobilityNeeds: Boolean(payload.party?.mobilityNeeds),
        accessibilityNotes:
          typeof payload.party?.accessibilityNotes === "string" ? payload.party.accessibilityNotes : undefined
      },
      preferences: {
        ...payload.preferences,
        vibe: payload.preferences?.vibe,
        cuisinesLiked: Array.isArray(payload.preferences?.cuisinesLiked)
          ? payload.preferences.cuisinesLiked.map((item: unknown) => String(item))
          : [],
        cuisinesAvoid: Array.isArray(payload.preferences?.cuisinesAvoid)
          ? payload.preferences.cuisinesAvoid.map((item: unknown) => String(item))
          : [],
        likesAboutRestaurants:
          typeof payload.preferences?.likesAboutRestaurants === "string"
            ? payload.preferences.likesAboutRestaurants
            : "",
        dietaryRestrictions:
          typeof payload.preferences?.dietaryRestrictions === "string"
            ? payload.preferences.dietaryRestrictions
            : ""
      },
      pricing: {
        mealBudgetPerPersonMax: Number(payload.pricing?.mealBudgetPerPersonMax),
        winePairings: {
          include: Boolean(payload.pricing?.winePairings?.include),
          budgetPerPersonMax:
            payload.pricing?.winePairings?.budgetPerPersonMax === undefined
              ? undefined
              : Number(payload.pricing.winePairings.budgetPerPersonMax)
        }
      },
      policyAcknowledgements: {
        acceptsTerms: Boolean(payload.policyAcknowledgements?.acceptsTerms),
        acknowledgesFamilyStyle: Boolean(payload.policyAcknowledgements?.acknowledgesFamilyStyle),
        acknowledgesAlcoholPolicy: Boolean(payload.policyAcknowledgements?.acknowledgesAlcoholPolicy)
      },
      misc: {
        notes: typeof payload.misc?.notes === "string" ? payload.misc.notes : undefined
      }
    });

    if (!parsed.success) {
      return NextResponse.json({ errors: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const values = parsed.data;
    const sanitized = {
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
          ? values.pricing.winePairings
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

    const totals = calculateTotals(sanitized);
    const booking = await addBooking({
      ...sanitized,
      totals
    });

    const ref = booking.id;

    const messageBlocks = {
      confirmation:
        "Thanks! We’ve got your request. Your $75 non-refundable deposit holds your date while we craft your route. Watch your email for the final balance once menus are set.",
      eTransfer: `Send your deposit within 24 hours to [your-etransfer@email]. Use memo: ‘Fistful of Flavours — ${ref}’. The remaining balance (based on actual spend) will be emailed once confirmed.`,
      policies: [
        "• Rescheduling: You may request a reschedule up to 3 days before your crawl. The new date must be at least 3 weeks from the day you request the change. One reschedule per booking.",
        "• Family-style: One dietary restriction applies to all guests.",
        "• Alcohol: Guests must be 19+ for pairings. We’re not responsible if a restaurant declines alcohol service due to intoxication or ID. No refunds for wine pairings or service that is declined for these reasons."
      ]
    } as const;

    return NextResponse.json(
      {
        ref,
        depositDue: DEPOSIT,
        messageBlocks
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to process booking." }, { status: 500 });
  }
}

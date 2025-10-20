import { z } from "zod";

import {
  DEPOSIT,
  MAX_GUESTS,
  MIN_GUESTS,
  MIN_MEAL_BUDGET,
  MINIMUM_NOTICE_DAYS,
  MIN_WINE_BUDGET,
  NEIGHBOURHOODS,
  VIBES
} from "./constants";
import { isSelectableBookingDate } from "./datetime";

const torontoIsoRegex = /^(\d{4}-\d{2}-\d{2})T\d{2}:\d{2}:\d{2}(?:\.\d{3})?(?:-04:00|-05:00)$/;

const phoneNumberSchema = z
  .string({ required_error: "Add a contact number." })
  .trim()
  .min(10, "Phone numbers should be at least 10 digits.")
  .max(20, "That phone number looks a little long.");

const cuisineString = z
  .string()
  .trim()
  .min(2, "Share a short cuisine keyword.")
  .max(60, "Keep cuisine notes short and sweet.");

export const bookingSchema = z
  .object({
    contact: z.object({
      bookerName: z
        .string()
        .trim()
        .min(2, "Share the primary guest’s full name."),
      bookerEmail: z.string().email("We need a valid email to confirm details."),
      partyPhoneNumbers: z
        .array(phoneNumberSchema)
        .min(1, "Add at least one mobile number for day-of updates.")
        .max(6, "We only need up to six contact numbers."),
      neighborhood: z.enum(NEIGHBOURHOODS, { errorMap: () => ({ message: "Pick a neighbourhood." }) }),
      date: z
        .string()
        .refine((value) => torontoIsoRegex.test(value), {
          message: "Dates should use the Toronto timezone format (e.g. 2024-05-01T00:00:00-04:00)."
        }),
      time: z
        .string()
        .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Choose a start time in 24-hour format (e.g. 19:30).")
    }),
    party: z.object({
      partySize: z
        .number({ invalid_type_error: "Enter your guest count." })
        .int("Guest count must be a whole number.")
        .min(MIN_GUESTS, `We host a minimum of ${MIN_GUESTS} guests.`)
        .max(MAX_GUESTS, `Let’s keep it intimate at ${MAX_GUESTS} guests max.`),
      mobilityNeeds: z.boolean(),
      accessibilityNotes: z
        .string()
        .trim()
        .max(1000, "Keep accessibility notes under 1000 characters.")
        .optional()
        .or(z.literal(""))
        .transform((value) => (value ? value : undefined))
    }),
    preferences: z.object({
      vibe: z.enum(VIBES, { errorMap: () => ({ message: "Pick the vibe you’re leaning toward." }) }),
      cuisinesLiked: z
        .array(cuisineString)
        .min(1, "Tell us at least one cuisine you love."),
      cuisinesAvoid: z.array(cuisineString).default([]),
      likesAboutRestaurants: z
        .string()
        .trim()
        .min(10, "Tell us what excites you about dining out.")
        .max(1500, "Keep it under 1500 characters."),
      dietaryRestrictions: z
        .string()
        .trim()
        .min(1, "Share any shared dietary notes or write ‘None’.")
        .max(1500, "Keep dietary notes under 1500 characters.")
    }),
    pricing: z.object({
      mealBudgetPerPersonMax: z
        .number({ invalid_type_error: "Enter your per-person meal budget." })
        .min(MIN_MEAL_BUDGET, `Minimum is $${MIN_MEAL_BUDGET} per person.`),
      winePairings: z.object({
        include: z.boolean(),
        budgetPerPersonMax: z
          .number({ invalid_type_error: "Enter your per-person wine budget." })
          .min(MIN_WINE_BUDGET, `Wine pairings start at $${MIN_WINE_BUDGET} per guest.`)
          .optional()
      })
    }),
    policyAcknowledgements: z.object({
      acceptsTerms: z.literal(true, {
        errorMap: () => ({ message: "Please acknowledge the booking terms." })
      }),
      acknowledgesFamilyStyle: z.literal(true, {
        errorMap: () => ({ message: "Confirm that one dietary restriction applies to all guests." })
      }),
      acknowledgesAlcoholPolicy: z.literal(true, {
        errorMap: () => ({ message: "Confirm you understand the alcohol service policy." })
      })
    }),
    misc: z.object({
      notes: z
        .string()
        .trim()
        .max(1500, "Keep additional notes under 1500 characters.")
        .optional()
        .or(z.literal(""))
        .transform((value) => (value ? value : undefined))
    })
  })
  .superRefine((value, ctx) => {
    const selectedDate = new Date(value.contact.date);
    if (Number.isNaN(selectedDate.getTime())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["contact", "date"],
        message: "Choose a valid date."
      });
    } else {
      if (!isSelectableBookingDate(selectedDate)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["contact", "date"],
          message: "Bookings require at least three weeks’ notice."
        });
      }
    }

    const phoneCount = value.contact.partyPhoneNumbers.length;
    if (phoneCount < value.party.partySize) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["contact", "partyPhoneNumbers"],
        message: "Share a phone number for each guest so we can coordinate day-of."
      });
    }

    if (value.pricing.winePairings.include) {
      if (value.pricing.winePairings.budgetPerPersonMax === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["pricing", "winePairings", "budgetPerPersonMax"],
          message: `Wine pairings start at $${MIN_WINE_BUDGET} per guest.`
        });
      } else if (value.pricing.winePairings.budgetPerPersonMax < MIN_WINE_BUDGET) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["pricing", "winePairings", "budgetPerPersonMax"],
          message: `Wine pairings start at $${MIN_WINE_BUDGET} per guest.`
        });
      }
    }
  });

export type BookingFormValues = z.infer<typeof bookingSchema>;
export type BookingContact = BookingFormValues["contact"];
export type BookingParty = BookingFormValues["party"];
export type BookingPreferences = BookingFormValues["preferences"];
export type BookingPricing = BookingFormValues["pricing"];
export type BookingPolicyAcknowledgements = BookingFormValues["policyAcknowledgements"];
export type BookingMisc = BookingFormValues["misc"];

export type BookingRecord = BookingFormValues & {
  id: string;
  createdAt: string;
  totals: {
    perPersonFood: number;
    perPersonWine: number;
    perPersonTotal: number;
    estimatedTotal: number;
    depositDue: number;
    balanceDue: number;
  };
};

export const DEPOSIT_DETAILS = {
  amount: DEPOSIT,
  instructions: "Send via Interac e-transfer to pay@fistfulofflavours.com"
};

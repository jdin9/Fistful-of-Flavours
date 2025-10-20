import { NextResponse } from "next/server";

import { readBookings } from "@/lib/storage";

const HEADERS = [
  "ref",
  "createdAt",
  "neighborhood",
  "date",
  "time",
  "partySize",
  "mealBudgetPerPersonMax",
  "wineIncluded",
  "wineBudgetPerPersonMax",
  "dietaryRestrictions",
  "accessibilityNotes",
  "bookerName",
  "bookerEmail",
  "phoneNumbers"
] as const;

type HeaderKey = (typeof HEADERS)[number];

type CsvRow = Record<HeaderKey, string>;

function escapeCsv(value: string): string {
  const needsQuoting = value.includes(",") || value.includes("\"") || value.includes("\n") || value.includes("\r");
  const escaped = value.replace(/"/g, '""');
  return needsQuoting ? `"${escaped}"` : escaped;
}

export async function GET() {
  try {
    const bookings = await readBookings();

    const rows: CsvRow[] = bookings.map((booking) => ({
      ref: booking.id,
      createdAt: booking.createdAt,
      neighborhood: booking.contact.neighborhood,
      date: booking.contact.date,
      time: booking.contact.time,
      partySize: String(booking.party.partySize),
      mealBudgetPerPersonMax: booking.pricing.mealBudgetPerPersonMax.toString(),
      wineIncluded: booking.pricing.winePairings.include ? "true" : "false",
      wineBudgetPerPersonMax:
        booking.pricing.winePairings.include && booking.pricing.winePairings.budgetPerPersonMax
          ? booking.pricing.winePairings.budgetPerPersonMax.toString()
          : "",
      dietaryRestrictions: booking.preferences.dietaryRestrictions,
      accessibilityNotes: booking.party.accessibilityNotes ?? "",
      bookerName: booking.contact.bookerName,
      bookerEmail: booking.contact.bookerEmail,
      phoneNumbers: booking.contact.partyPhoneNumbers.join(";")
    }));

    const csv = [
      HEADERS.join(","),
      ...rows.map((row) => HEADERS.map((header) => escapeCsv(row[header] ?? "")).join(","))
    ].join("\n");

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": "attachment; filename=bookings-export.csv"
      }
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to export bookings." }, { status: 500 });
  }
}

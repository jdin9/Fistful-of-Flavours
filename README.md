# Fistful of Flavours

A boutique Next.js (App Router) + TypeScript experience for booking curated multi-restaurant food crawls across Toronto. Built for local luxury vibes with clear policies, upfront pricing, and future-friendly messaging hooks.

## Getting started

```bash
npm run bootstrap
npm run dev
```

The `bootstrap` helper clears any proxy settings that might block access to the public npm registry (we saw `403 Forbidden` errors in CI when a corporate-style proxy was injected into the environment). If your own network setup is already able to reach `registry.npmjs.org`, a plain `npm install` still works. When the registry cannot be reached (such as in offline CI), the script will skip the install step and remind you to run `npm install` once connectivity is restored.

The app lives at [http://localhost:3000](http://localhost:3000).

## Tech stack

- [Next.js 14 (App Router)](https://nextjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) for type-safe validation

## Project structure

- `app/` – App Router pages (`/`, `/book`, `/thanks`) and the bookings API routes
- `components/` – Client components such as the booking form
- `lib/` – Shared constants, validation schema, pricing helpers, and JSON storage utilities
- `data/bookings/` – Temporary local persistence folder for submitted bookings (one JSON file per booking)

## Booking rules

- Bookings require at least **3 weeks’ notice**; earlier dates are disabled in the form and rejected by validation.
- You may request **one reschedule up to 3 days before** your crawl, but the new date must still be at least 3 weeks away from when you ask.

## Pricing guidance

- Meal budgets start at **$150 per guest** (we suggest planning around $200 per person for the best experience).
- Optional wine pairings start at **$75 per guest** (we suggest budgeting about $115 per person).
- Every booking places a **flat, non-refundable $75 deposit** via e-transfer; remaining balances are invoiced once menus are confirmed.

## Key features

- Friendly landing page that explains the concept, neighbourhoods, and policies using the Fistful of Flavours tone.
- Booking form with 3-week date minimum, per-person budget guardrails, optional wine pairing, and policy reminders.
- Server-side API that validates input with Zod and stores bookings to local JSON files.
- Confirmation page summarizing deposit instructions, totals, and next steps (ready for future WhatsApp automation).

## Scripts

- `npm run dev` – Start the development server
- `npm run bootstrap` – Install dependencies after clearing problematic proxy settings
- `npm run build` – Create an optimized production build
- `npm start` – Run the production build locally
- `npm run lint` – Run ESLint
- `npm run test` – Run vitest in CI mode
- `npm run format` – Check formatting with Prettier
- `npm run format:fix` – Fix formatting with Prettier

## Data storage

Bookings are persisted as JSON snapshots in `data/bookings/`. This folder is git-ignored and exists as a stand-in for a future database or CRM integration. Do not commit real guest data.

## Future enhancements

- Automated WhatsApp (or SMS) messaging to share day-of itineraries and restaurant reveals.

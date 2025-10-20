import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";

import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";

import "@/styles/globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-serif", display: "swap" });

const themeScript = `(() => {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.classList.toggle('dark', prefersDark);
})();`;

export const metadata: Metadata = {
  title: "Fistful of Flavours | Toronto Food Crawl Concierge",
  description:
    "Book a curated multi-restaurant food crawl across Toronto. We handle the planning, reservations, food, tax, and tip so you can just enjoy the night.",
  openGraph: {
    title: "Fistful of Flavours",
    description:
      "Boutique Toronto food crawl experiences with pre-planned routes, surprise courses, and white-glove coordination.",
    locale: "en_CA",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Fistful of Flavours",
    description: "Toronto food crawl concierge for date nights, celebrations, and small groups."
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans text-text" suppressHydrationWarning>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <div className="relative">
          <div className="pointer-events-none fixed inset-0 -z-10 bg-gradient-to-b from-primary/5 via-transparent to-accent/5" aria-hidden />
          <SiteHeader />
          <main>{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}

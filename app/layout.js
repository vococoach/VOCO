import { Analytics } from "@vercel/analytics/next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { THEME_CSS } from "@/lib/timeTheme";
import { PRE_HYDRATION_SCRIPT } from "@/lib/preHydration";

// Fonts are loaded through next/font: self-hosted from this origin, preloaded,
// with a size-matched fallback so text doesn't jump when they arrive. (They used
// to come from a render-blocking @import of fonts.googleapis.com in globals.css,
// which put a cross-origin round trip in front of every first paint.) The CSS
// variables are what globals.css and lib/shareCard.js read. Fraunces keeps its
// optical-size axis (the display cut at large sizes); Inter is the body face.
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-inter",
});
const fraunces = Fraunces({
  subsets: ["latin"],
  axes: ["opsz"],
  display: "swap",
  variable: "--font-fraunces",
});

export const metadata = {
  title: "Voco — Vocab Coach",
  description:
    "Learn vocabulary before you sleep. Quiz yourself to see what stuck.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1A1C3A",
};

export default function RootLayout({ children }) {
  return (
    // suppressHydrationWarning: the inline script below sets data-phase /
    // data-returning on <html> before React hydrates, which is the point.
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`} suppressHydrationWarning>
      <head>
        {/* The night/dawn palettes as CSS variables, then the script that picks
            between them (and spots a returning device) before first paint. Both
            are tiny and inline on purpose: no extra request, nothing to wait for.
            See lib/timeTheme.js and lib/preHydration.js. */}
        <style dangerouslySetInnerHTML={{ __html: THEME_CSS }} />
        <script dangerouslySetInnerHTML={{ __html: PRE_HYDRATION_SCRIPT }} />
      </head>
      {/* Vercel Web Analytics: anonymous page views plus three custom funnel
          events (lib/analytics.js) — no cookies, no per-visitor identifiers,
          nothing that ties a visit to a customer id or to saved progress.
          Consistent with the app's no-accounts design (see CLAUDE.md). */}
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}

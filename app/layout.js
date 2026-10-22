import { Analytics } from "@vercel/analytics/next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { THEME_CSS } from "@/lib/timeTheme";
import { PRE_HYDRATION_SCRIPT } from "@/lib/preHydration";
import { SITE_URL, HEADLINE, PROMISE } from "@/lib/site";

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

// The title and description are the first screen's own words (the headline, and the
// one-line promise under it; both come from lib/site.js, the same place the screen
// reads them from), so a tab, a search result and a shared link all say what the page
// says. The icons, manifest and share image are the files in public/ (generated from
// brand-assets/, which is source material and is not served). `metadataBase` turns
// the relative paths below into the absolute URLs that link previews need.
const TITLE = `Voco: ${HEADLINE}`;
const DESCRIPTION = PROMISE;

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  applicationName: "Voco",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    siteName: "Voco",
    url: "/",
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: `The Voco mark, a crescent moon and a sun, beside the line: ${PROMISE}` }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/og.jpg"],
  },
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

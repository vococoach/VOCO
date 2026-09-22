import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

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
    <html lang="en">
      {/* Vercel Web Analytics: aggregate, anonymous page-view counts only — no
          cookies, no per-visitor tracking. Consistent with the app's no-accounts,
          no-identification design (see CLAUDE.md); don't add event props that
          could identify a visitor (email, customer id, etc). */}
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}

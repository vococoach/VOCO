import "./globals.css";

export const metadata = {
  title: "Voco — Vocab Coach",
  description:
    "Learn vocabulary before you sleep — SAT vocab and everyday words. Quiz yourself to see what stuck.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1A1C3A",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

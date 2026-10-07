// Response headers for every route. Deliberately minimal and non-breaking:
// no Content-Security-Policy yet (it needs a pass over the inline pre-hydration
// script, next/font and Vercel Analytics before it can be enforced).
const securityHeaders = [
  // Browsers must trust the declared content type, never sniff another.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Send the origin only to other sites, and nothing downgrade-to-http. Keeps
  // paths (and any ?session_id= on /unlock) out of the Referer sent to Stripe
  // and other third parties.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Nothing legitimate embeds Voco in a frame.
  { key: "X-Frame-Options", value: "DENY" },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;

import { NextResponse } from "next/server";
import { getStripe, readJsonObject, isCustomerId, classifyStripeError } from "@/lib/stripeServer";

// Given a Stripe customer id (cached client-side from a past verified
// checkout), creates a Stripe-hosted Billing Portal session for that
// customer and returns its URL. The portal itself handles cancellation
// and payment-method updates — no custom UI needed here. Uses the
// request's own origin for the return link rather than a hardcoded
// domain, so this works identically on localhost and in production.
export async function POST(request) {
  const body = await readJsonObject(request);
  if (!body || !isCustomerId(body.customerId)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  let stripe;
  try {
    stripe = getStripe();
  } catch (e) {
    return NextResponse.json({ error: "Could not open subscription management" }, { status: 503 });
  }

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: body.customerId,
      return_url: request.nextUrl.origin + "/",
    });
    return NextResponse.json({ url: session.url });
  } catch (e) {
    const status = classifyStripeError(e) === "missing" ? 400 : 502;
    return NextResponse.json({ error: "Could not open subscription management" }, { status });
  }
}

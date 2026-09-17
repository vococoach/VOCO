import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Given a Stripe customer id (cached client-side from a past verified
// checkout), creates a Stripe-hosted Billing Portal session for that
// customer and returns its URL. The portal itself handles cancellation
// and payment-method updates — no custom UI needed here. Uses the
// request's own origin for the return link rather than a hardcoded
// domain, so this works identically on localhost and in production.
export async function POST(request) {
  const { customerId } = await request.json();
  if (!customerId) {
    return NextResponse.json({ error: "Missing customerId" }, { status: 400 });
  }

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: request.nextUrl.origin + "/",
    });
    return NextResponse.json({ url: session.url });
  } catch (e) {
    return NextResponse.json({ error: "Could not open subscription management" }, { status: 400 });
  }
}

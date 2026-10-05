import { NextResponse } from "next/server";
import { getStripe, readJsonObject, isCheckoutSessionId, classifyStripeError } from "@/lib/stripeServer";

// Must match the recurring Payment Link configured in the Stripe
// Dashboard for the subscription unlock (see lib/purchase.js
// PAYMENT_LINK_URL). Checked so this endpoint can't be used to "verify" a
// paid Checkout Session from some other product.
const EXPECTED_PAYMENT_LINK_ID = "plink_1UIAT8HSW53IY9shBH3iARzX";

export async function POST(request) {
  const body = await readJsonObject(request);
  if (!body || !isCheckoutSessionId(body.sessionId)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  let stripe;
  try {
    stripe = getStripe();
  } catch (e) {
    return NextResponse.json({ error: "Could not verify subscription" }, { status: 503 });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(body.sessionId, {
      expand: ["subscription"],
    });

    const rightProduct = session.payment_link === EXPECTED_PAYMENT_LINK_ID;
    const subscription = session.subscription;
    const status = subscription?.status;
    const active = status === "trialing" || status === "active";

    if (!rightProduct || !active || !session.customer) {
      return NextResponse.json({ unlocked: false });
    }

    return NextResponse.json({
      unlocked: true,
      customerId: typeof session.customer === "string" ? session.customer : session.customer.id,
      status,
    });
  } catch (e) {
    const status = classifyStripeError(e) === "missing" ? 400 : 502;
    return NextResponse.json({ error: "Could not verify subscription" }, { status });
  }
}

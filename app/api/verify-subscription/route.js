import { NextResponse } from "next/server";
import Stripe from "stripe";

// Must match the recurring Payment Link configured in the Stripe
// Dashboard for the subscription unlock (see lib/purchase.js
// PAYMENT_LINK_URL). Checked so this endpoint can't be used to "verify" a
// paid Checkout Session from some other product.
const EXPECTED_PAYMENT_LINK_ID = "plink_1UFaEjQbCm1Y6nVS1DOPNCBi";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  const { sessionId } = await request.json();
  if (!sessionId) {
    return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
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
    return NextResponse.json({ error: "Could not verify subscription" }, { status: 400 });
  }
}

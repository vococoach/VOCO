import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Given a Stripe customer id (cached client-side from a past verified
// checkout), asks Stripe directly whether that customer currently has a
// trialing or active subscription. Called at most once per calendar day
// per customer (see lib/purchase.js shouldRefreshStatus()) — this is what
// makes access actually turn off if someone cancels or a payment fails,
// instead of staying unlocked forever from the original checkout.
export async function POST(request) {
  const { customerId } = await request.json();
  if (!customerId) {
    return NextResponse.json({ error: "Missing customerId" }, { status: 400 });
  }

  try {
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "all",
      limit: 10,
    });

    const active = subscriptions.data.find((s) => s.status === "trialing" || s.status === "active");
    return NextResponse.json({ status: active ? active.status : "inactive" });
  } catch (e) {
    // Couldn't get an answer from Stripe (bad key, outage, bad customer id,
    // etc.) — distinct from Stripe successfully saying "no active
    // subscription." A non-2xx status here tells the client not to treat
    // this as a confirmed cancellation; see refreshSubscriptionStatus() in
    // lib/purchase.js.
    return NextResponse.json({ error: "Could not check subscription status" }, { status: 502 });
  }
}

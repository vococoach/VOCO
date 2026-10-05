import { NextResponse } from "next/server";
import { getStripe, readJsonObject, isCustomerId, checkSubscription } from "@/lib/stripeServer";

// Given a Stripe customer id (cached client-side from a past verified
// checkout), asks Stripe directly whether that customer currently has a
// trialing or active subscription. Called at most once per calendar day
// per customer (see lib/purchase.js shouldRefreshStatus()) — this is what
// makes access actually turn off if someone cancels or a payment fails,
// instead of staying unlocked forever from the original checkout.
//
// Two kinds of "no", deliberately different (lib/stripeServer.js):
//   200 + status "inactive"  — Stripe answered: no active subscription, or no
//                              such customer. The client revokes access.
//   502 / 503                — we got no answer. The client keeps its last
//                              known status.
//   400                      — the request itself was malformed.
export async function POST(request) {
  const body = await readJsonObject(request);
  if (!body || !isCustomerId(body.customerId)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  let stripe;
  try {
    stripe = getStripe();
  } catch (e) {
    return NextResponse.json({ error: "Could not check subscription status" }, { status: 503 });
  }

  const { httpStatus, body: payload } = await checkSubscription(stripe, body.customerId);
  return NextResponse.json(payload, { status: httpStatus });
}

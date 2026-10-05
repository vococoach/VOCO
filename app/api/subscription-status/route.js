import { NextResponse } from "next/server";
import {
  getStripe,
  readJsonObject,
  isCustomerId,
  checkSubscription,
  VERDICT_NO_SUCH_CUSTOMER,
} from "@/lib/stripeServer";

// Given a Stripe customer id (cached client-side from a past verified
// checkout), asks Stripe directly whether that customer currently has a
// trialing or active subscription. Called at most once per calendar day
// per customer (see lib/purchase.js shouldRefreshStatus()) — this is what
// makes access actually turn off if someone cancels or a payment fails,
// instead of staying unlocked forever from the original checkout.
//
// Two kinds of "no", deliberately different (lib/stripeServer.js):
//   200 + verdict            — an explicit answer. verdict "no_active_subscription"
//                              or "no_such_customer" is a definitive "no" and the
//                              client revokes; "subscribed" grants.
//   anything else            — no answer (502/503 Stripe or config trouble, 400
//                              malformed request, a 404 from a missing route, 401/403
//                              from a proxy...). The client keeps its last status.
// A string that is not even shaped like a Stripe customer id cannot be one, so
// that is answered with the explicit "no_such_customer" verdict (a forged id
// like "x" must not stay unlocked); a body that isn't JSON, or has no string
// customerId, is a plain 400.
export async function POST(request) {
  const body = await readJsonObject(request);
  if (!body || typeof body.customerId !== "string") {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  if (!isCustomerId(body.customerId)) {
    return NextResponse.json({
      status: "inactive",
      cancelAt: null,
      cancelAtPeriodEnd: false,
      verdict: VERDICT_NO_SUCH_CUSTOMER,
    });
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

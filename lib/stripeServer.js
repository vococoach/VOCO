// Server-side helpers shared by the three Stripe routes (app/api/*). Server only:
// nothing here is imported by client code.
//
// Why this file exists: the routes used to build the Stripe client at module
// load (so `next build` failed without STRIPE_SECRET_KEY), read the request
// body unguarded (malformed JSON became a 500), and answered every Stripe error
// with the same 502 — so "this customer does not exist" looked exactly like "Stripe
// is down", and the client (which fails open on a non-2xx) kept paid access
// forever for a made-up customer id. See refreshSubscriptionStatus() in
// lib/purchase.js for the client half of the contract.
import Stripe from "stripe";

let cached = null;

// Created on first use, inside a handler — never at import time. Throws
// (code "no_key") when the key is missing; handlers turn that into a 503.
export function getStripe() {
  if (cached) return cached;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    const error = new Error("STRIPE_SECRET_KEY is not set");
    error.code = "no_key";
    throw error;
  }
  cached = new Stripe(key, { timeout: 8000, maxNetworkRetries: 1 });
  return cached;
}

// Test seam: lets scripts/test-stripe-routes.mjs hand the routes a stand-in
// client so they run without a key or a network. Not used by the app.
export function setStripeForTests(client) {
  cached = client;
}

// Parses a JSON object body. Returns the object, or null for anything else
// (malformed JSON, empty body, an array, a string, null).
export async function readJsonObject(request) {
  try {
    const body = await request.json();
    return body && typeof body === "object" && !Array.isArray(body) ? body : null;
  } catch (e) {
    return null;
  }
}

// Shape checks only (not a claim the object exists). Stripe ids are
// alphanumeric after the prefix; anything else is a bad request, not a
// question for Stripe.
export function isCustomerId(value) {
  return typeof value === "string" && /^cus_[A-Za-z0-9]{6,200}$/.test(value);
}
export function isCheckoutSessionId(value) {
  return typeof value === "string" && /^cs_(test|live)_[A-Za-z0-9]{6,400}$/.test(value);
}

// What a Stripe failure means for the caller:
//   "missing"   — Stripe answered, definitively, that the object does not exist
//                 (made-up id, deleted customer, or an id from the other
//                 Stripe mode — Stripe says "No such customer" for all three).
//   "transient" — we did not get a real answer: outage, timeout, rate limit,
//                 a bad or missing API key, anything unrecognised. Never a
//                 reason to revoke access.
export function classifyStripeError(e) {
  if (e && e.type === "StripeInvalidRequestError" && e.code === "resource_missing") return "missing";
  return "transient";
}

const INACTIVE = { status: "inactive", cancelAt: null, cancelAtPeriodEnd: false };

// The whole subscription-status decision, with the Stripe client passed in so
// it can be tested with a stand-in. Returns { httpStatus, body }:
//   200 {status: "trialing"|"active", cancelAt, cancelAtPeriodEnd} — subscribed
//   200 {status: "inactive", ...}  — Stripe answered: no active subscription,
//                                    or no such customer (a definitive "no")
//   502 / 503                      — no answer; the client keeps its last status
export async function checkSubscription(stripe, customerId) {
  let subscriptions;
  try {
    subscriptions = await stripe.subscriptions.list({ customer: customerId, status: "all", limit: 10 });
  } catch (e) {
    if (classifyStripeError(e) === "missing") return { httpStatus: 200, body: INACTIVE };
    return { httpStatus: 502, body: { error: "Could not check subscription status" } };
  }

  const active = subscriptions.data.find((s) => s.status === "trialing" || s.status === "active");
  if (!active) return { httpStatus: 200, body: INACTIVE };

  // A subscription can be trialing/active *and* already scheduled to end —
  // Stripe's Customer Portal cancellation sets cancel_at and leaves the status
  // alone until then. cancel_at_period_end is the usual flag; cancel_at is the
  // actual timestamp and is set even for a mid-trial cancellation. Both are
  // surfaced so the client can show "ends on [date]" (see lib/purchase.js).
  return {
    httpStatus: 200,
    body: {
      status: active.status,
      cancelAtPeriodEnd: Boolean(active.cancel_at_period_end),
      cancelAt: active.cancel_at ? new Date(active.cancel_at * 1000).toISOString() : null,
    },
  };
}

// Subscription-based unlock via Stripe: one category in each course is free
// forever (FREE_CATEGORY_BY_COURSE below), and every other category, in every
// course, requires an active or trialing subscription — one subscription
// unlocks all of them (see PRICE_LABEL/TRIAL_LABEL below). Verified once via
// Stripe Checkout (see app/unlock/page.js + app/api/verify-subscription),
// then the Stripe **customer id** — not a boolean — is cached client-side
// so this device can ask Stripe directly whether that customer's
// subscription is still trialing/active. Re-checked at most once per
// calendar day (app/api/subscription-status), so access actually turns
// off if someone cancels or a payment fails, instead of staying unlocked
// forever from one past check. Still no accounts/database — see
// CLAUDE.md.

const CUSTOMER_KEY = "voco_customer_id_v1";
// { status, cancelAt: ISO string | null, checkedAt: "YYYY-MM-DD" }. A
// subscription can be status "trialing"/"active" *and* already scheduled
// to end — Stripe's Customer Portal cancellation doesn't revoke access
// immediately, it schedules cancelAt for the end of the current period
// (or trial). That's intentional and correct: someone who already paid
// for (or is mid-trial on) the current period keeps it. cancelAt just
// makes that visible instead of silently invisible — see getCancelAt()
// below.
const STATUS_CACHE_KEY = "voco_subscription_status_v1";

// The one category in each course that's free forever, so every course can be
// tried properly before paying. Keep this in sync with what the Payment Link's
// description promises. Keyed by course id (lib/wordbanks.js).
export const FREE_CATEGORY_BY_COURSE = {
  "sat-vocab": "agreement-support",
  "everyday-vocabulary": "precise-description",
  "professional-vocabulary": "meetings-negotiation",
};
export const FREE_CATEGORY_IDS = Object.values(FREE_CATEGORY_BY_COURSE);

export function isFreeCategory(categoryId) {
  return FREE_CATEGORY_IDS.includes(categoryId);
}

// Reading passages (SAT Vocab): one is free to try, like a free category, and
// the rest are part of the subscription. It doubles as the free sample of the
// passage layout. Keyed by course id. (Test-day strategy guides are free to
// everyone and are not gated at all.)
export const FREE_PASSAGE_BY_COURSE = {
  "sat-vocab": "tide-pool-census",
};
export const FREE_PASSAGE_IDS = Object.values(FREE_PASSAGE_BY_COURSE);

export function isPassageLocked(passageId, subscribed) {
  if (FREE_PASSAGE_IDS.includes(passageId)) return false;
  return !subscribed;
}

// Grammar & Standard English Conventions (SAT Vocab): one category is free to
// try, like the free vocabulary category and the free passage; the other
// requires the subscription. Keyed by course id.
export const FREE_GRAMMAR_CATEGORY_BY_COURSE = {
  "sat-vocab": "boundaries",
};
export const FREE_GRAMMAR_CATEGORY_IDS = Object.values(FREE_GRAMMAR_CATEGORY_BY_COURSE);

export function isGrammarCategoryLocked(categoryId, subscribed) {
  if (FREE_GRAMMAR_CATEGORY_IDS.includes(categoryId)) return false;
  return !subscribed;
}

// The LIVE Payment Link. Moves together with EXPECTED_PAYMENT_LINK_ID in
// app/api/verify-subscription/route.js and the live STRIPE_SECRET_KEY in Vercel
// (Production) — see "Going live" in CLAUDE.md.
export const PAYMENT_LINK_URL = "https://buy.stripe.com/8x2cN57lk66C7zyf1scAo00";
export const PRICE_LABEL = "$1.99/month";
export const TRIAL_LABEL = "7-day free trial";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function safeGet(key) {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch (e) {
    return null;
  }
}

function safeSet(key, value) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, value);
  } catch (e) {
    // fail silently — worst case the user has to re-verify next visit
  }
}

function safeRemove(key) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch (e) {}
}

export function getCustomerId() {
  return safeGet(CUSTOMER_KEY);
}

function readCachedStatus() {
  const raw = safeGet(STATUS_CACHE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

function setCachedStatus(status, cancelAt = null) {
  safeSet(STATUS_CACHE_KEY, JSON.stringify({ status, cancelAt, checkedAt: todayStr() }));
}

function isActiveStatus(status) {
  return status === "trialing" || status === "active";
}

// Called once, right after a successful Checkout redirect back to
// /unlock. Seeds the status cache with what that same verification call
// already told us, so the very next page load doesn't need a second
// round-trip to show the right state. A brand-new subscription can't
// already have a scheduled cancellation, so cancelAt is always null here.
export function setCustomerId(customerId, status) {
  safeSet(CUSTOMER_KEY, customerId);
  setCachedStatus(status, null);
}

export function clearCustomer() {
  safeRemove(CUSTOMER_KEY);
  safeRemove(STATUS_CACHE_KEY);
}

// Synchronous, instant, no network — what the UI should render on first
// paint. Reflects whatever was last verified with Stripe (possibly stale
// by up to a day; see shouldRefreshStatus() / refreshSubscriptionStatus()).
export function isSubscribedCached() {
  if (!getCustomerId()) return false;
  const cached = readCachedStatus();
  return cached ? isActiveStatus(cached.status) : false;
}

// Synchronous, instant, no network — the scheduled-cancellation date (ISO
// string) if this subscription is trialing/active but already set to end,
// or null if it isn't. Mirrors isSubscribedCached()'s cache-first pattern.
// Being subscribed and being "ending soon" aren't mutually exclusive —
// Stripe's Customer Portal cancellation keeps access through the end of
// the current period/trial, so both can be true at once; see the note on
// STATUS_CACHE_KEY above for why that's intentional, not a bug.
export function getCancelAt() {
  if (!getCustomerId()) return null;
  const cached = readCachedStatus();
  return cached ? cached.cancelAt || null : null;
}

// True once per calendar day per customer — keeps ordinary navigation
// from hitting Stripe on every page load, while still catching a
// cancellation within a day of it happening.
export function shouldRefreshStatus() {
  if (!getCustomerId()) return false;
  const cached = readCachedStatus();
  return !cached || cached.checkedAt !== todayStr();
}

// Asks Stripe directly whether this customer's subscription is currently
// trialing/active, and updates the cache. This — not the cached read
// above — is what makes access actually turn off on cancellation or a
// failed payment instead of staying unlocked forever from one past check.
export async function refreshSubscriptionStatus() {
  const customerId = getCustomerId();
  if (!customerId) return false;
  try {
    const res = await fetch("/api/subscription-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerId }),
    });
    if (!res.ok) {
      // The server couldn't get a real answer from Stripe — keep the
      // last known status rather than treating an error as a
      // cancellation. Try again on the next load/day.
      return isSubscribedCached();
    }
    const data = await res.json();
    setCachedStatus(data.status, data.cancelAt || null);
    return isActiveStatus(data.status);
  } catch (e) {
    // Network hiccup — don't punish the user for it; keep the last known
    // status and try again on the next load/day.
    return isSubscribedCached();
  }
}

export function isCategoryLocked(categoryId, subscribed) {
  if (isFreeCategory(categoryId)) return false;
  return !subscribed;
}

// Redirects to a Stripe-hosted Billing Portal session for the current
// customer — self-service cancellation and payment-method updates, no
// custom UI needed on our side. Returns false (without navigating away)
// if there's no stored customer id or the request fails, so the caller
// can show an error instead of silently doing nothing.
export async function openBillingPortal() {
  const customerId = getCustomerId();
  if (!customerId) return false;
  try {
    const res = await fetch("/api/create-portal-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerId }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    if (!data.url) return false;
    window.location.href = data.url;
    return true;
  } catch (e) {
    return false;
  }
}

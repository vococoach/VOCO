// Subscription-based unlock via Stripe: Agreement & Support is free
// forever, the other 5 categories require an active or trialing
// subscription (see PRICE_LABEL/TRIAL_LABEL below). Verified once via
// Stripe Checkout (see app/unlock/page.js + app/api/verify-subscription),
// then the Stripe **customer id** — not a boolean — is cached client-side
// so this device can ask Stripe directly whether that customer's
// subscription is still trialing/active. Re-checked at most once per
// calendar day (app/api/subscription-status), so access actually turns
// off if someone cancels or a payment fails, instead of staying unlocked
// forever from one past check. Still no accounts/database — see
// CLAUDE.md.

const CUSTOMER_KEY = "voco_customer_id_v1";
const STATUS_CACHE_KEY = "voco_subscription_status_v1"; // { status, checkedAt: "YYYY-MM-DD" }

// The one category that's free forever. Keep this in sync with what the
// Payment Link's description promises.
export const FREE_CATEGORY_ID = "agreement-support";

export const PAYMENT_LINK_URL = "https://buy.stripe.com/test_14A8wR4K60Ah6QG4TE5kk01";
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

function setCachedStatus(status) {
  safeSet(STATUS_CACHE_KEY, JSON.stringify({ status, checkedAt: todayStr() }));
}

function isActiveStatus(status) {
  return status === "trialing" || status === "active";
}

// Called once, right after a successful Checkout redirect back to
// /unlock. Seeds the status cache with what that same verification call
// already told us, so the very next page load doesn't need a second
// round-trip to show the right state.
export function setCustomerId(customerId, status) {
  safeSet(CUSTOMER_KEY, customerId);
  setCachedStatus(status);
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
    setCachedStatus(data.status);
    return isActiveStatus(data.status);
  } catch (e) {
    // Network hiccup — don't punish the user for it; keep the last known
    // status and try again on the next load/day.
    return isSubscribedCached();
  }
}

export function isCategoryLocked(categoryId, subscribed) {
  if (categoryId === FREE_CATEGORY_ID) return false;
  return !subscribed;
}

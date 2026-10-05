// Subscription-based unlock via Stripe. Verified once via Stripe Checkout (see
// app/unlock/page.js + app/api/verify-subscription), then the Stripe **customer
// id** — not a boolean — is cached client-side so this device can ask Stripe
// directly whether that customer's subscription is still trialing/active.
// Re-checked at most once per calendar day (app/api/subscription-status), so
// access actually turns off if someone cancels or a payment fails, instead of
// staying unlocked forever from one past check. Still no accounts/database —
// see CLAUDE.md.

export const CUSTOMER_KEY = "voco_customer_id_v1";
// { status, cancelAt: ISO string | null, checkedAt: "YYYY-MM-DD" }. A
// subscription can be status "trialing"/"active" *and* already scheduled
// to end — Stripe's Customer Portal cancellation doesn't revoke access
// immediately, it schedules cancelAt for the end of the current period
// (or trial). That's intentional and correct: someone who already paid
// for (or is mid-trial on) the current period keeps it. cancelAt just
// makes that visible instead of silently invisible — see getCancelAt()
// below.
const STATUS_CACHE_KEY = "voco_subscription_status_v1";

// ───────────────────────────────────────────────────────────────────────────
// THE FREE SET — the one place that says what a non-subscriber can open.
// Everything not listed here needs an active or trialing subscription.
//
//   Vocabulary  Each course's one free category (below), and only that
//               category's Foundational and Intermediate tiers (levels 1 and
//               2). Its Advanced tier and, for SAT Vocab, its Expert tier are
//               subscription-only, and so is every other category in every
//               course.
//   Passages, cross-text pairs, grammar, the practice test — nothing is free.
//   Strategy guides — free to everyone and not gated at all (the route has no
//               gate, so they are not listed here).
//
// Why a smaller free set than "one whole category per course": a learner who
// can finish a category's hardest tier for free has seen the best of what the
// subscription sells. Two tiers is still a real taste (24 words in each of the
// four courses, with quizzes and spaced repetition) but leaves a clear next
// step. Decided deliberately — see CLAUDE.md.
//
// Level ids are NOT how tiers are identified here; each level's own `level`
// number is (1 Foundational, 2 Intermediate, 3 Advanced, 4 SAT Expert).
// ───────────────────────────────────────────────────────────────────────────
export const FREE_CATEGORY_BY_COURSE = {
  "sat-vocab": "agreement-support",
  "everyday-vocabulary": "precise-description",
  "professional-vocabulary": "meetings-negotiation",
  "gre-vocab": "positive-charge",
};
export const FREE_CATEGORY_IDS = Object.values(FREE_CATEGORY_BY_COURSE);
export const FREE_TIER_NUMBERS = [1, 2];

// True if the category is one of the four that has a free taste at all.
export function isFreeCategory(categoryId) {
  return FREE_CATEGORY_IDS.includes(categoryId);
}

// True if this exact tier is free: a free category's Foundational/Intermediate.
export function isFreeLevel(categoryId, levelNumber) {
  return isFreeCategory(categoryId) && FREE_TIER_NUMBERS.includes(levelNumber);
}

// The gate for a single level (tier). `levelNumber` is the level's own `level`
// field. This is what the study and quiz routes, the home screen's suggestions
// and the review/missed-words pools all use — never category-level checks.
export function isLevelLocked(categoryId, levelNumber, subscribed) {
  if (subscribed) return false;
  return !isFreeLevel(categoryId, levelNumber);
}

// True only when the WHOLE category is behind the subscription (every category
// except each course's free one). A free category is not "locked" here even
// though two of its tiers are — ask isLevelLocked() about those.
export function isCategoryLocked(categoryId, subscribed) {
  if (subscribed) return false;
  return !isFreeCategory(categoryId);
}

// Reading passages and cross-text pairs (SAT Vocab): none are free. The maps
// stay (empty) so a free sample can be added later by editing this file only.
export const FREE_PASSAGE_BY_COURSE = {};
export const FREE_PASSAGE_IDS = Object.values(FREE_PASSAGE_BY_COURSE);

export function isPassageLocked(passageId, subscribed) {
  if (subscribed) return false;
  return !FREE_PASSAGE_IDS.includes(passageId);
}

// Grammar & Usage categories (SAT Vocab): none are free either.
export const FREE_GRAMMAR_CATEGORY_BY_COURSE = {};
export const FREE_GRAMMAR_CATEGORY_IDS = Object.values(FREE_GRAMMAR_CATEGORY_BY_COURSE);

export function isGrammarCategoryLocked(categoryId, subscribed) {
  if (subscribed) return false;
  return !FREE_GRAMMAR_CATEGORY_IDS.includes(categoryId);
}

// The LIVE Payment Link. Moves together with EXPECTED_PAYMENT_LINK_ID in
// app/api/verify-subscription/route.js and the live STRIPE_SECRET_KEY in Vercel
// (Production) — see "Going live" in CLAUDE.md.
export const PAYMENT_LINK_URL = "https://buy.stripe.com/8x2cN57lk66C7zyf1scAo00";
export const PRICE_LABEL = "$1.99/month";
export const TRIAL_LABEL = "7-day free trial";
// The one line that must sit beside every start-trial button, so nobody starts
// a trial without seeing what it turns into. Built from the two constants above.
export const TRIAL_TERMS = `7 days free, then ${PRICE_LABEL}. Cancel anytime.`;

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

const STATUS_CHECK_TIMEOUT_MS = 10000;

// A 4xx from /api/subscription-status is a definitive answer, except the two
// that mean "try again later". (A customer Stripe says doesn't exist — made up,
// deleted, or from the other Stripe mode — arrives as a 200 "inactive".)
function isDefinitiveRejection(httpStatus) {
  return httpStatus >= 400 && httpStatus < 500 && httpStatus !== 408 && httpStatus !== 429;
}

// Asks Stripe directly whether this customer's subscription is currently
// trialing/active, and updates the cache. This — not the cached read
// above — is what makes access actually turn off on cancellation or a
// failed payment instead of staying unlocked forever from one past check.
//
// Fail open only when there is no answer (network error, timeout, 5xx, 408/429);
// fail closed on any real one, including "no such customer".
export async function refreshSubscriptionStatus() {
  const customerId = getCustomerId();
  if (!customerId) return false;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), STATUS_CHECK_TIMEOUT_MS);
  try {
    const res = await fetch("/api/subscription-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerId }),
      signal: controller.signal,
    });
    if (res.ok) {
      const data = await res.json();
      setCachedStatus(data.status, data.cancelAt || null);
      return isActiveStatus(data.status);
    }
    if (isDefinitiveRejection(res.status)) {
      // The server understood the request and refused it (a 4xx other than
      // "slow down"): this id can't be checked at all, e.g. it isn't even a
      // customer id. That is an answer, not a failure — nothing to fail open
      // for, so access locks.
      setCachedStatus("inactive", null);
      return false;
    }
    // 5xx (Stripe outage, bad key, timeout upstream) or 408/429: we did not get
    // an answer. Keep the last known status; try again on the next load/day.
    return isSubscribedCached();
  } catch (e) {
    // Network error or our own timeout — don't punish the user for it; keep the
    // last known status and try again on the next load/day.
    return isSubscribedCached();
  } finally {
    clearTimeout(timer);
  }
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

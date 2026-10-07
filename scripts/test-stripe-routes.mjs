// `npm run test:stripe` — the three Stripe routes and the client's reaction to
// them, with NO real Stripe: the routes are given a stand-in client
// (setStripeForTests) and the client code is given a stubbed fetch. So every
// "Stripe said X" case below is a MOCK of Stripe's documented behaviour, built
// with the SDK's own error classes; none of it proves what live Stripe returns.
// Real-Stripe behaviour is covered by the subscribe test done after merging.

import Stripe from "stripe";

let pass = 0;
let fail = 0;
const ok = (name, cond, extra = "") => {
  cond ? pass++ : fail++;
  console.log(`${cond ? "PASS" : "FAIL"} ${name}${extra ? "  — " + extra : ""}`);
};

const store = {};
globalThis.window = {
  localStorage: {
    getItem: (k) => (k in store ? store[k] : null),
    setItem: (k, v) => (store[k] = String(v)),
    removeItem: (k) => delete store[k],
  },
};

const purchase = await import("../lib/purchase.js");
const stripeServer = await import("../lib/stripeServer.js");
const statusRoute = await import("../app/api/subscription-status/route.js");
const portalRoute = await import("../app/api/create-portal-session/route.js");
const verifyRoute = await import("../app/api/verify-subscription/route.js");

const CUS = "cus_TestCustomer123";
const E = Stripe.errors;
const missing = (what) =>
  new E.StripeInvalidRequestError({ type: "invalid_request_error", code: "resource_missing", statusCode: 404, message: `No such ${what}: 'x'` });
const sub = (status, extra = {}) => ({ status, cancel_at: null, cancel_at_period_end: false, ...extra });
const fakeStripe = (impl) => ({
  subscriptions: { list: impl.list || (async () => ({ data: [] })) },
  billingPortal: { sessions: { create: impl.portal || (async () => ({ url: "https://billing.stripe.com/p/session/x" })) } },
  checkout: { sessions: { retrieve: impl.retrieve || (async () => ({})) } },
});
const req = (body, raw) => ({
  json: async () => (raw !== undefined ? JSON.parse(raw) : body),
  nextUrl: { origin: "https://voco.test" },
});
const call = async (route, r) => {
  const res = await route.POST(r);
  return { status: res.status, body: await res.json() };
};
const SECRET_LEAK = /No such|stripe|sk_|invalid_request|resource_missing|ECONN|boom/i;
const safe = (body) => !SECRET_LEAK.test(JSON.stringify(body));

// ---------- 1. no key: import and build never touch Stripe; handlers say 503 ----------
delete process.env.STRIPE_SECRET_KEY;
stripeServer.setStripeForTests(null);
ok("routes import without STRIPE_SECRET_KEY (no module-level client)", true);
{
  const r = await call(statusRoute, req({ customerId: CUS }));
  ok("no key → status route answers 503, not a crash", r.status === 503, JSON.stringify(r.body));
  ok("503 body is generic", safe(r.body));
}

// ---------- 2. subscription-status: the cases ----------
const statusFor = async (impl) => {
  stripeServer.setStripeForTests(fakeStripe(impl));
  return call(statusRoute, req({ customerId: CUS }));
};
{
  let r = await statusFor({ list: async () => { throw missing("customer"); } });
  ok("made-up / deleted / wrong-mode customer (Stripe: resource_missing) → 200 inactive (definitive no)", r.status === 200 && r.body.status === "inactive" && r.body.verdict === "no_such_customer", JSON.stringify(r));
  r = await statusFor({ list: async () => ({ data: [sub("canceled")] }) });
  ok("only canceled subscriptions → 200 inactive + verdict no_active_subscription", r.status === 200 && r.body.status === "inactive" && r.body.verdict === "no_active_subscription");
  r = await statusFor({ list: async () => ({ data: [sub("past_due"), sub("incomplete_expired")] }) });
  ok("past_due / incomplete_expired only → inactive", r.body.status === "inactive");
  r = await statusFor({ list: async () => ({ data: [] }) });
  ok("customer with no subscriptions → inactive", r.status === 200 && r.body.status === "inactive");
  r = await statusFor({ list: async () => ({ data: [sub("active")] }) });
  ok("active → 200 active + verdict subscribed", r.status === 200 && r.body.status === "active" && r.body.verdict === "subscribed" && r.body.cancelAt === null);
  r = await statusFor({ list: async () => ({ data: [sub("trialing")] }) });
  ok("trialing → 200 trialing", r.status === 200 && r.body.status === "trialing");
  r = await statusFor({ list: async () => ({ data: [sub("canceled"), sub("trialing", { cancel_at: 1900000000, cancel_at_period_end: true })] }) });
  ok("trialing but ending → still subscribed, cancelAt surfaced", r.body.status === "trialing" && r.body.cancelAtPeriodEnd === true && r.body.cancelAt === new Date(1900000000 * 1000).toISOString());

  const transient = {
    "outage (StripeAPIError 500)": new E.StripeAPIError({ type: "api_error", statusCode: 500, message: "boom" }),
    "network (StripeConnectionError)": new E.StripeConnectionError({ type: "api_connection_error", message: "ECONNRESET" }),
    "rate limit (429)": new E.StripeRateLimitError({ type: "invalid_request_error", code: "rate_limit", statusCode: 429, message: "slow" }),
    "bad/revoked API key (401)": new E.StripeAuthenticationError({ type: "authentication_error", statusCode: 401, message: "Invalid API Key provided: sk_live_abc" }),
    "unknown error": new Error("something else"),
    "invalid request that is NOT resource_missing": new E.StripeInvalidRequestError({ type: "invalid_request_error", code: "parameter_invalid_empty", statusCode: 400, message: "bad" }),
  };
  for (const [name, err] of Object.entries(transient)) {
    r = await statusFor({ list: async () => { throw err; } });
    ok(`${name} → 502 (client keeps access)`, r.status === 502, String(r.status));
    ok(`${name} → body leaks nothing from Stripe`, safe(r.body), JSON.stringify(r.body));
  }
}

// ---------- 3. malformed bodies: 400 with a safe message, never 500 ----------
stripeServer.setStripeForTests(fakeStripe({}));
{
  const hard = [
    ["malformed JSON", req(null, "{not json")],
    ["empty body", req(null, "")],
    ["JSON null", req(null, "null")],
    ["JSON array", req(null, "[1]")],
    ["JSON string", req(null, '"cus_x"')],
    ["missing customerId", req({})],
    ["numeric customerId", req({ customerId: 5 })],
    ["object customerId", req({ customerId: { $ne: 1 } })],
  ];
  const badId = [
    ["wrong prefix", req({ customerId: "sub_abcdef123456" })],
    ["customerId with junk", req({ customerId: "cus_abc def/../x" })],
    ["huge customerId", req({ customerId: "cus_" + "a".repeat(5000) })],
    ["too-short id", req({ customerId: "x" })],
  ];
  for (const [label, route] of [["subscription-status", statusRoute], ["create-portal-session", portalRoute]]) {
    for (const [name, r] of hard) {
      const out = await call(route, r);
      ok(`${label}: ${name} → 400`, out.status === 400 && out.body.error === "Invalid request", `${out.status} ${JSON.stringify(out.body)}`);
    }
  }
  for (const [name, r] of badId) {
    const out = await call(portalRoute, r);
    ok(`create-portal-session: ${name} → 400`, out.status === 400 && out.body.error === "Invalid request", `${out.status}`);
    // A string that cannot be a Stripe customer id is answered with the explicit
    // "no", so a forged id like "x" cannot stay unlocked; Stripe is never asked.
    let asked = false;
    stripeServer.setStripeForTests(fakeStripe({ list: async () => { asked = true; return { data: [] }; } }));
    const st = await call(statusRoute, r);
    ok(`subscription-status: ${name} → 200 explicit no_such_customer, Stripe not called`, st.status === 200 && st.body.verdict === "no_such_customer" && !asked, JSON.stringify(st));
    stripeServer.setStripeForTests(fakeStripe({}));
  }
}
for (const [name, r] of [
  ["malformed JSON", req(null, "{nope")],
  ["missing sessionId", req({})],
  ["not a session id", req({ sessionId: "cus_abcdef123456" })],
  ["object sessionId", req({ sessionId: {} })],
]) {
  const out = await call(verifyRoute, r);
  ok(`verify-subscription: ${name} → 400`, out.status === 400 && out.body.error === "Invalid request", `${out.status}`);
}

// ---------- 4. portal + verify routes: errors don't echo Stripe ----------
{
  stripeServer.setStripeForTests(fakeStripe({ portal: async () => { throw missing("customer"); } }));
  let r = await call(portalRoute, req({ customerId: CUS }));
  ok("portal: no such customer → 400, generic", r.status === 400 && safe(r.body), JSON.stringify(r));
  stripeServer.setStripeForTests(fakeStripe({ portal: async () => { throw new E.StripeAPIError({ type: "api_error", statusCode: 500, message: "internal sk_live_x" }); } }));
  r = await call(portalRoute, req({ customerId: CUS }));
  ok("portal: Stripe outage → 502, generic", r.status === 502 && !/sk_live/.test(JSON.stringify(r.body)));
  stripeServer.setStripeForTests(fakeStripe({}));
  r = await call(portalRoute, req({ customerId: CUS }));
  ok("portal: happy path returns the url", r.status === 200 && r.body.url.startsWith("https://billing.stripe.com/"));

  const sid = "cs_live_a1B2c3D4e5F6";
  const link = "plink_1UIAT8HSW53IY9shBH3iARzX";
  stripeServer.setStripeForTests(fakeStripe({ retrieve: async () => ({ payment_link: link, customer: CUS, subscription: { status: "trialing" } }) }));
  r = await call(verifyRoute, req({ sessionId: sid }));
  ok("verify: right payment link + trialing → unlocked with customer id", r.body.unlocked === true && r.body.customerId === CUS && r.body.status === "trialing");
  stripeServer.setStripeForTests(fakeStripe({ retrieve: async () => ({ payment_link: "plink_other", customer: CUS, subscription: { status: "active" } }) }));
  r = await call(verifyRoute, req({ sessionId: sid }));
  ok("verify: session from another payment link → not unlocked", r.body.unlocked === false);
  stripeServer.setStripeForTests(fakeStripe({ retrieve: async () => ({ payment_link: link, customer: CUS, subscription: { status: "canceled" } }) }));
  r = await call(verifyRoute, req({ sessionId: sid }));
  ok("verify: canceled → not unlocked", r.body.unlocked === false);
  stripeServer.setStripeForTests(fakeStripe({ retrieve: async () => { throw missing("checkout.session"); } }));
  r = await call(verifyRoute, req({ sessionId: sid }));
  ok("verify: unknown session → 400 generic", r.status === 400 && r.body.error === "Could not verify subscription");
  stripeServer.setStripeForTests(fakeStripe({ retrieve: async () => { throw new E.StripeConnectionError({ type: "api_connection_error", message: "x" }); } }));
  r = await call(verifyRoute, req({ sessionId: sid }));
  ok("verify: Stripe outage → 502 generic", r.status === 502);
}

// ---------- 5. the client: what refreshSubscriptionStatus() does with each answer ----------
const seed = (status = "active") => {
  for (const k of Object.keys(store)) delete store[k];
  store.voco_customer_id_v1 = CUS;
  store.voco_subscription_status_v1 = JSON.stringify({ status, checkedAt: "2000-01-01", cancelAt: null });
};
const withFetch = async (impl, fn) => {
  const real = globalThis.fetch;
  globalThis.fetch = impl;
  try { return await fn(); } finally { globalThis.fetch = real; }
};
const resp = (status, body) => ({ ok: status >= 200 && status < 300, status, json: async () => body });
const cachedStatus = () => JSON.parse(store.voco_subscription_status_v1).status;
const refresh = (impl) => withFetch(impl, () => purchase.refreshSubscriptionStatus());

const NO = { status: "inactive", cancelAt: null, verdict: "no_active_subscription" };
const NOCUST = { status: "inactive", cancelAt: null, verdict: "no_such_customer" };
seed();
ok("client: 200 verdict no_active_subscription → revokes", (await refresh(async () => resp(200, NO))) === false && !purchase.isSubscribedCached());
seed();
ok("client: 200 verdict no_such_customer → revokes", (await refresh(async () => resp(200, NOCUST))) === false && !purchase.isSubscribedCached());
seed("inactive");
ok("client: 200 subscribed/active → grants", (await refresh(async () => resp(200, { status: "active", verdict: "subscribed", cancelAt: null }))) === true && purchase.isSubscribedCached());
seed("inactive");
ok("client: 200 subscribed/trialing → grants", (await refresh(async () => resp(200, { status: "trialing", verdict: "subscribed", cancelAt: null }))) === true);
// No marker, no revocation: every one of these keeps what the device had.
for (const [name, impl] of [
  ["200 inactive WITHOUT a verdict", async () => resp(200, { status: "inactive", cancelAt: null })],
  ["200 with an empty object", async () => resp(200, {})],
  ["200 with an unknown verdict", async () => resp(200, { status: "inactive", verdict: "whatever" })],
  ["200 with a null body", async () => resp(200, null)],
  ["400", async () => resp(400, { error: "Invalid request" })],
  ["401", async () => resp(401, {})],
  ["403", async () => resp(403, {})],
  ["404 (route missing)", async () => resp(404, {})],
  ["405", async () => resp(405, {})],
  ["422", async () => resp(422, {})],
  ["408", async () => resp(408, {})],
  ["429", async () => resp(429, {})],
  ["500", async () => resp(500, {})],
  ["502", async () => resp(502, { error: "x" })],
  ["503", async () => resp(503, { error: "x" })],
  ["504", async () => resp(504, {})],
  ["network error", async () => { throw new TypeError("Failed to fetch"); }],
  ["unreadable 200 body", async () => ({ status: 200, ok: true, json: async () => { throw new SyntaxError("bad"); } })],
]) {
  seed();
  const r = await refresh(impl);
  ok(`client: ${name} → keeps access, cache untouched`, r === true && cachedStatus() === "active");
  seed("inactive");
  const r2 = await refresh(impl);
  ok(`client: ${name} → also never GRANTS access`, r2 === false && cachedStatus() === "inactive");
}
seed();
{
  const t0 = Date.now();
  const r = await withFetch(
    (url, init) => new Promise((_, reject) => init.signal.addEventListener("abort", () => reject(new DOMException("aborted", "AbortError")))),
    async () => {
      const realST = globalThis.setTimeout;
      globalThis.setTimeout = (fn, ms, ...a) => realST(fn, Math.min(ms, 50), ...a);
      try { return await purchase.refreshSubscriptionStatus(); } finally { globalThis.setTimeout = realST; }
    }
  );
  ok("client: request that never answers is aborted by the timeout and keeps access", r === true && cachedStatus() === "active" && Date.now() - t0 < 2000);
}
for (const k of Object.keys(store)) delete store[k];
ok("client: no customer id → false, no request", (await refresh(async () => { throw new Error("should not be called"); })) === false);

// ---------- 5b. every Stripe error type: what our route returns and what the client does ----------
// (the table in the PR description is generated from these rows)
const rows = [
  ["Authentication (invalid / revoked key)", new E.StripeAuthenticationError({ type: "authentication_error", statusCode: 401, message: "Invalid API Key provided: sk_live_abc" }), 502, "keeps access"],
  ["Permission (restricted key missing a permission)", new E.StripePermissionError({ type: "invalid_request_error", code: "secret_key_required", statusCode: 403, message: "The provided key does not have the required permissions" }), 502, "keeps access"],
  ["Invalid request, NOT resource_missing (e.g. a restricted-key message)", new E.StripeInvalidRequestError({ type: "invalid_request_error", statusCode: 400, message: "This API call cannot be made with a restricted key" }), 502, "keeps access"],
  ["Rate limit (429)", new E.StripeRateLimitError({ type: "invalid_request_error", code: "rate_limit", statusCode: 429, message: "slow down" }), 502, "keeps access"],
  ["Connection (network)", new E.StripeConnectionError({ type: "api_connection_error", message: "ECONNRESET" }), 502, "keeps access"],
  ["API error (Stripe 5xx)", new E.StripeAPIError({ type: "api_error", statusCode: 500, message: "boom" }), 502, "keeps access"],
  ["Anything else (plain Error)", new Error("surprise"), 502, "keeps access"],
  ["Invalid request, resource_missing (no such customer / wrong mode / deleted)", missing("customer"), 200, "revokes"],
];
for (const [name, err, expectHttp, expectClient] of rows) {
  seed();
  stripeServer.setStripeForTests(fakeStripe({ list: async () => { throw err; } }));
  let http = null;
  const kept = await refresh(async (url, init) => {
    const out = await call(statusRoute, { json: async () => JSON.parse(init.body), nextUrl: { origin: "x" } });
    http = out.status;
    return resp(out.status, out.body);
  });
  const clientResult = kept ? "keeps access" : "revokes";
  ok(`error table: ${name} → route ${http}, client ${clientResult}`, http === expectHttp && clientResult === expectClient);
}

// ---------- 6. end to end through both halves: a made-up customer id cannot stay unlocked ----------
{
  seed();
  store.voco_customer_id_v1 = "cus_MadeUpByAnAttacker1";
  stripeServer.setStripeForTests(fakeStripe({ list: async () => { throw missing("customer"); } }));
  const subscribed = await refresh(async (url, init) => {
    const out = await call(statusRoute, { json: async () => JSON.parse(init.body), nextUrl: { origin: "x" } });
    return resp(out.status, out.body);
  });
  ok("end to end: forged customer id + forged 'active' cache → locked after the daily check", subscribed === false && !purchase.isSubscribedCached());
  seed();
  stripeServer.setStripeForTests(fakeStripe({ list: async () => { throw new E.StripeAPIError({ type: "api_error", statusCode: 500, message: "down" }); } }));
  const kept = await refresh(async (url, init) => {
    const out = await call(statusRoute, { json: async () => JSON.parse(init.body), nextUrl: { origin: "x" } });
    return resp(out.status, out.body);
  });
  ok("end to end: real subscriber during a Stripe outage → keeps access", kept === true && purchase.isSubscribedCached());
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

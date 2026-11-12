// Checks for the free trial and billing details on /unlock. Run with `npm run test:unlock`
// (run `npm run build` first to also check the HTML that really loads). Plain Node, no browser.
//
// What the owner asked for: before any payment button, the page says the 7-day free trial, the
// $1.99 a month price, that it renews automatically after the trial, exactly how to cancel (the
// steps and where), and links to the Terms and the Privacy Policy; in plain short sentences, with
// no em dashes; and all of it in the HTML that loads, not only after JavaScript runs.
//
// The page's first state ("checking") is the one its HTML is built in, so these checks read the
// built file .next/server/app/unlock.html: if the words are not in that file, a reader that does
// not run JavaScript cannot see them. See "The /unlock disclosure" in CLAUDE.md.

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
let pass = 0;
let fail = 0;
const ok = (name, cond, extra = "") => {
  cond ? pass++ : fail++;
  console.log(`${cond ? "PASS" : "FAIL"} ${name}${extra ? "  — " + extra : ""}`);
};

const read = (f) => readFileSync(path.join(root, f), "utf8");
// Source without its comments, so a check on what a learner sees is not fooled by (or failed by)
// a note to the next developer.
const code = (f) => read(f).replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:"'`\\])\/\/.*$/gm, "$1");
const count = (src, re) => (src.match(re) || []).length;
const squash = (s) => s.replace(/\s+/g, " ").trim();

const { DISCLOSURE: d } = await import("../lib/trialDisclosure.js");
const { PRICE_LABEL, TRIAL_LABEL } = await import("../lib/purchase.js");
const { CONTACT_EMAIL, CONTACT_MAILTO } = await import("../lib/contact.js");
const { TRADEMARK_NOTICE } = await import("../lib/legal.js");

// Every sentence the block says, in the order it says them, with the address and the labels filled in.
const emailSentence = `${d.emailLead} ${CONTACT_EMAIL} ${d.emailTail}`;
const linksSentence = `${d.linksLead} ${d.termsLabel} ${d.linksJoin} ${d.privacyLabel}.`;
const paragraphs = [...d.terms, d.cancelIntro, ...d.cancelSteps, d.afterCancel, emailSentence, linksSentence];
const all = [d.title, d.cancelTitle, ...paragraphs].join(" ");

// ---------- the words ----------
{
  ok("it states the free trial, by the one label in lib/purchase.js", all.includes(TRIAL_LABEL), TRIAL_LABEL);
  ok("it states the price, by the one label in lib/purchase.js, and types no other price", all.includes(PRICE_LABEL) && (all.match(/\$\d+(\.\d+)?/g) || []).every((p) => PRICE_LABEL.includes(p)), PRICE_LABEL);
  ok("it says the trial renews automatically, every month, until the customer cancels", /renews automatically every month until you cancel/.test(all));
  ok("it says who is charged and how: the payment method given at checkout", /We charge the payment method you gave at checkout\./.test(all));
  ok("it says that cancelling before the trial ends costs nothing", /Cancel before the trial ends and you pay nothing\./.test(all));
  ok("it gives the cancel steps in order: where (the device, the home screen's Manage subscription), what opens (Stripe's secure page), what to do", d.cancelSteps.length === 3 && /device you subscribed on/.test(d.cancelSteps[0]) && /bottom of the home screen, tap Manage subscription/.test(d.cancelSteps[1]) && /Stripe's secure page opens/.test(d.cancelSteps[2]) && /cancel your subscription and confirm/.test(d.cancelSteps[2]));
  ok("it says what cancelling does to access", /keep access until the end of the period you already started\. Then the paid content locks again\./.test(d.afterCancel));
  ok("it offers the email way the Terms offer, for a different device or browser", /different device or browser/.test(d.emailLead) && /Manage subscription/.test(d.emailLead) && /we'll cancel it for you/.test(d.emailTail));
  ok("it links the Terms of Service and the Privacy Policy by their names", d.termsLabel === "Terms of Service" && d.privacyLabel === "Privacy Policy");
  const sentences = paragraphs.flatMap((p) => p.split(/(?<=[.?!])\s+/));
  const longest = sentences.reduce((a, s) => (s.split(/\s+/).length > a.split(/\s+/).length ? s : a), "");
  ok("plain short sentences: none is longer than 20 words", sentences.every((s) => s.split(/\s+/).length <= 20), `${sentences.length} sentences, longest ${longest.split(/\s+/).length} words`);
  ok("no em dash anywhere in the block", !/—/.test(all));
  ok("it does not name the mark, so it cannot use SAT as a noun (the page's own notice stays below it)", !/\bSAT\b/.test(all));
}

// ---------- it tells the same story as the Terms ----------
{
  const terms = code("app/terms/page.js").replace(/\s+/g, " ");
  ok("the Terms say the same things: Manage subscription, Stripe's secure page, automatic renewal, before the trial ends, the end of the period, and email to cancel it for you", ["Manage subscription", "Stripe's secure", "automatically becomes a paid subscription", "renews", "cancel before it ends", "end of the period", "cancel it for you"].every((s) => terms.includes(s)));
  ok("both pages build the address from the same constant (lib/contact.js)", /\{CONTACT_EMAIL\}/.test(terms) && /import \{ CONTACT_EMAIL, CONTACT_MAILTO \} from "@\/lib\/contact"/.test(code("components/TrialDisclosure.js")));
}

// ---------- the component ----------
{
  const src = code("components/TrialDisclosure.js");
  ok("it is plain markup with no client directive, state or effects, so it renders in the HTML that loads", !/use client|useState|useEffect|\buse[A-Z]\w*\(/.test(src));
  ok("it shows the words from lib/trialDisclosure.js and types none of them itself", /import \{ DISCLOSURE as d \} from "@\/lib\/trialDisclosure"/.test(src) && !/Manage subscription|renews|free trial|Stripe/i.test(src));
  ok("it links /terms and /privacy with Link", /<Link href="\/terms"/.test(src) && /<Link href="\/privacy"/.test(src));
  ok("the address comes from the shared contact constant, never typed", /<a href=\{CONTACT_MAILTO\}/.test(src) && /\{CONTACT_EMAIL\}/.test(src) && !/@[a-z0-9-]+\.[a-z]{2,}/i.test(src));
  ok("it has a data-trial-disclosure hook and a labelled heading", /data-trial-disclosure/.test(src) && /aria-labelledby="trial-disclosure-title"/.test(src) && /<h2 id="trial-disclosure-title"/.test(src));
  ok("it holds no payment button and sends no event", !/TrialLink|PAYMENT_LINK_URL|trackEvent|lib\/analytics/.test(src));
}

// ---------- the page: the disclosure comes first, in every state ----------
{
  const raw = read("app/unlock/page.js");
  const src = code("app/unlock/page.js");
  const at = (s, from = 0) => src.indexOf(s, from);
  const start = {
    checking: at('(status === "checking" || status === "verifying")'),
    success: at('status === "success" &&'),
    error: at('status === "error" &&'),
    already: at('status === "already" &&'),
    pitch: at('status === "pitch" &&'),
  };
  const order = Object.values(start);
  const ordered = order.every((n, i) => n > -1 && (i === 0 || n > order[i - 1]));
  const block = (name) => {
    const names = Object.keys(start);
    const next = start[names[names.indexOf(name) + 1]];
    return src.slice(start[name], next > -1 ? next : src.length);
  };
  ok("the page still has its five states in the same order", ordered && /useState\("checking"\)/.test(src));
  ok("the first state, the one the HTML is built in, shows the disclosure", /<TrialDisclosure \/>/.test(block("checking")));
  ok("every other state shows it too", ["success", "error", "already", "pitch"].every((n) => /<TrialDisclosure \/>/.test(block(n))));
  ok("there are exactly two start-trial buttons (the failure state and the pitch)", count(src, /<TrialLink\b/g) === 2 && /<TrialLink/.test(block("error")) && /<TrialLink/.test(block("pitch")));
  ok("in both, the disclosure comes before the button", ["error", "pitch"].every((n) => block(n).indexOf("<TrialDisclosure") > -1 && block(n).indexOf("<TrialDisclosure") < block(n).indexOf("<TrialLink")));
  ok("the trial terms line still sits beside each button, and is legible (not the faint #6E699B)", count(src, /\{TRIAL_TERMS\}/g) === 2 && !/#6E699B"\s*mb-3|text-\[#6E699B\]/.test(src));
  ok("no em dash in anything the page shows", !/—/.test(src));
  ok("the page keeps its College Board notice and its Voco header mark", /\{TRADEMARK_NOTICE\}/.test(src) && /<VocoMark/.test(src));
  ok("the page does not touch the free set, the access rules or the question flow", !/FREE_TIER_NUMBERS|FREE_CATEGORY_BY_COURSE|accessibleWordIds|router\.(push|replace)/.test(src));
  ok("it adds no tracking: the page still sends events only through TrialLink", !/trackEvent|\btrack\(/.test(raw));
}

// ---------- the HTML that really loads ----------
{
  const file = path.join(root, ".next/server/app/unlock.html");
  if (!existsSync(file)) {
    console.log("SKIP rendered /unlock checks — run `npm run build` first to produce .next/server/app/unlock.html");
  } else {
    const html = readFileSync(file, "utf8");
    const decode = (s) => s.replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
    // Visible text: scripts, styles and comments gone; inline tags vanish (so "Policy</a>." stays "Policy."), block tags become spaces.
    const text = squash(
      decode(
        html
          .replace(/<script\b[\s\S]*?<\/script>/g, " ")
          .replace(/<style\b[\s\S]*?<\/style>/g, " ")
          .replace(/<!--[\s\S]*?-->/g, "")
          .replace(/<\/?(a|span|strong|b|em|i|code)\b[^>]*>/g, "")
          .replace(/<[^>]+>/g, " ")
      )
    );
    const section = html.slice(html.indexOf("data-trial-disclosure"), html.indexOf("</section>", html.indexOf("data-trial-disclosure")));
    const sectionText = squash(decode(section.replace(/<!--[\s\S]*?-->/g, "").replace(/<\/?(a|span|strong|b|em|i|code)\b[^>]*>/g, "").replace(/<[^>]+>/g, " ")));

    ok("the HTML that loads has the disclosure (the data-trial-disclosure section)", html.includes("data-trial-disclosure") && section.length > 200);
    ok("the HTML says the free trial and the price", text.includes(TRIAL_LABEL) && text.includes(PRICE_LABEL));
    ok("the HTML says it renews automatically and how to cancel", text.includes("renews automatically every month until you cancel") && d.cancelSteps.every((s) => text.includes(s)) && text.includes(squash(d.afterCancel)));
    ok("the HTML has every sentence of the block, word for word", paragraphs.every((p) => sectionText.includes(squash(p))) && sectionText.includes(d.title) && sectionText.includes(d.cancelTitle));
    ok("the HTML links the Terms and the Privacy Policy, and the address as a mailto link from the constant", /<a [^>]*href="\/terms"/.test(section) && /<a [^>]*href="\/privacy"/.test(section) && section.includes(`href="${CONTACT_MAILTO}"`));
    ok("the HTML has no em dash in the disclosure", sectionText.length > 200 && !/—/.test(sectionText));
    ok("the College Board notice is in the same HTML, after the disclosure", html.includes("data-trial-disclosure") && text.indexOf(squash(TRADEMARK_NOTICE)) > text.indexOf(d.title));
    const pay = html.indexOf("buy.stripe.com");
    ok("a start-trial link is never in the HTML ahead of the disclosure", pay === -1 || pay > html.indexOf("data-trial-disclosure"), pay === -1 ? "none in the HTML: the button appears after the page's short check" : "after it");
    ok("the /terms and /privacy pages it links to are built", existsSync(path.join(root, ".next/server/app/terms.html")) && existsSync(path.join(root, ".next/server/app/privacy.html")));
  }
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

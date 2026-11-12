// The free trial and billing details shown on /unlock before any payment button
// (components/TrialDisclosure.js renders them). Kept as plain data so a test can read every
// sentence, and built from the one price and trial in lib/purchase.js so the page cannot drift
// from what Stripe charges. It says only what really exists:
//   - the trial, the price and the automatic renewal (Terms section 4);
//   - how to cancel: the "Manage subscription" button on the home screen, which opens Stripe's
//     billing portal (components: app/page.js, route: app/api/create-portal-session), and the
//     email fallback the Terms offer (Terms section 5). It does not name a button inside
//     Stripe's own page, because that label is Stripe's to change and is not in this repo.
// Short plain sentences, no em dashes. When the Terms change, change this to match: a test
// checks that the two tell the same story.
import { PRICE_LABEL, TRIAL_LABEL } from "./purchase";

export const DISCLOSURE = {
  title: "Free trial and billing",
  terms: [
    `New subscribers get a ${TRIAL_LABEL}. You pay nothing until it ends.`,
    `After the trial, the price is ${PRICE_LABEL}.`,
    "It renews automatically every month until you cancel.",
    "We charge the payment method you gave at checkout.",
    "Cancel before the trial ends and you pay nothing.",
  ],
  cancelTitle: "How to cancel",
  cancelIntro: "You can cancel anytime. Here is how.",
  cancelSteps: [
    "Open Voco on the device you subscribed on.",
    "At the bottom of the home screen, tap Manage subscription.",
    "Stripe's secure page opens. Choose to cancel your subscription and confirm.",
  ],
  afterCancel:
    "After you cancel, you keep access until the end of the period you already started. Then the paid content locks again.",
  // The address goes between the two halves, as a link built from lib/contact.js.
  emailLead: "Can't use Manage subscription, for example on a different device or browser? Email",
  emailTail: "and we'll cancel it for you.",
  linksLead: "Read the",
  termsLabel: "Terms of Service",
  linksJoin: "and the",
  privacyLabel: "Privacy Policy",
};

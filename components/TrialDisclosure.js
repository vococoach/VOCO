import Link from "next/link";
import { CONTACT_EMAIL, CONTACT_MAILTO } from "@/lib/contact";
import { DISCLOSURE as d } from "@/lib/trialDisclosure";

// The free trial and billing details, shown on /unlock before any payment button. The words are in
// lib/trialDisclosure.js (built from the one price and trial in lib/purchase.js). This is plain
// markup with no state, on purpose: /unlock renders it in its very first state, so it is in the
// HTML that loads, before any JavaScript runs, and a visitor or an automated check can read it
// without waiting for the page to decide what to show. It also appears in every later state of the
// page, always above the start-trial button when there is one. See "The /unlock disclosure" in
// CLAUDE.md.
export default function TrialDisclosure() {
  const link = "text-[#8B85FF] underline underline-offset-2";
  return (
    <section
      id="trial-disclosure"
      data-trial-disclosure
      aria-labelledby="trial-disclosure-title"
      className="rounded-2xl border border-[#8B85FF55] bg-[#20223F] p-4 text-left text-sm text-[#CFCBEE]"
    >
      <h2 id="trial-disclosure-title" className="text-base font-semibold text-[#EDEBFF]">
        {d.title}
      </h2>
      <ul className="mt-2 list-disc space-y-1 pl-5 marker:text-[#8B85FF]">
        {d.terms.map((sentence) => (
          <li key={sentence}>{sentence}</li>
        ))}
      </ul>

      <h3 className="mt-4 font-semibold text-[#EDEBFF]">{d.cancelTitle}</h3>
      <p className="mt-1">{d.cancelIntro}</p>
      <ol className="mt-2 list-decimal space-y-1 pl-5 marker:text-[#8B85FF]">
        {d.cancelSteps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
      <p className="mt-2">{d.afterCancel}</p>
      <p className="mt-2">
        {d.emailLead}{" "}
        <a href={CONTACT_MAILTO} className={`${link} whitespace-nowrap`}>
          {CONTACT_EMAIL}
        </a>{" "}
        {d.emailTail}
      </p>

      <p className="mt-4">
        {d.linksLead}{" "}
        <Link href="/terms" className={link}>
          {d.termsLabel}
        </Link>{" "}
        {d.linksJoin}{" "}
        <Link href="/privacy" className={link}>
          {d.privacyLabel}
        </Link>
        .
      </p>
    </section>
  );
}

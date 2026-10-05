import Link from "next/link";
import { Moon, ArrowLeft } from "lucide-react";
import { courses } from "@/lib/wordbanks";
import { PRICE_LABEL, TRIAL_LABEL, isFreeCategory, isFreeLevel, isLevelLocked, isGrammarCategoryLocked } from "@/lib/purchase";

export const metadata = {
  title: "Terms of Service — Voco",
};

// "A", "A and B", "A, B, and C".
function joinList(items) {
  if (items.length <= 2) return items.join(" and ");
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

// What is free and what needs a subscription is written out below, so it has to
// match the app exactly. These lists are therefore computed from the same data
// and the same one free-set definition (lib/purchase.js) the app enforces — not
// typed by hand — and scripts/test-access.mjs checks that this page renders
// them. Course and category names are the app's own.
const freeCategories = courses.flatMap((course) =>
  course.categories.filter((c) => isFreeCategory(c.id)).map((category) => ({ course, category }))
);
const freeCategoryText = joinList(freeCategories.map(({ course, category }) => `${category.title} in ${course.title}`));
const freeTierLabels = joinList([
  ...new Set(freeCategories.flatMap(({ category }) => category.levels.filter((l) => isFreeLevel(category.id, l.level)).map((l) => l.label))),
]);
const lockedTierLabels = joinList([
  ...new Set(freeCategories.flatMap(({ category }) => category.levels.filter((l) => isLevelLocked(category.id, l.level, false)).map((l) => l.label))),
]);
// Semicolons, because one of the titles ("Form, Structure, and Sense") has commas of its own.
const lockedGrammarTitles = courses
  .flatMap((course) => (course.grammar || []).filter((g) => isGrammarCategoryLocked(g.id, false)).map((g) => g.title))
  .map((title, i, all) => (i === all.length - 1 && all.length > 1 ? `and ${title}` : title))
  .join("; ");

export default function TermsPage() {
  return (
    <main className="min-h-dvh bg-[#1A1C3A] px-4 py-8">
      <div className="max-w-md mx-auto">
        <Link href="/" className="flex items-center gap-1 text-xs text-[#9B97C4] mb-6">
          <ArrowLeft size={14} /> Back
        </Link>

        <div className="flex items-center gap-2 mb-2">
          <Moon size={20} color="#8B85FF" />
          <span className="font-display text-lg text-[#EDEBFF]">Voco</span>
        </div>
        <h1 className="font-display text-2xl text-[#EDEBFF] mb-1">Terms of Service</h1>
        <p className="text-xs text-[#6E699B] mb-8">Last updated October 5, 2026</p>

        <div className="space-y-6 text-sm text-[#9B97C4] leading-relaxed">
          <section>
            <h2 className="text-[#EDEBFF] font-medium mb-2">1. Agreement to Terms</h2>
            <p>
              By using Voco ("the app," "we," "us"), you agree to these Terms of Service. If you
              don't agree, please don't use the app.
            </p>
          </section>

          <section>
            <h2 className="text-[#EDEBFF] font-medium mb-2">2. What Voco Is</h2>
            <p>
              Voco is a vocabulary study tool with several courses, built around spaced
              repetition and words-in-context quizzes. It's meant for personal study use — we
              don't guarantee any particular test score or outcome.
            </p>
          </section>

          <section>
            <h2 className="text-[#EDEBFF] font-medium mb-2">3. No Accounts</h2>
            <p>
              Voco doesn't have user accounts, logins, or passwords. There's nothing to sign up
              for beyond an optional subscription (see below).
            </p>
          </section>

          <section>
            <h2 className="text-[#EDEBFF] font-medium mb-2">4. Subscription & Billing</h2>
            <p className="mb-2">
              <span className="text-[#EDEBFF]">What's free.</span> Each course has one free
              category: {freeCategoryText}. In those categories, only the {freeTierLabels} levels
              are free. All of the SAT Vocab strategy guides are also free.
            </p>
            <p className="mb-2">
              <span className="text-[#EDEBFF]">What needs a subscription.</span> Everything else,
              in every course: the {lockedTierLabels} levels of those free categories (where a
              category has them), every other category, all SAT Vocab reading passages and
              cross-text pairs, the SAT Vocab Grammar &amp; Usage categories ({lockedGrammarTitles}),
              and the SAT Vocab practice test. One subscription unlocks all of it.
            </p>
            <p className="mb-2">
              <span className="text-[#EDEBFF]">Price and trial.</span> A subscription costs {PRICE_LABEL}
              . New subscribers get a {TRIAL_LABEL}: you pay nothing during the trial, and if you
              cancel before it ends you won't be charged. If you don't cancel, the trial
              automatically becomes a paid subscription when the 7 days end, and it then renews
              every month, charging {PRICE_LABEL} to the payment method you gave at checkout, until
              you cancel.
            </p>
            <p className="mb-2">
              Subscriptions are billed and processed entirely by Stripe, our payment processor. We
              never see or store your card details.
            </p>
            <p className="mb-2">
              <span className="text-[#EDEBFF]">Age.</span> You must be 18 or older, or have the
              permission of a parent or guardian, to start a subscription. If you're under 18,
              please ask a parent or guardian to subscribe for you.
            </p>
            <p>
              Prices may change; we'll do our best to give notice before any change takes effect
              for existing subscribers.
            </p>
          </section>

          <section>
            <h2 className="text-[#EDEBFF] font-medium mb-2">5. Canceling Your Subscription</h2>
            <p className="mb-2">
              You can cancel anytime. On the device you subscribed on, tap "Manage subscription"
              on the Voco home screen. It opens Stripe's secure subscription page, where you can
              cancel and update your payment method. If you can't use that (for example, you're on
              a different device or browser), email us at{" "}
              <a href="mailto:itsowentodd@icloud.com" className="text-[#8B85FF]">
                itsowentodd@icloud.com
              </a>{" "}
              and we'll cancel it for you. Any email from Stripe about your subscription may also
              include a link to manage it.
            </p>
            <p>
              Canceling stops future billing. You keep access until the end of the period you've
              already started (the end of your trial, or of the month you've paid for), and then
              the paid content locks again.
            </p>
          </section>

          <section>
            <h2 className="text-[#EDEBFF] font-medium mb-2">6. Your Progress Data</h2>
            <p>
              All study progress — streaks, quiz scores, spaced-repetition scheduling — is stored
              locally in your browser (<code>localStorage</code>), on your device. We do not store
              it on our servers, and it does not sync between devices or browsers. Clearing your
              browser data, switching devices, or using a different browser will reset your
              progress. If you resubscribe on a new device, you'll need to go through checkout
              again — we don't maintain a database of who has paid.
            </p>
          </section>

          <section>
            <h2 className="text-[#EDEBFF] font-medium mb-2">7. Acceptable Use</h2>
            <p>
              Please don't try to circumvent the paywall, scrape or redistribute the vocabulary
              content, or otherwise misuse the app. We reserve the right to take reasonable steps
              to prevent abuse.
            </p>
          </section>

          <section>
            <h2 className="text-[#EDEBFF] font-medium mb-2">8. Content Accuracy</h2>
            <p>
              We've written and reviewed the vocabulary content carefully, but we can't guarantee
              it's error-free or that it covers everything on any specific SAT administration. Use
              it as one part of your broader study, not your only resource.
            </p>
          </section>

          <section>
            <h2 className="text-[#EDEBFF] font-medium mb-2">9. "As Is," No Warranty</h2>
            <p>
              Voco is provided "as is," without warranties of any kind. We're not liable for any
              indirect, incidental, or consequential damages arising from your use of the app.
            </p>
          </section>

          <section>
            <h2 className="text-[#EDEBFF] font-medium mb-2">10. Changes to These Terms</h2>
            <p>
              We may update these terms from time to time. Continued use of the app after a
              change means you accept the updated terms.
            </p>
          </section>

          <section>
            <h2 className="text-[#EDEBFF] font-medium mb-2">11. Contact</h2>
            <p>
              Questions about these terms? Email{" "}
              <a href="mailto:itsowentodd@icloud.com" className="text-[#8B85FF]">
                itsowentodd@icloud.com
              </a>
              .
            </p>
          </section>
        </div>

        <Link href="/privacy" className="block text-[#8B85FF] text-sm mt-10">
          Read the Privacy Policy →
        </Link>
      </div>
    </main>
  );
}

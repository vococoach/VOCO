import Link from "next/link";
import { Moon, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Terms of Service — Voco",
};

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
        <p className="text-xs text-[#6E699B] mb-8">Last updated September 16, 2026</p>

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
              Voco is a study tool for SAT vocabulary, built around spaced repetition and
              words-in-context quizzes. It's meant for personal study use — we don't guarantee any
              particular test score or outcome.
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
            <p className="mb-2">Agreement &amp; Support is free forever.</p>
            <p className="mb-2">
              The other 5 categories require an active subscription: $1.99/month, with a 7-day
              free trial for new subscribers.
            </p>
            <p className="mb-2">
              Subscriptions are billed and processed entirely by Stripe, our payment processor. We
              never see or store your card details.
            </p>
            <p className="mb-2">
              Your trial automatically converts to a paid subscription at the end of 7 days unless
              you cancel first. You can cancel anytime — see "Canceling Your Subscription" below.
              Canceling stops future billing; access continues until the end of the current
              billing period.
            </p>
            <p>
              Prices may change; we'll do our best to give notice before any change takes effect
              for existing subscribers.
            </p>
          </section>

          <section>
            <h2 className="text-[#EDEBFF] font-medium mb-2">5. Canceling Your Subscription</h2>
            <p>
              The easiest way to cancel is through the subscription management link included in
              your payment receipt email from Stripe. You can also email us at{" "}
              <a href="mailto:itsowentodd@icloud.com" className="text-[#8B85FF]">
                itsowentodd@icloud.com
              </a>{" "}
              and we'll cancel it on our end.
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

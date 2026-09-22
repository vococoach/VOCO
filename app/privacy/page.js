import Link from "next/link";
import { Moon, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Privacy Policy — Voco",
};

export default function PrivacyPage() {
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
        <h1 className="font-display text-2xl text-[#EDEBFF] mb-1">Privacy Policy</h1>
        <p className="text-xs text-[#6E699B] mb-8">Last updated September 22, 2026</p>

        <div className="space-y-6 text-sm text-[#9B97C4] leading-relaxed">
          <section>
            <h2 className="text-[#EDEBFF] font-medium mb-2">1. The Short Version</h2>
            <p>
              Voco doesn't have accounts, doesn't run analytics or tracking scripts, and doesn't
              have a database. Nearly everything about how you use the app stays on your own
              device. The only data that leaves your device goes to Stripe, and only if you
              subscribe.
            </p>
          </section>

          <section>
            <h2 className="text-[#EDEBFF] font-medium mb-2">2. No Accounts, No Server-Side Storage</h2>
            <p>
              There's no sign-up, login, or user profile. We don't collect your name, email, or
              any personal information just to use the free content. Your study progress — which
              words you've studied, quiz scores, reading-passage results, grammar quiz results,
              streaks, and spaced-repetition scheduling — is stored only in your browser's local
              storage (
              <code>localStorage</code>) on your device. We have no access to it, no copy of it, and
              no way to see it.
            </p>
          </section>

          <section>
            <h2 className="text-[#EDEBFF] font-medium mb-2">3. Subscribing (Paid Categories)</h2>
            <p className="mb-2">
              If you subscribe to unlock the paid categories, checkout is handled entirely by
              Stripe, our payment processor. Stripe collects your email and payment details
              directly — we never see or store your card number.
            </p>
            <p>
              What we do receive from Stripe is a customer ID and your subscription status
              (trialing, active, or inactive), which the app uses on your device to decide whether
              to unlock paid content. We don't receive your billing address, full card details, or
              other information Stripe collects on its own checkout page. See{" "}
              <a
                href="https://stripe.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#8B85FF]"
              >
                Stripe's privacy policy
              </a>{" "}
              for how they handle that.
            </p>
          </section>

          <section>
            <h2 className="text-[#EDEBFF] font-medium mb-2">4. Cookies & Tracking</h2>
            <p>
              Voco doesn't use tracking cookies, analytics scripts, or third-party ad networks. We
              have no visibility into how you use the app beyond what's technically necessary to
              serve the pages.
            </p>
          </section>

          <section>
            <h2 className="text-[#EDEBFF] font-medium mb-2">5. Third Parties We Use</h2>
            <p className="mb-2">
              <span className="text-[#EDEBFF]">Stripe</span> — payment processing for
              subscriptions.
            </p>
            <p className="mb-2">
              <span className="text-[#EDEBFF]">Our hosting provider</span> — serves the app's
              pages; standard web server logs may briefly record IP addresses and request info as
              part of normal hosting operation, not something we access or use.
            </p>
            <p>We don't sell or share data with anyone else, because we don't have data to sell.</p>
          </section>

          <section>
            <h2 className="text-[#EDEBFF] font-medium mb-2">6. Children's Privacy</h2>
            <p>
              Voco is a vocabulary study tool that includes SAT vocabulary, so many of its
              learners are students, many of whom are minors. Because we don't collect personal information for the free content, there's
              nothing for us to knowingly collect from children under 13. Subscribing requires a
              payment method, which Stripe's own terms require the account holder to be able to
              legally provide.
            </p>
          </section>

          <section>
            <h2 className="text-[#EDEBFF] font-medium mb-2">7. Your Choices</h2>
            <p>
              You can clear your progress at any time using the "Reset progress on this device"
              button on the home screen, or by clearing your browser's site data for Voco
              directly. Since we don't store anything server-side, there's nothing further for us
              to delete on our end beyond what Stripe retains for billing/tax purposes.
            </p>
          </section>

          <section>
            <h2 className="text-[#EDEBFF] font-medium mb-2">8. Changes to This Policy</h2>
            <p>
              We may update this policy occasionally. Continued use of the app after a change
              means you accept the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-[#EDEBFF] font-medium mb-2">9. Contact</h2>
            <p>
              Questions about privacy? Email{" "}
              <a href="mailto:itsowentodd@icloud.com" className="text-[#8B85FF]">
                itsowentodd@icloud.com
              </a>
              .
            </p>
          </section>
        </div>

        <Link href="/terms" className="block text-[#8B85FF] text-sm mt-10">
          Read the Terms of Service →
        </Link>
      </div>
    </main>
  );
}

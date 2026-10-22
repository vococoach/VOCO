"use client";

import { TRADEMARK_NOTICE } from "@/lib/legal";
import { Fragment, useState } from "react";
import Link from "next/link";
import { Check, X, ChevronRight } from "lucide-react";
import NightThemeExplainer from "@/components/NightThemeExplainer";
import VocoMark from "@/components/VocoMark";
import TrialLink from "@/components/TrialLink";
import { getFirstVisitQuestion, getCourseStrip } from "@/lib/firstVisit";
import { courses } from "@/lib/wordbanks";
import { TRIAL_TERMS } from "@/lib/purchase";
import { HEADLINE_LINES, PROMISE } from "@/lib/site";
import { trackEvent, EVENTS } from "@/lib/analytics";

const question = getFirstVisitQuestion();
const strip = getCourseStrip();

// What a first-time visitor (no saved progress on this device) sees on the home
// screen: a chip saying the sample is free, the headline and the one-line promise
// (both from lib/site.js, the same words the page title and share preview use), one
// real free question they can answer right now on a raised card, a quiet line naming
// the four courses and — once they have answered — a real next step into that free
// level. It is server-rendered and fully usable the moment the HTML arrives; nothing
// waits on localStorage, the clock or a client-side check (the home screen swaps to
// the returning-user view only after hydration, and only if there is saved progress —
// see app/page.js). The question comes before anything else on the page: no dialog,
// no gate, nothing to dismiss.
//
// Colors come from CSS variables (THEME_CSS in lib/timeTheme.js), switched by
// the <html data-phase> attribute the inline script in lib/preHydration.js sets
// before first paint — so this follows the real time of day (dawn in the
// morning, night otherwise) with no JavaScript-chosen theme and no flash. The
// outcome colors (correct green, wrong rose) are the app's fixed ones.
//
// Everything above the courses list is sized to fit a 375×667 phone with no
// scrolling, with and without an answer showing. To make room for the answer, the
// chip, the line under the options and the course strip leave once the question is
// answered (they fold away, see `.vc-fold` in app/globals.css) and the explanation and
// the Keep going block take their place. On taller phones the spacing grows a little so
// the screen has no band of empty space. The courses list below it is there so the
// other courses stay discoverable; it is not part of that first screen.

// A block that leaves once the question is answered. It folds to nothing rather than
// vanishing, so what is below it glides up instead of jumping, and once folded it is out
// of reach of a screen reader too. `className` is the block's own spacing. It goes on an
// inner element: padding on the clipped element itself would keep its height from ever
// reaching zero.
function Fold({ folded, className, children }) {
  return (
    <div className="vc-fold" data-folded={folded} aria-hidden={folded || undefined}>
      <div>
        <div className={className}>{children}</div>
      </div>
    </div>
  );
}

export default function FirstVisit() {
  const [selected, setSelected] = useState(null);
  const answered = selected !== null;
  const { quiz, order, levelId } = question;

  function answer(idx) {
    if (answered) return;
    setSelected(idx);
    trackEvent(EVENTS.firstQuestionAnswered);
  }

  return (
    <main className="vc-first min-h-dvh" style={{ background: "var(--vc-page)", color: "var(--vc-text)" }}>
      <section className="mx-auto max-w-md min-h-dvh flex flex-col px-4 pt-4 pb-1">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <VocoMark size={26} />
            <span className="font-display text-xl">Voco</span>
          </div>
          <NightThemeExplainer label="How it works" compact iconClassName="hover:opacity-80" iconStyle={{ color: "var(--vc-subtext)" }} />
        </header>

        <div className="vc-stage">
          <Fold folded={answered} className="pt-1.5 pb-3">
            <p className="vc-chip">Free sample · no sign-up</p>
          </Fold>

          <h1 className="vc-h1 font-display">
            {HEADLINE_LINES.map((line, i) => (
              <Fragment key={line}>
                {i > 0 && <br />}
                {line}
              </Fragment>
            ))}
          </h1>
          <p className="text-sm leading-snug mt-2 max-w-[17rem]" style={{ color: "var(--vc-subtext)" }}>
            {PROMISE}
          </p>

          <div className="vc-card">
            <p className="text-[14px] font-medium leading-snug" style={{ color: "var(--vc-text)" }}>
              Which word fits the blank?
            </p>
            <p className="font-display text-[19px] leading-snug mt-1.5">{quiz.sentence}</p>

            <div className="grid grid-cols-2 gap-2 mt-3">
              {order.map((idx) => {
                const isCorrect = idx === quiz.correctIndex;
                const isSelected = idx === selected;
                // idle | correct | wrong. The look, the pressed state and the short
                // transition between them live in `.vc-option` (app/globals.css).
                let state = "idle";
                if (answered && isCorrect) state = "correct";
                else if (answered && isSelected) state = "wrong";
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => answer(idx)}
                    aria-disabled={answered}
                    data-state={state}
                    className="vc-option min-h-[56px] rounded-xl px-3 text-base font-medium flex items-center justify-between gap-1"
                  >
                    {quiz.options[idx]}
                    {state === "correct" && <Check size={16} className="vc-option-icon" style={{ color: "var(--vc-ok)" }} aria-label="correct" />}
                    {state === "wrong" && <X size={16} className="vc-option-icon" style={{ color: "var(--vc-no)" }} aria-label="not correct" />}
                  </button>
                );
              })}
            </div>

            <Fold folded={answered} className="pt-2.5">
              <p className="text-center text-xs leading-4" style={{ color: "var(--vc-subtext)" }}>
                One question. No account needed.
              </p>
            </Fold>

            <div aria-live="polite">
              {answered && (
                <div className="vc-unfold">
                  <div>
                    <p className="text-[13px] leading-snug pt-2.5" style={{ color: "var(--vc-subtext)" }}>
                      {quiz.explanation}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {answered && (
            <div className="vc-unfold">
              <div>
                <div className="pt-3">
                  <Link
                    href={`/sets/${levelId}/quiz`}
                    onClick={() => trackEvent(EVENTS.keepGoingClicked)}
                    className="block w-full rounded-xl px-4 py-3 font-medium text-center"
                    style={{ backgroundColor: "var(--vc-accent)", color: "var(--vc-cta-text)" }}
                  >
                    Keep going
                  </Link>
                  <p className="text-center text-xs leading-snug mt-2.5" style={{ color: "var(--vc-subtext)" }}>
                    <TrialLink placement="first-visit" className="underline font-medium" style={{ color: "var(--vc-text)" }}>
                      Start free trial
                    </TrialLink>{" "}
                    · {TRIAL_TERMS} Full access to every course.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Plain text, not links: the courses themselves are listed below this screen. */}
          <Fold folded={answered} className="pt-[var(--vc-strip-gap)]">
            <p className="text-center text-xs leading-4 text-balance" style={{ color: "var(--vc-subtext)" }}>
              {strip.text}
            </p>
          </Fold>
        </div>

        <footer className="mt-auto flex items-center justify-center gap-1 text-xs" style={{ color: "var(--vc-subtext)" }}>
          {/* 44px-tall tap targets (the text is 12px) */}
          <Link href="/terms" className="inline-flex min-h-[44px] items-center px-3">
            Terms of Service
          </Link>
          <Link href="/privacy" className="inline-flex min-h-[44px] items-center px-3">
            Privacy Policy
          </Link>
        </footer>
      </section>

      <section className="mx-auto max-w-md px-4 pb-10 pt-2">
        <h2 className="font-display text-lg mb-3">Courses</h2>
        <div className="space-y-3">
          {courses.map((course) => (
            <Link
              key={course.id}
              href={`/courses/${course.id}`}
              className="block rounded-2xl p-4 border"
              style={{ background: "var(--vc-card)", borderColor: "var(--vc-border)" }}
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-display text-lg">{course.title}</h3>
                <ChevronRight size={18} className="shrink-0" style={{ color: "var(--vc-accent)" }} />
              </div>
              <p className="text-xs mt-1" style={{ color: "var(--vc-subtext)" }}>
                {course.description}
              </p>
            </Link>
          ))}
        </div>
        <p className="mt-6 text-center text-[10px] leading-snug" style={{ color: "var(--vc-subtext)" }}>
          {TRADEMARK_NOTICE}
        </p>
      </section>
    </main>
  );
}

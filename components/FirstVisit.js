"use client";

import { useState } from "react";
import Link from "next/link";
import { Moon, Check, X, ChevronRight } from "lucide-react";
import NightThemeExplainer from "@/components/NightThemeExplainer";
import TrialLink from "@/components/TrialLink";
import { getFirstVisitQuestion } from "@/lib/firstVisit";
import { courses } from "@/lib/wordbanks";
import { TRIAL_TERMS } from "@/lib/purchase";
import { trackEvent, EVENTS } from "@/lib/analytics";

const question = getFirstVisitQuestion();

// What a first-time visitor (no saved progress on this device) sees on the home
// screen: the premise in one line, one real free question they can answer right
// now, and — once they have — a real next step into that free level. It is
// server-rendered and fully usable the moment the HTML arrives; nothing waits on
// localStorage, the clock or a client-side check (the home screen swaps to the
// returning-user view only after hydration, and only if there is saved
// progress — see app/page.js).
//
// Colors come from CSS variables (THEME_CSS in lib/timeTheme.js), switched by
// the <html data-phase> attribute the inline script in lib/preHydration.js sets
// before first paint — so this follows the real time of day (dawn in the
// morning, night otherwise) with no JavaScript-chosen theme and no flash. The
// outcome colors (correct green, wrong rose) are the app's fixed ones.
//
// Everything above the courses list is sized to fit a 375×667 phone with no
// scrolling, with and without an answer showing. The courses list below it is
// there so the other three courses stay discoverable; it is not part of that
// first screen.
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
      <section className="mx-auto max-w-md min-h-dvh flex flex-col px-4 pt-4 pb-3">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Moon size={22} style={{ color: "var(--vc-accent)" }} />
            <span className="font-display text-xl">Voco</span>
          </div>
          <NightThemeExplainer iconClassName="hover:opacity-100 opacity-70" iconStyle={{ color: "var(--vc-subtext)" }} />
        </header>

        <h1 className="font-display text-[28px] leading-[1.1] mt-5">
          Study tonight.
          <br />
          Quiz tomorrow.
        </h1>
        <p className="text-sm leading-snug mt-2 text-balance" style={{ color: "var(--vc-subtext)" }}>
          SAT vocab, built around how sleep helps memory settle.
        </p>

        <div className="mt-4 rounded-2xl p-4 border" style={{ background: "var(--vc-card)", borderColor: "var(--vc-border)" }}>
          <p className="text-[11px] uppercase tracking-wide" style={{ color: "var(--vc-subtext)" }}>
            Try one — which word fits?
          </p>
          <p className="font-display text-[17px] leading-snug mt-1.5">{quiz.sentence}</p>

          <div className="grid grid-cols-2 gap-2 mt-3">
            {order.map((idx) => {
              const isCorrect = idx === quiz.correctIndex;
              const isSelected = idx === selected;
              let state = "";
              if (answered && isCorrect) state = "border-[#7BC9A0] bg-[#7BC9A01A]";
              else if (answered && isSelected) state = "border-[#E08A9E] bg-[#E08A9E1A]";
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => answer(idx)}
                  aria-disabled={answered}
                  className={`min-h-[48px] rounded-xl border px-3 text-[15px] font-medium flex items-center justify-between gap-1 ${state}`}
                  style={answered && (isCorrect || isSelected) ? undefined : { borderColor: "var(--vc-border)" }}
                >
                  {quiz.options[idx]}
                  {answered && isCorrect && <Check size={16} color="#7BC9A0" aria-label="correct" />}
                  {answered && isSelected && !isCorrect && <X size={16} color="#E08A9E" aria-label="not correct" />}
                </button>
              );
            })}
          </div>

          <div aria-live="polite">
            {answered && (
              <p className="text-[13px] leading-snug mt-3" style={{ color: "var(--vc-subtext)" }}>
                {quiz.explanation}
              </p>
            )}
          </div>
        </div>

        {answered && (
          <div className="mt-3">
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
        )}

        <footer className="mt-auto pt-3 flex items-center justify-center gap-4 text-[11px]" style={{ color: "var(--vc-subtext)" }}>
          <Link href="/terms" className="py-1">
            Terms of Service
          </Link>
          <Link href="/privacy" className="py-1">
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
      </section>
    </main>
  );
}

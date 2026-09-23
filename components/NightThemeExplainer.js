"use client";

import { useEffect, useRef } from "react";
import { Info, X } from "lucide-react";
import { SLEEP_SCIENCE } from "@/lib/sleepScience";
import { hasSeenThisSession, markSeenThisSession } from "@/lib/nightThemeExplainer";

// Small "why the night theme?" icon for the home header, plus the dismissible
// explainer it opens. Uses the native <dialog> element, which supplies the
// modal backdrop, focus trapping and Esc-to-close for free; the forms with
// method="dialog" close it without any extra state.
//
// Also auto-opens once per fresh browser session (a new tab/window opening the
// site) — not once ever, and not on every internal navigation within a session
// that's already open. See lib/nightThemeExplainer.js for the sessionStorage
// flag and CLAUDE.md for the reasoning (traded onboarding-once for repeated
// visibility, deliberately). The manual tap-to-open affordance below is
// unchanged and always available regardless of the session flag.
export default function NightThemeExplainer() {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!hasSeenThisSession()) {
      dialogRef.current?.showModal();
      // Marked immediately (not on dismiss), so navigating away before
      // closing it still counts as "seen" for the rest of this session.
      markSeenThisSession();
    }
  }, []);

  return (
    <>
      <button
        type="button"
        aria-label="Why the night theme?"
        onClick={() => dialogRef.current?.showModal()}
        // Padding + equal negative margin: a 44px tap target around a 16px
        // icon without shifting the header layout.
        className="p-3.5 -m-3.5 rounded-full text-[#6E699B] hover:text-[#9B97C4] focus-visible:text-[#9B97C4]"
      >
        <Info size={16} />
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby="night-theme-title"
        // Clicks on the dimmed backdrop land on the <dialog> itself (its
        // padding is 0 and the content sits in the inner div), so a click
        // whose target is the dialog means "outside".
        onClick={(e) => {
          if (e.target === dialogRef.current) dialogRef.current.close();
        }}
        className="m-auto p-0 w-[calc(100%-2rem)] max-w-sm rounded-2xl bg-[#20223F] text-[#EDEBFF] border border-[#ffffff1a] backdrop:bg-[#0B0C1Acc]"
      >
        <form method="dialog" className="p-6">
          <div className="flex items-start justify-between gap-4 mb-3">
            <h2 id="night-theme-title" className="font-display text-xl">
              Why the night theme?
            </h2>
            <button
              type="submit"
              aria-label="Close"
              className="p-3.5 -m-3.5 rounded-full text-[#9B97C4] hover:text-[#EDEBFF]"
            >
              <X size={18} />
            </button>
          </div>

          <div className="space-y-3 text-sm leading-relaxed text-[#C9C5EC]">
            <p>
              Voco is built around a simple rhythm: study before you sleep, then quiz yourself
              after you wake.
            </p>
            <p>
              {SLEEP_SCIENCE.consolidation} {SLEEP_SCIENCE.replay} {SLEEP_SCIENCE.studyBeforeBed}{" "}
              {SLEEP_SCIENCE.retrieval}
            </p>
            <p>
              The colors follow the actual time of day, wherever you are in the app: deep night
              blues in the evening, warm dawn tones in the morning — not which screen you're on.
              The home screen also shifts gently with your local time — evenings point you to
              tonight's study, and mornings bring back last night's words.
            </p>
            <p>
              Two different streaks: the flame counts days you completed any quiz; the sunrise is
              your night-to-morning streak — consecutive mornings you quizzed the words you
              studied the night before. Tap either one to share it as an image.
            </p>
            <p className="text-xs text-[#9B97C4]">{SLEEP_SCIENCE.hedge}</p>
          </div>

          <button
            type="submit"
            className="mt-5 w-full rounded-xl px-4 py-2.5 text-sm font-medium"
            style={{ backgroundColor: "#8B85FF", color: "#14152B" }}
          >
            Got it
          </button>
        </form>
      </dialog>
    </>
  );
}

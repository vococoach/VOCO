"use client";

import { useRef } from "react";
import Link from "next/link";
import { Info, X } from "lucide-react";
import { SLEEP_SCIENCE } from "@/lib/sleepScience";

// The header control that opens the explainer, plus the dismissible explainer
// itself. Uses the native <dialog> element, which supplies the modal backdrop,
// focus trapping and Esc-to-close for free; the forms with method="dialog" close it
// without any extra state.
//
// It only ever opens when the learner taps the control. (It used to also pop open
// by itself once per browser session; that was removed because an uninvited
// dialog on arrival is exactly what makes a first-time visitor leave — see
// CLAUDE.md.) The dialog stays dark in every phase: it's a modal over the page,
// not a learning screen.
//
// Two forms:
//   - Default (the returning home screen's header): a small info icon that opens
//     the full "Why the night theme?" explanation, including the streaks.
//   - `label` + `compact` (the first-visit screen): a labelled "How it works" text
//     control, and a dialog with two sentences and a link to /how-it-works, where
//     the full explanation lives. A first-time visitor has no streaks yet, so
//     nothing about streaks is in it.
//
// `iconClassName`/`iconStyle` let a screen color the control to match its own
// background. The defaults are the muted text color of the current palette (night or
// dawn, at least 4.5:1 on the page), which is what the home screen's header uses.
const DEFAULT_ICON_STYLE = { color: "var(--vc-subtext)" };
export default function NightThemeExplainer({
  iconClassName = "hover:opacity-80",
  iconStyle = DEFAULT_ICON_STYLE,
  label,
  compact = false,
}) {
  const dialogRef = useRef(null);
  const open = () => dialogRef.current?.showModal();

  return (
    <>
      {label ? (
        // A 44px-tall tap target. The negative margins keep it from making the
        // header taller or shifting the layout; the extra padding is hit area only.
        <button
          type="button"
          onClick={open}
          className={`-my-2 -mr-3 inline-flex min-h-[44px] items-center rounded-full px-3 text-[13px] font-medium underline decoration-1 underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:[outline-color:var(--vc-focus)] ${iconClassName}`}
          style={iconStyle}
        >
          {label}
        </button>
      ) : (
        <button
          type="button"
          aria-label="Why the night theme?"
          onClick={open}
          // Padding + equal negative margin: a 44px tap target around a 16px
          // icon without shifting the header layout.
          className={`p-3.5 -m-3.5 rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:[outline-color:var(--vc-focus)] ${iconClassName}`}
          style={iconStyle}
        >
          <Info size={16} />
        </button>
      )}

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
              {compact ? "How it works" : "Why the night theme?"}
            </h2>
            <button
              type="submit"
              aria-label="Close"
              className="p-3.5 -m-3.5 rounded-full text-[#9B97C4] hover:text-[#EDEBFF]"
            >
              <X size={18} />
            </button>
          </div>

          {compact ? (
            <div className="space-y-3 text-sm leading-relaxed text-[#C9C5EC]">
              <p>{SLEEP_SCIENCE.rhythm}</p>
              <p>{SLEEP_SCIENCE.short}</p>
              <p>
                <Link href="/how-it-works" className="text-[#8B85FF] underline underline-offset-4">
                  Read how it works
                </Link>
              </p>
            </div>
          ) : (
            <div className="space-y-3 text-sm leading-relaxed text-[#C9C5EC]">
              <p>{SLEEP_SCIENCE.rhythm}</p>
              <p>
                {SLEEP_SCIENCE.consolidation} {SLEEP_SCIENCE.replay} {SLEEP_SCIENCE.studyBeforeBed}{" "}
                {SLEEP_SCIENCE.retrieval}
              </p>
              <p>
                The colors follow the time of day: night blues in the evening, dawn tones in the
                morning. Evenings suggest tonight's study, and mornings bring back last night's words.
              </p>
              <p>
                Two streaks. The flame counts days you finished a quiz. The sunrise counts mornings
                in a row you quizzed the words you studied the night before. Tap one to share it.
              </p>
              <p className="text-xs text-[#9B97C4]">{SLEEP_SCIENCE.hedge}</p>
            </div>
          )}

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

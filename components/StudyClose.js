import Link from "next/link";
import { Moon } from "lucide-react";
import { SLEEP_SCIENCE } from "@/lib/sleepScience";
import { NIGHT } from "@/lib/timeTheme";

// The moment after "Done studying", in place of an instant redirect home. It
// explains why the app suggests stopping here rather than quizzing right
// away — but it's only a suggestion: "Back home" is always one tap, and the
// quiz is never locked (the "no unlock timer" decision stands).
//
// `evening` is the learner's local phase when they finished (18:00–04:59),
// so the copy says "in the morning" when that's true and "tomorrow morning"
// when they studied earlier in the day. The science lines come from the
// shared, vetted lib/sleepScience.js. `theme` (lib/timeTheme.js) is the real
// time-of-day palette the study page just used — this screen matches it
// rather than always being night, regardless of `evening`: studying at 2pm
// still closes on the calm midday palette, not a hardcoded one.
export default function StudyClose({ evening, theme = NIGHT }) {
  return (
    <main className={`min-h-dvh ${theme.page} px-4 py-8 flex items-center justify-center`}>
      <div className="voco-rise max-w-md w-full text-center">
        <div
          className="mx-auto mb-5 w-14 h-14 rounded-full flex items-center justify-center"
          style={{ backgroundColor: theme.card, boxShadow: `0 0 0 8px ${theme.accent}1A` }}
        >
          <Moon size={26} color={theme.accent} />
        </div>

        <h1 className="font-display text-2xl mb-3" style={{ color: theme.text }}>
          {evening ? "Tonight's study is done." : "Nicely done."}
        </h1>
        <p className="leading-relaxed mb-6 text-balance" style={{ color: theme.subtext }}>
          You've done the learning part. Sleep helps your brain make it last —{" "}
          {evening ? "come back in the morning" : "after tonight's sleep, come back tomorrow morning"} and
          quiz yourself to help it stick.
        </p>

        <div className="rounded-2xl p-4 mb-6 text-left" style={{ backgroundColor: theme.card }}>
          <p className="text-xs uppercase tracking-widest mb-2" style={{ color: theme.accent }}>Why stop here?</p>
          <p className="text-sm leading-relaxed" style={{ color: theme.subtext }}>
            {SLEEP_SCIENCE.consolidation} {SLEEP_SCIENCE.replay}
          </p>
          <p className="text-xs mt-2" style={{ color: theme.muted }}>{SLEEP_SCIENCE.hedgeShort}</p>
        </div>

        <Link
          href="/"
          className="block w-full rounded-xl px-4 py-3 font-medium text-center"
          style={{ backgroundColor: theme.accent, color: theme.onAccent }}
        >
          Back home
        </Link>
      </div>
    </main>
  );
}

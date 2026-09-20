import Link from "next/link";
import { Moon } from "lucide-react";
import { SLEEP_SCIENCE } from "@/lib/sleepScience";

// The moment after "Done studying", in place of an instant redirect home. It
// explains why the app suggests stopping here rather than quizzing right
// away — but it's only a suggestion: "Back home" is always one tap, and the
// quiz is never locked (the "no unlock timer" decision stands).
//
// `evening` is the learner's local phase when they finished (18:00–04:59),
// so the copy says "in the morning" when that's true and "tomorrow morning"
// when they studied earlier in the day. The science lines come from the
// shared, vetted lib/sleepScience.js.
export default function StudyClose({ evening }) {
  return (
    <main className="min-h-dvh bg-[#14152B] px-4 py-8 flex items-center justify-center">
      <div className="voco-rise max-w-md w-full text-center">
        <div
          className="mx-auto mb-5 w-14 h-14 rounded-full bg-[#1F2142] flex items-center justify-center"
          style={{ boxShadow: "0 0 0 8px #8B85FF1A" }}
        >
          <Moon size={26} color="#8B85FF" />
        </div>

        <h1 className="font-display text-2xl text-[#EDEBFF] mb-3">
          {evening ? "Tonight's study is done." : "Nicely done."}
        </h1>
        <p className="text-[#C9C5EC] leading-relaxed mb-6 text-balance">
          You've done the learning part. Sleep helps your brain make it last —{" "}
          {evening ? "come back in the morning" : "after tonight's sleep, come back tomorrow morning"} and
          quiz yourself to help it stick.
        </p>

        <div className="bg-[#1F2142] rounded-2xl p-4 mb-6 text-left">
          <p className="text-xs uppercase tracking-widest text-[#8B85FF] mb-2">Why stop here?</p>
          <p className="text-sm leading-relaxed text-[#C9C5EC]">
            {SLEEP_SCIENCE.consolidation} {SLEEP_SCIENCE.replay}
          </p>
          <p className="text-xs mt-2 text-[#9B97C4]">{SLEEP_SCIENCE.hedgeShort}</p>
        </div>

        <Link
          href="/"
          className="block w-full rounded-xl px-4 py-3 font-medium text-center"
          style={{ backgroundColor: "#8B85FF", color: "#14152B" }}
        >
          Back home
        </Link>
      </div>
    </main>
  );
}

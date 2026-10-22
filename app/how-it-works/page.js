import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import VocoMark from "@/components/VocoMark";
import { SLEEP_SCIENCE } from "@/lib/sleepScience";

export const metadata = {
  title: "How Voco works",
};

// The full explanation behind the short "How it works" dialog on the first-visit
// screen (components/NightThemeExplainer.js). Every sleep-and-memory sentence comes
// from lib/sleepScience.js, the one place those claims are written and checked;
// what is written here is only the headings and the plain description of the app.
export default function HowItWorksPage() {
  return (
    <main className="min-h-dvh bg-[#1A1C3A] px-4 py-8">
      <div className="max-w-md mx-auto">
        <Link href="/" className="inline-flex min-h-[44px] items-center gap-1 text-xs text-[#9B97C4] mb-2">
          <ArrowLeft size={14} /> Back
        </Link>

        <div className="flex items-center gap-2 mb-2">
          <VocoMark size={24} />
          <span className="font-display text-lg text-[#EDEBFF]">Voco</span>
        </div>
        <h1 className="font-display text-2xl text-[#EDEBFF] mb-6">How it works</h1>

        <div className="space-y-6 text-sm text-[#9B97C4] leading-relaxed">
          <section>
            <h2 className="text-[#EDEBFF] font-medium mb-2">The rhythm</h2>
            <p className="mb-2">{SLEEP_SCIENCE.rhythm}</p>
            <p>
              Nothing is locked by the clock. You can study and quiz at any hour; the time of day only
              changes what the home screen suggests.
            </p>
          </section>

          <section>
            <h2 className="text-[#EDEBFF] font-medium mb-2">Why sleep</h2>
            <p className="mb-2">
              {SLEEP_SCIENCE.consolidation} {SLEEP_SCIENCE.replay} {SLEEP_SCIENCE.studyBeforeBed}{" "}
              {SLEEP_SCIENCE.retrieval}
            </p>
            <p>{SLEEP_SCIENCE.hedge}</p>
          </section>

          <section>
            <h2 className="text-[#EDEBFF] font-medium mb-2">Why the colors change</h2>
            <p>
              The colors follow the actual time of day, wherever you are in the app: deep night blues in
              the evening and warm dawn tones in the morning, whichever screen you're on. The home screen
              also shifts gently with your local time. Evenings point you to tonight's study, and mornings
              bring back last night's words.
            </p>
          </section>

          <section>
            <h2 className="text-[#EDEBFF] font-medium mb-2">Streaks</h2>
            <p>
              There are two. The flame counts the days you completed any quiz. The sunrise is your
              night-to-morning streak: consecutive mornings you quizzed the words you studied the night
              before. Tap either one on the home screen to share it as an image.
            </p>
          </section>
        </div>

        <Link href="/" className="block text-[#8B85FF] text-sm mt-10 py-3">
          Back to Voco
        </Link>
      </div>
    </main>
  );
}

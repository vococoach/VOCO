"use client";

import { useState } from "react";
import { Moon, Sunrise } from "lucide-react";
import { SLEEP_SCIENCE } from "@/lib/sleepScience";

// First-visit onboarding, shown once (see lib/onboarding.js) before the
// home screen: two short screens that frame the app's premise up front —
// study before bed, get quizzed after waking, because sleep is when memory
// consolidates. Skippable on either screen. The science wording comes from
// the shared, vetted lib/sleepScience.js.
export default function Onboarding({ onFinish }) {
  const [step, setStep] = useState(0);
  const last = step === 1;

  return (
    <main className="min-h-dvh bg-[#1A1C3A] px-4 py-8">
      <div className="max-w-md mx-auto min-h-[calc(100dvh-4rem)] flex flex-col">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Moon size={22} color="#8B85FF" />
            <span className="font-display text-xl text-[#EDEBFF]">Voco</span>
          </div>
          <button
            type="button"
            onClick={onFinish}
            className="p-3 -m-3 text-sm text-[#9B97C4] hover:text-[#EDEBFF]"
          >
            Skip
          </button>
        </div>

        {/* key={step} restarts the gentle entrance when the screen changes */}
        <div key={step} className="voco-rise flex-1 flex flex-col justify-center py-10">
          {step === 0 ? (
            <>
              <div className="flex items-center gap-3 mb-6" aria-hidden="true">
                <Moon size={28} color="#8B85FF" />
                <span className="h-px w-10 bg-[#ffffff26]" />
                <Sunrise size={28} color="#FFB27D" />
              </div>
              <h1 className="font-display text-3xl text-[#EDEBFF] leading-tight mb-4">
                Study at night.
                <br />
                Quiz in the morning.
              </h1>
              <p className="text-[#C9C5EC] leading-relaxed">
                Learn a level before bed, then quiz yourself after you wake. Sleep helps your brain
                consolidate what you learned — which is why Voco is built around this rhythm.
              </p>
            </>
          ) : (
            <>
              <h1 className="font-display text-3xl text-[#EDEBFF] leading-tight mb-4">
                What sleep does for memory
              </h1>
              <div className="space-y-3 text-[#C9C5EC] leading-relaxed">
                <p>{SLEEP_SCIENCE.consolidation}</p>
                <p>{SLEEP_SCIENCE.replay}</p>
                <p>{SLEEP_SCIENCE.retrieval}</p>
              </div>
              <p className="text-xs text-[#9B97C4] mt-5">{SLEEP_SCIENCE.hedge}</p>
            </>
          )}
        </div>

        <div>
          <div className="flex justify-center gap-2 mb-4" aria-hidden="true">
            {[0, 1].map((i) => (
              <span
                key={i}
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: i === step ? "#8B85FF" : "#ffffff26" }}
              />
            ))}
          </div>
          <p className="sr-only">Step {step + 1} of 2</p>
          <button
            type="button"
            onClick={() => (last ? onFinish() : setStep(1))}
            className="w-full rounded-xl px-4 py-3 font-medium"
            style={{ backgroundColor: "#8B85FF", color: "#14152B" }}
          >
            {last ? "Start learning" : "Next"}
          </button>
        </div>
      </div>
    </main>
  );
}

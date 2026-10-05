"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Check, X, ArrowLeft } from "lucide-react";
import PassageCard from "@/components/PassageCard";
import PassageChart from "@/components/PassageChart";
import TrialLink from "@/components/TrialLink";
import { getPreviewSample } from "@/lib/preview";
import { PRICE_LABEL, TRIAL_LABEL, TRIAL_TERMS, isSubscribedCached } from "@/lib/purchase";
import { getActivityTheme, NIGHT } from "@/lib/timeTheme";

// The word bank always lists the correct option first (correctIndex: 0);
// shuffle the display order on the client only, after mount, so the server
// and first client render match (same approach as the real quiz pages).
function shuffledIndices(count) {
  const order = Array.from({ length: count }, (_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

// One real, unmetered sample question from a locked item — the actual format,
// not a mockup: a vocabulary category or tier, a Grammar & Usage category, a
// reading passage or a cross-text pair (lib/preview.js decides which, from the
// id in the URL; the folder is still named [categoryId] from when it was only
// categories). It records NOTHING (no progress, no spaced-repetition history)
// and grants nothing: the item stays locked, and this page only ever renders
// the single sample from lib/preview.js.
export default function PreviewPage() {
  const params = useParams();
  const router = useRouter();
  const sample = getPreviewSample(params.categoryId);
  const [subscribed, setSubscribed] = useState(null); // null = not checked yet
  const [selected, setSelected] = useState(null);
  const [order, setOrder] = useState([0, 1, 2, 3]);
  // Real time of day, not "sample question = always dawn" — see lib/timeTheme.js.
  const [theme, setTheme] = useState(NIGHT);

  useEffect(() => {
    setSubscribed(isSubscribedCached());
    setOrder(shuffledIndices(4));
    setTheme(getActivityTheme(new Date()));
  }, []);

  // Not something locked (unknown id, or free), or already subscribed —
  // nothing to preview, so go home.
  useEffect(() => {
    if (subscribed === null) return;
    if (!sample || subscribed) router.replace("/");
  }, [subscribed, sample, router]);

  if (subscribed === null || !sample || subscribed) return null;

  const { course, title, countLine, kind } = sample;
  const answered = selected !== null;
  const longOptions = kind !== "vocab";

  return (
    <main className={`min-h-dvh ${theme.page} px-4 py-8`}>
      <div className="max-w-md mx-auto">
        <Link href="/" className="flex items-center gap-1 text-xs mb-6" style={{ color: theme.subtext }}>
          <ArrowLeft size={14} /> Back
        </Link>

        <p className="text-xs uppercase tracking-wide mb-1" style={{ color: theme.subtext }}>Sample question — {title}</p>
        <p className="text-xs mb-4" style={{ color: theme.subtext }}>
          One real question from {course ? course.title : "the course"}. No sign-up needed.
        </p>

        {sample.passages.map((p, i) => (
          <PassageCard key={i} title={p.title} subject={p.subject} text={p.text} theme={theme} />
        ))}

        <div className="rounded-2xl p-6 mb-5" style={{ backgroundColor: theme.card }}>
          <PassageChart chart={sample.chart} theme={theme} />
          {sample.notes && (
            <div className="mb-4">
              <ul className="text-sm space-y-1 mb-3" style={{ color: theme.text }}>
                {sample.notes.map((note, i) => (
                  <li key={i} className="flex gap-2">
                    <span aria-hidden="true" style={{ color: theme.subtext }}>&bull;</span>
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
              <p className="text-sm font-medium leading-relaxed" style={{ color: theme.text }}>{sample.goal}</p>
            </div>
          )}
          {sample.cue && <p className="text-xs mb-2" style={{ color: theme.subtext }}>{sample.cue}</p>}
          {sample.stem && (
            <p className="font-display text-lg mb-4 leading-relaxed" style={{ color: theme.text }}>{sample.stem}</p>
          )}
          <div className={`space-y-2 ${sample.stem ? "" : "mt-3"}`}>
            {order.map((idx) => {
              const isCorrect = idx === sample.correctIndex;
              const isSelected = idx === selected;
              let style = theme.optionIdle;
              if (answered) {
                if (isCorrect) style = "border-[#7BC9A0] bg-[#7BC9A01A]";
                else if (isSelected) style = "border-[#E08A9E] bg-[#E08A9E1A]";
              }
              return (
                <button
                  key={idx}
                  onClick={() => !answered && setSelected(idx)}
                  className={`w-full text-left rounded-xl px-4 py-3 border ${style} flex items-center justify-between gap-3`}
                  style={{ color: theme.text }}
                >
                  <span className={longOptions ? "leading-relaxed" : undefined}>{sample.options[idx]}</span>
                  {answered && isCorrect && <Check size={16} color="#7BC9A0" className="shrink-0" />}
                  {answered && isSelected && !isCorrect && <X size={16} color="#E08A9E" className="shrink-0" />}
                </button>
              );
            })}
          </div>
          {answered && <p className="text-sm mt-4" style={{ color: theme.subtext }}>{sample.explanation}</p>}
        </div>

        {answered && (
          <div className="rounded-2xl p-5 border text-center" style={{ backgroundColor: theme.card, borderColor: `${theme.accent}66` }}>
            <p className="font-display text-xl mb-1" style={{ color: theme.text }}>{PRICE_LABEL} for full access to every course</p>
            <p className="text-sm mb-4" style={{ color: theme.subtext }}>
              {countLine} One subscription unlocks every course.
            </p>
            <TrialLink
              placement="preview"
              className="block w-full rounded-xl px-4 py-3 font-medium text-center mb-2"
              style={{ backgroundColor: theme.accent, color: theme.onAccent }}
            >
              Start {TRIAL_LABEL}
            </TrialLink>
            <p className="text-xs mb-3" style={{ color: theme.subtext }}>
              {TRIAL_TERMS}
            </p>
            <Link href="/unlock" className="text-sm underline" style={{ color: theme.subtext }}>
              See what's included
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}

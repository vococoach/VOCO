"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Check, X, ArrowLeft } from "lucide-react";
import { getPreviewSample } from "@/lib/preview";
import { PAYMENT_LINK_URL, PRICE_LABEL, TRIAL_LABEL, isSubscribedCached } from "@/lib/purchase";
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

// One real, unmetered sample question from a locked category — the actual
// words-in-context format, not a mockup. It records NOTHING (no progress, no
// spaced-repetition history) and grants nothing: the category stays locked,
// and this page only ever renders the single sample from lib/preview.js.
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

  // Not a paid category (unknown id, or the free one), or already
  // subscribed — nothing to preview, so go home.
  useEffect(() => {
    if (subscribed === null) return;
    if (!sample || subscribed) router.replace("/");
  }, [subscribed, sample, router]);

  if (subscribed === null || !sample || subscribed) return null;

  const { course, category, word, totalQuestions } = sample;
  const q = word.quiz;
  const answered = selected !== null;

  return (
    <main className={`min-h-dvh ${theme.page} px-4 py-8`}>
      <div className="max-w-md mx-auto">
        <Link href="/" className="flex items-center gap-1 text-xs mb-6" style={{ color: theme.subtext }}>
          <ArrowLeft size={14} /> Back
        </Link>

        <p className="text-xs uppercase tracking-wide mb-1" style={{ color: theme.subtext }}>Sample question — {category.title}</p>
        <p className="text-xs mb-4" style={{ color: theme.subtext }}>
          One real question from {course ? course.title : "the course"}. No sign-up needed.
        </p>

        <div className="rounded-2xl p-6 mb-5" style={{ backgroundColor: theme.card }}>
          <p className="text-xs mb-2" style={{ color: theme.subtext }}>Which word best completes the sentence?</p>
          <p className="font-display text-lg mb-4 leading-relaxed" style={{ color: theme.text }}>{q.sentence}</p>
          <div className="space-y-2">
            {order.map((idx) => {
              const isCorrect = idx === q.correctIndex;
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
                  className={`w-full text-left rounded-xl px-4 py-3 border ${style} flex items-center justify-between`}
                  style={{ color: theme.text }}
                >
                  {q.options[idx]}
                  {answered && isCorrect && <Check size={16} color="#7BC9A0" />}
                  {answered && isSelected && !isCorrect && <X size={16} color="#E08A9E" />}
                </button>
              );
            })}
          </div>
          {answered && <p className="text-sm mt-4" style={{ color: theme.subtext }}>{q.explanation}</p>}
        </div>

        {answered && (
          <div className="rounded-2xl p-5 border text-center" style={{ backgroundColor: theme.card, borderColor: `${theme.accent}66` }}>
            <p className="font-display text-xl mb-1" style={{ color: theme.text }}>{PRICE_LABEL} for full access</p>
            <p className="text-sm mb-4" style={{ color: theme.subtext }}>
              That was 1 of {totalQuestions} questions in {category.title}. One subscription unlocks every
              course — {TRIAL_LABEL}, cancel anytime.
            </p>
            <a
              href={PAYMENT_LINK_URL}
              className="block w-full rounded-xl px-4 py-3 font-medium text-center mb-3"
              style={{ backgroundColor: theme.accent, color: theme.onAccent }}
            >
              Start {TRIAL_LABEL}
            </a>
            <Link href="/unlock" className="text-sm underline" style={{ color: theme.subtext }}>
              See what's included
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}

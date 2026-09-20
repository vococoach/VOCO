"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Check, X, ArrowLeft } from "lucide-react";
import { getPreviewSample } from "@/lib/preview";
import { PAYMENT_LINK_URL, PRICE_LABEL, TRIAL_LABEL, isSubscribedCached } from "@/lib/purchase";

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

  useEffect(() => {
    setSubscribed(isSubscribedCached());
    setOrder(shuffledIndices(4));
  }, []);

  // Not a paid category (unknown id, or the free one), or already
  // subscribed — nothing to preview, so go home.
  useEffect(() => {
    if (subscribed === null) return;
    if (!sample || subscribed) router.replace("/");
  }, [subscribed, sample, router]);

  if (subscribed === null || !sample || subscribed) return null;

  const { category, word, totalQuestions } = sample;
  const q = word.quiz;
  const answered = selected !== null;

  return (
    <main className="min-h-dvh bg-gradient-to-b from-[#FFD9B0] to-[#FFEFDD] px-4 py-8">
      <div className="max-w-md mx-auto">
        <Link href="/" className="flex items-center gap-1 text-xs text-[#8A6E7D] mb-6">
          <ArrowLeft size={14} /> Back
        </Link>

        <p className="text-xs uppercase tracking-wide text-[#8A6E7D] mb-1">Sample question — {category.title}</p>
        <p className="text-xs text-[#8A6E7D] mb-4">One real question from the course. No sign-up needed.</p>

        <div className="bg-[#FFF9F2] rounded-2xl p-6 mb-5">
          <p className="text-xs text-[#8A6E7D] mb-2">Which word best completes the sentence?</p>
          <p className="font-display text-lg mb-4 text-[#3D2B4F] leading-relaxed">{q.sentence}</p>
          <div className="space-y-2">
            {order.map((idx) => {
              const isCorrect = idx === q.correctIndex;
              const isSelected = idx === selected;
              let style = "border-[#00000014] bg-transparent";
              if (answered) {
                if (isCorrect) style = "border-[#7BC9A0] bg-[#7BC9A01A]";
                else if (isSelected) style = "border-[#E08A9E] bg-[#E08A9E1A]";
              }
              return (
                <button
                  key={idx}
                  onClick={() => !answered && setSelected(idx)}
                  className={`w-full text-left rounded-xl px-4 py-3 border ${style} text-[#3D2B4F] flex items-center justify-between`}
                >
                  {q.options[idx]}
                  {answered && isCorrect && <Check size={16} color="#7BC9A0" />}
                  {answered && isSelected && !isCorrect && <X size={16} color="#E08A9E" />}
                </button>
              );
            })}
          </div>
          {answered && <p className="text-sm mt-4 text-[#8A6E7D]">{q.explanation}</p>}
        </div>

        {answered && (
          <div className="rounded-2xl p-5 bg-[#FFF9F2] border border-[#FF9B5C66] text-center">
            <p className="font-display text-xl text-[#3D2B4F] mb-1">{PRICE_LABEL} for full access</p>
            <p className="text-sm text-[#8A6E7D] mb-4">
              That was 1 of {totalQuestions} questions in {category.title}. One subscription unlocks every
              category — {TRIAL_LABEL}, cancel anytime.
            </p>
            <a
              href={PAYMENT_LINK_URL}
              className="block w-full rounded-xl px-4 py-3 font-medium text-center mb-3"
              style={{ backgroundColor: "#FF9B5C", color: "#14152B" }}
            >
              Start {TRIAL_LABEL}
            </a>
            <Link href="/unlock" className="text-sm text-[#8A6E7D] underline">
              See what's included
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Moon, Lock, Check, X, Sparkles } from "lucide-react";
import { categories } from "@/lib/wordbanks";
import {
  FREE_CATEGORY_ID,
  PAYMENT_LINK_URL,
  PRICE_LABEL,
  TRIAL_LABEL,
  setCustomerId,
  isSubscribedCached,
  shouldRefreshStatus,
  refreshSubscriptionStatus,
} from "@/lib/purchase";

// "checking" (deciding which state to show) -> "pitch" | "already", or,
// coming back from Stripe with ?session_id=... -> "verifying" -> "success" | "error"
export default function UnlockPage() {
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    const sessionId = new URLSearchParams(window.location.search).get("session_id");

    if (sessionId) {
      setStatus("verifying");
      fetch("/api/verify-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.unlocked) {
            setCustomerId(data.customerId, data.status);
            setStatus("success");
          } else {
            setStatus("error");
          }
        })
        .catch(() => setStatus("error"));
      return;
    }

    if (isSubscribedCached()) {
      setStatus("already");
      if (shouldRefreshStatus()) {
        refreshSubscriptionStatus().then((subscribed) => {
          if (!subscribed) setStatus("pitch");
        });
      }
    } else {
      setStatus("pitch");
    }
  }, []);

  const freeCategory = categories.find((c) => c.id === FREE_CATEGORY_ID);
  const lockedCategories = categories.filter((c) => c.id !== FREE_CATEGORY_ID);
  const lockedWordCount = lockedCategories.reduce(
    (sum, c) => sum + c.levels.reduce((s, l) => s + l.words.length, 0),
    0
  );

  return (
    <main className="min-h-dvh bg-[#1A1C3A] px-4 py-8 flex items-center justify-center">
      <div className="max-w-md w-full">
        <Link href="/" className="flex items-center gap-2 mb-8 justify-center">
          <Moon size={22} color="#8B85FF" />
          <span className="font-display text-xl text-[#EDEBFF]">Voco</span>
        </Link>

        {(status === "checking" || status === "verifying") && (
          <div className="text-center">
            <Sparkles size={28} color="#8B85FF" className="mx-auto mb-3" />
            <p className="text-[#EDEBFF]">
              {status === "verifying" ? "Verifying your subscription..." : "One moment..."}
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-[#8B85FF] flex items-center justify-center mx-auto mb-4">
              <Check size={26} color="#14152B" />
            </div>
            <p className="font-display text-xl text-[#EDEBFF] mb-2">You're unlocked</p>
            <p className="text-sm text-[#9B97C4] mb-6">
              Every category is now available on this device.
            </p>
            <Link
              href="/"
              className="block w-full rounded-xl px-4 py-3 font-medium text-center"
              style={{ backgroundColor: "#8B85FF", color: "#14152B" }}
            >
              Back to Voco
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-[#20223F] flex items-center justify-center mx-auto mb-4">
              <X size={26} color="#FF9B5C" />
            </div>
            <p className="font-display text-xl text-[#EDEBFF] mb-2">Couldn't verify that subscription</p>
            <p className="text-sm text-[#9B97C4] mb-6">
              If you just started your trial, try refreshing this page. Otherwise, start below.
            </p>
            <a
              href={PAYMENT_LINK_URL}
              className="block w-full rounded-xl px-4 py-3 font-medium text-center mb-3"
              style={{ backgroundColor: "#8B85FF", color: "#14152B" }}
            >
              Start {TRIAL_LABEL} — {PRICE_LABEL}
            </a>
            <Link href="/" className="block text-center text-[#8B85FF] text-sm">
              Back home
            </Link>
          </div>
        )}

        {status === "already" && (
          <div className="text-center">
            <Sparkles size={28} color="#8B85FF" className="mx-auto mb-3" />
            <p className="text-[#EDEBFF] mb-2">Everything's already unlocked on this device.</p>
            <Link href="/" className="text-[#8B85FF] text-sm">
              Back home
            </Link>
          </div>
        )}

        {status === "pitch" && (
          <div>
            <div className="text-center mb-6">
              <Lock size={28} color="#8B85FF" className="mx-auto mb-3" />
              <p className="font-display text-xl text-[#EDEBFF] mb-2">Unlock the full course</p>
              <p className="text-sm text-[#9B97C4]">
                {freeCategory ? freeCategory.title : "One category"} stays free. Unlock the other{" "}
                {lockedCategories.length} categories — {lockedWordCount} more words — with a{" "}
                {TRIAL_LABEL}, then {PRICE_LABEL}.
              </p>
            </div>

            <div className="bg-[#20223F] rounded-2xl p-4 mb-6 space-y-2">
              {lockedCategories.map((c) => (
                <div key={c.id} className="flex items-center gap-2 text-sm text-[#EDEBFF]">
                  <Lock size={14} color="#6E699B" />
                  {c.title}
                </div>
              ))}
            </div>

            <a
              href={PAYMENT_LINK_URL}
              className="block w-full rounded-xl px-4 py-3 font-medium text-center mb-3"
              style={{ backgroundColor: "#8B85FF", color: "#14152B" }}
            >
              Start {TRIAL_LABEL}
            </a>
            <p className="text-center text-xs text-[#6E699B] mb-3">
              {PRICE_LABEL} after your trial. Cancel anytime.
            </p>
            <Link href="/" className="block text-center text-[#8B85FF] text-sm">
              Not yet — back home
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, Flag, Check, X } from "lucide-react";
import { getCourse } from "@/lib/wordbanks";
import { isSubscribedCached, shouldRefreshStatus, refreshSubscriptionStatus } from "@/lib/purchase";
import {
  buildPracticeTest,
  scorePracticeTest,
  MODULE_QUESTION_COUNT,
  MODULE_COUNT,
  MODULE_DURATION_MS,
} from "@/lib/practiceTest";
import { recordPracticeTestAttempt, getUsedQuestionIds } from "@/lib/practiceTestProgress";
import QuizResults from "@/components/QuizResults";

// Timed, simulated Reading & Writing practice test — see lib/practiceTest.js
// for the question-selection algorithm and format source. This page owns the
// timed session itself: intro -> Module 1 -> transition -> Module 2 ->
// results, all in-memory (a reload mid-test starts a brand-new test, the
// same "doesn't survive a reload" tradeoff every other quiz on this site
// already has — nothing here was persisted before, either).
//
// Deliberately entirely paid (lib/purchase.js has no free-sample carve-out
// for this route) — see PracticeTestTab.js and CLAUDE.md for why.
//
// Deliberately withholds per-question correct/wrong feedback WHILE the test
// is in progress — selecting an option just records the choice, unlike every
// other quiz on this site, which marks it right or wrong immediately. This
// is the one place that instant-feedback pattern is intentionally broken:
// the real Digital SAT gives no in-test feedback at all, and realism is this
// feature's whole point. Everything (score, breakdown, and a full per-
// question review) is revealed together at the end.

// Options are listed correct-first in the data (correctIndex: 0); shuffle the
// display order on the client only, after mount, so the server and first
// client render match — same approach as every other quiz on this site.
function shuffledIndices(count) {
  const order = Array.from({ length: count }, (_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

function formatClock(ms) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

// Splits on the ______ blank the same way components in app/passages/ do,
// for passage paragraph text specifically (vocab sentences are shown as
// plain text, matching how the ordinary vocabulary quiz renders them).
function PassageParagraph({ paragraph }) {
  const parts = paragraph.split("______");
  return (
    <p className="font-display text-[16px] leading-[1.7] text-[#3D2B4F] mb-3 last:mb-0">
      {parts.map((part, i) => (
        <span key={i}>
          {part}
          {i < parts.length - 1 && (
            <span
              role="img"
              aria-label="blank"
              className="inline-block w-16 border-b-2 border-[#3D2B4F] mx-1 align-baseline"
            >
              &nbsp;
            </span>
          )}
        </span>
      ))}
    </p>
  );
}

const POOL_LABEL = { vocab: "Vocabulary", passage: "Reading", grammar: "Grammar" };

export default function PracticeTestPage() {
  const router = useRouter();
  const course = getCourse("sat-vocab");
  const [subscribed, setSubscribed] = useState(null); // null = not checked yet

  const [phase, setPhase] = useState("loading"); // loading -> intro -> module -> transition -> results
  const [test, setTest] = useState(null);
  const [moduleIndex, setModuleIndex] = useState(0);
  const [current, setCurrent] = useState(0); // question index within the current module
  const [answers, setAnswers] = useState({}); // { [questionId]: selectedIndex }
  const [flagged, setFlagged] = useState(() => new Set());
  const [confirmingSubmit, setConfirmingSubmit] = useState(false);
  const [moduleEndsAt, setModuleEndsAt] = useState(null);
  const [remainingMs, setRemainingMs] = useState(MODULE_DURATION_MS);
  const [finalResult, setFinalResult] = useState(null);
  const [order, setOrder] = useState([0, 1, 2, 3]);
  const submittedRef = useRef(false); // guards against double-submitting a module (timeout racing a manual click)

  useEffect(() => {
    setSubscribed(isSubscribedCached());
    if (shouldRefreshStatus()) refreshSubscriptionStatus().then(setSubscribed);
  }, []);

  const locked = subscribed === false;
  useEffect(() => {
    if (locked) router.replace("/unlock");
  }, [locked, router]);

  // Build the test once subscription is confirmed — before the intro screen,
  // so it can honestly say up front whether this attempt will reuse any
  // earlier questions, not just after committing to it.
  useEffect(() => {
    if (subscribed === true && !test) {
      const used = getUsedQuestionIds();
      setTest(buildPracticeTest(course, used));
      setPhase("intro");
    }
  }, [subscribed, test, course]);

  const moduleQuestions = test ? test.modules[moduleIndex] : [];
  const q = moduleQuestions[current];

  useEffect(() => {
    setOrder(shuffledIndices(4));
  }, [q?.id]);

  const submitModule = useCallback(() => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    if (moduleIndex + 1 < MODULE_COUNT) {
      setModuleIndex((m) => m + 1);
      setCurrent(0);
      setConfirmingSubmit(false);
      setPhase("transition");
      submittedRef.current = false;
    } else {
      const result = scorePracticeTest(test.questions, answers);
      recordPracticeTestAttempt({
        score: result.correct,
        total: result.total,
        byType: result.byType,
        questionIds: test.questions.map((qq) => qq.id),
        reused: test.reusedCounts.vocab + test.reusedCounts.passages + test.reusedCounts.grammar > 0,
      });
      setFinalResult(result);
      setPhase("results");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleIndex, test, answers]);

  // Countdown: recomputed from an absolute end timestamp every tick, not
  // decremented, so a throttled background tab can't drift — the moment the
  // tab regains focus (or the next tick fires) the display and the auto-
  // submit trigger are both correct regardless of how many ticks were missed.
  useEffect(() => {
    if (phase !== "module" || !moduleEndsAt) return;
    const tick = () => {
      const left = moduleEndsAt - Date.now();
      setRemainingMs(Math.max(0, left));
      if (left <= 0) submitModule();
    };
    tick();
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, [phase, moduleEndsAt, submitModule]);

  function beginModule() {
    submittedRef.current = false;
    setModuleEndsAt(Date.now() + MODULE_DURATION_MS);
    setRemainingMs(MODULE_DURATION_MS);
    setPhase("module");
  }

  function selectAnswer(idx) {
    setAnswers((a) => ({ ...a, [q.id]: idx }));
  }

  function toggleFlag() {
    setFlagged((f) => {
      const next = new Set(f);
      if (next.has(q.id)) next.delete(q.id);
      else next.add(q.id);
      return next;
    });
  }

  function goTo(i) {
    setCurrent(i);
    setConfirmingSubmit(false);
  }

  const answeredInModule = moduleQuestions.filter((mq) => answers[mq.id] !== undefined).length;

  function handleSubmitClick() {
    if (answeredInModule < moduleQuestions.length && !confirmingSubmit) {
      setConfirmingSubmit(true);
      return;
    }
    submitModule();
  }

  if (subscribed === null || locked || phase === "loading") return null;

  return (
    <main className="min-h-dvh bg-[#1A1C3A] px-4 py-8">
      <div className="max-w-md mx-auto">
        {phase !== "module" && (
          <Link href={`/courses/${course.id}?section=practice-test`} className="flex items-center gap-1 text-xs text-[#9B97C4] mb-6">
            <ArrowLeft size={14} /> Back
          </Link>
        )}

        {phase === "intro" && <IntroScreen test={test} onBegin={beginModule} />}

        {phase === "module" && (
          <ModuleScreen
            moduleIndex={moduleIndex}
            remainingMs={remainingMs}
            question={q}
            order={order}
            current={current}
            total={moduleQuestions.length}
            selected={answers[q.id]}
            flagged={flagged.has(q.id)}
            answeredIds={answers}
            flaggedIds={flagged}
            questions={moduleQuestions}
            onSelect={selectAnswer}
            onToggleFlag={toggleFlag}
            onGoTo={goTo}
            onPrev={() => goTo(Math.max(0, current - 1))}
            onNext={() => goTo(Math.min(moduleQuestions.length - 1, current + 1))}
            confirmingSubmit={confirmingSubmit}
            answeredCount={answeredInModule}
            onSubmitClick={handleSubmitClick}
            onCancelSubmit={() => setConfirmingSubmit(false)}
          />
        )}

        {phase === "transition" && <TransitionScreen onContinue={beginModule} />}

        {phase === "results" && test && finalResult && (
          <ResultsScreen test={test} result={finalResult} answers={answers} courseId={course.id} />
        )}
      </div>
    </main>
  );
}

function IntroScreen({ test, onBegin }) {
  const reusedTotal = test ? test.reusedCounts.vocab + test.reusedCounts.passages + test.reusedCounts.grammar : 0;
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Clock size={22} color="#8B85FF" />
        <h1 className="font-display text-2xl text-[#EDEBFF]">Practice Test</h1>
      </div>
      <p className="text-sm text-[#9B97C4] mb-4 leading-relaxed">
        A timed, simulated Reading & Writing section: {test ? test.questions.length : MODULE_QUESTION_COUNT * MODULE_COUNT}{" "}
        questions across {MODULE_COUNT} modules of {MODULE_QUESTION_COUNT}, {Math.round(MODULE_DURATION_MS / 60000)} minutes
        each, mixing vocabulary, reading passages, and grammar.
      </p>
      <div className="rounded-2xl p-4 bg-[#20223F] mb-4 space-y-2 text-sm text-[#C9C5EC]">
        <p>• Each module has its own timer. Time left in Module 1 doesn't carry over to Module 2.</p>
        <p>• Move freely between questions in a module — skip ahead, come back, flag one to revisit — before submitting.</p>
        <p>• You won't see whether an answer is right or wrong until both modules are done, the same as the real test.</p>
        <p>• If a module's timer runs out, whatever's answered is submitted automatically.</p>
      </div>
      <p className="text-xs text-[#6E699B] mb-4">
        This gives you a raw score and a breakdown by question type — it isn't a predicted SAT score, which needs official
        scoring this app doesn't have.
      </p>
      {reusedTotal > 0 && (
        <p className="text-xs text-[#FF9B5C] mb-4">
          This attempt reuses {reusedTotal} question{reusedTotal !== 1 ? "s" : ""} from earlier practice tests
          {test.reusedCounts.passages > 0 || test.reusedCounts.grammar > 0
            ? " — passages and grammar have smaller pools than vocabulary, so they cycle back sooner."
            : "."}
        </p>
      )}
      <button
        onClick={onBegin}
        className="w-full rounded-xl px-4 py-3 font-medium"
        style={{ backgroundColor: "#8B85FF", color: "#14152B" }}
      >
        Begin Module 1
      </button>
    </div>
  );
}

function TransitionScreen({ onContinue }) {
  return (
    <div className="text-center pt-10">
      <Check size={28} color="#7BC9A0" className="mx-auto mb-3" />
      <p className="font-display text-xl text-[#EDEBFF] mb-2">Module 1 complete</p>
      <p className="text-sm text-[#9B97C4] mb-8">
        Time remaining in Module 1 doesn't carry over. Module 2 gets its own fresh 32-minute timer.
      </p>
      <button
        onClick={onContinue}
        className="w-full rounded-xl px-4 py-3 font-medium"
        style={{ backgroundColor: "#8B85FF", color: "#14152B" }}
      >
        Begin Module 2
      </button>
    </div>
  );
}

function QuestionNav({ questions, current, answeredIds, flaggedIds, onGoTo }) {
  return (
    <div className="grid grid-cols-9 gap-1.5 mb-4">
      {questions.map((qq, i) => {
        const isAnswered = answeredIds[qq.id] !== undefined;
        const isFlagged = flaggedIds.has(qq.id);
        const isCurrent = i === current;
        let style = "bg-[#20223F] text-[#9B97C4]";
        if (isCurrent) style = "bg-[#8B85FF] text-[#14152B]";
        else if (isAnswered) style = "bg-[#8B85FF33] text-[#EDEBFF]";
        return (
          <button
            key={qq.id}
            onClick={() => onGoTo(i)}
            aria-current={isCurrent ? "true" : undefined}
            aria-label={`Question ${i + 1}${isAnswered ? ", answered" : ", unanswered"}${isFlagged ? ", flagged" : ""}`}
            className={`relative aspect-square rounded-lg text-xs font-medium ${style}`}
          >
            {i + 1}
            {isFlagged && <Flag size={8} color="#FF9B5C" fill="#FF9B5C" className="absolute top-0.5 right-0.5" />}
          </button>
        );
      })}
    </div>
  );
}

function ModuleScreen({
  moduleIndex,
  remainingMs,
  question,
  order,
  current,
  total,
  selected,
  flagged,
  answeredIds,
  flaggedIds,
  questions,
  onSelect,
  onToggleFlag,
  onGoTo,
  onPrev,
  onNext,
  confirmingSubmit,
  answeredCount,
  onSubmitClick,
  onCancelSubmit,
}) {
  const low = remainingMs < 5 * 60 * 1000;
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs uppercase tracking-wide text-[#9B97C4]">
          Module {moduleIndex + 1} of {MODULE_COUNT} — Question {current + 1} of {total}
        </p>
        <div
          className={`flex items-center gap-1.5 text-sm font-medium tabular-nums ${low ? "text-[#E08A9E]" : "text-[#EDEBFF]"}`}
        >
          <Clock size={14} />
          {formatClock(remainingMs)}
        </div>
      </div>

      <QuestionNav questions={questions} current={current} answeredIds={answeredIds} flaggedIds={flaggedIds} onGoTo={onGoTo} />

      <div className="rounded-2xl p-5 bg-[#20223F] mb-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <p className="text-[10px] uppercase tracking-wide text-[#6E699B]">{POOL_LABEL[question.poolType]}</p>
          <button
            onClick={onToggleFlag}
            className={`flex items-center gap-1 text-xs ${flagged ? "text-[#FF9B5C]" : "text-[#6E699B]"}`}
          >
            <Flag size={12} fill={flagged ? "#FF9B5C" : "none"} />
            {flagged ? "Flagged" : "Flag for review"}
          </button>
        </div>

        {question.poolType === "passage" && (
          <div className="rounded-xl p-4 bg-[#FFF9F2] mb-4">
            <p className="text-[10px] uppercase tracking-wide text-[#8A6E7D] mb-1">{question.passageSubject}</p>
            <p className="font-display text-base text-[#3D2B4F] mb-2">{question.passageTitle}</p>
            {question.passageText.map((para, i) => (
              <PassageParagraph key={i} paragraph={para} />
            ))}
          </div>
        )}

        <p className="text-xs text-[#9B97C4] mb-2">{question.prompt}</p>
        {question.poolType === "vocab" && (
          <p className="font-display text-base mb-3 text-[#EDEBFF] leading-relaxed">{question.sentence}</p>
        )}

        <div className="space-y-2">
          {order.map((idx) => (
            <button
              key={idx}
              onClick={() => onSelect(idx)}
              className={`w-full text-left rounded-xl px-4 py-3 border ${
                selected === idx ? "border-[#8B85FF] bg-[#8B85FF1A]" : "border-[#ffffff26] bg-transparent"
              } text-[#EDEBFF]`}
            >
              {question.options[idx]}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 mb-3">
        <button
          onClick={onPrev}
          disabled={current === 0}
          className="flex-1 text-center text-sm rounded-xl px-3 py-2 border border-[#ffffff26] text-[#EDEBFF] disabled:opacity-40"
        >
          Previous
        </button>
        <button
          onClick={onNext}
          disabled={current === total - 1}
          className="flex-1 text-center text-sm rounded-xl px-3 py-2 border border-[#ffffff26] text-[#EDEBFF] disabled:opacity-40"
        >
          Next
        </button>
      </div>

      {confirmingSubmit ? (
        <div className="rounded-2xl p-4 bg-[#20223F] text-center">
          <p className="text-sm text-[#EDEBFF] mb-3">
            {total - answeredCount} question{total - answeredCount !== 1 ? "s" : ""} unanswered. Submit anyway?
          </p>
          <div className="flex gap-2">
            <button onClick={onCancelSubmit} className="flex-1 text-sm rounded-xl px-3 py-2 border border-[#ffffff26] text-[#EDEBFF]">
              Keep going
            </button>
            <button
              onClick={onSubmitClick}
              className="flex-1 text-sm rounded-xl px-3 py-2 font-medium"
              style={{ backgroundColor: "#FF9B5C", color: "#14152B" }}
            >
              Submit module
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={onSubmitClick}
          className="w-full rounded-xl px-4 py-3 font-medium"
          style={{ backgroundColor: "#8B85FF", color: "#14152B" }}
        >
          Submit Module {moduleIndex + 1} ({answeredCount}/{total} answered)
        </button>
      )}
    </div>
  );
}

function ResultsScreen({ test, result, answers, courseId }) {
  const [showReview, setShowReview] = useState(false);
  return (
    <div className="text-center">
      <QuizResults
        score={result.correct}
        total={result.total}
        copy={{
          perfect: { headline: "Every question right.", note: "A raw score, not a predicted SAT score." },
          good: { headline: "A strong pass.", note: "A raw score, not a predicted SAT score." },
          watch: { headline: "Worth another pass.", note: "A raw score, not a predicted SAT score." },
        }}
      >
        <div className="mt-5 text-left rounded-2xl p-4 bg-[#20223F]">
          <p className="text-xs uppercase tracking-wide text-[#9B97C4] mb-3">By question type</p>
          {["vocab", "passages", "grammar"].map((key) => {
            const b = result.byType[key];
            const pct = b.total > 0 ? Math.round((b.correct / b.total) * 100) : 0;
            return (
              <div key={key} className="mb-2 last:mb-0">
                <div className="flex justify-between text-sm text-[#EDEBFF] mb-1">
                  <span className="capitalize">{key === "vocab" ? "Vocabulary" : key === "passages" ? "Passages" : "Grammar"}</span>
                  <span>
                    {b.correct}/{b.total}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-[#ffffff14] overflow-hidden">
                  <div className="h-full rounded-full bg-[#8B85FF]" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
          <p className="text-xs text-[#6E699B] mt-3">{result.answered} of {result.total} questions answered.</p>
        </div>
      </QuizResults>

      <button onClick={() => setShowReview((s) => !s)} className="mt-4 text-sm text-[#8B85FF]">
        {showReview ? "Hide" : "Review"} your answers
      </button>

      {showReview && (
        <div className="mt-4 text-left space-y-3">
          {test.questions.map((qq, i) => {
            const sel = answers[qq.id];
            const correct = sel === qq.correctIndex;
            return (
              <div key={qq.id} className="rounded-2xl p-4 bg-[#20223F]">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] uppercase tracking-wide text-[#6E699B]">
                    Q{i + 1} · {POOL_LABEL[qq.poolType]} · {qq.sourceLabel}
                  </p>
                  {sel === undefined ? (
                    <span className="text-[10px] text-[#6E699B]">Unanswered</span>
                  ) : correct ? (
                    <Check size={14} color="#7BC9A0" />
                  ) : (
                    <X size={14} color="#E08A9E" />
                  )}
                </div>
                {qq.poolType === "vocab" && <p className="text-sm text-[#EDEBFF] mb-2">{qq.sentence}</p>}
                <p className="text-sm text-[#9B97C4] mb-2">
                  Correct answer: <span className="text-[#EDEBFF]">{qq.options[qq.correctIndex]}</span>
                  {sel !== undefined && !correct && (
                    <>
                      {" "}
                      · Your answer: <span className="text-[#E08A9E]">{qq.options[sel]}</span>
                    </>
                  )}
                </p>
                <p className="text-xs text-[#6E699B]">{qq.explanation}</p>
              </div>
            );
          })}
        </div>
      )}

      <Link
        href={`/courses/${courseId}?section=practice-test`}
        className="block mt-6 w-full text-center rounded-xl px-4 py-3 font-medium"
        style={{ backgroundColor: "#8B85FF", color: "#14152B" }}
      >
        Done
      </Link>
    </div>
  );
}

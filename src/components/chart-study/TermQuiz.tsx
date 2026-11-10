"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import type { QuizQuestion } from "@/lib/chart-study/lessons";
import { recordTermAnswer, useProgress } from "@/lib/chart-study/progress";
import {
  termCategoryLabels,
  termQuestions,
  type TermCategory,
  type TermQuestion,
} from "@/lib/chart-study/terms";
import QuizView, { buttonGhost, buttonPrimary } from "./QuizView";

const SET_SIZE = 10;

type Filter = TermCategory | "all";
type Mode = { kind: "normal"; filter: Filter } | { kind: "review" };

type PlayQuestion = QuizQuestion & { id: string; category: TermCategory; answer: string };

type Phase =
  | { kind: "start" }
  | {
      kind: "play";
      mode: Mode;
      questions: PlayQuestion[];
      index: number;
      selected: number | null;
      results: boolean[];
    }
  | { kind: "result"; mode: Mode; questions: PlayQuestion[]; results: boolean[] };

function shuffle<T>(items: readonly T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function toPlayQuestion(q: TermQuestion): PlayQuestion {
  const choices = shuffle([q.answer, ...q.wrong]);
  return {
    id: q.id,
    category: q.category,
    answer: q.answer,
    question: q.question,
    choices,
    answerIndex: choices.indexOf(q.answer),
    explanation: q.explanation,
  };
}

function pool(filter: Filter) {
  return filter === "all" ? termQuestions : termQuestions.filter((q) => q.category === filter);
}

const filters: { value: Filter; label: string }[] = [
  { value: "all", label: "すべて" },
  { value: "chart", label: termCategoryLabels.chart },
  { value: "basics", label: termCategoryLabels.basics },
];

export default function TermQuiz() {
  const progress = useProgress();
  const [filter, setFilter] = useState<Filter>("all");
  const [phase, setPhase] = useState<Phase>({ kind: "start" });
  const topRef = useRef<HTMLDivElement>(null);

  const reviewQuestions = termQuestions.filter((q) => progress.termQuiz.wrongIds.includes(q.id));

  function go(next: Phase) {
    setPhase(next);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function start(mode: Mode) {
    const source = mode.kind === "review" ? reviewQuestions : pool(mode.filter);
    if (source.length === 0) return;
    const questions = shuffle(source).slice(0, SET_SIZE).map(toPlayQuestion);
    go({ kind: "play", mode, questions, index: 0, selected: null, results: [] });
  }

  function answer(choice: number) {
    if (phase.kind !== "play" || phase.selected !== null) return;
    const q = phase.questions[phase.index];
    const correct = choice === q.answerIndex;
    recordTermAnswer(q.id, correct);
    setPhase({ ...phase, selected: choice, results: [...phase.results, correct] });
  }

  function next() {
    if (phase.kind !== "play") return;
    if (phase.index + 1 < phase.questions.length) {
      go({ ...phase, index: phase.index + 1, selected: null });
    } else {
      go({ kind: "result", mode: phase.mode, questions: phase.questions, results: phase.results });
    }
  }

  const { answered, correct } = progress.termQuiz;

  return (
    <div ref={topRef} className="scroll-mt-6">
      {phase.kind === "start" && (
        <section>
          <h2 className="font-display text-xl font-bold text-brand-navy">出題する分野</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3" role="radiogroup" aria-label="出題する分野">
            {filters.map((f) => {
              const active = filter === f.value;
              return (
                <button
                  key={f.value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setFilter(f.value)}
                  className={`min-h-14 rounded-2xl border-2 px-4 py-3 text-left transition ${
                    active
                      ? "border-brand-orange bg-brand-cream"
                      : "border-brand-navy/15 bg-white hover:border-brand-orange/60"
                  }`}
                >
                  <span className="flex items-center gap-2 font-bold text-brand-navy">
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                        active ? "border-brand-orange" : "border-brand-navy/30"
                      }`}
                      aria-hidden
                    >
                      {active && <span className="h-2.5 w-2.5 rounded-full bg-brand-orange" />}
                    </span>
                    {f.label}
                  </span>
                  <span className="mt-1 block pl-7 text-xs text-brand-navy/55">
                    全{pool(f.value).length}問
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              className={buttonPrimary}
              onClick={() => start({ kind: "normal", filter })}
            >
              {Math.min(SET_SIZE, pool(filter).length)}問チャレンジ →
            </button>
            <button
              type="button"
              className={buttonGhost}
              onClick={() => start({ kind: "review" })}
              disabled={reviewQuestions.length === 0}
              style={reviewQuestions.length === 0 ? { opacity: 0.45, cursor: "not-allowed" } : undefined}
            >
              {reviewQuestions.length > 0
                ? `間違えた問題を復習（${reviewQuestions.length}問）`
                : "復習する問題はありません"}
            </button>
          </div>

          <div className="mt-8 rounded-2xl bg-brand-cream p-5 text-sm text-brand-navy/75">
            {answered > 0 ? (
              <p>
                これまでに <strong>{answered}</strong> 問に回答、正答率{" "}
                <strong className="text-brand-orange-deep">{Math.round((correct / answered) * 100)}%</strong>
              </p>
            ) : (
              <p>1セット{SET_SIZE}問、ランダムに出題します。間違えた問題は「復習」でもう一度解けます。</p>
            )}
          </div>
        </section>
      )}

      {phase.kind === "play" && (
        <>
          <div className="mb-6">
            <div className="flex justify-between text-xs font-semibold text-brand-navy/60">
              <span>{phase.mode.kind === "review" ? "復習モード" : "用語クイズ"}</span>
              <span>
                {phase.index + 1} / {phase.questions.length}
              </span>
            </div>
            <div
              className="mt-2 h-2 overflow-hidden rounded-full bg-brand-navy/10"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={phase.questions.length}
              aria-valuenow={phase.index + 1}
              aria-label="クイズの進み具合"
            >
              <div
                className="h-full rounded-full bg-brand-orange transition-all"
                style={{ width: `${((phase.index + 1) / phase.questions.length) * 100}%` }}
              />
            </div>
          </div>
          <QuizView
            key={phase.questions[phase.index].id}
            question={phase.questions[phase.index]}
            number={phase.index + 1}
            label={termCategoryLabels[phase.questions[phase.index].category]}
            selected={phase.selected}
            onAnswer={answer}
            onNext={next}
            isLast={phase.index + 1 === phase.questions.length}
          />
        </>
      )}

      {phase.kind === "result" && (
        <ResultView
          questions={phase.questions}
          results={phase.results}
          reviewCount={reviewQuestions.length}
          onRetry={() => start(phase.mode.kind === "review" ? { kind: "normal", filter } : phase.mode)}
          onReview={() => start({ kind: "review" })}
          onBack={() => go({ kind: "start" })}
        />
      )}
    </div>
  );
}

function ResultView({
  questions,
  results,
  reviewCount,
  onRetry,
  onReview,
  onBack,
}: {
  questions: PlayQuestion[];
  results: boolean[];
  reviewCount: number;
  onRetry: () => void;
  onReview: () => void;
  onBack: () => void;
}) {
  const score = results.filter(Boolean).length;
  const missed = questions.filter((_, i) => !results[i]);
  const message =
    score === questions.length
      ? "全問正解！ばっちりです。"
      : score / questions.length >= 0.7
        ? "いい調子！間違えた用語だけ見直しておきましょう。"
        : "まだ慣れていない用語があるみたい。復習でもう一度挑戦してみましょう。";

  return (
    <section>
      <div className="rounded-3xl bg-brand-cream p-8 text-center">
        <p className="text-sm font-bold text-brand-navy/60">結果</p>
        <p className="mt-2 font-display text-4xl font-bold text-brand-navy">
          <span className="text-brand-orange-deep">{score}</span>
          <span className="text-2xl"> / {questions.length} 問正解</span>
        </p>
        <p className="mt-3 text-sm text-brand-navy/70">{message}</p>
      </div>

      {missed.length > 0 && (
        <div className="mt-8">
          <h3 className="font-bold text-brand-navy">間違えた問題（復習リストに入りました）</h3>
          <ul className="mt-3 space-y-3">
            {missed.map((q) => (
              <li key={q.id} className="rounded-2xl border border-brand-navy/10 bg-white p-4 text-sm">
                <p className="font-bold text-brand-navy">{q.question}</p>
                <p className="mt-1 text-brand-navy/80">
                  <span className="font-bold text-[#2e7d4f]">答え：</span>
                  {q.answer}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        {reviewCount > 0 && (
          <button type="button" className={buttonPrimary} onClick={onReview}>
            間違えた問題を復習（{reviewCount}問）
          </button>
        )}
        <button
          type="button"
          className={reviewCount > 0 ? buttonGhost : buttonPrimary}
          onClick={onRetry}
        >
          別の問題に挑戦
        </button>
        <button type="button" className={buttonGhost} onClick={onBack}>
          分野を選びなおす
        </button>
        <Link href="/money/chart-study" className={buttonGhost}>
          学習トップへ
        </Link>
      </div>
    </section>
  );
}

"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import type { LessonStep, QuizQuestion } from "@/lib/chart-study/lessons";
import { markLessonComplete } from "@/lib/chart-study/progress";
import ChartVisualView from "./ChartVisualView";
import QuizView, { buttonGhost, buttonPrimary } from "./QuizView";

type Phase =
  | { kind: "step"; index: number }
  | { kind: "quiz"; index: number; selected: number | null }
  | { kind: "done" };


export default function LessonPlayer({
  slug,
  steps,
  quiz,
  next,
}: {
  slug: string;
  steps: LessonStep[];
  quiz: QuizQuestion[];
  next?: { slug: string; title: string; available: boolean };
}) {
  const [phase, setPhase] = useState<Phase>({ kind: "step", index: 0 });
  const [correctCount, setCorrectCount] = useState(0);
  const topRef = useRef<HTMLDivElement>(null);

  const totalScreens = steps.length + quiz.length;
  const currentScreen =
    phase.kind === "step"
      ? phase.index + 1
      : phase.kind === "quiz"
        ? steps.length + phase.index + 1
        : totalScreens;

  function go(nextPhase: Phase) {
    setPhase(nextPhase);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function answer(choice: number) {
    if (phase.kind !== "quiz" || phase.selected !== null) return;
    if (choice === quiz[phase.index].answerIndex) setCorrectCount((c) => c + 1);
    setPhase({ ...phase, selected: choice });
  }

  function afterQuestion() {
    if (phase.kind !== "quiz") return;
    if (phase.index + 1 < quiz.length) {
      go({ kind: "quiz", index: phase.index + 1, selected: null });
    } else {
      markLessonComplete(slug);
      go({ kind: "done" });
    }
  }

  function restart() {
    setCorrectCount(0);
    go({ kind: "step", index: 0 });
  }

  return (
    <div ref={topRef} className="scroll-mt-6">
      <div className="mb-6">
        <div className="flex justify-between text-xs font-semibold text-brand-navy/60">
          <span>
            {phase.kind === "step" ? "解説" : phase.kind === "quiz" ? "確認問題" : "完了"}
          </span>
          <span>
            {currentScreen} / {totalScreens}
          </span>
        </div>
        <div
          className="mt-2 h-2 overflow-hidden rounded-full bg-brand-navy/10"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={totalScreens}
          aria-valuenow={currentScreen}
          aria-label="レッスンの進み具合"
        >
          <div
            className="h-full rounded-full bg-brand-orange transition-all"
            style={{ width: `${(currentScreen / totalScreens) * 100}%` }}
          />
        </div>
      </div>

      {phase.kind === "step" && (
        <section>
          <h2 className="font-display text-2xl font-bold text-brand-navy">
            {steps[phase.index].title}
          </h2>
          {steps[phase.index].visual && (
            <div className="mt-5">
              <ChartVisualView visual={steps[phase.index].visual!} />
            </div>
          )}
          <div className="mt-5 space-y-3 leading-relaxed text-brand-navy/85">
            {steps[phase.index].body.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          <div className="mt-8 flex justify-between gap-3">
            <button
              type="button"
              className={buttonGhost}
              onClick={() => go({ kind: "step", index: phase.index - 1 })}
              disabled={phase.index === 0}
              style={{ visibility: phase.index === 0 ? "hidden" : "visible" }}
            >
              ← 前へ
            </button>
            <button
              type="button"
              className={buttonPrimary}
              onClick={() =>
                phase.index + 1 < steps.length
                  ? go({ kind: "step", index: phase.index + 1 })
                  : quiz.length > 0
                    ? go({ kind: "quiz", index: 0, selected: null })
                    : (markLessonComplete(slug), go({ kind: "done" }))
              }
            >
              {phase.index + 1 < steps.length
                ? "次へ →"
                : quiz.length > 0
                  ? "確認問題へ →"
                  : "レッスンを終える"}
            </button>
          </div>
        </section>
      )}

      {phase.kind === "quiz" && (
        <QuizView
          question={quiz[phase.index]}
          number={phase.index + 1}
          selected={phase.selected}
          onAnswer={answer}
          onNext={afterQuestion}
          isLast={phase.index + 1 === quiz.length}
        />
      )}

      {phase.kind === "done" && (
        <section className="rounded-3xl bg-brand-cream p-8 text-center">
          <p className="text-4xl" aria-hidden>
            🎉
          </p>
          <h2 className="mt-3 font-display text-2xl font-bold text-brand-navy">
            レッスン完了！
          </h2>
          {quiz.length > 0 && (
            <>
              <p className="mt-3 text-brand-navy/80">
                確認問題 {quiz.length} 問中{" "}
                <strong className="text-brand-orange-deep">{correctCount} 問</strong> 正解
              </p>
              <p className="mt-2 text-sm text-brand-navy/60">
                {correctCount === quiz.length
                  ? "全問正解、すばらしい！"
                  : "間違えたところは、もう一度レッスンを見返すと定着しますよ。"}
              </p>
            </>
          )}
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            {next?.available ? (
              <Link href={`/money/chart-study/lessons/${next.slug}`} className={buttonPrimary}>
                次のレッスン「{next.title}」へ
              </Link>
            ) : (
              <Link href="/money/chart-study/lessons" className={buttonPrimary}>
                レッスン一覧へ
              </Link>
            )}
            <button type="button" className={buttonGhost} onClick={restart}>
              もう一度見る
            </button>
          </div>
          {next && !next.available && (
            <p className="mt-4 text-xs text-brand-navy/55">
              次のレッスン「{next.title}」は準備中です。
            </p>
          )}
        </section>
      )}
    </div>
  );
}

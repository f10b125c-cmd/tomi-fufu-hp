"use client";

import type { QuizQuestion } from "@/lib/chart-study/lessons";
import ChartVisualView from "./ChartVisualView";

export const buttonPrimary =
  "inline-flex min-h-11 items-center justify-center rounded-full bg-brand-orange px-6 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-40";
export const buttonGhost =
  "inline-flex min-h-11 items-center justify-center rounded-full border border-brand-navy/15 bg-white px-6 py-3 text-sm font-semibold text-brand-navy hover:bg-brand-cream";

/** 4択問題1問分の表示（回答後に正誤と解説を出す）。レッスンの確認問題・用語クイズで共用 */
export default function QuizView({
  question,
  number,
  label,
  selected,
  onAnswer,
  onNext,
  isLast,
}: {
  question: QuizQuestion;
  number: number;
  /** 問題番号の横に出す補足（カテゴリ名など） */
  label?: string;
  selected: number | null;
  onAnswer: (choice: number) => void;
  onNext: () => void;
  isLast: boolean;
}) {
  const answered = selected !== null;
  const isCorrect = selected === question.answerIndex;

  return (
    <section>
      <p className="text-sm font-bold tracking-[0.15em] text-brand-orange">
        Q{number}
        {label && <span className="ml-2 text-xs tracking-normal text-brand-navy/50">{label}</span>}
      </p>
      <h2 className="mt-2 font-display text-xl font-bold text-brand-navy">{question.question}</h2>
      {question.visual && (
        <div className="mt-5">
          <ChartVisualView visual={question.visual} />
        </div>
      )}
      <ul className="mt-5 space-y-3">
        {question.choices.map((choice, i) => {
          const isAnswer = i === question.answerIndex;
          const isSelected = i === selected;
          let style = "border-brand-navy/15 bg-white hover:border-brand-orange";
          let mark = "";
          if (answered) {
            if (isAnswer) {
              style = "border-[#2e9d5b] bg-[#eaf7ef]";
              mark = "○ 正解";
            } else if (isSelected) {
              style = "border-[#d23f3f] bg-[#fdeeee]";
              mark = "× あなたの回答";
            } else {
              style = "border-brand-navy/10 bg-white opacity-60";
            }
          }
          return (
            <li key={choice}>
              <button
                type="button"
                onClick={() => onAnswer(i)}
                disabled={answered}
                className={`flex min-h-12 w-full items-center justify-between gap-3 rounded-2xl border-2 px-4 py-3 text-left text-brand-navy transition ${style}`}
              >
                <span>{choice}</span>
                {mark && <span className="shrink-0 text-xs font-bold">{mark}</span>}
              </button>
            </li>
          );
        })}
      </ul>

      {answered && (
        <div className="mt-6" aria-live="polite">
          <div className={`rounded-2xl p-5 ${isCorrect ? "bg-[#eaf7ef]" : "bg-[#fdeeee]"}`}>
            <p className="font-bold text-brand-navy">{isCorrect ? "○ 正解！" : "× ざんねん…"}</p>
            <p className="mt-2 text-sm leading-relaxed text-brand-navy/85">{question.explanation}</p>
          </div>
          <div className="mt-6 flex justify-end">
            <button type="button" className={buttonPrimary} onClick={onNext}>
              {isLast ? "結果を見る →" : "次の問題へ →"}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

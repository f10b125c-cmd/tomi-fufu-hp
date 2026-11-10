"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import {
  buildScenario,
  FUTURE_DAYS,
  scenarios,
  VISIBLE_DAYS,
  type BuiltScenario,
  type Direction,
} from "@/lib/chart-study/chartQuiz";
import { getLesson, isAvailable } from "@/lib/chart-study/lessons";
import { recordChartAnswer, useProgress } from "@/lib/chart-study/progress";
import CandleChart, { type ChartLine } from "./CandleChart";
import { DOWN_COLOR, UP_COLOR } from "./colors";
import { buttonGhost, buttonPrimary } from "./QuizView";

const SET_SIZE = 5;
const MA5_COLOR = "#f47b20";
const MA25_COLOR = "#7b5ea7";

type Phase =
  | { kind: "start" }
  | { kind: "play"; set: BuiltScenario[]; index: number; answer: Direction | null; results: boolean[] }
  | { kind: "result"; set: BuiltScenario[]; results: boolean[] };

function shuffle<T>(items: readonly T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** 教科書どおりの問題に、だまし・失敗の問題を必ず1問まぜる */
function pickSet(): BuiltScenario[] {
  const textbook = shuffle(scenarios.filter((s) => s.textbook));
  const tricky = shuffle(scenarios.filter((s) => !s.textbook));
  return shuffle([...textbook.slice(0, SET_SIZE - 1), tricky[0]]).map(buildScenario);
}

function Caution() {
  return (
    <p className="rounded-2xl bg-brand-cream px-4 py-3 text-xs leading-relaxed text-brand-navy/75">
      <strong>⚠ チャートの形だけで、未来が決まるわけではありません。</strong>
      このクイズには、パターン通りにならなかった問題もまぜています。「当てる」より「どこを見るか」を練習しましょう。
    </p>
  );
}

const directionLabel = { up: "上がる", down: "下がる" } as const;

export default function ChartQuiz() {
  const { chartQuiz } = useProgress();
  const [phase, setPhase] = useState<Phase>({ kind: "start" });
  const topRef = useRef<HTMLDivElement>(null);

  function go(next: Phase) {
    setPhase(next);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function start() {
    go({ kind: "play", set: pickSet(), index: 0, answer: null, results: [] });
  }

  function answer(direction: Direction) {
    if (phase.kind !== "play" || phase.answer !== null) return;
    const correct = direction === phase.set[phase.index].actual;
    recordChartAnswer(correct);
    setPhase({ ...phase, answer: direction, results: [...phase.results, correct] });
  }

  function next() {
    if (phase.kind !== "play") return;
    if (phase.index + 1 < phase.set.length) {
      go({ ...phase, index: phase.index + 1, answer: null });
    } else {
      go({ kind: "result", set: phase.set, results: phase.results });
    }
  }

  return (
    <div ref={topRef} className="scroll-mt-6">
      {phase.kind === "start" && (
        <section>
          <h2 className="font-display text-xl font-bold text-brand-navy">遊び方</h2>
          <ol className="mt-4 space-y-2 text-sm leading-relaxed text-brand-navy/85">
            <li>1. 架空の銘柄の、{VISIBLE_DAYS}日分のチャートが表示されます。</li>
            <li>2. この後の{FUTURE_DAYS}日間で、株価が「上がる」か「下がる」かを予想します。</li>
            <li>3. 答えると続きのチャートが表示され、注目すべきだったポイントを解説します。</li>
          </ol>
          <div className="mt-6">
            <Caution />
          </div>
          <button type="button" className={`${buttonPrimary} mt-8 w-full sm:w-auto`} onClick={start}>
            {SET_SIZE}問チャレンジ →
          </button>
          <p className="mt-6 text-sm text-brand-navy/70">
            {chartQuiz.answered > 0 ? (
              <>
                これまでに <strong>{chartQuiz.answered}</strong> 問に回答、正答率{" "}
                <strong className="text-brand-orange-deep">
                  {Math.round((chartQuiz.correct / chartQuiz.answered) * 100)}%
                </strong>
              </>
            ) : (
              `問題は全${scenarios.length}問。1セット${SET_SIZE}問をランダムに出題します。`
            )}
          </p>
        </section>
      )}

      {phase.kind === "play" && (
        <PlayView
          built={phase.set[phase.index]}
          number={phase.index + 1}
          total={phase.set.length}
          answer={phase.answer}
          onAnswer={answer}
          onNext={next}
          isLast={phase.index + 1 === phase.set.length}
        />
      )}

      {phase.kind === "result" && (
        <ResultView set={phase.set} results={phase.results} onRetry={start} />
      )}
    </div>
  );
}

function PlayView({
  built,
  number,
  total,
  answer,
  onAnswer,
  onNext,
  isLast,
}: {
  built: BuiltScenario;
  number: number;
  total: number;
  answer: Direction | null;
  onAnswer: (d: Direction) => void;
  onNext: () => void;
  isLast: boolean;
}) {
  const { scenario, candles, ma5, ma25, labels, changePct, actual } = built;
  const answered = answer !== null;
  const correct = answer === actual;
  const shown = answered ? candles : candles.slice(0, VISIBLE_DAYS);
  const lines: ChartLine[] = scenario.showMA
    ? [
        { values: ma5, color: MA5_COLOR, label: "5日線" },
        { values: ma25, color: MA25_COLOR, label: "25日線", dashed: true },
      ]
    : [];
  const lesson = scenario.lessonSlug ? getLesson(scenario.lessonSlug) : undefined;

  return (
    <section>
      <div className="mb-5">
        <div className="flex justify-between text-xs font-semibold text-brand-navy/60">
          <span>チャート当てクイズ</span>
          <span>
            {number} / {total}
          </span>
        </div>
        <div
          className="mt-2 h-2 overflow-hidden rounded-full bg-brand-navy/10"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={number}
          aria-label="クイズの進み具合"
        >
          <div
            className="h-full rounded-full bg-brand-orange transition-all"
            style={{ width: `${(number / total) * 100}%` }}
          />
        </div>
      </div>

      <p className="text-sm font-bold tracking-[0.15em] text-brand-orange">Q{number}</p>
      <h2 className="mt-1 font-display text-xl font-bold text-brand-navy">
        この後{FUTURE_DAYS}日間で、株価は上がる？下がる？
      </h2>

      <figure className="mt-4 rounded-2xl border border-[#edf0f2] bg-white p-3">
        <CandleChart
          key={answered ? "revealed" : "question"}
          candles={shown}
          slots={VISIBLE_DAYS + FUTURE_DAYS}
          height={scenario.showVolume ? 340 : 300}
          lines={lines.map((l) => ({ ...l, values: l.values.slice(0, shown.length) }))}
          showVolume={scenario.showVolume}
          divider={VISIBLE_DAYS}
          animateFrom={answered ? VISIBLE_DAYS : undefined}
          labels={answered ? labels : []}
          hlines={answered ? scenario.hlines : []}
          ariaLabel={
            answered
              ? `答えのチャート。この後${changePct >= 0 ? "上がった" : "下がった"}`
              : `架空の銘柄の${VISIBLE_DAYS}日分のチャート。右側は隠れている`
          }
        />
        <figcaption className="mt-1 text-center text-xs text-brand-navy/55">
          架空の銘柄のチャート（点線から右が「この後」）
        </figcaption>
      </figure>

      {!answered && (
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onAnswer("up")}
            className="min-h-16 rounded-2xl border-2 bg-white text-lg font-bold transition hover:bg-[#fdeeee]"
            style={{ borderColor: UP_COLOR, color: UP_COLOR }}
          >
            ▲ 上がる
          </button>
          <button
            type="button"
            onClick={() => onAnswer("down")}
            className="min-h-16 rounded-2xl border-2 bg-white text-lg font-bold transition hover:bg-[#eaf1fa]"
            style={{ borderColor: DOWN_COLOR, color: DOWN_COLOR }}
          >
            ▼ 下がる
          </button>
        </div>
      )}

      {answered && (
        <div className="mt-5" aria-live="polite">
          <div className={`rounded-2xl p-5 ${correct ? "bg-[#eaf7ef]" : "bg-[#fdeeee]"}`}>
            <p className="font-bold text-brand-navy">
              {correct ? "○ 正解！" : "× ざんねん…"}
              <span className="ml-2 text-sm font-normal text-brand-navy/70">
                あなたの予想：{directionLabel[answer]}
              </span>
            </p>
            <p className="mt-2 text-sm text-brand-navy/85">
              この後{FUTURE_DAYS}日間で{" "}
              <strong style={{ color: actual === "up" ? UP_COLOR : DOWN_COLOR }}>
                {changePct >= 0 ? "+" : ""}
                {changePct.toFixed(1)}%
              </strong>{" "}
              {actual === "up" ? "上がりました。" : "下がりました。"}
            </p>
          </div>

          <div className="mt-5">
            <p className="flex flex-wrap items-center gap-2 text-xs font-bold text-brand-navy/60">
              注目ポイント
              {!scenario.textbook && (
                <span className="rounded-full bg-brand-yellow px-2 py-0.5 text-brand-navy">
                  パターン通りにならなかった例
                </span>
              )}
            </p>
            <h3 className="mt-1 font-display text-lg font-bold text-brand-navy">{scenario.pattern}</h3>
            <div className="mt-2 space-y-2 text-sm leading-relaxed text-brand-navy/85">
              {scenario.explanation.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
            {lesson && isAvailable(lesson) && (
              <Link
                href={`/money/chart-study/lessons/${lesson.slug}`}
                className="mt-3 inline-block text-sm font-semibold text-brand-blue-deep hover:opacity-70"
              >
                レッスン「{lesson.title}」で復習する →
              </Link>
            )}
          </div>

          <div className="mt-5">
            <Caution />
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

function ResultView({
  set,
  results,
  onRetry,
}: {
  set: BuiltScenario[];
  results: boolean[];
  onRetry: () => void;
}) {
  const score = results.filter(Boolean).length;
  return (
    <section>
      <div className="rounded-3xl bg-brand-cream p-8 text-center">
        <p className="text-sm font-bold text-brand-navy/60">結果</p>
        <p className="mt-2 font-display text-4xl font-bold text-brand-navy">
          <span className="text-brand-orange-deep">{score}</span>
          <span className="text-2xl"> / {set.length} 問正解</span>
        </p>
        <p className="mt-3 text-sm text-brand-navy/70">
          {score === set.length
            ? "全問正解！ただし、本物の相場はもっと気まぐれです。"
            : "当たらなくても大丈夫。どこを見ればよかったかを覚えるのが目的です。"}
        </p>
      </div>

      <ul className="mt-6 space-y-2">
        {set.map((b, i) => (
          <li
            key={b.scenario.id}
            className="flex items-center gap-3 rounded-2xl border border-brand-navy/10 bg-white px-4 py-3 text-sm"
          >
            <span className={`font-bold ${results[i] ? "text-[#2e7d4f]" : "text-[#c03535]"}`}>
              {results[i] ? "○" : "×"}
            </span>
            <span className="flex-1 text-brand-navy">{b.scenario.pattern}</span>
            <span className="shrink-0 text-xs font-bold" style={{ color: b.actual === "up" ? UP_COLOR : DOWN_COLOR }}>
              {b.actual === "up" ? "▲ 上がった" : "▼ 下がった"}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-6">
        <Caution />
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button type="button" className={buttonPrimary} onClick={onRetry}>
          別の問題に挑戦
        </button>
        <Link href="/money/chart-study" className={buttonGhost}>
          学習トップへ
        </Link>
      </div>
    </section>
  );
}

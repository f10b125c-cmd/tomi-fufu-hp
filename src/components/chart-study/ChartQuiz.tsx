"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import {
  buildScenario,
  FUTURE_DAYS,
  levelLabels,
  levelOf,
  poolSize,
  scenarios,
  variantsOf,
  VISIBLE_DAYS,
  type BuiltScenario,
  type Direction,
  type IndicatorKind,
  type QuizLevel,
} from "@/lib/chart-study/chartQuiz";
import { getLesson, isAvailable } from "@/lib/chart-study/lessons";
import { recordChartAnswer, useProgress } from "@/lib/chart-study/progress";
import CandleChart, { INDICATOR_H, type ChartLine, type IndicatorPanel } from "./CandleChart";
import { DOWN_COLOR, UP_COLOR } from "./colors";
import { buttonGhost, buttonPrimary } from "./QuizView";

const SET_SIZE = 5;
const MA5_COLOR = "#f47b20";
const MA25_COLOR = "#7b5ea7";
const BB_COLOR = "#0f8a7e";

/** 1セットにまぜる「パターン通りにならない問題」の数 */
const TRICKY_PER_SET: Record<QuizLevel, number> = { basic: 1, advanced: 2 };

const levelDescriptions: Record<QuizLevel, string> = {
  basic: "トレンド・ダブルボトム・ゴールデンクロスなど、基本のパターン",
  advanced: "RSI・MACD・ボリンジャーバンド、三角持ち合いなどの難しい形、サインの組み合わせ",
};

/** 指標のかんたん解説（上級の問題で、答える前に読める） */
const indicatorHelp: Record<IndicatorKind, { title: string; body: string }> = {
  rsi: {
    title: "RSI ってなに？",
    body: "最近14日間の「上げ幅」と「下げ幅」のバランスを0〜100で表す指標です。70以上は「買われすぎ」、30以下は「売られすぎ」とされます。株価と RSI の動きが食い違う「ダイバージェンス」にも注目します。",
  },
  macd: {
    title: "MACD ってなに？",
    body: "短い期間（12日）と長い期間（26日）の平均の差で、値動きの「勢い」を見る指標です。実線の MACD が点線のシグナルを下から上に抜けると上向き、上から下に抜けると下向きのサインとされます。棒グラフは2本の線の差です。",
  },
  bb: {
    title: "ボリンジャーバンドってなに？",
    body: "20日の平均線の上下に、値動きのばらつき（±2σ）の線を引いたものです。株価はふつうバンドの中に収まりやすいとされます。バンドの幅が狭くなる「スクイーズ」のあとは、大きく動き出すことがあります。",
  },
};

type Phase =
  | { kind: "start" }
  | {
      kind: "play";
      level: QuizLevel;
      set: BuiltScenario[];
      index: number;
      answer: Direction | null;
      results: boolean[];
    }
  | { kind: "result"; level: QuizLevel; set: BuiltScenario[]; results: boolean[] };

function shuffle<T>(items: readonly T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * 教科書どおりの問題に、だまし・失敗の問題を必ずまぜる（初級1問・上級2問）。
 * 1セットの中で同じパターンが重ならないようにパターンを選び、それぞれ形違いをランダムに1つ使う。
 */
function pickSet(level: QuizLevel): BuiltScenario[] {
  const pool = scenarios.filter((s) => levelOf(s) === level);
  const trickyCount = TRICKY_PER_SET[level];
  const textbook = shuffle(pool.filter((s) => s.textbook)).slice(0, SET_SIZE - trickyCount);
  const tricky = shuffle(pool.filter((s) => !s.textbook)).slice(0, trickyCount);
  return shuffle([...textbook, ...tricky]).map((s) => {
    const ks = variantsOf(s);
    return buildScenario(s, ks[Math.floor(Math.random() * ks.length)]);
  });
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
  const progress = useProgress();
  const [level, setLevel] = useState<QuizLevel>("basic");
  const [phase, setPhase] = useState<Phase>({ kind: "start" });
  const topRef = useRef<HTMLDivElement>(null);

  function go(next: Phase) {
    setPhase(next);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function start(selected: QuizLevel = level) {
    go({ kind: "play", level: selected, set: pickSet(selected), index: 0, answer: null, results: [] });
  }

  function answer(direction: Direction) {
    if (phase.kind !== "play" || phase.answer !== null) return;
    const correct = direction === phase.set[phase.index].actual;
    recordChartAnswer(correct, phase.level);
    setPhase({ ...phase, answer: direction, results: [...phase.results, correct] });
  }

  function next() {
    if (phase.kind !== "play") return;
    if (phase.index + 1 < phase.set.length) {
      go({ ...phase, index: phase.index + 1, answer: null });
    } else {
      go({ kind: "result", level: phase.level, set: phase.set, results: phase.results });
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

          <h2 className="mt-8 font-display text-xl font-bold text-brand-navy">難易度</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="難易度">
            {(["basic", "advanced"] as const).map((lv) => {
              const active = level === lv;
              const stats = lv === "advanced" ? progress.chartQuizAdvanced : progress.chartQuiz;
              return (
                <button
                  key={lv}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setLevel(lv)}
                  className={`min-h-14 rounded-2xl border-2 px-4 py-3 text-left transition ${
                    active
                      ? "border-brand-orange bg-brand-cream"
                      : "border-brand-navy/15 bg-white hover:border-brand-orange/60"
                  }`}
                >
                  <span className="flex items-center gap-2 font-bold text-brand-navy">
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                        active ? "border-brand-orange" : "border-brand-navy/30"
                      }`}
                      aria-hidden
                    >
                      {active && <span className="h-2.5 w-2.5 rounded-full bg-brand-orange" />}
                    </span>
                    {levelLabels[lv]}
                    <span className="text-xs font-normal text-brand-navy/55">
                      全{poolSize(lv).questions}問（{poolSize(lv).patterns}パターン）
                    </span>
                  </span>
                  <span className="mt-1 block pl-7 text-xs leading-relaxed text-brand-navy/65">
                    {levelDescriptions[lv]}
                  </span>
                  {stats.answered > 0 && (
                    <span className="mt-1 block pl-7 text-xs text-brand-navy/55">
                      正答率 {Math.round((stats.correct / stats.answered) * 100)}%（{stats.answered}問）
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {level === "advanced" && (
            <div className="mt-4 space-y-2">
              <p className="text-xs text-brand-navy/60">上級で使う指標（問題を解きながら見返せます）</p>
              {(Object.keys(indicatorHelp) as IndicatorKind[]).map((k) => (
                <IndicatorHelp key={k} kind={k} />
              ))}
            </div>
          )}

          <div className="mt-6">
            <Caution />
          </div>
          <button type="button" className={`${buttonPrimary} mt-8 w-full sm:w-auto`} onClick={() => start()}>
            {levelLabels[level]}・{SET_SIZE}問チャレンジ →
          </button>
          <p className="mt-4 text-xs text-brand-navy/55">
            1セット{SET_SIZE}問をランダムに出題。パターン通りにならない問題を、初級は1問・上級は2問まぜています。
          </p>
        </section>
      )}

      {phase.kind === "play" && (
        <PlayView
          level={phase.level}
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
        <ResultView
          level={phase.level}
          set={phase.set}
          results={phase.results}
          onRetry={() => start(phase.level)}
        />
      )}
    </div>
  );
}

function IndicatorHelp({ kind }: { kind: IndicatorKind }) {
  const help = indicatorHelp[kind];
  return (
    <details className="rounded-2xl border border-brand-navy/10 bg-white px-4 py-3 text-sm">
      <summary className="cursor-pointer font-bold text-brand-navy">{help.title}</summary>
      <p className="mt-2 leading-relaxed text-brand-navy/80">{help.body}</p>
    </details>
  );
}

function PlayView({
  level,
  built,
  number,
  total,
  answer,
  onAnswer,
  onNext,
  isLast,
}: {
  level: QuizLevel;
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
  const indicators = scenario.indicators ?? [];
  const lines: ChartLine[] = [
    ...(scenario.showMA
      ? [
          { values: ma5, color: MA5_COLOR, label: "5日線" },
          { values: ma25, color: MA25_COLOR, label: "25日線", dashed: true },
        ]
      : []),
    ...(indicators.includes("bb")
      ? [
          { values: built.bb.upper, color: BB_COLOR, label: "+2σ", dashed: true, fitRange: true },
          { values: built.bb.middle, color: MA25_COLOR, label: "20日線" },
          { values: built.bb.lower, color: BB_COLOR, label: "−2σ", dashed: true, fitRange: true },
        ]
      : []),
  ];
  const panel: IndicatorPanel | undefined = indicators.includes("rsi")
    ? { kind: "rsi", values: built.rsi.slice(0, shown.length) }
    : indicators.includes("macd")
      ? {
          kind: "macd",
          line: built.macd.line.slice(0, shown.length),
          signal: built.macd.signal.slice(0, shown.length),
          histogram: built.macd.histogram.slice(0, shown.length),
        }
      : undefined;
  const chartHeight = 300 + (scenario.showVolume ? 40 : 0) + (panel ? INDICATOR_H : 0);
  const lesson = scenario.lessonSlug ? getLesson(scenario.lessonSlug) : undefined;

  return (
    <section>
      <div className="mb-5">
        <div className="flex justify-between text-xs font-semibold text-brand-navy/60">
          <span>チャート当てクイズ（{levelLabels[level]}）</span>
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
          height={chartHeight}
          indicator={panel}
          lines={lines.map((l) => ({ ...l, values: l.values.slice(0, shown.length) }))}
          showVolume={scenario.showVolume}
          divider={VISIBLE_DAYS}
          animateFrom={answered ? VISIBLE_DAYS : undefined}
          labels={answered ? labels : []}
          hlines={answered ? built.hlines : []}
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

      {indicators.length > 0 && (
        <div className="mt-3 space-y-2">
          {indicators.map((k) => (
            <IndicatorHelp key={k} kind={k} />
          ))}
        </div>
      )}

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
              {built.explanation.map((p) => (
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
  level,
  set,
  results,
  onRetry,
}: {
  level: QuizLevel;
  set: BuiltScenario[];
  results: boolean[];
  onRetry: () => void;
}) {
  const score = results.filter(Boolean).length;
  return (
    <section>
      <div className="rounded-3xl bg-brand-cream p-8 text-center">
        <p className="text-sm font-bold text-brand-navy/60">結果（{levelLabels[level]}）</p>
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

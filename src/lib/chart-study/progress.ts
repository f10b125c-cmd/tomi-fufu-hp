"use client";

import { useSyncExternalStore } from "react";

/**
 * 学習の進み具合をブラウザ内（localStorage）に保存する。
 * ログイン不要。保存できない環境（プライベートモード等）では保存せずに動く。
 */

export type Progress = {
  completedLessons: string[];
  termQuiz: {
    /** 間違えた問題の ID（正解すると外れる）＝復習リスト */
    wrongIds: string[];
    answered: number;
    correct: number;
  };
  chartQuiz: {
    answered: number;
    correct: number;
  };
  chartQuizAdvanced: {
    answered: number;
    correct: number;
  };
  /** 仮想トレードの成績（新しい順、最大 MAX_TRADE_HISTORY 件） */
  tradeHistory: TradeRecord[];
};

export type TradeRecord = {
  /** 終了日時（ISO 文字列） */
  at: string;
  name: string;
  returnPct: number;
  holdReturnPct: number;
  trades: number;
};

const MAX_TRADE_HISTORY = 20;

const STORAGE_KEY = "tomifufu-chart-study:v1";
const EMPTY: Progress = {
  completedLessons: [],
  termQuiz: { wrongIds: [], answered: 0, correct: 0 },
  chartQuiz: { answered: 0, correct: 0 },
  chartQuizAdvanced: { answered: 0, correct: 0 },
  tradeHistory: [],
};

function tradeRecords(value: unknown): TradeRecord[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter(
      (r): r is TradeRecord =>
        typeof r === "object" &&
        r !== null &&
        typeof r.at === "string" &&
        typeof r.name === "string" &&
        Number.isFinite(r.returnPct) &&
        Number.isFinite(r.holdReturnPct) &&
        Number.isFinite(r.trades),
    )
    .slice(0, MAX_TRADE_HISTORY);
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((s): s is string => typeof s === "string") : [];
}

function count(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? Math.floor(value) : 0;
}

const listeners = new Set<() => void>();
let cachedRaw: string | null = null;
let cachedValue: Progress = EMPTY;

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function getSnapshot(): Progress {
  const raw = readRaw();
  if (raw === cachedRaw) return cachedValue;
  cachedRaw = raw;
  try {
    const parsed = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
    const quiz = (parsed.termQuiz ?? {}) as Record<string, unknown>;
    const chart = (parsed.chartQuiz ?? {}) as Record<string, unknown>;
    const chartAdv = (parsed.chartQuizAdvanced ?? {}) as Record<string, unknown>;
    cachedValue = {
      completedLessons: stringArray(parsed.completedLessons),
      termQuiz: {
        wrongIds: stringArray(quiz.wrongIds),
        answered: count(quiz.answered),
        correct: count(quiz.correct),
      },
      chartQuiz: {
        answered: count(chart.answered),
        correct: count(chart.correct),
      },
      chartQuizAdvanced: {
        answered: count(chartAdv.answered),
        correct: count(chartAdv.correct),
      },
      tradeHistory: tradeRecords(parsed.tradeHistory),
    };
  } catch {
    cachedValue = EMPTY;
  }
  return cachedValue;
}

function getServerSnapshot(): Progress {
  return EMPTY;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function write(next: Progress) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // 保存できなくても学習自体は続けられる
  }
  listeners.forEach((l) => l());
}

export function useProgress(): Progress {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function markLessonComplete(slug: string) {
  const current = getSnapshot();
  if (current.completedLessons.includes(slug)) return;
  write({ ...current, completedLessons: [...current.completedLessons, slug] });
}

/** 用語クイズの1問の結果を記録する。間違えたら復習リストに入れ、正解したら外す */
export function recordTermAnswer(id: string, correct: boolean) {
  const current = getSnapshot();
  const others = current.termQuiz.wrongIds.filter((w) => w !== id);
  write({
    ...current,
    termQuiz: {
      wrongIds: correct ? others : [...others, id],
      answered: current.termQuiz.answered + 1,
      correct: current.termQuiz.correct + (correct ? 1 : 0),
    },
  });
}

export function recordChartAnswer(correct: boolean, level: "basic" | "advanced" = "basic") {
  const current = getSnapshot();
  const key = level === "advanced" ? "chartQuizAdvanced" : "chartQuiz";
  write({
    ...current,
    [key]: {
      answered: current[key].answered + 1,
      correct: current[key].correct + (correct ? 1 : 0),
    },
  });
}

export function recordTradeResult(record: TradeRecord) {
  const current = getSnapshot();
  write({
    ...current,
    tradeHistory: [record, ...current.tradeHistory].slice(0, MAX_TRADE_HISTORY),
  });
}

export function resetProgress() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // 何もしない
  }
  listeners.forEach((l) => l());
}

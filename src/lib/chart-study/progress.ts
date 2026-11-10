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
};

const STORAGE_KEY = "tomifufu-chart-study:v1";
const EMPTY: Progress = {
  completedLessons: [],
  termQuiz: { wrongIds: [], answered: 0, correct: 0 },
};

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
    cachedValue = {
      completedLessons: stringArray(parsed.completedLessons),
      termQuiz: {
        wrongIds: stringArray(quiz.wrongIds),
        answered: count(quiz.answered),
        correct: count(quiz.correct),
      },
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

export function resetProgress() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // 何もしない
  }
  listeners.forEach((l) => l());
}

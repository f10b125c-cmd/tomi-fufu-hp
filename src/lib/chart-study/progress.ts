"use client";

import { useSyncExternalStore } from "react";

/**
 * 学習の進み具合をブラウザ内（localStorage）に保存する。
 * ログイン不要。保存できない環境（プライベートモード等）では保存せずに動く。
 */

export type Progress = {
  completedLessons: string[];
};

const STORAGE_KEY = "tomifufu-chart-study:v1";
const EMPTY: Progress = { completedLessons: [] };

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
    const parsed = raw ? (JSON.parse(raw) as Partial<Progress>) : {};
    cachedValue = {
      completedLessons: Array.isArray(parsed.completedLessons)
        ? parsed.completedLessons.filter((s): s is string => typeof s === "string")
        : [],
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

export function resetProgress() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // 何もしない
  }
  listeners.forEach((l) => l());
}

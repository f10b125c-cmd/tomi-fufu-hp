"use client";

import Link from "next/link";
import { useProgress } from "@/lib/chart-study/progress";

export type LessonListItem = {
  slug: string;
  number: number;
  title: string;
  summary: string;
  minutes: number;
  available: boolean;
};

export default function LessonList({ lessons }: { lessons: LessonListItem[] }) {
  const { completedLessons } = useProgress();

  return (
    <ol className="space-y-4">
      {lessons.map((lesson) => {
        const done = completedLessons.includes(lesson.slug);
        const inner = (
          <>
            <span
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                done
                  ? "bg-[#2e9d5b] text-white"
                  : lesson.available
                    ? "bg-brand-orange text-white"
                    : "bg-brand-navy/10 text-brand-navy/50"
              }`}
              aria-hidden
            >
              {done ? "✓" : lesson.number}
            </span>
            <span className="flex-1">
              <span className="flex flex-wrap items-center gap-2">
                <span className="font-display text-lg font-bold text-brand-navy">{lesson.title}</span>
                {done && (
                  <span className="rounded-full bg-[#eaf7ef] px-2 py-0.5 text-xs font-bold text-[#2e7d4f]">
                    完了
                  </span>
                )}
                {!lesson.available && (
                  <span className="rounded-full bg-brand-navy/10 px-2 py-0.5 text-xs font-bold text-brand-navy/60">
                    準備中
                  </span>
                )}
              </span>
              <span className="mt-1 block text-sm text-brand-navy/70">{lesson.summary}</span>
              <span className="mt-1 block text-xs text-brand-navy/50">約{lesson.minutes}分</span>
            </span>
          </>
        );
        return (
          <li key={lesson.slug}>
            {lesson.available ? (
              <Link
                href={`/money/chart-study/lessons/${lesson.slug}`}
                className="flex items-start gap-4 rounded-3xl border border-[#edf0f2] bg-white p-5 shadow-sm transition hover:border-brand-orange"
              >
                {inner}
              </Link>
            ) : (
              <div className="flex items-start gap-4 rounded-3xl border border-dashed border-brand-navy/15 bg-white/60 p-5">
                {inner}
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}

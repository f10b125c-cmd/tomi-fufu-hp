"use client";

import { resetProgress, useProgress } from "@/lib/chart-study/progress";

export default function ProgressSummary({ lessonSlugs }: { lessonSlugs: string[] }) {
  const { completedLessons } = useProgress();
  const done = lessonSlugs.filter((s) => completedLessons.includes(s)).length;
  const total = lessonSlugs.length;

  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm">
      <div className="flex items-baseline justify-between">
        <p className="text-sm font-bold text-brand-navy">あなたの進み具合</p>
        <p className="text-sm text-brand-navy/70">
          レッスン <strong className="text-lg text-brand-orange-deep">{done}</strong> / {total} 完了
        </p>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-brand-navy/10">
        <div
          className="h-full rounded-full bg-brand-orange transition-all"
          style={{ width: `${total ? (done / total) * 100 : 0}%` }}
        />
      </div>
      <div className="mt-3 flex items-center justify-between gap-4">
        <p className="text-xs text-brand-navy/50">進み具合はこの端末のブラウザに保存されます。</p>
        {done > 0 && (
          <button
            type="button"
            className="shrink-0 text-xs font-semibold text-brand-blue-deep underline hover:opacity-70"
            onClick={() => {
              if (window.confirm("進み具合をリセットしますか？")) resetProgress();
            }}
          >
            リセット
          </button>
        )}
      </div>
    </div>
  );
}

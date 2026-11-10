"use client";

import { resetProgress, useProgress } from "@/lib/chart-study/progress";

export default function ProgressSummary({ lessonSlugs }: { lessonSlugs: string[] }) {
  const { completedLessons, termQuiz, chartQuiz, tradeHistory } = useProgress();
  const hasAny = completedLessons.length > 0 || termQuiz.answered > 0 || chartQuiz.answered > 0 || tradeHistory.length > 0;
  const lastTrade = tradeHistory[0];
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
      <dl className="mt-4 grid grid-cols-2 gap-2 text-center sm:grid-cols-4 sm:gap-3">
        <div className="rounded-2xl bg-brand-cream px-2 py-3">
          <dt className="text-xs text-brand-navy/60">用語クイズ 正答率</dt>
          <dd className="mt-1 text-lg font-bold text-brand-navy">
            {termQuiz.answered > 0
              ? `${Math.round((termQuiz.correct / termQuiz.answered) * 100)}%`
              : "—"}
          </dd>
        </div>
        <div className="rounded-2xl bg-brand-cream px-2 py-3">
          <dt className="text-xs text-brand-navy/60">チャート当て 正答率</dt>
          <dd className="mt-1 text-lg font-bold text-brand-navy">
            {chartQuiz.answered > 0
              ? `${Math.round((chartQuiz.correct / chartQuiz.answered) * 100)}%`
              : "—"}
          </dd>
        </div>
        <div className="rounded-2xl bg-brand-cream px-2 py-3">
          <dt className="text-xs text-brand-navy/60">復習待ちの用語</dt>
          <dd className="mt-1 text-lg font-bold text-brand-navy">{termQuiz.wrongIds.length}問</dd>
        </div>
        <div className="rounded-2xl bg-brand-cream px-2 py-3">
          <dt className="text-xs text-brand-navy/60">前回の仮想トレード</dt>
          <dd className="mt-1 text-lg font-bold text-brand-navy">
            {lastTrade
              ? `${lastTrade.returnPct >= 0 ? "+" : "−"}${Math.abs(lastTrade.returnPct).toFixed(1)}%`
              : "—"}
          </dd>
        </div>
      </dl>
      <div className="mt-3 flex items-center justify-between gap-4">
        <p className="text-xs text-brand-navy/50">進み具合はこの端末のブラウザに保存されます。</p>
        {hasAny && (
          <button
            type="button"
            className="-my-3 min-h-11 shrink-0 px-2 text-xs font-semibold text-brand-blue-deep underline hover:opacity-70"
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

import type { ChartVisual } from "@/lib/chart-study/lessons";
import { buildChartVisual } from "@/lib/chart-study/lessonVisuals";
import CandleAnatomy from "./CandleAnatomy";
import CandleChart, { type ChartLine } from "./CandleChart";

/** 移動平均線の色と線の種類（期間ごと） */
const MA_STYLES: Record<number, { color: string; dashed?: boolean }> = {
  5: { color: "#f47b20" },
  25: { color: "#7b5ea7", dashed: true },
  75: { color: "#0f8a7e", dashed: true },
};

export default function ChartVisualView({ visual }: { visual: ChartVisual }) {
  if (visual.kind === "anatomy") {
    return (
      <figure className="rounded-2xl border border-[#edf0f2] bg-white p-4">
        <CandleAnatomy />
      </figure>
    );
  }

  const built = buildChartVisual(visual);
  if (built.candles.length === 0) return null;

  const lines: ChartLine[] = built.ma.map(({ period, values }) => ({
    values,
    label: `${period}日線`,
    color: MA_STYLES[period]?.color ?? "#24313a",
    dashed: MA_STYLES[period]?.dashed,
  }));

  return (
    <figure className="rounded-2xl border border-[#edf0f2] bg-white p-4">
      <CandleChart
        candles={built.candles}
        labels={built.labels}
        highlight={visual.highlight}
        lines={lines}
        hlines={visual.hlines}
        showVolume={visual.showVolume}
        height={240 + (visual.showVolume ? 40 : 0)}
      />
      {visual.caption && (
        <figcaption className="mt-2 text-center text-xs text-brand-navy/60">{visual.caption}</figcaption>
      )}
    </figure>
  );
}

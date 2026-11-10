import { generateCandles } from "@/lib/chart-study/candles";
import type { ChartVisual } from "@/lib/chart-study/lessons";
import CandleAnatomy from "./CandleAnatomy";
import CandleChart from "./CandleChart";

export default function ChartVisualView({ visual }: { visual: ChartVisual }) {
  if (visual.kind === "anatomy") {
    return (
      <figure className="rounded-2xl border border-[#edf0f2] bg-white p-4">
        <CandleAnatomy />
      </figure>
    );
  }

  const candles =
    visual.candles ?? (visual.generate ? generateCandles(visual.generate) : []);
  if (candles.length === 0) return null;

  return (
    <figure className="rounded-2xl border border-[#edf0f2] bg-white p-4">
      <CandleChart candles={candles} labels={visual.labels} highlight={visual.highlight} />
      {visual.caption && (
        <figcaption className="mt-2 text-center text-xs text-brand-navy/60">
          {visual.caption}
        </figcaption>
      )}
    </figure>
  );
}

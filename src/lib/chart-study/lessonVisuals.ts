import { generateCandles, generateFromPath, movingAverage, type Candle, type PathPoint } from "./candles";
import type { ChartVisual } from "./lessons";

export type BuiltVisual = {
  candles: Candle[];
  ma: { period: number; values: (number | null)[] }[];
  labels: { index: number; text: string }[];
};

/** 移動平均線の交差（短い期間の線が長い期間の線を抜けた日） */
export function maCrosses(short: (number | null)[], long: (number | null)[]) {
  const crosses: { index: number; kind: "golden" | "dead" }[] = [];
  for (let i = 1; i < short.length; i++) {
    const [a0, b0, a1, b1] = [short[i - 1], long[i - 1], short[i], long[i]];
    if (a0 === null || b0 === null || a1 === null || b1 === null) continue;
    if (a0 <= b0 && a1 > b1) crosses.push({ index: i, kind: "golden" });
    if (a0 >= b0 && a1 < b1) crosses.push({ index: i, kind: "dead" });
  }
  return crosses;
}

/** レッスンの図のデータを作る（移動平均線は最初の日から描けるよう、表示前の助走期間も生成する） */
export function buildChartVisual(visual: Extract<ChartVisual, { kind: "chart" }>): BuiltVisual {
  const periods = visual.ma ?? [];
  const warmup = periods.length > 0 ? Math.max(...periods) : 0;

  let all: Candle[] = [];
  if (visual.candles) all = visual.candles;
  else if (visual.path) {
    const p = visual.path;
    all = generateFromPath({
      seed: p.seed,
      days: warmup + p.days,
      points: p.points.map(([d, price]) => [d + warmup, price] as PathPoint),
      volatility: p.volatility,
      shadows: p.shadows?.map((x) => ({ ...x, day: x.day + warmup })),
      volumeBoost: p.volumeBoost?.map((x) => ({ ...x, from: x.from + warmup, to: x.to + warmup })),
    });
  } else if (visual.generate) all = generateCandles(visual.generate);

  const skip = visual.path ? warmup : 0;
  const candles = all.slice(skip);
  const ma = periods.map((period) => ({ period, values: movingAverage(all, period).slice(skip) }));

  const labels = [...(visual.labels ?? [])];
  if (visual.crossLabels && ma.length >= 2) {
    const crosses = maCrosses(ma[0].values, ma[1].values);
    const shown = visual.crossLabels === "last" ? crosses.slice(-1) : crosses;
    for (const c of shown) {
      const full = c.kind === "golden" ? "ゴールデンクロス" : "デッドクロス";
      labels.push({ index: c.index, text: visual.crossLabels === "last" ? full : c.kind === "golden" ? "GC" : "DC" });
    }
  }
  return { candles, ma, labels };
}

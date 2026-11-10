/**
 * レッスンの図が、本文どおりの形になっているかを確かめる。
 * 例: 「安値が切り上がっている」図で本当に切り上がっているか、
 *     「ゴールデンクロス」の注釈が本当にゴールデンクロスか、など。
 *
 * 実行: npm run verify:lessons
 * レッスンの図（lessons.ts）やチャートの生成ロジック（candles.ts）を変えたら実行すること。
 */
import { lessons, type ChartVisual } from "../src/lib/chart-study/lessons";
import { buildChartVisual, maCrosses, type BuiltVisual } from "../src/lib/chart-study/lessonVisuals";

type Check = (v: BuiltVisual) => true | string;

const lowAround = (v: BuiltVisual, i: number, r = 2) =>
  Math.min(...v.candles.slice(Math.max(0, i - r), i + r + 1).map((c) => c.low));
const highAround = (v: BuiltVisual, i: number, r = 2) =>
  Math.max(...v.candles.slice(Math.max(0, i - r), i + r + 1).map((c) => c.high));
const avgVolume = (v: BuiltVisual, from: number, to: number) =>
  v.candles.slice(from, to + 1).reduce((a, c) => a + c.volume, 0) / (to - from + 1);
const last = (v: BuiltVisual) => v.candles.length - 1;
const ma = (v: BuiltVisual, period: number) => v.ma.find((m) => m.period === period)!.values;
const near = (value: number, target: number, pct: number) => Math.abs(value - target) / target <= pct / 100;

function inRange(lo: number, hi: number): Check {
  return (v) => {
    const min = Math.min(...v.candles.map((c) => c.low));
    const max = Math.max(...v.candles.map((c) => c.high));
    return (min >= lo * 0.98 && max <= hi * 1.02 && near(max, hi, 3) && near(min, lo, 3)) || `範囲 ${min}〜${max}`;
  };
}

function breakout(level: number, day: number): Check {
  return (v) =>
    (v.candles[day].close > level && v.candles[day].volume > 1.8 * avgVolume(v, 0, day - 3)) ||
    `抜けた日の終値 ${v.candles[day].close}・出来高 ${(v.candles[day].volume / avgVolume(v, 0, day - 3)).toFixed(1)}倍`;
}

function maRising(period: number): Check {
  return (v) => {
    const m = ma(v, period);
    const ok = m[last(v)]! > m[0]! && v.candles[last(v)].close > m[last(v)]!;
    return ok || `${period}日線が上向き・株価が線の上になっていない`;
  };
}

/** キーは「slug/step番号」または「slug/quiz番号」（0 始まり） */
const checks: Record<string, Check> = {
  "trend/step1": (v) =>
    (lowAround(v, 12) < lowAround(v, 25) && lowAround(v, 25) < lowAround(v, 38, 1)) || "安値が切り上がっていない",
  "trend/step2": (v) =>
    (highAround(v, 12) > highAround(v, 25) && highAround(v, 25) > highAround(v, 38, 1)) || "高値が切り下がっていない",
  "trend/step3": inRange(950, 1050),
  "trend/step4": (v) =>
    (Math.min(...v.candles.slice(33).map((c) => c.close)) < 1000 && lowAround(v, 26) >= 985) || "直前の安値を割っていない",
  "trend/quiz1": inRange(960, 1040),
  "moving-average/step2": maRising(25),
  "moving-average/step3": (v) => near(lowAround(v, 26), ma(v, 25)[26]!, 2) || "25日線のあたりで下げ止まっていない",
  "moving-average/step4": (v) => maCrosses(ma(v, 5), ma(v, 25)).length >= 3 || "線が絡み合っていない",
  "moving-average/quiz2": maRising(25),
  "golden-cross/step0": (v) => maCrosses(ma(v, 5), ma(v, 25)).at(-1)?.kind === "golden" || "最後のクロスがゴールデンクロスでない",
  "golden-cross/step2": (v) => maCrosses(ma(v, 5), ma(v, 25)).at(-1)?.kind === "dead" || "最後のクロスがデッドクロスでない",
  "golden-cross/step3": (v) => maCrosses(ma(v, 5), ma(v, 25)).length >= 3 || "クロスが少ない",
  "volume/step2": breakout(1045, 33),
  "volume/step3": (v) =>
    (avgVolume(v, 30, 39) < 0.7 * avgVolume(v, 0, 9) && v.candles[39].close > v.candles[0].close) || "出来高が減っていない",
  "volume/step4": (v) => {
    const c = v.candles[27];
    const lower = Math.min(c.open, c.close) - c.low;
    return (lower >= 2 * Math.abs(c.close - c.open) && c.volume > 2 * avgVolume(v, 10, 24)) || "下ヒゲ・出来高が足りない";
  },
  "volume/quiz1": breakout(1045, 37),
  "support-resistance/step0": (v) =>
    ([6, 20, 34].every((i) => near(lowAround(v, i), 950, 1.5)) &&
      v.candles.every((c) => c.close > 940)) ||
    "950円で下げ止まっていない",
  "support-resistance/step1": (v) =>
    ([6, 20, 34].every((i) => near(highAround(v, i), 1050, 1.5)) &&
      v.candles.every((c) => c.close < 1060)) ||
    "1,050円で上がり止まっていない",
  "support-resistance/step3": (v) =>
    (v.candles[22].close > 1050 &&
      near(lowAround(v, 28), 1050, 2) &&
      v.candles.slice(22).every((c) => c.close >= 1050 * 0.985)) ||
    "抜けたあと、1,050円で下げ止まっていない",
  "support-resistance/quiz1": (v) =>
    ([7, 21, 35].every((i) => near(highAround(v, i), 1050, 1.5)) &&
      v.candles.every((c) => c.close < 1060)) ||
    "1,050円で上がり止まっていない",
};

let bad = 0;
let checked = 0;
const seen = new Set<string>();
for (const lesson of lessons) {
  const visuals: [string, ChartVisual | undefined][] = [
    ...(lesson.steps ?? []).map((s, i) => [`${lesson.slug}/step${i}`, s.visual] as [string, ChartVisual | undefined]),
    ...(lesson.quiz ?? []).map((q, i) => [`${lesson.slug}/quiz${i}`, q.visual] as [string, ChartVisual | undefined]),
  ];
  for (const [key, visual] of visuals) {
    const check = checks[key];
    if (!check) continue;
    seen.add(key);
    if (!visual || visual.kind !== "chart") {
      console.log(`NG ${key}: 図がない`);
      bad++;
      continue;
    }
    checked++;
    const result = check(buildChartVisual(visual));
    if (result !== true) bad++;
    console.log(`${result === true ? "OK" : "NG"} ${key}${result === true ? "" : ": " + result}`);
  }
}
for (const key of Object.keys(checks)) {
  if (!seen.has(key)) {
    console.log(`NG ${key}: チェック対象の図が見つからない`);
    bad++;
  }
}
console.log(bad ? `NG: ${bad} 件` : `ALL OK（${checked} 枚の図）`);
if (bad) process.exitCode = 1;

import { VISIBLE_DAYS, type BuiltScenario } from "./chartQuiz";

/**
 * チャート当てクイズの問題（と形違い）が、解説どおりになっているかを確かめるチェック。
 * - 隠れていた部分で、expected の方向に 3% 以上動くこと
 * - 問題ごとの前提（ネックラインを抜けている、RSI が30を下回っている、など）が成り立つこと
 * 値段は問題に書いた値段（1,000円前後）で書き、b.price() で形違いの値段に変換して比べる。
 */

/** 表示されている最後の日（0 始まり） */
const L = VISIBLE_DAYS - 1;

const close = (b: BuiltScenario, i: number) => b.candles[i].close;

function argExt(b: BuiltScenario, from: number, to: number, kind: "min" | "max") {
  let best = from;
  for (let i = from; i <= to; i++) {
    if (kind === "min" ? close(b, i) < close(b, best) : close(b, i) > close(b, best)) best = i;
  }
  return best;
}

const maxIn = (arr: (number | null)[], from: number, to: number) =>
  Math.max(...arr.slice(from, to + 1).map((v) => v ?? -Infinity));

/** MACD 線がシグナルを抜けた日。なければ -1 */
function macdCross(b: BuiltScenario, from: number, to: number, dir: "up" | "down") {
  for (let i = Math.max(from, 1); i <= to; i++) {
    const prev = b.macd.line[i - 1]! - b.macd.signal[i - 1]!;
    const cur = b.macd.line[i]! - b.macd.signal[i]!;
    if (dir === "up" ? prev <= 0 && cur > 0 : prev >= 0 && cur < 0) return i;
  }
  return -1;
}

const avgVolume = (b: BuiltScenario, from: number, to: number) =>
  b.candles.slice(from, to + 1).reduce((a, c) => a + c.volume, 0) / (to - from + 1);

const body = (b: BuiltScenario, i: number) => Math.abs(b.candles[i].close - b.candles[i].open);
const lowerShadow = (b: BuiltScenario, i: number) =>
  Math.min(b.candles[i].open, b.candles[i].close) - b.candles[i].low;
const upperShadow = (b: BuiltScenario, i: number) =>
  b.candles[i].high - Math.max(b.candles[i].open, b.candles[i].close);

const near = (value: number, target: number, pct: number) => Math.abs(value - target) / target <= pct / 100;

const crossLabel = (b: BuiltScenario) => b.labels.find((l) => l.text.includes("クロス"))?.text;

/** 合格なら true、不合格なら理由の文字列 */
type Check = (b: BuiltScenario) => true | string;

const checks: Record<string, Check> = {
  // ── 初級 ──
  "double-bottom": (b) => close(b, L) > b.price(1010) || "ネックラインを抜けていない",
  "double-top": (b) => close(b, L) < b.price(990) || "ネックラインを割っていない",
  "golden-cross": (b) => crossLabel(b) === "ゴールデンクロス" || `クロス: ${crossLabel(b)}`,
  "golden-cross-fake": (b) => crossLabel(b) === "ゴールデンクロス" || `クロス: ${crossLabel(b)}`,
  "dead-cross": (b) => crossLabel(b) === "デッドクロス" || `クロス: ${crossLabel(b)}`,
  "support-bounce": (b) =>
    near(Math.min(...b.candles.slice(25, L + 1).map((c) => c.low)), b.price(950), 2.5) ||
    "サポートラインまで下がっていない",
  "resistance-reject": (b) => {
    // 上ヒゲでラインを少し突き抜けるのは想定どおりなので、上側は広めに許す
    const high = Math.max(...b.candles.slice(25, L + 1).map((c) => c.high));
    return (high >= b.price(1050) * 0.975 && high <= b.price(1050) * 1.04) || "レジスタンスラインまで上がっていない";
  },
  "support-break": (b) => close(b, L) < b.price(950) || "サポートラインを割っていない",
  "breakout-volume": (b) => close(b, L) > b.price(1050) || "レジスタンスラインを抜けていない",
  "false-breakout": (b) => close(b, L) > b.price(1050) || "レジスタンスラインを抜けていない",
  "head-shoulders": (b) => close(b, L) < b.price(990) || "ネックラインを割っていない",
  "inverse-head-shoulders": (b) => close(b, L) > b.price(1010) || "ネックラインを抜けていない",
  "double-bottom-fail": (b) => close(b, L) < b.price(1005) || "ネックラインを抜けてしまっている",
  hammer: (b) => lowerShadow(b, L) >= 2 * body(b, L) || "下ヒゲが短い",
  "hammer-fail": (b) => lowerShadow(b, L) >= 2 * body(b, L) || "下ヒゲが短い",
  "shooting-star": (b) => upperShadow(b, L) >= 2 * body(b, L) || "上ヒゲが短い",
  "gap-up": (b) => b.candles[L].low > b.candles[L - 1].high || "窓があいていない",

  // ── 上級 ──
  "adv-rsi-oversold": (b) => b.rsi[L]! < 30 || `RSI ${b.rsi[L]!.toFixed(0)}`,
  "adv-rsi-overbought-trend": (b) => b.rsi[L]! > 70 || `RSI ${b.rsi[L]!.toFixed(0)}`,
  "adv-confluence": (b) =>
    (b.rsi[L]! < 30 && near(b.candles[L].low, b.price(950), 1.5)) ||
    `RSI ${b.rsi[L]!.toFixed(0)}・安値 ${b.candles[L].low}`,
  "adv-rsi-divergence-bull": (b) => {
    const a = argExt(b, 6, 14, "min");
    const c = argExt(b, 26, L, "min");
    return (close(b, c) < close(b, a) && b.rsi[c]! > b.rsi[a]!) || "ダイバージェンスになっていない";
  },
  "adv-rsi-divergence-bear": (b) => {
    const a = argExt(b, 6, 14, "max");
    const c = argExt(b, 26, L, "max");
    return (close(b, c) > close(b, a) && b.rsi[c]! < b.rsi[a]!) || "ダイバージェンスになっていない";
  },
  "adv-macd-cross-up": (b) => {
    const i = macdCross(b, 22, L, "up");
    return (i >= 0 && b.macd.line[i]! < 0 && b.macd.line[L]! > b.macd.signal[L]!) || "ゼロより下でクロスしていない";
  },
  "adv-macd-cross-down": (b) => {
    const i = macdCross(b, 22, L, "down");
    return (i >= 0 && b.macd.line[i]! > 0 && b.macd.line[L]! < b.macd.signal[L]!) || "ゼロより上でクロスしていない";
  },
  "adv-macd-divergence-trap": (b) => {
    const a = argExt(b, 6, 12, "max");
    const c = argExt(b, 26, L, "max");
    return (
      (close(b, c) > close(b, a) && maxIn(b.macd.line, 25, L) < maxIn(b.macd.line, 5, 13)) ||
      "MACD が弱気になっていない"
    );
  },
  "adv-bb-squeeze": (b) => {
    const width = (i: number) => (b.bb.upper[i]! - b.bb.lower[i]!) / b.bb.middle[i]!;
    const early = Math.max(...[0, 2, 4, 6, 8].map(width));
    return (width(28) < 0.6 * early && close(b, L) >= b.bb.upper[L]! * 0.995) || "スクイーズ・上放れになっていない";
  },
  "adv-bb-band-walk": (b) => {
    let n = 0;
    for (let i = 22; i <= L; i++) {
      if (close(b, i) >= b.bb.middle[i]! + 0.5 * (b.bb.upper[i]! - b.bb.middle[i]!)) n++;
    }
    return n >= 7 || `上側に沿った日 ${n}`;
  },
  "adv-bb-lower-fail": (b) => {
    let n = 0;
    for (let i = 22; i <= L; i++) {
      if (close(b, i) <= b.bb.middle[i]! - 0.5 * (b.bb.middle[i]! - b.bb.lower[i]!)) n++;
    }
    return (n >= 7 && b.candles[L].low <= b.bb.lower[L]! * 1.005) || "下のバンドに触れていない";
  },
  "adv-descending-triangle": (b) => close(b, L) < b.price(950) || "サポートラインを割っていない",
  "adv-cup-with-handle": (b) => close(b, L) > b.price(1050) || "カップのふちを抜けていない",
  "adv-triangle-breakout": (b) =>
    (close(b, L) > Math.max(...[12, 17, 22, 26, 29].map((i) => close(b, i))) &&
      b.candles[L].volume > 1.6 * avgVolume(b, 15, 29)) ||
    "出来高をともなって上に抜けていない",
  "adv-triangle-fake": (b) =>
    (close(b, L) > Math.max(...[12, 17, 22, 26, 29].map((i) => close(b, i))) &&
      b.candles[L].volume < 1.3 * avgVolume(b, 15, 29)) ||
    "出来高の少ない上抜けになっていない",
  "adv-bull-flag": (b) =>
    close(b, L) > Math.max(...Array.from({ length: 16 }, (_, k) => close(b, 14 + k))) || "旗を上に抜けていない",
};

/** 問題（形違い）の問題点の一覧。空なら合格 */
export function checkScenario(b: BuiltScenario): string[] {
  const problems: string[] = [];
  if (b.actual !== b.scenario.expected) problems.push(`向きが逆（${b.changePct.toFixed(1)}%）`);
  if (Math.abs(b.changePct) < 3) problems.push(`動きが小さい（${b.changePct.toFixed(1)}%）`);
  const result = checks[b.scenario.id]?.(b);
  if (result !== undefined && result !== true) problems.push(result);
  return problems;
}

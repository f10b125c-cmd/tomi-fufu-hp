/**
 * チャート当てクイズの全問題が、解説どおりに動くかを確かめる。
 * - 隠れていた部分で、expected の方向に 3% 以上動くこと
 * - 問題ごとの前提（ネックラインを抜けている、RSI が30を下回っている、など）が成り立つこと
 *
 * 実行: npm run verify:quiz
 * チャートの生成ロジック（candles.ts）や問題（chartQuiz*.ts）を変えたら必ず実行すること。
 */
import { scenarios, buildScenario, VISIBLE_DAYS, levelOf, type BuiltScenario } from "../src/lib/chart-study/chartQuiz";
const L = VISIBLE_DAYS - 1;
const close = (b: BuiltScenario, i: number) => b.candles[i].close;
const argExt = (b: BuiltScenario, from: number, to: number, kind: "min" | "max") => {
  let best = from;
  for (let i = from; i <= to; i++) if (kind === "min" ? close(b, i) < close(b, best) : close(b, i) > close(b, best)) best = i;
  return best;
};
const maxIn = (arr: (number | null)[], from: number, to: number) => Math.max(...arr.slice(from, to + 1).map(v => v ?? -Infinity));
const crossed = (b: BuiltScenario, from: number, to: number, dir: "up" | "down") => {
  for (let i = Math.max(from, 1); i <= to; i++) {
    const p = b.macd.line[i - 1]! - b.macd.signal[i - 1]!, c = b.macd.line[i]! - b.macd.signal[i]!;
    if (dir === "up" ? p <= 0 && c > 0 : p >= 0 && c < 0) return i;
  }
  return -1;
};
const avgVol = (b: BuiltScenario, from: number, to: number) => b.candles.slice(from, to + 1).reduce((a, c) => a + c.volume, 0) / (to - from + 1);
const checks: Record<string, (b: BuiltScenario) => string | true> = {
  "double-bottom": b => close(b, L) > 1010 || "neckline", "double-top": b => close(b, L) < 990 || "neckline",
  "support-break": b => close(b, L) < 950 || "level", "breakout-volume": b => close(b, L) > 1050 || "level",
  "false-breakout": b => close(b, L) > 1050 || "level", "head-shoulders": b => close(b, L) < 990 || "neck",
  "inverse-head-shoulders": b => close(b, L) > 1010 || "neck", "double-bottom-fail": b => close(b, L) < 1005 || "neck",
  "adv-rsi-oversold": b => b.rsi[L]! < 30 || `rsi ${b.rsi[L]!.toFixed(0)}`,
  "adv-rsi-overbought-trend": b => b.rsi[L]! > 70 || `rsi ${b.rsi[L]!.toFixed(0)}`,
  "adv-confluence": b => (b.rsi[L]! < 30 && b.candles[L].low < 960 && b.candles[L].low > 935) || `rsi ${b.rsi[L]!.toFixed(0)} low ${b.candles[L].low}`,
  "adv-rsi-divergence-bull": b => { const a = argExt(b, 6, 14, "min"), c = argExt(b, 26, L, "min");
    return (close(b, c) < close(b, a) && b.rsi[c]! > b.rsi[a]!) || `p ${close(b,a)}->${close(b,c)} rsi ${b.rsi[a]!.toFixed(0)}->${b.rsi[c]!.toFixed(0)}`; },
  "adv-rsi-divergence-bear": b => { const a = argExt(b, 6, 14, "max"), c = argExt(b, 26, L, "max");
    return (close(b, c) > close(b, a) && b.rsi[c]! < b.rsi[a]!) || `p ${close(b,a)}->${close(b,c)} rsi ${b.rsi[a]!.toFixed(0)}->${b.rsi[c]!.toFixed(0)}`; },
  "adv-macd-cross-up": b => { const i = crossed(b, 22, L, "up"); return (i >= 0 && b.macd.line[i]! < 0 && b.macd.line[L]! > b.macd.signal[L]!) || `cross ${i}`; },
  "adv-macd-cross-down": b => { const i = crossed(b, 22, L, "down"); return (i >= 0 && b.macd.line[i]! > 0 && b.macd.line[L]! < b.macd.signal[L]!) || `cross ${i}`; },
  "adv-macd-divergence-trap": b => { const a = argExt(b, 6, 12, "max"), c = argExt(b, 26, L, "max");
    const m1 = maxIn(b.macd.line, 5, 13), m2 = maxIn(b.macd.line, 25, L);
    return (close(b, c) > close(b, a) && m2 < m1) || `p ${close(b,a)}->${close(b,c)} macd ${m1.toFixed(1)}->${m2.toFixed(1)}`; },
  "adv-bb-squeeze": b => { const bw = (i: number) => (b.bb.upper[i]! - b.bb.lower[i]!) / b.bb.middle[i]!;
    return (bw(28) < 0.6 * Math.max(...[0,2,4,6,8].map(bw)) && close(b, L) >= b.bb.upper[L]! * 0.995) || `bw ${bw(28).toFixed(3)} vs ${Math.max(...[0,2,4,6,8].map(bw)).toFixed(3)} close ${close(b,L)} up ${b.bb.upper[L]!.toFixed(0)}`; },
  "adv-bb-band-walk": b => { let n = 0; for (let i = 22; i <= L; i++) if (close(b, i) >= b.bb.middle[i]! + 0.5 * (b.bb.upper[i]! - b.bb.middle[i]!)) n++; return n >= 7 || `walk ${n}`; },
  "adv-bb-lower-fail": b => { let n = 0; for (let i = 22; i <= L; i++) if (close(b, i) <= b.bb.middle[i]! - 0.5 * (b.bb.middle[i]! - b.bb.lower[i]!)) n++;
    return (n >= 7 && b.candles[L].low <= b.bb.lower[L]! * 1.005) || `walk ${n} low ${b.candles[L].low} lower ${b.bb.lower[L]!.toFixed(0)}`; },
  "adv-descending-triangle": b => close(b, L) < 950 || `close ${close(b, L)}`,
  "adv-cup-with-handle": b => close(b, L) > 1050 || `close ${close(b, L)}`,
  "adv-triangle-breakout": b => (close(b, L) > Math.max(...[12,17,22,26,29].map(i => close(b, i))) && b.candles[L].volume > 1.6 * avgVol(b, 15, 29)) || "break/vol",
  "adv-triangle-fake": b => (close(b, L) > Math.max(...[12,17,22,26,29].map(i => close(b, i))) && b.candles[L].volume < 1.3 * avgVol(b, 15, 29)) || `close ${close(b,L)} vol ${(b.candles[L].volume/avgVol(b,15,29)).toFixed(2)}`,
  "adv-bull-flag": b => close(b, L) > Math.max(...Array.from({ length: 16 }, (_, k) => close(b, 14 + k))) || `close ${close(b,L)}`,
};
let bad = 0;
for (const s of scenarios) {
  const b = buildScenario(s);
  const probs: string[] = [];
  if (b.actual !== s.expected) probs.push("DIRECTION");
  if (Math.abs(b.changePct) < 3) probs.push("SMALL");
  const c = checks[s.id]?.(b);
  if (c !== undefined && c !== true) probs.push(c);
  if (probs.length) bad++;
  console.log(levelOf(s)[0], s.id.padEnd(28), s.expected.padEnd(4), b.changePct.toFixed(1).padStart(6), probs.join(" | "));
}
console.log(bad ? `NG: ${bad} 問` : "ALL OK");
if (bad) process.exitCode = 1;

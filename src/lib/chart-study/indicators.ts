import type { Candle } from "./candles";

type Series = (number | null)[];

/** 指数平滑移動平均（EMA）。最初の period 本の単純平均を起点にする */
function ema(values: Series, period: number): Series {
  const k = 2 / (period + 1);
  const out: Series = [];
  let prev: number | null = null;
  let seed: number[] = [];
  for (const v of values) {
    if (v === null) {
      out.push(null);
      continue;
    }
    if (prev === null) {
      seed.push(v);
      if (seed.length === period) {
        prev = seed.reduce((a, b) => a + b, 0) / period;
        seed = [];
        out.push(prev);
      } else {
        out.push(null);
      }
      continue;
    }
    prev = v * k + prev * (1 - k);
    out.push(prev);
  }
  return out;
}

/** RSI（ワイルダーの平滑化）。0〜100。70以上で「買われすぎ」、30以下で「売られすぎ」とされる */
export function rsi(candles: Candle[], period = 14): Series {
  const out: Series = [null];
  let avgGain = 0;
  let avgLoss = 0;
  for (let i = 1; i < candles.length; i++) {
    const change = candles[i].close - candles[i - 1].close;
    const gain = Math.max(change, 0);
    const loss = Math.max(-change, 0);
    if (i <= period) {
      avgGain += gain / period;
      avgLoss += loss / period;
      out.push(i === period ? toRsi(avgGain, avgLoss) : null);
    } else {
      avgGain = (avgGain * (period - 1) + gain) / period;
      avgLoss = (avgLoss * (period - 1) + loss) / period;
      out.push(toRsi(avgGain, avgLoss));
    }
  }
  return out;
}

function toRsi(gain: number, loss: number) {
  if (loss === 0) return 100;
  return 100 - 100 / (1 + gain / loss);
}

/** MACD（12・26・9）。MACD線＝短期EMA−長期EMA、シグナル＝MACD線のEMA、ヒストグラム＝差 */
export function macd(candles: Candle[], fast = 12, slow = 26, signalPeriod = 9) {
  const closes = candles.map((c) => c.close);
  const fastEma = ema(closes, fast);
  const slowEma = ema(closes, slow);
  const line: Series = closes.map((_, i) =>
    fastEma[i] !== null && slowEma[i] !== null ? fastEma[i]! - slowEma[i]! : null,
  );
  const signal = ema(line, signalPeriod);
  const histogram: Series = line.map((v, i) => (v !== null && signal[i] !== null ? v - signal[i]! : null));
  return { line, signal, histogram };
}

/** ボリンジャーバンド（20日・±2σ） */
export function bollinger(candles: Candle[], period = 20, width = 2) {
  const middle: Series = [];
  const upper: Series = [];
  const lower: Series = [];
  for (let i = 0; i < candles.length; i++) {
    if (i < period - 1) {
      middle.push(null);
      upper.push(null);
      lower.push(null);
      continue;
    }
    const slice = candles.slice(i - period + 1, i + 1).map((c) => c.close);
    const mean = slice.reduce((a, b) => a + b, 0) / period;
    const sd = Math.sqrt(slice.reduce((a, b) => a + (b - mean) ** 2, 0) / period);
    middle.push(mean);
    upper.push(mean + width * sd);
    lower.push(mean - width * sd);
  }
  return { middle, upper, lower };
}

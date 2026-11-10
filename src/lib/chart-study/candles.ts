export type Candle = {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

/** 乱数シードを固定した擬似乱数（同じシードなら毎回同じチャートになる） */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type TrendSegment = {
  /** 本数 */
  days: number;
  /** 1日あたりの平均的な値動き（%）。プラスで上昇トレンド */
  drift: number;
};

/**
 * 学習用の架空の日足データを生成する。
 * segments でトレンドの流れ（上昇→下降など）を指定できる。
 */
export function generateCandles({
  seed,
  start = 1000,
  volatility = 1.5,
  segments,
}: {
  seed: number;
  start?: number;
  volatility?: number;
  segments: TrendSegment[];
}): Candle[] {
  const rand = mulberry32(seed);
  const candles: Candle[] = [];
  let prevClose = start;

  for (const segment of segments) {
    for (let i = 0; i < segment.days; i++) {
      const open = prevClose * (1 + ((rand() - 0.5) * volatility) / 200);
      const change = segment.drift + (rand() - 0.5) * 2 * volatility;
      const close = open * (1 + change / 100);
      const high = Math.max(open, close) * (1 + (rand() * volatility) / 150);
      const low = Math.min(open, close) * (1 - (rand() * volatility) / 150);
      const volume = Math.round((0.6 + rand() * 0.8 + Math.abs(change) / 4) * 100000);
      candles.push({
        open: Math.round(open),
        high: Math.round(high),
        low: Math.round(low),
        close: Math.round(close),
        volume,
      });
      prevClose = close;
    }
  }
  return candles;
}

export type PathPoint = [day: number, price: number];

/**
 * 「この日はだいたいこの値段」という通過点（points）をなぞるように、日足データを生成する。
 * ダブルボトムや三尊など、形を狙って作りたいときに使う。
 * points の day は 0 始まり。範囲外の日は端の値段で横ばいになる。
 */
export function generateFromPath({
  seed,
  days,
  points,
  volatility = 1.0,
  shadows = [],
  gaps = [],
  volumeBoost = [],
}: {
  seed: number;
  days: number;
  points: PathPoint[];
  /** 日々のブレの大きさ（%） */
  volatility?: number;
  /** 指定日のヒゲを長くする（% は終値に対する長さ） */
  shadows?: { day: number; upper?: number; lower?: number }[];
  /** 指定日に窓をあける（前日終値から何 % 離れて始まるか） */
  gaps?: { day: number; pct: number }[];
  /** 指定期間の出来高を何倍にするか */
  volumeBoost?: { from: number; to: number; times: number }[];
}): Candle[] {
  const rand = mulberry32(seed);
  const sorted = [...points].sort((a, b) => a[0] - b[0]);

  const target = (day: number) => {
    if (day <= sorted[0][0]) return sorted[0][1];
    for (let i = 1; i < sorted.length; i++) {
      const [d1, p1] = sorted[i];
      const [d0, p0] = sorted[i - 1];
      if (day <= d1) return p0 + ((p1 - p0) * (day - d0)) / (d1 - d0);
    }
    return sorted[sorted.length - 1][1];
  };

  const candles: Candle[] = [];
  let noise = 0;
  let prevClose = target(0);

  for (let day = 0; day < days; day++) {
    // 前日のブレを半分引き継ぐ（ギザギザしすぎず、形は崩れない）
    noise = noise * 0.5 + (rand() - 0.5) * 2 * (volatility / 100);
    const close = target(day) * (1 + noise);
    const gap = gaps.find((g) => g.day === day);
    const open = gap
      ? prevClose * (1 + gap.pct / 100)
      : prevClose * (1 + ((rand() - 0.5) * volatility) / 250);
    const shadow = shadows.find((s) => s.day === day);
    const upper = shadow?.upper ?? rand() * volatility * 0.6;
    const lower = shadow?.lower ?? rand() * volatility * 0.6;
    const high = Math.max(open, close) * (1 + upper / 100);
    const low = Math.min(open, close) * (1 - lower / 100);

    const boost = volumeBoost.find((v) => day >= v.from && day <= v.to)?.times ?? 1;
    const move = Math.abs(close - prevClose) / prevClose;
    const volume = Math.round((0.7 + rand() * 0.6 + move * 15) * boost * 100000);

    candles.push({
      open: Math.round(open),
      high: Math.round(high),
      low: Math.round(low),
      close: Math.round(close),
      volume,
    });
    prevClose = close;
  }
  return candles;
}

/** 終値の移動平均。期間に満たない日は null */
export function movingAverage(candles: Candle[], period: number): (number | null)[] {
  let sum = 0;
  return candles.map((c, i) => {
    sum += c.close;
    if (i >= period) sum -= candles[i - period].close;
    return i >= period - 1 ? sum / period : null;
  });
}

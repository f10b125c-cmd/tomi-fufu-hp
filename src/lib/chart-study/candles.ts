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

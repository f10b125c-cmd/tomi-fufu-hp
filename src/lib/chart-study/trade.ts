import { generateCandles, movingAverage, mulberry32, type Candle, type TrendSegment } from "./candles";

export const INITIAL_CASH = 1_000_000;
/** 日本株の売買単位（単元株） */
export const LOT = 100;
export const TRADING_DAYS = 60;
/** 1日目の時点で見えている過去の日数 */
export const HISTORY_DAYS = 30;
/** 25日移動平均線を最初から描くための助走期間（画面には出さない） */
const WARMUP_DAYS = 25;

const NAMES = ["とみ商事", "ひだまり製菓", "うみかぜ交通", "みなみ電機", "そらいろ食品", "あおば化学"];

export type Market = {
  seed: number;
  name: string;
  /** 助走期間を除いた日足（過去 HISTORY_DAYS 日 ＋ 売買できる TRADING_DAYS 日） */
  candles: Candle[];
  ma5: (number | null)[];
  ma25: (number | null)[];
};

/** 乱数シードから架空の銘柄の値動きを作る。上昇・下落・横ばいがランダムに入れかわる */
export function generateMarket(seed: number): Market {
  const rand = mulberry32(seed);
  const total = WARMUP_DAYS + HISTORY_DAYS + TRADING_DAYS;
  const segments: TrendSegment[] = [];
  let days = 0;
  while (days < total) {
    const length = 10 + Math.floor(rand() * 16);
    segments.push({ days: length, drift: (rand() - 0.5) * 1.6 });
    days += length;
  }
  const start = Math.round((800 + rand() * 2200) / 10) * 10;
  const volatility = 1.4 + rand() * 0.6;
  const all = generateCandles({ seed: seed + 1, start, volatility, segments }).slice(0, total);

  return {
    seed,
    name: NAMES[Math.floor(rand() * NAMES.length)],
    candles: all.slice(WARMUP_DAYS),
    ma5: movingAverage(all, 5).slice(WARMUP_DAYS),
    ma25: movingAverage(all, 25).slice(WARMUP_DAYS),
  };
}

/** 売買できる day（0 始まり）の candles 上の位置 */
export function candleIndex(day: number) {
  return HISTORY_DAYS - 1 + day;
}

export type Trade = {
  day: number;
  side: "buy" | "sell";
  shares: number;
  price: number;
};

export type Account = {
  cash: number;
  shares: number;
  /** 保有株の取得金額の合計（平均取得単価の計算用） */
  cost: number;
  trades: Trade[];
};

export const initialAccount: Account = { cash: INITIAL_CASH, shares: 0, cost: 0, trades: [] };

/** 今の現金で買える最大株数（100株単位） */
export function maxBuyable(cash: number, price: number) {
  return Math.floor(cash / price / LOT) * LOT;
}

/** 「半分」の株数。100株単位に切り捨て、0 になるときは 100株（買える・持っている範囲で） */
export function halfOf(shares: number) {
  if (shares < LOT) return 0;
  return Math.max(Math.floor(shares / 2 / LOT) * LOT, LOT);
}

export function buy(account: Account, day: number, price: number, shares: number): Account {
  if (shares <= 0 || shares % LOT !== 0 || shares * price > account.cash) return account;
  return {
    cash: account.cash - shares * price,
    shares: account.shares + shares,
    cost: account.cost + shares * price,
    trades: [...account.trades, { day, side: "buy", shares, price }],
  };
}

export function sell(account: Account, day: number, price: number, shares: number): Account {
  if (shares <= 0 || shares % LOT !== 0 || shares > account.shares) return account;
  const remaining = account.shares - shares;
  return {
    cash: account.cash + shares * price,
    shares: remaining,
    // 売った分の取得金額を平均単価で差し引く
    cost: remaining === 0 ? 0 : account.cost * (remaining / account.shares),
    trades: [...account.trades, { day, side: "sell", shares, price }],
  };
}

export function totalValue(account: Account, price: number) {
  return account.cash + account.shares * price;
}

export function averageCost(account: Account) {
  return account.shares > 0 ? account.cost / account.shares : 0;
}

/** 1日目に買えるだけ買って、day 日目（0 始まり）まで持ち続けた場合の総資産 */
export function buyAndHoldValue(market: Market, day = TRADING_DAYS - 1) {
  const first = market.candles[candleIndex(0)].close;
  const last = market.candles[candleIndex(day)].close;
  const shares = maxBuyable(INITIAL_CASH, first);
  return INITIAL_CASH - shares * first + shares * last;
}

export function returnPct(value: number) {
  return ((value - INITIAL_CASH) / INITIAL_CASH) * 100;
}

"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { recordTradeResult, useProgress } from "@/lib/chart-study/progress";
import {
  averageCost,
  buy,
  buyAndHoldValue,
  candleIndex,
  generateMarket,
  halfOf,
  HISTORY_DAYS,
  INITIAL_CASH,
  initialAccount,
  LOT,
  maxBuyable,
  returnPct,
  sell,
  totalValue,
  TRADING_DAYS,
  type Account,
  type Market,
  type Trade,
} from "@/lib/chart-study/trade";
import CandleChart, { type ChartLine } from "./CandleChart";
import { DOWN_COLOR, UP_COLOR } from "./colors";
import { buttonGhost, buttonPrimary } from "./QuizView";

const WINDOW = 40;
const MA5_COLOR = "#f47b20";
const MA25_COLOR = "#7b5ea7";

type Phase =
  | { kind: "start" }
  | { kind: "play"; market: Market; day: number; account: Account; message: string }
  | { kind: "result"; market: Market; account: Account; lastDay: number };

const yen = (n: number) => `${Math.round(n).toLocaleString("ja-JP")}円`;
const signedYen = (n: number) => `${n >= 0 ? "+" : "−"}${Math.abs(Math.round(n)).toLocaleString("ja-JP")}円`;
const signedPct = (n: number) => `${n >= 0 ? "+" : "−"}${Math.abs(n).toFixed(1)}%`;
const tone = (n: number) => (n > 0 ? UP_COLOR : n < 0 ? DOWN_COLOR : undefined);

function maLines(market: Market): ChartLine[] {
  return [
    { values: market.ma5, color: MA5_COLOR, label: "5日線" },
    { values: market.ma25, color: MA25_COLOR, label: "25日線", dashed: true },
  ];
}

/** candles の from〜to（両端含む）を切り出したチャート用データ */
function sliceChart(market: Market, trades: Trade[], from: number, to: number) {
  return {
    candles: market.candles.slice(from, to + 1),
    lines: maLines(market).map((l) => ({ ...l, values: l.values.slice(from, to + 1) })),
    marks: trades
      .map((t) => ({ index: candleIndex(t.day) - from, side: t.side }))
      .filter((m) => m.index >= 0 && m.index <= to - from),
  };
}

export default function VirtualTrade() {
  const [phase, setPhase] = useState<Phase>({ kind: "start" });
  const topRef = useRef<HTMLDivElement>(null);

  function go(next: Phase) {
    setPhase(next);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function start() {
    const market = generateMarket(Math.floor(Math.random() * 1_000_000_000));
    go({
      kind: "play",
      market,
      day: 0,
      account: initialAccount,
      message: "1日目です。チャートを見て、買うか、様子を見るか決めましょう。",
    });
  }

  /** lastDay の終値で成績を計算して終了する（途中で終了した場合も同じ） */
  function finish(market: Market, account: Account, lastDay: number) {
    const price = market.candles[candleIndex(lastDay)].close;
    recordTradeResult({
      at: new Date().toISOString(),
      name: market.name,
      returnPct: returnPct(totalValue(account, price)),
      holdReturnPct: returnPct(buyAndHoldValue(market, lastDay)),
      trades: account.trades.length,
    });
    go({ kind: "result", market, account, lastDay });
  }

  return (
    <div ref={topRef} className="scroll-mt-6">
      {phase.kind === "start" && <StartView onStart={start} />}
      {phase.kind === "play" && (
        <PlayView
          phase={phase}
          onChange={(p) => setPhase(p)}
          onFinish={(lastDay) => finish(phase.market, phase.account, lastDay)}
        />
      )}
      {phase.kind === "result" && (
        <ResultView
          market={phase.market}
          account={phase.account}
          lastDay={phase.lastDay}
          onRetry={start}
        />
      )}
    </div>
  );
}

function StartView({ onStart }: { onStart: () => void }) {
  const { tradeHistory } = useProgress();
  return (
    <section>
      <h2 className="font-display text-xl font-bold text-brand-navy">ルール</h2>
      <ul className="mt-4 space-y-2 text-sm leading-relaxed text-brand-navy/85">
        <li>・仮想のお金 <strong>100万円</strong> からスタート。架空の銘柄を{TRADING_DAYS}日間売買します。</li>
        <li>・「次の日へ」を押すと、チャートが1日ずつ進みます。</li>
        <li>・売買はその日の<strong>終値</strong>で、<strong>{LOT}株単位</strong>。手数料は0円、税金は考えません。</li>
        <li>・最後に、「1日目に買って持ち続けた場合」と成績をくらべます。</li>
      </ul>
      <button type="button" className={`${buttonPrimary} mt-8 w-full sm:w-auto`} onClick={onStart}>
        トレードをはじめる →
      </button>

      {tradeHistory.length > 0 && (
        <div className="mt-10">
          <h3 className="font-bold text-brand-navy">これまでの成績</h3>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead className="text-xs text-brand-navy/55">
                <tr>
                  <th className="py-2 font-normal">日付・銘柄</th>
                  <th className="py-2 text-right font-normal">あなた</th>
                  <th className="py-2 text-right font-normal">持ち続けた場合</th>
                </tr>
              </thead>
              <tbody>
                {tradeHistory.slice(0, 10).map((r) => (
                  <tr key={r.at} className="border-t border-brand-navy/10">
                    <td className="py-2 text-brand-navy/80">
                      {new Date(r.at).toLocaleDateString("ja-JP", { month: "numeric", day: "numeric" })}{" "}
                      {r.name}
                      <span className="ml-1 text-xs text-brand-navy/50">（{r.trades}回）</span>
                    </td>
                    <td className="py-2 text-right font-bold" style={{ color: tone(r.returnPct) }}>
                      {signedPct(r.returnPct)}
                    </td>
                    <td className="py-2 text-right text-brand-navy/70">{signedPct(r.holdReturnPct)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}

function PlayView({
  phase,
  onChange,
  onFinish,
}: {
  phase: Extract<Phase, { kind: "play" }>;
  onChange: (p: Phase) => void;
  onFinish: (lastDay: number) => void;
}) {
  const { market, day, account, message } = phase;
  const idx = candleIndex(day);
  const today = market.candles[idx];
  const price = today.close;
  const prevClose = market.candles[idx - 1].close;
  const dayChange = ((price - prevClose) / prevClose) * 100;

  const value = totalValue(account, price);
  const profit = value - INITIAL_CASH;
  const avg = averageCost(account);
  const unrealized = account.shares * (price - avg);

  const canBuyAll = maxBuyable(account.cash, price);
  const canBuyHalf = halfOf(canBuyAll);
  const canSellAll = account.shares;
  const canSellHalf = halfOf(account.shares);

  const from = Math.max(0, idx - WINDOW + 1);
  const chart = sliceChart(market, account.trades, from, idx);
  const isLast = day === TRADING_DAYS - 1;

  function doBuy(shares: number) {
    onChange({
      ...phase,
      account: buy(account, day, price, shares),
      message: `${shares.toLocaleString("ja-JP")}株を ${yen(price)} で買いました（${yen(shares * price)}）。`,
    });
  }

  function doSell(shares: number) {
    const pnl = shares * (price - avg);
    onChange({
      ...phase,
      account: sell(account, day, price, shares),
      message: `${shares.toLocaleString("ja-JP")}株を ${yen(price)} で売りました（損益 ${signedYen(pnl)}）。`,
    });
  }

  function nextDay() {
    if (isLast) {
      onFinish(day);
      return;
    }
    onChange({ ...phase, day: day + 1, message: "" });
  }

  return (
    <section>
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="font-display text-lg font-bold text-brand-navy">
          {market.name}
          <span className="block font-sans text-xs font-normal text-brand-navy/50 min-[400px]:ml-1 min-[400px]:inline">
            （架空の銘柄）
          </span>
        </h2>
        <p className="shrink-0 text-sm font-bold text-brand-navy">
          {day + 1}
          <span className="font-normal text-brand-navy/60"> / {TRADING_DAYS}日目</span>
        </p>
      </div>
      <div
        className="mt-2 h-2 overflow-hidden rounded-full bg-brand-navy/10"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={TRADING_DAYS}
        aria-valuenow={day + 1}
        aria-label="経過日数"
      >
        <div
          className="h-full rounded-full bg-brand-orange transition-all"
          style={{ width: `${((day + 1) / TRADING_DAYS) * 100}%` }}
        />
      </div>

      <figure className="mt-4 rounded-2xl border border-[#edf0f2] bg-white p-3">
        <CandleChart
          candles={chart.candles}
          slots={WINDOW}
          height={320}
          lines={chart.lines}
          marks={chart.marks}
          showVolume
          yPadding={0.16}
          ariaLabel={`${market.name}の直近${chart.candles.length}日のチャート。今日の終値は${yen(price)}`}
        />
      </figure>

      <div className="mt-3 flex items-baseline justify-between gap-3">
        <p className="shrink-0 text-sm text-brand-navy/70">今日の終値</p>
        <p className="text-right">
          <span className="text-2xl font-bold text-brand-navy">{yen(price)}</span>
          <span
            className="ml-2 inline-block whitespace-nowrap text-sm font-bold"
            style={{ color: tone(dayChange) }}
          >
            前日比 {signedPct(dayChange)}
          </span>
        </p>
      </div>

      <div className="mt-4 rounded-2xl bg-brand-cream p-4">
        <div className="flex items-baseline justify-between gap-3">
          <p className="shrink-0 text-sm font-bold text-brand-navy">総資産</p>
          <p className="text-right">
            <span className="text-xl font-bold text-brand-navy">{yen(value)}</span>
            <span className="ml-2 text-sm font-bold" style={{ color: tone(profit) }}>
              {signedYen(profit)}（{signedPct(returnPct(value))}）
            </span>
          </p>
        </div>
        <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-1.5 text-sm min-[420px]:grid-cols-2">
          <div className="flex justify-between">
            <dt className="text-brand-navy/60">現金</dt>
            <dd className="font-semibold text-brand-navy">{yen(account.cash)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-brand-navy/60">保有株数</dt>
            <dd className="font-semibold text-brand-navy">{account.shares.toLocaleString("ja-JP")}株</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-brand-navy/60">平均取得単価</dt>
            <dd className="font-semibold text-brand-navy">{account.shares ? yen(avg) : "—"}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-brand-navy/60">含み損益</dt>
            <dd className="font-semibold" style={{ color: tone(unrealized) }}>
              {account.shares ? signedYen(unrealized) : "—"}
            </dd>
          </div>
        </dl>
      </div>

      <p className="mt-3 min-h-6 text-sm text-brand-navy/80" aria-live="polite">
        {message}
      </p>

      <div className="mt-2 grid grid-cols-2 gap-3">
        <TradeButton side="buy" label="半分買う" shares={canBuyHalf} onClick={() => doBuy(canBuyHalf)} />
        <TradeButton side="buy" label="買えるだけ買う" shares={canBuyAll} onClick={() => doBuy(canBuyAll)} />
        <TradeButton side="sell" label="半分売る" shares={canSellHalf} onClick={() => doSell(canSellHalf)} />
        <TradeButton side="sell" label="全部売る" shares={canSellAll} onClick={() => doSell(canSellAll)} />
      </div>

      <button type="button" className={`${buttonPrimary} mt-5 w-full text-base`} onClick={nextDay}>
        {isLast ? "結果を見る →" : "次の日へ ▶"}
      </button>
      {!isLast && (
        <div className="mt-1 text-center">
          <button
            type="button"
            className="min-h-11 px-4 text-xs font-semibold text-brand-blue-deep underline hover:opacity-70"
            onClick={() => {
              if (window.confirm("ここで終了して、今日の終値で成績を計算しますか？")) onFinish(day);
            }}
          >
            ここで終了する
          </button>
        </div>
      )}

      {account.trades.length > 0 && (
        <details className="mt-6 rounded-2xl border border-brand-navy/10 p-4 text-sm">
          <summary className="cursor-pointer font-bold text-brand-navy">
            売買の記録（{account.trades.length}回）
          </summary>
          <TradeLog trades={account.trades} />
        </details>
      )}
    </section>
  );
}

function TradeButton({
  side,
  label,
  shares,
  onClick,
}: {
  side: "buy" | "sell";
  label: string;
  shares: number;
  onClick: () => void;
}) {
  const color = side === "buy" ? UP_COLOR : DOWN_COLOR;
  const disabled = shares <= 0;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="min-h-14 rounded-2xl border-2 bg-white px-2 py-2 text-center transition enabled:hover:bg-brand-cream disabled:cursor-not-allowed disabled:opacity-35"
      style={{ borderColor: color, color }}
    >
      <span className="block text-sm font-bold">
        {side === "buy" ? "▲ " : "▼ "}
        {label}
      </span>
      <span className="block text-xs">{disabled ? "—" : `${shares.toLocaleString("ja-JP")}株`}</span>
    </button>
  );
}

function TradeLog({ trades }: { trades: Trade[] }) {
  return (
    <ol className="mt-3 space-y-1">
      {[...trades].reverse().map((t, i) => (
        <li key={i} className="flex justify-between gap-2 text-brand-navy/80">
          <span>
            {t.day + 1}日目{" "}
            <strong style={{ color: t.side === "buy" ? UP_COLOR : DOWN_COLOR }}>
              {t.side === "buy" ? "買" : "売"}
            </strong>{" "}
            {t.shares.toLocaleString("ja-JP")}株
          </span>
          <span>
            @ {yen(t.price)}（{yen(t.shares * t.price)}）
          </span>
        </li>
      ))}
    </ol>
  );
}

function ResultView({
  market,
  account,
  lastDay,
  onRetry,
}: {
  market: Market;
  account: Account;
  lastDay: number;
  onRetry: () => void;
}) {
  const price = market.candles[candleIndex(lastDay)].close;
  const value = totalValue(account, price);
  const myPct = returnPct(value);

  const holdPct = returnPct(buyAndHoldValue(market, lastDay));
  const diff = myPct - holdPct;

  const from = Math.max(0, candleIndex(0) - 10);
  const chart = sliceChart(market, account.trades, from, candleIndex(lastDay));

  const comment =
    account.trades.length === 0
      ? "一度も売買しませんでした。様子を見るのも立派な判断です。次は、気になるサインが出たら少しだけ買ってみては？"
      : diff >= 1
        ? "買って持ち続けるより、良い成績でした！どのサインを見て売買したか、振り返ってみましょう。"
        : diff <= -1
          ? "今回は「買って持ち続けた場合」に届きませんでした。売買の回数が多すぎなかったか、チャートのマークで振り返ってみましょう。"
          : "「買って持ち続けた場合」とほぼ同じ成績でした。";

  return (
    <section>
      <div className="rounded-3xl bg-brand-cream p-6 text-center">
        <p className="text-sm font-bold text-brand-navy/60">
          {market.name}・{lastDay + 1}日間の結果
        </p>
        <p className="mt-2 font-display text-3xl font-bold text-brand-navy">{yen(value)}</p>
        <p className="mt-1 text-lg font-bold" style={{ color: tone(myPct) }}>
          {signedYen(value - INITIAL_CASH)}（{signedPct(myPct)}）
        </p>
      </div>

      <dl className="mt-5 space-y-2 text-sm">
        <div className="flex justify-between rounded-2xl border-2 border-brand-orange bg-white px-4 py-3">
          <dt className="font-bold text-brand-navy">あなたの成績</dt>
          <dd className="font-bold" style={{ color: tone(myPct) }}>
            {signedPct(myPct)}
          </dd>
        </div>
        <div className="flex justify-between rounded-2xl border border-brand-navy/10 bg-white px-4 py-3">
          <dt className="text-brand-navy/80">1日目に買えるだけ買って、持ち続けた場合</dt>
          <dd className="shrink-0 pl-2 font-bold" style={{ color: tone(holdPct) }}>
            {signedPct(holdPct)}
          </dd>
        </div>
        <div className="flex justify-between rounded-2xl border border-brand-navy/10 bg-white px-4 py-3">
          <dt className="text-brand-navy/80">何も買わなかった場合</dt>
          <dd className="font-bold text-brand-navy">±0.0%</dd>
        </div>
        <div className="flex justify-between px-4 pt-1 text-brand-navy/70">
          <dt>売買回数</dt>
          <dd>
            {account.trades.length}回（買い {account.trades.filter((t) => t.side === "buy").length}・売り{" "}
            {account.trades.filter((t) => t.side === "sell").length}）
          </dd>
        </div>
      </dl>

      <p className="mt-5 text-sm leading-relaxed text-brand-navy/85">{comment}</p>

      <figure className="mt-5 rounded-2xl border border-[#edf0f2] bg-white p-3">
        <CandleChart
          candles={chart.candles}
          height={300}
          lines={chart.lines}
          marks={chart.marks}
          divider={candleIndex(0) - from}
          yPadding={0.16}
          ariaLabel={`${market.name}の売買期間のチャートと、売買したポイント`}
        />
        <figcaption className="mt-1 text-center text-xs text-brand-navy/55">
          点線から右が売買した期間。▲買＝買ったところ、▼売＝売ったところ
        </figcaption>
      </figure>

      {account.trades.length > 0 && (
        <div className="mt-5 rounded-2xl border border-brand-navy/10 p-4 text-sm">
          <p className="font-bold text-brand-navy">売買の記録</p>
          <TradeLog trades={account.trades} />
        </div>
      )}

      <p className="mt-5 rounded-2xl bg-brand-cream px-4 py-3 text-xs leading-relaxed text-brand-navy/75">
        ⚠ 実際の取引では、売買のたびに手数料や税金がかかることがあり、思った値段で売買できないこともあります。
        ここでの成績は架空のデータによる練習で、実際の投資の成果を約束するものではありません。
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button type="button" className={buttonPrimary} onClick={onRetry}>
          別の銘柄でもう一度
        </button>
        <Link href="/money/chart-study" className={buttonGhost}>
          学習トップへ
        </Link>
      </div>
      <p className="mt-4 text-center text-xs text-brand-navy/50">
        過去{HISTORY_DAYS}日分のチャートを見てからスタートしています。
      </p>
    </section>
  );
}

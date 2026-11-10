import type { Candle } from "@/lib/chart-study/candles";
import { DOWN_COLOR, UP_COLOR } from "./colors";

const W = 400;
const PAD = { top: 34, right: 48, bottom: 14, left: 6 };
const VOLUME_H = 48;
export const INDICATOR_H = 104;
/** 隠れていた部分のローソク足を1本ずつ出す間隔（ms） */
const STAGGER_MS = 70;

export type ChartLine = {
  values: (number | null)[];
  color: string;
  label: string;
  dashed?: boolean;
  /** true のとき、縦軸の範囲にこの線も含める（ボリンジャーバンドなど） */
  fitRange?: boolean;
};

/** 2本の線のあいだを塗る帯（一目均衡表の雲など）。a が b より上なら colorUp、下なら colorDown */
export type ChartBand = {
  a: (number | null)[];
  b: (number | null)[];
  label: string;
  colorUp: string;
  colorDown: string;
};

/** チャートの下に出すオシレーター系の指標 */
export type IndicatorPanel =
  | { kind: "rsi"; values: (number | null)[] }
  | {
      kind: "macd";
      line: (number | null)[];
      signal: (number | null)[];
      histogram: (number | null)[];
    };

export default function CandleChart({
  candles,
  slots,
  height = 240,
  labels = [],
  highlight,
  lines = [],
  hlines = [],
  showVolume = false,
  divider,
  animateFrom,
  marks = [],
  yPadding = 0.06,
  indicator,
  bands = [],
  ariaLabel,
}: {
  candles: Candle[];
  /** 横軸の本数。candles より多くすると右側が空白（まだ見えない未来）になる */
  slots?: number;
  height?: number;
  labels?: { index: number; text: string }[];
  highlight?: { from: number; to: number };
  /** 移動平均線など。values は candles と同じ並び */
  lines?: ChartLine[];
  /** 水平線（ネックライン・サポートラインなど） */
  hlines?: { price: number; label: string }[];
  showVolume?: boolean;
  /** この本数目の左に「ここから先」の区切り線を引く */
  divider?: number;
  /** この本数目以降をアニメーションで順に表示する */
  animateFrom?: number;
  /** 売買マーク（買い＝ローソク足の下に▲、売り＝上に▼） */
  marks?: { index: number; side: "buy" | "sell" }[];
  /** 値段の上下に取る余白（値幅に対する割合）。売買マークを出すときは広めに */
  yPadding?: number;
  /** チャートの下に RSI・MACD を表示する（values は candles と同じ並び） */
  indicator?: IndicatorPanel;
  /** 線のあいだを塗る帯（一目均衡表の雲など）。縦軸の範囲にも含める */
  bands?: ChartBand[];
  ariaLabel?: string;
}) {
  const n = candles.length;
  const totalSlots = Math.max(slots ?? n, n);
  const volumeH = showVolume ? VOLUME_H : 0;
  const indicatorH = indicator ? INDICATOR_H : 0;
  const plotW = W - PAD.left - PAD.right;
  const plotH = height - PAD.top - PAD.bottom - volumeH - indicatorH;
  const slot = plotW / totalSlots;
  const bodyW = Math.min(slot * 0.62, 34);

  // 縦軸はローソク足と水平線に合わせる。移動平均線が大きく離れているときは、はみ出た部分を描かない
  const fitValues = [
    ...lines.filter((l) => l.fitRange).map((l) => l.values),
    ...bands.flatMap((band) => [band.a, band.b]),
  ].flatMap((values) => values.slice(0, n).filter((v): v is number => v !== null));
  const rawMin = Math.min(...candles.map((c) => c.low), ...hlines.map((h) => h.price), ...fitValues);
  const rawMax = Math.max(...candles.map((c) => c.high), ...hlines.map((h) => h.price), ...fitValues);
  const margin = (rawMax - rawMin) * yPadding || rawMax * 0.01;
  const min = rawMin - margin;
  const max = rawMax + margin;
  const maxVolume = Math.max(...candles.map((c) => c.volume));

  const x = (i: number) => PAD.left + slot * (i + 0.5);
  const y = (p: number) => PAD.top + ((max - p) / (max - min)) * plotH;
  const volumeTop = PAD.top + plotH + 8;
  const indicatorTop = PAD.top + plotH + volumeH + 14;
  /** 区切り線・「?」の背景を、出来高・指標の欄まで伸ばす高さ */
  const fullH = plotH + 12 + volumeH + indicatorH;

  const gridValues = [0.15, 0.5, 0.85].map((r) => Math.round(min + (max - min) * r));

  const animated = (i: number) => animateFrom !== undefined && i >= animateFrom;
  const delay = (i: number) => (animateFrom === undefined ? 0 : (i - animateFrom) * STAGGER_MS);
  const appear = (i: number) =>
    animated(i) ? { animation: "candle-in 0.3s ease-out both", animationDelay: `${delay(i)}ms` } : undefined;
  // 隠れていた部分の線・注釈は、ローソク足が出そろってから表示する
  const afterAll =
    animateFrom !== undefined
      ? { animation: "candle-in 0.4s ease-out both", animationDelay: `${(n - animateFrom) * STAGGER_MS}ms` }
      : undefined;

  function linePath(
    values: (number | null)[],
    from: number,
    to: number,
    yOf: (v: number) => number = y,
    lo = min,
    hi = max,
  ) {
    let d = "";
    let pen = false;
    for (let i = from; i < Math.min(to, n); i++) {
      const v = values[i];
      if (v === null || v === undefined || v < lo || v > hi) {
        pen = false;
        continue;
      }
      d += `${pen ? "L" : "M"}${x(i).toFixed(1)},${yOf(v).toFixed(1)}`;
      pen = true;
    }
    return d;
  }

  /** 線を「見えていた部分」と「後から出る部分」に分けて描く */
  function splitPaths(
    values: (number | null)[],
    yOf: (v: number) => number,
    lo: number,
    hi: number,
  ) {
    const cut = animateFrom !== undefined ? animateFrom : n;
    return (
      <>
        <path d={linePath(values, 0, cut, yOf, lo, hi)} />
        {animateFrom !== undefined && (
          <path d={linePath(values, Math.max(animateFrom - 1, 0), n, yOf, lo, hi)} style={afterAll} />
        )}
      </>
    );
  }

  function renderIndicator() {
    if (!indicator) return null;
    const top = indicatorTop;
    const h = INDICATOR_H - 18;
    const axisLabel = (text: string, yy: number) => (
      <text x={W - PAD.right + 6} y={yy + 4} fontSize={10} fill="#24313a" fillOpacity={0.55}>
        {text}
      </text>
    );

    if (indicator.kind === "rsi") {
      const yR = (v: number) => top + ((100 - v) / 100) * h;
      return (
        <g>
          <rect x={PAD.left} y={yR(70)} width={plotW} height={yR(30) - yR(70)} fill="#24313a" opacity={0.04} />
          {[30, 70].map((v) => (
            <line
              key={v}
              x1={PAD.left}
              x2={W - PAD.right}
              y1={yR(v)}
              y2={yR(v)}
              stroke="#24313a"
              strokeOpacity={0.35}
              strokeDasharray="3 3"
            />
          ))}
          {axisLabel("70", yR(70))}
          {axisLabel("30", yR(30))}
          <text x={PAD.left + 2} y={top + 2} fontSize={10} fontWeight={700} fill="#24313a" fillOpacity={0.7}>
            RSI（14）
          </text>
          <g fill="none" stroke="#0f8a7e" strokeWidth={1.8}>
            {splitPaths(indicator.values, yR, 0, 100)}
          </g>
        </g>
      );
    }

    // 縦の目盛りは、いま表示している範囲の値に合わせる
    const visible = [indicator.line, indicator.signal, indicator.histogram]
      .flatMap((series) => series.slice(0, n))
      .filter((v): v is number => v !== null);
    const range = Math.max(...visible.map((v) => Math.abs(v)), 1e-6) * 1.1;
    const yM = (v: number) => top + h / 2 - (v / range) * (h / 2);
    return (
      <g>
        <line
          x1={PAD.left}
          x2={W - PAD.right}
          y1={yM(0)}
          y2={yM(0)}
          stroke="#24313a"
          strokeOpacity={0.35}
        />
        {axisLabel("0", yM(0))}
        <text x={PAD.left + 2} y={top + 2} fontSize={10} fontWeight={700} fill="#24313a" fillOpacity={0.7}>
          MACD（12・26・9）
          <tspan fill="#0f8a7e"> ━ MACD</tspan>
          <tspan fill="#c2410c"> ┅ シグナル</tspan>
        </text>
        {indicator.histogram.slice(0, n).map((v, i) =>
          v === null ? null : (
            <rect
              key={`h${i}`}
              x={x(i) - bodyW / 2}
              y={Math.min(yM(0), yM(v))}
              width={bodyW}
              height={Math.abs(yM(v) - yM(0))}
              fill={v >= 0 ? UP_COLOR : DOWN_COLOR}
              fillOpacity={0.3}
              style={appear(i)}
            />
          ),
        )}
        <g fill="none" stroke="#0f8a7e" strokeWidth={1.8}>
          {splitPaths(indicator.line, yM, -Infinity, Infinity)}
        </g>
        <g fill="none" stroke="#c2410c" strokeWidth={1.5} strokeDasharray="4 3">
          {splitPaths(indicator.signal, yM, -Infinity, Infinity)}
        </g>
      </g>
    );
  }

  return (
    <svg
      viewBox={`0 0 ${W} ${height}`}
      className="h-auto w-full"
      role="img"
      aria-label={ariaLabel ?? `ローソク足チャート（${n}本）`}
    >
      {highlight && (
        <rect
          x={PAD.left + slot * highlight.from}
          y={PAD.top - 6}
          width={slot * (highlight.to - highlight.from + 1)}
          height={plotH + 12}
          rx={6}
          fill="var(--brand-yellow)"
          fillOpacity={0.35}
          style={animated(highlight.from) ? afterAll : undefined}
        />
      )}

      {divider !== undefined && (
        <>
          {n <= divider && (
            <>
              <rect
                x={PAD.left + slot * divider}
                y={PAD.top - 6}
                width={slot * (totalSlots - divider)}
                height={fullH}
                rx={6}
                fill="#24313a"
                opacity={0.05}
              />
              <text
                x={PAD.left + slot * ((divider + totalSlots) / 2)}
                y={PAD.top + plotH / 2 + 12}
                textAnchor="middle"
                fontSize={34}
                fontWeight={700}
                fill="#24313a"
                fillOpacity={0.25}
              >
                ?
              </text>
            </>
          )}
          <line
            x1={PAD.left + slot * divider}
            x2={PAD.left + slot * divider}
            y1={PAD.top - 10}
            y2={PAD.top - 6 + fullH}
            stroke="#24313a"
            strokeOpacity={0.45}
            strokeDasharray="4 3"
          />
        </>
      )}

      {gridValues.map((v) => (
        <g key={v}>
          <line
            x1={PAD.left}
            x2={W - PAD.right}
            y1={y(v)}
            y2={y(v)}
            stroke="#24313a"
            strokeOpacity={0.1}
            strokeDasharray="3 4"
          />
          <text x={W - PAD.right + 6} y={y(v) + 4} fontSize={11} fill="#24313a" fillOpacity={0.55}>
            {v.toLocaleString("ja-JP")}
          </text>
        </g>
      ))}

      {hlines.map((h) => (
        <g key={h.label} style={afterAll}>
          <line
            x1={PAD.left}
            x2={W - PAD.right}
            y1={y(h.price)}
            y2={y(h.price)}
            stroke="var(--brand-orange-deep)"
            strokeWidth={1.5}
            strokeDasharray="6 4"
          />
        </g>
      ))}

      {showVolume &&
        candles.map((c, i) => {
          const h = (c.volume / maxVolume) * (VOLUME_H - 8);
          return (
            <rect
              key={`v${i}`}
              x={x(i) - bodyW / 2}
              y={volumeTop + (VOLUME_H - 8) - h}
              width={bodyW}
              height={h}
              fill="#24313a"
              fillOpacity={0.22}
              style={appear(i)}
            />
          );
        })}
      {showVolume && (
        <text x={W - PAD.right + 6} y={volumeTop + 14} fontSize={11} fill="#24313a" fillOpacity={0.55}>
          出来高
        </text>
      )}

      {bands.map((band) => (
        <g key={band.label}>
          {candles.map((_, i) => {
            const [a0, b0, a1, b1] = [band.a[i], band.b[i], band.a[i + 1], band.b[i + 1]];
            if (i + 1 >= n || a0 == null || b0 == null || a1 == null || b1 == null) return null;
            const points = `${x(i)},${y(a0)} ${x(i + 1)},${y(a1)} ${x(i + 1)},${y(b1)} ${x(i)},${y(b0)}`;
            return (
              <polygon
                key={i}
                points={points}
                fill={a0 >= b0 ? band.colorUp : band.colorDown}
                fillOpacity={0.22}
                style={animated(i + 1) ? afterAll : undefined}
              />
            );
          })}
        </g>
      ))}

      {candles.map((c, i) => {
        const up = c.close >= c.open;
        const color = up ? UP_COLOR : DOWN_COLOR;
        const top = y(Math.max(c.open, c.close));
        const bottom = y(Math.min(c.open, c.close));
        return (
          <g key={i} style={appear(i)}>
            <line x1={x(i)} x2={x(i)} y1={y(c.high)} y2={y(c.low)} stroke={color} strokeWidth={1.5} />
            <rect
              x={x(i) - bodyW / 2}
              y={top}
              width={bodyW}
              height={Math.max(bottom - top, 1.5)}
              fill={up ? "#ffffff" : color}
              stroke={color}
              strokeWidth={1.5}
            />
          </g>
        );
      })}

      {lines.map((l) => (
        <g key={l.label} fill="none" stroke={l.color} strokeWidth={2} strokeDasharray={l.dashed ? "5 3" : undefined}>
          {splitPaths(l.values, y, min, max)}
        </g>
      ))}

      {marks.map((m, i) => {
        const c = candles[m.index];
        if (!c) return null;
        const cx = x(m.index);
        const buy = m.side === "buy";
        const tip = buy ? y(c.low) + 4 : y(c.high) - 4;
        const base = buy ? tip + 9 : tip - 9;
        return (
          <g key={`m${i}`}>
            <path
              d={`M${cx},${tip} L${cx - 5},${base} L${cx + 5},${base} Z`}
              fill={buy ? UP_COLOR : DOWN_COLOR}
            />
            <text
              x={cx}
              y={buy ? base + 11 : base - 3}
              textAnchor="middle"
              fontSize={10}
              fontWeight={700}
              fill={buy ? UP_COLOR : DOWN_COLOR}
            >
              {buy ? "買" : "売"}
            </text>
          </g>
        );
      })}

      {lines.length + bands.length > 0 && (
        <g fontSize={11} fontWeight={700}>
          {bands.map((band, i) => (
            <g key={band.label} transform={`translate(${PAD.left + 4 + (lines.length + i) * 82}, 10)`}>
              <rect x={0} y={-5} width={18} height={10} fill={band.colorUp} fillOpacity={0.35} />
              <text x={22} y={4} fill="#24313a" fillOpacity={0.75}>
                {band.label}
              </text>
            </g>
          ))}
          {lines.map((l, i) => (
            <g key={l.label} transform={`translate(${PAD.left + 4 + i * 82}, 10)`}>
              <line
                x1={0}
                x2={18}
                y1={0}
                y2={0}
                stroke={l.color}
                strokeWidth={2}
                strokeDasharray={l.dashed ? "5 3" : undefined}
              />
              <text x={22} y={4} fill="#24313a" fillOpacity={0.75}>
                {l.label}
              </text>
            </g>
          ))}
        </g>
      )}

      {indicator && renderIndicator()}

      {/* 水平線の名前は、ローソク足に隠れないよう最後に描く */}
      {hlines.map((h) => (
        <g key={`${h.label}-text`} style={afterAll}>
          <text
            x={PAD.left + 4}
            y={y(h.price) - 5}
            fontSize={12}
            fontWeight={700}
            fill="var(--brand-orange-deep)"
            stroke="#ffffff"
            strokeWidth={3}
            paintOrder="stroke"
          >
            {h.label}
          </text>
        </g>
      ))}

      {labels.map((label) => {
        const c = candles[label.index];
        if (!c) return null;
        const cx = x(label.index);
        const anchor = cx < 60 ? "start" : cx > W - PAD.right - 50 ? "end" : "middle";
        // 注釈はローソク足と重ならないよう、上部の余白にまとめて置く（凡例があるときは少し下げる）
        const ty = lines.length + bands.length > 0 ? 28 : 18;
        return (
          <g key={`${label.index}-${label.text}`} style={animated(label.index) ? afterAll : undefined}>
            <line
              x1={cx}
              x2={cx}
              y1={ty + 4}
              y2={y(c.high) - 3}
              stroke="var(--brand-orange)"
              strokeWidth={1.5}
            />
            <text
              x={cx}
              y={ty}
              textAnchor={anchor}
              fontSize={15}
              fontWeight={700}
              fill="var(--brand-orange-deep)"
              stroke="#ffffff"
              strokeWidth={4}
              strokeLinejoin="round"
              paintOrder="stroke"
            >
              {label.text}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

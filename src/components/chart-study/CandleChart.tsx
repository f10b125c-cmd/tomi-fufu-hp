import type { Candle } from "@/lib/chart-study/candles";
import { DOWN_COLOR, UP_COLOR } from "./colors";

const W = 400;
const PAD = { top: 34, right: 48, bottom: 14, left: 6 };
const VOLUME_H = 48;
/** 隠れていた部分のローソク足を1本ずつ出す間隔（ms） */
const STAGGER_MS = 70;

export type ChartLine = {
  values: (number | null)[];
  color: string;
  label: string;
  dashed?: boolean;
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
  ariaLabel?: string;
}) {
  const n = candles.length;
  const totalSlots = Math.max(slots ?? n, n);
  const volumeH = showVolume ? VOLUME_H : 0;
  const plotW = W - PAD.left - PAD.right;
  const plotH = height - PAD.top - PAD.bottom - volumeH;
  const slot = plotW / totalSlots;
  const bodyW = Math.min(slot * 0.62, 34);

  const lineValues = lines.flatMap((l) => l.values.slice(0, n).filter((v): v is number => v !== null));
  const rawMin = Math.min(...candles.map((c) => c.low), ...lineValues, ...hlines.map((h) => h.price));
  const rawMax = Math.max(...candles.map((c) => c.high), ...lineValues, ...hlines.map((h) => h.price));
  const margin = (rawMax - rawMin) * 0.06 || rawMax * 0.01;
  const min = rawMin - margin;
  const max = rawMax + margin;
  const maxVolume = Math.max(...candles.map((c) => c.volume));

  const x = (i: number) => PAD.left + slot * (i + 0.5);
  const y = (p: number) => PAD.top + ((max - p) / (max - min)) * plotH;
  const volumeTop = PAD.top + plotH + 8;

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

  function linePath(values: (number | null)[], from: number, to: number) {
    let d = "";
    let pen = false;
    for (let i = from; i < Math.min(to, n); i++) {
      const v = values[i];
      if (v === null || v === undefined) {
        pen = false;
        continue;
      }
      d += `${pen ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`;
      pen = true;
    }
    return d;
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
          opacity={0.35}
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
                height={plotH + 12 + volumeH}
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
            y2={PAD.top + plotH + 6 + volumeH}
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
              opacity={0.22}
              style={appear(i)}
            />
          );
        })}
      {showVolume && (
        <text x={W - PAD.right + 6} y={volumeTop + 14} fontSize={11} fill="#24313a" fillOpacity={0.55}>
          出来高
        </text>
      )}

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
          <path d={linePath(l.values, 0, animateFrom !== undefined ? animateFrom : n)} />
          {animateFrom !== undefined && (
            <path d={linePath(l.values, Math.max(animateFrom - 1, 0), n)} style={afterAll} />
          )}
        </g>
      ))}

      {lines.length > 0 && (
        <g fontSize={11} fontWeight={700}>
          {lines.map((l, i) => (
            <g key={l.label} transform={`translate(${PAD.left + 4 + i * 74}, 10)`}>
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

      {labels.map((label) => {
        const c = candles[label.index];
        if (!c) return null;
        const cx = x(label.index);
        const anchor = cx < 60 ? "start" : cx > W - PAD.right - 50 ? "end" : "middle";
        // 注釈はローソク足と重ならないよう、上部の余白にまとめて置く（凡例があるときは少し下げる）
        const ty = lines.length > 0 ? 28 : 18;
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

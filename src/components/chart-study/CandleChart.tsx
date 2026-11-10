import type { Candle } from "@/lib/chart-study/candles";
import { DOWN_COLOR, UP_COLOR } from "./colors";

const W = 400;
const PAD = { top: 34, right: 48, bottom: 14, left: 6 };

export default function CandleChart({
  candles,
  height = 240,
  labels = [],
  highlight,
  ariaLabel,
}: {
  candles: Candle[];
  height?: number;
  labels?: { index: number; text: string }[];
  highlight?: { from: number; to: number };
  ariaLabel?: string;
}) {
  const n = candles.length;
  const plotW = W - PAD.left - PAD.right;
  const plotH = height - PAD.top - PAD.bottom;
  const slot = plotW / n;
  const bodyW = Math.min(slot * 0.62, 34);

  const rawMin = Math.min(...candles.map((c) => c.low));
  const rawMax = Math.max(...candles.map((c) => c.high));
  const margin = (rawMax - rawMin) * 0.06 || rawMax * 0.01;
  const min = rawMin - margin;
  const max = rawMax + margin;

  const x = (i: number) => PAD.left + slot * (i + 0.5);
  const y = (p: number) => PAD.top + ((max - p) / (max - min)) * plotH;

  const gridValues = [0.15, 0.5, 0.85].map((r) => Math.round(min + (max - min) * r));

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
        />
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
          <text
            x={W - PAD.right + 6}
            y={y(v) + 4}
            fontSize={11}
            fill="#24313a"
            fillOpacity={0.55}
          >
            {v.toLocaleString("ja-JP")}
          </text>
        </g>
      ))}

      {candles.map((c, i) => {
        const up = c.close >= c.open;
        const color = up ? UP_COLOR : DOWN_COLOR;
        const top = y(Math.max(c.open, c.close));
        const bottom = y(Math.min(c.open, c.close));
        return (
          <g key={i}>
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

      {labels.map((label) => {
        const c = candles[label.index];
        if (!c) return null;
        const cx = x(label.index);
        const anchor = cx < 60 ? "start" : cx > W - PAD.right - 50 ? "end" : "middle";
        // 注釈はローソク足と重ならないよう、上部の余白にまとめて置く
        const ty = 18;
        return (
          <g key={`${label.index}-${label.text}`}>
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

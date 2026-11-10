import { DOWN_COLOR, UP_COLOR } from "./colors";

const HIGH = 56;
const BODY_TOP = 100;
const BODY_BOTTOM = 196;
const LOW = 244;
const BODY_W = 44;

function Candle({ cx, up }: { cx: number; up: boolean }) {
  const color = up ? UP_COLOR : DOWN_COLOR;
  return (
    <g>
      <line x1={cx} x2={cx} y1={HIGH} y2={LOW} stroke={color} strokeWidth={3} />
      <rect
        x={cx - BODY_W / 2}
        y={BODY_TOP}
        width={BODY_W}
        height={BODY_BOTTOM - BODY_TOP}
        fill={up ? "#ffffff" : color}
        stroke={color}
        strokeWidth={3}
      />
    </g>
  );
}

function PriceLabel({ x, y, text, anchor }: { x: number; y: number; text: string; anchor: "start" | "end" }) {
  return (
    <text x={x} y={y + 5} textAnchor={anchor} fontSize={15} fontWeight={700} fill="#24313a">
      {text}
    </text>
  );
}

function PartLabel({ x, y, text, anchor }: { x: number; y: number; text: string; anchor: "start" | "end" }) {
  return (
    <text x={x} y={y + 4} textAnchor={anchor} fontSize={12} fill="#24313a" fillOpacity={0.6}>
      {text}
    </text>
  );
}

/** 陽線・陰線それぞれの「4つの値段」と各部の名前を示す図 */
export default function CandleAnatomy() {
  const upX = 110;
  const downX = 290;
  return (
    <svg
      viewBox="0 0 400 270"
      className="h-auto w-full"
      role="img"
      aria-label="陽線は下が始値・上が終値、陰線は上が始値・下が終値。どちらもヒゲの上端が高値、下端が安値。"
    >
      <text x={upX} y={26} textAnchor="middle" fontSize={15} fontWeight={700} fill={UP_COLOR}>
        陽線（値上がり）
      </text>
      <text x={downX} y={26} textAnchor="middle" fontSize={15} fontWeight={700} fill={DOWN_COLOR}>
        陰線（値下がり）
      </text>

      <Candle cx={upX} up />
      <PriceLabel x={upX - 32} y={HIGH} text="高値" anchor="end" />
      <PriceLabel x={upX - 32} y={BODY_TOP} text="終値" anchor="end" />
      <PriceLabel x={upX - 32} y={BODY_BOTTOM} text="始値" anchor="end" />
      <PriceLabel x={upX - 32} y={LOW} text="安値" anchor="end" />
      <PartLabel x={upX + 10} y={(HIGH + BODY_TOP) / 2} text="上ヒゲ" anchor="start" />
      <PartLabel x={upX + 30} y={(BODY_TOP + BODY_BOTTOM) / 2} text="実体" anchor="start" />
      <PartLabel x={upX + 10} y={(BODY_BOTTOM + LOW) / 2} text="下ヒゲ" anchor="start" />

      <Candle cx={downX} up={false} />
      <PriceLabel x={downX + 32} y={HIGH} text="高値" anchor="start" />
      <PriceLabel x={downX + 32} y={BODY_TOP} text="始値" anchor="start" />
      <PriceLabel x={downX + 32} y={BODY_BOTTOM} text="終値" anchor="start" />
      <PriceLabel x={downX + 32} y={LOW} text="安値" anchor="start" />
      <PartLabel x={downX - 10} y={(HIGH + BODY_TOP) / 2} text="上ヒゲ" anchor="end" />
      <PartLabel x={downX - 30} y={(BODY_TOP + BODY_BOTTOM) / 2} text="実体" anchor="end" />
      <PartLabel x={downX - 10} y={(BODY_BOTTOM + LOW) / 2} text="下ヒゲ" anchor="end" />
    </svg>
  );
}

import { generateFromPath, movingAverage, type Candle, type PathPoint } from "./candles";
import { advancedScenarios } from "./chartQuizAdvanced";
import { acceptedVariants } from "./chartQuizVariants.generated";
import { bollinger, macd, rsi } from "./indicators";

export const VISIBLE_DAYS = 32;
export const FUTURE_DAYS = 12;
/** 25日移動平均線を最初から描くための助走期間（画面には出さない） */
const WARMUP_DAYS = 25;
/** 上級は MACD（26日＋9日）まで最初から描けるよう、助走期間を長くとる */
const ADVANCED_WARMUP_DAYS = 45;

export type QuizLevel = "basic" | "advanced";
export const levelLabels: Record<QuizLevel, string> = { basic: "初級", advanced: "上級" };

export type IndicatorKind = "bb" | "rsi" | "macd";

export type Direction = "up" | "down";

export type ChartQuizScenario = {
  /** 記録用。公開後は変えないこと */
  id: string;
  /** 省略時は初級 */
  level?: QuizLevel;
  /** 上級で表示する指標（bb はチャートに重ねる。rsi・macd は下の欄に1つだけ） */
  indicators?: IndicatorKind[];
  /** 答えのあとに明かすパターン名 */
  pattern: string;
  /** この後の値動き（生成データと一致するかはテストで確認する） */
  expected: Direction;
  /** false＝教科書どおりにならなかった問題（だまし・失敗） */
  textbook: boolean;
  seed: number;
  /** 通過点。day は表示1本目を 0 とする（助走期間はマイナス） */
  path: PathPoint[];
  volatility?: number;
  shadows?: { day: number; upper?: number; lower?: number }[];
  gaps?: { day: number; pct: number }[];
  volumeBoost?: { from: number; to: number; times: number }[];
  showMA?: boolean;
  /** 答えのあとに、最後のゴールデン／デッドクロスの位置へ自動で注釈をつける */
  labelCross?: boolean;
  showVolume?: boolean;
  /** 答えのあとに出す注釈・水平線 */
  labels?: { day: number; text: string }[];
  hlines?: { price: number; label: string }[];
  explanation: string[];
  /** 関連レッスン */
  lessonSlug?: string;
};

const basicScenarios: ChartQuizScenario[] = [
  {
    id: "trend-up",
    pattern: "上昇トレンドの継続",
    expected: "up",
    textbook: true,
    seed: 101,
    path: [[-25, 880], [0, 920], [8, 965], [12, 945], [20, 1005], [24, 985], [31, 1040], [43, 1110]],
    labels: [
      { day: 12, text: "安値↑" },
      { day: 24, text: "安値↑" },
    ],
    explanation: [
      "上下に揺れながらも、山（高値）も谷（安値）も前より高くなっていました。これが上昇トレンドの典型的な形です。",
      "トレンドは「続きやすい」と言われます。流れに逆らわず、まずはトレンドの向きを確認するのが基本です。",
    ],
    lessonSlug: "trend",
  },
  {
    id: "trend-down",
    pattern: "下降トレンドの継続",
    expected: "down",
    textbook: true,
    seed: 102,
    path: [[-25, 1120], [0, 1080], [8, 1035], [12, 1055], [20, 995], [24, 1015], [31, 960], [43, 890]],
    labels: [
      { day: 8, text: "高値↓" },
      { day: 20, text: "高値↓" },
    ],
    explanation: [
      "戻っては下がり、山（高値）も谷（安値）も前より低くなっていました。下降トレンドの形です。",
      "「もう十分下がったから、そろそろ上がるはず」と考えがちですが、下降トレンド中はさらに下がることも多いので要注意です。",
    ],
    lessonSlug: "trend",
  },
  {
    id: "double-bottom",
    pattern: "ダブルボトム",
    expected: "up",
    textbook: true,
    seed: 103,
    path: [[-25, 1080], [0, 1060], [8, 950], [13, 1010], [19, 952], [26, 1000], [31, 1025], [43, 1100]],
    showVolume: true,
    volumeBoost: [{ from: 30, to: 31, times: 1.8 }],
    labels: [
      { day: 8, text: "1回目の底" },
      { day: 19, text: "2回目の底" },
    ],
    hlines: [{ price: 1010, label: "ネックライン" }],
    explanation: [
      "同じくらいの安値で2回下げ止まり、アルファベットの「W」のような形になっていました。これが「ダブルボトム」です。",
      "2つの底のあいだの山（ネックライン）を上に抜けたところで、上昇に転じるサインとされます。",
    ],
  },
  {
    id: "double-top",
    pattern: "ダブルトップ",
    expected: "down",
    textbook: true,
    seed: 104,
    path: [[-25, 920], [0, 940], [8, 1050], [13, 990], [19, 1048], [26, 1000], [31, 975], [43, 900]],
    labels: [
      { day: 8, text: "1回目の山" },
      { day: 19, text: "2回目の山" },
    ],
    hlines: [{ price: 990, label: "ネックライン" }],
    explanation: [
      "同じくらいの高値で2回はね返され、「M」のような形になっていました。これが「ダブルトップ」です。",
      "あいだの谷（ネックライン）を下に割り込むと、下落に転じるサインとされます。",
    ],
  },
  {
    id: "golden-cross",
    pattern: "ゴールデンクロス",
    expected: "up",
    textbook: true,
    seed: 105,
    path: [[-25, 1100], [0, 1040], [12, 960], [20, 965], [31, 1030], [43, 1110]],
    showMA: true,
    labelCross: true,
    explanation: [
      "下落のあと、5日線（短い期間の平均）が25日線（長い期間の平均）を下から上に抜けていました。これが「ゴールデンクロス」です。",
      "最近の値段が、少し長い期間の平均を上回ってきた＝流れが上向きに変わりつつある、というサインとされます。",
    ],
    lessonSlug: "golden-cross",
  },
  {
    id: "dead-cross",
    pattern: "デッドクロス",
    expected: "down",
    textbook: true,
    seed: 106,
    path: [[-25, 900], [0, 960], [12, 1040], [20, 1035], [31, 970], [43, 890]],
    showMA: true,
    labelCross: true,
    explanation: [
      "上昇のあと、5日線が25日線を上から下に抜けていました。これが「デッドクロス」です。",
      "流れが下向きに変わりつつあるサインとされます。",
    ],
    lessonSlug: "golden-cross",
  },
  {
    id: "support-bounce",
    pattern: "サポートラインでの反発",
    expected: "up",
    textbook: true,
    seed: 107,
    path: [[-25, 1000], [0, 1000], [5, 1048], [11, 952], [17, 1045], [22, 1000], [27, 950], [31, 972], [43, 1040]],
    shadows: [{ day: 27, lower: 2 }],
    labels: [
      { day: 11, text: "下げ止まり" },
      { day: 27, text: "下げ止まり" },
    ],
    hlines: [{ price: 950, label: "サポートライン" }],
    explanation: [
      "{{950}}円あたりで何度も下げ止まっていました。こうした水準を「サポートライン（支持線）」と呼びます。",
      "「この値段なら買いたい」という人が多い水準なので、ふたたび反発しやすいとされます。",
    ],
    lessonSlug: "support-resistance",
  },
  {
    id: "resistance-reject",
    pattern: "レジスタンスラインでの反落",
    expected: "down",
    textbook: true,
    seed: 108,
    path: [[-25, 1000], [0, 1000], [5, 952], [11, 1048], [17, 955], [22, 1000], [27, 1050], [31, 1025], [43, 960]],
    shadows: [{ day: 27, upper: 2.5 }],
    labels: [
      { day: 11, text: "はね返された" },
      { day: 27, text: "はね返された" },
    ],
    hlines: [{ price: 1050, label: "レジスタンスライン" }],
    explanation: [
      "{{1050}}円あたりで何度も上がり止まっていました。こうした水準を「レジスタンスライン（抵抗線）」と呼びます。",
      "直近でも上ヒゲを出してはね返されており、ここを抜けられないうちは下がりやすいとされます。",
    ],
    lessonSlug: "support-resistance",
  },
  {
    id: "breakout-volume",
    pattern: "出来高をともなう上抜け",
    expected: "up",
    textbook: true,
    seed: 109,
    path: [[-25, 1000], [0, 1000], [6, 1045], [12, 960], [18, 1045], [24, 965], [29, 1040], [31, 1085], [43, 1150]],
    showVolume: true,
    volumeBoost: [{ from: 30, to: 31, times: 2.5 }],
    labels: [{ day: 31, text: "出来高急増" }],
    hlines: [{ price: 1050, label: "レジスタンスライン" }],
    explanation: [
      "何度もはね返されていた{{1050}}円を、大きな出来高とともに上に抜けました。",
      "多くの人が売り買いに参加したうえでの上抜けは「本物」になりやすく、新しい上昇の始まりとされます。",
    ],
    lessonSlug: "volume",
  },
  {
    id: "support-break",
    pattern: "サポートライン割れ",
    expected: "down",
    textbook: true,
    seed: 110,
    path: [[-25, 1000], [0, 1000], [6, 955], [12, 1040], [18, 955], [24, 1035], [29, 960], [31, 915], [43, 860]],
    showVolume: true,
    volumeBoost: [{ from: 30, to: 31, times: 2.2 }],
    labels: [{ day: 31, text: "割り込んだ" }],
    hlines: [{ price: 950, label: "サポートライン" }],
    explanation: [
      "何度も下げ止まっていた{{950}}円を、出来高をともなって下に割り込みました。",
      "支えになっていた水準を割ると、「ここで買った人」が損を確定させようと売りに回り、下落が加速しやすくなります。",
    ],
    lessonSlug: "support-resistance",
  },
  {
    id: "hammer",
    pattern: "下落後の長い下ヒゲ",
    expected: "up",
    textbook: true,
    seed: 111,
    path: [[-25, 1150], [0, 1120], [28, 960], [31, 955], [34, 975], [43, 1030]],
    shadows: [{ day: 31, lower: 4.5 }],
    showVolume: true,
    volumeBoost: [{ from: 31, to: 31, times: 1.8 }],
    labels: [{ day: 31, text: "長い下ヒゲ" }],
    explanation: [
      "下落が続いたあと、右端で長い下ヒゲが出ていました。一度大きく売られたものの、買いが入って値段が戻した跡です。",
      "下落の終わりに出る長い下ヒゲは、「下では買いたい人がいる」サインとして、反発のきっかけになることがあります。",
    ],
    lessonSlug: "candlestick",
  },
  {
    id: "shooting-star",
    pattern: "上昇後の長い上ヒゲ",
    expected: "down",
    textbook: true,
    seed: 112,
    path: [[-25, 860], [0, 880], [28, 1050], [31, 1055], [34, 1035], [43, 970]],
    shadows: [{ day: 31, upper: 4.5 }],
    labels: [{ day: 31, text: "長い上ヒゲ" }],
    explanation: [
      "大きく上がったあと、右端で長い上ヒゲが出ていました。一度は大きく値上がりしたのに、売りに押し戻された跡です。",
      "上昇の終わりに出る長い上ヒゲは、「上は重い」サインとして、下落のきっかけになることがあります。",
    ],
    lessonSlug: "candlestick",
  },
  {
    id: "head-shoulders",
    pattern: "三尊（ヘッドアンドショルダー）",
    expected: "down",
    textbook: true,
    seed: 113,
    path: [[-25, 950], [0, 960], [5, 1030], [9, 990], [15, 1070], [20, 990], [25, 1030], [29, 990], [31, 975], [43, 900]],
    labels: [
      { day: 5, text: "左肩" },
      { day: 15, text: "頭" },
      { day: 25, text: "右肩" },
    ],
    hlines: [{ price: 990, label: "ネックライン" }],
    explanation: [
      "真ん中がいちばん高い3つの山（左肩・頭・右肩）ができていました。仏像が3体並んだ姿に見立てて「三尊」と呼びます。",
      "右肩が頭より低く、ネックラインを割り込んだところで、上昇の終わりを示す代表的なサインとされます。",
    ],
  },
  {
    id: "inverse-head-shoulders",
    pattern: "逆三尊",
    expected: "up",
    textbook: true,
    seed: 114,
    path: [[-25, 1050], [0, 1040], [5, 970], [9, 1010], [15, 930], [20, 1010], [25, 970], [29, 1010], [31, 1025], [43, 1100]],
    labels: [
      { day: 5, text: "左肩" },
      { day: 15, text: "頭" },
      { day: 25, text: "右肩" },
    ],
    hlines: [{ price: 1010, label: "ネックライン" }],
    explanation: [
      "真ん中がいちばん深い3つの谷ができていました。三尊を逆さにした形なので「逆三尊」と呼びます。",
      "ネックラインを上に抜けたところで、下落の終わり・上昇への転換を示す代表的なサインとされます。",
    ],
  },
  {
    id: "gap-up",
    pattern: "窓をあけた上昇",
    expected: "up",
    textbook: true,
    seed: 115,
    path: [[-25, 960], [0, 960], [29, 990], [30, 990], [31, 1060], [43, 1120]],
    gaps: [{ day: 31, pct: 5 }],
    showVolume: true,
    volumeBoost: [{ from: 31, to: 31, times: 3 }],
    labels: [{ day: 31, text: "窓あけ" }],
    explanation: [
      "右端で、前の日より大きく高い値段から始まり、チャートにすき間（窓）があいていました。出来高も急増しています。",
      "良いニュースなどで買いが殺到したときに出やすい形で、そのまま上昇が続くこともあります（ただし窓は「埋められる」こともあります）。",
    ],
  },
  {
    id: "pullback",
    pattern: "上昇トレンド中の押し目",
    expected: "up",
    textbook: true,
    seed: 116,
    path: [[-25, 850], [0, 900], [20, 1040], [28, 995], [31, 1005], [43, 1090]],
    showMA: true,
    labels: [{ day: 28, text: "押し目" }],
    explanation: [
      "上昇トレンドの途中で一時的に下がり、25日線のあたりで下げ止まりました。こうした一時的な下げを「押し目」と呼びます。",
      "トレンドが続いているあいだの押し目は、ふたたび上昇に戻ることが多いとされます。",
    ],
    lessonSlug: "moving-average",
  },

  // ── 教科書どおりにならなかった問題（だまし・失敗） ──
  {
    id: "golden-cross-fake",
    pattern: "ゴールデンクロスの「だまし」",
    expected: "down",
    textbook: false,
    seed: 117,
    path: [[-25, 1100], [0, 1040], [12, 960], [20, 965], [31, 1025], [34, 1030], [43, 940]],
    showMA: true,
    labelCross: true,
    explanation: [
      "ゴールデンクロスが出ていたので「上がる」と考えた人も多いはず。でも、この後は下がってしまいました。",
      "サインが出ても、その通りにならないことを「だまし」と呼びます。どんなパターンも100%ではありません。",
    ],
    lessonSlug: "golden-cross",
  },
  {
    id: "double-bottom-fail",
    pattern: "ダブルボトム未完成",
    expected: "down",
    textbook: false,
    seed: 118,
    path: [[-25, 1080], [0, 1060], [8, 950], [13, 1005], [19, 955], [26, 990], [31, 962], [43, 880]],
    labels: [
      { day: 8, text: "1回目の底" },
      { day: 19, text: "2回目の底" },
    ],
    hlines: [{ price: 1005, label: "ネックライン" }],
    explanation: [
      "2回の底でダブルボトムに見えましたが、ネックラインを上に抜けられないまま、ふたたび下がってしまいました。",
      "ダブルボトムは「ネックラインを抜けて初めて完成」とされます。形だけで早合点しないことが大切です。",
    ],
  },
  {
    id: "false-breakout",
    pattern: "出来高をともなわない上抜けの失敗",
    expected: "down",
    textbook: false,
    seed: 119,
    path: [[-25, 1000], [0, 1000], [6, 1045], [12, 960], [18, 1045], [24, 965], [29, 1040], [31, 1068], [35, 1040], [43, 955]],
    showVolume: true,
    labels: [{ day: 31, text: "出来高は少ない" }],
    hlines: [{ price: 1050, label: "レジスタンスライン" }],
    explanation: [
      "レジスタンスラインを上に抜けたように見えましたが、出来高は増えておらず、その後はレンジの中に逆戻りしました。",
      "参加者が少ない上抜けは長続きしないことがあります。出来高も合わせて確認するクセをつけましょう。",
    ],
    lessonSlug: "volume",
  },
  {
    id: "hammer-fail",
    pattern: "下ヒゲが出ても続いた下落",
    expected: "down",
    textbook: false,
    seed: 120,
    path: [[-25, 1150], [0, 1120], [28, 980], [31, 970], [34, 965], [43, 890]],
    shadows: [{ day: 31, lower: 4.5 }],
    labels: [{ day: 31, text: "長い下ヒゲ" }],
    explanation: [
      "長い下ヒゲが出て「そろそろ反発かも」と思えましたが、下降トレンドはそのまま続きました。",
      "ローソク足1本のサインより、大きな流れ（トレンド）のほうが強いこともよくあります。",
    ],
    lessonSlug: "candlestick",
  },
];

export const scenarios: ChartQuizScenario[] = [...basicScenarios, ...advancedScenarios];

export function levelOf(s: ChartQuizScenario): QuizLevel {
  return s.level ?? "basic";
}

/** 出題に使える形違いの番号（自動チェックに合格したもの）。リストにない問題は元の問題だけ */
export function variantsOf(s: ChartQuizScenario): number[] {
  const ks = acceptedVariants[s.id];
  return ks && ks.length > 0 ? ks : [0];
}

/** レベルごとの問題数（形違いを含む）とパターンの種類数 */
export function poolSize(level: QuizLevel) {
  const list = scenarios.filter((s) => levelOf(s) === level);
  return { questions: list.reduce((n, s) => n + variantsOf(s).length, 0), patterns: list.length };
}

/**
 * 同じパターンの「形違い」。値段の水準・パターンの深さ・ブレの大きさ・乱数を変える。
 * k=0 は元の問題そのもの。どの k を出題に使うかは chartQuizVariants.generated.ts（自動チェックに合格したもの）で決まる。
 * 公開後に並びを変えると、同じ k でも別のチャートになるので、追加するときは末尾に足すこと。
 */
export type Variant = { scale: number; amp: number; vol: number };
export const VARIANTS: Variant[] = [
  { scale: 1, amp: 1, vol: 1 },
  { scale: 0.55, amp: 1.1, vol: 0.9 },
  { scale: 1.6, amp: 0.9, vol: 1.1 },
  { scale: 2.4, amp: 1.15, vol: 1 },
  { scale: 0.8, amp: 0.95, vol: 1.15 },
  { scale: 3.1, amp: 1.05, vol: 0.85 },
  { scale: 1.25, amp: 0.88, vol: 1 },
  { scale: 0.65, amp: 1.2, vol: 1.05 },
  { scale: 1.9, amp: 1, vol: 0.95 },
  { scale: 2.8, amp: 0.92, vol: 1.1 },
  { scale: 0.9, amp: 1.12, vol: 0.9 },
  { scale: 1.4, amp: 1.08, vol: 1 },
];

/** 問題に書いた値段（1,000円前後）を、形違いの値段に変換する */
export function priceMapOf(k: number) {
  const v = VARIANTS[k];
  return (p: number) => v.scale * (1000 + v.amp * (p - 1000));
}

/** 解説の {{950}} などを、形違いの値段（10円単位）に置きかえる */
function formatExplanation(text: string, price: (p: number) => number) {
  return text.replace(/\{\{(\d+)\}\}/g, (_, n: string) =>
    (Math.round(price(Number(n)) / 10) * 10).toLocaleString("ja-JP"),
  );
}

export type BuiltScenario = {
  scenario: ChartQuizScenario;
  /** 形違いの番号（0 は元の問題） */
  variant: number;
  /** 問題に書いた値段 → この形違いの値段 */
  price: (p: number) => number;
  hlines: { price: number; label: string }[];
  explanation: string[];
  candles: Candle[];
  ma5: (number | null)[];
  ma25: (number | null)[];
  rsi: (number | null)[];
  macd: ReturnType<typeof macd>;
  bb: ReturnType<typeof bollinger>;
  /** 答えのあとに出す注釈（ゴールデン／デッドクロスは自動で位置を求める） */
  labels: { index: number; text: string }[];
  /** 表示最後の終値から、最後の終値までの変化率（%） */
  changePct: number;
  actual: Direction;
};

export function buildScenario(s: ChartQuizScenario, variant = 0): BuiltScenario {
  const warmup = levelOf(s) === "advanced" ? ADVANCED_WARMUP_DAYS : WARMUP_DAYS;
  const v = VARIANTS[variant];
  const price = priceMapOf(variant);
  const all = generateFromPath({
    // k=0 は元のシードのまま（既存の問題のチャートを変えない）
    seed: s.seed + variant * 1009,
    days: warmup + VISIBLE_DAYS + FUTURE_DAYS,
    points: s.path.map(([d, p]) => [d + warmup, price(p)] as PathPoint),
    volatility: (s.volatility ?? 1.0) * v.vol,
    shadows: s.shadows?.map((x) => ({
      day: x.day + warmup,
      upper: x.upper === undefined ? undefined : x.upper * v.amp,
      lower: x.lower === undefined ? undefined : x.lower * v.amp,
    })),
    gaps: s.gaps?.map((x) => ({ day: x.day + warmup, pct: x.pct * v.amp })),
    volumeBoost: s.volumeBoost?.map((x) => ({
      ...x,
      from: x.from + warmup,
      to: x.to + warmup,
    })),
  });
  const cut = <T,>(series: T[]) => series.slice(warmup);
  const ma5 = cut(movingAverage(all, 5));
  const ma25 = cut(movingAverage(all, 25));
  const m = macd(all);
  const b = bollinger(all);
  const candles = cut(all);

  const labels = (s.labels ?? []).map((l) => ({ index: l.day, text: l.text }));
  if (s.showMA && s.labelCross) {
    // 表示範囲で最後に 5日線と25日線が交差した日に注釈をつける
    for (let i = VISIBLE_DAYS - 1; i > 0; i--) {
      const prev = ma5[i - 1]! - ma25[i - 1]!;
      const cur = ma5[i]! - ma25[i]!;
      if (prev <= 0 && cur > 0) {
        labels.push({ index: i, text: "ゴールデンクロス" });
        break;
      }
      if (prev >= 0 && cur < 0) {
        labels.push({ index: i, text: "デッドクロス" });
        break;
      }
    }
  }

  const lastVisible = candles[VISIBLE_DAYS - 1].close;
  const last = candles[candles.length - 1].close;
  const changePct = ((last - lastVisible) / lastVisible) * 100;

  return {
    scenario: s,
    variant,
    price,
    hlines: (s.hlines ?? []).map((h) => ({ ...h, price: price(h.price) })),
    explanation: s.explanation.map((t) => formatExplanation(t, price)),
    candles,
    ma5,
    ma25,
    rsi: cut(rsi(all)),
    macd: { line: cut(m.line), signal: cut(m.signal), histogram: cut(m.histogram) },
    bb: { middle: cut(b.middle), upper: cut(b.upper), lower: cut(b.lower) },
    labels,
    changePct,
    actual: changePct >= 0 ? "up" : "down",
  };
}

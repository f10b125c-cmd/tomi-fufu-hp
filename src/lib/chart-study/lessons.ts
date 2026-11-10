import type { Candle, TrendSegment } from "./candles";

export type ChartVisual =
  | { kind: "anatomy" }
  | {
      kind: "chart";
      /** 明示したローソク足を表示 */
      candles?: Candle[];
      /** 架空データを生成して表示 */
      generate?: { seed: number; segments: TrendSegment[] };
      /** ローソク足の上に出す注釈（index は 0 始まり） */
      labels?: { index: number; text: string }[];
      /** 背景を塗って注目させる範囲 */
      highlight?: { from: number; to: number };
      caption?: string;
    };

export type LessonStep = {
  title: string;
  body: string[];
  visual?: ChartVisual;
};

export type QuizQuestion = {
  question: string;
  choices: string[];
  answerIndex: number;
  explanation: string;
  visual?: ChartVisual;
};

export type Lesson = {
  slug: string;
  number: number;
  title: string;
  summary: string;
  minutes: number;
  /** 本文が未作成のレッスンは undefined（一覧では「準備中」表示） */
  steps?: LessonStep[];
  quiz?: QuizQuestion[];
};

export const lessons: Lesson[] = [
  {
    slug: "candlestick",
    number: 1,
    title: "ローソク足の読み方",
    summary: "1本のローソクに詰まった「4つの値段」と、陽線・陰線・ヒゲの意味を覚えよう。",
    minutes: 5,
    steps: [
      {
        title: "ローソク足ってなに？",
        body: [
          "株価チャートでよく見る、細長い四角と線の組み合わせ。これが「ローソク足」です。",
          "ローソク足1本は、ある1日（日足の場合）の値動きをギュッとまとめたもの。これを毎日並べたのが、いわゆる株価チャートです。",
        ],
        visual: {
          kind: "chart",
          generate: { seed: 11, segments: [{ days: 20, drift: 0.4 }] },
          highlight: { from: 19, to: 19 },
          labels: [{ index: 19, text: "これで1日分" }],
          caption: "架空の銘柄「とみ商事」の20日分のチャート",
        },
      },
      {
        title: "1本でわかる4つの値段",
        body: [
          "ローソク足1本から、その日の4つの値段がわかります。",
          "・始値（はじめね）：その日、最初についた値段",
          "・終値（おわりね）：その日、最後についた値段",
          "・高値（たかね）：その日、いちばん高かった値段",
          "・安値（やすね）：その日、いちばん安かった値段",
          "四角い部分を「実体」、上下に伸びる線を「ヒゲ」と呼びます。実体は始値と終値のあいだ、ヒゲの先は高値と安値です。",
        ],
        visual: { kind: "anatomy" },
      },
      {
        title: "陽線と陰線",
        body: [
          "終値が始値より高かった日（その日のうちに値上がりした日）を「陽線」、終値が始値より低かった日（値下がりした日）を「陰線」と呼びます。",
          "このアプリでは、陽線を「赤の白抜き」、陰線を「青の塗りつぶし」で表しています。色が見分けにくくても、中が空いているかどうかで区別できます。",
          "陽線は上が終値、陰線は上が始値。ここが混乱しやすいポイントです。",
        ],
        visual: { kind: "anatomy" },
      },
      {
        title: "ヒゲは「せめぎ合い」の跡",
        body: [
          "長い上ヒゲは、一度は大きく値上がりしたのに、売りに押されて戻されたしるし。「上は重いかも」というサインになることがあります。",
          "長い下ヒゲは、一度は大きく値下がりしたのに、買いが入って戻したしるし。「下では買いたい人がいる」というサインになることがあります。",
          "ただし、ヒゲ1本だけで今後を決めつけるのは禁物。あくまで「その日なにがあったか」を読むためのヒントです。",
        ],
        visual: {
          kind: "chart",
          candles: [
            { open: 1000, high: 1090, low: 995, close: 1010, volume: 100000 },
            { open: 1010, high: 1015, low: 920, close: 1005, volume: 100000 },
          ],
          labels: [
            { index: 0, text: "長い上ヒゲ" },
            { index: 1, text: "長い下ヒゲ" },
          ],
        },
      },
      {
        title: "並べると「流れ」が見える",
        body: [
          "陽線が多く、だんだん右上がりになっていれば上昇の流れ。陰線が多く右下がりなら下落の流れです。",
          "1本ずつの意味がわかると、チャート全体が「値動きの日記」として読めるようになります。次のレッスンでは、この「流れ（トレンド）」をくわしく見ていきます。",
        ],
        visual: {
          kind: "chart",
          generate: {
            seed: 7,
            segments: [
              { days: 15, drift: 0.9 },
              { days: 15, drift: -0.9 },
            ],
          },
          highlight: { from: 0, to: 14 },
          labels: [
            { index: 7, text: "陽線が多い" },
            { index: 23, text: "陰線が多い" },
          ],
          caption: "前半は上昇、後半は下落の流れ（架空データ）",
        },
      },
    ],
    quiz: [
      {
        question: "「陽線」はどんな日を表している？",
        choices: [
          "終値が始値より高かった日",
          "終値が始値より低かった日",
          "前の日より出来高が多かった日",
          "その日の高値と安値の差が大きかった日",
        ],
        answerIndex: 0,
        explanation:
          "陽線は、その日の始まりより終わりのほうが値段が高かった日。つまり、その日のうちに値上がりした日です。",
      },
      {
        question: "ローソク足1本から読み取れないのはどれ？",
        choices: ["始値", "高値", "終値", "その日の平均の値段"],
        answerIndex: 3,
        explanation:
          "ローソク足1本でわかるのは、始値・高値・安値・終値の4つ。平均の値段はローソク足からはわかりません。",
      },
      {
        question: "このローソク足からわかることは？",
        choices: [
          "一度大きく値下がりしたが、買いが入って戻した",
          "一度大きく値上がりしたが、売りに押されて戻された",
          "1日中ほとんど値段が動かなかった",
          "明日は必ず値上がりする",
        ],
        answerIndex: 0,
        explanation:
          "長い下ヒゲは「一度は安くなったけれど、買いたい人が現れて値段が戻った」跡です。ただし「明日必ず上がる」とまでは言えません。",
        visual: {
          kind: "chart",
          candles: [
            { open: 1000, high: 1010, low: 1000, close: 1008, volume: 100000 },
            { open: 1008, high: 1012, low: 930, close: 1006, volume: 100000 },
            { open: 1006, high: 1015, low: 1002, close: 1012, volume: 100000 },
          ],
          highlight: { from: 1, to: 1 },
        },
      },
    ],
  },
  {
    slug: "trend",
    number: 2,
    title: "トレンドとは",
    summary: "上昇・下降・横ばい。チャートの「流れ」をつかむ第一歩。",
    minutes: 5,
  },
  {
    slug: "moving-average",
    number: 3,
    title: "移動平均線",
    summary: "5日・25日・75日の線で、値動きをなめらかに見る。",
    minutes: 6,
  },
  {
    slug: "golden-cross",
    number: 4,
    title: "ゴールデンクロスとデッドクロス",
    summary: "移動平均線が交わるとき、なにが起きている？",
    minutes: 5,
  },
  {
    slug: "volume",
    number: 5,
    title: "出来高の見方",
    summary: "どれだけ売り買いされたかで、値動きの「本気度」を読む。",
    minutes: 5,
  },
  {
    slug: "support-resistance",
    number: 6,
    title: "サポートラインとレジスタンスライン",
    summary: "下げ止まりやすい値段、上がり止まりやすい値段を見つけよう。",
    minutes: 6,
  },
];

export function getLesson(slug: string): Lesson | undefined {
  return lessons.find((l) => l.slug === slug);
}

export function isAvailable(lesson: Lesson): boolean {
  return Boolean(lesson.steps && lesson.steps.length > 0);
}

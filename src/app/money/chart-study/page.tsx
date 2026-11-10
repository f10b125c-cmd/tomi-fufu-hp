import Link from "next/link";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import PageHero from "@/components/PageHero";
import CandleChart from "@/components/chart-study/CandleChart";
import Disclaimer from "@/components/chart-study/Disclaimer";
import ProgressSummary from "@/components/chart-study/ProgressSummary";
import { generateCandles } from "@/lib/chart-study/candles";
import { lessons } from "@/lib/chart-study/lessons";

export const metadata = {
  title: "株価チャート学習｜とみ夫婦",
  description: "投資初心者がチャートの読み方を、レッスンとクイズで楽しく学べるページです。",
};

const modes: {
  href?: string;
  step: string;
  title: string;
  description: string;
  ready: boolean;
}[] = [
  {
    href: "/money/chart-study/lessons",
    step: "STEP 1",
    title: "パターン解説レッスン",
    description: "ローソク足や移動平均線など、チャートの基本を図解で順番に学びます。",
    ready: true,
  },
  {
    href: "/money/chart-study/quiz/terms",
    step: "STEP 2",
    title: "用語クイズ",
    description: "PER・出来高・始値など、よく出る用語を4択クイズでおさらい。",
    ready: true,
  },
  {
    href: "/money/chart-study/quiz/chart",
    step: "STEP 3",
    title: "チャート当てクイズ",
    description: "途中までのチャートを見て「この後上がる？下がる？」を予想します。",
    ready: true,
  },
  {
    href: "/money/chart-study/trade",
    step: "STEP 4",
    title: "仮想トレード練習",
    description: "仮想資金100万円で、過去チャートを1日ずつ進めながら売買を体験。",
    ready: true,
  },
];

const heroCandles = generateCandles({
  seed: 3,
  segments: [
    { days: 12, drift: -0.6 },
    { days: 8, drift: 0.1 },
    { days: 16, drift: 0.8 },
  ],
});

export default function ChartStudyPage() {
  return (
    <>
      <Header />
      <PageHero
        eyebrow="CHART STUDY"
        title="株価チャート学習"
        subtitle="チャートの「読み方」を、遊び感覚で少しずつ。"
        variant="sun"
      />

      <section className="bg-brand-cream px-6 py-14 md:px-12">
        <div className="mx-auto grid max-w-4xl items-center gap-8 md:grid-cols-2">
          <div>
            <h2 className="font-display text-2xl font-bold text-brand-navy">
              このギザギザ、読めますか？
            </h2>
            <p className="mt-4 leading-relaxed text-brand-navy/75">
              NISAを始めてみたけど、証券アプリのチャートは正直よくわからない…。
              そんな我が家のために作った学習ページです。1回5分、スマホでどうぞ。
            </p>
          </div>
          <div className="rounded-3xl bg-white p-4 shadow-sm">
            <CandleChart candles={heroCandles} height={200} ariaLabel="学習用の架空チャートの例" />
          </div>
        </div>
        <div className="mx-auto mt-10 max-w-4xl">
          <ProgressSummary lessonSlugs={lessons.map((l) => l.slug)} />
        </div>
      </section>

      <section className="px-6 py-16 md:px-12">
        <h2 className="text-center font-display text-2xl font-bold text-brand-navy">学び方を選ぶ</h2>
        <p className="mt-3 text-center text-sm text-brand-navy/60">はじめての方は STEP 1 からがおすすめです。</p>
        <div className="mx-auto mt-10 grid max-w-4xl gap-5 sm:grid-cols-2">
          {modes.map((mode) => {
            const body = (
              <>
                <p className="text-xs font-bold tracking-[0.15em] text-brand-orange">{mode.step}</p>
                <h3 className="mt-2 flex flex-wrap items-center gap-2 font-display text-xl font-bold text-brand-navy">
                  {mode.title}
                  {!mode.ready && (
                    <span className="rounded-full bg-brand-navy/10 px-2 py-0.5 font-sans text-xs font-bold text-brand-navy/60">
                      準備中
                    </span>
                  )}
                </h3>
                <p className="mt-3 text-sm text-brand-navy/70">{mode.description}</p>
                {mode.ready && (
                  <p className="mt-4 text-sm font-semibold text-brand-blue-deep">はじめる →</p>
                )}
              </>
            );
            return mode.ready && mode.href ? (
              <Link
                key={mode.title}
                href={mode.href}
                className="rounded-3xl border border-[#edf0f2] bg-white p-7 shadow-sm transition hover:border-brand-orange"
              >
                {body}
              </Link>
            ) : (
              <div
                key={mode.title}
                className="rounded-3xl border border-dashed border-brand-navy/15 bg-white/60 p-7"
              >
                {body}
              </div>
            );
          })}
        </div>
        <Disclaimer className="mx-auto mt-12 max-w-4xl" />
      </section>

      <Footer />
    </>
  );
}

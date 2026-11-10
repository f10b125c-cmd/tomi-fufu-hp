import Link from "next/link";
import CategoryPage from "@/components/CategoryPage";

export const metadata = {
  title: "投資・NISA｜とみ夫婦",
};

export default function MoneyPage() {
  return (
    <CategoryPage
      eyebrow="MONEY & NISA"
      title="投資・NISA"
      subtitle="投資初心者の我が家が続けている、NISA・積立・個別株・家計との付き合い方。"
      heroVariant="sun"
      feature={
        <section className="bg-brand-cream px-6 py-12 md:px-12">
          <Link
            href="/money/chart-study"
            className="mx-auto flex max-w-4xl flex-col gap-4 rounded-3xl bg-white p-7 shadow-sm transition hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
          >
            <span>
              <span className="block text-xs font-bold tracking-[0.15em] text-brand-orange">
                NEW｜CHART STUDY
              </span>
              <span className="mt-2 block font-display text-xl font-bold text-brand-navy">
                株価チャート学習をはじめよう
              </span>
              <span className="mt-2 block text-sm text-brand-navy/70">
                ローソク足の読み方から、レッスンとクイズで少しずつ。1回5分、スマホでどうぞ。
              </span>
            </span>
            <span className="shrink-0 self-start rounded-full bg-brand-orange px-6 py-3 text-sm font-semibold text-white sm:self-center">
              学習ページへ →
            </span>
          </Link>
        </section>
      }
      items={[
        {
          tag: "NISA",
          title: "初心者から始めるNISA",
          description: "難しい言葉をできるだけ使わず、我が家の経験を交えて紹介します。",
        },
        {
          tag: "積立",
          title: "無理なく続ける積立投資",
          description: "生活を楽しみながら、未来のお金も少しずつ育てます。",
        },
        {
          tag: "個別株",
          title: "1株から楽しむ投資",
          description: "配当や優待を楽しみながら、長く付き合いたい企業を探します。",
        },
        {
          tag: "考え方",
          title: "お金は思い出のための手段",
          description: "増やすだけではなく、家族の楽しみに使うことも大切にしています。",
        },
      ]}
    />
  );
}

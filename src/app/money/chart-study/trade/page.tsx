import Link from "next/link";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Disclaimer from "@/components/chart-study/Disclaimer";
import VirtualTrade from "@/components/chart-study/VirtualTrade";

export const metadata = {
  title: "仮想トレード練習｜株価チャート学習｜とみ夫婦",
  description: "仮想のお金100万円で、架空の銘柄を60日間売買。チャートを1日ずつ進めながら、売買のタイミングを練習できます。",
};

export default function VirtualTradePage() {
  return (
    <>
      <Header />
      <main className="bg-brand-cream px-4 py-10 sm:px-6 md:px-12">
        <div className="mx-auto max-w-2xl">
          <Link href="/money/chart-study" className="-my-3 inline-block py-3 text-sm font-semibold text-brand-blue-deep hover:opacity-70">
            ← 株価チャート学習トップ
          </Link>
          <p className="mt-6 text-sm font-bold tracking-[0.2em] text-brand-orange">VIRTUAL TRADE</p>
          <h1 className="mt-1 font-display text-3xl font-bold text-brand-navy">仮想トレード練習</h1>
          <p className="mt-3 text-brand-navy/70">
            100万円の仮想資金で、売買の判断を練習しよう。本物のお金は1円も使いません。
          </p>
          <div className="mt-8 rounded-3xl bg-white p-5 shadow-sm sm:p-8">
            <VirtualTrade />
          </div>
          <Disclaimer className="mt-8" />
        </div>
      </main>
      <Footer />
    </>
  );
}

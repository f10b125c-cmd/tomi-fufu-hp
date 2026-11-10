import Link from "next/link";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Disclaimer from "@/components/chart-study/Disclaimer";
import ChartQuiz from "@/components/chart-study/ChartQuiz";

export const metadata = {
  title: "チャート当てクイズ｜株価チャート学習｜とみ夫婦",
  description: "途中までのチャートを見て、この後上がるか下がるかを予想。ダブルボトムやゴールデンクロスなど、注目ポイントを解説します。",
};

export default function ChartQuizPage() {
  return (
    <>
      <Header />
      <main className="bg-brand-cream px-4 py-10 sm:px-6 md:px-12">
        <div className="mx-auto max-w-2xl">
          <Link href="/money/chart-study" className="-my-3 inline-block py-3 text-sm font-semibold text-brand-blue-deep hover:opacity-70">
            ← 株価チャート学習トップ
          </Link>
          <p className="mt-6 text-sm font-bold tracking-[0.2em] text-brand-orange">CHART QUIZ</p>
          <h1 className="mt-1 font-display text-3xl font-bold text-brand-navy">チャート当てクイズ</h1>
          <p className="mt-3 text-brand-navy/70">
            途中までのチャートを見て、この後を予想しよう。答えのあとに「どこを見ればよかったか」を解説します。
          </p>
          <div className="mt-8 rounded-3xl bg-white p-5 shadow-sm sm:p-8">
            <ChartQuiz />
          </div>
          <Disclaimer className="mt-8" />
        </div>
      </main>
      <Footer />
    </>
  );
}

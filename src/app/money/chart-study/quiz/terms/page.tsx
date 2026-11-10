import Link from "next/link";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Disclaimer from "@/components/chart-study/Disclaimer";
import TermQuiz from "@/components/chart-study/TermQuiz";

export const metadata = {
  title: "用語クイズ｜株価チャート学習｜とみ夫婦",
  description: "始値・出来高・PER・配当利回りなど、株とチャートのよく出る用語を4択クイズでおさらい。",
};

export default function TermQuizPage() {
  return (
    <>
      <Header />
      <main className="bg-brand-cream px-4 py-10 sm:px-6 md:px-12">
        <div className="mx-auto max-w-2xl">
          <Link href="/money/chart-study" className="text-sm font-semibold text-brand-blue-deep hover:opacity-70">
            ← 株価チャート学習トップ
          </Link>
          <p className="mt-6 text-sm font-bold tracking-[0.2em] text-brand-orange">TERM QUIZ</p>
          <h1 className="mt-1 font-display text-3xl font-bold text-brand-navy">用語クイズ</h1>
          <p className="mt-3 text-brand-navy/70">
            チャートや株の「よく見るけど、説明できない」言葉を4択でおさらいしよう。
          </p>
          <div className="mt-8 rounded-3xl bg-white p-5 shadow-sm sm:p-8">
            <TermQuiz />
          </div>
          <Disclaimer className="mt-8" />
        </div>
      </main>
      <Footer />
    </>
  );
}

import Link from "next/link";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Disclaimer from "@/components/chart-study/Disclaimer";
import LessonList from "@/components/chart-study/LessonList";
import { isAvailable, lessons } from "@/lib/chart-study/lessons";

export const metadata = {
  title: "レッスン一覧｜株価チャート学習｜とみ夫婦",
};

export default function LessonsPage() {
  const items = lessons.map((l) => ({
    slug: l.slug,
    number: l.number,
    title: l.title,
    summary: l.summary,
    minutes: l.minutes,
    available: isAvailable(l),
  }));

  return (
    <>
      <Header />
      <main className="bg-brand-cream px-4 py-12 sm:px-6 md:px-12">
        <div className="mx-auto max-w-2xl">
          <Link href="/money/chart-study" className="-my-3 inline-block py-3 text-sm font-semibold text-brand-blue-deep hover:opacity-70">
            ← 株価チャート学習トップ
          </Link>
          <p className="mt-6 text-sm font-bold tracking-[0.2em] text-brand-orange">LESSONS</p>
          <h1 className="mt-2 font-display text-3xl font-bold text-brand-navy">パターン解説レッスン</h1>
          <p className="mt-3 text-brand-navy/70">上から順番に進めるのがおすすめです。</p>
          <div className="mt-8">
            <LessonList lessons={items} />
          </div>
          <Disclaimer className="mt-10" />
        </div>
      </main>
      <Footer />
    </>
  );
}

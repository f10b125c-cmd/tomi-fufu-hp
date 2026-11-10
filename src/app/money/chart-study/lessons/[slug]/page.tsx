import Link from "next/link";
import { notFound } from "next/navigation";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Disclaimer from "@/components/chart-study/Disclaimer";
import LessonPlayer from "@/components/chart-study/LessonPlayer";
import { getLesson, isAvailable, lessons } from "@/lib/chart-study/lessons";

// 本文がそろったレッスンだけページを作る。それ以外の URL は 404
export const dynamicParams = false;

export function generateStaticParams() {
  return lessons.filter(isAvailable).map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({ params }: PageProps<"/money/chart-study/lessons/[slug]">) {
  const { slug } = await params;
  const lesson = getLesson(slug);
  return {
    title: lesson ? `${lesson.title}｜株価チャート学習｜とみ夫婦` : "株価チャート学習｜とみ夫婦",
    description: lesson?.summary,
  };
}

export default async function LessonPage({ params }: PageProps<"/money/chart-study/lessons/[slug]">) {
  const { slug } = await params;
  const lesson = getLesson(slug);
  if (!lesson || !lesson.steps) notFound();

  const nextLesson = lessons.find((l) => l.number === lesson.number + 1);

  return (
    <>
      <Header />
      <main className="bg-brand-cream px-4 py-10 sm:px-6 md:px-12">
        <div className="mx-auto max-w-2xl">
          <Link
            href="/money/chart-study/lessons"
            className="text-sm font-semibold text-brand-blue-deep hover:opacity-70"
          >
            ← レッスン一覧
          </Link>
          <p className="mt-6 text-sm font-bold tracking-[0.2em] text-brand-orange">
            LESSON {lesson.number}
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold text-brand-navy">{lesson.title}</h1>
          <div className="mt-8 rounded-3xl bg-white p-5 shadow-sm sm:p-8">
            <LessonPlayer
              slug={lesson.slug}
              steps={lesson.steps}
              quiz={lesson.quiz ?? []}
              next={
                nextLesson && {
                  slug: nextLesson.slug,
                  title: nextLesson.title,
                  available: isAvailable(nextLesson),
                }
              }
            />
          </div>
          <Disclaimer className="mt-8" />
        </div>
      </main>
      <Footer />
    </>
  );
}

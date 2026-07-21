import Link from "next/link";
import Header from "./Header";
import Footer from "./Footer";
import PageHero from "./PageHero";

type CategoryItem = {
  tag: string;
  title: string;
  description: string;
};

export default function CategoryPage({
  eyebrow,
  title,
  subtitle,
  heroVariant,
  items,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  heroVariant: "sea" | "sun" | "yellow";
  items: CategoryItem[];
}) {
  return (
    <>
      <Header />
      <PageHero eyebrow={eyebrow} title={title} subtitle={subtitle} variant={heroVariant} />

      <section className="px-6 py-20 text-center md:px-12">
        <p className="text-sm font-bold tracking-[0.2em] text-brand-orange">
          TOMI FUFU STYLE
        </p>
        <h2 className="mt-4 font-display text-2xl font-bold text-brand-navy md:text-3xl">
          我が家らしく、無理なく。
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-brand-navy/70">
          ママ友と話すような距離感で、実際に試したことや感じたことをお届けします。
        </p>

        <div className="mx-auto mt-14 grid max-w-5xl gap-6 sm:grid-cols-2">
          {items.map((item) => (
            <div
              key={item.title}
              className="rounded-3xl border border-[#edf0f2] bg-white p-8 text-left shadow-sm"
            >
              <p className="text-xs font-bold tracking-[0.15em] text-brand-orange">
                {item.tag}
              </p>
              <h3 className="mt-3 font-display text-xl font-bold text-brand-navy">
                {item.title}
              </h3>
              <p className="mt-3 text-sm text-brand-navy/70">{item.description}</p>
              <a
                href="https://rakutoku-blog.com/"
                className="mt-5 inline-block text-sm font-semibold text-brand-blue-deep hover:opacity-70"
              >
                ブログで読む →
              </a>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-brand-cream px-6 py-20 text-center md:px-12">
        <h2 className="font-display text-xl font-bold text-brand-navy md:text-2xl">
          もっと詳しく読みたい方へ
        </h2>
        <p className="mt-4 text-brand-navy/70">
          最新記事や詳しい体験談は、ブログで更新しています。
        </p>
        <Link
          href="https://rakutoku-blog.com/"
          className="mt-8 inline-block rounded-full bg-brand-orange px-8 py-3 text-sm font-semibold text-white hover:opacity-90"
        >
          ブログを見る
        </Link>
      </section>

      <Footer />
    </>
  );
}

import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const entryCards = [
  {
    icon: "✈",
    tag: "TRAVEL",
    title: "家族旅行",
    description: "沖縄・ディズニー・ホテル・旅の記録",
    href: "/travel",
  },
  {
    icon: "◒",
    tag: "MONEY",
    title: "投資・NISA",
    description: "初心者の我が家が続けている資産づくり",
    href: "/money",
  },
  {
    icon: "🎁",
    tag: "OTOKU",
    title: "お得・家計管理",
    description: "旅行も日常も楽しむための家計の工夫",
    href: "/otoku",
  },
  {
    icon: "☕",
    tag: "BLOG",
    title: "ブログ",
    description: "旅・投資・お得を、もっと詳しく",
    href: "https://rakutoku-blog.com/",
  },
];

const memories = [
  { tag: "OKINAWA", caption: "青い海に会いに。" },
  { tag: "FAMILY", caption: "笑顔も一緒に持ち帰る。" },
  { tag: "GOURMET", caption: "旅の楽しみは食卓にも。" },
  { tag: "PLAY", caption: "予定外も、いい思い出。" },
];

export default function Home() {
  return (
    <>
      <section className="placeholder-photo relative flex min-h-screen flex-col justify-between">
        <Header transparent />

        <div className="flex flex-1 flex-col items-center justify-center px-6 text-center text-white">
          <p className="text-sm font-bold tracking-[0.3em]">FAMILY × TRAVEL × MONEY</p>
          <h1 className="mt-6 font-display text-3xl font-bold leading-snug drop-shadow md:text-5xl">
            投資とお得で、
            <br />
            家族の「行きたい」を叶える。
          </h1>
          <p className="mt-6 max-w-xl text-sm leading-relaxed drop-shadow md:text-base">
            家計を整え、資産を育て、家族との思い出を増やす。
            <br />
            旅行が大好きな4人家族の、等身大の暮らしを発信しています。
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/travel"
              className="rounded-full bg-brand-orange px-8 py-3 text-sm font-semibold hover:opacity-90"
            >
              家族旅行を見る
            </Link>
            <Link
              href="/about"
              className="rounded-full border border-white px-8 py-3 text-sm font-semibold hover:bg-white/10"
            >
              とみ夫婦って？
            </Link>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2 pb-8 text-xs tracking-[0.2em] text-white">
          <span>SCROLL</span>
          <span>☀</span>
        </div>
      </section>

      <section id="message" className="px-6 py-24 text-center md:px-12">
        <p className="text-sm font-bold tracking-[0.2em] text-brand-orange">
          OUR MESSAGE
        </p>
        <h2 className="mx-auto mt-4 max-w-2xl font-display text-2xl font-bold text-brand-navy md:text-4xl">
          お金を増やすことが、
          <br />
          ゴールじゃない。
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-brand-navy/70">
          行きたい場所へ行って、食べたいものを食べて、
          <br />
          子どもたちにたくさんの景色を見せること。
          <br />
          私たちにとって、お金は思い出を増やすための手段です。
        </p>
      </section>

      <section className="bg-[#faf7f2] px-6 py-24 md:px-12">
        <div className="mx-auto grid max-w-5xl items-center gap-12 md:grid-cols-2">
          <div className="placeholder-photo aspect-4/3 rounded-3xl" />
          <div>
            <p className="text-sm font-bold tracking-[0.2em] text-brand-orange">
              THIS MONTH
            </p>
            <h2 className="mt-4 font-display text-2xl font-bold text-brand-navy md:text-3xl">
              今月の1枚
            </h2>
            <p className="mt-4 text-lg text-brand-navy">
              青い海の先に、
              <br />
              また行きたい場所が増えました。
            </p>
            <p className="mt-4 text-sm text-brand-navy/70">
              季節ごとに、お気に入りの一枚を飾ります。サイトに戻るたび、少し違う旅の空気を感じてもらえたらうれしいです。
            </p>
            <ul className="mt-6 space-y-2 text-sm text-brand-navy/70">
              <li>笑顔が増える旅へ。</li>
              <li>青い海の、その先へ。</li>
              <li>旅先の「おいしい」も思い出。</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="px-6 py-24 text-center md:px-12">
        <p className="text-sm font-bold tracking-[0.2em] text-brand-orange">
          WHERE TO NEXT?
        </p>
        <h2 className="mt-4 font-display text-2xl font-bold text-brand-navy md:text-3xl">
          今日は、どこへ行く？
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-brand-navy/70">
          気になる入口から、とみ夫婦の世界をのぞいてみてください。
        </p>

        <div className="mx-auto mt-14 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {entryCards.map((card) => (
            <Link
              key={card.tag}
              href={card.href}
              className="group rounded-3xl bg-[#faf7f2] p-6 text-left transition hover:-translate-y-1 hover:shadow-md"
            >
              <span className="text-2xl">{card.icon}</span>
              <p className="mt-4 text-xs font-bold tracking-[0.15em] text-brand-orange">
                {card.tag}
              </p>
              <h3 className="mt-2 font-display text-lg font-bold text-brand-navy">
                {card.title}
              </h3>
              <p className="mt-2 text-sm text-brand-navy/70">{card.description}</p>
              <span className="mt-4 inline-block text-sm font-semibold text-brand-navy group-hover:opacity-70">
                →
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-[#faf7f2] px-6 py-24 text-center md:px-12">
        <p className="text-sm font-bold tracking-[0.2em] text-brand-orange">
          MEMORY ALBUM
        </p>
        <h2 className="mt-4 font-display text-2xl font-bold text-brand-navy md:text-3xl">
          家族の「行きたい」が、
          <br />
          思い出に変わった日。
        </h2>
        <div className="mx-auto mt-14 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {memories.map((memory) => (
            <div key={memory.tag} className="text-left">
              <div className="placeholder-photo aspect-square rounded-2xl" />
              <p className="mt-3 text-xs font-bold tracking-[0.15em] text-brand-orange">
                {memory.tag}
              </p>
              <p className="mt-1 text-sm text-brand-navy/70">{memory.caption}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 py-24 md:px-12">
        <div className="mx-auto grid max-w-5xl items-center gap-12 md:grid-cols-2">
          <div>
            <p className="text-sm font-bold tracking-[0.2em] text-brand-orange">
              OUR STORY
            </p>
            <h2 className="mt-4 font-display text-2xl font-bold text-brand-navy md:text-3xl">
              ほぼゼロから始めた、
              <br />
              我が家のお金と旅の話。
            </h2>
            <p className="mt-6 text-brand-navy/70">
              結婚、家計管理、投資、SNS、そして家族旅行。今までの歩みをまとめました。
            </p>
            <Link
              href="/about"
              className="mt-8 inline-block rounded-full bg-brand-navy px-8 py-3 text-sm font-semibold text-white hover:opacity-90"
            >
              私たちのストーリー
            </Link>
          </div>
          <div className="placeholder-photo aspect-4/3 rounded-3xl" />
        </div>
      </section>

      <section className="bg-brand-navy px-6 py-24 text-center text-white md:px-12">
        <p className="text-sm font-bold tracking-[0.2em] text-brand-orange">
          SEE YOU ON THE NEXT TRIP
        </p>
        <h2 className="mt-4 font-display text-2xl font-bold md:text-4xl">
          次の旅は、
          <br />
          どこへ行こう？
        </h2>
        <p className="mt-6 text-white/70">
          ブログやSNSでも、家族の旅とお金の話を発信しています。
        </p>
        <Link
          href="https://rakutoku-blog.com/"
          className="mt-8 inline-block rounded-full bg-brand-orange px-8 py-3 text-sm font-semibold hover:opacity-90"
        >
          ブログを見る
        </Link>
      </section>

      <Footer />
    </>
  );
}

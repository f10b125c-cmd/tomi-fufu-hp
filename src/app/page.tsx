import Image from "next/image";
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
    bg: "bg-[#dff5ff]",
  },
  {
    icon: "◒",
    tag: "MONEY",
    title: "投資・NISA",
    description: "初心者の我が家が続けている資産づくり",
    href: "/money",
    bg: "bg-[#fff0d9]",
  },
  {
    icon: "🎁",
    tag: "OTOKU",
    title: "お得・家計管理",
    description: "旅行も日常も楽しむための家計の工夫",
    href: "/otoku",
    bg: "bg-[#fff8c6]",
  },
  {
    icon: "☕",
    tag: "BLOG",
    title: "ブログ",
    description: "旅・投資・お得を、もっと詳しく",
    href: "https://rakutoku-blog.com/",
    bg: "bg-[#f2e8ff]",
  },
];

const photoBand = [
  {
    src: "/images/family-path.jpg",
    alt: "木漏れ日の道で子どもを高く持ち上げる家族",
    caption: "笑顔が増える旅へ。",
    tall: true,
  },
  {
    src: "/images/okinawa-beach.jpg",
    alt: "沖縄の白い砂浜と青い海",
    caption: "青い海の、その先へ。",
    tall: false,
  },
  {
    src: "/images/okinawa-soba.jpg",
    alt: "家族で沖縄そばを食べる様子",
    caption: "旅先の「おいしい」も思い出。",
    tall: false,
  },
];

const memories = [
  { src: "/images/okinawa-beach.jpg", alt: "沖縄の海", tag: "OKINAWA", caption: "青い海に会いに。" },
  { src: "/images/family-path.jpg", alt: "木漏れ日の家族", tag: "FAMILY", caption: "笑顔も一緒に持ち帰る。" },
  { src: "/images/okinawa-soba.jpg", alt: "沖縄そば", tag: "GOURMET", caption: "旅の楽しみは食卓にも。" },
  { src: "/images/pineapple-glasses.jpg", alt: "パイナップルサングラス", tag: "PLAY", caption: "予定外も、いい思い出。" },
];

export default function Home() {
  return (
    <>
      <section className="relative flex min-h-screen flex-col justify-between overflow-hidden text-white">
        <Image
          src="/images/hero-family-sea.jpg"
          alt="青い海を見つめる家族の後ろ姿"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[rgba(10,35,48,0.64)] via-[rgba(10,35,48,0.18)] to-[rgba(10,35,48,0.08)]" />

        <div className="relative z-10">
          <Header transparent />
        </div>

        <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 text-center">
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
              className="rounded-full border border-white/75 bg-white/10 px-8 py-3 text-sm font-semibold backdrop-blur hover:bg-white/20"
            >
              とみ夫婦って？
            </Link>
          </div>
        </div>

        <div className="relative z-10 flex flex-col items-center gap-2 pb-8 text-xs tracking-[0.2em]">
          <span>SCROLL</span>
          <span>☀</span>
        </div>
      </section>

      <section id="message" className="relative bg-brand-cream px-6 py-24 text-center md:px-12">
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

      <section className="bg-white px-6 py-24 md:px-12">
        <div className="mx-auto grid max-w-5xl items-center gap-12 md:grid-cols-[1.2fr_1fr]">
          <div className="relative">
            <Image
              src="/images/okinawa-beach.jpg"
              alt="沖縄の白い砂浜と青い海"
              width={620}
              height={620}
              className="h-[620px] w-full rounded-[30px] object-cover shadow-sm"
            />
            <span className="absolute left-[-18px] top-7 rounded-full bg-brand-yellow px-5 py-3 text-xs font-black tracking-[0.15em]">
              THIS MONTH
            </span>
          </div>
          <div>
            <p className="text-sm font-bold tracking-[0.2em] text-brand-orange">
              今月の1枚
            </p>
            <h2 className="mt-4 font-display text-2xl font-bold text-brand-navy md:text-3xl">
              青い海の先に、
              <br />
              また行きたい場所が増えました。
            </h2>
            <p className="mt-4 text-brand-navy/70">
              季節ごとに、お気に入りの一枚を飾ります。サイトに戻るたび、少し違う旅の空気を感じてもらえたらうれしいです。
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 px-6 py-16 md:grid-cols-[1.15fr_1fr_1fr] md:items-end md:px-12">
        {photoBand.map((photo) => (
          <figure
            key={photo.alt}
            className={`relative m-0 overflow-hidden rounded-[28px] shadow-sm ${
              photo.tall ? "h-[560px]" : "h-[440px]"
            }`}
          >
            <Image src={photo.src} alt={photo.alt} fill className="object-cover" />
            <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent px-6 py-6 font-bold text-white">
              {photo.caption}
            </figcaption>
          </figure>
        ))}
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

        <div className="mx-auto mt-14 grid max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {entryCards.map((card) => (
            <Link
              key={card.tag}
              href={card.href}
              className={`group rounded-3xl ${card.bg} p-8 text-left shadow-sm transition hover:-translate-y-2`}
            >
              <span
                className={`inline-block text-3xl ${
                  card.icon === "✈" ? "-scale-x-100" : ""
                }`}
              >
                {card.icon}
              </span>
              <p className="mt-5 text-xs font-bold tracking-[0.15em] text-brand-navy/50">
                {card.tag}
              </p>
              <h3 className="mt-2 font-display text-lg font-bold text-brand-navy">
                {card.title}
              </h3>
              <p className="mt-2 text-sm text-brand-navy/70">{card.description}</p>
              <span className="mt-4 inline-block text-lg font-semibold text-brand-navy group-hover:opacity-70">
                →
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-gradient-to-b from-[#26333c] to-[#472f37] px-0 py-24 text-white">
        <div className="mx-auto max-w-3xl px-6 md:px-12">
          <p className="text-sm font-bold tracking-[0.2em] text-brand-orange">
            MEMORY ALBUM
          </p>
          <h2 className="mt-4 font-display text-2xl font-bold md:text-3xl">
            家族の「行きたい」が、
            <br />
            思い出に変わった日。
          </h2>
        </div>
        <div className="mt-10 flex snap-x gap-6 overflow-x-auto px-6 pb-4 md:px-12">
          {memories.map((memory) => (
            <figure
              key={memory.tag}
              className="relative h-[440px] w-[78vw] flex-none snap-start overflow-hidden rounded-[28px] sm:w-[380px]"
            >
              <Image src={memory.src} alt={memory.alt} fill className="object-cover" />
              <figcaption className="absolute inset-x-0 bottom-0 flex flex-col bg-gradient-to-t from-black/75 to-transparent px-6 py-8">
                <b className="text-xl tracking-[0.1em]">{memory.tag}</b>
                <span className="mt-1 text-sm text-white/80">{memory.caption}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="bg-white px-6 py-24 md:px-12">
        <div className="mx-auto grid max-w-5xl items-center gap-12 md:grid-cols-[1fr_0.7fr]">
          <div>
            <p className="text-sm font-bold tracking-[0.2em] text-brand-orange">
              OUR STORY
            </p>
            <h2 className="mt-4 font-display text-2xl font-bold text-brand-navy md:text-3xl">
              ほぼゼロから始めた、
              <br />
              我が家のお金と旅の話。
            </h2>
            <p className="mt-6 max-w-xl text-brand-navy/70">
              結婚、家計管理、投資、SNS、そして家族旅行。今までの歩みをまとめました。
            </p>
            <Link
              href="/about"
              className="mt-6 inline-block rounded-full bg-brand-orange px-8 py-3 text-sm font-semibold text-white hover:opacity-90"
            >
              私たちのストーリー
            </Link>
          </div>
          <Image
            src="/images/pineapple-glasses.jpg"
            alt="パイナップル型サングラスをかけた子ども"
            width={480}
            height={560}
            className="h-[560px] w-full rounded-[40px] object-cover shadow-sm"
          />
        </div>
      </section>

      <section className="relative min-h-[760px] px-6 py-24 text-center text-white">
        <Image
          src="/images/hero-family-sea.jpg"
          alt=""
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[rgba(12,48,75,0.35)] to-[rgba(5,25,45,0.9)]" />
        <div className="relative z-10 flex min-h-[560px] flex-col items-center justify-center">
          <p className="text-sm font-bold tracking-[0.2em] text-brand-yellow">
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
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="https://rakutoku-blog.com/"
              className="rounded-full bg-white px-8 py-3 text-sm font-semibold text-brand-navy hover:opacity-90"
            >
              ブログを見る
            </Link>
            <a
              href="https://line.me/ti/g2/ZNyABEt8SLF6wnlkNPysD-2JnfzAuWduvd7qOw?utm_source=invitation&utm_medium=link_copy&utm_campaign=default"
              target="_blank"
              rel="noopener"
              className="rounded-full bg-[#06c755] px-8 py-3 text-sm font-semibold hover:opacity-90"
            >
              LINEに参加する
            </a>
            <Link
              href="/contact"
              className="rounded-full border border-white/75 bg-white/10 px-8 py-3 text-sm font-semibold backdrop-blur hover:bg-white/20"
            >
              お問い合わせ
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}

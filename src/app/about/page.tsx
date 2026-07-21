import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";

export const metadata = {
  title: "私たちについて｜とみ夫婦",
};

const journey = [
  {
    step: "2018",
    title: "結婚、ほぼゼロからスタート",
    description: "旅行も楽しみながら、家計づくりを始めました。",
  },
  {
    step: "STEP 1",
    title: "お得・家計管理を習慣に",
    description: "無理な我慢より、続けやすい仕組みを意識しました。",
  },
  {
    step: "STEP 2",
    title: "NISA・投資をスタート",
    description: "未来のためのお金を少しずつ育てています。",
  },
  {
    step: "NOW",
    title: "家族の「行きたい」を叶える暮らしへ",
    description: "沖縄やディズニーなど、家族の思い出を増やしています。",
  },
];

const promises = [
  "家族との時間を、いちばん大切にします。",
  "お金は、思い出を増やすために使います。",
  "無理な節約より、楽しみながら続けます。",
  "初心者にも、わかりやすくお伝えします。",
];

export default function AboutPage() {
  return (
    <>
      <Header />
      <PageHero
        eyebrow="ABOUT US"
        title="私たちについて"
        subtitle="旅行が大好きな、4人家族です。"
      />

      <section className="mx-auto max-w-3xl px-6 py-20 text-center md:px-12">
        <p className="text-sm font-bold tracking-[0.2em] text-brand-orange">HELLO!</p>
        <h2 className="mt-4 font-display text-2xl font-bold text-brand-navy md:text-3xl">
          こんにちは、
          <br />
          とみ夫婦です。
        </h2>
        <div className="mt-8 space-y-5 text-left text-brand-navy/80 leading-relaxed">
          <p>夫婦と子ども2人の4人家族。家族旅行とおいしいものが大好きです。</p>
          <p>
            結婚した頃は、結婚式や新婚旅行で貯金がほとんどなくなりました。そこから家計を見直し、ポイ活やお得、投資を少しずつ始めました。
          </p>
          <p>
            私たちが大切にしているのは、お金を増やすことそのものではありません。家族で行きたい場所へ行き、子どもたちにいろいろな景色を見せ、思い出を増やすことです。
          </p>
        </div>
      </section>

      <section className="bg-[#faf7f2] px-6 py-20 md:px-12">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-bold tracking-[0.2em] text-brand-orange">
            OUR JOURNEY
          </p>
          <h2 className="mt-4 font-display text-2xl font-bold text-brand-navy md:text-3xl">
            これまでの歩み
          </h2>
        </div>
        <div className="mx-auto mt-14 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {journey.map((item) => (
            <div key={item.title} className="rounded-3xl bg-white p-6 shadow-sm">
              <p className="text-xs font-bold tracking-[0.15em] text-brand-orange">
                {item.step}
              </p>
              <h3 className="mt-3 font-display text-base font-bold text-brand-navy">
                {item.title}
              </h3>
              <p className="mt-3 text-sm text-brand-navy/70">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 py-20 text-center md:px-12">
        <p className="text-sm font-bold tracking-[0.2em] text-brand-orange">
          OUR PROMISE
        </p>
        <h2 className="mt-4 font-display text-2xl font-bold text-brand-navy md:text-3xl">
          とみ夫婦のお約束
        </h2>
        <div className="mx-auto mt-12 grid max-w-3xl gap-6 text-left sm:grid-cols-2">
          {promises.map((promise, index) => (
            <div key={promise} className="flex items-start gap-4">
              <span className="font-display text-2xl font-bold text-brand-orange">
                {String(index + 1).padStart(2, "0")}
              </span>
              <p className="text-brand-navy/80">{promise}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </>
  );
}

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";

export const metadata = {
  title: "お問い合わせ｜とみ夫婦",
};

export default function ContactPage() {
  return (
    <>
      <Header />
      <PageHero
        eyebrow="CONTACT"
        title="お問い合わせ"
        subtitle="ご相談やお仕事のご依頼はこちらからお願いします。"
      />

      <section className="mx-auto max-w-2xl px-6 py-20 text-center md:px-12">
        <h2 className="font-display text-xl font-bold text-brand-navy md:text-2xl">
          お気軽にご連絡ください😊
        </h2>
        <p className="mt-4 text-brand-navy/70">
          PR・タイアップ、SNS運用、Canva投稿制作、記事制作などのご相談を受け付けています。
        </p>

        <div className="mt-10 rounded-3xl bg-brand-cream p-8">
          <p className="font-semibold text-brand-navy">
            LINEからもご連絡いただけます
          </p>
          <p className="mt-2 text-sm text-brand-navy/70">
            お得情報やブログ更新のお知らせも発信しています😊
          </p>
          <a
            href="https://line.me/ti/g2/ZNyABEt8SLF6wnlkNPysD-2JnfzAuWduvd7qOw?utm_source=invitation&utm_medium=link_copy&utm_campaign=default"
            target="_blank"
            rel="noopener"
            className="mt-6 inline-block rounded-full bg-[#06c755] px-8 py-3 text-sm font-semibold text-white hover:opacity-90"
          >
            LINEに参加する
          </a>
          <p className="mt-4 text-xs text-brand-navy/50">
            ※メールフォームは、送信先メールアドレスを設定すると利用できます。
          </p>
        </div>

        <form className="mt-14 space-y-6 text-left">
          <div>
            <label className="text-sm font-semibold text-brand-navy">お名前</label>
            <input
              type="text"
              required
              className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-brand-navy"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-brand-navy">
              メールアドレス
            </label>
            <input
              type="email"
              required
              className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-brand-navy"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-brand-navy">
              お問い合わせ種別
            </label>
            <select className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-brand-navy">
              <option>一般のお問い合わせ</option>
              <option>PR・タイアップ</option>
              <option>SNS運用・投稿制作</option>
              <option>その他のお仕事</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold text-brand-navy">
              お問い合わせ内容
            </label>
            <textarea
              required
              rows={5}
              className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-brand-navy"
            />
          </div>
          <button
            type="button"
            className="rounded-full bg-brand-orange px-8 py-3 text-sm font-semibold text-white opacity-60"
          >
            送信先を設定してください
          </button>
        </form>
      </section>

      <Footer />
    </>
  );
}

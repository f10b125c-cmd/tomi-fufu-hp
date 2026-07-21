import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import Link from "next/link";

export const metadata = {
  title: "プライバシーポリシー｜とみ夫婦",
  robots: "noindex",
};

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <PageHero eyebrow="PRIVACY POLICY" title="プライバシーポリシー" />

      <article className="mx-auto max-w-3xl px-6 py-20 text-brand-navy/80 leading-relaxed md:px-12">
        <h2 className="mt-8 font-display text-xl font-bold text-brand-navy first:mt-0">
          個人情報の利用目的
        </h2>
        <p className="mt-3">
          当サイトでは、お問い合わせの際に氏名やメールアドレス等をご入力いただく場合があります。取得した情報は、お問い合わせへの回答に必要な範囲で利用します。
        </p>

        <h2 className="mt-8 font-display text-xl font-bold text-brand-navy">
          広告・アクセス解析について
        </h2>
        <p className="mt-3">
          当サイトでは、今後アクセス解析や広告サービスを利用する場合があります。利用開始時には、使用サービスに合わせて本ページを更新します。
        </p>

        <h2 className="mt-8 font-display text-xl font-bold text-brand-navy">
          免責事項
        </h2>
        <p className="mt-3">
          当サイトの投資に関する情報は、特定の商品や銘柄の売買を推奨するものではありません。投資判断はご自身の責任で行ってください。
        </p>

        <h2 className="mt-8 font-display text-xl font-bold text-brand-navy">
          著作権
        </h2>
        <p className="mt-3">
          当サイトに掲載している文章・写真等の無断転載を禁止します。
        </p>

        <h2 className="mt-8 font-display text-xl font-bold text-brand-navy">
          お問い合わせ
        </h2>
        <p className="mt-3">
          <Link href="/contact" className="font-semibold text-brand-blue-deep">
            お問い合わせページ
          </Link>
          よりご連絡ください。
        </p>
      </article>

      <Footer />
    </>
  );
}

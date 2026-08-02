import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "わが家のダッシュボード｜とみ夫婦",
  description: "資産管理・家計簿・口座・ツールへの入口をまとめた、家族用のリンク集です。",
  robots: { index: false, follow: false },
};

type LinkItem = {
  icon: string;
  label: string;
  description: string;
  href?: string;
  note?: string;
};

type LinkGroup = {
  tag: string;
  title: string;
  lead: string;
  bg: string;
  items: LinkItem[];
};

const linkGroups: LinkGroup[] = [
  {
    tag: "DASHBOARD",
    title: "ダッシュボード",
    lead: "毎月の数字は、ここからひと目で。",
    bg: "bg-[#fff0d9]",
    items: [
      {
        icon: "📊",
        label: "資産管理",
        description: "総資産・運用資産・ローン残高の推移",
        href: "https://aseet.netlify.app/",
      },
      {
        icon: "🧾",
        label: "家計簿",
        description: "収支・収入・光熱費・支出内訳",
        href: "https://aseet.netlify.app/household.html",
      },
      {
        icon: "💰",
        label: "配当管理",
        description: "保有株と、これからの配当見込み",
        note: "OpenAI SitesのURLを教えてください",
      },
      {
        icon: "🏠",
        label: "わが家ダッシュボード",
        description: "モジュールをまとめたポータル",
        note: "OpenAI SitesのURLを教えてください",
      },
    ],
  },
  {
    tag: "KAKEI",
    title: "家計のツール",
    lead: "入力と見直しに使うもの。",
    bg: "bg-[#fff8c6]",
    items: [
      {
        icon: "📗",
        label: "家計エクセル",
        description: "月別の家計簿・資産管理表の大元",
        note: "Google Drive等の共有リンクを教えてください",
      },
      {
        icon: "🎫",
        label: "クーポンアプリ",
        description: "普段使っているお得アプリ",
        note: "使っているサービス名を教えてください",
      },
      {
        icon: "🎁",
        label: "ふるさと納税",
        description: "寄付枠の管理と申し込み",
        note: "利用サイトを教えてください",
      },
    ],
  },
  {
    tag: "ACCOUNT",
    title: "証券・銀行口座",
    lead: "残高確認と入出金はこちらから。",
    bg: "bg-[#dff5ff]",
    items: [
      {
        icon: "🏦",
        label: "SBI証券",
        description: "投資信託・ジュニアNISA・個別株",
        href: "https://www.sbisec.co.jp/",
        note: "口座の実在は資産管理表から推測。リンク先の確認をお願いします",
      },
      {
        icon: "🏦",
        label: "楽天証券",
        description: "楽天投資信託",
        href: "https://www.rakuten-sec.co.jp/",
        note: "口座の実在は資産管理表から推測。リンク先の確認をお願いします",
      },
      {
        icon: "🏛",
        label: "あおぞら銀行",
        description: "普通預金",
        href: "https://www.aozorabank.co.jp/",
        note: "口座の実在は資産管理表から推測。リンク先の確認をお願いします",
      },
      {
        icon: "🏛",
        label: "三井住友銀行",
        description: "クロス取引用",
        href: "https://www.smbc.co.jp/",
        note: "口座の実在は資産管理表から推測。リンク先の確認をお願いします",
      },
    ],
  },
  {
    tag: "SNS",
    title: "発信・運用",
    lead: "Instagramとブログのための道具箱。",
    bg: "bg-[#f2e8ff]",
    items: [
      {
        icon: "☕",
        label: "ブログ",
        description: "旅・投資・お得の記録",
        href: "https://rakutoku-blog.com/",
      },
      {
        icon: "📸",
        label: "Instagram",
        description: "とみ夫婦のアカウント",
        note: "アカウントURLを教えてください",
      },
      {
        icon: "📝",
        label: "台本・リサーチシート",
        description: "投稿の台本づくりとリサーチ",
        href: "https://docs.google.com/spreadsheets/d/1OtXkK-8lhgWMSIR0F58tSQHa23kF0l6qJJnjNqgl8oM/edit?gid=278183300#gid=278183300",
      },
      {
        icon: "📈",
        label: "ストーリー分析シート",
        description: "ストーリーズの実績分析",
        href: "https://docs.google.com/spreadsheets/d/1AY8IarHgcMkmKjW43e2y7vPGDpQRW9cdl2yaFCysB0g/edit?gid=277053774#gid=277053774",
      },
    ],
  },
];

const readyCount = linkGroups.reduce(
  (total, group) => total + group.items.filter((item) => item.href).length,
  0,
);
const totalCount = linkGroups.reduce((total, group) => total + group.items.length, 0);

function LinkCard({ item, bg }: { item: LinkItem; bg: string }) {
  const body = (
    <>
      <span className="text-3xl">{item.icon}</span>
      <h3 className="mt-4 font-display text-lg font-bold text-brand-navy">{item.label}</h3>
      <p className="mt-2 text-sm text-brand-navy/70">{item.description}</p>
    </>
  );

  if (!item.href) {
    return (
      <div className="rounded-3xl border-2 border-dashed border-brand-navy/20 bg-white/60 p-8">
        {body}
        <p className="mt-4 text-xs font-semibold text-brand-orange-deep">未設定</p>
        {item.note && <p className="mt-1 text-xs text-brand-navy/50">{item.note}</p>}
      </div>
    );
  }

  return (
    <a
      href={item.href}
      target="_blank"
      rel="noopener noreferrer"
      className={`group rounded-3xl ${bg} p-8 shadow-sm transition hover:-translate-y-2`}
    >
      {body}
      {item.note && <p className="mt-3 text-xs text-brand-navy/50">{item.note}</p>}
      <span className="mt-4 inline-block text-lg font-semibold text-brand-navy group-hover:opacity-70">
        →
      </span>
    </a>
  );
}

export default function DashboardPage() {
  return (
    <>
      <Header />

      <section className="bg-brand-cream px-6 py-20 text-center md:px-12">
        <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold tracking-[0.15em] text-brand-navy/60">
          <span className="text-brand-orange">●</span> PRIVATE
        </span>
        <h1 className="mx-auto mt-6 max-w-2xl font-display text-3xl font-bold text-brand-navy md:text-4xl">
          わが家のダッシュボード
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-brand-navy/70">
          資産も家計も、口座も発信も。
          <br />
          よく使う入口をひとつにまとめました。
        </p>
        <p className="mt-6 text-xs font-bold tracking-[0.2em] text-brand-navy/45">
          {readyCount} / {totalCount} LINKS READY
        </p>
      </section>

      {linkGroups.map((group) => (
        <section key={group.tag} className="px-6 py-16 md:px-12">
          <div className="mx-auto max-w-5xl">
            <p className="text-sm font-bold tracking-[0.2em] text-brand-orange">{group.tag}</p>
            <h2 className="mt-3 font-display text-2xl font-bold text-brand-navy md:text-3xl">
              {group.title}
            </h2>
            <p className="mt-3 text-brand-navy/70">{group.lead}</p>

            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {group.items.map((item) => (
                <LinkCard key={item.label} item={item} bg={group.bg} />
              ))}
            </div>
          </div>
        </section>
      ))}

      <section className="bg-white px-6 pb-24 md:px-12">
        <div className="mx-auto max-w-5xl rounded-3xl bg-brand-cream p-10 text-center">
          <p className="text-sm font-bold tracking-[0.2em] text-brand-orange">NOTE</p>
          <h2 className="mt-3 font-display text-xl font-bold text-brand-navy">
            このページは家族用です
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-brand-navy/70">
            検索エンジンには登録されない設定にしていますが、URLを知っていれば誰でも開けます。
            口座やパスワードそのものは置かず、リンクだけにとどめています。
          </p>
          <Link
            href="/"
            className="mt-8 inline-block rounded-full bg-brand-orange px-8 py-3 text-sm font-semibold text-white hover:opacity-90"
          >
            公式サイトへ戻る
          </Link>
        </div>
      </section>

      <Footer />
    </>
  );
}

import Link from "next/link";
import MobileMenu, { type MenuLink } from "./MobileMenu";

const navLinks: MenuLink[] = [
  { href: "/about", label: "私たちについて" },
  { href: "/travel", label: "家族旅行" },
  {
    href: "/money",
    label: "投資・NISA",
    // スマホのメニューでは、親の下に表示する
    children: [{ href: "/money/chart-study", label: "株価チャート学習" }],
  },
  { href: "/otoku", label: "お得・家計" },
  { href: "https://rakutoku-blog.com/", label: "ブログ" },
];

export default function Header({ transparent = false }: { transparent?: boolean }) {
  const textColor = transparent ? "text-white" : "text-brand-navy";

  return (
    <header
      className={`${
        transparent ? "absolute top-0 left-0 right-0 z-30" : "relative bg-white"
      } flex items-center justify-between gap-2 px-4 py-4 sm:px-6 md:px-12 md:py-5`}
    >
      <Link href="/" className={`flex items-center gap-2 ${textColor}`}>
        <span className="text-xl text-brand-yellow">☀</span>
        <span className="text-lg font-semibold tracking-wide">とみ夫婦</span>
      </Link>
      <nav className={`hidden items-center gap-8 text-sm md:flex ${textColor}`}>
        {navLinks.map((link) => (
          <Link key={link.href} href={link.href} className="hover:opacity-70">
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="flex items-center gap-1">
        <Link
          href="/contact"
          className="rounded-full bg-brand-orange px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 md:px-5"
        >
          お問い合わせ
        </Link>
        <MobileMenu links={navLinks} light={transparent} />
      </div>
    </header>
  );
}

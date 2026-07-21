import Link from "next/link";

const navLinks = [
  { href: "/about", label: "私たちについて" },
  { href: "/travel", label: "家族旅行" },
  { href: "/money", label: "投資・NISA" },
  { href: "/otoku", label: "お得・家計" },
  { href: "https://rakutoku-blog.com/", label: "ブログ" },
];

export default function Header({ transparent = false }: { transparent?: boolean }) {
  const textColor = transparent ? "text-white" : "text-brand-navy";

  return (
    <header
      className={`${
        transparent ? "absolute top-0 left-0 right-0 z-30" : "relative bg-white"
      } flex items-center justify-between px-6 py-5 md:px-12`}
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
      <Link
        href="/contact"
        className="rounded-full bg-brand-orange px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
      >
        お問い合わせ
      </Link>
    </header>
  );
}

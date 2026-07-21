import Link from "next/link";

const navLinks = [
  { href: "/about", label: "私たちについて" },
  { href: "/travel", label: "家族旅行" },
  { href: "/money", label: "投資・NISA" },
  { href: "/otoku", label: "お得・家計" },
  { href: "https://rakutoku-blog.com/", label: "ブログ" },
];

export default function Footer() {
  return (
    <footer className="bg-brand-navy px-6 py-14 text-white md:px-12">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-8 text-center">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <span className="text-xl">☀</span>
          <span>とみ夫婦</span>
        </div>
        <nav className="flex flex-wrap items-center justify-center gap-6 text-sm text-white/80">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-white">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <Link
            href="#"
            className="rounded-full bg-[#06c755] px-6 py-2.5 text-sm font-semibold hover:opacity-90"
          >
            LINE
          </Link>
          <Link
            href="/contact"
            className="rounded-full bg-brand-orange px-6 py-2.5 text-sm font-semibold hover:opacity-90"
          >
            お問い合わせ
          </Link>
        </div>
        <p className="text-xs text-white/50">© {new Date().getFullYear()} とみ夫婦</p>
      </div>
    </footer>
  );
}

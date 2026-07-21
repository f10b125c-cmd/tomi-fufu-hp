import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-brand-footer px-6 py-14 text-center text-white">
      <Link href="/" className="font-display text-2xl">
        とみ夫婦 <span className="text-brand-yellow">☀</span>
      </Link>
      <p className="mt-3 text-[#cbd5da]">
        投資とお得で、家族の「行きたい」を叶える。
      </p>
      <div className="mt-6 flex justify-center gap-6 text-sm">
        <Link href="/about" className="hover:opacity-80">
          私たちについて
        </Link>
        <Link href="/privacy" className="hover:opacity-80">
          プライバシーポリシー
        </Link>
        <Link href="/contact" className="hover:opacity-80">
          お問い合わせ
        </Link>
      </div>
      <small className="mt-6 block text-[#8999a2]">
        © TOMI FUFU. All Rights Reserved.
      </small>
    </footer>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export type MenuLink = {
  href: string;
  label: string;
  /** メニューの中で、親のすぐ下に少し下げて表示するリンク */
  children?: { href: string; label: string }[];
};

/** スマホ用のメニュー（md 未満で表示）。☰ ボタンで右から開く */
export default function MobileMenu({ links, light = false }: { links: MenuLink[]; light?: boolean }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  function close() {
    setOpen(false);
    buttonRef.current?.focus();
  }

  // 開いている間：背景のスクロールを止め、Esc で閉じ、Tab でメニューの外に出ないようにする
  useEffect(() => {
    if (!open) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    panelRef.current?.querySelector<HTMLElement>("a, button")?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      const items = panelRef.current.querySelectorAll<HTMLElement>("a, button");
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const isCurrent = (href: string) => pathname === href;

  return (
    <div className="md:hidden">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label="メニューを開く"
        className={`flex h-11 w-11 items-center justify-center rounded-full ${
          light ? "text-white hover:bg-white/15" : "text-brand-navy hover:bg-brand-cream"
        }`}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-50" role="presentation">
          <div className="absolute inset-0 bg-brand-navy/45" onClick={close} aria-hidden />
          <div
            ref={panelRef}
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="メニュー"
            className="absolute inset-y-0 right-0 flex w-[82%] max-w-xs flex-col overflow-y-auto bg-white shadow-xl"
            style={{ animation: "menu-in 0.2s ease-out" }}
          >
            <div className="flex items-center justify-between px-5 py-4">
              <span className="flex items-center gap-2 text-brand-navy">
                <span className="text-xl text-brand-yellow">☀</span>
                <span className="font-semibold tracking-wide">とみ夫婦</span>
              </span>
              <button
                type="button"
                onClick={close}
                aria-label="メニューを閉じる"
                className="flex h-11 w-11 items-center justify-center rounded-full text-brand-navy hover:bg-brand-cream"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            <nav aria-label="サイト内メニュー" className="flex-1 px-3">
              <ul>
                <li>
                  <MenuItem href="/" label="ホーム" current={isCurrent("/")} onNavigate={() => setOpen(false)} />
                </li>
                {links.map((link) => (
                  <li key={link.href}>
                    <MenuItem
                      href={link.href}
                      label={link.label}
                      current={isCurrent(link.href)}
                      onNavigate={() => setOpen(false)}
                    />
                    {link.children && (
                      <ul>
                        {link.children.map((child) => (
                          <li key={child.href}>
                            <MenuItem
                              href={child.href}
                              label={child.label}
                              current={pathname.startsWith(child.href)}
                              onNavigate={() => setOpen(false)}
                              nested
                            />
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </nav>

            <div className="p-5">
              <Link
                href="/contact"
                onClick={() => setOpen(false)}
                className="flex min-h-12 items-center justify-center rounded-full bg-brand-orange px-5 text-sm font-semibold text-white hover:opacity-90"
              >
                お問い合わせ
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MenuItem({
  href,
  label,
  current,
  onNavigate,
  nested = false,
}: {
  href: string;
  label: string;
  current: boolean;
  onNavigate: () => void;
  nested?: boolean;
}) {
  const external = href.startsWith("http");
  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={current ? "page" : undefined}
      className={`flex min-h-12 items-center justify-between rounded-xl px-3 hover:bg-brand-cream ${
        nested ? "ml-4 text-sm text-brand-navy/80" : "font-semibold text-brand-navy"
      } ${current ? "bg-brand-cream text-brand-orange-deep" : ""}`}
    >
      <span>
        {nested && <span aria-hidden>└ </span>}
        {label}
      </span>
      {external && (
        <span className="text-xs font-normal text-brand-navy/50" aria-label="（外部サイト）">
          ↗
        </span>
      )}
    </Link>
  );
}

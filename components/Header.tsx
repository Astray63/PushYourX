"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";
import { LangSwitch } from "./LangSwitch";
import type { Dict, Lang } from "@/lib/i18n";

export function Header({ lang, d }: { lang: Lang; d: Dict }) {
  const path = usePathname();

  const nav = [
    { href: "/", label: d.nav.leaderboard },
    { href: "/about", label: d.nav.about },
    { href: "/rules", label: d.nav.rules },
  ];

  return (
    <header className="sticky top-0 z-50 px-3 pt-3 pb-2 sm:px-4 sm:pt-4">
      <div className="mx-auto w-full max-w-5xl rounded-full border border-border bg-card/75 px-3 py-2 shadow-board backdrop-blur-xl sm:px-4 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:items-center">
        {/* Logo */}
        <div className="flex items-center justify-between gap-3 lg:justify-start">
          <Link
            href="/"
            className="group inline-flex shrink-0 items-center gap-2 sm:gap-2.5"
          >
            <Image
              src="/logo-mark-transparent.png"
              alt=""
              width={512}
              height={512}
              className="size-9 object-contain transition-transform duration-200 group-hover:-translate-y-0.5 sm:size-10"
              preload
            />
            <span className="text-[19px] leading-none font-semibold tracking-[-0.035em] sm:text-[21px]">
              PushYour<span className="text-primary">X</span>
            </span>
          </Link>

          {/* Actions compactes, mobile uniquement */}
          <div className="flex items-center gap-1.5 lg:hidden">
            <LangSwitch lang={lang} label={d.langLabel} />
            <ThemeToggle />
          </div>
        </div>

        {/* Liens : centrés sur desktop, sur une ligne dessous en mobile */}
        <nav className="mt-2 border-t border-border pt-2 lg:mt-0 lg:border-0 lg:pt-0">
          <ul className="flex items-center justify-center gap-1 sm:gap-2">
            {nav.map((n) => (
              <li key={n.href}>
                <Link
                  href={n.href}
                  className={`inline-flex rounded-full px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground sm:px-4 ${
                    path === n.href ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Actions desktop */}
        <div className="hidden items-center justify-end gap-2 lg:flex">
          <LangSwitch lang={lang} label={d.langLabel} />
          <ThemeToggle />
          <Link
            href="/#bid"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-bold tracking-[0.08em] whitespace-nowrap text-primary-fg uppercase transition-opacity hover:opacity-90"
          >
            {d.nav.cta}
            <svg
              viewBox="0 0 24 24"
              className="size-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M5 12h13M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </header>
  );
}

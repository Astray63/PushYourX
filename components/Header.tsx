"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";

const nav = [
  { href: "/", label: "Leaderboard" },
  { href: "/about", label: "About" },
  { href: "/rules", label: "Rules" },
];

export function Header() {
  const path = usePathname();

  return (
    <header className="sticky top-0 z-50 px-3 pt-3 pb-2 sm:px-4 sm:pt-4">
      <div className="mx-auto w-full max-w-5xl rounded-full border border-border bg-card/75 px-3 py-2 shadow-board backdrop-blur-xl sm:px-4 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:items-center">
        {/* Logo */}
        <div className="flex items-center justify-between gap-3 lg:justify-start">
          <Link
            href="/"
            className="inline-flex shrink-0 items-center gap-2 text-lg font-semibold tracking-[-0.04em] sm:text-xl"
          >
            <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-primary text-primary-fg">
              <svg viewBox="0 0 24 24" className="size-4" fill="none" aria-hidden>
                <path
                  d="M9.4 6.6 5.2 12l4.2 5.4M14.6 6.6 18.8 12l-4.2 5.4"
                  stroke="currentColor"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className="whitespace-nowrap">
              push your<span className="text-primary">.</span>x
            </span>
          </Link>

          {/* Actions compactes, mobile uniquement */}
          <div className="flex items-center gap-1 lg:hidden">
            <ThemeToggle />
          </div>
        </div>

        {/* Liens — centrés sur desktop, sur une ligne dessous en mobile */}
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
          <ThemeToggle />
          <Link
            href="/#bid"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-bold tracking-[0.08em] whitespace-nowrap text-primary-fg uppercase transition-opacity hover:opacity-90"
          >
            Push my X
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

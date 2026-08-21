import Link from "next/link";
import type { Dict } from "@/lib/i18n";

export function Footer({ d }: { d: Dict }) {
  return (
    <footer className="w-full border-t border-border">
      <div className="mx-auto w-full max-w-4xl px-4 py-8 text-center text-sm text-muted-foreground">
        <p>
          {d.footer.tagline}
          <span className="text-foreground">{d.footer.taglineStrong}</span>
        </p>
        <nav className="mt-3 flex flex-wrap items-center justify-center gap-4">
          <Link href="/rules" className="transition-colors hover:text-primary">
            {d.nav.rules}
          </Link>
          <Link href="/about" className="transition-colors hover:text-primary">
            {d.nav.about}
          </Link>
          <Link href="/privacy" className="transition-colors hover:text-primary">
            {d.nav.privacy}
          </Link>
          <a
            href="https://x.com/shiptesapps"
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-primary"
          >
            X
          </a>
        </nav>
        <p className="mt-4 text-xs text-muted-foreground/70">{d.footer.disclaimer}</p>
      </div>
    </footer>
  );
}

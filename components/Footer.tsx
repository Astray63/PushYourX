import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full border-t border-border">
      <div className="mx-auto w-full max-w-4xl px-4 py-8 text-center text-sm text-muted-foreground">
        <p>
          Rank is the bid, <span className="text-foreground">nothing else.</span>
        </p>
        <nav className="mt-3 flex flex-wrap items-center justify-center gap-4">
          <Link href="/rules" className="transition-colors hover:text-primary">
            Rules
          </Link>
          <Link href="/about" className="transition-colors hover:text-primary">
            About
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
        <p className="mt-4 text-xs text-muted-foreground/70">
          Not affiliated with X Corp. A bid buys a position, not a promise.
        </p>
      </div>
    </footer>
  );
}

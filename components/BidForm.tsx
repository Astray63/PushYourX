"use client";

import { useMemo, useState } from "react";
import { Avatar } from "./Avatar";
import { money } from "@/lib/format";

type Props = {
  nextBid: number;
  minBid: number;
  entries: { handle: string; amount: number }[];
  onDone: () => void;
};

export function BidForm({ nextBid, minBid, entries, onDone }: Props) {
  const [handle, setHandle] = useState("");
  const [post, setPost] = useState("");
  const [amount, setAmount] = useState(nextBid);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cleanHandle = handle.trim().replace(/^@+/, "").replace(/^.*[/]/, "").toLowerCase();
  const existing = useMemo(
    () => entries.find((e) => e.handle === cleanHandle),
    [entries, cleanHandle]
  );

  const rank = entries.filter((e) => e.amount >= amount && e.handle !== cleanHandle).length + 1;
  const owed = existing ? Math.max(0, amount - existing.amount) : amount;
  const bump = (d: number) => setAmount((a) => Math.max(minBid, Math.floor(a) + d));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ handle, post, amount, kind: "bid" }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error ?? "Something went wrong.");
      if (data.demo) onDone();
      window.location.href = data.url;
    } catch {
      setError("Network error, try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="scroll-mt-6">
      <h2 className="flex flex-wrap items-center justify-center gap-x-2 text-center text-[28px] font-bold tracking-[-0.03em] text-pretty md:text-[40px]">
        <span>Claim #{rank} for</span>
        <span className="inline-flex items-center gap-2">
          <button
            type="button"
            onClick={() => bump(-1)}
            aria-label="Lower the bid"
            className="inline-flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-full bg-primary-soft text-sm font-bold text-primary transition-colors hover:bg-primary hover:text-primary-fg"
          >
            −
          </button>

          <label className="relative inline-block text-primary underline decoration-2 decoration-dashed underline-offset-[6px]">
            <span className="sr-only">Amount in dollars</span>
            <span className="invisible whitespace-nowrap tabular-nums">${amount}</span>
            <span className="absolute inset-0 flex items-baseline">
              <span>$</span>
              <input
                type="number"
                min={minBid}
                step={1}
                value={amount}
                onChange={(e) => setAmount(Math.max(0, Math.floor(Number(e.target.value) || 0)))}
                onBlur={() => setAmount((a) => Math.max(minBid, a))}
                className="w-full min-w-0 bg-transparent p-0 font-[inherit] tabular-nums tracking-[inherit] text-[inherit] outline-none"
              />
            </span>
          </label>

          <button
            type="button"
            onClick={() => bump(1)}
            aria-label="Raise the bid"
            className="inline-flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-full bg-primary-soft text-sm font-bold text-primary transition-colors hover:bg-primary hover:text-primary-fg"
          >
            +
          </button>
        </span>
      </h2>

      <p className="mx-auto mt-2 max-w-md text-center text-sm leading-relaxed text-muted-foreground text-pretty">
        Whatever you pay is where you land. Go below the top price and you are still on the
        board, just further down the page.
      </p>

      <form onSubmit={submit} className="mt-4 flex flex-col gap-3">
        <div className="flex flex-col items-stretch gap-2 md:flex-row md:items-center">
          <div className="relative min-w-0 flex-1">
            <span className="absolute top-1/2 left-2.5 -translate-y-1/2">
              {cleanHandle ? (
                <Avatar handle={cleanHandle} size={32} />
              ) : (
                <span className="flex size-8 items-center justify-center rounded-full border border-border bg-muted text-muted-foreground">
                  <svg viewBox="0 0 24 24" className="size-3.5" fill="currentColor" aria-hidden>
                    <path d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.65l-5.22-6.82-5.96 6.82H1.68l7.73-8.84L1.26 2.25h6.82l4.71 6.23 5.45-6.23Zm-1.16 17.52h1.83L7.08 4.13H5.11l11.97 15.64Z" />
                  </svg>
                </span>
              )}
            </span>
            <input
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder="Your X profile or @handle"
              autoComplete="off"
              spellCheck={false}
              className="w-full min-w-0 rounded-full border border-input bg-card py-3.5 pr-4 pl-12 text-[15px] transition-colors outline-none placeholder:text-muted-foreground focus:border-primary-ring focus:ring-4 focus:ring-primary/10"
            />
          </div>

          <button
            type="submit"
            disabled={busy}
            className="inline-flex cursor-pointer items-center justify-center rounded-full bg-primary px-7 py-3.5 text-[15px] font-bold whitespace-nowrap text-primary-fg transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? "One second…" : "Push"}
          </button>
        </div>

        <div className="relative min-w-0">
          <span className="absolute top-1/2 left-4 -translate-y-1/2 text-muted-foreground">
            <svg
              viewBox="0 0 24 24"
              className="size-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7" />
              <path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" />
            </svg>
          </span>
          <input
            value={post}
            onChange={(e) => setPost(e.target.value)}
            placeholder="Feature one of your posts (optional)"
            autoComplete="off"
            spellCheck={false}
            className="w-full min-w-0 rounded-full border border-input bg-card py-3 pr-4 pl-11 text-sm transition-colors outline-none placeholder:text-muted-foreground focus:border-primary-ring focus:ring-4 focus:ring-primary/10"
          />
        </div>

        <p className="text-center text-xs leading-relaxed text-muted-foreground text-pretty">
          {existing ? (
            <>
              <span className="font-semibold text-primary">@{cleanHandle}</span> is already on the
              board at {money(existing.amount)}, so you only pay the difference,{" "}
              <span className="font-semibold text-foreground">{money(owed)}</span>.
            </>
          ) : (
            <>
              Paste a post link and your row shows it off, so the board sells your launch and not
              just your handle.
            </>
          )}
        </p>

        {error && (
          <p className="text-center text-xs font-medium text-destructive">{error}</p>
        )}
      </form>
    </section>
  );
}

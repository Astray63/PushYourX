"use client";

import { useState } from "react";
import { money } from "@/lib/format";

export function TakeoverCard({ price }: { price: number }) {
  const [open, setOpen] = useState(false);
  const [handle, setHandle] = useState("");
  const [tagline, setTagline] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ handle, tagline, amount: price, kind: "takeover" }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error ?? "Something went wrong.");
      window.location.href = data.url;
    } catch {
      setError("Network error — try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl bg-card shadow-board">
      <div className="flex flex-wrap items-center gap-4 p-5">
        <div className="min-w-0 flex-1">
          <h3 className="font-bold tracking-[-0.02em]">
            Takeover — sit above the whole board for 3 hours
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            A banner across the top of every page, above #1, counting down in public. It costs
            double the current top bid, so it gets pricier every time somebody pushes.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold tabular-nums text-primary">{money(price)}</span>
          <button
            onClick={() => setOpen((o) => !o)}
            className="cursor-pointer rounded-full bg-primary-soft px-4 py-2.5 text-sm font-bold text-primary transition-colors hover:bg-primary hover:text-primary-fg"
          >
            {open ? "Never mind" : "Take the top"}
          </button>
        </div>
      </div>

      {open && (
        <form
          onSubmit={submit}
          className="grid gap-2 border-t border-border p-5 sm:grid-cols-[1fr_1fr_auto]"
        >
          <input
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            placeholder="@yourhandle"
            autoComplete="off"
            spellCheck={false}
            className="rounded-full border border-input bg-background px-4 py-3 text-[15px] outline-none placeholder:text-muted-foreground focus:border-primary-ring"
          />
          <input
            value={tagline}
            onChange={(e) => setTagline(e.target.value.slice(0, 140))}
            placeholder="What should the banner say?"
            maxLength={140}
            className="rounded-full border border-input bg-background px-4 py-3 text-[15px] outline-none placeholder:text-muted-foreground focus:border-primary-ring"
          />
          <button
            type="submit"
            disabled={busy}
            className="cursor-pointer rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-fg transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {busy ? "…" : `Pay ${money(price)}`}
          </button>
          {error && <p className="text-sm text-destructive sm:col-span-3">{error}</p>}
        </form>
      )}
    </div>
  );
}

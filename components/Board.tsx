"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityCards } from "./ActivityCards";
import { BidForm } from "./BidForm";
import { Leaderboard } from "./Leaderboard";
import { LiveStats } from "./LiveStats";
import { TakeoverBanner } from "./TakeoverBanner";
import type { BoardData } from "@/lib/types";

export function Board({ initial, minBid }: { initial: BoardData; minBid: number }) {
  const [data, setData] = useState(initial);
  const [page, setPage] = useState(initial.page);
  const [refreshing, setRefreshing] = useState(false);
  const [prefill, setPrefill] = useState(0);
  const formRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async (p: number) => {
    setRefreshing(true);
    try {
      const res = await fetch(`/api/bids?page=${p}`, { cache: "no-store" });
      if (res.ok) setData(await res.json());
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (page !== data.page) load(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  useEffect(() => {
    const t = setInterval(() => load(page), 30_000);
    return () => clearInterval(t);
  }, [load, page]);

  const claim = (amount: number) => {
    setPrefill(amount);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <>
      {data.takeover && <TakeoverBanner takeover={data.takeover} />}

      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 pt-4 pb-16">
        <header className="mb-6 text-center">
          <h1 className="sr-only">Push Your X</h1>

          <LiveStats initialVisitors={data.stats.visitors} />

          <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-balance text-muted-foreground [text-wrap:pretty]">
            No algorithm, no engagement pods, no follow-for-follow. One list of X accounts,
            ordered by the only number that cannot be faked.{" "}
            <span className="font-semibold text-primary">
              How much is #1 worth to you?
            </span>
          </p>
        </header>

        <div className="flex flex-col gap-6">
          <div ref={formRef} id="bid" className="scroll-mt-28">
            <BidForm
              key={prefill}
              nextBid={prefill || data.stats.next}
              minBid={minBid}
              entries={data.entries.map((e) => ({ handle: e.handle, amount: e.amount }))}
              onDone={() => load(1)}
            />
          </div>

          <div>
            <ActivityCards activity={data.activity} trending={data.trending} />

            <div className="mb-2 flex items-center justify-end">
              <button
                onClick={() => load(page)}
                disabled={refreshing}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-card px-3.5 py-2 text-sm font-semibold shadow-board transition-colors hover:text-primary disabled:opacity-50"
              >
                <svg
                  viewBox="0 0 24 24"
                  className={`size-3.5 ${refreshing ? "animate-spin" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M20 11a8 8 0 1 0-.6 4M20 5v6h-6" />
                </svg>
                Refresh
              </button>
            </div>

            <Leaderboard entries={data.entries} onClaim={claim} />

            {data.pages > 1 && (
              <nav className="mt-5 flex items-center justify-center gap-1.5">
                {Array.from({ length: data.pages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === data.pages || Math.abs(p - data.page) <= 1)
                  .map((p, i, arr) => (
                    <span key={p} className="flex items-center gap-1.5">
                      {i > 0 && arr[i - 1] !== p - 1 && (
                        <span className="px-1 text-muted-foreground">…</span>
                      )}
                      <button
                        onClick={() => setPage(p)}
                        className={`size-8 cursor-pointer rounded-full text-sm font-semibold tabular-nums transition-colors ${
                          p === data.page
                            ? "bg-primary text-primary-fg"
                            : "bg-muted text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {p}
                      </button>
                    </span>
                  ))}
              </nav>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

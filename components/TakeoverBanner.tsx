"use client";

import { useEffect, useState } from "react";
import { Avatar } from "./Avatar";
import { countdown, money } from "@/lib/format";
import type { Takeover } from "@/lib/types";

export function TakeoverBanner({ takeover }: { takeover: Takeover }) {
  const [left, setLeft] = useState(takeover.expires_at - Date.now());

  useEffect(() => {
    const t = setInterval(() => setLeft(takeover.expires_at - Date.now()), 1000);
    return () => clearInterval(t);
  }, [takeover.expires_at]);

  if (left <= 0) return null;

  return (
    <aside className="mx-auto mb-2 w-full max-w-4xl px-4">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl border border-primary/30 bg-primary-soft px-4 py-3">
        <Avatar handle={takeover.handle} size={36} />
        <div className="min-w-0 flex-1">
          <p className="text-sm">
            <span className="mr-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold tracking-wider text-primary-fg uppercase">
              takeover
            </span>
            <a
              href={`https://x.com/${takeover.handle}?utm_source=pushyourx`}
              target="_blank"
              rel="noreferrer"
              className="font-bold hover:text-primary"
            >
              @{takeover.handle}
            </a>
            {takeover.tagline && (
              <span className="ml-2 text-muted-foreground">{takeover.tagline}</span>
            )}
          </p>
        </div>
        <p className="text-xs font-semibold tabular-nums text-primary">
          {money(takeover.amount)} · {countdown(left)} left
        </p>
      </div>
    </aside>
  );
}

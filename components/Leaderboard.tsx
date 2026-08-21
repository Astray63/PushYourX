"use client";

import { Avatar } from "./Avatar";
import { ago, money } from "@/lib/format";
import type { Entry } from "@/lib/types";

/** Plus le rang est haut, plus la ligne est teintée. */
function tone(rank: number) {
  if (rank === 1) return "border-primary bg-primary-soft";
  if (rank <= 3) return "border-primary/25 bg-primary-soft/70";
  if (rank <= 10) return "border-transparent bg-primary-soft-2";
  return "border-transparent bg-transparent";
}

export function Leaderboard({
  entries,
  onClaim,
}: {
  entries: Entry[];
  onClaim: (amount: number) => void;
}) {
  return (
    <div className="scroll-mt-6 rounded-2xl bg-card px-3 py-1.5 shadow-board md:px-7 md:py-3">
      {entries.length === 0 ? (
        <p className="px-1 py-14 text-center text-sm text-muted-foreground">
          The board is empty. Two dollars puts your handle at the top of nothing, for now.
        </p>
      ) : (
        <ol className="flex flex-col gap-2.5 py-2.5">
          {entries.map((e, i) => (
            <li
              key={e.id}
              className={`rise group relative flex items-center gap-3 rounded-2xl border px-3 py-3 transition-colors md:gap-4 md:px-4 ${tone(
                e.rank
              )}`}
              style={{ animationDelay: `${Math.min(i, 16) * 16}ms` }}
            >
              <span
                className={`inline-flex shrink-0 items-center justify-center rounded-full px-2.5 py-1 text-xs font-bold tabular-nums ${
                  e.rank === 1
                    ? "bg-primary text-primary-fg"
                    : e.rank <= 3
                      ? "bg-primary/15 text-primary"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                #{e.rank}
              </span>

              <Avatar handle={e.display_handle} size={48} className="hidden sm:flex" />

              <div className="min-w-0 flex-1">
                <a
                  href={`/api/click/${e.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 font-bold tracking-[-0.02em] transition-colors hover:text-primary"
                >
                  @{e.display_handle}
                  <svg
                    viewBox="0 0 24 24"
                    className="size-3 opacity-0 transition-opacity group-hover:opacity-50"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <path d="M7 17 17 7M9 7h8v8" />
                  </svg>
                </a>
                {e.tagline && (
                  <p className="text-sm leading-snug text-muted-foreground">{e.tagline}</p>
                )}
                <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-xs">
                  <span className="text-primary/80">{ago(e.updated_at)}</span>
                  <span className="size-1 rounded-full bg-primary/50" />
                  <span className="font-semibold text-muted-foreground">
                    {e.clicks.toLocaleString("en-US")} click{e.clicks === 1 ? "" : "s"}
                  </span>
                </p>
              </div>

              <div className="shrink-0 text-right">
                <p className="text-[15px] font-bold tabular-nums text-primary md:text-lg">
                  {money(e.amount)}
                </p>
                <button
                  onClick={() => onClaim(e.amount + 1)}
                  className="cursor-pointer text-[11px] text-muted-foreground transition-colors hover:text-primary"
                >
                  take it for {money(e.amount + 1)}
                </button>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

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
                {e.post_url && (
                  <a
                    href={e.post_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-flex max-w-full items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-xs font-medium transition-colors hover:border-primary-ring hover:text-primary"
                  >
                    <svg viewBox="0 0 24 24" className="size-3 shrink-0" fill="currentColor" aria-hidden>
                      <path d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.65l-5.22-6.82-5.96 6.82H1.68l7.73-8.84L1.26 2.25h6.82l4.71 6.23 5.45-6.23Zm-1.16 17.52h1.83L7.08 4.13H5.11l11.97 15.64Z" />
                    </svg>
                    <span className="truncate">Featured post</span>
                    <svg
                      viewBox="0 0 24 24"
                      className="size-2.5 shrink-0 opacity-50"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                    >
                      <path d="M7 17 17 7M9 7h8v8" />
                    </svg>
                  </a>
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
                  className="cursor-pointer text-[11px] whitespace-nowrap text-muted-foreground opacity-100 transition-all hover:text-primary focus-visible:opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                >
                  claim this rank for {money(e.amount + 1)}
                </button>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

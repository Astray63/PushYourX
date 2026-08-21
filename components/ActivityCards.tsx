"use client";

import { Avatar } from "./Avatar";
import { ago, money } from "@/lib/format";
import type { Activity, Trend } from "@/lib/types";
import type { Dict } from "@/lib/i18n";

function Card({ title, children }: { title: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="flex h-full flex-col rounded-2xl bg-card px-4 pt-3.5 pb-1 shadow-board md:px-5 md:pt-4">
      <h2 className="mb-1 text-sm font-semibold tracking-[-0.02em]">{title}</h2>
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </section>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex flex-1 items-center py-2.5 text-xs text-muted-foreground">{children}</p>
  );
}

export function ActivityCards({
  activity,
  trending,
  d,
}: {
  activity: Activity[];
  trending: Trend[];
  d: Dict;
}) {
  return (
    <div className="mb-6 grid grid-cols-1 items-stretch gap-4 md:grid-cols-2">
      <Card
        title={
          <span className="inline-flex items-center gap-1.5 text-live">
            <span className="relative inline-flex size-1.5 shrink-0">
              <span className="ping absolute inline-flex size-full rounded-full bg-live opacity-75" />
              <span className="relative inline-flex size-1.5 rounded-full bg-live" />
            </span>
            {d.cards.latest}
          </span>
        }
      >
        {activity.length === 0 ? (
          <Empty>{d.cards.noActivity}</Empty>
        ) : (
          <ul className="divide-y divide-border/60">
            {activity.map((a) => (
              <li key={a.id} className="flex items-center gap-2 py-2 text-xs">
                <Avatar handle={a.display_handle} size={20} />
                <span className="truncate font-medium">@{a.display_handle}</span>
                <span className="text-muted-foreground">
                  {a.updated_at === a.created_at ? d.cards.joinedAt : d.cards.raisedTo}
                </span>
                <span className="font-semibold text-primary tabular-nums">{money(a.amount)}</span>
                <span className="ml-auto shrink-0 whitespace-nowrap text-muted-foreground">
                  {ago(a.updated_at, d.board.ago)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card title={d.cards.trending}>
        {trending.length === 0 ? (
          <Empty>{d.cards.noTrending}</Empty>
        ) : (
          <ul className="divide-y divide-border/60">
            {trending.map((t) => (
              <li key={t.id} className="flex items-center gap-2 py-2 text-xs">
                <Avatar handle={t.display_handle} size={20} />
                <a
                  href={`/api/click/${t.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="truncate font-medium hover:text-primary"
                >
                  @{t.display_handle}
                </a>
                <span className="ml-auto shrink-0 font-semibold tabular-nums text-muted-foreground">
                  {t.hits === 1
                    ? d.cards.click(t.hits.toLocaleString("en-US"))
                    : d.cards.clicks(t.hits.toLocaleString("en-US"))}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

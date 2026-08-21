import type { Metadata } from "next";
import Link from "next/link";
import { stats } from "@/lib/board";
import { money } from "@/lib/format";

export const metadata: Metadata = {
  title: "About — push your.x",
  description: "Why a paid leaderboard for X accounts exists.",
};

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const s = await stats();

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pt-6 pb-16">
      <h1 className="text-center text-[32px] font-bold tracking-[-0.03em] md:text-[40px]">
        About
      </h1>

      <div className="mt-6 space-y-5 text-lg leading-relaxed text-muted-foreground [text-wrap:pretty]">
        <p>
          This is one page with one list on it. Every row is an X account, and the rows are
          ordered by what somebody paid to put them there. That is the whole product.
        </p>
        <p>
          Growing on X is mostly a game of being seen by people who have never heard of you. The
          usual routes are engagement pods, reply-guy grinding, or ads that get scrolled past.
          This is a fourth route, and it is at least honest about what it is: you are paying for
          a position on a list that other people are watching.
        </p>
        <p>
          The interesting part is not the list — it is the fight over it. Every time somebody
          takes #1, the account they pushed down has a reason to come back, and everyone watching
          has a reason to refresh.
        </p>
        <p className="font-semibold text-foreground">
          Rank is the bid — nothing else. No recency weighting, no follower count, no secret
          quality score. If that sounds unfair, it is, and it is the only rule that cannot be
          gamed.
        </p>
      </div>

      <dl className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { k: "Handles listed", v: s.listed.toLocaleString("en-US") },
          { k: "Top bid", v: s.top ? money(s.top) : "—" },
          { k: "Total pushed", v: money(s.volume) },
          { k: "Visitors", v: s.visitors.toLocaleString("en-US") },
        ].map((x) => (
          <div key={x.k} className="rounded-2xl bg-card px-4 py-3 text-center shadow-board">
            <dt className="text-xs text-muted-foreground">{x.k}</dt>
            <dd className="mt-1 text-lg font-bold tabular-nums text-primary">{x.v}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-6 rounded-2xl bg-card p-5 shadow-board md:p-6">
        <h2 className="text-sm font-bold tracking-[-0.02em] text-primary uppercase">
          The honest disclaimer
        </h2>
        <p className="mt-2.5 text-[15px] leading-relaxed text-muted-foreground">
          Nobody is promised followers. A bid buys a row and the clicks that row earns — what
          happens after somebody lands on your profile is entirely down to what you post. If your
          timeline is not worth following, no amount of money at the top of this page will fix
          that.
        </p>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="inline-flex cursor-pointer items-center rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-fg transition-opacity hover:opacity-90"
        >
          Take a rank
        </Link>
        <Link
          href="/rules"
          className="inline-flex cursor-pointer items-center rounded-full bg-muted px-6 py-3 text-sm font-bold text-muted-foreground transition-colors hover:text-foreground"
        >
          Read the rules
        </Link>
      </div>
    </div>
  );
}

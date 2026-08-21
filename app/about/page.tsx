import type { Metadata } from "next";
import Link from "next/link";
import { stats } from "@/lib/board";
import { money } from "@/lib/format";
import { getDict } from "@/lib/lang";

export const metadata: Metadata = {
  title: "About",
  description: "Why a paid leaderboard for X accounts exists.",
};

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const [{ d }, s] = await Promise.all([getDict(), stats()]);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pt-6 pb-16">
      <h1 className="text-center text-[32px] font-bold tracking-[-0.03em] md:text-[40px]">
        {d.about.title}
      </h1>

      <div className="mt-6 space-y-5 text-lg leading-relaxed text-muted-foreground [text-wrap:pretty]">
        {d.about.body.map((p) => (
          <p key={p}>{p}</p>
        ))}
        <p className="font-semibold text-foreground">{d.about.strong}</p>
      </div>

      <dl className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { k: d.about.stats.listed, v: s.listed.toLocaleString("en-US") },
          { k: d.about.stats.top, v: money(s.top) },
          { k: d.about.stats.volume, v: money(s.volume) },
          { k: d.about.stats.visitors, v: s.visitors.toLocaleString("en-US") },
        ].map((x) => (
          <div key={x.k} className="rounded-2xl bg-card px-4 py-3 text-center shadow-board">
            <dt className="text-xs text-muted-foreground">{x.k}</dt>
            <dd className="mt-1 text-lg font-bold tabular-nums text-primary">{x.v}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-6 rounded-2xl bg-card p-5 shadow-board md:p-6">
        <h2 className="text-sm font-bold tracking-[-0.02em] text-primary uppercase">
          {d.about.disclaimerTitle}
        </h2>
        <p className="mt-2.5 text-[15px] leading-relaxed text-muted-foreground">
          {d.about.disclaimer}
        </p>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="inline-flex cursor-pointer items-center rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-fg transition-opacity hover:opacity-90"
        >
          {d.about.ctaBid}
        </Link>
        <Link
          href="/rules"
          className="inline-flex cursor-pointer items-center rounded-full bg-muted px-6 py-3 text-sm font-bold text-muted-foreground transition-colors hover:text-foreground"
        >
          {d.about.ctaRules}
        </Link>
      </div>
    </div>
  );
}

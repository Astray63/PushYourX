import Link from "next/link";
import { Board } from "@/components/Board";
import {
  MIN_BID,
  activeTakeover,
  latestActivity,
  page as boardPage,
  stats,
  takeoverPrice,
  trending,
} from "@/lib/board";
import type { BoardData } from "@/lib/types";
import { getDict } from "@/lib/lang";

export const dynamic = "force-dynamic";



export default async function Home() {
  const { d } = await getDict();

  const [data, s, takeover, price, activity, trends] = await Promise.all([
    boardPage(1),
    stats(),
    activeTakeover(),
    takeoverPrice(),
    latestActivity(),
    trending(),
  ]);

  const initial: BoardData = {
    ...data,
    stats: s,
    takeover: takeover ?? null,
    takeoverPrice: price,
    activity,
    trending: trends,
  };

  return (
    <>
      <Board initial={initial} minBid={MIN_BID} d={d} />

      <div className="mx-auto w-full max-w-4xl px-4 pb-16">
        <h2 className="mb-4 text-center text-2xl font-bold tracking-[-0.03em]">
          {d.faqTitle}
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {d.faq.map((f) => (
            <article key={f.q} className="rounded-2xl bg-card p-5 shadow-board">
              <h3 className="text-sm font-bold tracking-[-0.02em]">{f.q}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
            </article>
          ))}
        </div>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          {d.faqFooter.before}
          <Link href="/rules" className="font-semibold text-primary hover:underline">
            {d.faqFooter.link}
          </Link>
          {d.faqFooter.after}
        </p>
      </div>
    </>
  );
}

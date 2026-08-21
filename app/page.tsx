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

export const dynamic = "force-dynamic";

const faq = [
  {
    q: "What do I actually get?",
    a: "A row on a public list, sorted by bid, linking straight to your X profile. Nothing else is promised. The followers are down to what you post.",
  },
  {
    q: "Someone pushed me down. Refund?",
    a: "No. You bought a position at a price, not a lease on #1. Bid again to climb back, and you only pay the gap.",
  },
  {
    q: "Can I bid on someone else's handle?",
    a: "Yes, and people do it as a gift or a joke. The owner can take the row over by bidding on it themselves.",
  },
  {
    q: "Why would this work?",
    a: "Because the fight over the list is the advertisement for the list. The bids are the content, and the people watching them are the audience you are buying.",
  },
];

export default async function Home() {
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
      <Board initial={initial} minBid={MIN_BID} />

      <div className="mx-auto w-full max-w-4xl px-4 pb-16">
        <h2 className="mb-4 text-center text-2xl font-bold tracking-[-0.03em]">
          Questions people actually ask
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {faq.map((f) => (
            <article key={f.q} className="rounded-2xl bg-card p-5 shadow-board">
              <h3 className="text-sm font-bold tracking-[-0.02em]">{f.q}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
            </article>
          ))}
        </div>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          The full terms live in the{" "}
          <Link href="/rules" className="font-semibold text-primary hover:underline">
            rules
          </Link>
          .
        </p>
      </div>
    </>
  );
}

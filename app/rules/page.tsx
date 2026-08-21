import type { Metadata } from "next";
import Link from "next/link";
import { MIN_BID, TAKEOVER_HOURS } from "@/lib/board";

export const metadata: Metadata = {
  title: "Rules · push your.x",
  description: "How the bidding works and what you are allowed to list.",
};

const sections = [
  {
    h: "How the rank is decided",
    items: [
      `Bids start at $${MIN_BID} and move in whole dollars. No cents.`,
      "The list is sorted by amount, highest first. On a tie, whoever got there first sits above.",
      "Bidding below the top still gets you listed, at whatever rank your amount buys.",
      "Already on the board? Enter the same handle with a bigger number. You are charged only the difference, and your row keeps its click count.",
      "There is no expiry. A row stays where it is until somebody pays more.",
    ],
  },
  {
    h: "What you can list",
    items: [
      "A public X handle, yours or one you are pushing on purpose. Handles are 1–15 characters: letters, numbers, underscores.",
      "The optional line under your handle is plain text, 140 characters, no links.",
      "No adult accounts, no accounts built for harassment, no impersonation of a real person or company.",
      "No invite links to chat platforms and no referral parameters. The row points at x.com and nothing else.",
      "Tracking parameters you submit are stripped. We append our own utm_source so the traffic shows up in your analytics.",
    ],
  },
  {
    h: "Money",
    items: [
      "Payment is taken up front through Stripe. Your row appears the moment it clears.",
      "Being outbid is not a refund event. You bought a rank at a price, and you keep whatever visibility that bought you.",
      "Removals are free: ask and the row comes down. The money does not come back.",
      `A takeover buys the banner above the board for ${TAKEOVER_HOURS} hours at double the current top bid. It does not change your rank on the list.`,
    ],
  },
  {
    h: "The parts we keep for ourselves",
    items: [
      "We remove rows that break these rules, without a refund, and we do not negotiate about it.",
      "We may change the minimum bid or the takeover formula. Rows already paid for are never repriced.",
      "This is a leaderboard, not an endorsement. A high rank means somebody paid, and nothing else.",
    ],
  },
];

export default function RulesPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 pt-6 pb-16">
      <h1 className="text-center text-[32px] font-bold tracking-[-0.03em] md:text-[40px]">
        Rules
      </h1>
      <p className="mx-auto mt-3 max-w-xl text-center text-lg leading-relaxed text-balance text-muted-foreground">
        A public leaderboard of X accounts. No ads, no API keys, no revenue share. You pay to
        stand above everybody else, and the number next to your handle is the entire explanation
        of why you are there.
      </p>

      <div className="mt-10 space-y-4">
        {sections.map((s) => (
          <section key={s.h} className="rounded-2xl bg-card p-5 shadow-board md:p-6">
            <h2 className="text-sm font-bold tracking-[-0.02em] text-primary uppercase">{s.h}</h2>
            <ul className="mt-3 space-y-2.5">
              {s.items.map((it) => (
                <li key={it} className="flex gap-3 text-[15px] leading-relaxed text-muted-foreground">
                  <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-primary/50" />
                  <span>{it}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/"
          className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-fg transition-opacity hover:opacity-90"
        >
          Back to the board
        </Link>
      </div>
    </div>
  );
}

import { NextResponse } from "next/server";
import { parseHandle, cleanTagline } from "@/lib/x";
import {
  MIN_BID,
  findByHandle,
  nextBid,
  priceFor,
  rankForAmount,
  settleBid,
  settleTakeover,
  takeoverPrice,
} from "@/lib/board";
import { createPending, markSettled } from "@/lib/pending";
import { isDemo, siteUrl, stripe } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  const kind = body.kind === "takeover" ? "takeover" : "bid";
  const parsed = parseHandle(String(body.handle ?? ""));
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const tagline = cleanTagline(String(body.tagline ?? ""));
  const amount = Math.floor(Number(body.amount));

  if (!Number.isFinite(amount)) {
    return NextResponse.json({ error: "Enter a whole dollar amount." }, { status: 400 });
  }

  if (kind === "takeover") {
    const floor = await takeoverPrice();
    if (amount < floor) {
      return NextResponse.json(
        { error: `A takeover costs at least $${floor.toLocaleString("en-US")}.` },
        { status: 400 }
      );
    }
  } else {
    if (amount < MIN_BID) {
      return NextResponse.json({ error: `The minimum bid is $${MIN_BID}.` }, { status: 400 });
    }
    const existing = await findByHandle(parsed.handle);
    if (existing && amount <= existing.amount) {
      return NextResponse.json(
        {
          error: `@${existing.display_handle} already holds $${existing.amount.toLocaleString(
            "en-US"
          )}. Go higher to move up.`,
        },
        { status: 400 }
      );
    }
  }

  const charge = kind === "takeover" ? amount : await priceFor(parsed.handle, amount);
  const pendingId = await createPending(parsed.handle, parsed.display, tagline, amount, kind);

  // Mode démo : aucune clé Stripe, la mise est validée immédiatement.
  if (isDemo || !stripe) {
    if (kind === "takeover") await settleTakeover(parsed.handle, tagline, amount);
    else await settleBid(parsed.handle, parsed.display, tagline, amount);
    await markSettled(pendingId);
    return NextResponse.json({ demo: true, url: `/success?p=${pendingId}` });
  }

  const rank = kind === "takeover" ? 0 : await rankForAmount(amount, parsed.handle);
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    success_url: `${siteUrl()}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl()}/?canceled=1`,
    client_reference_id: pendingId,
    metadata: { pendingId },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: Math.max(charge, 1) * 100,
          product_data: {
            name:
              kind === "takeover"
                ? "Push Your X — 3 hour takeover"
                : `Push Your X — rank #${rank} for @${parsed.display}`,
            description:
              kind === "takeover"
                ? "Your handle owns the top of the board for 3 hours."
                : `Bid of $${amount.toLocaleString("en-US")} on the leaderboard.`,
          },
        },
      },
    ],
  });

  return NextResponse.json({ url: session.url });
}

export async function GET() {
  const [next, takeover] = await Promise.all([nextBid(), takeoverPrice()]);
  return NextResponse.json({ next, takeover, demo: isDemo });
}

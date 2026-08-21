import { NextResponse } from "next/server";
import { parseHandle, cleanTagline, avatarUrlSafe } from "@/lib/x";
import {
  MIN_BID,
  TAKEOVER_HOURS,
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
  const isTakeover = kind === "takeover";
  const pretty = `$${amount.toLocaleString("en-US")}`;
  const existingBid = isTakeover ? undefined : await findByHandle(parsed.handle);

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    locale: "auto",
    submit_type: "pay",
    success_url: `${siteUrl()}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl()}/?canceled=1`,
    client_reference_id: pendingId,
    metadata: { pendingId, handle: parsed.handle, kind, amount: String(amount) },
    // Une enchère bouge vite : une session qui traîne une journée n'a pas de sens.
    expires_at: Math.floor(Date.now() / 1000) + 60 * 60,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: Math.max(charge, 1) * 100,
          product_data: {
            name: isTakeover
              ? `Takeover: @${parsed.display} above the whole board`
              : `Rank #${rank} for @${parsed.display}`,
            description: isTakeover
              ? `Your handle sits above #1 on every page for ${TAKEOVER_HOURS} hours, with a live countdown.`
              : existingBid
                ? `Raising @${parsed.display} from $${existingBid.amount.toLocaleString(
                    "en-US"
                  )} to ${pretty}. You are charged only the difference.`
                : `${pretty} on the leaderboard, linking straight to x.com/${parsed.display}.`,
            images: [avatarUrlSafe(parsed.display)],
          },
        },
      },
    ],
    payment_intent_data: {
      description: isTakeover
        ? `push your.x · takeover for @${parsed.display}`
        : `push your.x · rank #${rank} for @${parsed.display} at ${pretty}`,
    },
    custom_text: {
      submit: {
        message: isTakeover
          ? `The banner goes live the moment this clears, and runs for ${TAKEOVER_HOURS} hours.`
          : "Your rank is live the moment this clears. It holds until somebody pays a dollar more.",
      },
    },
  });

  return NextResponse.json({ url: session.url });
}

export async function GET() {
  const [next, takeover] = await Promise.all([nextBid(), takeoverPrice()]);
  return NextResponse.json({ next, takeover, demo: isDemo });
}

import { NextResponse } from "next/server";
import { settleBid, settleTakeover } from "@/lib/board";
import { getPending, markSettled } from "@/lib/pending";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) {
    return NextResponse.json({ error: "Stripe is not configured." }, { status: 400 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Missing signature." }, { status: 400 });

  let event;
  try {
    event = stripe.webhooks.constructEvent(await req.text(), signature, secret);
  } catch (err) {
    return NextResponse.json(
      { error: `Signature check failed: ${(err as Error).message}` },
      { status: 400 }
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const pendingId = session.metadata?.pendingId ?? session.client_reference_id;
    if (pendingId) await fulfill(pendingId);
  }

  return NextResponse.json({ received: true });
}

/** Écrit la mise en base. Idempotent : une session déjà réglée ne fait rien. */
export async function fulfill(pendingId: string) {
  const p = await getPending(pendingId);
  if (!p || p.settled) return p;

  if (p.kind === "takeover") await settleTakeover(p.handle, p.tagline, p.amount);
  else await settleBid(p.handle, p.display || p.handle, p.tagline, p.amount);

  await markSettled(pendingId);
  return getPending(pendingId);
}

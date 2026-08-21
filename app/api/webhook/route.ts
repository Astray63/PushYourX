import { NextResponse } from "next/server";
import { settleBid, settleTakeover } from "@/lib/board";
import { claimPending, getPending, releasePending } from "@/lib/pending";
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

  // `checkout.session.completed` n'est PAS une preuve de paiement : les moyens
  // à notification différée (SEPA, ACH, Bacs, Boleto, OXXO…) le déclenchent avec
  // payment_status "unpaid", et ne confirment qu'ensuite via async_payment_succeeded.
  if (
    event.type === "checkout.session.completed" ||
    event.type === "checkout.session.async_payment_succeeded"
  ) {
    const session = event.data.object;
    if (session.payment_status !== "paid") {
      return NextResponse.json({ received: true, ignored: session.payment_status });
    }

    const pendingId = session.metadata?.pendingId ?? session.client_reference_id;
    if (pendingId) await fulfill(pendingId);
  }

  return NextResponse.json({ received: true });
}

/**
 * Écrit la mise en base. Idempotent : la session est verrouillée par l'écriture
 * (`claimPending`) et non par une lecture préalable, donc deux appels simultanés
 * — webhook et /success — ne peuvent pas encaisser deux fois.
 */
export async function fulfill(pendingId: string) {
  const p = await claimPending(pendingId);
  if (!p) return getPending(pendingId); // inconnue ou déjà réglée

  try {
    if (p.kind === "takeover") await settleTakeover(p.handle, p.tagline, p.amount);
    else
      await settleBid(
        p.handle,
        p.display || p.handle,
        p.tagline,
        p.amount,
        p.post_url ?? "",
        p.post_text ?? "",
        p.post_author ?? ""
      );
  } catch (err) {
    // La mise n'est pas passée : on relâche pour que Stripe retente.
    await releasePending(pendingId);
    throw err;
  }

  return getPending(pendingId);
}

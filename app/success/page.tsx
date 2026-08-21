import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { getPending } from "@/lib/pending";
import { fulfill } from "@/app/api/webhook/route";
import { findByHandle, rankForAmount } from "@/lib/board";
import { money } from "@/lib/format";
import { stripe } from "@/lib/stripe";
import { getDict } from "@/lib/lang";
import { fill } from "@/lib/i18n";

export const dynamic = "force-dynamic";
export const metadata = { title: "You're on the board" };

async function resolvePending(params: { p?: string; session_id?: string }) {
  if (params.p) return getPending(params.p);
  if (params.session_id && stripe) {
    const session = await stripe.checkout.sessions.retrieve(params.session_id);
    const id = session.metadata?.pendingId ?? session.client_reference_id;
    // Filet de sécurité si le webhook n'est pas encore arrivé.
    if (id && session.payment_status === "paid") return (await fulfill(id)) ?? getPending(id);
    if (id) return getPending(id);
  }
  return undefined;
}

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ p?: string; session_id?: string }>;
}) {
  const params = await searchParams;
  const { d } = await getDict();
  const pending = await resolvePending(params);
  const row = pending ? await findByHandle(pending.handle) : undefined;
  const rank = row ? await rankForAmount(row.amount, "") : 0;

  return (
    <div className="mx-auto w-full max-w-lg px-4 pt-10 pb-20">
      <div className="rounded-2xl bg-card p-8 text-center shadow-board">
        {row ? (
          <>
            <div className="mx-auto mb-5 w-fit">
              <Avatar handle={row.display_handle} size={64} />
            </div>
            <p className="text-sm font-bold tracking-wider text-primary uppercase">
              {fill(d.success.rank, { n: rank })}
            </p>
            <h1 className="mt-2 text-[28px] font-bold tracking-[-0.03em]">
              {fill(d.success.onBoard, { handle: row.display_handle })}
            </h1>
            <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
              {fill(d.success.holding, { amount: money(row.amount) })}
            </p>
          </>
        ) : (
          <>
            <h1 className="text-[28px] font-bold tracking-[-0.03em]">{d.success.received}</h1>
            <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
              {d.success.writing}{" "}
              <span className="font-semibold text-foreground">
                {params.session_id ?? params.p ?? "n/a"}
              </span>
              .
            </p>
          </>
        )}

        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="cursor-pointer rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-fg transition-opacity hover:opacity-90"
          >
            {d.success.seeBoard}
          </Link>
          {row && (
            <a
              href={`https://x.com/intent/post?text=${encodeURIComponent(
                fill(d.success.dareText, { n: rank })
              )}`}
              target="_blank"
              rel="noreferrer"
              className="cursor-pointer rounded-full bg-muted px-6 py-3 text-sm font-bold text-muted-foreground transition-colors hover:text-foreground"
            >
              {d.success.dare}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

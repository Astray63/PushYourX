import { NextResponse } from "next/server";
import {
  activeTakeover,
  latestActivity,
  page,
  stats,
  takeoverPrice,
  trending,
} from "@/lib/board";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const p = Number(searchParams.get("page") ?? 1);

  const [data, s, takeover, price, activity, trends] = await Promise.all([
    page(Number.isFinite(p) ? p : 1),
    stats(),
    activeTakeover(),
    takeoverPrice(),
    latestActivity(),
    trending(),
  ]);

  return NextResponse.json(
    {
      ...data,
      stats: s,
      takeover: takeover ?? null,
      takeoverPrice: price,
      activity,
      trending: trends,
    },
    { headers: { "cache-control": "no-store" } }
  );
}

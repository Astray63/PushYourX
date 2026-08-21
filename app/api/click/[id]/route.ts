import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { trackClick } from "@/lib/board";
import { profileUrl } from "@/lib/x";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const bidId = Number(id);
  if (!Number.isFinite(bidId)) return NextResponse.redirect(new URL("/", req.url));

  const { data } = await supabase
    .from("bids")
    .select("display_handle")
    .eq("id", bidId)
    .eq("paid", true)
    .maybeSingle();

  if (!data) return NextResponse.redirect(new URL("/", req.url));

  await trackClick(bidId);
  return NextResponse.redirect(profileUrl(data.display_handle), 302);
}

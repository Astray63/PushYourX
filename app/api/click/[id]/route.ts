import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { trackClick } from "@/lib/board";
import { parsePostUrl, profileUrl } from "@/lib/x";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Compte le clic puis renvoie sur X. `?to=post` vise le post mis en avant,
 * sinon le profil. La carte du post passe par ici comme le handle : sans ça
 * le clic le plus probable de la ligne n'était compté nulle part.
 */
export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const home = NextResponse.redirect(new URL("/", req.url));

  const bidId = Number(id);
  if (!Number.isInteger(bidId) || bidId <= 0) return home;

  const { data } = await supabase
    .from("bids")
    .select("display_handle, post_url")
    .eq("id", bidId)
    .eq("paid", true)
    .maybeSingle();

  if (!data) return home;

  let target = profileUrl(data.display_handle);

  if (new URL(req.url).searchParams.get("to") === "post" && data.post_url) {
    // La base est censée ne contenir que du canonique, on revalide quand même :
    // c'est une redirection sortante construite à partir d'une valeur stockée.
    const post = parsePostUrl(data.post_url);
    if (post.ok) target = post.url;
  }

  await trackClick(bidId);
  return NextResponse.redirect(target, 302);
}

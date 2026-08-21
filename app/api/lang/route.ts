import { NextResponse } from "next/server";
import { LANG_COOKIE, isLang } from "@/lib/i18n";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Bascule la langue et renvoie le visiteur d'où il venait. Marche sans JS. */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const to = url.searchParams.get("to");
  const back = url.searchParams.get("from") || "/";

  // On ne redirige que vers une route interne : jamais vers un domaine tiers.
  const safeBack = back.startsWith("/") && !back.startsWith("//") ? back : "/";
  const res = NextResponse.redirect(new URL(safeBack, url.origin), 303);

  if (isLang(to)) {
    res.cookies.set(LANG_COOKIE, to, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
  }
  return res;
}

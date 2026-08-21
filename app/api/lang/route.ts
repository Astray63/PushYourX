import { NextResponse } from "next/server";
import { LANG_COOKIE, isLang } from "@/lib/i18n";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * On ne redirige que vers une route interne.
 * Valider par préfixe ne suffit pas : le parseur d'URL traite l'antislash
 * comme un slash, donc "/\evil.com" sort du site. On résout l'URL et on
 * compare l'origine obtenue, seul contrôle qui ne se contourne pas.
 */
function internalPath(back: string, origin: string): string {
  try {
    const target = new URL(back, origin);
    if (target.origin !== origin) return "/";
    return target.pathname + target.search + target.hash;
  } catch {
    return "/";
  }
}

/** Bascule la langue et renvoie le visiteur d'où il venait. Marche sans JS. */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const to = url.searchParams.get("to");
  const back = url.searchParams.get("from") || "/";

  const safeBack = internalPath(back, url.origin);
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

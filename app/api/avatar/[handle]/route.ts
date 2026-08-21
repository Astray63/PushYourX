import { NextResponse } from "next/server";
import { parseHandle } from "@/lib/x";

export const runtime = "nodejs";

/**
 * Proxy d'avatar. La source publique limite le débit (429) dès qu'on
 * l'appelle depuis beaucoup de pages : on passe par le CDN pour ne la
 * solliciter qu'une fois par handle et par région.
 */
export async function GET(_req: Request, ctx: { params: Promise<{ handle: string }> }) {
  const { handle } = await ctx.params;
  const parsed = parseHandle(handle);
  if (!parsed.ok) return new NextResponse(null, { status: 404 });

  try {
    const upstream = await fetch(
      `https://unavatar.io/x/${parsed.handle}?fallback=false`,
      { signal: AbortSignal.timeout(6000) }
    );

    if (!upstream.ok || !upstream.headers.get("content-type")?.startsWith("image/")) {
      // 404 volontaire : le composant bascule alors sur l'initiale.
      return new NextResponse(null, {
        status: 404,
        headers: { "cache-control": "public, s-maxage=3600" },
      });
    }

    return new NextResponse(upstream.body, {
      headers: {
        "content-type": upstream.headers.get("content-type") ?? "image/jpeg",
        // Un avatar bouge rarement : on le garde longtemps au bord.
        "cache-control": "public, max-age=3600, s-maxage=604800, stale-while-revalidate=604800",
      },
    });
  } catch {
    return new NextResponse(null, {
      status: 404,
      headers: { "cache-control": "public, s-maxage=300" },
    });
  }
}

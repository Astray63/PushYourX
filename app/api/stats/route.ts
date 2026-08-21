import { NextResponse } from "next/server";
import { createHmac } from "node:crypto";
import { stats, trackVisit } from "@/lib/board";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Identifiant de visiteur. Un simple sha256(ip|ua) est réversible : l'espace
 * IPv4 tient en 2^32, un UA courant se devine, la table `visits` se retrouve
 * donc en clair par force brute. Il faut une clé secrète, pas juste un hash.
 */
function visitorId(ip: string, ua: string): string | undefined {
  const key = process.env.VISITOR_SALT ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) return undefined; // pas de clé : on ne stocke rien plutôt que du réversible
  return createHmac("sha256", key).update(`${ip}|${ua}`).digest("hex").slice(0, 32);
}

export async function GET(req: Request) {
  // x-real-ip est posé par la plateforme ; x-forwarded-for peut contenir
  // une valeur envoyée par le client en tête de liste.
  const ip =
    req.headers.get("x-real-ip") ??
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "local";
  const ua = req.headers.get("user-agent") ?? "";

  const visitor = visitorId(ip, ua);
  if (visitor) await trackVisit(visitor);

  return NextResponse.json(await stats(), { headers: { "cache-control": "no-store" } });
}

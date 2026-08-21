import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { stats, trackVisit } from "@/lib/board";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "local";
  const ua = req.headers.get("user-agent") ?? "";
  const visitor = createHash("sha256").update(`${ip}|${ua}`).digest("hex").slice(0, 32);

  await trackVisit(visitor);
  return NextResponse.json(await stats(), { headers: { "cache-control": "no-store" } });
}

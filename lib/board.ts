import { ms, supabase } from "./supabase";
import { cleanTagline } from "./x";
import type { Activity, Entry, Stats, Takeover, Trend } from "./types";

export const MIN_BID = 2;
export const TAKEOVER_HOURS = 3;

type BidRow = {
  id: number;
  handle: string;
  display_handle: string;
  tagline: string;
  post_url: string;
  amount: number;
  clicks: number;
  created_at: string;
  updated_at: string;
};

const toEntry = (r: BidRow, rank: number): Entry => ({
  id: r.id,
  handle: r.handle,
  display_handle: r.display_handle,
  tagline: r.tagline,
  post_url: r.post_url ?? "",
  amount: r.amount,
  clicks: r.clicks,
  created_at: ms(r.created_at),
  updated_at: ms(r.updated_at),
  rank,
});

/** Rang = montant. Égalité -> la mise la plus ancienne passe devant. */
function ordered() {
  return supabase
    .from("bids")
    .select("*", { count: "exact" })
    .eq("paid", true)
    .order("amount", { ascending: false })
    .order("updated_at", { ascending: true })
    .order("id", { ascending: true });
}

export async function page(pageNum: number, perPage = 50) {
  const wanted = Math.max(1, Math.floor(pageNum) || 1);
  const from = (wanted - 1) * perPage;

  const { data, count, error } = await ordered().range(from, from + perPage - 1);
  if (error) throw error;

  const total = count ?? 0;
  const pages = Math.max(1, Math.ceil(total / perPage));

  return {
    entries: (data as BidRow[]).map((r, i) => toEntry(r, from + i + 1)),
    total,
    pages,
    page: wanted,
    perPage,
  };
}

export async function topAmount(): Promise<number> {
  const { data, error } = await supabase
    .from("bids")
    .select("amount")
    .eq("paid", true)
    .order("amount", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data?.amount ?? 0;
}

/** Prix à payer pour prendre la place n°1. */
export async function nextBid(): Promise<number> {
  return Math.max(MIN_BID, (await topAmount()) + 1);
}

export async function findByHandle(handle: string) {
  const { data, error } = await supabase
    .from("bids")
    .select("*")
    .eq("handle", handle)
    .eq("paid", true)
    .maybeSingle();
  if (error) throw error;
  return (data as BidRow | null) ?? undefined;
}

/** Rang qu'un montant obtiendrait s'il était payé maintenant. */
export async function rankForAmount(amount: number, ignoreHandle = ""): Promise<number> {
  const { data, error } = await supabase.rpc("rank_for_amount", {
    p_amount: amount,
    p_ignore: ignoreHandle,
  });
  if (error) throw error;
  return (data as number) ?? 1;
}

/**
 * Ce que l'utilisateur doit réellement payer.
 * Déjà listé -> il ne paie que la différence avec sa mise actuelle.
 */
export async function priceFor(handle: string, amount: number): Promise<number> {
  const existing = await findByHandle(handle);
  if (!existing) return amount;
  return Math.max(0, amount - existing.amount);
}

export async function settleBid(
  handle: string,
  display: string,
  tagline: string,
  amount: number,
  postUrl = ""
) {
  const { data, error } = await supabase.rpc("settle_bid", {
    p_handle: handle,
    p_display: display,
    p_tagline: cleanTagline(tagline),
    p_amount: amount,
    p_post_url: postUrl,
  });
  if (error) throw error;
  return data as BidRow;
}

/* ---------------- Takeover : la bannière plein écran ---------------- */

export async function activeTakeover(): Promise<Takeover | undefined> {
  const { data, error } = await supabase
    .from("takeover")
    .select("*")
    .gt("expires_at", new Date().toISOString())
    .order("expires_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (!data) return undefined;

  return {
    id: data.id,
    handle: data.handle,
    tagline: data.tagline,
    amount: data.amount,
    expires_at: ms(data.expires_at),
    created_at: ms(data.created_at),
  };
}

/** Prendre le haut du board coûte le double du n°1 (plancher inclus). */
export async function takeoverPrice(): Promise<number> {
  const [top, active] = await Promise.all([topAmount(), activeTakeover()]);
  const base = Math.max(top * 2, 100);
  return active ? Math.max(base, active.amount + 1) : base;
}

export async function settleTakeover(handle: string, tagline: string, amount: number) {
  const { data, error } = await supabase.rpc("settle_takeover", {
    p_handle: handle,
    p_tagline: cleanTagline(tagline),
    p_amount: amount,
    p_hours: TAKEOVER_HOURS,
  });
  if (error) throw error;
  return data;
}

/* ---------------- Clics, activité & stats ---------------- */

export async function trackClick(id: number) {
  const { error } = await supabase.rpc("track_click", { p_id: id });
  if (error) throw error;
}

export async function trackVisit(visitor: string) {
  const { error } = await supabase.rpc("track_visit", { p_visitor: visitor });
  if (error) throw error;
}

/** Les dernières mises encaissées, pour la carte "Latest activity". */
export async function latestActivity(limit = 5): Promise<Activity[]> {
  const { data, error } = await supabase
    .from("bids")
    .select("id, display_handle, amount, created_at, updated_at")
    .eq("paid", true)
    .order("updated_at", { ascending: false })
    .limit(limit);
  if (error) throw error;

  return (data ?? []).map((r) => ({
    id: r.id,
    display_handle: r.display_handle,
    amount: r.amount,
    created_at: ms(r.created_at),
    updated_at: ms(r.updated_at),
  }));
}

/** Les handles les plus cliqués sur la dernière heure. */
export async function trending(limit = 5): Promise<Trend[]> {
  const { data, error } = await supabase.rpc("board_trending", { p_limit: limit });
  if (error) throw error;

  return ((data ?? []) as { id: number; display_handle: string; amount: number; hits: number }[])
    .map((r) => ({ ...r, hits: Number(r.hits) }));
}

export async function stats(): Promise<Stats> {
  const { data, error } = await supabase.rpc("board_stats");
  if (error) throw error;

  const s = data as { online: number; visitors: number; listed: number; volume: number; top: number };
  return {
    online: Number(s.online),
    visitors: Number(s.visitors),
    listed: Number(s.listed),
    volume: Number(s.volume),
    top: Number(s.top),
    next: Math.max(MIN_BID, Number(s.top) + 1),
  };
}

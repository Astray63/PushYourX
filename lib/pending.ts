import { supabase } from "./supabase";

export type Kind = "bid" | "takeover";

export type Pending = {
  id: string;
  handle: string;
  display: string;
  tagline: string;
  post_url: string;
  post_text: string;
  post_author: string;
  amount: number;
  kind: Kind;
  settled: boolean;
  created_at: string;
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function createPending(
  handle: string,
  display: string,
  tagline: string,
  amount: number,
  kind: Kind,
  postUrl = "",
  postText = "",
  postAuthor = ""
): Promise<string> {
  const { data, error } = await supabase
    .from("pending")
    .insert({
      handle,
      display,
      tagline,
      amount,
      kind,
      post_url: postUrl,
      post_text: postText,
      post_author: postAuthor,
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

export async function getPending(id: string): Promise<Pending | undefined> {
  // Un id mal formé ferait échouer le cast uuid côté Postgres, donc un 500
  // sur une simple visite de /success?p=nimportequoi.
  if (!UUID_RE.test(id)) return undefined;

  const { data, error } = await supabase
    .from("pending")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return (data as Pending | null) ?? undefined;
}

/**
 * Prend la session en charge de façon atomique : un seul appelant peut voir
 * `settled` passer de false à true. Le webhook et /success peuvent donc courir
 * en parallèle sans encaisser deux fois. Renvoie undefined si déjà réglée.
 */
export async function claimPending(id: string): Promise<Pending | undefined> {
  if (!UUID_RE.test(id)) return undefined;

  const { data, error } = await supabase
    .from("pending")
    .update({ settled: true })
    .eq("id", id)
    .eq("settled", false)
    .select("*")
    .maybeSingle();
  if (error) throw error;
  return (data as Pending | null) ?? undefined;
}

/** Rend la session si l'écriture qui suit a échoué, pour que Stripe retente. */
export async function releasePending(id: string) {
  const { error } = await supabase.from("pending").update({ settled: false }).eq("id", id);
  if (error) throw error;
}

export async function markSettled(id: string) {
  const { error } = await supabase.from("pending").update({ settled: true }).eq("id", id);
  if (error) throw error;
}

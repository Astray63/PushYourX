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
  const { data, error } = await supabase
    .from("pending")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return (data as Pending | null) ?? undefined;
}

export async function markSettled(id: string) {
  const { error } = await supabase.from("pending").update({ settled: true }).eq("id", id);
  if (error) throw error;
}

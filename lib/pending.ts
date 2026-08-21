import { supabase } from "./supabase";

export type Kind = "bid" | "takeover";

export type Pending = {
  id: string;
  handle: string;
  display: string;
  tagline: string;
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
  kind: Kind
): Promise<string> {
  const { data, error } = await supabase
    .from("pending")
    .insert({ handle, display, tagline, amount, kind })
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

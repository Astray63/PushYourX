import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

function connect(): SupabaseClient {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requis. Voir .env.example."
    );
  }

  client ??= createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}

/**
 * Client serveur uniquement : la service_role key contourne RLS.
 * Initialisation paresseuse — sinon `next build` casse quand les variables
 * d'environnement ne sont pas présentes à la compilation.
 * Ne jamais l'importer depuis un composant client.
 */
export const supabase = new Proxy({} as SupabaseClient, {
  get: (_t, prop: keyof SupabaseClient) => Reflect.get(connect(), prop),
});

/** Postgres renvoie des timestamptz ISO ; l'UI travaille en millisecondes. */
export const ms = (iso: string | null | undefined) =>
  iso ? new Date(iso).getTime() : 0;

// Remplit le board avec des handles fictifs pour voir le rendu.
// Usage : node --env-file=.env scripts/seed.mjs [--reset]
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY requis (node --env-file=.env …)");
  process.exit(1);
}

const db = createClient(url, key, { auth: { persistSession: false } });

const demo = [
  ["nocturne_dev", "Ships one weird tool every friday. Mostly Rust, occasionally regret.", 4201],
  ["pixel_sorbet", "Design systems, gradients, and opinions about spacing.", 3150],
  ["margo_builds", "Building a CRM nobody asked for. 400 people disagree.", 2402],
  ["latency_gremlin", "Postgres tuning threads and cursed benchmark charts.", 1899],
  ["hana_ships", "Solo founder. $9k MRR. Posting the whole way up.", 1400],
  ["terminal_moth", "TUIs, dotfiles, and a fear of graphical interfaces.", 980],
  ["quietkernel", "Low-level things explained slowly.", 777],
  ["saas_hermit", "Left the job. Kept the spreadsheets.", 640],
  ["fern_and_code", "Plant photos between deploy threads.", 512],
  ["overdrawn_ceo", "Burn rate jokes from someone living them.", 404],
  ["mimic_ui", "Recreating famous interfaces badly, on purpose.", 333],
  ["null_pointer_pal", "Debugging in public. Painfully.", 256],
  ["cron_witch", "Automates everything, remembers nothing.", 199],
  ["draftfolder", "Half-finished essays about shipping.", 150],
  ["shipfast_shrimp", "Small guy, fast deploys.", 120],
  ["byteflorist", "Data viz that looks like bouquets.", 99],
  ["idle_thread", "Concurrency posts nobody reads.", 75],
  ["morningcommits", "Commits at 6am so you don't have to.", 54],
  ["semanticmess", "HTML opinions, strongly held.", 33],
  ["lurkmode", "Mostly reading. Occasionally posting.", 12],
  ["last_place_larry", "Proudly bottom of every leaderboard.", 2],
];

if (process.argv.includes("--reset")) {
  await db.from("clicks").delete().gt("id", 0);
  await db.from("bids").delete().gt("id", 0);
  console.log("Board cleared.");
}

const now = Date.now();
const rows = demo.map(([handle, tagline, amount], i) => {
  const at = new Date(now - (i + 1) * 60_000 * (7 + i * 3)).toISOString();
  return {
    handle,
    display_handle: handle,
    tagline,
    amount,
    clicks: Math.floor(amount / 3) + 11,
    paid: true,
    created_at: at,
    updated_at: at,
  };
});

const { error } = await db.from("bids").upsert(rows, { onConflict: "handle" });
if (error) {
  console.error(error);
  process.exit(1);
}
console.log(`Seeded ${rows.length} handles.`);

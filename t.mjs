import crypto from "node:crypto";
import Stripe from "stripe";
const BASE = "https://pushyourx.lol";
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/131 Safari/537.36";
const sleep = ms => new Promise(r => setTimeout(r, ms));
const get = (p, o = {}) => fetch(BASE + p, { headers: { "user-agent": UA }, ...o });
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
let pass = 0, fail = 0;
const check = (l, ok, x = "") => { console.log(`  ${ok ? "PASS" : "FAIL"}  ${l}${x ? "  " + x : ""}`); ok ? pass++ : fail++; };

async function bid(handle, amount, post) {
  const body = { handle, amount, kind: "bid" };
  if (post) body.post = post;
  const r = await get("/api/checkout", { method: "POST",
    headers: { "content-type": "application/json", "user-agent": UA }, body: JSON.stringify(body) });
  if (r.status !== 200) return { ok: false, status: r.status, err: (await r.json()).error };
  await sleep(700);
  const list = await stripe.checkout.sessions.list({ limit: 10 });
  const s = list.data.find(x => x.metadata?.handle === handle.replace(/^@/, "").toLowerCase() && x.status === "open");
  const payload = JSON.stringify({ id: "e", object: "event", type: "checkout.session.completed",
    data: { object: { id: s.id, object: "checkout.session", payment_status: "paid",
      client_reference_id: s.metadata.pendingId, metadata: s.metadata } } });
  const ts = Math.floor(Date.now() / 1000);
  const sig = crypto.createHmac("sha256", process.env.STRIPE_WEBHOOK_SECRET).update(`${ts}.${payload}`).digest("hex");
  const w = await fetch(BASE + "/api/webhook", { method: "POST",
    headers: { "content-type": "application/json", "stripe-signature": `t=${ts},v1=${sig}` }, body: payload });
  await stripe.checkout.sessions.expire(s.id).catch(() => {});
  return { ok: w.status === 200 };
}

console.log("\n== @shiptesapps sur le board ==");
console.log("  ...", (await bid("@shiptesapps", 30)).ok ? "mise encaissée" : "échec");
await sleep(1800);
let d = await (await get("/api/bids")).json();
let row = d.entries.find(e => e.handle === "shiptesapps");
check("handle listé", Boolean(row), row ? `#${row.rank} $${row.amount}` : "absent");

const av = await get(`/api/avatar/shiptesapps`);
check("avatar servi", av.status === 200 && (av.headers.get("content-type") ?? "").startsWith("image/"),
  `HTTP ${av.status} · ${av.headers.get("content-type")}`);
const html = await (await get("/")).text();
check("avatar référencé sur la page", html.includes("/api/avatar/shiptesapps"));
check("redirection profil", html.includes(`/api/click/${row?.id}`));
await sleep(700);

console.log("\n== Aperçu d'un post réel (mécanique oEmbed) ==");
const r2 = await bid("@naval", 40, "https://x.com/naval/status/1002103360646823936");
console.log("  ...", r2.ok ? "mise encaissée" : `échec ${r2.status ?? ""} ${r2.err ?? ""}`);
await sleep(2000);
d = await (await get("/api/bids")).json();
const nav = d.entries.find(e => e.handle === "naval");
check("post_url stocké", Boolean(nav?.post_url), nav?.post_url ?? "vide");
check("texte du post récupéré", Boolean(nav?.post_text), nav?.post_text ? `"${nav.post_text.slice(0, 46)}…"` : "VIDE");
check("auteur récupéré", Boolean(nav?.post_author), nav?.post_author ?? "vide");
const page2 = await (await get("/")).text();
check("aperçu rendu sur la page", nav?.post_text ? page2.includes(nav.post_text.slice(0, 30)) : false);
check("plus de bouton 'Featured post'", !page2.includes("Featured post"));

console.log(`\n===== ${pass} PASS / ${fail} FAIL =====`);

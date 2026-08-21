/** Normalisation + validation d'un handle X (Twitter). */

const HANDLE_RE = /^[A-Za-z0-9_]{1,15}$/;

/**
 * Réservés. Ne remplace pas une preuve de propriété du handle : tant qu'il
 * n'y a pas d'OAuth X, n'importe qui peut lister n'importe quel compte.
 * Cette liste ne couvre que les noms de service et les cas les plus évidents.
 */
const BLOCKED = new Set([
  // plateforme et noms de service
  "admin", "administrator", "twitter", "twittersupport", "x", "xsupport",
  "support", "help", "root", "system", "security", "staff", "official",
  "moderator", "mod", "team", "billing", "payments", "verified",
  // le site lui-meme
  "pushyourx", "push_your_x", "pushyourxlol",
  // valeurs sentinelles qui trainent dans les formulaires
  "null", "undefined", "nan", "none", "test",
]);

export type HandleResult =
  | { ok: true; handle: string; display: string }
  | { ok: false; error: string };

/**
 * Accepte "@elon", "elon", "x.com/elon", "https://twitter.com/elon?s=20"
 * et renvoie la forme canonique (minuscule) + la forme d'affichage.
 */
export function parseHandle(raw: string): HandleResult {
  let value = (raw ?? "").trim();
  if (!value) return { ok: false, error: "Enter your X handle." };

  // URL complète ou partielle -> on garde le premier segment de path
  const urlish = value.replace(/^https?:\/\//i, "").replace(/^www\./i, "");
  const m = urlish.match(/^(?:twitter\.com|x\.com)\/(.+)$/i);
  if (m) value = m[1];

  value = value.split(/[/?#]/)[0];
  value = value.replace(/^@+/, "").trim();

  if (!value) return { ok: false, error: "That doesn't look like an X profile." };
  if (!HANDLE_RE.test(value)) {
    return {
      ok: false,
      error: "Handles are 1–15 characters: letters, numbers and underscores only.",
    };
  }
  if (BLOCKED.has(value.toLowerCase())) {
    return { ok: false, error: "That handle is reserved." };
  }

  return { ok: true, handle: value.toLowerCase(), display: value };
}

export const profileUrl = (handle: string) =>
  `https://x.com/${handle}?utm_source=pushyourx`;

export const avatarUrl = (handle: string) =>
  `https://unavatar.io/x/${handle}?fallback=false`;

/** Variante pour Stripe : jamais de 404, sinon la session refuse l'image. */
export const avatarUrlSafe = (handle: string) =>
  `https://unavatar.io/x/${handle}`;

export function cleanTagline(raw: string | undefined | null): string {
  return (raw ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 140);
}

export type PostResult =
  | { ok: true; url: string; author: string; id: string }
  | { ok: false; error: string };

/**
 * Accepte un lien de post X sous n'importe quelle forme courante
 * (x.com, twitter.com, avec ou sans https, avec des paramètres de tracking)
 * et renvoie la forme canonique.
 */
export function parsePostUrl(raw: string): PostResult {
  const value = (raw ?? "").trim();
  if (!value) return { ok: false, error: "" };

  const cleaned = value
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .split(/[?#]/)[0];

  const m = cleaned.match(
    /^(?:twitter\.com|x\.com)\/([A-Za-z0-9_]{1,15})\/status(?:es)?\/(\d{1,25})\/?$/i
  );

  if (!m) {
    return {
      ok: false,
      error: "That should be a link to a post, like x.com/you/status/123…",
    };
  }

  const [, author, id] = m;
  return { ok: true, url: `https://x.com/${author}/status/${id}`, author, id };
}

export type PostPreview = { text: string; author: string };

/**
 * Récupère le texte d'un post via l'oEmbed public de X (aucune clé requise).
 * Appelé une seule fois, quand la mise est encaissée : l'affichage lit la base.
 * En cas d'échec on renvoie du vide, la ligne retombe alors sur le simple lien.
 */
export async function fetchPostPreview(postUrl: string): Promise<PostPreview> {
  const empty = { text: "", author: "" };
  try {
    const api = `https://publish.twitter.com/oembed?omit_script=1&dnt=true&url=${encodeURIComponent(
      postUrl
    )}`;
    const res = await fetch(api, {
      redirect: "follow",
      signal: AbortSignal.timeout(6000),
      headers: { accept: "application/json" },
    });
    if (!res.ok) return empty;

    const data = (await res.json()) as { html?: string; author_name?: string };
    if (!data.html) return empty;

    // L'oEmbed renvoie un <blockquote> : on ne garde que le paragraphe du post.
    const p = data.html.match(/<p[^>]*>([\s\S]*?)<\/p>/i)?.[1] ?? "";
    const text = p
      .replace(/<br\s*\/?>/gi, " ")
      .replace(/<[^>]+>/g, "")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&mdash;/g, "-")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 240);

    return { text, author: (data.author_name ?? "").slice(0, 60) };
  } catch {
    return empty;
  }
}

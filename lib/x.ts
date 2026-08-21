/** Normalisation + validation d'un handle X (Twitter). */

const HANDLE_RE = /^[A-Za-z0-9_]{1,15}$/;

const BLOCKED = new Set([
  "admin", "twitter", "x", "support", "root", "null", "undefined",
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

export function cleanTagline(raw: string | undefined | null): string {
  return (raw ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 140);
}

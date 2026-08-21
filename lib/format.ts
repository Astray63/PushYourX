import { fill, plural } from "./i18n";

export function money(n: number): string {
  return "$" + n.toLocaleString("en-US");
}

type AgoWords = {
  seconds: string;
  minutes_one: string;
  minutes_other: string;
  hours_one: string;
  hours_other: string;
  days_one: string;
  days_other: string;
  months_one: string;
  months_other: string;
};

export function ago(ts: number, w: AgoWords): string {
  const s = Math.max(1, Math.floor((Date.now() - ts) / 1000));
  if (s < 60) return fill(w.seconds, { n: s });
  const m = Math.floor(s / 60);
  if (m < 60) return plural({ one: w.minutes_one, other: w.minutes_other }, m);
  const h = Math.floor(m / 60);
  if (h < 24) return plural({ one: w.hours_one, other: w.hours_other }, h);
  const d = Math.floor(h / 24);
  if (d < 30) return plural({ one: w.days_one, other: w.days_other }, d);
  const months = Math.floor(d / 30);
  return plural({ one: w.months_one, other: w.months_other }, months);
}

export function countdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}

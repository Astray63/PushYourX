export function money(n: number): string {
  return "$" + n.toLocaleString("en-US");
}

type AgoWords = {
  seconds: (n: number) => string;
  minutes: (n: number) => string;
  hours: (n: number) => string;
  days: (n: number) => string;
  months: (n: number) => string;
};

export function ago(ts: number, w: AgoWords): string {
  const s = Math.max(1, Math.floor((Date.now() - ts) / 1000));
  if (s < 60) return w.seconds(s);
  const m = Math.floor(s / 60);
  if (m < 60) return w.minutes(m);
  const h = Math.floor(m / 60);
  if (h < 24) return w.hours(h);
  const d = Math.floor(h / 24);
  if (d < 30) return w.days(d);
  return w.months(Math.floor(d / 30));
}

export function countdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}

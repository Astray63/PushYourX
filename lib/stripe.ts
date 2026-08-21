import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;

/** Stripe n'est actif que si la clé est présente. Sinon : mode démo. */
export const stripe = key ? new Stripe(key) : null;

export const isDemo = !stripe;

export function siteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")
  );
}

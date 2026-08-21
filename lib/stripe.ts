import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;

export const stripe = key ? new Stripe(key) : null;

/**
 * Le mode démo valide une mise sans paiement : il ne doit jamais s'activer
 * ailleurs qu'en développement. Sans ce garde-fou, une clé Stripe absente
 * (variable oubliée sur un environnement, preview non protégée) transforme
 * le board en écriture libre sur la base de production.
 */
const demoAllowed =
  process.env.VERCEL_ENV !== "production" && process.env.NODE_ENV !== "production";

export const isDemo = !stripe && demoAllowed;

/** Stripe manquant là où la démo est interdite : on refuse la mise. */
export const paymentsUnavailable = !stripe && !demoAllowed;

export function siteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")
  );
}

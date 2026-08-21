# Push Your X

Un leaderboard public de comptes X, trié par le montant que chacun a payé pour y figurer.
Même mécanique d'enchère qu'`outbid.lol`, appliquée aux profils X — le rang **est** la mise,
rien d'autre.

## Concept

- Tu soumets ton `@handle` + un montant. Le montant décide du rang.
- Mise minimum : **2 $**, incréments d'1 $.
- Miser moins que le n°1 te place quand même sur le board, plus bas.
- Déjà listé ? Tu remises plus haut et tu ne paies que **la différence** (les clics sont conservés).
- Égalité de montant : la mise la plus ancienne passe devant.
- **Takeover** : une bannière au-dessus de tout le board pendant 3 h, au prix du double du n°1.
- Chaque ligne pointe vers `x.com/<handle>` avec un compteur de clics.
- Une mise peut **mettre en avant un post X** : le lien s'affiche sur la ligne, ce qui permet
  de pousser un lancement ou un produit et pas seulement un profil. Remiser sans redonner de
  lien conserve le post déjà attaché.
- Cartes **Latest activity** (dernières mises) et **🔥 Trending right now** (clics de la dernière heure).

## Design

Disposition reprise d'`outbid.lol` — thème clair crème, `max-w-4xl` centré, titre
« Claim #N for $X » avec stepper inline, formulaire en pill, lignes du board en cartes teintées —
mais avec le violet (`#7c3aed`) à la place de l'orange terracotta. Navbar flottante arrondie,
et un toggle clair/sombre dans le header ; le mode sombre passe en violet néon sur noir.

## Stack

Next.js 16 (App Router) · React 19 · Tailwind CSS v4 · Supabase (Postgres) · Stripe

## Lancer en local

```bash
npm install
cp .env.example .env      # puis renseigner les clés Supabase
npm run dev
```

Sans `STRIPE_SECRET_KEY`, le site tourne en **mode démo** : la mise est validée sans paiement.
Pratique pour développer — mais dès qu'une clé Stripe est présente, le mode démo se coupe tout
seul et plus rien ne peut entrer sur le board sans paiement.

## Variables d'environnement

| Variable | Rôle |
|---|---|
| `SUPABASE_URL` | URL du projet (Dashboard → Project Settings → API) |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé serveur — contourne RLS, **ne jamais l'exposer au client** |
| `STRIPE_SECRET_KEY` | Active Stripe Checkout (sans elle → mode démo) |
| `STRIPE_WEBHOOK_SECRET` | Vérifie la signature du webhook `checkout.session.completed` |
| `NEXT_PUBLIC_SITE_URL` | Base des URLs de retour Stripe |

## Paiements

Webhook Stripe à pointer sur `POST /api/webhook`. En local :

```bash
stripe listen --forward-to localhost:3000/api/webhook
```

La page `/success` sert de filet : si le webhook n'est pas encore arrivé, elle relit la session
Stripe et valide la mise elle-même. `fulfill()` est idempotent, donc les deux chemins ne peuvent
pas encaisser deux fois.

## Base de données

Postgres sur Supabase. **La base de production ne contient aucune donnée de test** — pas de
seed, pas de fixtures. Le board se remplit uniquement de mises réellement payées. Le schéma vit dans `supabase/migrations/` :

- `0001_init.sql` — tables `bids`, `pending`, `takeover`, `clicks`, `visits`
- `0002_functions.sql` — les opérations qui doivent être atomiques (`settle_bid`, `track_click`)
  ou agrégées (`board_stats`, `board_trending`, `rank_for_amount`)
- `0003_post_url.sql` — le post mis en avant, porté de `pending` jusqu'à `bids`

**RLS est activé sur toutes les tables, sans aucune policy.** Rien n'est joignable depuis le
navigateur : tout passe par les routes serveur Next.js avec la `service_role` key, qui contourne
RLS. C'est volontaire — laisser le client écrire dans `bids` permettrait à n'importe qui de se
placer n°1 sans payer.

## Structure

```
app/
  page.tsx              leaderboard + formulaire de mise + FAQ
  about/ rules/         pages statiques
  success/              confirmation post-paiement (valide si le webhook a du retard)
  api/
    bids/               GET  liste paginée + stats + activité + trending
    checkout/           POST crée la session Stripe (ou valide en mode démo)
    webhook/            POST checkout.session.completed → écrit la mise
    click/[id]/         redirection trackée vers le profil X
    stats/              visiteurs / en ligne
components/             Board, BidForm, Leaderboard, ActivityCards, TakeoverBanner/Card,
                        Header, Footer, ThemeToggle, Avatar, LiveStats
lib/
  supabase.ts           client service_role (init paresseuse)
  board.ts              règles d'enchère : rang, prix, takeover, clics, stats
  x.ts                  parsing/validation des handles (@x, x.com/x, URL complète)
```

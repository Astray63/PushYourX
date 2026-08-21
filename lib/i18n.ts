export const LANGS = ["en", "fr"] as const;
export type Lang = (typeof LANGS)[number];
export const DEFAULT_LANG: Lang = "en";
export const LANG_COOKIE = "pyx-lang";

export const isLang = (v: unknown): v is Lang =>
  typeof v === "string" && (LANGS as readonly string[]).includes(v);

/** Choisit la langue d'après l'en-tête Accept-Language du navigateur. */
export function langFromHeader(header: string | null | undefined): Lang {
  if (!header) return DEFAULT_LANG;
  const best = header
    .split(",")
    .map((part) => {
      const [tag, q] = part.trim().split(";q=");
      return { tag: tag.trim().toLowerCase(), q: q ? Number(q) : 1 };
    })
    .filter((x) => Number.isFinite(x.q))
    .sort((a, b) => b.q - a.q)
    .find((x) => x.tag.startsWith("fr") || x.tag.startsWith("en"));

  return best?.tag.startsWith("fr") ? "fr" : DEFAULT_LANG;
}

const en = {
  nav: { leaderboard: "Leaderboard", about: "About", rules: "Rules", cta: "Push my X" },
  stats: {
    online: "{n} online",
    visitors: "{n} visitors since launch",
    seeStats: "see stats",
  },
  hero: {
    lead: "No algorithm, no engagement pods, no follow-for-follow. One list of X accounts, ordered by the only number that cannot be faked.",
    kicker: "How much is #1 worth to you?",
  },
  form: {
    claim: "Claim #{rank} for",
    amountLabel: "Amount in dollars",
    lower: "Lower the bid",
    raise: "Raise the bid",
    explain:
      "Whatever you pay is where you land. Go below the top price and you are still on the board, just further down the page.",
    handlePlaceholder: "Your X profile or @handle",
    postPlaceholder: "Feature one of your posts (optional)",
    submit: "Push",
    submitting: "One second…",
    postHint:
      "Paste a post link and your row shows it off, so the board sells your launch and not just your handle.",
    alreadyOnBefore: " is already on the board at ",
    alreadyOnMiddle: ", so you only pay the difference, ",
    alreadyOnAfter: ".",
    networkError: "Network error, try again.",
    genericError: "Something went wrong.",
  },
  cards: {
    latest: "Latest activity",
    trending: "🔥 Trending right now",
    noActivity: "Nobody has entered the board yet.",
    noTrending: "No clicks in the last hour yet.",
    joinedAt: "joined at",
    raisedTo: "raised to",
    clicks: "{n} clicks",
    click: "{n} click",
  },
  board: {
    refresh: "Refresh",
    empty: "The board is empty. Two dollars puts your handle at the top of nothing, for now.",
    claimRank: "claim this rank for {amount}",
    seePost: "See the post",
    ago: {
      seconds: "{n}s ago",
      minutes_one: "{n} minute ago",
      minutes_other: "{n} minutes ago",
      hours_one: "{n} hour ago",
      hours_other: "{n} hours ago",
      days_one: "{n} day ago",
      days_other: "{n} days ago",
      months_one: "{n} month ago",
      months_other: "{n} months ago",
    },
  },
  footer: {
    tagline: "Rank is the bid, ",
    taglineStrong: "nothing else.",
    disclaimer: "Not affiliated with X Corp. A bid buys a position, not a promise.",
  },
  faqTitle: "Questions people actually ask",
  faq: [
    {
      q: "What do I actually get?",
      a: "A row on a public list, sorted by bid, linking straight to your X profile. Nothing else is promised. The followers are down to what you post.",
    },
    {
      q: "Someone pushed me down. Refund?",
      a: "No. You bought a position at a price, not a lease on #1. Bid again to climb back, and you only pay the gap.",
    },
    {
      q: "Can I bid on someone else's handle?",
      a: "Yes, and people do it as a gift or a joke. The owner can take the row over by bidding on it themselves.",
    },
    {
      q: "Why would this work?",
      a: "Because the fight over the list is the advertisement for the list. The bids are the content, and the people watching them are the audience you are buying.",
    },
  ],
  faqFooter: { before: "The full terms live in the ", link: "rules", after: "." },
  langLabel: "Language",

  about: {
    title: "About",
    body: [
      "This is one page with one list on it. Every row is an X account, and the rows are ordered by what somebody paid to put them there. That is the whole product.",
      "Growing on X is mostly a game of being seen by people who have never heard of you. The usual routes are engagement pods, reply-guy grinding, or ads that get scrolled past. This is a fourth route, and it is at least honest about what it is: you are paying for a position on a list that other people are watching.",
      "The interesting part is not the list. It is the fight over it. Every time somebody takes #1, the account they pushed down has a reason to come back, and everyone watching has a reason to refresh.",
    ],
    strong:
      "Rank is the bid, nothing else. No recency weighting, no follower count, no secret quality score. If that sounds unfair, it is, and it is the only rule that cannot be gamed.",
    stats: { listed: "Handles listed", top: "Top bid", volume: "Total pushed", visitors: "Visitors" },
    disclaimerTitle: "The honest disclaimer",
    disclaimer:
      "Nobody is promised followers. A bid buys a row and the clicks that row earns. What happens after somebody lands on your profile is entirely down to what you post. If your timeline is not worth following, no amount of money at the top of this page will fix that.",
    ctaBid: "Take a rank",
    ctaRules: "Read the rules",
  },

  rules: {
    title: "Rules",
    lead: "A public leaderboard of X accounts. No ads, no API keys, no revenue share. You pay to stand above everybody else, and the number next to your handle is the entire explanation of why you are there.",
    back: "Back to the board",
    sections: [
      {
        h: "How the rank is decided",
        items: [
          "Bids start at $2 and move in whole dollars. No cents.",
          "The list is sorted by amount, highest first. On a tie, whoever got there first sits above.",
          "Bidding below the top still gets you listed, at whatever rank your amount buys.",
          "Already on the board? Enter the same handle with a bigger number. You are charged only the difference, and your row keeps its click count.",
          "There is no expiry. A row stays where it is until somebody pays more.",
        ],
      },
      {
        h: "What you can list",
        items: [
          "A public X handle, yours or one you are pushing on purpose. Handles are 1 to 15 characters: letters, numbers, underscores.",
          "You may feature one of your posts. The link is shown on your row with a short preview.",
          "No adult accounts, no accounts built for harassment, no impersonation of a real person or company.",
          "No invite links to chat platforms and no referral parameters. The row points at x.com and nothing else.",
          "Tracking parameters you submit are stripped. We append our own utm_source so the traffic shows up in your analytics.",
        ],
      },
      {
        h: "Money",
        items: [
          "Payment is taken up front through Stripe. Your row appears the moment it clears.",
          "Being outbid is not a refund event. You bought a rank at a price, and you keep whatever visibility that bought you.",
          "Removals are free: ask and the row comes down. The money does not come back.",
        ],
      },
      {
        h: "The parts we keep for ourselves",
        items: [
          "We remove rows that break these rules, without a refund, and we do not negotiate about it.",
          "We may change the minimum bid. Rows already paid for are never repriced.",
          "This is a leaderboard, not an endorsement. A high rank means somebody paid, and nothing else.",
        ],
      },
    ],
  },

  success: {
    rank: "Rank #{n}",
    onBoard: "@{handle} is on the board.",
    holding:
      "{amount} is holding your place. It holds until somebody pays a dollar more, and you will find out fast when they do.",
    received: "Payment received.",
    writing: "Your row is being written. Refresh the board in a few seconds. If it is still not there, the reference is",
    seeBoard: "See the board",
    dare: "Dare them on X",
    dareText: "I'm #{n} on PushYourX. Come take it from me.",
  },
};

const fr: typeof en = {
  nav: { leaderboard: "Classement", about: "À propos", rules: "Règles", cta: "Pousser mon X" },
  stats: {
    online: "{n} en ligne",
    visitors: "{n} visiteurs depuis le lancement",
    seeStats: "voir les stats",
  },
  hero: {
    lead: "Pas d'algorithme, pas de pods d'engagement, pas d'abonnement mutuel. Une liste de comptes X, classée par le seul chiffre qu'on ne peut pas truquer.",
    kicker: "Combien vaut la première place pour toi ?",
  },
  form: {
    claim: "Prendre la place n°{rank} pour",
    amountLabel: "Montant en dollars",
    lower: "Baisser la mise",
    raise: "Augmenter la mise",
    explain:
      "Ce que tu paies décide de ta place. En dessous du prix de la première, tu es quand même sur le tableau, simplement plus bas.",
    handlePlaceholder: "Ton profil X ou @pseudo",
    postPlaceholder: "Mets un de tes posts en avant (facultatif)",
    submit: "Pousser",
    submitting: "Un instant…",
    postHint:
      "Colle le lien d'un post et ta ligne l'affiche : le tableau met en avant ton lancement, pas seulement ton pseudo.",
    alreadyOnBefore: " est déjà sur le tableau à ",
    alreadyOnMiddle: ", tu ne paies donc que la différence, ",
    alreadyOnAfter: ".",
    networkError: "Erreur réseau, réessaie.",
    genericError: "Une erreur est survenue.",
  },
  cards: {
    latest: "Dernière activité",
    trending: "🔥 En vogue maintenant",
    noActivity: "Personne n'est encore entré sur le tableau.",
    noTrending: "Aucun clic dans la dernière heure.",
    joinedAt: "est entré à",
    raisedTo: "est monté à",
    clicks: "{n} clics",
    click: "{n} clic",
  },
  board: {
    refresh: "Actualiser",
    empty: "Le tableau est vide. Deux dollars te placent en tête de rien du tout, pour l'instant.",
    claimRank: "prendre cette place pour {amount}",
    seePost: "Voir le post",
    ago: {
      seconds: "il y a {n} s",
      minutes_one: "il y a {n} minute",
      minutes_other: "il y a {n} minutes",
      hours_one: "il y a {n} heure",
      hours_other: "il y a {n} heures",
      days_one: "il y a {n} jour",
      days_other: "il y a {n} jours",
      months_one: "il y a {n} mois",
      months_other: "il y a {n} mois",
    },
  },
  footer: {
    tagline: "Le rang, c'est la mise, ",
    taglineStrong: "rien d'autre.",
    disclaimer:
      "Sans lien avec X Corp. Une mise achète une place, pas une promesse.",
  },
  faqTitle: "Les questions qu'on nous pose vraiment",
  faq: [
    {
      q: "Qu'est-ce que j'obtiens au juste ?",
      a: "Une ligne sur une liste publique, classée par mise, qui pointe droit vers ton profil X. Rien d'autre n'est promis : les abonnés dépendent de ce que tu publies.",
    },
    {
      q: "Quelqu'un m'a doublé. Remboursement ?",
      a: "Non. Tu as acheté une place à un prix, pas un bail sur la première position. Remise plus haut pour remonter, et tu ne paies que l'écart.",
    },
    {
      q: "Puis-je miser sur le compte de quelqu'un d'autre ?",
      a: "Oui, et certains le font pour offrir ou pour rire. Le propriétaire peut reprendre la ligne en misant lui-même dessus.",
    },
    {
      q: "Pourquoi ça marcherait ?",
      a: "Parce que la bagarre pour la liste est la publicité de la liste. Les mises sont le contenu, et ceux qui les regardent sont l'audience que tu achètes.",
    },
  ],
  faqFooter: { before: "Les conditions complètes sont dans les ", link: "règles", after: "." },
  langLabel: "Langue",

  about: {
    title: "À propos",
    body: [
      "Une page, une liste. Chaque ligne est un compte X, et les lignes sont classées selon ce que chacun a payé pour s'y trouver. C'est tout le produit.",
      "Grandir sur X, c'est surtout être vu par des gens qui n'ont jamais entendu parler de toi. Les voies habituelles : les pods d'engagement, le grind en réponse, ou la pub qu'on fait défiler. Voici une quatrième voie, au moins honnête sur ce qu'elle est : tu paies une place sur une liste que d'autres regardent.",
      "L'intéressant, ce n'est pas la liste. C'est la bagarre autour. Chaque fois que quelqu'un prend la première place, celui qu'il a doublé a une raison de revenir, et tous les spectateurs ont une raison d'actualiser.",
    ],
    strong:
      "Le rang, c'est la mise, rien d'autre. Pas de bonus de fraîcheur, pas de compte d'abonnés, pas de score de qualité caché. Si ça paraît injuste, ça l'est, et c'est la seule règle qu'on ne peut pas contourner.",
    stats: { listed: "Comptes listés", top: "Mise la plus haute", volume: "Total misé", visitors: "Visiteurs" },
    disclaimerTitle: "L'avertissement honnête",
    disclaimer:
      "Personne ne te promet des abonnés. Une mise achète une ligne et les clics qu'elle rapporte. Ce qui se passe une fois la personne sur ton profil dépend entièrement de ce que tu publies. Si ton fil ne vaut pas le suivi, aucune somme en haut de cette page n'y changera quoi que ce soit.",
    ctaBid: "Prendre une place",
    ctaRules: "Lire les règles",
  },

  rules: {
    title: "Règles",
    lead: "Un classement public de comptes X. Pas de pub, pas de clés d'API, pas de partage de revenus. Tu paies pour passer devant tout le monde, et le nombre à côté de ton pseudo explique à lui seul pourquoi tu es là.",
    back: "Retour au tableau",
    sections: [
      {
        h: "Comment le rang est décidé",
        items: [
          "Les mises démarrent à 2 $ et avancent par dollars entiers. Pas de centimes.",
          "La liste est triée par montant, du plus élevé au plus bas. À égalité, le premier arrivé passe devant.",
          "Miser sous la tête de liste te classe quand même, au rang que ton montant permet.",
          "Déjà sur le tableau ? Remets le même pseudo avec un montant plus élevé. Tu n'es facturé que la différence, et ta ligne garde ses clics.",
          "Il n'y a pas d'expiration. Une ligne reste en place jusqu'à ce que quelqu'un paie plus.",
        ],
      },
      {
        h: "Ce que tu peux inscrire",
        items: [
          "Un pseudo X public, le tien ou un que tu pousses volontairement. Les pseudos font de 1 à 15 caractères : lettres, chiffres, tirets bas.",
          "Tu peux mettre un de tes posts en avant. Le lien s'affiche sur ta ligne avec un court aperçu.",
          "Pas de comptes pour adultes, pas de comptes conçus pour harceler, pas d'usurpation d'une personne ou d'une entreprise réelle.",
          "Pas de liens d'invitation vers des messageries ni de paramètres d'affiliation. La ligne pointe vers x.com et rien d'autre.",
          "Les paramètres de suivi que tu envoies sont retirés. Nous ajoutons notre propre utm_source pour que le trafic apparaisse dans tes statistiques.",
        ],
      },
      {
        h: "L'argent",
        items: [
          "Le paiement est encaissé d'avance via Stripe. Ta ligne apparaît dès qu'il est validé.",
          "Se faire doubler ne donne pas droit à un remboursement. Tu as acheté un rang à un prix, et tu gardes la visibilité obtenue.",
          "Les retraits sont gratuits : demande et la ligne disparaît. L'argent, lui, ne revient pas.",
        ],
      },
      {
        h: "Ce que nous nous réservons",
        items: [
          "Nous retirons sans remboursement les lignes qui enfreignent ces règles, et cela ne se négocie pas.",
          "Nous pouvons changer la mise minimum. Les lignes déjà payées ne sont jamais retarifées.",
          "Ceci est un classement, pas une recommandation. Un rang élevé signifie que quelqu'un a payé, et rien d'autre.",
        ],
      },
    ],
  },

  success: {
    rank: "Place n°{n}",
    onBoard: "@{handle} est sur le tableau.",
    holding:
      "{amount} tiennent ta place. Elle tient jusqu'à ce que quelqu'un paie un dollar de plus, et tu le sauras vite.",
    received: "Paiement reçu.",
    writing: "Ta ligne est en cours d'écriture. Actualise le tableau dans quelques secondes. Si elle n'y est toujours pas, la référence est",
    seeBoard: "Voir le tableau",
    dare: "Lance le défi sur X",
    dareText: "Je suis n°{n} sur PushYourX. Viens me la prendre.",
  },
};

/**
 * Remplit un modèle : "{n} online" + { n: "5" } -> "5 online".
 * Le dictionnaire ne contient que des chaînes, jamais de fonctions :
 * une fonction ne peut pas franchir la frontière serveur -> client.
 */
export function fill(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, k) =>
    k in vars ? String(vars[k]) : `{${k}}`
  );
}

/** Choisit la forme singulier/pluriel puis interpole. */
export function plural(
  words: { one: string; other: string },
  n: number,
  vars: Record<string, string | number> = {}
): string {
  return fill(n > 1 ? words.other : words.one, { n, ...vars });
}

export const dict = { en, fr };
export type Dict = typeof en;
export const t = (lang: Lang): Dict => dict[lang];

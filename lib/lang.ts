import { cookies, headers } from "next/headers";
import { DEFAULT_LANG, LANG_COOKIE, isLang, langFromHeader, t, type Lang } from "./i18n";

/**
 * Langue de la requête : le choix explicite du visiteur prime,
 * sinon on suit ce que son navigateur annonce.
 */
export async function getLang(): Promise<Lang> {
  const chosen = (await cookies()).get(LANG_COOKIE)?.value;
  if (isLang(chosen)) return chosen;

  const accept = (await headers()).get("accept-language");
  return langFromHeader(accept) ?? DEFAULT_LANG;
}

export async function getDict() {
  const lang = await getLang();
  return { lang, d: t(lang) };
}

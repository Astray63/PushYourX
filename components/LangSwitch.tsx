"use client";

import { usePathname } from "next/navigation";
import { LANGS, type Lang } from "@/lib/i18n";

export function LangSwitch({ lang, label }: { lang: Lang; label: string }) {
  const path = usePathname();

  return (
    <div
      role="group"
      aria-label={label}
      className="inline-flex items-center rounded-full bg-muted p-0.5"
    >
      {LANGS.map((l) => (
        <a
          key={l}
          href={`/api/lang?to=${l}&from=${encodeURIComponent(path || "/")}`}
          aria-current={l === lang ? "true" : undefined}
          className={`rounded-full px-2 py-1 text-[11px] font-bold uppercase transition-colors ${
            l === lang
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {l}
        </a>
      ))}
    </div>
  );
}

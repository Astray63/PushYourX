import type { Metadata } from "next";
import Link from "next/link";
import { getDict } from "@/lib/lang";

export const metadata: Metadata = {
  title: "Privacy",
  description: "What this site stores, why, and for how long.",
};

export const dynamic = "force-dynamic";

export default async function PrivacyPage() {
  const { d } = await getDict();

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pt-6 pb-16">
      <h1 className="text-center text-[32px] font-bold tracking-[-0.03em] md:text-[40px]">
        {d.privacy.title}
      </h1>
      <p className="mx-auto mt-3 max-w-xl text-center text-lg leading-relaxed text-balance text-muted-foreground">
        {d.privacy.lead}
      </p>
      <p className="mt-2 text-center text-xs text-muted-foreground/70">{d.privacy.updated}</p>

      <div className="mt-10 space-y-4">
        {d.privacy.sections.map((s) => (
          <section key={s.h} className="rounded-2xl bg-card p-5 shadow-board md:p-6">
            <h2 className="text-sm font-bold tracking-[-0.02em] text-primary uppercase">{s.h}</h2>
            <ul className="mt-3 space-y-2.5">
              {s.items.map((it) => (
                <li
                  key={it}
                  className="flex gap-3 text-[15px] leading-relaxed text-muted-foreground"
                >
                  <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-primary/50" />
                  <span>{it}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/"
          className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-fg transition-opacity hover:opacity-90"
        >
          {d.privacy.back}
        </Link>
      </div>
    </div>
  );
}

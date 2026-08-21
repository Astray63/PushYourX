"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export function LiveStats({ initialVisitors = 0 }: { initialVisitors?: number }) {
  const [s, setS] = useState({ online: 1, visitors: initialVisitors });

  useEffect(() => {
    let alive = true;
    const load = () =>
      fetch("/api/stats", { cache: "no-store" })
        .then((r) => r.json())
        .then((d) => alive && setS(d))
        .catch(() => {});
    load();
    const t = setInterval(load, 20_000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, []);

  return (
    <Link
      href="/about"
      className="inline-block max-w-full rounded-full bg-muted px-3 py-1.5 text-center text-sm text-balance text-muted-foreground transition-colors hover:text-foreground"
    >
      <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
        <span className="relative inline-flex size-2 shrink-0">
          <span className="ping absolute inline-flex size-full rounded-full bg-live opacity-75" />
          <span className="relative inline-flex size-2 rounded-full bg-live" />
        </span>
        <span className="font-semibold text-live">
          {s.online.toLocaleString("en-US")} online
        </span>
      </span>
      <span> · {s.visitors.toLocaleString("en-US")} visitors since launch</span>
      <span className="text-foreground"> · see stats→</span>
    </Link>
  );
}

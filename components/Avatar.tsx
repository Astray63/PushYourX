"use client";

import { useState } from "react";

export function Avatar({
  handle,
  size = 40,
  className = "",
}: {
  handle: string;
  size?: number;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  return (
    <span
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-muted text-muted-foreground ${className}`}
      style={{ width: size, height: size }}
    >
      {failed ? (
        <span
          className="font-semibold uppercase"
          style={{ fontSize: size * 0.42 }}
        >
          {handle.slice(0, 1)}
        </span>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`https://unavatar.io/x/${handle}?fallback=false`}
          alt=""
          width={size}
          height={size}
          loading="lazy"
          className="size-full object-cover"
          onError={() => setFailed(true)}
        />
      )}
    </span>
  );
}

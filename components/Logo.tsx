export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <span className="relative grid size-8 place-items-center rounded-full border border-neon/60 bg-ink-2 glow">
        <svg viewBox="0 0 24 24" className="size-4 text-neon-soft" fill="none" aria-hidden>
          <path
            d="M9.5 7 5 12l4.5 5M14.5 7l4.5 5-4.5 5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="text-[15px] font-semibold tracking-tight">
        push your <span className="text-neon-soft text-glow">X</span>
      </span>
    </span>
  );
}

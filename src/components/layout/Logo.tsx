// Provisional text-based brand treatment (no official logo files were supplied).
// The mark: a recorded location (red dot) inside a map tile.
export function LogoMark({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <rect x="1" y="1" width="30" height="30" rx="8" fill="#111417" />
      <path d="M7 22.5 13 9.5l6 9 2.5-4 3.5 8" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="21.5" cy="14.5" r="3" fill="#d7261e" stroke="#111417" strokeWidth="1.2" />
    </svg>
  );
}

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`font-[family-name:var(--font-heading)] text-[19px] font-bold tracking-[-0.02em] text-ink ${className}`}>
      MingAnji<span className="text-signal">.ai</span>
    </span>
  );
}

export function Logo({ attribution }: { attribution?: string }) {
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark />
      <span className="flex flex-col leading-none">
        <Wordmark />
        {attribution && <span className="mt-1 font-mono text-[9.5px] uppercase tracking-[0.14em] text-steel">{attribution}</span>}
      </span>
    </span>
  );
}

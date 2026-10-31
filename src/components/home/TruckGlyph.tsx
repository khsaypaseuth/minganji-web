/** Simple illustrative silhouettes for the five truck categories (not specific models). */
export type TruckKind = "bucket" | "insulated" | "generator" | "drilling" | "fire";

function Base() {
  return (
    <>
      <path d="M6 50 H134" stroke="var(--ground)" strokeWidth="1.5" />
      <rect x="12" y="38" width="118" height="6" rx="2" fill="var(--glyph-chassis)" />
      <path d="M100 38 V18 Q100 15 103 15 H118 Q121 15 123 18 L130 28 V38 Z" fill="#fff" stroke="#8a929b" strokeWidth="1.5" />
      <path d="M104 19 H117 L122 27 H104 Z" fill="#dfe7ee" />
      {[30, 46, 112].map((x) => (
        <g key={x}>
          <circle cx={x} cy="46" r="6.5" fill="var(--glyph-tyre)" />
          <circle cx={x} cy="46" r="2.5" fill="#cfd4d9" />
        </g>
      ))}
    </>
  );
}

export function TruckGlyph({ kind }: { kind: TruckKind }) {
  return (
    <svg viewBox="0 0 140 60" className="h-auto w-full" aria-hidden="true" focusable="false">
      <Base />
      {(kind === "bucket" || kind === "insulated") && (
        <g>
          <rect x="16" y="30" width="80" height="8" rx="2" fill="#fff" stroke="#8a929b" strokeWidth="1.5" />
          <path d="M70 30 L52 12 L26 8" stroke="#8a929b" strokeWidth="5" strokeLinecap="round" fill="none" />
          <path d="M70 30 L52 12 L26 8" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          {kind === "insulated" && <path d="M44 10.6 L34 9.2" stroke="var(--signal)" strokeWidth="5" strokeLinecap="round" />}
          <rect x="16" y="3" width="13" height="11" rx="2" fill="#fff" stroke="#8a929b" strokeWidth="1.5" />
        </g>
      )}
      {kind === "generator" && (
        <g>
          <rect x="16" y="14" width="80" height="24" rx="3" fill="#fff" stroke="#8a929b" strokeWidth="1.5" />
          {[26, 32, 38, 44].map((x) => <path key={x} d={`M${x} 20 V32`} stroke="#cfd4d9" strokeWidth="2" />)}
          <path d="M66 20 l-5 8 h6 l-4 7" stroke="var(--signal)" strokeWidth="2" fill="none" strokeLinejoin="round" />
          <rect x="80" y="9" width="4" height="6" fill="#8a929b" />
        </g>
      )}
      {kind === "drilling" && (
        <g>
          <rect x="16" y="30" width="80" height="8" rx="2" fill="#fff" stroke="#8a929b" strokeWidth="1.5" />
          <path d="M66 30 L28 8" stroke="#8a929b" strokeWidth="5" strokeLinecap="round" />
          <path d="M66 30 L28 8" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
          <rect x="24" y="6" width="8" height="8" rx="1.5" fill="#fff" stroke="#8a929b" strokeWidth="1.5" />
          <path d="M28 14 V50" stroke="#5b636c" strokeWidth="2" />
          <path d="M25 38 l6 -2 M25 42 l6 -2 M25 46 l6 -2" stroke="var(--signal)" strokeWidth="1.5" />
        </g>
      )}
      {kind === "fire" && (
        <g>
          <rect x="16" y="16" width="84" height="22" rx="3" fill="#fff" stroke="#8a929b" strokeWidth="1.5" />
          <rect x="16" y="28" width="84" height="3" fill="var(--signal)" />
          <path d="M20 12 H92 M20 9 H92" stroke="#8a929b" strokeWidth="1.5" />
          {[26, 36, 46, 56, 66, 76, 86].map((x) => <path key={x} d={`M${x} 9 V12`} stroke="#8a929b" strokeWidth="1.5" />)}
          <rect x="106" y="11" width="10" height="4" rx="1.5" fill="var(--signal)" />
        </g>
      )}
    </svg>
  );
}

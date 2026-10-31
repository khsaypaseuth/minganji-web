// Simplified flag glyphs for the language selector. Flags are decorative —
// every flag is always shown next to the language name.
type Code = "gb" | "cn" | "la" | "th" | "vn";

export function Flag({ code, className = "" }: { code: Code; className?: string }) {
  return (
    <svg viewBox="0 0 30 20" className={`h-[14px] w-[21px] shrink-0 overflow-hidden rounded-[3px] ring-1 ring-black/10 ${className}`} aria-hidden="true" focusable="false">
      {code === "gb" && (
        <>
          <rect width="30" height="20" fill="#012169" />
          <path d="M0 0l30 20M30 0L0 20" stroke="#fff" strokeWidth="4" />
          <path d="M0 0l30 20M30 0L0 20" stroke="#C8102E" strokeWidth="1.6" />
          <path d="M15 0v20M0 10h30" stroke="#fff" strokeWidth="6" />
          <path d="M15 0v20M0 10h30" stroke="#C8102E" strokeWidth="3.4" />
        </>
      )}
      {code === "cn" && (
        <>
          <rect width="30" height="20" fill="#EE1C25" />
          <path fill="#FFFF00" d="M5 2.2l.9 2.7h2.8L6.4 6.6l.9 2.7L5 7.6 2.7 9.3l.9-2.7-2.3-1.7h2.8z" />
          {[[10, 2], [12, 4], [12, 7], [10, 9]].map(([x, y]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r="0.8" fill="#FFFF00" />
          ))}
        </>
      )}
      {code === "la" && (
        <>
          <rect width="30" height="20" fill="#CE1126" />
          <rect y="5" width="30" height="10" fill="#002868" />
          <circle cx="15" cy="10" r="4" fill="#fff" />
        </>
      )}
      {code === "th" && (
        <>
          <rect width="30" height="20" fill="#A51931" />
          <rect y="3.33" width="30" height="13.34" fill="#F4F5F8" />
          <rect y="6.67" width="30" height="6.66" fill="#2D2A4A" />
        </>
      )}
      {code === "vn" && (
        <>
          <rect width="30" height="20" fill="#DA251D" />
          <path fill="#FFFF00" d="M15 4.2l1.4 4.2h4.4l-3.6 2.6 1.4 4.2L15 12.6l-3.6 2.6 1.4-4.2-3.6-2.6h4.4z" />
        </>
      )}
    </svg>
  );
}

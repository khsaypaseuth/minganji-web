/** MingAnji assistant avatar: a calm "field unit" with a signal antenna. */
export function BotAvatar({ size = 40, idle = true }: { size?: number; idle?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true" focusable="false" className="shrink-0 overflow-visible">
      <g className={idle ? "bot-float" : undefined}>
        <path d="M24 9 V5" stroke="#111417" strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="24" cy="4.5" r="3" fill="#d7261e" />
        {idle && <circle cx="24" cy="4.5" r="3" fill="none" stroke="#d7261e" strokeWidth="1.5" className="pulse-ring" />}
        <rect x="7" y="10" width="34" height="30" rx="11" fill="#111417" />
        <rect x="11.5" y="17" width="25" height="12" rx="6" fill="#2b3036" />
        <g className={idle ? "bot-blink" : undefined} style={{ transformOrigin: "24px 23px" }}>
          <circle cx="18.5" cy="23" r="2.6" fill="#fff" />
          <circle cx="29.5" cy="23" r="2.6" fill="#fff" />
        </g>
        <path d="M19.5 33.5 q4.5 2.6 9 0" stroke="#d7261e" strokeWidth="2" fill="none" strokeLinecap="round" />
        <rect x="3.5" y="20" width="4" height="10" rx="2" fill="#2b3036" />
        <rect x="40.5" y="20" width="4" height="10" rx="2" fill="#2b3036" />
      </g>
    </svg>
  );
}

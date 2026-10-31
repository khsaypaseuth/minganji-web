import type { SVGProps } from "react";

const paths = {
  arrowRight: <path d="M5 12h14M13 6l6 6-6 6" />,
  arrowUpRight: <path d="M7 17 17 7M8 7h9v9" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  globe: (<><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.6 2.7 3.8 5.7 3.8 9s-1.2 6.3-3.8 9c-2.6-2.7-3.8-5.7-3.8-9S9.4 5.7 12 3z" /></>),
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  chevronDown: <path d="m6 9.5 6 6 6-6" />,
  mail: (<><rect x="3.5" y="5.5" width="17" height="13" rx="2" /><path d="m4 7 8 6 8-6" /></>),
  pin: (<><path d="M12 21s-6.5-6.2-6.5-11a6.5 6.5 0 0 1 13 0c0 4.8-6.5 11-6.5 11z" /><circle cx="12" cy="10" r="2.3" /></>),
  login: <path d="M10 4H5v16h5M14 8l4 4-4 4M18 12H9" />,
  send: <path d="M4 12 20 4l-6 16-2.5-6.5L4 12z" />,
  map: (<><path d="M9 4 3.5 6v14L9 18l6 2 5.5-2V4L15 6 9 4z" /><path d="M9 4v14M15 6v14" /></>),
  gauge: (<><path d="M4.5 16a8 8 0 1 1 15 0" /><path d="M12 13l4-4" /><circle cx="12" cy="13" r="1.2" /></>),
  layers: (<><path d="m12 4 9 5-9 5-9-5 9-5z" /><path d="m3 14 9 5 9-5" /></>),
  users: (<><circle cx="9" cy="8" r="3.2" /><path d="M3 19c1-3 3.3-4.6 6-4.6s5 1.6 6 4.6" /><path d="M16 5.2a3 3 0 0 1 0 5.6M18 14.6c1.6.6 2.6 2 3 4.4" /></>),
  chart: <path d="M4 20V10M10 20V4M16 20v-7M21 20H3" />,
  clipboard: (<><rect x="5" y="4.5" width="14" height="16" rx="2" /><path d="M9 4.5h6v3H9zM8.5 12h7M8.5 16h5" /></>),
  download: (<><path d="M12 4v11M7.5 10.5 12 15l4.5-4.5" /><path d="M5 19.5h14" /></>),
  cpu: (<><rect x="6" y="6" width="12" height="12" rx="2" /><path d="M9.5 9.5h5v5h-5zM9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3" /></>),
  signal: (<><path d="M5 12a7 7 0 0 1 14 0" /><path d="M8 12a4 4 0 0 1 8 0" /><circle cx="12" cy="12" r="1.2" /><path d="M12 13v7" /></>),
  clock: (<><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>),
  drill: (<><path d="M12 3v4M8 7h8l-1 4H9z" /><path d="M10 11l1 3-1 2 2 2-1 2 1 1.5M14 11l-1 3 1 2-2 2 1 2-1 1.5" /></>),
  sparkle: <path d="M12 3.5l1.7 5.1 5.3 1.9-5.3 1.9L12 17.5l-1.7-5.1L5 10.5l5.3-1.9L12 3.5zM18.5 15.5l.7 2 2 .8-2 .7-.7 2-.7-2-2-.7 2-.8.7-2z" />,
  refresh: <path d="M4.5 12a7.5 7.5 0 0 1 13-5.1L20 9.5M20 4.5v5h-5M19.5 12a7.5 7.5 0 0 1-13 5.1L4 14.5M4 19.5v-5h5" />,
  alert: (<><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5v5.5M12 16.3v.2" /></>),
  info: (<><circle cx="12" cy="12" r="8.5" /><path d="M12 11v5M12 7.7v.2" /></>),
  copy: (<><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V5.5A1.5 1.5 0 0 0 14.5 4h-9A1.5 1.5 0 0 0 4 5.5v9A1.5 1.5 0 0 0 5.5 16H8" /></>),
  plus: <path d="M12 5v14M5 12h14" />,
  sun: (<><circle cx="12" cy="12" r="3.8" /><path d="M12 3v1.8M12 19.2V21M3 12h1.8M19.2 12H21M5.6 5.6l1.3 1.3M17.1 17.1l1.3 1.3M5.6 18.4l1.3-1.3M17.1 6.9l1.3-1.3" /></>),
  moon: <path d="M19.5 14.6A7.8 7.8 0 0 1 9.4 4.5a7.8 7.8 0 1 0 10.1 10.1z" />,
  monitor: (<><rect x="3.5" y="4.5" width="17" height="11.5" rx="2" /><path d="M9 20h6M12 16v4" /></>),
} as const;

export type IconName = keyof typeof paths;

export function Icon({ name, size = 20, strokeWidth = 1.75, ...rest }: { name: IconName; size?: number; strokeWidth?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" {...rest}>
      {paths[name]}
    </svg>
  );
}

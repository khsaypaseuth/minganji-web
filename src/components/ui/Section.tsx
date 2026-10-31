import type { ReactNode } from "react";

export function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-[1240px] px-5 sm:px-8 ${className}`}>{children}</div>;
}

export function SectionHeading({ eyebrow, title, lead, align = "left", as: Tag = "h2", id }: { eyebrow?: string; title: string; lead?: string; align?: "left" | "center"; as?: "h1" | "h2"; id?: string }) {
  const center = align === "center" ? "mx-auto text-center items-center" : "";
  return (
    <div className={`flex max-w-[720px] flex-col gap-4 ${center}`}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <Tag id={id} className={`font-display font-semibold text-ink ${Tag === "h1" ? "text-[clamp(2.25rem,5vw,4rem)] leading-[1.04]" : "text-[clamp(1.85rem,3.6vw,2.9rem)] leading-[1.08]"}`}>
        {title}
      </Tag>
      {lead && <p className="max-w-[60ch] text-[17px] leading-relaxed text-slate">{lead}</p>}
    </div>
  );
}

export function IllustrativeTag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-[0.08em] text-slate ring-1 ring-line backdrop-blur">
      <span className="h-1.5 w-1.5 rounded-full bg-steel" aria-hidden="true" />
      {children}
    </span>
  );
}

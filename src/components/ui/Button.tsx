import type { ComponentProps, ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/icons/Icon";

type Variant = "primary" | "secondary" | "ghost" | "dark";
type Size = "sm" | "md" | "lg";

const base =
  "group inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-[background-color,color,box-shadow,transform] duration-200 ease-out active:translate-y-px disabled:opacity-60 disabled:pointer-events-none whitespace-nowrap";
const variants: Record<Variant, string> = {
  primary: "bg-signal text-white shadow-[0_8px_20px_-8px_rgb(215_38_30/0.7)] hover:bg-signal-deep",
  secondary: "bg-white text-ink ring-1 ring-inset ring-line-strong hover:ring-ink/40 hover:bg-mist",
  ghost: "text-ink hover:bg-mist",
  dark: "bg-ink text-white hover:bg-graphite",
};
const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-[13.5px]",
  md: "h-11 px-5 text-[14.5px]",
  lg: "h-13 px-7 text-[15.5px]",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md", extra = "") {
  return `${base} ${variants[variant]} ${sizes[size]} ${extra}`;
}

type Common = { variant?: Variant; size?: Size; arrow?: boolean; children: ReactNode; className?: string };

/** Internal, locale-aware link styled as a button. */
export function ButtonLink({ href, variant, size, arrow, children, className = "", ...rest }: Common & Omit<ComponentProps<typeof Link>, "className" | "children">) {
  return (
    <Link href={href} className={buttonClass(variant, size, className)} {...rest}>
      {children}
      {arrow && <Icon name="arrowRight" size={16} className="transition-transform duration-200 group-hover:translate-x-0.5" />}
    </Link>
  );
}

/** External link (e.g. portal sign-in) styled as a button. */
export function ExternalButton({ href, variant, size, children, className = "", newTabLabel }: Common & { href: string; newTabLabel: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={buttonClass(variant, size, className)}>
      {children}
      <Icon name="arrowUpRight" size={15} className="opacity-70" />
      <span className="sr-only"> {newTabLabel}</span>
    </a>
  );
}

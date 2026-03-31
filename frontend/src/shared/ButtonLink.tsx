import { Link } from "react-router-dom";
import type { PropsWithChildren } from "react";

type ButtonLinkProps = PropsWithChildren<{
  to: string;
  tone?: "primary" | "secondary" | "ghost";
  className?: string;
}>;

const toneClassMap = {
  primary:
    "bg-[var(--color-brand-gold-soft)] text-[var(--color-brand-navy)] shadow-[0_18px_44px_rgba(20,42,90,0.12)] hover:brightness-95",
  secondary:
    "bg-[var(--color-brand-navy)] text-white hover:bg-[var(--color-brand-navy-strong)]",
  ghost:
    "bg-white/70 text-[var(--color-brand-navy)] ring-1 ring-[var(--color-line)] hover:bg-white",
};

export function ButtonLink({
  to,
  tone = "primary",
  className = "",
  children,
}: ButtonLinkProps) {
  return (
    <Link
      to={to}
      className={`inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-bold transition ${toneClassMap[tone]} ${className}`}
    >
      {children}
    </Link>
  );
}

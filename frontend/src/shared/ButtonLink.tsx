import { Link } from "react-router-dom";
import type { PropsWithChildren } from "react";

type ButtonLinkProps = PropsWithChildren<{
  to: string;
  tone?: "primary" | "secondary" | "ghost";
  className?: string;
}>;

const toneClassMap = {
  primary:
    "bg-[var(--color-brand-navy)] text-white shadow-[0_18px_44px_rgba(20,42,90,0.18)] hover:bg-[var(--color-brand-navy-strong)]",
  secondary:
    "bg-[var(--color-brand-cream)] text-[var(--color-brand-navy)] ring-1 ring-[var(--color-line-strong)] hover:bg-white",
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

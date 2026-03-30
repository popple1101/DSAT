import type { PropsWithChildren, ReactNode } from "react";

type PageShellProps = PropsWithChildren<{
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
}>;

export function PageShell({ eyebrow, title, description, actions, children }: PageShellProps) {
  return (
    <section className="space-y-5">
      <div className="rounded-[28px] border border-slate-200/80 bg-white/90 px-6 py-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">{eyebrow}</p>
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-black tracking-tight text-slate-950">{title}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600 md:text-base">{description}</p>
          </div>
          {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
        </div>
      </div>
      {children}
    </section>
  );
}

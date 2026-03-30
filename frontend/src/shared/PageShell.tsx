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
      <div
        className="rounded-[34px] border px-6 py-7 shadow-[var(--shadow-soft)] backdrop-blur"
        style={{
          borderColor: "var(--color-line)",
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(247,249,253,0.92) 58%, rgba(251,247,239,0.82))",
        }}
      >
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-brand-blue)]">
          {eyebrow}
        </p>
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-black tracking-tight text-[var(--color-ink)] md:text-4xl">
              {title}
            </h2>
            <p className="mt-3 text-sm leading-7 text-[var(--color-text-soft)] md:text-base">
              {description}
            </p>
          </div>
          {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
        </div>
      </div>
      {children}
    </section>
  );
}

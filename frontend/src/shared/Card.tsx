import type { PropsWithChildren, ReactNode } from "react";

type CardProps = PropsWithChildren<{
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}>;

export function Card({ title, description, action, className = "", children }: CardProps) {
  return (
    <section
      className={`rounded-[30px] border p-6 shadow-[var(--shadow-soft)] backdrop-blur ${className}`}
      style={{
        borderColor: "var(--color-line)",
        background: "linear-gradient(180deg, var(--color-surface-strong), var(--color-surface))",
      }}
    >
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h3 className="text-lg font-extrabold text-[var(--color-ink)]">{title}</h3>
          {description ? (
            <p className="mt-2 text-sm leading-6 text-[var(--color-text-soft)]">{description}</p>
          ) : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

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
      className={`rounded-[24px] border border-slate-200/80 bg-white/92 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.07)] ${className}`}
    >
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h3 className="text-lg font-extrabold text-slate-950">{title}</h3>
          {description ? <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

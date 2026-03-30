type BrandMarkProps = {
  compact?: boolean;
};

export function BrandMark({ compact = false }: BrandMarkProps) {
  return (
    <div className={`flex items-center ${compact ? "gap-3" : "gap-4"}`}>
      <img
        src="/branding/dsat-logo-rm-bg.png"
        alt="LML DSAT"
        className={compact ? "h-12 w-12 object-contain" : "h-16 w-16 object-contain"}
      />
      <div className="min-w-0">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.34em] text-[var(--color-brand-gold)]">
          LML
        </p>
        <h1
          className={`font-black tracking-[0.02em] text-[var(--color-brand-navy)] ${
            compact ? "text-lg" : "text-2xl"
          }`}
        >
          DSAT
        </h1>
        <p className="text-xs text-[var(--color-text-soft)]">Digital SAT Learning Platform</p>
      </div>
    </div>
  );
}

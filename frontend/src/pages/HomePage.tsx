import { Link } from "react-router-dom";

const entryCards = [
  {
    title: "학생",
    to: "/login?role=student",
  },
  {
    title: "관리자",
    to: "/login?role=admin",
  },
];

export function HomePage() {
  return (
    <section className="mx-auto grid min-h-[calc(100vh-140px)] max-w-[1200px] gap-5 xl:grid-cols-[1.02fr_0.98fr]">
      <div
        className="rounded-[34px] border px-6 py-7 shadow-[var(--shadow-soft)]"
        style={{
          borderColor: "var(--color-line)",
          background:
            "linear-gradient(135deg, rgba(16,38,79,0.98), rgba(23,53,111,0.92) 55%, rgba(183,122,60,0.9) 120%)",
        }}
      >
        <div className="flex h-full flex-col justify-end">
          <div className="space-y-3 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-white/66">LML Portal</p>
            <h1 className="text-5xl font-black tracking-tight md:text-6xl">LML</h1>
            <p className="text-xl font-semibold text-white/84">SAT 운영 포털</p>
          </div>
        </div>
      </div>

      <div
        className="rounded-[34px] border px-6 py-8 shadow-[var(--shadow-soft)]"
        style={{
          borderColor: "var(--color-line)",
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.98), rgba(247,249,253,0.94) 58%, rgba(251,247,239,0.84))",
        }}
      >
        <div className="flex h-full flex-col justify-center gap-8">
          <h2 className="text-3xl font-black leading-tight tracking-tight text-[var(--color-ink)] md:text-5xl">
            사용자 유형을 선택하세요
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            {entryCards.map((card) => (
              <Link
                key={card.title}
                to={card.to}
                className="rounded-[28px] border bg-white px-6 py-10 text-center text-2xl font-bold text-[var(--color-brand-navy)] transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)]"
                style={{ borderColor: "var(--color-line)" }}
              >
                {card.title}
              </Link>
            ))}
          </div>

          <div className="flex flex-wrap gap-4 text-sm font-semibold">
            <Link to="/signup" className="text-[var(--color-brand-navy)]">
              학생 회원가입
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

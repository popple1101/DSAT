import { ButtonLink } from "../shared/ButtonLink";
import { BrandMark } from "../shared/BrandMark";
import { Card } from "../shared/Card";

const platformCards = [
  {
    title: "Level Test",
    description:
      "학생의 현재 실력을 진단하고 Module 1 결과에 따라 다음 모듈을 분기하는 DSAT 레벨테스트 흐름을 제공합니다.",
  },
  {
    title: "Mock Test",
    description:
      "실전과 유사한 시험 세트 운영, 응시 이력 관리, 결과 확인까지 이어지는 Digital SAT 모의고사 환경을 준비합니다.",
  },
  {
    title: "Result & Tracking",
    description:
      "총점, 섹션 점수, 모듈별 소요 시간, 문항별 정오표를 기반으로 학생별 학습 상태를 빠르게 확인할 수 있습니다.",
  },
];

const principles = [
  {
    title: "브랜드는 LML, 시스템은 DSAT",
    body:
      "학원 사이트의 신뢰감과 프리미엄 톤은 유지하면서도, 실제 사용 화면은 더 정돈된 제품형 UI로 분리했습니다.",
  },
  {
    title: "학생은 태블릿 경험 우선",
    body:
      "시험 응시와 결과 확인은 태블릿 사용성을 기준으로 크게 보고, 선택과 이동이 편한 구조로 설계했습니다.",
  },
  {
    title: "관리자는 운영 효율 우선",
    body:
      "문제 등록, 시험 생성, 학생 배정처럼 반복되는 업무를 한 흐름 안에서 빠르게 처리할 수 있도록 구성했습니다.",
  },
];

const portalFacts = [
  ["브랜드", "LML Learning Management Lab"],
  ["시스템", "DSAT Digital SAT LMS"],
  ["사용 환경", "PC 관리자 / 태블릿 학생"],
];

export function HomePage() {
  return (
    <div className="space-y-6">
      <section
        className="overflow-hidden rounded-[40px] border shadow-[var(--shadow-soft)]"
        style={{
          borderColor: "var(--color-line)",
          background:
            "linear-gradient(135deg, rgba(16,38,79,0.96), rgba(23,53,111,0.92) 42%, rgba(183,122,60,0.9) 120%)",
        }}
      >
        <div className="grid gap-8 px-6 py-8 md:px-8 md:py-10 lg:grid-cols-[1.15fr_0.85fr] lg:px-10 lg:py-12">
          <div className="space-y-6 text-white">
            <BrandMark />
            <div className="space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.34em] text-white/70">
                LML Digital SAT Platform
              </p>
              <h2 className="max-w-3xl text-4xl font-black leading-tight tracking-tight md:text-5xl">
                신뢰감 있는 SAT 운영 경험을 위한
                <span className="block text-[var(--color-brand-gold-soft)]">LML DSAT Portal</span>
              </h2>
              <p className="max-w-2xl text-sm leading-7 text-white/78 md:text-base">
                LML의 브랜드 철학은 유지하고, 실제 시험 운영과 응시 경험은 더 정돈된 제품형 인터페이스로
                구성한 Digital SAT LMS입니다.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <ButtonLink to="/login?role=student" className="min-w-[148px]">
                학생 로그인
              </ButtonLink>
              <ButtonLink to="/login?role=admin" tone="secondary" className="min-w-[148px]">
                관리자 로그인
              </ButtonLink>
              <ButtonLink to="/signup" tone="ghost" className="min-w-[148px]">
                학생 회원가입
              </ButtonLink>
            </div>

            <div className="grid gap-3 pt-2 md:grid-cols-3">
              {portalFacts.map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-[24px] border px-4 py-4"
                  style={{ borderColor: "rgba(255,255,255,0.14)", background: "rgba(255,255,255,0.08)" }}
                >
                  <p className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-white/56">{label}</p>
                  <p className="mt-2 text-sm font-semibold leading-6 text-white/92">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 self-stretch">
            <div
              className="rounded-[32px] border p-5 text-white"
              style={{
                borderColor: "rgba(255,255,255,0.14)",
                background: "linear-gradient(180deg, rgba(255,255,255,0.1), rgba(255,255,255,0.04))",
              }}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/60">Focus</p>
              <h3 className="mt-3 text-2xl font-black">본질에 집중한 학습 운영</h3>
              <p className="mt-3 text-sm leading-7 text-white/76">
                레벨테스트, 모의고사, 자동 채점, 결과 확인까지 한 흐름으로 연결해 학생별 진행 상황을
                명확하게 볼 수 있도록 설계했습니다.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {platformCards.slice(0, 2).map((card) => (
                <MiniFeatureCard key={card.title} {...card} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.08fr_0.92fr]">
        <Card
          title="DSAT 플랫폼이 제공하는 핵심 흐름"
          description="1차 MVP 기준으로 실제 사용 흐름을 명확하게 설명하는 진입 섹션입니다."
        >
          <div className="grid gap-4 md:grid-cols-3">
            {platformCards.map((card, index) => (
              <div
                key={card.title}
                className="rounded-[24px] border px-5 py-5"
                style={{
                  borderColor: "var(--color-line)",
                  background: index === 1 ? "rgba(23,53,111,0.04)" : "rgba(255,255,255,0.66)",
                }}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[var(--color-brand-blue)]">
                  0{index + 1}
                </p>
                <h3 className="mt-3 text-xl font-black text-[var(--color-ink)]">{card.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[var(--color-text-soft)]">{card.description}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card
          title="이 포털의 사용자 경험 방향"
          description="학원 사이트 감성은 유지하면서도 실제 제품처럼 사용하기 쉬운 구조를 지향합니다."
        >
          <div className="space-y-4">
            {principles.map((item) => (
              <div
                key={item.title}
                className="rounded-[24px] border px-5 py-5"
                style={{
                  borderColor: "var(--color-line)",
                  background: "rgba(255,255,255,0.72)",
                }}
              >
                <h3 className="text-lg font-extrabold text-[var(--color-brand-navy)]">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[var(--color-text-soft)]">{item.body}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section
        className="rounded-[34px] border px-6 py-7 shadow-[var(--shadow-soft)]"
        style={{
          borderColor: "var(--color-line)",
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(247,249,253,0.9) 54%, rgba(251,247,239,0.88))",
        }}
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-brand-blue)]">
              Entry
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-[var(--color-ink)] md:text-4xl">
              학생과 운영자가 같은 브랜드 경험 안에서
              <span className="block text-[var(--color-brand-navy)]">각자 다른 화면으로 진입합니다</span>
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <ButtonLink to="/login?role=student">학생 로그인</ButtonLink>
            <ButtonLink to="/login?role=admin" tone="ghost">
              관리자 로그인
            </ButtonLink>
            <ButtonLink to="/signup" tone="secondary">
              학생 회원가입
            </ButtonLink>
          </div>
        </div>
      </section>
    </div>
  );
}

function MiniFeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div
      className="rounded-[28px] border px-5 py-5 text-white"
      style={{
        borderColor: "rgba(255,255,255,0.14)",
        background: "linear-gradient(180deg, rgba(255,255,255,0.12), rgba(255,255,255,0.05))",
      }}
    >
      <h3 className="text-xl font-black">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-white/74">{description}</p>
    </div>
  );
}

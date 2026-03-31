import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { storage } from "../lib/storage";
import { studentApi } from "../features/student/api";

export function ResultPage() {
  const { assignmentId } = useParams();
  const token = storage.getStudentToken();
  const parsedAssignmentId = useMemo(() => Number(assignmentId ?? 0), [assignmentId]);

  const resultQuery = useQuery({
    queryKey: ["student", "result", parsedAssignmentId],
    queryFn: () => studentApi.getResult(token, parsedAssignmentId),
    enabled: Boolean(token && parsedAssignmentId),
  });

  if (!resultQuery.data) {
    return (
      <section
        className="rounded-[30px] border p-6 shadow-[var(--shadow-soft)]"
        style={{
          borderColor: "var(--color-line)",
          background: "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(247,249,253,0.92))",
        }}
      >
        <div className="grid gap-4">
          <h1 className="text-3xl font-black text-[var(--color-ink)]">결과</h1>
          <div
            className="rounded-[20px] border border-dashed px-4 py-6 text-sm text-[var(--color-text-soft)]"
            style={{ borderColor: "var(--color-line-strong)" }}
          >
            {resultQuery.isLoading ? "불러오는 중..." : "결과가 없습니다."}
          </div>
          <div className="flex flex-wrap gap-3">
            <Link className={primaryButtonClass} to="/student">
              학생 포털
            </Link>
            <Link className={ghostButtonClass} to="/login?role=student">
              학생 로그인
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const result = resultQuery.data;

  return (
    <div className="space-y-5">
      <section
        className="rounded-[30px] border p-6 shadow-[var(--shadow-soft)]"
        style={{
          borderColor: "var(--color-line)",
          background: "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(247,249,253,0.92))",
        }}
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-brand-blue)]">
              Result
            </p>
            <h1 className="mt-2 text-3xl font-black text-[var(--color-ink)]">결과</h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link className={ghostButtonClass} to="/student">
              학생 포털
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <ResultCard label="총점" value={String(result.totalScore)} strong />
        <ResultCard label="섹션" value={String(result.sectionScore)} />
        <ResultCard label="Module 1" value={`${result.module1CorrectCount}개`} />
        <ResultCard label="Module 2" value={`${result.module2CorrectCount}개`} />
      </section>

      <section className="grid gap-5 xl:grid-cols-[0.72fr_1.28fr]">
        <Panel title="시험">
          <div className="grid gap-3">
            <MetaRow label="시험명" value={result.examTitle} />
            <MetaRow label="버전" value={result.versionName} />
            <MetaRow label="트랙" value={result.routeType} />
            <MetaRow label="Module 1 시간" value={formatSeconds(result.module1DurationSeconds)} />
            <MetaRow label="Module 2 시간" value={formatSeconds(result.module2DurationSeconds)} />
          </div>
        </Panel>

        <Panel title="문항">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-line)] text-left text-[var(--color-text-soft)]">
                  {["모듈", "트랙", "No.", "제목", "정답", "학생 답", "채점"].map((header) => (
                    <th key={header} className="px-4 py-3 font-semibold">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.questionResults.map((row) => (
                  <tr key={`${row.moduleType}-${row.questionId}`} className="border-b border-[var(--color-line)]">
                    <td className="px-4 py-3">{row.moduleType}</td>
                    <td className="px-4 py-3">{row.routeType}</td>
                    <td className="px-4 py-3">{row.questionOrder}</td>
                    <td className="px-4 py-3 font-semibold text-[var(--color-ink)]">{row.title}</td>
                    <td className="px-4 py-3">{row.correctAnswer ?? "-"}</td>
                    <td className="px-4 py-3">{row.selectedAnswer ?? "-"}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          row.correct ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-700"
                        }`}
                      >
                        {row.correct ? "정답" : "오답"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </section>
    </div>
  );
}

function formatSeconds(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remain = seconds % 60;
  return `${minutes}분 ${remain}초`;
}

function ResultCard({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div
      className="rounded-[24px] border px-5 py-5"
      style={{
        borderColor: strong ? "transparent" : "var(--color-line)",
        background: strong
          ? "linear-gradient(135deg, rgba(16,38,79,0.98), rgba(23,53,111,0.92) 60%, rgba(45,91,223,0.88))"
          : "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(247,249,253,0.9))",
        color: strong ? "white" : "var(--color-text)",
      }}
    >
      <p
        className={`text-xs font-semibold uppercase tracking-[0.24em] ${
          strong ? "text-white/60" : "text-[var(--color-brand-blue)]"
        }`}
      >
        {label}
      </p>
      <p className="mt-3 text-3xl font-black">{value}</p>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section
      className="rounded-[28px] border p-5 shadow-[var(--shadow-soft)]"
      style={{
        borderColor: "var(--color-line)",
        background: "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(247,249,253,0.92))",
      }}
    >
      <h2 className="mb-4 text-xl font-black text-[var(--color-ink)]">{title}</h2>
      {children}
    </section>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] border bg-white px-4 py-3" style={{ borderColor: "var(--color-line)" }}>
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-brand-blue)]">{label}</p>
      <p className="mt-2 text-base font-bold text-[var(--color-ink)]">{value}</p>
    </div>
  );
}

const primaryButtonClass =
  "rounded-[18px] bg-[var(--color-brand-navy)] px-4 py-3 text-sm font-bold text-white transition hover:bg-[var(--color-brand-navy-strong)]";

const ghostButtonClass =
  "rounded-[18px] bg-white px-4 py-3 text-sm font-bold text-[var(--color-brand-navy)] ring-1 ring-[var(--color-line)] transition hover:bg-[var(--color-brand-cream)]";

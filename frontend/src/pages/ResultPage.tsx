import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { Card } from "../shared/Card";
import { PageShell } from "../shared/PageShell";
import { storage } from "../lib/storage";
import { studentApi } from "../features/student/api";
import { ButtonLink } from "../shared/ButtonLink";

export function ResultPage() {
  const { assignmentId } = useParams();
  const token = storage.getStudentToken();
  const parsedAssignmentId = useMemo(() => Number(assignmentId ?? 0), [assignmentId]);

  const resultQuery = useQuery({
    queryKey: ["student", "result", parsedAssignmentId],
    queryFn: () => studentApi.getResult(token, parsedAssignmentId),
    enabled: Boolean(token && parsedAssignmentId),
  });

  return (
    <div className="space-y-5">
      <PageShell
        eyebrow="Result Report"
        title="학생 결과 리포트"
        description="총점, 섹션 점수, 모듈별 소요 시간, 문항별 정오표를 상담과 확인 중심의 결과 화면으로 정리한 페이지입니다."
        actions={
          <div className="flex flex-wrap gap-2">
            <ButtonLink to="/student" tone="ghost">
              학생 포털로 돌아가기
            </ButtonLink>
          </div>
        }
      >
        {resultQuery.data ? (
          <div className="grid gap-4 md:grid-cols-4">
            <ResultKpi
              label="Total Score"
              value={String(resultQuery.data.totalScore)}
              description="이번 응시의 총점입니다."
              emphasis
            />
            <ResultKpi
              label="Section Score"
              value={String(resultQuery.data.sectionScore)}
              description="Reading & Writing 섹션 점수"
            />
            <ResultKpi
              label="Module 1"
              value={formatSeconds(resultQuery.data.module1DurationSeconds)}
              description={`정답 ${resultQuery.data.module1CorrectCount}개`}
            />
            <ResultKpi
              label="Module 2"
              value={formatSeconds(resultQuery.data.module2DurationSeconds)}
              description={`정답 ${resultQuery.data.module2CorrectCount}개`}
            />
          </div>
        ) : null}
      </PageShell>

      {resultQuery.data ? (
        <>
          <section className="grid gap-5 xl:grid-cols-[0.74fr_1.26fr]">
            <Card
              title="시험 결과 요약"
              description="시험명, 버전, 트랙, 모듈별 정답 수를 요약해 보여주는 결과 카드입니다."
            >
              <div className="grid gap-4">
                <SummaryPanel
                  label="시험"
                  value={`${resultQuery.data.examTitle} (${resultQuery.data.versionName})`}
                />
                <SummaryPanel label="트랙" value={resultQuery.data.routeType} />
                <SummaryPanel
                  label="정답 수"
                  value={`Module 1 ${resultQuery.data.module1CorrectCount} / Module 2 ${resultQuery.data.module2CorrectCount}`}
                />
              </div>
            </Card>

            <Card
              title="결과 해석 포인트"
              description="1차 MVP 기준에서는 고급 분석 대신 결과를 빠르게 이해할 수 있는 핵심 지표만 정리합니다."
            >
              <div className="grid gap-4 md:grid-cols-3">
                <InsightCard
                  title="총점 중심"
                  body="학생과 학부모가 가장 먼저 확인하는 핵심 값은 총점과 섹션 점수입니다."
                />
                <InsightCard
                  title="시간 기록"
                  body="Module 1과 Module 2 소요 시간을 함께 보여줘 시험 운영과 집중도를 확인할 수 있습니다."
                />
                <InsightCard
                  title="문항별 정오"
                  body="각 문항의 정답과 학생 답안을 같이 제공해 결과 확인 후 상담 연결이 쉬워집니다."
                />
              </div>
            </Card>
          </section>

          <Card
            title="문항별 결과표"
            description="1차 MVP 범위에 맞춰 모듈, 트랙, 문항 번호, 정답, 학생답, 정오 여부만 명확하게 보여줍니다."
          >
            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-y-2 text-sm">
                <thead>
                  <tr className="text-left text-[var(--color-text-soft)]">
                    <th className="px-4 py-3">모듈</th>
                    <th className="px-4 py-3">트랙</th>
                    <th className="px-4 py-3">No.</th>
                    <th className="px-4 py-3">문제 제목</th>
                    <th className="px-4 py-3">정답</th>
                    <th className="px-4 py-3">학생답</th>
                    <th className="px-4 py-3">채점</th>
                  </tr>
                </thead>
                <tbody>
                  {resultQuery.data.questionResults.map((row) => (
                    <tr
                      key={`${row.moduleType}-${row.questionId}`}
                      className="overflow-hidden rounded-[22px]"
                      style={{
                        background: row.correct
                          ? "linear-gradient(180deg, rgba(236,253,245,0.95), rgba(220,252,231,0.86))"
                          : "linear-gradient(180deg, rgba(255,241,242,0.95), rgba(255,228,230,0.86))",
                      }}
                    >
                      <td className="rounded-l-[20px] px-4 py-4 font-semibold text-[var(--color-text)]">
                        {row.moduleType}
                      </td>
                      <td className="px-4 py-4 text-[var(--color-text-soft)]">{row.routeType}</td>
                      <td className="px-4 py-4 text-[var(--color-text-soft)]">{row.questionOrder}</td>
                      <td className="px-4 py-4 font-semibold text-[var(--color-ink)]">{row.title}</td>
                      <td className="px-4 py-4 font-semibold text-[var(--color-text)]">{row.correctAnswer ?? "-"}</td>
                      <td className="px-4 py-4 font-semibold text-[var(--color-text)]">{row.selectedAnswer ?? "-"}</td>
                      <td className="rounded-r-[20px] px-4 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
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
          </Card>
        </>
      ) : (
        <div className="grid gap-5">
          <Card title="현재 상태" description="assignmentId와 학생 세션을 기준으로 결과를 불러옵니다.">
            <div
              className="rounded-[24px] border border-dashed px-4 py-5 text-sm leading-7 text-[var(--color-text-soft)]"
              style={{ borderColor: "var(--color-line-strong)", background: "rgba(255,255,255,0.74)" }}
            >
              현재 assignmentId: <strong>{assignmentId ?? "없음"}</strong>
            </div>
          </Card>
          <Card title="결과 조회 상태" description="결과가 없거나 세션이 만료된 경우에 표시됩니다.">
            <div
              className="rounded-[24px] border border-dashed px-4 py-5 text-sm leading-7 text-[var(--color-text-soft)]"
              style={{ borderColor: "var(--color-line-strong)", background: "rgba(255,255,255,0.74)" }}
            >
              {resultQuery.isLoading
                ? "결과를 불러오는 중입니다."
                : "결과를 조회하지 못했습니다. 학생 로그인 상태를 다시 확인해주세요."}
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <ButtonLink to="/student">학생 포털</ButtonLink>
              <Link to="/login?role=student" className="text-sm font-semibold text-[var(--color-brand-navy)]">
                다시 로그인하기
              </Link>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

function formatSeconds(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remain = seconds % 60;
  return `${minutes}분 ${remain}초`;
}

function ResultKpi({
  label,
  value,
  description,
  emphasis = false,
}: {
  label: string;
  value: string;
  description: string;
  emphasis?: boolean;
}) {
  return (
    <div
      className="rounded-[28px] border px-5 py-5 shadow-[var(--shadow-soft)]"
      style={{
        borderColor: emphasis ? "transparent" : "var(--color-line)",
        background: emphasis
          ? "linear-gradient(135deg, rgba(16,38,79,0.98), rgba(23,53,111,0.92) 60%, rgba(45,91,223,0.88))"
          : "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(247,249,253,0.88))",
        color: emphasis ? "white" : "var(--color-text)",
      }}
    >
      <p className={`text-xs font-semibold uppercase tracking-[0.28em] ${emphasis ? "text-white/60" : "text-[var(--color-brand-blue)]"}`}>
        {label}
      </p>
      <h3 className="mt-3 text-4xl font-black tracking-tight">{value}</h3>
      <p className={`mt-3 text-sm leading-7 ${emphasis ? "text-white/72" : "text-[var(--color-text-soft)]"}`}>
        {description}
      </p>
    </div>
  );
}

function SummaryPanel({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="rounded-[24px] border px-5 py-5"
      style={{ borderColor: "var(--color-line)", background: "rgba(255,255,255,0.76)" }}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-brand-blue)]">{label}</p>
      <p className="mt-3 text-lg font-extrabold leading-8 text-[var(--color-ink)]">{value}</p>
    </div>
  );
}

function InsightCard({ title, body }: { title: string; body: string }) {
  return (
    <div
      className="rounded-[24px] border px-5 py-5"
      style={{ borderColor: "var(--color-line)", background: "rgba(255,255,255,0.74)" }}
    >
      <h3 className="text-lg font-extrabold text-[var(--color-brand-navy)]">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-[var(--color-text-soft)]">{body}</p>
    </div>
  );
}

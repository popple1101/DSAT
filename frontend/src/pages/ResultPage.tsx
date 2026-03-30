import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { Card } from "../shared/Card";
import { PageShell } from "../shared/PageShell";
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

  return (
    <PageShell
      eyebrow="Result"
      title="결과표 화면"
      description="총점, 섹션 점수, 모듈 시간, 문항별 정답/학생답/정오 데이터를 React 결과 페이지로 그대로 이관했습니다."
    >
      {resultQuery.data ? (
        <div className="grid gap-5">
          <section className="rounded-[30px] border border-slate-200/80 bg-[linear-gradient(135deg,#11183d_0%,#172554_100%)] px-7 py-7 text-white shadow-[0_18px_50px_rgba(15,23,42,0.1)]">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-200">Your Total Score</p>
                <h3 className="mt-3 text-6xl font-black tracking-tight">{resultQuery.data.totalScore}</h3>
              </div>
              <div className="text-left md:text-right">
                <p className="text-sm text-slate-200">
                  {resultQuery.data.examTitle} ({resultQuery.data.versionName})
                </p>
                <p className="mt-2 text-2xl font-bold">Section Score {resultQuery.data.sectionScore}</p>
                <span className="mt-3 inline-flex rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-slate-100">
                  {resultQuery.data.routeType}
                </span>
              </div>
            </div>
          </section>

          <div className="grid gap-5 md:grid-cols-2">
            <Card title="Module 1" description="기록된 소요시간과 정답 수">
              <p className="text-3xl font-black text-slate-950">{formatSeconds(resultQuery.data.module1DurationSeconds)}</p>
              <p className="mt-3 text-sm text-slate-600">정답 수 {resultQuery.data.module1CorrectCount}</p>
            </Card>
            <Card title="Module 2" description="기록된 소요시간과 정답 수">
              <p className="text-3xl font-black text-slate-950">{formatSeconds(resultQuery.data.module2DurationSeconds)}</p>
              <p className="mt-3 text-sm text-slate-600">정답 수 {resultQuery.data.module2CorrectCount}</p>
            </Card>
          </div>

          <Card title="문항별 결과" description="1차 MVP 기준으로 문항별 정답/학생답/정오만 보여줍니다.">
            <div className="overflow-x-auto">
              <table className="min-w-full overflow-hidden rounded-2xl text-sm">
                <thead>
                  <tr className="bg-slate-100 text-left text-slate-700">
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
                    <tr key={`${row.moduleType}-${row.questionId}`} className={row.correct ? "bg-emerald-50" : "bg-rose-50"}>
                      <td className="px-4 py-3">{row.moduleType}</td>
                      <td className="px-4 py-3">{row.routeType}</td>
                      <td className="px-4 py-3">{row.questionOrder}</td>
                      <td className="px-4 py-3 font-semibold text-slate-900">{row.title}</td>
                      <td className="px-4 py-3">{row.correctAnswer ?? "-"}</td>
                      <td className="px-4 py-3">{row.selectedAnswer ?? "-"}</td>
                      <td className="px-4 py-3 font-semibold">{row.correct ? "정답" : "오답"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      ) : (
        <div className="grid gap-5">
          <Card title="현재 상태" description="assignmentId와 학생 세션이 있어야 결과를 불러옵니다.">
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm leading-7 text-slate-600">
              현재 assignmentId: <strong>{assignmentId ?? "없음"}</strong>
            </div>
          </Card>
          <Card title="결과 조회 상태" description="아직 결과가 없거나 로그인 세션이 없는 경우입니다.">
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm leading-7 text-slate-600">
              {resultQuery.isLoading ? "결과를 불러오는 중입니다." : "결과를 조회하지 못했습니다. 학생 로그인 후 다시 시도하세요."}
            </div>
          </Card>
        </div>
      )}
    </PageShell>
  );
}

function formatSeconds(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remain = seconds % 60;
  return `${minutes}분 ${remain}초`;
}

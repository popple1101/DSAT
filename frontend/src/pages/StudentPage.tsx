import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Card } from "../shared/Card";
import { PageShell } from "../shared/PageShell";
import { storage } from "../lib/storage";
import { studentApi } from "../features/student/api";
import type { AuthResponse } from "../features/auth/types";
import type { StudentExamDetail } from "../features/student/types";

export function StudentPage() {
  const navigate = useNavigate();
  const [token, setToken] = useState(storage.getStudentToken());
  const [studentInfo, setStudentInfo] = useState<AuthResponse | null>(storage.getStudentUser<AuthResponse>());
  const [loginForm, setLoginForm] = useState({ loginId: "student01", password: "1234" });
  const [currentAssignmentId, setCurrentAssignmentId] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  const assignmentsQuery = useQuery({
    queryKey: ["student", "assignments", studentInfo?.id],
    queryFn: () => studentApi.getAssignments(token, studentInfo!.id),
    enabled: Boolean(token && studentInfo?.id),
  });

  const detailQuery = useQuery({
    queryKey: ["student", "detail", currentAssignmentId],
    queryFn: () => studentApi.getAssignmentDetail(token, currentAssignmentId!),
    enabled: Boolean(token && currentAssignmentId),
  });

  const loginMutation = useMutation({
    mutationFn: studentApi.login,
    onSuccess: (data) => {
      storage.setStudentToken(data.accessToken);
      storage.setStudentUser(data);
      setToken(data.accessToken);
      setStudentInfo(data);
      setMessage(`학생 로그인 완료: ${data.name}`);
    },
    onError: (error) => setMessage(error.message),
  });

  const startModule1Mutation = useMutation({
    mutationFn: () => studentApi.startModule1(token, currentAssignmentId!),
    onSuccess: (data) => {
      detailQuery.refetch().catch(() => undefined);
      setMessage("Module 1을 시작했습니다.");
      setCurrentDetail(data);
    },
    onError: (error) => setMessage(error.message),
  });

  const startModule2Mutation = useMutation({
    mutationFn: () => studentApi.startModule2(token, currentAssignmentId!),
    onSuccess: (data) => {
      detailQuery.refetch().catch(() => undefined);
      setMessage("Module 2를 시작했습니다.");
      setCurrentDetail(data);
    },
    onError: (error) => setMessage(error.message),
  });

  const submitModuleMutation = useMutation({
    mutationFn: async () => {
      const detail = detailState;
      if (!detail || !currentAssignmentId) {
        throw new Error("제출할 시험이 없습니다.");
      }

      if (detail.currentModuleType === "MODULE_1") {
        const result = await studentApi.submitModule1(token, currentAssignmentId, estimateDuration("MODULE_1"));
        return { type: "module1" as const, result };
      }

      const result = await studentApi.submitFinal(token, currentAssignmentId, estimateDuration("MODULE_2"));
      return { type: "final" as const, result };
    },
    onSuccess: async ({ type, result }) => {
      if (type === "module1") {
        setMessage(`Module 1 제출 완료. 분기: ${result.routeType}`);
        await detailQuery.refetch();
        return;
      }

      setMessage("최종 제출 완료. 결과표로 이동합니다.");
      await assignmentsQuery.refetch();
      navigate(`/result/${currentAssignmentId}`);
    },
    onError: (error) => setMessage(error.message),
  });

  const answerMutation = useMutation({
    mutationFn: ({
      questionId,
      selectedAnswer,
    }: {
      questionId: number;
      selectedAnswer: "A" | "B" | "C" | "D";
    }) => {
      if (!detailState || !currentAssignmentId) {
        throw new Error("문제를 먼저 선택해야 합니다.");
      }

      return studentApi.saveAnswer(token, currentAssignmentId, {
        questionId,
        selectedAnswer,
        moduleType: detailState.currentModuleType,
        routeType: detailState.currentRouteType,
      });
    },
    onSuccess: (data) => {
      setCurrentDetail(data);
      setMessage("답안을 저장했습니다.");
    },
    onError: (error) => setMessage(error.message),
  });

  const [detailOverride, setDetailOverride] = useState<StudentExamDetail | null>(null);

  useEffect(() => {
    setDetailOverride(null);
  }, [currentAssignmentId]);

  const detailState = useMemo(
    () => detailOverride ?? detailQuery.data ?? null,
    [detailOverride, detailQuery.data]
  );

  return (
    <PageShell
      eyebrow="Student"
      title="학생 태블릿 응시 화면"
      description="학생은 태블릿에서도 큰 터치 영역으로 문제를 풀 수 있어야 하므로, 응시 목록과 현재 모듈 문제를 분리하고 선택지 버튼을 넉넉하게 유지합니다."
      actions={
        <span className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
          {studentInfo ? `${studentInfo.name} (${studentInfo.loginId})` : "로그인 전"}
        </span>
      }
    >
      {message ? (
        <div className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm font-medium text-slate-700 shadow-sm">
          {message}
        </div>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[0.78fr_1.22fr]">
        <Card title="학생 로그인" description="학생 계정으로 로그인하면 배정된 시험 목록을 불러옵니다.">
          <form
            className="grid gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              loginMutation.mutate(loginForm);
            }}
          >
            <Field label="로그인 아이디">
              <input className="rounded-2xl border border-slate-200 px-4 py-3" value={loginForm.loginId} onChange={(e) => setLoginForm((prev) => ({ ...prev, loginId: e.target.value }))} />
            </Field>
            <Field label="비밀번호">
              <input className="rounded-2xl border border-slate-200 px-4 py-3" type="password" value={loginForm.password} onChange={(e) => setLoginForm((prev) => ({ ...prev, password: e.target.value }))} />
            </Field>
            <button className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-bold text-white" type="submit">
              {loginMutation.isPending ? "로그인 중..." : "학생 로그인"}
            </button>
          </form>
        </Card>

        <Card title="배정된 시험 목록" description="시험을 선택하면 현재 모듈 상태와 문제 목록이 오른쪽 패널에 표시됩니다.">
          <div className="grid gap-3">
            {assignmentsQuery.data?.length ? (
              assignmentsQuery.data.map((assignment) => (
                <button
                  key={assignment.assignmentId}
                  type="button"
                  className={`rounded-2xl border px-4 py-4 text-left transition ${
                    currentAssignmentId === assignment.assignmentId
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-900 hover:bg-slate-50"
                  }`}
                  onClick={() => setCurrentAssignmentId(assignment.assignmentId)}
                >
                  <p className="font-bold">
                    {assignment.examTitle} ({assignment.versionName})
                  </p>
                  <p className={`mt-2 text-sm ${currentAssignmentId === assignment.assignmentId ? "text-slate-200" : "text-slate-600"}`}>
                    상태: {assignment.submissionStatus} / 분기: {assignment.routeType || "대기"}
                  </p>
                </button>
              ))
            ) : (
              <EmptyState message="배정된 시험이 없습니다." />
            )}
          </div>
        </Card>

        <Card title="현재 시험 상태" description="모듈 상태, 현재 분기, 기록된 소요시간을 요약합니다." className="xl:col-span-2">
          {detailState ? (
            <div className="grid gap-4 md:grid-cols-2">
              <SummaryBox
                title={`${detailState.examTitle} (${detailState.versionName})`}
                lines={[`상태: ${detailState.submissionStatus}`, `모듈: ${detailState.currentModuleType}`, `트랙: ${detailState.currentRouteType}`]}
              />
              <SummaryBox
                title="모듈 기록"
                lines={[
                  `Module 1 시간: ${detailState.module1DurationSeconds ?? 0}초`,
                  `Module 2 시간: ${detailState.module2DurationSeconds ?? 0}초`,
                ]}
              />
            </div>
          ) : (
            <EmptyState message="시험을 선택하면 현재 상태가 표시됩니다." />
          )}
        </Card>

        <Card
          title="문제 풀이"
          description="문제 본문과 선택지는 태블릿 터치 영역을 고려해 넉넉한 여백으로 유지합니다."
          className="xl:col-span-2"
          action={
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700"
                onClick={() => startModule1Mutation.mutate()}
                disabled={!currentAssignmentId}
              >
                Module 1 시작
              </button>
              <button
                type="button"
                className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700"
                onClick={() => startModule2Mutation.mutate()}
                disabled={!currentAssignmentId}
              >
                Module 2 시작
              </button>
              <button
                type="button"
                className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                onClick={() => submitModuleMutation.mutate()}
                disabled={!detailState}
              >
                현재 모듈 제출
              </button>
            </div>
          }
        >
          {detailState?.questions.length ? (
            <div className="grid gap-4">
              {detailState.questions.map((question) => (
                <article key={question.questionId} className="grid gap-4 rounded-[24px] border border-slate-200 bg-slate-50 px-5 py-5 shadow-sm md:grid-cols-[1.08fr_0.92fr]">
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                        {detailState.currentModuleType} / {detailState.currentRouteType}
                      </p>
                      <h4 className="mt-2 text-xl font-black tracking-tight text-slate-950">
                        {question.questionOrder}. {question.title}
                      </h4>
                    </div>
                    {question.passageText ? (
                      <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm leading-7 text-slate-700 whitespace-pre-wrap">
                        {question.passageText}
                      </div>
                    ) : null}
                    {question.assetImagePath ? (
                      <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-sm text-slate-500">
                        자료 이미지 경로: {question.assetImagePath}
                      </div>
                    ) : null}
                    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm font-semibold leading-7 text-slate-900">
                      {question.questionText}
                    </div>
                  </div>
                  <div className="grid gap-3 self-start">
                    {(
                      [
                        ["A", question.choiceA],
                        ["B", question.choiceB],
                        ["C", question.choiceC],
                        ["D", question.choiceD],
                      ] as const
                    ).map(([choice, text]) => {
                      const active = question.selectedAnswer === choice;
                      return (
                        <button
                          key={choice}
                          type="button"
                          className={`rounded-2xl border px-4 py-4 text-left text-base font-semibold transition ${
                            active
                              ? "border-emerald-400 bg-emerald-50 text-emerald-900"
                              : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
                          }`}
                          onClick={() =>
                            answerMutation.mutate({
                              questionId: question.questionId,
                              selectedAnswer: choice,
                            })
                          }
                        >
                          <span className="mr-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-sm font-black text-slate-700">
                            {choice}
                          </span>
                          {text}
                        </button>
                      );
                    })}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState message="시험을 선택하고 모듈을 시작하면 문제가 표시됩니다." />
          )}
        </Card>
      </div>
    </PageShell>
  );

  function setCurrentDetail(detail: StudentExamDetail) {
    setDetailOverride(detail);
  }
}

function estimateDuration(moduleType: "MODULE_1" | "MODULE_2") {
  return moduleType === "MODULE_1" ? 32 * 60 : 31 * 60;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-slate-700">
      <span>{label}</span>
      {children}
    </label>
  );
}

function SummaryBox({ title, lines }: { title: string; lines: string[] }) {
  return (
    <div className="rounded-[22px] border border-slate-200 bg-white px-5 py-5 shadow-sm">
      <h4 className="text-lg font-extrabold text-slate-950">{title}</h4>
      <div className="mt-3 space-y-2 text-sm leading-7 text-slate-600">
        {lines.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-600">{message}</div>;
}

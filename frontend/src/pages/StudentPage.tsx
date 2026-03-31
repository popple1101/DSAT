import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { storage } from "../lib/storage";
import { studentApi } from "../features/student/api";
import type { AuthResponse } from "../features/auth/types";
import type { StudentExamDetail } from "../features/student/types";

export function StudentPage() {
  const navigate = useNavigate();
  const token = storage.getStudentToken();
  const studentInfo = storage.getStudentUser<AuthResponse>();
  const [currentAssignmentId, setCurrentAssignmentId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [detailOverride, setDetailOverride] = useState<StudentExamDetail | null>(null);

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

  useEffect(() => {
    setDetailOverride(null);
  }, [currentAssignmentId]);

  useEffect(() => {
    if (!token || !studentInfo) {
      navigate("/login?role=student");
    }
  }, [navigate, studentInfo, token]);

  const detailState = useMemo(() => detailOverride ?? detailQuery.data ?? null, [detailOverride, detailQuery.data]);

  const activeAssignment = useMemo(
    () =>
      assignmentsQuery.data?.find((assignment) => assignment.assignmentId === currentAssignmentId) ??
      assignmentsQuery.data?.[0] ??
      null,
    [assignmentsQuery.data, currentAssignmentId]
  );

  const startModule1Mutation = useMutation({
    mutationFn: () => studentApi.startModule1(token, currentAssignmentId!),
    onSuccess: (data) => {
      setDetailOverride(data);
      setMessage("Module 1 시작");
      void detailQuery.refetch();
    },
    onError: (error) => setMessage(error.message),
  });

  const startModule2Mutation = useMutation({
    mutationFn: () => studentApi.startModule2(token, currentAssignmentId!),
    onSuccess: (data) => {
      setDetailOverride(data);
      setMessage("Module 2 시작");
      void detailQuery.refetch();
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
        setMessage(`Module 1 제출 / ${result.routeType}`);
        await detailQuery.refetch();
        return;
      }

      setMessage("최종 제출");
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
        throw new Error("시험을 먼저 선택해 주세요.");
      }

      return studentApi.saveAnswer(token, currentAssignmentId, {
        questionId,
        selectedAnswer,
        moduleType: detailState.currentModuleType,
        routeType: detailState.currentRouteType,
      });
    },
    onSuccess: (data) => {
      setDetailOverride(data);
      setMessage("답안 저장");
    },
    onError: (error) => setMessage(error.message),
  });

  return (
    <div className="space-y-5">
      <section
        className="rounded-[34px] border px-5 py-6 shadow-[var(--shadow-soft)]"
        style={{
          borderColor: "var(--color-line)",
          background: "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(247,249,253,0.92))",
        }}
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-brand-blue)]">
              Student
            </p>
            <h1 className="mt-2 text-3xl font-black text-[var(--color-ink)]">
              {studentInfo ? `${studentInfo.name} 학생 포털` : "학생 포털"}
            </h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className={primaryButtonClass} type="button" onClick={() => void assignmentsQuery.refetch()}>
              새로고침
            </button>
            {detailState ? (
              <button className={secondaryButtonClass} type="button" onClick={() => navigate(`/result/${detailState.assignmentId}`)}>
                결과 보기
              </button>
            ) : null}
          </div>
        </div>
      </section>

      {message ? (
        <div className="rounded-[20px] border border-[var(--color-line)] bg-white px-4 py-3 text-sm font-semibold text-[var(--color-text)]">
          {message}
        </div>
      ) : null}

      <section className="grid gap-5 xl:grid-cols-[0.88fr_1.12fr]">
        <Panel title="배정 시험">
          <div className="grid gap-3">
            {assignmentsQuery.data?.length ? (
              assignmentsQuery.data.map((assignment) => (
                <button
                  key={assignment.assignmentId}
                  type="button"
                  className={`rounded-[24px] border px-4 py-4 text-left transition ${
                    activeAssignment?.assignmentId === assignment.assignmentId
                      ? "bg-[var(--color-brand-navy)] text-white"
                      : "bg-white text-[var(--color-text)]"
                  }`}
                  style={{
                    borderColor:
                      activeAssignment?.assignmentId === assignment.assignmentId ? "transparent" : "var(--color-line)",
                  }}
                  onClick={() => setCurrentAssignmentId(assignment.assignmentId)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-black">
                        {assignment.examTitle} ({assignment.versionName})
                      </p>
                      <p
                        className={`mt-2 text-sm ${
                          activeAssignment?.assignmentId === assignment.assignmentId
                            ? "text-white/72"
                            : "text-[var(--color-text-soft)]"
                        }`}
                      >
                        {assignment.submissionStatus}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        assignment.routeType
                          ? "bg-white/14 text-white"
                          : "bg-[var(--color-brand-cream)] text-[var(--color-brand-navy)]"
                      }`}
                    >
                      {assignment.routeType ?? "대기"}
                    </span>
                  </div>
                </button>
              ))
            ) : (
              <EmptyState message="배정된 시험이 없습니다." />
            )}
          </div>
        </Panel>

        <Panel title="시험">
          {detailState ? (
            <div className="grid gap-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <StatCard label="상태" value={detailState.submissionStatus} />
                <StatCard label="모듈" value={detailState.currentModuleType} />
                <StatCard label="트랙" value={detailState.currentRouteType} />
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <button type="button" className={primaryButtonClass} onClick={() => startModule1Mutation.mutate()}>
                  Module 1 시작
                </button>
                <button type="button" className={secondaryButtonClass} onClick={() => startModule2Mutation.mutate()}>
                  Module 2 시작
                </button>
                <button type="button" className={ghostButtonClass} onClick={() => submitModuleMutation.mutate()}>
                  {detailState.currentModuleType === "MODULE_1" ? "Module 1 제출" : "최종 제출"}
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {detailState.questions.map((question) => (
                  <button
                    key={question.questionId}
                    type="button"
                    className="rounded-[20px] border bg-white px-4 py-3 text-left"
                    style={{
                      borderColor: question.selectedAnswer ? "rgba(16,185,129,0.34)" : "var(--color-line)",
                    }}
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-brand-blue)]">
                      Q{question.questionOrder}
                    </p>
                    <p className="mt-2 line-clamp-2 text-sm font-bold text-[var(--color-ink)]">{question.title}</p>
                    <p className="mt-2 text-xs text-[var(--color-text-soft)]">
                      {question.selectedAnswer ? `선택 ${question.selectedAnswer}` : "미응답"}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <EmptyState message="시험을 선택해 주세요." />
          )}
        </Panel>
      </section>

      <Panel title="응시">
        {detailState?.questions.length ? (
          <div className="grid gap-4">
            {detailState.questions.map((question) => (
              <article
                key={question.questionId}
                className="grid gap-4 rounded-[26px] border px-4 py-4 md:px-5 md:py-5 lg:grid-cols-[1.08fr_0.92fr]"
                style={{ borderColor: "var(--color-line)", background: "rgba(255,255,255,0.92)" }}
              >
                <div className="space-y-4">
                  <h3 className="text-xl font-black text-[var(--color-ink)]">
                    {question.questionOrder}. {question.title}
                  </h3>

                  {question.passageText ? (
                    <div
                      className="rounded-[20px] border px-4 py-4 text-sm leading-7 whitespace-pre-wrap"
                      style={{ borderColor: "var(--color-line)", background: "rgba(247,249,253,0.9)" }}
                    >
                      {question.passageText}
                    </div>
                  ) : null}

                  {question.assetImagePath ? (
                    <div
                      className="rounded-[20px] border border-dashed px-4 py-6 text-center text-sm text-[var(--color-text-soft)]"
                      style={{ borderColor: "var(--color-line-strong)", background: "rgba(247,249,253,0.86)" }}
                    >
                      {question.assetImagePath}
                    </div>
                  ) : null}

                  <div
                    className="rounded-[20px] border px-4 py-4 text-sm font-semibold leading-7 text-[var(--color-ink)]"
                    style={{ borderColor: "var(--color-line)", background: "rgba(255,255,255,0.94)" }}
                  >
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
                        className={`rounded-[20px] border px-4 py-4 text-left text-base font-semibold transition ${
                          active
                            ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                            : "bg-white text-[var(--color-text)]"
                        }`}
                        style={{ borderColor: active ? undefined : "var(--color-line)" }}
                        onClick={() =>
                          answerMutation.mutate({
                            questionId: question.questionId,
                            selectedAnswer: choice,
                          })
                        }
                      >
                        <span
                          className={`mr-3 inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-black ${
                            active
                              ? "bg-emerald-100 text-emerald-900"
                              : "bg-[var(--color-brand-cream)] text-[var(--color-brand-navy)]"
                          }`}
                        >
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
          <EmptyState message="시작한 시험이 없습니다." />
        )}
      </Panel>
    </div>
  );
}

function estimateDuration(moduleType: "MODULE_1" | "MODULE_2") {
  return moduleType === "MODULE_1" ? 32 * 60 : 31 * 60;
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section
      className="rounded-[30px] border p-5 shadow-[var(--shadow-soft)]"
      style={{
        borderColor: "var(--color-line)",
        background: "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(247,249,253,0.9))",
      }}
    >
      <h2 className="mb-4 text-xl font-black text-[var(--color-ink)]">{title}</h2>
      {children}
    </section>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[20px] border bg-white px-4 py-4" style={{ borderColor: "var(--color-line)" }}>
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-brand-blue)]">{label}</p>
      <p className="mt-2 text-lg font-black text-[var(--color-ink)]">{value}</p>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div
      className="rounded-[20px] border border-dashed px-4 py-6 text-sm text-[var(--color-text-soft)]"
      style={{ borderColor: "var(--color-line-strong)", background: "rgba(255,255,255,0.78)" }}
    >
      {message}
    </div>
  );
}

const primaryButtonClass =
  "rounded-[20px] bg-[var(--color-brand-navy)] px-5 py-3 text-sm font-bold text-white transition hover:bg-[var(--color-brand-navy-strong)]";

const secondaryButtonClass =
  "rounded-[20px] bg-[var(--color-brand-cream)] px-5 py-3 text-sm font-bold text-[var(--color-brand-navy)] transition hover:bg-white";

const ghostButtonClass =
  "rounded-[20px] bg-white px-5 py-3 text-sm font-bold text-[var(--color-brand-navy)] ring-1 ring-[var(--color-line)] transition hover:bg-[var(--color-brand-cream)]";

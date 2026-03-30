import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Card } from "../shared/Card";
import { PageShell } from "../shared/PageShell";
import { storage } from "../lib/storage";
import { studentApi } from "../features/student/api";
import type { AuthResponse } from "../features/auth/types";
import type { StudentAssignment, StudentExamDetail } from "../features/student/types";

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

  const detailState = useMemo(
    () => detailOverride ?? detailQuery.data ?? null,
    [detailOverride, detailQuery.data]
  );

  const startModule1Mutation = useMutation({
    mutationFn: () => studentApi.startModule1(token, currentAssignmentId!),
    onSuccess: (data) => {
      setDetailOverride(data);
      setMessage("Module 1을 시작했습니다.");
      void detailQuery.refetch();
    },
    onError: (error) => setMessage(error.message),
  });

  const startModule2Mutation = useMutation({
    mutationFn: () => studentApi.startModule2(token, currentAssignmentId!),
    onSuccess: (data) => {
      setDetailOverride(data);
      setMessage("Module 2를 시작했습니다.");
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
        setMessage(`Module 1 제출 완료. 다음 트랙은 ${result.routeType}입니다.`);
        await detailQuery.refetch();
        return;
      }

      setMessage("최종 제출이 완료되었습니다. 결과표로 이동합니다.");
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
        throw new Error("먼저 시험을 선택해주세요.");
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
      setMessage("답안을 저장했습니다.");
    },
    onError: (error) => setMessage(error.message),
  });

  const activeAssignment = useMemo(
    () =>
      assignmentsQuery.data?.find((assignment) => assignment.assignmentId === currentAssignmentId) ??
      assignmentsQuery.data?.[0] ??
      null,
    [assignmentsQuery.data, currentAssignmentId]
  );

  const summaryCards = buildSummaryCards(assignmentsQuery.data ?? [], detailState);

  return (
    <div className="space-y-5">
      <PageShell
        eyebrow="Student Portal"
        title={studentInfo ? `${studentInfo.name} 학생 포털` : "학생 DSAT 포털"}
        description="배정된 시험을 확인하고 현재 진행 상태를 한눈에 파악한 뒤, 태블릿에 최적화된 시험 화면으로 바로 이어지는 학생 대시보드입니다."
        actions={
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-full bg-[var(--color-brand-navy)] px-4 py-2 text-sm font-semibold text-white"
              onClick={() => void assignmentsQuery.refetch()}
            >
              시험 새로고침
            </button>
          </div>
        }
      >
        <div className="grid gap-4 md:grid-cols-3">
          {summaryCards.map((card) => (
            <div
              key={card.label}
              className="rounded-[26px] border px-5 py-5 shadow-[var(--shadow-soft)]"
              style={{
                borderColor: "var(--color-line)",
                background: card.emphasis
                  ? "linear-gradient(135deg, rgba(23,53,111,0.98), rgba(45,91,223,0.92) 100%)"
                  : "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(247,249,253,0.9))",
                color: card.emphasis ? "white" : "var(--color-text)",
              }}
            >
              <p
                className={`text-xs font-semibold uppercase tracking-[0.28em] ${
                  card.emphasis ? "text-white/68" : "text-[var(--color-brand-blue)]"
                }`}
              >
                {card.label}
              </p>
              <h3 className="mt-3 text-3xl font-black tracking-tight">{card.value}</h3>
              <p className={`mt-3 text-sm leading-7 ${card.emphasis ? "text-white/74" : "text-[var(--color-text-soft)]"}`}>
                {card.description}
              </p>
            </div>
          ))}
        </div>
      </PageShell>

      {message ? (
        <div className="rounded-[24px] border border-[var(--color-line)] bg-white/90 px-4 py-3 text-sm font-medium text-[var(--color-text)] shadow-sm">
          {message}
        </div>
      ) : null}

      <section className="grid gap-5 xl:grid-cols-[0.82fr_1.18fr]">
        <Card
          title="배정된 시험"
          description="학생에게 배정된 시험 목록과 현재 상태를 빠르게 확인할 수 있습니다."
        >
          <div className="grid gap-3">
            {assignmentsQuery.data?.length ? (
              assignmentsQuery.data.map((assignment) => (
                <AssignmentButton
                  key={assignment.assignmentId}
                  assignment={assignment}
                  active={currentAssignmentId === assignment.assignmentId || (!currentAssignmentId && activeAssignment?.assignmentId === assignment.assignmentId)}
                  onClick={() => setCurrentAssignmentId(assignment.assignmentId)}
                />
              ))
            ) : (
              <EmptyState message="배정된 시험이 없습니다." />
            )}
          </div>
        </Card>

        <Card
          title="현재 시험 상태"
          description="선택한 시험의 현재 모듈, 트랙, 소요 시간과 빠른 액션을 한 번에 제공합니다."
        >
          {detailState ? (
            <div className="grid gap-4">
              <div className="grid gap-4 md:grid-cols-2">
                <StatusPanel
                  title={`${detailState.examTitle} (${detailState.versionName})`}
                  lines={[
                    `제출 상태: ${detailState.submissionStatus}`,
                    `현재 모듈: ${detailState.currentModuleType}`,
                    `현재 트랙: ${detailState.currentRouteType}`,
                  ]}
                />
                <StatusPanel
                  title="모듈 기록"
                  lines={[
                    `Module 1 소요시간: ${formatSeconds(detailState.module1DurationSeconds ?? 0)}`,
                    `Module 2 소요시간: ${formatSeconds(detailState.module2DurationSeconds ?? 0)}`,
                    `현재 문항 수: ${detailState.questions.length}`,
                  ]}
                />
              </div>
              <div className="flex flex-wrap gap-3">
                <ActionButton
                  label="Module 1 시작"
                  onClick={() => startModule1Mutation.mutate()}
                  disabled={!activeAssignment}
                />
                <ActionButton
                  label="Module 2 시작"
                  onClick={() => startModule2Mutation.mutate()}
                  disabled={!activeAssignment}
                  tone="secondary"
                />
                <ActionButton
                  label={detailState.currentModuleType === "MODULE_1" ? "현재 모듈 제출" : "최종 제출"}
                  onClick={() => submitModuleMutation.mutate()}
                  disabled={!detailState}
                  tone="primary"
                />
              </div>
            </div>
          ) : (
            <EmptyState message="시험을 선택하면 현재 모듈과 진행 상태가 표시됩니다." />
          )}
        </Card>
      </section>

      <Card
        title="시험 화면 미리보기"
        description="실제 시험 응시 전, 선택한 시험의 문항을 태블릿 친화적인 카드 구조로 바로 확인할 수 있습니다."
      >
        {detailState?.questions.length ? (
          <div className="grid gap-4">
            {detailState.questions.map((question) => (
              <article
                key={question.questionId}
                className="grid gap-4 rounded-[28px] border px-5 py-5 shadow-sm md:grid-cols-[1.08fr_0.92fr]"
                style={{
                  borderColor: "var(--color-line)",
                  background: "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(247,249,253,0.88))",
                }}
              >
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-brand-blue)]">
                      {detailState.currentModuleType} / {detailState.currentRouteType}
                    </p>
                    <h4 className="mt-2 text-xl font-black tracking-tight text-[var(--color-ink)]">
                      {question.questionOrder}. {question.title}
                    </h4>
                  </div>

                  {question.passageText ? (
                    <div
                      className="rounded-[22px] border px-4 py-4 text-sm leading-7 whitespace-pre-wrap"
                      style={{ borderColor: "var(--color-line)", background: "rgba(255,255,255,0.82)" }}
                    >
                      {question.passageText}
                    </div>
                  ) : null}

                  {question.assetImagePath ? (
                    <div
                      className="rounded-[22px] border border-dashed px-4 py-8 text-center text-sm text-[var(--color-text-soft)]"
                      style={{ borderColor: "var(--color-line-strong)", background: "rgba(255,255,255,0.72)" }}
                    >
                      자료 이미지 경로: {question.assetImagePath}
                    </div>
                  ) : null}

                  <div
                    className="rounded-[22px] border px-4 py-4 text-sm font-semibold leading-7 text-[var(--color-ink)]"
                    style={{ borderColor: "var(--color-line)", background: "rgba(255,255,255,0.82)" }}
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
                        className={`rounded-[22px] border px-4 py-4 text-left text-base font-semibold transition ${
                          active
                            ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                            : "bg-white text-[var(--color-text)] hover:bg-slate-50"
                        }`}
                        style={{
                          borderColor: active ? undefined : "var(--color-line)",
                        }}
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
          <EmptyState message="시험을 선택하고 모듈을 시작하면 여기에 문항이 표시됩니다." />
        )}
      </Card>
    </div>
  );
}

function buildSummaryCards(assignments: StudentAssignment[], detailState: StudentExamDetail | null) {
  return [
    {
      label: "배정된 시험",
      value: `${assignments.length}개`,
      description: "학생 계정에 현재 연결된 시험 개수입니다.",
      emphasis: false,
    },
    {
      label: "진행 상태",
      value: detailState?.submissionStatus ?? "대기 중",
      description: detailState
        ? `${detailState.currentModuleType} / ${detailState.currentRouteType} 기준으로 진행 중입니다.`
        : "시험을 선택하면 현재 상태가 표시됩니다.",
      emphasis: true,
    },
    {
      label: "현재 트랙",
      value: detailState?.currentRouteType ?? "미정",
      description: "Module 1 제출 이후 Upper 또는 Lower 분기가 결정됩니다.",
      emphasis: false,
    },
  ];
}

function estimateDuration(moduleType: "MODULE_1" | "MODULE_2") {
  return moduleType === "MODULE_1" ? 32 * 60 : 31 * 60;
}

function formatSeconds(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remain = seconds % 60;
  return `${minutes}분 ${remain}초`;
}

function AssignmentButton({
  assignment,
  active,
  onClick,
}: {
  assignment: StudentAssignment;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={`rounded-[24px] border px-4 py-4 text-left transition ${
        active ? "text-white shadow-[var(--shadow-brand)]" : "bg-white text-[var(--color-text)] hover:bg-slate-50"
      }`}
      style={{
        borderColor: active ? "transparent" : "var(--color-line)",
        background: active
          ? "linear-gradient(135deg, rgba(23,53,111,0.98), rgba(45,91,223,0.9))"
          : "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(247,249,253,0.88))",
      }}
      onClick={onClick}
    >
      <p className="font-bold">
        {assignment.examTitle} ({assignment.versionName})
      </p>
      <p className={`mt-2 text-sm leading-6 ${active ? "text-white/72" : "text-[var(--color-text-soft)]"}`}>
        상태: {assignment.submissionStatus}
      </p>
      <p className={`text-sm leading-6 ${active ? "text-white/72" : "text-[var(--color-text-soft)]"}`}>
        트랙: {assignment.routeType || "대기"}
      </p>
    </button>
  );
}

function StatusPanel({ title, lines }: { title: string; lines: string[] }) {
  return (
    <div
      className="rounded-[24px] border px-5 py-5"
      style={{
        borderColor: "var(--color-line)",
        background: "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(247,249,253,0.88))",
      }}
    >
      <h4 className="text-lg font-extrabold text-[var(--color-ink)]">{title}</h4>
      <div className="mt-3 space-y-2 text-sm leading-7 text-[var(--color-text-soft)]">
        {lines.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
    </div>
  );
}

function ActionButton({
  label,
  onClick,
  disabled,
  tone = "ghost",
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  tone?: "primary" | "secondary" | "ghost";
}) {
  const baseClass =
    "rounded-full px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-45";

  const toneClass =
    tone === "primary"
      ? "bg-[var(--color-brand-navy)] text-white hover:bg-[var(--color-brand-navy-strong)]"
      : tone === "secondary"
        ? "bg-[var(--color-brand-cream)] text-[var(--color-brand-navy)] ring-1 ring-[var(--color-line-strong)] hover:bg-white"
        : "bg-white text-[var(--color-brand-navy)] ring-1 ring-[var(--color-line)] hover:bg-[var(--color-brand-cream)]";

  return (
    <button type="button" className={`${baseClass} ${toneClass}`} onClick={onClick} disabled={disabled}>
      {label}
    </button>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div
      className="rounded-[24px] border border-dashed px-4 py-6 text-sm text-[var(--color-text-soft)]"
      style={{ borderColor: "var(--color-line-strong)", background: "rgba(255,255,255,0.74)" }}
    >
      {message}
    </div>
  );
}

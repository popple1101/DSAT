import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Navigate } from "react-router-dom";
import { Card } from "../shared/Card";
import { PageShell } from "../shared/PageShell";
import { storage } from "../lib/storage";
import { adminApi } from "../features/admin/api";
import type { ExamQuestionLink, QuestionPayload } from "../features/admin/types";
import type { AuthResponse } from "../features/auth/types";

const emptyQuestionForm: QuestionPayload = {
  title: "",
  passageText: "",
  assetImagePath: "",
  questionText: "",
  choiceA: "",
  choiceB: "",
  choiceC: "",
  choiceD: "",
  correctAnswer: "A",
};

const createLinkRow = (): ExamQuestionLink => ({
  questionId: 0,
  moduleType: "MODULE_1",
  routeType: "COMMON",
  questionOrder: 1,
});

export function AdminPage() {
  const queryClient = useQueryClient();
  const token = storage.getAdminToken();
  const adminInfo = storage.getAdminUser<AuthResponse>();
  const [questionForm, setQuestionForm] = useState<QuestionPayload>(emptyQuestionForm);
  const [examForm, setExamForm] = useState({
    title: "DSAT Level Test",
    versionName: "v1",
    scoreTableId: "RW_DEFAULT_V1",
  });
  const [questionLinks, setQuestionLinks] = useState<ExamQuestionLink[]>([createLinkRow()]);
  const [assignmentForm, setAssignmentForm] = useState({
    examId: "",
    studentId: "",
    dueAt: "",
  });
  const [message, setMessage] = useState<string>("");

  if (!token || !adminInfo) {
    return <Navigate to="/login?role=admin" replace />;
  }

  const questionsQuery = useQuery({
    queryKey: ["admin", "questions"],
    queryFn: () => adminApi.getQuestions(token),
  });

  const examsQuery = useQuery({
    queryKey: ["admin", "exams"],
    queryFn: () => adminApi.getExams(token),
  });

  const studentsQuery = useQuery({
    queryKey: ["admin", "students"],
    queryFn: () => adminApi.getStudents(token),
  });

  const questionMutation = useMutation({
    mutationFn: (payload: QuestionPayload) => adminApi.createQuestion(token, payload),
    onSuccess: () => {
      setQuestionForm(emptyQuestionForm);
      setMessage("문제를 저장했습니다.");
      void queryClient.invalidateQueries({ queryKey: ["admin", "questions"] });
    },
    onError: (error) => setMessage(error.message),
  });

  const examMutation = useMutation({
    mutationFn: () =>
      adminApi.createExam(token, {
        ...examForm,
        questions: questionLinks.filter((link) => link.questionId > 0),
      }),
    onSuccess: () => {
      setQuestionLinks([createLinkRow()]);
      setMessage("시험 세트를 생성했습니다.");
      void queryClient.invalidateQueries({ queryKey: ["admin", "exams"] });
    },
    onError: (error) => setMessage(error.message),
  });

  const assignmentMutation = useMutation({
    mutationFn: () =>
      adminApi.createAssignment(token, {
        examId: Number(assignmentForm.examId),
        studentId: Number(assignmentForm.studentId),
        dueAt: assignmentForm.dueAt || null,
      }),
    onSuccess: () => {
      setMessage("학생에게 시험을 배정했습니다.");
    },
    onError: (error) => setMessage(error.message),
  });

  const questionOptions = useMemo(
    () =>
      questionsQuery.data?.map((question) => ({
        value: question.id,
        label: `#${question.id} ${question.title}`,
      })) ?? [],
    [questionsQuery.data]
  );

  const overviewCards = [
    {
      label: "관리자",
      value: adminInfo.name,
      description: `${adminInfo.role} 권한으로 운영 중입니다.`,
      emphasis: true,
    },
    {
      label: "등록된 문제",
      value: `${questionsQuery.data?.length ?? 0}개`,
      description: "문제 등록 현황",
      emphasis: false,
    },
    {
      label: "시험 세트",
      value: `${examsQuery.data?.length ?? 0}개`,
      description: "생성된 시험 묶음",
      emphasis: false,
    },
    {
      label: "학생 계정",
      value: `${studentsQuery.data?.length ?? 0}명`,
      description: "배정 가능한 학생 수",
      emphasis: false,
    },
  ];

  return (
    <div className="space-y-5">
      <PageShell
        eyebrow="Admin Console"
        title="LML DSAT 운영 콘솔"
        description="관리자는 문제 등록, 시험 생성, 학생 배정을 한 흐름 안에서 빠르게 처리합니다. 브랜드 톤은 유지하고, 실제 운영 화면은 더 실용적인 정보 밀도로 정리했습니다."
        actions={
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-full bg-[var(--color-brand-navy)] px-4 py-2 text-sm font-semibold text-white"
              onClick={() => {
                void questionsQuery.refetch();
                void examsQuery.refetch();
                void studentsQuery.refetch();
              }}
            >
              전체 새로고침
            </button>
          </div>
        }
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {overviewCards.map((card) => (
            <OverviewCard key={card.label} {...card} />
          ))}
        </div>
      </PageShell>

      {message ? (
        <div className="rounded-[24px] border border-[var(--color-line)] bg-white/90 px-4 py-3 text-sm font-medium text-[var(--color-text)] shadow-sm">
          {message}
        </div>
      ) : null}

      <section className="grid gap-5 xl:grid-cols-[0.92fr_1.08fr]">
        <Card
          title="문제 등록"
          description="지문 텍스트, 자료 이미지 경로, 질문, 보기, 정답을 입력해 문제를 등록합니다."
        >
          <form
            className="grid gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              questionMutation.mutate(questionForm);
            }}
          >
            <Field label="문제 제목">
              <input
                className={inputClass}
                value={questionForm.title}
                onChange={(event) => updateQuestionForm("title", event.target.value)}
              />
            </Field>
            <Field label="지문 텍스트">
              <textarea
                className={`${inputClass} min-h-28`}
                value={questionForm.passageText ?? ""}
                onChange={(event) => updateQuestionForm("passageText", event.target.value)}
              />
            </Field>
            <Field label="자료 이미지 경로">
              <input
                className={inputClass}
                value={questionForm.assetImagePath ?? ""}
                onChange={(event) => updateQuestionForm("assetImagePath", event.target.value)}
              />
            </Field>
            <Field label="질문 텍스트">
              <textarea
                className={`${inputClass} min-h-24`}
                value={questionForm.questionText}
                onChange={(event) => updateQuestionForm("questionText", event.target.value)}
              />
            </Field>
            <div className="grid gap-3 md:grid-cols-2">
              <Field label="선택지 A">
                <input className={inputClass} value={questionForm.choiceA} onChange={(e) => updateQuestionForm("choiceA", e.target.value)} />
              </Field>
              <Field label="선택지 B">
                <input className={inputClass} value={questionForm.choiceB} onChange={(e) => updateQuestionForm("choiceB", e.target.value)} />
              </Field>
              <Field label="선택지 C">
                <input className={inputClass} value={questionForm.choiceC} onChange={(e) => updateQuestionForm("choiceC", e.target.value)} />
              </Field>
              <Field label="선택지 D">
                <input className={inputClass} value={questionForm.choiceD} onChange={(e) => updateQuestionForm("choiceD", e.target.value)} />
              </Field>
            </div>
            <Field label="정답">
              <select
                className={inputClass}
                value={questionForm.correctAnswer}
                onChange={(event) =>
                  updateQuestionForm("correctAnswer", event.target.value as QuestionPayload["correctAnswer"])
                }
              >
                {["A", "B", "C", "D"].map((answer) => (
                  <option key={answer} value={answer}>
                    {answer}
                  </option>
                ))}
              </select>
            </Field>
            <button className={primaryButtonClass} type="submit">
              {questionMutation.isPending ? "문제 저장 중..." : "문제 저장"}
            </button>
          </form>
        </Card>

        <Card
          title="최근 등록된 문제"
          description="시험 세트에 바로 연결할 수 있도록 최근 등록된 문제를 카드 형태로 확인합니다."
          action={
            <button
              type="button"
              className={ghostButtonClass}
              onClick={() => void questionsQuery.refetch()}
            >
              문제 새로고침
            </button>
          }
        >
          <div className="grid gap-3">
            {questionsQuery.data?.length ? (
              questionsQuery.data.map((question) => (
                <div
                  key={question.id}
                  className="rounded-[24px] border px-4 py-4"
                  style={{
                    borderColor: "var(--color-line)",
                    background: "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(247,249,253,0.88))",
                  }}
                >
                  <p className="font-bold text-[var(--color-ink)]">
                    #{question.id} {question.title}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[var(--color-text-soft)]">
                    정답: {question.correctAnswer} / 이미지: {question.assetImagePath || "없음"}
                  </p>
                </div>
              ))
            ) : (
              <EmptyState message="등록된 문제가 없습니다." />
            )}
          </div>
        </Card>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.08fr_0.92fr]">
        <Card
          title="시험 세트 생성"
          description="레벨테스트 v1, v2처럼 버전형 시험을 만들고 Module/Route 기준으로 문항을 연결합니다."
        >
          <form
            className="grid gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              examMutation.mutate();
            }}
          >
            <div className="grid gap-3 md:grid-cols-3">
              <Field label="시험명">
                <input
                  className={inputClass}
                  value={examForm.title}
                  onChange={(event) => setExamForm((prev) => ({ ...prev, title: event.target.value }))}
                />
              </Field>
              <Field label="버전명">
                <input
                  className={inputClass}
                  value={examForm.versionName}
                  onChange={(event) => setExamForm((prev) => ({ ...prev, versionName: event.target.value }))}
                />
              </Field>
              <Field label="점수표 ID">
                <input
                  className={inputClass}
                  value={examForm.scoreTableId}
                  onChange={(event) => setExamForm((prev) => ({ ...prev, scoreTableId: event.target.value }))}
                />
              </Field>
            </div>

            <div className="space-y-3">
              {questionLinks.map((link, index) => (
                <div
                  key={`${index}-${link.questionId}`}
                  className="grid gap-3 rounded-[24px] border px-4 py-4 md:grid-cols-[2fr_1fr_1fr_1fr_auto]"
                  style={{
                    borderColor: "var(--color-line)",
                    background: "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(247,249,253,0.88))",
                  }}
                >
                  <Field label="문제">
                    <select
                      className={inputClass}
                      value={link.questionId}
                      onChange={(event) => updateLink(index, "questionId", Number(event.target.value))}
                    >
                      <option value={0}>문제 선택</option>
                      {questionOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="모듈">
                    <select
                      className={inputClass}
                      value={link.moduleType}
                      onChange={(event) => updateLink(index, "moduleType", event.target.value as ExamQuestionLink["moduleType"])}
                    >
                      <option value="MODULE_1">MODULE_1</option>
                      <option value="MODULE_2">MODULE_2</option>
                    </select>
                  </Field>
                  <Field label="트랙">
                    <select
                      className={inputClass}
                      value={link.routeType}
                      onChange={(event) => updateLink(index, "routeType", event.target.value as ExamQuestionLink["routeType"])}
                    >
                      <option value="COMMON">COMMON</option>
                      <option value="UPPER">UPPER</option>
                      <option value="LOWER">LOWER</option>
                    </select>
                  </Field>
                  <Field label="순서">
                    <input
                      className={inputClass}
                      type="number"
                      min={1}
                      value={link.questionOrder}
                      onChange={(event) => updateLink(index, "questionOrder", Number(event.target.value))}
                    />
                  </Field>
                  <button
                    type="button"
                    className="mt-6 rounded-full bg-rose-100 px-4 py-3 text-sm font-bold text-rose-700"
                    onClick={() => removeLink(index)}
                  >
                    삭제
                  </button>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                className={ghostButtonClass}
                onClick={() => setQuestionLinks((prev) => [...prev, createLinkRow()])}
              >
                문항 연결 추가
              </button>
              <button className={primaryButtonClass} type="submit">
                {examMutation.isPending ? "시험 생성 중..." : "시험 세트 저장"}
              </button>
            </div>
          </form>
        </Card>

        <Card
          title="학생 배정"
          description="생성된 시험 세트를 학생 계정에 연결해 실제 응시 흐름으로 이어줍니다."
        >
          <form
            className="grid gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              assignmentMutation.mutate();
            }}
          >
            <Field label="시험 세트">
              <select
                className={inputClass}
                value={assignmentForm.examId}
                onChange={(event) => setAssignmentForm((prev) => ({ ...prev, examId: event.target.value }))}
              >
                <option value="">시험 선택</option>
                {examsQuery.data?.map((exam) => (
                  <option key={exam.id} value={exam.id}>
                    {exam.title} ({exam.versionName})
                  </option>
                ))}
              </select>
            </Field>
            <Field label="학생">
              <select
                className={inputClass}
                value={assignmentForm.studentId}
                onChange={(event) => setAssignmentForm((prev) => ({ ...prev, studentId: event.target.value }))}
              >
                <option value="">학생 선택</option>
                {studentsQuery.data?.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name} (#{student.id})
                  </option>
                ))}
              </select>
            </Field>
            <Field label="마감일시">
              <input
                className={inputClass}
                type="datetime-local"
                value={assignmentForm.dueAt}
                onChange={(event) => setAssignmentForm((prev) => ({ ...prev, dueAt: event.target.value }))}
              />
            </Field>
            <button className={primaryButtonClass} type="submit">
              {assignmentMutation.isPending ? "배정 중..." : "학생에게 시험 배정"}
            </button>
          </form>

          <div className="mt-5 grid gap-3">
            <MiniStat
              label="시험 세트"
              value={`${examsQuery.data?.length ?? 0}개`}
              description="학생에게 배정 가능한 시험 수"
            />
            <MiniStat
              label="학생 계정"
              value={`${studentsQuery.data?.length ?? 0}명`}
              description="현재 조회 가능한 학생 계정 수"
            />
          </div>
        </Card>
      </section>
    </div>
  );

  function updateQuestionForm<K extends keyof QuestionPayload>(key: K, value: QuestionPayload[K]) {
    setQuestionForm((prev) => ({ ...prev, [key]: value }));
  }

  function updateLink<K extends keyof ExamQuestionLink>(index: number, key: K, value: ExamQuestionLink[K]) {
    setQuestionLinks((prev) =>
      prev.map((row, rowIndex) => (rowIndex === index ? { ...row, [key]: value } : row))
    );
  }

  function removeLink(index: number) {
    setQuestionLinks((prev) => (prev.length === 1 ? prev : prev.filter((_, rowIndex) => rowIndex !== index)));
  }
}

const inputClass =
  "rounded-[22px] border border-[var(--color-line)] bg-white px-4 py-3 text-[var(--color-ink)] outline-none transition focus:border-[var(--color-brand-blue)]";

const primaryButtonClass =
  "rounded-full bg-[var(--color-brand-navy)] px-5 py-3 text-sm font-bold text-white transition hover:bg-[var(--color-brand-navy-strong)]";

const ghostButtonClass =
  "rounded-full bg-white px-4 py-3 text-sm font-bold text-[var(--color-brand-navy)] ring-1 ring-[var(--color-line)] transition hover:bg-[var(--color-brand-cream)]";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-[var(--color-text)]">
      <span>{label}</span>
      {children}
    </label>
  );
}

function OverviewCard({
  label,
  value,
  description,
  emphasis,
}: {
  label: string;
  value: string;
  description: string;
  emphasis: boolean;
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
      <h3 className="mt-3 text-3xl font-black tracking-tight">{value}</h3>
      <p className={`mt-3 text-sm leading-7 ${emphasis ? "text-white/72" : "text-[var(--color-text-soft)]"}`}>
        {description}
      </p>
    </div>
  );
}

function MiniStat({ label, value, description }: { label: string; value: string; description: string }) {
  return (
    <div
      className="rounded-[24px] border px-4 py-4"
      style={{
        borderColor: "var(--color-line)",
        background: "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(247,249,253,0.88))",
      }}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-brand-blue)]">{label}</p>
      <p className="mt-2 text-xl font-black text-[var(--color-ink)]">{value}</p>
      <p className="mt-2 text-sm leading-6 text-[var(--color-text-soft)]">{description}</p>
    </div>
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

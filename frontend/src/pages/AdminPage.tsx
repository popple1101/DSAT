import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Navigate } from "react-router-dom";
import { storage } from "../lib/storage";
import { adminApi } from "../features/admin/api";
import type { ExamQuestionLink, QuestionPayload } from "../features/admin/types";
import type { AuthResponse } from "../features/auth/types";

type ConsoleSection = "dashboard" | "questions" | "exams" | "assignments" | "students";

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

const sections: Array<{ key: ConsoleSection; label: string }> = [
  { key: "dashboard", label: "대시보드" },
  { key: "questions", label: "문제 관리" },
  { key: "exams", label: "시험 관리" },
  { key: "assignments", label: "학생 배정" },
  { key: "students", label: "학생 관리" },
];

export function AdminPage() {
  const queryClient = useQueryClient();
  const token = storage.getAdminToken();
  const adminInfo = storage.getAdminUser<AuthResponse>();
  const [section, setSection] = useState<ConsoleSection>("dashboard");
  const [questionForm, setQuestionForm] = useState<QuestionPayload>(emptyQuestionForm);
  const [examForm, setExamForm] = useState({
    title: "Level Test",
    versionName: "v1",
    scoreTableId: "RW_DEFAULT_V1",
  });
  const [questionLinks, setQuestionLinks] = useState<ExamQuestionLink[]>([createLinkRow()]);
  const [assignmentForm, setAssignmentForm] = useState({
    examId: "",
    studentId: "",
    dueAt: "",
  });
  const [message, setMessage] = useState("");

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
      setMessage("문제 저장");
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
      setMessage("시험 생성");
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
    onSuccess: () => setMessage("학생 배정"),
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

  return (
    <div
      className="overflow-hidden rounded-[34px] border shadow-[var(--shadow-soft)]"
      style={{ borderColor: "var(--color-line)" }}
    >
      <div className="flex min-h-[calc(100vh-180px)] flex-col xl:flex-row">
        <aside className="w-full bg-[var(--color-brand-navy)] px-5 py-6 text-white xl:w-[250px]">
          <div className="flex flex-col gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/58">Admin</p>
              <h1 className="mt-2 text-3xl font-black">LML</h1>
            </div>
            <div className="grid gap-2">
              {sections.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  className={`rounded-[18px] px-4 py-3 text-left text-sm font-bold transition ${
                    section === item.key
                      ? "bg-white text-[var(--color-brand-navy)]"
                      : "bg-white/8 text-white/84 hover:bg-white/12"
                  }`}
                  onClick={() => setSection(item.key)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <main className="flex-1 bg-[var(--color-surface)] px-5 py-6 md:px-6">
          <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-brand-blue)]">
                Console
              </p>
              <h2 className="mt-2 text-3xl font-black text-[var(--color-ink)]">{getSectionTitle(section)}</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                className={ghostButtonClass}
                onClick={() => {
                  void questionsQuery.refetch();
                  void examsQuery.refetch();
                  void studentsQuery.refetch();
                }}
              >
                새로고침
              </button>
              <div className="rounded-[18px] bg-white px-4 py-3 text-sm font-semibold text-[var(--color-text)] ring-1 ring-[var(--color-line)]">
                {adminInfo.name}
              </div>
            </div>
          </div>

          {message ? (
            <div className="mb-5 rounded-[20px] border border-[var(--color-line)] bg-white px-4 py-3 text-sm font-semibold text-[var(--color-text)]">
              {message}
            </div>
          ) : null}

          {section === "dashboard" ? (
            <div className="grid gap-5">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <OverviewCard label="관리자" value={adminInfo.name} />
                <OverviewCard label="문제" value={`${questionsQuery.data?.length ?? 0}`} />
                <OverviewCard label="시험" value={`${examsQuery.data?.length ?? 0}`} />
                <OverviewCard label="학생" value={`${studentsQuery.data?.length ?? 0}`} />
              </div>
              <div className="grid gap-5 xl:grid-cols-2">
                <ConsolePanel title="시험 목록">
                  <SimpleTable
                    headers={["시험명", "버전", "점수표"]}
                    rows={examsQuery.data?.map((exam) => [exam.title, exam.versionName, exam.scoreTableId]) ?? []}
                  />
                </ConsolePanel>
                <ConsolePanel title="학생 목록">
                  <SimpleTable
                    headers={["이름", "아이디", "번호"]}
                    rows={studentsQuery.data?.map((student) => [student.name, student.loginId, String(student.id)]) ?? []}
                  />
                </ConsolePanel>
              </div>
            </div>
          ) : null}

          {section === "questions" ? (
            <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
              <ConsolePanel title="문제 등록">
                <form
                  className="grid gap-3"
                  onSubmit={(event) => {
                    event.preventDefault();
                    questionMutation.mutate(questionForm);
                  }}
                >
                  <Field label="제목">
                    <input className={inputClass} value={questionForm.title} onChange={(event) => updateQuestionForm("title", event.target.value)} />
                  </Field>
                  <Field label="지문">
                    <textarea className={`${inputClass} min-h-28`} value={questionForm.passageText ?? ""} onChange={(event) => updateQuestionForm("passageText", event.target.value)} />
                  </Field>
                  <Field label="이미지 경로">
                    <input className={inputClass} value={questionForm.assetImagePath ?? ""} onChange={(event) => updateQuestionForm("assetImagePath", event.target.value)} />
                  </Field>
                  <Field label="질문">
                    <textarea className={`${inputClass} min-h-24`} value={questionForm.questionText} onChange={(event) => updateQuestionForm("questionText", event.target.value)} />
                  </Field>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="A">
                      <input className={inputClass} value={questionForm.choiceA} onChange={(event) => updateQuestionForm("choiceA", event.target.value)} />
                    </Field>
                    <Field label="B">
                      <input className={inputClass} value={questionForm.choiceB} onChange={(event) => updateQuestionForm("choiceB", event.target.value)} />
                    </Field>
                    <Field label="C">
                      <input className={inputClass} value={questionForm.choiceC} onChange={(event) => updateQuestionForm("choiceC", event.target.value)} />
                    </Field>
                    <Field label="D">
                      <input className={inputClass} value={questionForm.choiceD} onChange={(event) => updateQuestionForm("choiceD", event.target.value)} />
                    </Field>
                  </div>
                  <Field label="정답">
                    <select className={inputClass} value={questionForm.correctAnswer} onChange={(event) => updateQuestionForm("correctAnswer", event.target.value as QuestionPayload["correctAnswer"])}>
                      {["A", "B", "C", "D"].map((answer) => (
                        <option key={answer} value={answer}>
                          {answer}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <button className={primaryButtonClass} type="submit">
                    {questionMutation.isPending ? "저장 중..." : "문제 저장"}
                  </button>
                </form>
              </ConsolePanel>

              <ConsolePanel title="문제 목록">
                <SimpleTable
                  headers={["번호", "제목", "정답"]}
                  rows={questionsQuery.data?.map((question) => [String(question.id), question.title, question.correctAnswer]) ?? []}
                />
              </ConsolePanel>
            </div>
          ) : null}

          {section === "exams" ? (
            <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
              <ConsolePanel title="시험 생성">
                <form
                  className="grid gap-4"
                  onSubmit={(event) => {
                    event.preventDefault();
                    examMutation.mutate();
                  }}
                >
                  <div className="grid gap-3 md:grid-cols-3">
                    <Field label="시험명">
                      <input className={inputClass} value={examForm.title} onChange={(event) => setExamForm((prev) => ({ ...prev, title: event.target.value }))} />
                    </Field>
                    <Field label="버전">
                      <input className={inputClass} value={examForm.versionName} onChange={(event) => setExamForm((prev) => ({ ...prev, versionName: event.target.value }))} />
                    </Field>
                    <Field label="점수표">
                      <input className={inputClass} value={examForm.scoreTableId} onChange={(event) => setExamForm((prev) => ({ ...prev, scoreTableId: event.target.value }))} />
                    </Field>
                  </div>

                  <div className="grid gap-3">
                    {questionLinks.map((link, index) => (
                      <div
                        key={`${index}-${link.questionId}`}
                        className="grid gap-3 rounded-[22px] border px-4 py-4 md:grid-cols-2 xl:grid-cols-[2fr_1fr_1fr_1fr_auto]"
                        style={{ borderColor: "var(--color-line)", background: "rgba(255,255,255,0.92)" }}
                      >
                        <Field label="문제">
                          <select className={inputClass} value={link.questionId} onChange={(event) => updateLink(index, "questionId", Number(event.target.value))}>
                            <option value={0}>문제 선택</option>
                            {questionOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </Field>
                        <Field label="모듈">
                          <select className={inputClass} value={link.moduleType} onChange={(event) => updateLink(index, "moduleType", event.target.value as ExamQuestionLink["moduleType"])}>
                            <option value="MODULE_1">MODULE_1</option>
                            <option value="MODULE_2">MODULE_2</option>
                          </select>
                        </Field>
                        <Field label="트랙">
                          <select className={inputClass} value={link.routeType} onChange={(event) => updateLink(index, "routeType", event.target.value as ExamQuestionLink["routeType"])}>
                            <option value="COMMON">COMMON</option>
                            <option value="UPPER">UPPER</option>
                            <option value="LOWER">LOWER</option>
                          </select>
                        </Field>
                        <Field label="순서">
                          <input className={inputClass} type="number" min={1} value={link.questionOrder} onChange={(event) => updateLink(index, "questionOrder", Number(event.target.value))} />
                        </Field>
                        <button type="button" className="rounded-[18px] bg-rose-100 px-4 py-3 text-sm font-bold text-rose-700 xl:mt-7" onClick={() => removeLink(index)}>
                          삭제
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button type="button" className={ghostButtonClass} onClick={() => setQuestionLinks((prev) => [...prev, createLinkRow()])}>
                      문항 추가
                    </button>
                    <button className={primaryButtonClass} type="submit">
                      {examMutation.isPending ? "생성 중..." : "시험 생성"}
                    </button>
                  </div>
                </form>
              </ConsolePanel>

              <ConsolePanel title="시험 목록">
                <SimpleTable
                  headers={["시험명", "버전", "문항 수"]}
                  rows={examsQuery.data?.map((exam) => [exam.title, exam.versionName, String(exam.questions.length)]) ?? []}
                />
              </ConsolePanel>
            </div>
          ) : null}

          {section === "assignments" ? (
            <div className="grid gap-5 xl:grid-cols-[0.78fr_1.22fr]">
              <ConsolePanel title="학생 배정">
                <form
                  className="grid gap-3"
                  onSubmit={(event) => {
                    event.preventDefault();
                    assignmentMutation.mutate();
                  }}
                >
                  <Field label="시험">
                    <select className={inputClass} value={assignmentForm.examId} onChange={(event) => setAssignmentForm((prev) => ({ ...prev, examId: event.target.value }))}>
                      <option value="">시험 선택</option>
                      {examsQuery.data?.map((exam) => (
                        <option key={exam.id} value={exam.id}>
                          {exam.title} ({exam.versionName})
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="학생">
                    <select className={inputClass} value={assignmentForm.studentId} onChange={(event) => setAssignmentForm((prev) => ({ ...prev, studentId: event.target.value }))}>
                      <option value="">학생 선택</option>
                      {studentsQuery.data?.map((student) => (
                        <option key={student.id} value={student.id}>
                          {student.name} (#{student.id})
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="마감일">
                    <input className={inputClass} type="datetime-local" value={assignmentForm.dueAt} onChange={(event) => setAssignmentForm((prev) => ({ ...prev, dueAt: event.target.value }))} />
                  </Field>
                  <button className={primaryButtonClass} type="submit">
                    {assignmentMutation.isPending ? "배정 중..." : "학생 배정"}
                  </button>
                </form>
              </ConsolePanel>

              <div className="grid gap-5">
                <ConsolePanel title="시험">
                  <SimpleTable
                    headers={["시험명", "버전"]}
                    rows={examsQuery.data?.map((exam) => [exam.title, exam.versionName]) ?? []}
                  />
                </ConsolePanel>
                <ConsolePanel title="학생">
                  <SimpleTable
                    headers={["이름", "아이디"]}
                    rows={studentsQuery.data?.map((student) => [student.name, student.loginId]) ?? []}
                  />
                </ConsolePanel>
              </div>
            </div>
          ) : null}

          {section === "students" ? (
            <ConsolePanel title="학생 목록">
              <SimpleTable
                headers={["번호", "이름", "아이디"]}
                rows={studentsQuery.data?.map((student) => [String(student.id), student.name, student.loginId]) ?? []}
              />
            </ConsolePanel>
          ) : null}
        </main>
      </div>
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

function getSectionTitle(section: ConsoleSection) {
  switch (section) {
    case "dashboard":
      return "대시보드";
    case "questions":
      return "문제 관리";
    case "exams":
      return "시험 관리";
    case "assignments":
      return "학생 배정";
    case "students":
      return "학생 관리";
  }
}

function ConsolePanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section
      className="rounded-[28px] border p-5 shadow-[var(--shadow-soft)]"
      style={{
        borderColor: "var(--color-line)",
        background: "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(247,249,253,0.92))",
      }}
    >
      <h3 className="mb-4 text-xl font-black text-[var(--color-ink)]">{title}</h3>
      {children}
    </section>
  );
}

function OverviewCard({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="rounded-[24px] border px-4 py-4"
      style={{ borderColor: "var(--color-line)", background: "rgba(255,255,255,0.94)" }}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-brand-blue)]">{label}</p>
      <p className="mt-2 text-3xl font-black text-[var(--color-ink)]">{value}</p>
    </div>
  );
}

function SimpleTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  if (!rows.length) {
    return <EmptyState message="데이터가 없습니다." />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--color-line)] text-left text-[var(--color-text-soft)]">
            {headers.map((header) => (
              <th key={header} className="px-4 py-3 font-semibold">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={`${row.join("-")}-${index}`} className="border-b border-[var(--color-line)]">
              {row.map((cell, cellIndex) => (
                <td key={`${cell}-${cellIndex}`} className="px-4 py-3 text-[var(--color-text)]">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-[var(--color-text)]">
      <span>{label}</span>
      {children}
    </label>
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

const inputClass =
  "rounded-[18px] border border-[var(--color-line)] bg-white px-4 py-3 text-[var(--color-ink)] outline-none transition focus:border-[var(--color-brand-blue)]";

const primaryButtonClass =
  "rounded-[18px] bg-[var(--color-brand-navy)] px-4 py-3 text-sm font-bold text-white transition hover:bg-[var(--color-brand-navy-strong)]";

const ghostButtonClass =
  "rounded-[18px] bg-white px-4 py-3 text-sm font-bold text-[var(--color-brand-navy)] ring-1 ring-[var(--color-line)] transition hover:bg-[var(--color-brand-cream)]";

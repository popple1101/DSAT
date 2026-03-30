import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
  const [token, setToken] = useState(storage.getAdminToken());
  const [adminInfo, setAdminInfo] = useState<AuthResponse | null>(null);
  const [loginForm, setLoginForm] = useState({ loginId: "manager", password: "1234" });
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

  const isReady = Boolean(token);

  const questionsQuery = useQuery({
    queryKey: ["admin", "questions"],
    queryFn: () => adminApi.getQuestions(token),
    enabled: isReady,
  });

  const examsQuery = useQuery({
    queryKey: ["admin", "exams"],
    queryFn: () => adminApi.getExams(token),
    enabled: isReady,
  });

  const studentsQuery = useQuery({
    queryKey: ["admin", "students"],
    queryFn: () => adminApi.getStudents(token),
    enabled: isReady,
  });

  const loginMutation = useMutation({
    mutationFn: adminApi.login,
    onSuccess: (data) => {
      storage.setAdminToken(data.accessToken);
      setToken(data.accessToken);
      setAdminInfo(data);
      setMessage(`로그인 완료: ${data.name} (${data.role})`);
    },
    onError: (error) => setMessage(error.message),
  });

  const questionMutation = useMutation({
    mutationFn: (payload: QuestionPayload) => adminApi.createQuestion(token, payload),
    onSuccess: () => {
      setQuestionForm(emptyQuestionForm);
      setMessage("문제가 저장되었습니다.");
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
      setMessage("시험 세트가 생성되었습니다.");
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
    () => questionsQuery.data?.map((question) => ({ value: question.id, label: `#${question.id} ${question.title}` })) ?? [],
    [questionsQuery.data]
  );

  return (
    <PageShell
      eyebrow="Admin"
      title="관리자 PC 대시보드"
      description="React 앱으로 문제 등록, 시험 세트 생성, 학생 배정 흐름을 직접 옮긴 첫 화면입니다. 이후 기존 static 로직을 점진적으로 이 구조에 더 붙이면 됩니다."
      actions={
        <span className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
          {adminInfo ? `${adminInfo.name} (${adminInfo.role})` : "로그인 전"}
        </span>
      }
    >
      {message ? (
        <div className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm font-medium text-slate-700 shadow-sm">
          {message}
        </div>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-2">
        <Card title="관리자 로그인" description="JWT 토큰을 받아 이후 관리자 API 호출에 재사용합니다.">
          <form
            className="grid gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              loginMutation.mutate(loginForm);
            }}
          >
            <Field label="로그인 아이디">
              <input
                className="rounded-2xl border border-slate-200 px-4 py-3"
                value={loginForm.loginId}
                onChange={(event) => setLoginForm((prev) => ({ ...prev, loginId: event.target.value }))}
              />
            </Field>
            <Field label="비밀번호">
              <input
                className="rounded-2xl border border-slate-200 px-4 py-3"
                type="password"
                value={loginForm.password}
                onChange={(event) => setLoginForm((prev) => ({ ...prev, password: event.target.value }))}
              />
            </Field>
            <button className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-bold text-white" type="submit">
              {loginMutation.isPending ? "로그인 중..." : "로그인"}
            </button>
          </form>
        </Card>

        <Card title="문제 등록" description="지문 텍스트, 자료 이미지 경로, 질문, 보기, 정답을 그대로 등록합니다.">
          <form
            className="grid gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              questionMutation.mutate(questionForm);
            }}
          >
            <Field label="문제 제목">
              <input
                className="rounded-2xl border border-slate-200 px-4 py-3"
                value={questionForm.title}
                onChange={(event) => updateQuestionForm("title", event.target.value)}
              />
            </Field>
            <Field label="지문 텍스트">
              <textarea
                className="min-h-28 rounded-2xl border border-slate-200 px-4 py-3"
                value={questionForm.passageText ?? ""}
                onChange={(event) => updateQuestionForm("passageText", event.target.value)}
              />
            </Field>
            <Field label="자료 이미지 경로">
              <input
                className="rounded-2xl border border-slate-200 px-4 py-3"
                value={questionForm.assetImagePath ?? ""}
                onChange={(event) => updateQuestionForm("assetImagePath", event.target.value)}
              />
            </Field>
            <Field label="질문 텍스트">
              <textarea
                className="min-h-24 rounded-2xl border border-slate-200 px-4 py-3"
                value={questionForm.questionText}
                onChange={(event) => updateQuestionForm("questionText", event.target.value)}
              />
            </Field>
            <div className="grid gap-3 md:grid-cols-2">
              <Field label="선택지 A">
                <input className="rounded-2xl border border-slate-200 px-4 py-3" value={questionForm.choiceA} onChange={(e) => updateQuestionForm("choiceA", e.target.value)} />
              </Field>
              <Field label="선택지 B">
                <input className="rounded-2xl border border-slate-200 px-4 py-3" value={questionForm.choiceB} onChange={(e) => updateQuestionForm("choiceB", e.target.value)} />
              </Field>
              <Field label="선택지 C">
                <input className="rounded-2xl border border-slate-200 px-4 py-3" value={questionForm.choiceC} onChange={(e) => updateQuestionForm("choiceC", e.target.value)} />
              </Field>
              <Field label="선택지 D">
                <input className="rounded-2xl border border-slate-200 px-4 py-3" value={questionForm.choiceD} onChange={(e) => updateQuestionForm("choiceD", e.target.value)} />
              </Field>
            </div>
            <Field label="정답">
              <select
                className="rounded-2xl border border-slate-200 px-4 py-3"
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
            <button className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-bold text-white" type="submit">
              {questionMutation.isPending ? "저장 중..." : "문제 저장"}
            </button>
          </form>
        </Card>

        <Card
          title="등록된 문제"
          description="시험 세트 생성에 사용할 문제 목록입니다."
          className="xl:col-span-2"
          action={
            <button
              type="button"
              className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700"
              onClick={() => void questionsQuery.refetch()}
            >
              새로고침
            </button>
          }
        >
          <div className="grid gap-3">
            {questionsQuery.data?.length ? (
              questionsQuery.data.map((question) => (
                <div key={question.id} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <p className="font-bold text-slate-900">
                    #{question.id} {question.title}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    정답: {question.correctAnswer} / 이미지: {question.assetImagePath || "없음"}
                  </p>
                </div>
              ))
            ) : (
              <EmptyState message="등록된 문제가 없습니다." />
            )}
          </div>
        </Card>

        <Card title="시험 세트 생성" description="레벨테스트 v1/v2처럼 문제 묶음을 만들고 Module / Route를 지정합니다." className="xl:col-span-2">
          <form
            className="grid gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              examMutation.mutate();
            }}
          >
            <div className="grid gap-3 md:grid-cols-3">
              <Field label="시험명">
                <input className="rounded-2xl border border-slate-200 px-4 py-3" value={examForm.title} onChange={(e) => setExamForm((prev) => ({ ...prev, title: e.target.value }))} />
              </Field>
              <Field label="버전명">
                <input className="rounded-2xl border border-slate-200 px-4 py-3" value={examForm.versionName} onChange={(e) => setExamForm((prev) => ({ ...prev, versionName: e.target.value }))} />
              </Field>
              <Field label="점수표 ID">
                <input className="rounded-2xl border border-slate-200 px-4 py-3" value={examForm.scoreTableId} onChange={(e) => setExamForm((prev) => ({ ...prev, scoreTableId: e.target.value }))} />
              </Field>
            </div>
            <div className="space-y-3">
              {questionLinks.map((link, index) => (
                <div key={`${index}-${link.questionId}`} className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 md:grid-cols-[2fr_1fr_1fr_1fr_auto]">
                  <Field label="문제">
                    <select
                      className="rounded-2xl border border-slate-200 px-4 py-3"
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
                    <select className="rounded-2xl border border-slate-200 px-4 py-3" value={link.moduleType} onChange={(event) => updateLink(index, "moduleType", event.target.value as ExamQuestionLink["moduleType"])}>
                      <option value="MODULE_1">MODULE_1</option>
                      <option value="MODULE_2">MODULE_2</option>
                    </select>
                  </Field>
                  <Field label="트랙">
                    <select className="rounded-2xl border border-slate-200 px-4 py-3" value={link.routeType} onChange={(event) => updateLink(index, "routeType", event.target.value as ExamQuestionLink["routeType"])}>
                      <option value="COMMON">COMMON</option>
                      <option value="UPPER">UPPER</option>
                      <option value="LOWER">LOWER</option>
                    </select>
                  </Field>
                  <Field label="순서">
                    <input className="rounded-2xl border border-slate-200 px-4 py-3" type="number" min={1} value={link.questionOrder} onChange={(event) => updateLink(index, "questionOrder", Number(event.target.value))} />
                  </Field>
                  <button
                    type="button"
                    className="mt-6 rounded-2xl bg-rose-100 px-4 py-3 text-sm font-bold text-rose-700"
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
                className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-700"
                onClick={() => setQuestionLinks((prev) => [...prev, createLinkRow()])}
              >
                문항 연결 추가
              </button>
              <button className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-bold text-white" type="submit">
                {examMutation.isPending ? "생성 중..." : "시험 세트 저장"}
              </button>
            </div>
          </form>
        </Card>

        <Card title="시험 세트 목록" description="생성된 시험 세트와 연결된 문항 수를 확인합니다." className="xl:col-span-2">
          <div className="grid gap-3">
            {examsQuery.data?.length ? (
              examsQuery.data.map((exam) => (
                <div key={exam.id} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <p className="font-bold text-slate-900">
                    {exam.title} ({exam.versionName})
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    문항 수: {exam.questions.length} / 점수표: {exam.scoreTableId}
                  </p>
                </div>
              ))
            ) : (
              <EmptyState message="등록된 시험 세트가 없습니다." />
            )}
          </div>
        </Card>

        <Card title="학생 배정" description="학생에게 시험을 배정합니다." className="xl:col-span-2">
          <form
            className="grid gap-3 md:grid-cols-3"
            onSubmit={(event) => {
              event.preventDefault();
              assignmentMutation.mutate();
            }}
          >
            <Field label="시험 세트">
              <select className="rounded-2xl border border-slate-200 px-4 py-3" value={assignmentForm.examId} onChange={(e) => setAssignmentForm((prev) => ({ ...prev, examId: e.target.value }))}>
                <option value="">시험 선택</option>
                {examsQuery.data?.map((exam) => (
                  <option key={exam.id} value={exam.id}>
                    {exam.title} ({exam.versionName})
                  </option>
                ))}
              </select>
            </Field>
            <Field label="학생">
              <select className="rounded-2xl border border-slate-200 px-4 py-3" value={assignmentForm.studentId} onChange={(e) => setAssignmentForm((prev) => ({ ...prev, studentId: e.target.value }))}>
                <option value="">학생 선택</option>
                {studentsQuery.data?.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name} (#{student.id})
                  </option>
                ))}
              </select>
            </Field>
            <Field label="마감일시">
              <input className="rounded-2xl border border-slate-200 px-4 py-3" type="datetime-local" value={assignmentForm.dueAt} onChange={(e) => setAssignmentForm((prev) => ({ ...prev, dueAt: e.target.value }))} />
            </Field>
            <button className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-bold text-white md:col-span-3" type="submit">
              {assignmentMutation.isPending ? "배정 중..." : "학생에게 시험 배정"}
            </button>
          </form>
        </Card>
      </div>
    </PageShell>
  );

  function updateQuestionForm<K extends keyof QuestionPayload>(key: K, value: QuestionPayload[K]) {
    setQuestionForm((prev) => ({ ...prev, [key]: value }));
  }

  function updateLink<K extends keyof ExamQuestionLink>(index: number, key: K, value: ExamQuestionLink[K]) {
    setQuestionLinks((prev) => prev.map((row, rowIndex) => (rowIndex === index ? { ...row, [key]: value } : row)));
  }

  function removeLink(index: number) {
    setQuestionLinks((prev) => (prev.length === 1 ? prev : prev.filter((_, rowIndex) => rowIndex !== index)));
  }
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-slate-700">
      <span>{label}</span>
      {children}
    </label>
  );
}

function EmptyState({ message }: { message: string }) {
  return <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-600">{message}</div>;
}

import { apiRequest } from "../../lib/api";
import { authApi } from "../auth/api";
import type { AssignmentPayload, Exam, ExamPayload, LoginPayload, Question, QuestionPayload, Student } from "./types";

export const adminApi = {
  login: (payload: LoginPayload) => authApi.login(payload),
  getQuestions: (token: string) => apiRequest<Question[]>("/api/admin/questions", { token }),
  createQuestion: (token: string, payload: QuestionPayload) =>
    apiRequest<Question>("/api/admin/questions", {
      method: "POST",
      token,
      body: JSON.stringify(payload),
    }),
  getExams: (token: string) => apiRequest<Exam[]>("/api/admin/exams", { token }),
  createExam: (token: string, payload: ExamPayload) =>
    apiRequest<Exam>("/api/admin/exams", {
      method: "POST",
      token,
      body: JSON.stringify(payload),
    }),
  getStudents: (token: string) => apiRequest<Student[]>("/api/admin/students", { token }),
  createAssignment: (token: string, payload: AssignmentPayload) =>
    apiRequest("/api/admin/exams/assignments", {
      method: "POST",
      token,
      body: JSON.stringify(payload),
    }),
};

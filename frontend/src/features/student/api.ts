import { apiRequest } from "../../lib/api";
import type { AuthResponse } from "../auth/types";
import type {
  ModuleSubmitResponse,
  StudentAnswerPayload,
  StudentAssignment,
  StudentExamDetail,
  StudentResult,
} from "./types";

export const studentApi = {
  login: (payload: { loginId: string; password: string }) =>
    apiRequest<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  getAssignments: (token: string, studentId: number) =>
    apiRequest<StudentAssignment[]>(`/api/student/exams?studentId=${studentId}`, { token }),
  getAssignmentDetail: (token: string, assignmentId: number) =>
    apiRequest<StudentExamDetail>(`/api/student/exams/assignments/${assignmentId}`, { token }),
  startModule1: (token: string, assignmentId: number) =>
    apiRequest<StudentExamDetail>(`/api/student/exams/assignments/${assignmentId}/start`, {
      method: "POST",
      token,
    }),
  saveAnswer: (token: string, assignmentId: number, payload: StudentAnswerPayload) =>
    apiRequest<StudentExamDetail>(`/api/student/exams/assignments/${assignmentId}/answers`, {
      method: "POST",
      token,
      body: JSON.stringify(payload),
    }),
  submitModule1: (token: string, assignmentId: number, durationSeconds: number) =>
    apiRequest<ModuleSubmitResponse>(`/api/student/exams/assignments/${assignmentId}/module-1/submit`, {
      method: "POST",
      token,
      body: JSON.stringify({ durationSeconds }),
    }),
  startModule2: (token: string, assignmentId: number) =>
    apiRequest<StudentExamDetail>(`/api/student/exams/assignments/${assignmentId}/module-2/start`, {
      method: "POST",
      token,
    }),
  submitFinal: (token: string, assignmentId: number, durationSeconds: number) =>
    apiRequest<ModuleSubmitResponse>(`/api/student/exams/assignments/${assignmentId}/submit`, {
      method: "POST",
      token,
      body: JSON.stringify({ durationSeconds }),
    }),
  getResult: (token: string, assignmentId: number) =>
    apiRequest<StudentResult>(`/api/student/results/${assignmentId}`, { token }),
};

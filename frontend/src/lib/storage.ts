const ADMIN_TOKEN_KEY = "dsat-admin-token";
const STUDENT_TOKEN_KEY = "dsat-student-token";
const STUDENT_USER_KEY = "dsat-student-user";

export const storage = {
  getAdminToken: () => localStorage.getItem(ADMIN_TOKEN_KEY) ?? "",
  setAdminToken: (token: string) => localStorage.setItem(ADMIN_TOKEN_KEY, token),
  getStudentToken: () => localStorage.getItem(STUDENT_TOKEN_KEY) ?? "",
  setStudentToken: (token: string) => localStorage.setItem(STUDENT_TOKEN_KEY, token),
  getStudentUser: <T>() => {
    const raw = localStorage.getItem(STUDENT_USER_KEY);
    return raw ? (JSON.parse(raw) as T) : null;
  },
  setStudentUser: (user: unknown) => localStorage.setItem(STUDENT_USER_KEY, JSON.stringify(user)),
};

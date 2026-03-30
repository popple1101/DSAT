import { useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { authApi } from "../features/auth/api";
import { storage } from "../lib/storage";
import { BrandMark } from "../shared/BrandMark";
import { ButtonLink } from "../shared/ButtonLink";

type RoleMode = "student" | "admin";

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const role = (searchParams.get("role") === "admin" ? "admin" : "student") as RoleMode;
  const initialForm = useMemo(
    () =>
      role === "admin"
        ? { loginId: "manager", password: "1234" }
        : { loginId: "student01", password: "1234" },
    [role]
  );
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      if (role === "admin") {
        storage.setAdminToken(data.accessToken);
        storage.setAdminUser(data);
        navigate("/admin");
        return;
      }

      storage.setStudentToken(data.accessToken);
      storage.setStudentUser(data);
      navigate("/student");
    },
    onError: (error) => setMessage(error.message),
  });

  return (
    <section className="grid min-h-[calc(100vh-140px)] gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <div
        className="rounded-[38px] border px-6 py-7 shadow-[var(--shadow-soft)]"
        style={{
          borderColor: "var(--color-line)",
          background:
            "linear-gradient(145deg, rgba(16,38,79,0.96), rgba(23,53,111,0.92) 48%, rgba(183,122,60,0.88) 120%)",
        }}
      >
        <div className="flex h-full flex-col justify-between gap-8 text-white">
          <BrandMark />
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.34em] text-white/68">
              LML DSAT Portal
            </p>
            <h2 className="text-4xl font-black leading-tight tracking-tight md:text-5xl">
              브랜드는 LML,
              <span className="block text-[var(--color-brand-gold-soft)]">시스템은 DSAT</span>
            </h2>
            <p className="max-w-xl text-sm leading-7 text-white/78 md:text-base">
              학원 사이트의 신뢰감은 유지하고, 실제 로그인 이후에는 더 정돈된 학생 포털과 관리자 콘솔로
              이어지는 DSAT 진입 화면입니다.
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div
              className="rounded-[24px] border px-4 py-4"
              style={{ borderColor: "rgba(255,255,255,0.14)", background: "rgba(255,255,255,0.08)" }}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-white/58">Student</p>
              <p className="mt-2 text-sm leading-6 text-white/88">태블릿 우선 시험 응시와 결과 확인에 맞춘 학생 포털</p>
            </div>
            <div
              className="rounded-[24px] border px-4 py-4"
              style={{ borderColor: "rgba(255,255,255,0.14)", background: "rgba(255,255,255,0.08)" }}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-white/58">Admin</p>
              <p className="mt-2 text-sm leading-6 text-white/88">문제 등록, 시험 생성, 학생 배정을 위한 운영 콘솔</p>
            </div>
          </div>
        </div>
      </div>

      <div
        className="rounded-[38px] border px-6 py-7 shadow-[var(--shadow-soft)]"
        style={{
          borderColor: "var(--color-line)",
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(247,249,253,0.92) 58%, rgba(251,247,239,0.82))",
        }}
      >
        <div className="mx-auto flex h-full max-w-xl flex-col justify-center gap-6">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-brand-blue)]">
              Login
            </p>
            <h1 className="text-3xl font-black tracking-tight text-[var(--color-ink)] md:text-4xl">
              {role === "admin" ? "관리자 포털 로그인" : "학생 포털 로그인"}
            </h1>
            <p className="text-sm leading-7 text-[var(--color-text-soft)]">
              {role === "admin"
                ? "운영자는 문제 등록, 시험 생성, 학생 배정을 위한 관리자 콘솔로 이동합니다."
                : "학생은 배정된 시험 확인, 응시, 결과 조회를 위한 포털로 이동합니다."}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                role === "student"
                  ? "bg-[var(--color-brand-navy)] text-white"
                  : "bg-white text-[var(--color-brand-navy)] ring-1 ring-[var(--color-line)]"
              }`}
              onClick={() => {
                setSearchParams({ role: "student" });
                setForm({ loginId: "student01", password: "1234" });
              }}
            >
              학생 로그인
            </button>
            <button
              type="button"
              className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                role === "admin"
                  ? "bg-[var(--color-brand-navy)] text-white"
                  : "bg-white text-[var(--color-brand-navy)] ring-1 ring-[var(--color-line)]"
              }`}
              onClick={() => {
                setSearchParams({ role: "admin" });
                setForm({ loginId: "manager", password: "1234" });
              }}
            >
              관리자 로그인
            </button>
          </div>

          {message ? (
            <div className="rounded-[24px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {message}
            </div>
          ) : null}

          <form
            className="grid gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              setMessage("");
              loginMutation.mutate(form);
            }}
          >
            <Field label="로그인 아이디">
              <input
                className="rounded-[22px] border border-[var(--color-line)] bg-white px-4 py-3 text-[var(--color-ink)] outline-none transition focus:border-[var(--color-brand-blue)]"
                value={form.loginId}
                onChange={(event) => setForm((prev) => ({ ...prev, loginId: event.target.value }))}
              />
            </Field>
            <Field label="비밀번호">
              <input
                className="rounded-[22px] border border-[var(--color-line)] bg-white px-4 py-3 text-[var(--color-ink)] outline-none transition focus:border-[var(--color-brand-blue)]"
                type="password"
                value={form.password}
                onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
              />
            </Field>
            <button
              className="rounded-full bg-[var(--color-brand-navy)] px-5 py-3 text-sm font-bold text-white transition hover:bg-[var(--color-brand-navy-strong)]"
              type="submit"
            >
              {loginMutation.isPending ? "로그인 중..." : "포털 입장"}
            </button>
          </form>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <Link to="/" className="text-sm font-semibold text-[var(--color-brand-navy)]">
              홈으로 돌아가기
            </Link>
            <ButtonLink to="/signup" tone="ghost">
              학생 회원가입
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
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

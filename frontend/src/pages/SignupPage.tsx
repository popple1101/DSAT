import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../features/auth/api";
import { storage } from "../lib/storage";
import { BrandMark } from "../shared/BrandMark";
import { ButtonLink } from "../shared/ButtonLink";

export function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    loginId: "",
    password: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");

  const signupMutation = useMutation({
    mutationFn: authApi.signup,
    onSuccess: (data) => {
      storage.setStudentToken(data.accessToken);
      storage.setStudentUser(data);
      navigate("/student");
    },
    onError: (error) => setMessage(error.message),
  });

  return (
    <section className="grid min-h-[calc(100vh-140px)] gap-6 lg:grid-cols-[0.88fr_1.12fr]">
      <div
        className="rounded-[38px] border px-6 py-7 shadow-[var(--shadow-soft)]"
        style={{
          borderColor: "var(--color-line)",
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(247,249,253,0.92) 58%, rgba(251,247,239,0.82))",
        }}
      >
        <div className="flex h-full flex-col justify-between gap-8">
          <BrandMark />
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-brand-blue)]">
              Signup
            </p>
            <h1 className="text-4xl font-black leading-tight tracking-tight text-[var(--color-ink)] md:text-5xl">
              학생 계정을 먼저 만들고
              <span className="block text-[var(--color-brand-navy)]">DSAT 포털에 입장합니다.</span>
            </h1>
            <p className="max-w-xl text-sm leading-7 text-[var(--color-text-soft)] md:text-base">
              1차 MVP에서는 signup code 없이 학생이 직접 회원가입할 수 있도록 단순화했습니다. 이후 운영
              정책이 바뀌면 코드 기반 가입 구조로 확장할 수 있습니다.
            </p>
          </div>

          <div className="space-y-3">
            {[
              "학생 이름, 로그인 아이디, 비밀번호만으로 빠르게 계정 생성",
              "가입 후 바로 학생 포털로 이동",
              "배정된 시험이 있으면 즉시 응시 가능",
            ].map((line) => (
              <div
                key={line}
                className="rounded-[22px] border px-4 py-4 text-sm leading-7 text-[var(--color-text)]"
                style={{ borderColor: "var(--color-line)", background: "rgba(255,255,255,0.72)" }}
              >
                {line}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        className="rounded-[38px] border px-6 py-7 shadow-[var(--shadow-soft)]"
        style={{
          borderColor: "var(--color-line)",
          background:
            "linear-gradient(145deg, rgba(16,38,79,0.96), rgba(23,53,111,0.92) 48%, rgba(183,122,60,0.88) 120%)",
        }}
      >
        <div className="mx-auto flex h-full max-w-xl flex-col justify-center gap-6 text-white">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/62">Create account</p>
            <h2 className="text-3xl font-black tracking-tight md:text-4xl">LML DSAT Student Signup</h2>
            <p className="text-sm leading-7 text-white/76">
              학생 포털 회원가입은 가볍게 시작하고, 실제 시험 운영은 배정 이후 학생 대시보드에서 이어집니다.
            </p>
          </div>

          {message ? (
            <div className="rounded-[24px] border border-white/20 bg-white/10 px-4 py-3 text-sm text-white">
              {message}
            </div>
          ) : null}

          <form
            className="grid gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              setMessage("");

              if (form.password !== form.confirmPassword) {
                setMessage("비밀번호 확인이 일치하지 않습니다.");
                return;
              }

              signupMutation.mutate({
                name: form.name,
                loginId: form.loginId,
                password: form.password,
              });
            }}
          >
            <Field label="학생 이름">
              <input
                className="rounded-[22px] border border-white/16 bg-white/10 px-4 py-3 text-white outline-none placeholder:text-white/45 focus:border-white/34"
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="김학생"
              />
            </Field>
            <Field label="로그인 아이디">
              <input
                className="rounded-[22px] border border-white/16 bg-white/10 px-4 py-3 text-white outline-none placeholder:text-white/45 focus:border-white/34"
                value={form.loginId}
                onChange={(event) => setForm((prev) => ({ ...prev, loginId: event.target.value }))}
                placeholder="student01"
              />
            </Field>
            <Field label="비밀번호">
              <input
                className="rounded-[22px] border border-white/16 bg-white/10 px-4 py-3 text-white outline-none placeholder:text-white/45 focus:border-white/34"
                type="password"
                value={form.password}
                onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
              />
            </Field>
            <Field label="비밀번호 확인">
              <input
                className="rounded-[22px] border border-white/16 bg-white/10 px-4 py-3 text-white outline-none placeholder:text-white/45 focus:border-white/34"
                type="password"
                value={form.confirmPassword}
                onChange={(event) => setForm((prev) => ({ ...prev, confirmPassword: event.target.value }))}
              />
            </Field>
            <button
              className="rounded-full bg-white px-5 py-3 text-sm font-bold text-[var(--color-brand-navy)] transition hover:bg-[var(--color-brand-cream)]"
              type="submit"
            >
              {signupMutation.isPending ? "가입 처리 중..." : "학생 계정 만들기"}
            </button>
          </form>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <Link to="/login?role=student" className="text-sm font-semibold text-white">
              이미 계정이 있다면 로그인
            </Link>
            <ButtonLink to="/" tone="ghost">
              홈으로 이동
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-white">
      <span>{label}</span>
      {children}
    </label>
  );
}

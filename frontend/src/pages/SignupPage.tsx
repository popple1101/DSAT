import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../features/auth/api";
import { storage } from "../lib/storage";

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
    <section className="mx-auto grid min-h-[calc(100vh-140px)] max-w-[760px] content-center">
      <div
        className="rounded-[34px] border px-6 py-8 shadow-[var(--shadow-soft)]"
        style={{
          borderColor: "var(--color-line)",
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.98), rgba(247,249,253,0.94) 58%, rgba(251,247,239,0.84))",
        }}
      >
        <div className="mx-auto grid max-w-[420px] gap-5">
          <div>
            <h1 className="text-3xl font-black text-[var(--color-ink)]">Sign up</h1>
            <p className="mt-1 text-sm text-[var(--color-text-soft)]">please enter all information</p>
          </div>

          {message ? (
            <div className="rounded-[20px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {message}
            </div>
          ) : null}

          <form
            className="grid gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              setMessage("");

              if (form.password !== form.confirmPassword) {
                setMessage("비밀번호가 일치하지 않습니다.");
                return;
              }

              signupMutation.mutate({
                name: form.name,
                loginId: form.loginId,
                password: form.password,
              });
            }}
          >
            <Field label="Name">
              <input
                className={inputClass}
                placeholder="Name"
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              />
            </Field>
            <Field label="ID">
              <input
                className={inputClass}
                placeholder="ID"
                value={form.loginId}
                onChange={(event) => setForm((prev) => ({ ...prev, loginId: event.target.value }))}
              />
            </Field>
            <Field label="Password">
              <input
                className={inputClass}
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
              />
            </Field>
            <Field label="Confirm Password">
              <input
                className={inputClass}
                type="password"
                placeholder="Confirm Password"
                value={form.confirmPassword}
                onChange={(event) => setForm((prev) => ({ ...prev, confirmPassword: event.target.value }))}
              />
            </Field>
            <button className={primaryButtonClass} type="submit">
              {signupMutation.isPending ? "Loading..." : "Next"}
            </button>
          </form>

          <div className="grid gap-2 text-sm font-semibold text-[var(--color-brand-navy)]">
            <Link to="/login?role=student">
              Already have an account? <span className="font-black">Login</span>
            </Link>
            <Link to="/">Back</Link>
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

const inputClass =
  "rounded-[12px] border border-[var(--color-line)] bg-white px-4 py-3 text-[var(--color-ink)] outline-none transition focus:border-[var(--color-brand-blue)]";

const primaryButtonClass =
  "rounded-[12px] bg-[var(--color-brand-gold-soft)] px-5 py-3 text-base font-bold text-[var(--color-brand-navy)] transition hover:brightness-95";

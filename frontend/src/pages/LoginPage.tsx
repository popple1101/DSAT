import { useEffect, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { authApi } from "../features/auth/api";
import { storage } from "../lib/storage";

type RoleMode = "student" | "admin";

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const role = (searchParams.get("role") === "admin" ? "admin" : "student") as RoleMode;
  const [form, setForm] = useState(
    role === "admin"
      ? { loginId: "manager", password: "1234" }
      : { loginId: "student01", password: "1234" }
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    setForm(
      role === "admin"
        ? { loginId: "manager", password: "1234" }
        : { loginId: "student01", password: "1234" }
    );
  }, [role]);

  const title = useMemo(() => (role === "admin" ? "관리자 로그인" : "학생 로그인"), [role]);

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
          <h1 className="text-3xl font-black text-[var(--color-ink)]">{title}</h1>

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
              loginMutation.mutate(form);
            }}
          >
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
            <button className={primaryButtonClass} type="submit">
              {loginMutation.isPending ? "Loading..." : "Login"}
            </button>
          </form>

          <div className="grid gap-2 text-sm font-semibold text-[var(--color-brand-navy)]">
            {role === "student" ? (
              <Link to="/signup">
                First time here? <span className="font-black">Sign up</span>
              </Link>
            ) : null}
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

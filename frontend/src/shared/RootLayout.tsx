import { Outlet, NavLink } from "react-router-dom";
import { BrandMark } from "./BrandMark";

const navClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-full px-4 py-2 text-sm font-semibold transition ${
    isActive
      ? "bg-[var(--color-brand-navy)] text-white shadow-[var(--shadow-brand)]"
      : "bg-white/78 text-[var(--color-brand-navy)] hover:bg-white"
  }`;

export function RootLayout() {
  return (
    <div className="min-h-screen text-[var(--color-text)]">
      <div className="mx-auto flex min-h-screen max-w-[1440px] flex-col px-4 py-6 md:px-6 lg:px-8">
        <header
          className="mb-6 flex flex-col gap-4 rounded-[34px] border px-5 py-5 shadow-[var(--shadow-soft)] backdrop-blur md:flex-row md:items-center md:justify-between"
          style={{
            borderColor: "var(--color-line)",
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(247,249,253,0.92) 58%, rgba(251,247,239,0.84))",
          }}
        >
          <BrandMark compact />
          <nav className="flex flex-wrap gap-2">
            <NavLink to="/" className={navClass} end>
              홈
            </NavLink>
            <NavLink to="/admin" className={navClass}>
              관리자
            </NavLink>
            <NavLink to="/student" className={navClass}>
              학생
            </NavLink>
          </nav>
        </header>
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

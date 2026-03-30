import { Outlet, NavLink } from "react-router-dom";

const navClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-full px-4 py-2 text-sm font-semibold transition ${
    isActive ? "bg-slate-900 text-white" : "bg-white/70 text-slate-700 hover:bg-white"
  }`;

export function RootLayout() {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#eef2ff_0%,#f8fafc_100%)] text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-6 md:px-6">
        <header className="mb-6 flex flex-col gap-4 rounded-[28px] border border-slate-200/80 bg-white/85 px-6 py-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur md:flex-row md:items-center md:justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
              DSAT Frontend
            </p>
            <h1 className="text-3xl font-black tracking-tight">PC/Tablet Ready LMS</h1>
          </div>
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

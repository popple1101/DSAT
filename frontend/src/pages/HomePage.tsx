import { Link } from "react-router-dom";
import { PageShell } from "../shared/PageShell";
import { Card } from "../shared/Card";

export function HomePage() {
  return (
    <PageShell
      eyebrow="Launchpad"
      title="DSAT 1차 MVP 프론트 앱"
      description="React + TypeScript + Vite + React Router + TanStack Query + Tailwind 조합으로 관리자 PC 화면과 학생 태블릿 응시 화면을 함께 운영할 수 있게 준비한 구조입니다."
      actions={
        <>
          <Link to="/admin" className="rounded-full bg-slate-900 px-4 py-2 text-sm font-bold text-white">
            관리자 화면
          </Link>
          <Link to="/student" className="rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-900 ring-1 ring-slate-200">
            학생 화면
          </Link>
        </>
      }
    >
      <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <Card
          title="왜 이 스택인가"
          description="Spring API 서버가 이미 있으므로 SSR보다 빠르게 붙는 SPA 구조가 유리하고, 학생 시험 화면은 태블릿 우선 레이아웃과 터치 친화 인터랙션이 핵심입니다."
        >
          <ul className="space-y-3 text-sm leading-7 text-slate-700">
            <li>React + TS: 관리자/학생/결과 화면을 타입 안정성 있게 분리</li>
            <li>Vite: 빠른 개발 서버와 가벼운 세팅</li>
            <li>React Router: 관리자, 학생, 결과 흐름 분리</li>
            <li>TanStack Query: 시험 목록, 문제, 결과 같은 서버 상태 관리</li>
            <li>Tailwind: PC/태블릿 레이아웃을 빠르게 조정</li>
          </ul>
        </Card>
        <Card
          title="다음 이관 순서"
          description="기존 static 화면 로직을 이 구조로 점진적으로 옮기는 순서를 먼저 잡아뒀습니다."
        >
          <ol className="space-y-3 text-sm leading-7 text-slate-700">
            <li>1. 관리자 로그인/문제 등록 폼 React 컴포넌트화</li>
            <li>2. 시험 세트 생성 및 학생 배정 폼 연결</li>
            <li>3. 학생 로그인 및 배정 시험 목록 연결</li>
            <li>4. 태블릿 우선 문제 풀이 레이아웃 정리</li>
            <li>5. 결과표 화면과 문항별 표 구조 이관</li>
          </ol>
        </Card>
      </div>
    </PageShell>
  );
}

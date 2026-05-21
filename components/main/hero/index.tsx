"use client"

import { TextRotate } from "./TextRotate"

const ROTATING_TEXTS = [
  "🎨 그림일기로",
  "⚡ AI 아트로",
  "📸 추억으로",
  "🖼️ 작품으로",
]

/* ── SVG: 텍스트 → AI → 그림일기 변환 과정 일러스트 ── */
function DiaryIllustration() {
  return (
    <svg
      viewBox="0 0 720 260"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full max-w-2xl"
      aria-label="텍스트가 AI를 통해 그림일기로 변환되는 과정"
    >
      <defs>
        <linearGradient id="grad-purple" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#4f46e5" />
        </linearGradient>
        <linearGradient id="grad-card" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1e1b4b" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#0f0e1a" stopOpacity="0.9" />
        </linearGradient>
        <linearGradient id="grad-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#312e81" />
          <stop offset="100%" stopColor="#1e1b4b" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <radialGradient id="ai-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* ── 카드 1: 텍스트 입력 ── */}
      <rect x="8" y="30" width="188" height="200" rx="16" fill="url(#grad-card)" stroke="#3730a3" strokeWidth="1.5" />
      {/* 카드 상단 헤더 */}
      <rect x="8" y="30" width="188" height="40" rx="16" fill="#1e1b4b" />
      <rect x="8" y="54" width="188" height="16" fill="#1e1b4b" />
      {/* 세 점 */}
      <circle cx="30" cy="50" r="5" fill="#ef4444" />
      <circle cx="46" cy="50" r="5" fill="#f59e0b" />
      <circle cx="62" cy="50" r="5" fill="#22c55e" />
      {/* 텍스트 라인들 */}
      <rect x="24" y="88" width="120" height="8" rx="4" fill="#4338ca" opacity="0.7" />
      <rect x="24" y="106" width="148" height="8" rx="4" fill="#4338ca" opacity="0.5" />
      <rect x="24" y="124" width="100" height="8" rx="4" fill="#4338ca" opacity="0.5" />
      <rect x="24" y="142" width="136" height="8" rx="4" fill="#4338ca" opacity="0.4" />
      <rect x="24" y="160" width="80" height="8" rx="4" fill="#4338ca" opacity="0.4" />
      {/* 커서 깜빡임 */}
      <rect x="24" y="178" width="3" height="14" rx="1.5" fill="#818cf8">
        <animate attributeName="opacity" values="1;0;1" dur="1.2s" repeatCount="indefinite" />
      </rect>
      {/* 라벨 */}
      <text x="102" y="225" textAnchor="middle" fill="#6366f1" fontSize="12" fontFamily="system-ui" fontWeight="600">일기 작성</text>

      {/* ── 화살표 1 ── */}
      <g opacity="0.8">
        <line x1="205" y1="130" x2="248" y2="130" stroke="#6366f1" strokeWidth="2" strokeDasharray="4 3">
          <animate attributeName="stroke-dashoffset" from="14" to="0" dur="1s" repeatCount="indefinite" />
        </line>
        <polygon points="248,124 260,130 248,136" fill="#6366f1" />
      </g>

      {/* ── 카드 2: AI 처리 ── */}
      {/* AI glow 배경 */}
      <ellipse cx="360" cy="130" rx="80" ry="80" fill="url(#ai-glow)">
        <animate attributeName="rx" values="80;90;80" dur="3s" repeatCount="indefinite" />
        <animate attributeName="ry" values="80;90;80" dur="3s" repeatCount="indefinite" />
      </ellipse>
      <rect x="268" y="30" width="184" height="200" rx="16" fill="url(#grad-card)" stroke="#6d28d9" strokeWidth="1.5" />
      {/* AI 뇌 SVG */}
      <g transform="translate(360,115)">
        {/* 중앙 원 */}
        <circle cx="0" cy="0" r="32" fill="#2e1065" stroke="#7c3aed" strokeWidth="2" />
        {/* 신경망 노드들 */}
        <circle cx="0" cy="0" r="8" fill="#7c3aed">
          <animate attributeName="r" values="8;10;8" dur="2s" repeatCount="indefinite" />
        </circle>
        {/* 연결선 */}
        <line x1="0" y1="0" x2="-20" y2="-18" stroke="#a78bfa" strokeWidth="1.5" opacity="0.7" />
        <line x1="0" y1="0" x2="20" y2="-18" stroke="#a78bfa" strokeWidth="1.5" opacity="0.7" />
        <line x1="0" y1="0" x2="-22" y2="14" stroke="#a78bfa" strokeWidth="1.5" opacity="0.7" />
        <line x1="0" y1="0" x2="22" y2="14" stroke="#a78bfa" strokeWidth="1.5" opacity="0.7" />
        <line x1="0" y1="0" x2="0" y2="-26" stroke="#a78bfa" strokeWidth="1.5" opacity="0.7" />
        {/* 외부 노드 */}
        <circle cx="-20" cy="-18" r="5" fill="#4f46e5">
          <animate attributeName="opacity" values="1;0.4;1" dur="1.5s" begin="0s" repeatCount="indefinite" />
        </circle>
        <circle cx="20" cy="-18" r="5" fill="#4f46e5">
          <animate attributeName="opacity" values="1;0.4;1" dur="1.5s" begin="0.3s" repeatCount="indefinite" />
        </circle>
        <circle cx="-22" cy="14" r="5" fill="#4f46e5">
          <animate attributeName="opacity" values="1;0.4;1" dur="1.5s" begin="0.6s" repeatCount="indefinite" />
        </circle>
        <circle cx="22" cy="14" r="5" fill="#4f46e5">
          <animate attributeName="opacity" values="1;0.4;1" dur="1.5s" begin="0.9s" repeatCount="indefinite" />
        </circle>
        <circle cx="0" cy="-26" r="5" fill="#4f46e5">
          <animate attributeName="opacity" values="1;0.4;1" dur="1.5s" begin="1.2s" repeatCount="indefinite" />
        </circle>
        {/* 회전하는 링 */}
        <circle cx="0" cy="0" r="32" fill="none" stroke="#7c3aed" strokeWidth="1" strokeDasharray="6 4" opacity="0.5">
          <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="8s" repeatCount="indefinite" />
        </circle>
      </g>
      <text x="360" y="215" textAnchor="middle" fill="#a78bfa" fontSize="12" fontFamily="system-ui" fontWeight="600">AI 분석 중</text>
      <text x="360" y="228" textAnchor="middle" fill="#6d28d9" fontSize="10" fontFamily="system-ui">Diary AI</text>

      {/* ── 화살표 2 ── */}
      <g opacity="0.8">
        <line x1="460" y1="130" x2="503" y2="130" stroke="#6366f1" strokeWidth="2" strokeDasharray="4 3">
          <animate attributeName="stroke-dashoffset" from="14" to="0" dur="1s" repeatCount="indefinite" />
        </line>
        <polygon points="503,124 515,130 503,136" fill="#6366f1" />
      </g>

      {/* ── 카드 3: 그림일기 결과 ── */}
      <rect x="524" y="30" width="188" height="200" rx="16" fill="url(#grad-card)" stroke="#3730a3" strokeWidth="1.5" />
      {/* 그림 영역 */}
      <rect x="540" y="46" width="156" height="100" rx="10" fill="url(#grad-sky)" />
      {/* 하늘 - 구름 */}
      <ellipse cx="575" cy="72" rx="22" ry="12" fill="white" opacity="0.15" />
      <ellipse cx="590" cy="68" rx="18" ry="10" fill="white" opacity="0.2" />
      <ellipse cx="640" cy="65" rx="20" ry="11" fill="white" opacity="0.15" />
      <ellipse cx="655" cy="61" rx="16" ry="9" fill="white" opacity="0.2" />
      {/* 태양 */}
      <circle cx="668" cy="60" r="12" fill="#fbbf24" opacity="0.8" />
      <line x1="668" y1="44" x2="668" y2="40" stroke="#fbbf24" strokeWidth="2" opacity="0.6" />
      <line x1="682" y1="46" x2="685" y2="43" stroke="#fbbf24" strokeWidth="2" opacity="0.6" />
      {/* 산 */}
      <polygon points="540,146 575,95 610,146" fill="#312e81" opacity="0.8" />
      <polygon points="580,146 618,100 656,146" fill="#1e1b4b" opacity="0.9" />
      {/* 눈 */}
      <polygon points="566,110 575,95 584,110" fill="white" opacity="0.6" />
      <polygon points="606,117 618,100 630,117" fill="white" opacity="0.6" />
      {/* 땅 */}
      <rect x="540" y="136" width="156" height="10" rx="0" fill="#14532d" opacity="0.6" />
      {/* 나무 */}
      <rect x="552" y="118" width="5" height="18" rx="2" fill="#92400e" opacity="0.8" />
      <ellipse cx="554" cy="114" rx="9" ry="10" fill="#166534" opacity="0.8" />
      <rect x="672" y="120" width="5" height="16" rx="2" fill="#92400e" opacity="0.8" />
      <ellipse cx="674" cy="116" rx="9" ry="10" fill="#166534" opacity="0.8" />
      {/* 일기 텍스트 라인 */}
      <rect x="540" y="158" width="100" height="6" rx="3" fill="#4338ca" opacity="0.6" />
      <rect x="540" y="170" width="140" height="6" rx="3" fill="#4338ca" opacity="0.4" />
      <rect x="540" y="182" width="80" height="6" rx="3" fill="#4338ca" opacity="0.4" />
      {/* 완료 체크 */}
      <circle cx="672" cy="175" r="12" fill="#059669" opacity="0.9" />
      <polyline points="665,175 670,181 679,168" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <text x="618" y="225" textAnchor="middle" fill="#34d399" fontSize="12" fontFamily="system-ui" fontWeight="600">그림일기 완성</text>
    </svg>
  )
}

export default function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0a0a0f] px-6 pt-16 text-center">

      {/* ── 배경 그라디언트 orbs ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full bg-violet-600/20 blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full bg-indigo-600/20 blur-[120px]" />
        <div className="absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/10 blur-[80px]" />
      </div>

      {/* ── 그리드 오버레이 ── */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* ── 메인 콘텐츠 ── */}
      <div className="relative z-10 flex flex-col items-center gap-8 w-full max-w-4xl">

        {/* 뱃지 */}
        <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-sm text-violet-300 backdrop-blur-sm">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-violet-500" />
          </span>
          AI 그림일기 생성 서비스
        </div>

        {/* 제목 */}
        <h1 className="flex flex-col items-center gap-3 text-5xl font-bold leading-tight tracking-tight text-white md:text-7xl">
          <span>오늘의 이야기를</span>
          <span>
            <TextRotate
              texts={ROTATING_TEXTS}
              rotationInterval={2500}
              staggerDuration={0.03}
              staggerFrom="first"
              splitBy="characters"
              transition={{ type: "spring", damping: 20, stiffness: 200 }}
              mainClassName="inline-flex justify-center"
              elementLevelClassName="bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent"
            />
          </span>
          <span>바꿔드려요</span>
        </h1>

        {/* 서브 텍스트 */}
        <p className="max-w-xl text-lg leading-relaxed text-zinc-400">
          글 몇 줄이면 충분해요. <span className="text-violet-300 font-medium">J-urnal</span>이 당신의 하루를
          <br />
          아름다운 그림일기로 만들어 드립니다.
        </p>

        {/* CTA 버튼 */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <a
            href="/create"
            id="cta-create"
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-violet-500/30 transition-all duration-300 hover:scale-105 hover:shadow-violet-500/50"
          >
            <span className="relative z-10">그림일기 만들기</span>
            {/* 화살표 SVG */}
            <svg
              className="relative z-10 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-violet-500 to-purple-500 transition-transform duration-300 group-hover:translate-x-0" />
          </a>

          <a
            href="/gallery"
            id="cta-gallery"
            className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-8 py-3.5 text-base font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:bg-white/10 hover:scale-105"
          >
            {/* 갤러리 SVG */}
            <svg
              className="h-4 w-4 text-zinc-400 transition-colors group-hover:text-violet-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            갤러리 보기
          </a>
        </div>

        {/* ── SVG 일러스트: 변환 과정 ── */}
        <div className="mt-4 flex w-full justify-center">
          <DiaryIllustration />
        </div>

        {/* 통계 */}
        <div className="flex items-center gap-8 text-sm text-zinc-500">
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl font-bold text-white">30초</span>
            <span>그림 생성 시간</span>
          </div>
          <div className="h-8 w-px bg-zinc-800" />
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl font-bold text-white">AI</span>
            <span>최신 이미지 모델</span>
          </div>
          <div className="h-8 w-px bg-zinc-800" />
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl font-bold text-white">무제한</span>
            <span>일기 저장</span>
          </div>
        </div>
      </div>


    </section>
  )
}

"use client"

import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState, Suspense } from "react"

function AuthPageContent() {
    const { signInWithGoogle, user, loading } = useAuth()
    const router = useRouter()
    const searchParams = useSearchParams()
    const [isSigningIn, setIsSigningIn] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // 이미 로그인된 경우 대시보드로 리다이렉트
    useEffect(() => {
        if (!loading && user) {
            router.replace("/dashboard")
        }
    }, [user, loading, router])

    // URL에 에러 파라미터가 있는 경우
    useEffect(() => {
        const errorParam = searchParams.get("error")
        if (errorParam) {
            setError("로그인 중 문제가 발생했습니다. 다시 시도해주세요.")
        }
    }, [searchParams])

    const handleGoogleLogin = async () => {
        try {
            setIsSigningIn(true)
            setError(null)
            await signInWithGoogle()
        } catch {
            setError("Google 로그인에 실패했습니다. 다시 시도해주세요.")
            setIsSigningIn(false)
        }
    }

    return (
        <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0a0a0f] px-6 text-center">
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

            {/* ── 뒤로가기 (홈으로) 버튼 ── */}
            <div className="absolute top-6 left-6 z-20">
                <Link
                    href="/"
                    className="group inline-flex items-center gap-2 rounded-full border border-white/5 bg-white/5 px-4 py-2 text-sm font-medium text-zinc-400 backdrop-blur-sm transition-all duration-300 hover:border-white/10 hover:bg-white/10 hover:text-white"
                >
                    <svg
                        className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <line x1="19" y1="12" x2="5" y2="12" />
                        <polyline points="12 19 5 12 12 5" />
                    </svg>
                    돌아가기
                </Link>
            </div>

            {/* ── 로그인 카드 ── */}
            <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-zinc-900/50 p-8 shadow-2xl backdrop-blur-xl md:p-10">
                {/* 상단 텍스트 및 로고 */}
                <div className="flex flex-col items-center gap-6">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 shadow-lg shadow-violet-500/30">
                        {/* 임시 로고 대체용 텍스트 또는 아이콘 */}
                        <span className="text-3xl font-black text-white">J</span>
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight text-white">
                            환영합니다!
                        </h1>
                        <p className="text-zinc-400">
                            <span className="font-semibold text-white">J<span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">-urnal</span></span>에 로그인하여 나만의 AI 그림일기를 시작해 보세요.
                        </p>
                    </div>
                </div>

                {/* ── 에러 메시지 ── */}
                {error && (
                    <div className="mt-6 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                        {error}
                    </div>
                )}

                {/* ── 구글 로그인 버튼 ── */}
                <div className="mt-10">
                    <button
                        id="google-signin-btn"
                        onClick={handleGoogleLogin}
                        disabled={isSigningIn || loading}
                        className="group relative flex w-full items-center justify-center gap-3 rounded-full border border-white/10 bg-white/5 py-2.5 text-base font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:border-violet-500/50 hover:bg-white/75 hover:shadow-lg hover:shadow-violet-500/10 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
                    >
                        {isSigningIn ? (
                            <>
                                {/* 로딩 스피너 */}
                                <svg
                                    className="h-5 w-5 animate-spin text-violet-400"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    />
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    />
                                </svg>
                                로그인 중...
                            </>
                        ) : (
                            <>
                                {/* 구글 G 아이콘 (SVG) */}
                                <svg
                                    className="h-5 w-5"
                                    viewBox="0 0 24 24"
                                    width="24"
                                    height="24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <g transform="matrix(1, 0, 0, 1, 0, 0)">
                                        <path
                                            d="M21.35,11.1H12v2.7h5.38c-0.24,1.28 -0.96,2.37 -2.04,3.1v2.57h3.3c1.93,-1.78 3.04,-4.4 3.04,-7.48c0,-0.61 -0.06,-1.2 -0.16,-1.79Z"
                                            fill="#4285F4"
                                        />
                                        <path
                                            d="M12,20.62c2.43,0 4.47,-0.81 5.96,-2.19l-3.3,-2.57c-0.91,0.61 -2.08,0.98 -3.33,0.98c-2.33,0 -4.3,-1.57 -5.01,-3.69H2.9v2.66c1.48,2.94 4.51,4.82 8.1,4.82Z"
                                            fill="#34A853"
                                        />
                                        <path
                                            d="M6.99,13.15c-0.18,-0.53 -0.28,-1.1 -0.28,-1.69c0,-0.59 0.1,-1.16 0.28,-1.69V7.11H2.9c-0.61,1.22 -0.96,2.6 -0.96,4.06c0,1.46 0.35,2.84 0.96,4.06l4.09,-2.68Z"
                                            fill="#FBBC05"
                                        />
                                        <path
                                            d="M12,6.38c1.32,0 2.5,0.45 3.44,1.35l2.58,-2.58C16.46,3.69 14.42,2.91 12,2.91c-3.59,0 -6.62,1.88 -8.1,4.82l4.09,2.68c0.71,-2.12 2.68,-3.69 5.01,-3.69Z"
                                            fill="#EA4335"
                                        />
                                    </g>
                                </svg>
                                Google 계정으로 시작하기
                            </>
                        )}
                    </button>
                </div>

                {/* ── 안내 문구 ── */}
                <div className="mt-8 text-xs text-zinc-500">
                    로그인 시 J-urnal의{" "}
                    <Link href="/terms" className="underline hover:text-zinc-400">
                        이용약관
                    </Link>{" "}
                    및{" "}
                    <Link href="/privacy" className="underline hover:text-zinc-400">
                        개인정보처리방침
                    </Link>
                    에 동의하게 됩니다.
                </div>
            </div>
        </section>
    )
}

export default function AuthPage() {
    return (
        <Suspense>
            <AuthPageContent />
        </Suspense>
    )
}

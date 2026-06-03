"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { BorderBeam } from "@/components/ui/border-beam"
import { useAuth } from "@/contexts/AuthContext"
import { createClient } from "@/lib/supabase/client"

interface PricingModalProps {
    isOpen: boolean
    onClose: () => void
}

const plans = [
    {
        name: "Pro",
        price: 20,
        credits: 100,
        gradient: "from-violet-500 to-indigo-500",
        glow: "rgba(139,92,246,0.15)",
        border: "border-violet-500/20",
        productIdEnv: "pro",
    },
    {
        name: "Ultra",
        price: 45,
        credits: 300,
        gradient: "from-cyan-400 to-emerald-400",
        glow: "rgba(34,211,238,0.15)",
        border: "border-cyan-400/20",
        productIdEnv: "ultra",
    },
] as const

// Product IDs are injected at build time via NEXT_PUBLIC_ prefix
const PRODUCT_IDS: Record<string, string> = {
    pro: process.env.NEXT_PUBLIC_POLAR_PRO_PRODUCT_ID ?? "",
    ultra: process.env.NEXT_PUBLIC_POLAR_ULTRA_PRODUCT_ID ?? "",
}

export default function PricingModal({ isOpen, onClose }: PricingModalProps) {
    const { user } = useAuth()
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
    const [currentPlan, setCurrentPlan] = useState<string | null>(null)
    const [loadingPortal, setLoadingPortal] = useState(false)

    // 현재 사용자 플랜 조회
    useEffect(() => {
        if (!isOpen || !user) return
        const supabase = createClient()
        const fetchPlan = async () => {
            const { data } = await supabase
                .from("users")
                .select("plan")
                .eq("id", user.id)
                .single()
            if (data) setCurrentPlan(data.plan ?? "free")
        }
        fetchPlan()
    }, [isOpen, user])

    // ESC 키로 닫기
    useEffect(() => {
        if (!isOpen) return
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose()
        }
        window.addEventListener("keydown", onKey)
        return () => window.removeEventListener("keydown", onKey)
    }, [isOpen, onClose])

    const handleCheckout = (planKey: "pro" | "ultra") => {
        const productId = PRODUCT_IDS[planKey]
        if (!productId) {
            console.error(`Product ID for ${planKey} is not configured.`)
            return
        }
        setLoadingPlan(planKey)

        const params = new URLSearchParams({ products: productId })
        if (user?.email) params.set("customerEmail", user.email)

        // /api/checkout → Polar Checkout handler가 리다이렉트
        window.location.href = `/api/checkout?${params.toString()}`
    }

    const handleManageSubscription = () => {
        setLoadingPortal(true)
        window.open("/api/customer-portal", "_blank")
        setTimeout(() => setLoadingPortal(false), 3000)
    }

    // 현재 플랜이 free가 아닌 유료 구독인지 확인
    const hasActivePaidPlan =
        currentPlan &&
        currentPlan.toLowerCase() !== "free" &&
        currentPlan.toLowerCase() !== ""

    if (!isOpen) return null

    return createPortal(
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center"
            aria-modal="true"
            role="dialog"
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative z-10 w-full max-w-md mx-4 overflow-hidden rounded-2xl bg-zinc-900/95 border border-white/10 shadow-2xl">
                {/* BorderBeam on the whole modal */}
                <BorderBeam duration={8} size={400} borderWidth={1.5} colorFrom="#00E5FF" colorTo="#39FF14" />
                <BorderBeam duration={8} delay={4} size={400} borderWidth={1.5} colorFrom="#39FF14" colorTo="#00E5FF" />

                {/* Header */}
                <div className="px-6 pt-6 pb-4 flex items-start justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-white tracking-tight">플랜 선택</h2>
                        <p className="text-xs text-zinc-500 mt-0.5">원하는 플랜을 선택하세요</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="flex h-7 w-7 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-white/10 hover:text-white"
                        aria-label="닫기"
                    >
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                {/* 유료 구독 중인 경우: 관리 안내 배너 */}
                {hasActivePaidPlan && (
                    <div className="mx-6 mb-4 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
                        <div className="flex items-start gap-3">
                            <svg className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                                <line x1="12" y1="9" x2="12" y2="13" />
                                <line x1="12" y1="17" x2="12.01" y2="17" />
                            </svg>
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-amber-300">
                                    현재 <span className="capitalize">{currentPlan}</span> 플랜 구독 중
                                </p>
                                <p className="mt-1 text-xs text-amber-400/80">
                                    플랜 변경은 Manage Subscription에서 할 수 있습니다.
                                </p>
                                <button
                                    onClick={handleManageSubscription}
                                    disabled={loadingPortal}
                                    className="mt-2.5 flex items-center gap-1.5 rounded-lg bg-amber-500/20 px-3 py-1.5 text-xs font-semibold text-amber-300 transition-colors hover:bg-amber-500/30 disabled:opacity-60"
                                >
                                    {loadingPortal ? (
                                        <>
                                            <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                            </svg>
                                            열리는 중...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                                <polyline points="15 3 21 3 21 9" />
                                                <line x1="10" y1="14" x2="21" y2="3" />
                                            </svg>
                                            Manage Subscription →
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Cards */}
                <div className="px-6 pb-6 grid grid-cols-2 gap-3">
                    {plans.map((plan) => {
                        const isLoading = loadingPlan === plan.productIdEnv
                        // 이미 같은 플랜이면 "현재 플랜" 표시
                        const isCurrentPlan =
                            currentPlan?.toLowerCase() === plan.name.toLowerCase()

                        return (
                            <div
                                key={plan.name}
                                className={`relative flex flex-col items-center rounded-xl border ${plan.border} bg-white/5 px-5 py-6 text-center`}
                                style={{ boxShadow: `0 0 32px 0 ${plan.glow}` }}
                            >
                                {/* 현재 플랜 뱃지 */}
                                {isCurrentPlan && (
                                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-violet-600 px-2.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider whitespace-nowrap">
                                        현재 플랜
                                    </span>
                                )}

                                {/* Plan name */}
                                <span
                                    className={`mb-3 inline-block bg-gradient-to-r ${plan.gradient} bg-clip-text text-sm font-bold text-transparent tracking-widest uppercase`}
                                >
                                    {plan.name}
                                </span>

                                {/* Price */}
                                <div className="flex items-end gap-1 leading-none mb-2">
                                    <span className="text-zinc-400 text-sm mb-0.5">$</span>
                                    <span className="text-4xl font-black text-white">{plan.price}</span>
                                    <span className="text-zinc-500 text-xs mb-0.5">/mo</span>
                                </div>

                                {/* Credits */}
                                <span
                                    className={`text-2xl font-extrabold bg-gradient-to-r ${plan.gradient} bg-clip-text text-transparent`}
                                >
                                    {plan.credits}
                                </span>
                                <span className="mt-1 mb-5 text-xs text-zinc-500 tracking-wide">크레딧</span>

                                {/* CTA Button */}
                                {hasActivePaidPlan ? (
                                    // 이미 구독 중이면 버튼 비활성화 (포털로 유도)
                                    <button
                                        onClick={handleManageSubscription}
                                        className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-white/10 px-3 py-2 text-sm font-semibold text-zinc-400 transition-all duration-200 hover:bg-white/20 hover:text-white"
                                    >
                                        {isCurrentPlan ? "현재 플랜" : "플랜 변경"}
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleCheckout(plan.productIdEnv)}
                                        disabled={loadingPlan !== null}
                                        className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-white/80 px-3 py-2 text-sm font-semibold text-zinc-900 transition-all duration-200 hover:bg-white disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        {isLoading ? (
                                            <>
                                                <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                                </svg>
                                                이동 중...
                                            </>
                                        ) : (
                                            `Get ${plan.name}`
                                        )}
                                    </button>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>,
        document.body
    )
}

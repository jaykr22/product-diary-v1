"use client"

import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import DashboardNavbar from "@/components/dashboard/navbar"
import PromptArea from "@/components/dashboard/prompt-area"

export default function DashboardPage() {
    const { user, loading } = useAuth()
    const router = useRouter()

    // 로그인하지 않은 사용자는 auth 페이지로 리다이렉트
    useEffect(() => {
        if (!loading && !user) {
            router.replace("/auth")
        }
    }, [user, loading, router])

    // 로딩 중이거나 사용자가 없으면 로딩 화면 표시
    if (loading || !user) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#0a0a0f]">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-violet-500/20 border-t-violet-500" />
                    <p className="text-sm text-zinc-400">로딩 중...</p>
                </div>
            </div>
        )
    }

    return (
        <>
            <DashboardNavbar />
            <PromptArea />
        </>
    )
}

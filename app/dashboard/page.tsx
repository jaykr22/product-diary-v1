"use client"

import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import PromptArea from "@/components/dashboard/prompt-area"
import GallerySidebar from "@/components/dashboard/gallery-sidebar"
import { DiaryEntry } from "@/types/diary"

export default function DashboardPage() {
    const { user, loading } = useAuth()
    const router = useRouter()
    const supabase = createClient()

    const [diaries, setDiaries] = useState<DiaryEntry[]>([])
    const [loadingDiaries, setLoadingDiaries] = useState(true)

    // 인증 확인
    useEffect(() => {
        if (!loading && !user) {
            router.replace("/auth")
        }
    }, [user, loading, router])

    // 갤러리 초기 로딩
    useEffect(() => {
        if (!user) return

        async function fetchDiaries() {
            try {
                setLoadingDiaries(true)
                const { data, error } = await supabase
                    .from("thumbnails")
                    .select("*")
                    .order("created_at", { ascending: false })
                if (error) console.error("Error fetching diaries:", error)
                else if (data) setDiaries(data)
            } catch (err) {
                console.error("Unexpected error fetching diaries:", err)
            } finally {
                setLoadingDiaries(false)
            }
        }

        fetchDiaries()
    }, [user, supabase])

    // 새 일기 생성 시 갤러리 맨 앞에 추가
    const handleNewDiary = useCallback((diary: DiaryEntry) => {
        setDiaries((prev) => [diary, ...prev])
    }, [])

    // 일기 삭제 함수
    const handleDeleteDiary = useCallback(async (id: string, imagePath: string) => {
        try {
            // 1. Supabase Database 레코드 삭제
            const { error: dbError } = await supabase
                .from("thumbnails")
                .delete()
                .eq("id", id)

            if (dbError) throw dbError

            // 2. Supabase Storage 이미지 삭제
            const parts = imagePath.split("/image_path/")
            if (parts.length > 1) {
                const storagePath = parts[parts.length - 1]
                const { error: storageError } = await supabase.storage
                    .from("image_path")
                    .remove([storagePath])

                if (storageError) {
                    console.error("Storage delete error (non-fatal):", storageError)
                }
            }

            // 3. 상태 업데이트
            setDiaries((prev) => prev.filter((diary) => diary.id !== id))
        } catch (err) {
            console.error("Error deleting diary:", err)
            throw new Error("일기를 삭제하는 중 오류가 발생했습니다.")
        }
    }, [supabase])

    // 로딩 화면
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
        <div className="flex min-h-screen bg-[#0a0a0f]">
            {/* 좌측 갤러리 사이드바 */}
            <GallerySidebar diaries={diaries} loading={loadingDiaries} onDeleteDiary={handleDeleteDiary} />

            {/* 메인 콘텐츠 — 사이드바 너비(w-72 = 288px + margin) 만큼 왼쪽 패딩 */}
            <main className="flex-1 pl-72">
                <PromptArea onNewDiary={handleNewDiary} diaries={diaries} />
            </main>
        </div>
    )
}

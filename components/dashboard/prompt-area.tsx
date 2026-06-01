"use client"

import { PromptBox } from "@/components/ui/chatgpt-prompt-input"
import { BorderBeam } from "@/components/ui/border-beam"
import { FormEvent, useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import Image from "next/image"

interface DiaryEntry {
    id: string
    user_id: string
    image_path: string
    prompt: string
    created_at: string
    updated_at: string
}

export default function PromptArea() {
    const supabase = createClient()
    
    // 상태 관리
    const [isGenerating, setIsGenerating] = useState(false)
    const [generatedDiary, setGeneratedDiary] = useState<DiaryEntry | null>(null)
    const [diaries, setDiaries] = useState<DiaryEntry[]>([])
    const [loadingDiaries, setLoadingDiaries] = useState(true)
    const [selectedDiary, setSelectedDiary] = useState<DiaryEntry | null>(null)
    const [error, setError] = useState<string | null>(null)

    // 마운트 시 기존 작성 일기(썸네일) 목록 불러오기
    useEffect(() => {
        async function fetchDiaries() {
            try {
                setLoadingDiaries(true)
                const { data, error: fetchError } = await supabase
                    .from("thumbnails")
                    .select("*")
                    .order("created_at", { ascending: false })

                if (fetchError) {
                    console.error("Error fetching diaries:", fetchError)
                } else if (data) {
                    setDiaries(data)
                }
            } catch (err) {
                console.error("Unexpected error fetching diaries:", err)
            } finally {
                setLoadingDiaries(false)
            }
        }

        fetchDiaries()
    }, [supabase])

    // 그림일기 생성 제출
    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setError(null)

        const formData = new FormData(event.currentTarget)
        const message = formData.get("message")

        if (!message || typeof message !== "string" || !message.trim()) {
            return
        }

        try {
            setIsGenerating(true)
            
            // 폼 리셋
            event.currentTarget.reset()

            const response = await fetch("/api/generate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ prompt: message }),
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || "일기를 생성하지 못했습니다.")
            }

            if (result.success && result.data) {
                setGeneratedDiary(result.data)
                // 갤러리 목록 맨 앞에 추가
                setDiaries((prev) => [result.data, ...prev])
            }
        } catch (err: any) {
            console.error("Diary generation error:", err)
            setError(err.message || "그림일기를 그리는 도중 오류가 발생했습니다. 다시 시도해 주세요.")
        } finally {
            setIsGenerating(false)
        }
    }

    // 날짜 포맷팅 헬퍼
    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString("ko-KR", {
            year: "numeric",
            month: "long",
            day: "numeric",
            weekday: "long",
        })
    }

    return (
        <div className="flex min-h-screen w-full flex-col items-center bg-[#0a0a0f] p-6 pt-24 pb-20 overflow-x-hidden">
            {/* 배경 그라디언트 orbs */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full bg-violet-600/10 blur-[120px]" />
                <div className="absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full bg-indigo-600/10 blur-[120px]" />
                <div className="absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/5 blur-[80px]" />
            </div>

            {/* 그리드 패턴 오버레이 */}
            <div
                className="pointer-events-none absolute inset-0 opacity-[0.02]"
                style={{
                    backgroundImage:
                        "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
                    backgroundSize: "60px 60px",
                }}
            />

            {/* 메인 콘텐츠 컨테이너 */}
            <div className="relative z-10 w-full max-w-4xl flex flex-col items-center">
                
                {/* 상단 소개 (그림일기가 없을 때만 표시) */}
                {!generatedDiary && !isGenerating && (
                    <div className="text-center mb-10">
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-4 leading-tight">
                            오늘의 이야기를
                            <br />
                            <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                                그림일기로
                            </span>
                        </h1>
                        <p className="text-base text-zinc-400 max-w-md mx-auto">
                            오늘 있었던 일을 몇 줄로 편하게 적어보세요. AI가 감성을 담아 하나뿐인 그림일기를 그려드립니다.
                        </p>
                    </div>
                )}

                {/* 에러 메시지 */}
                {error && (
                    <div className="mb-6 w-full max-w-2xl rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-300 flex items-center gap-3 animate-in fade-in-0 duration-300">
                        <svg className="h-5 w-5 shrink-0 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        <span>{error}</span>
                    </div>
                )}

                {/* 생성 상태별 표시 영역 */}
                <div className="w-full max-w-2xl flex flex-col items-center justify-center gap-8 min-h-[300px]">
                    
                    {/* 1. 생성 중 상태 (Loading State) */}
                    {isGenerating && (
                        <div className="relative flex flex-col items-center justify-center p-8 bg-zinc-900/40 border border-white/5 backdrop-blur-md rounded-2xl aspect-square w-full max-w-md mx-auto shadow-2xl overflow-hidden animate-in fade-in-0 duration-500">
                            <div className="relative flex h-24 w-24 items-center justify-center mb-6">
                                <div className="absolute inset-0 animate-ping rounded-full bg-violet-500/20" />
                                <div className="absolute inset-2 animate-pulse rounded-full bg-indigo-500/30" />
                                <svg className="h-10 w-10 text-violet-400 animate-bounce" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 20h9" />
                                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">오늘의 일기를 그리는 중...</h3>
                            <p className="text-xs text-zinc-500 text-center max-w-xs">
                                Gemini AI가 하루의 기억을 캔버스에 수채화 일기로 정성껏 채워넣고 있습니다. 잠시만 기다려 주세요.
                            </p>
                            <BorderBeam duration={4} size={250} borderWidth={1.5} className="from-transparent via-violet-500 to-transparent" />
                        </div>
                    )}

                    {/* 2. 생성 완료 상태 (Polaroid Success Card) */}
                    {generatedDiary && !isGenerating && (
                        <div className="flex flex-col items-center gap-8 w-full animate-in zoom-in-95 duration-500">
                            {/* 폴라로이드 스타일 그림일기 */}
                            <div className="bg-white text-zinc-900 shadow-2xl p-5 pb-8 rounded-xl border border-zinc-200/80 w-full max-w-md mx-auto transform rotate-1 hover:rotate-0 transition-transform duration-300">
                                {/* 날짜 표기 */}
                                <div className="text-xs font-semibold text-zinc-400 mb-3 tracking-wider text-right border-b border-zinc-100 pb-1.5">
                                    {formatDate(generatedDiary.created_at)}
                                </div>
                                
                                {/* 이미지 영역 */}
                                <div className="relative aspect-square w-full overflow-hidden rounded bg-zinc-50 border border-zinc-100 flex items-center justify-center">
                                    <Image
                                        src={generatedDiary.image_path}
                                        alt="AI 생성 그림일기"
                                        fill
                                        sizes="(max-w-md) 100vw"
                                        priority
                                        className="object-cover transition-opacity duration-500"
                                    />
                                </div>

                                {/* 사용자 일기 본문 (원고지 격자 또는 손글씨 감성 폰트 적용처) */}
                                <div className="mt-6 px-1">
                                    <p className="font-semibold text-lg leading-relaxed text-zinc-800 text-center select-none whitespace-pre-wrap font-sans border-b border-dashed border-zinc-200 pb-4">
                                        "{generatedDiary.prompt}"
                                    </p>
                                </div>
                            </div>

                            {/* 컨트롤 버튼 */}
                            <button
                                onClick={() => setGeneratedDiary(null)}
                                className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-full px-6 py-3 font-semibold hover:shadow-lg hover:shadow-violet-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                            >
                                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 20h9" />
                                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                                </svg>
                                새 일기 쓰러가기
                            </button>
                        </div>
                    )}

                    {/* 3. 기본 입력 대기 상태 (Input Form) */}
                    {!generatedDiary && !isGenerating && (
                        <form onSubmit={handleSubmit} className="relative w-full">
                            <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/5 backdrop-blur-sm shadow-xl">
                                <PromptBox name="message" />
                                <BorderBeam
                                    duration={8}
                                    size={300}
                                    borderWidth={1.5}
                                    className="from-transparent via-violet-500 to-transparent"
                                />
                                <BorderBeam
                                    duration={8}
                                    delay={4}
                                    size={300}
                                    borderWidth={1.5}
                                    className="from-transparent via-indigo-500 to-transparent"
                                />
                            </div>
                        </form>
                    )}
                </div>

                {/* 갤러리 섹션 (모든 상태에서 표시) */}
                <div className="mt-16 w-full border-t border-white/10 pt-10">
                    <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                        <span>📚 나의 그림일기첩</span>
                        <span className="text-xs font-semibold bg-violet-500/20 text-violet-300 px-2.5 py-0.5 rounded-full">
                            {diaries.length}개
                        </span>
                    </h2>

                    {loadingDiaries ? (
                        /* 로딩 스켈레톤 */
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="bg-white/5 border border-white/5 rounded-xl p-3 flex flex-col gap-3 animate-pulse aspect-[3/4]">
                                    <div className="aspect-square bg-white/10 rounded w-full" />
                                    <div className="h-4 bg-white/10 rounded w-3/4 mx-auto" />
                                    <div className="h-3 bg-white/5 rounded w-1/2 mx-auto" />
                                </div>
                            ))}
                        </div>
                    ) : diaries.length === 0 ? (
                        /* 빈 상태 */
                        <div className="text-center py-12 bg-white/[0.01] border border-dashed border-white/5 rounded-2xl">
                            <svg className="h-12 w-12 text-zinc-600 mx-auto mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                <circle cx="8.5" cy="8.5" r="1.5" />
                                <polyline points="21 15 16 10 5 21" />
                            </svg>
                            <p className="text-zinc-500 text-sm">아직 작성한 그림일기가 없습니다.</p>
                            <p className="text-zinc-600 text-xs mt-1">오늘의 추억을 적어 첫 일기를 완성해 보세요!</p>
                        </div>
                    ) : (
                        /* 갤러리 그리드 */
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                            {diaries.map((diary) => (
                                <div
                                    key={diary.id}
                                    onClick={() => setSelectedDiary(diary)}
                                    className="group bg-white p-3 pb-5 rounded-lg shadow-lg border border-zinc-200 cursor-pointer transition-all duration-300 hover:scale-[1.03] hover:-rotate-1 hover:shadow-2xl hover:shadow-violet-500/5 text-zinc-950 flex flex-col gap-2 relative"
                                >
                                    {/* 이미지 영역 */}
                                    <div className="relative aspect-square w-full overflow-hidden rounded bg-zinc-50 border border-zinc-100">
                                        <Image
                                            src={diary.image_path}
                                            alt={diary.prompt}
                                            fill
                                            sizes="(max-w-xs) 50vw, 25vw"
                                            className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
                                        />
                                    </div>
                                    {/* 일기 텍스트 스니펫 */}
                                    <p className="font-semibold text-xs text-zinc-700 text-center truncate px-1 mt-1 border-b border-dashed border-zinc-100 pb-2">
                                        {diary.prompt}
                                    </p>
                                    {/* 생성일 */}
                                    <span className="text-[10px] font-medium text-zinc-400 text-center select-none">
                                        {new Date(diary.created_at).toLocaleDateString("ko-KR", {
                                            month: "2-digit",
                                            day: "2-digit",
                                        })}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* 디테일 보기 모달 */}
            {selectedDiary && (
                <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in-0 duration-300"
                    onClick={() => setSelectedDiary(null)}
                >
                    <button
                        onClick={() => setSelectedDiary(null)}
                        className="absolute top-4 right-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                        aria-label="닫기"
                    >
                        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>

                    <div
                        className="w-full max-w-md animate-in zoom-in-95 duration-300"
                        onClick={(e) => e.stopPropagation()} // 모달 내부 클릭 시 닫힘 방지
                    >
                        <div className="bg-white text-zinc-900 shadow-2xl p-5 pb-8 rounded-xl border border-zinc-200/80 w-full transform transition-transform duration-300">
                            {/* 날짜 */}
                            <div className="text-xs font-semibold text-zinc-400 mb-3 tracking-wider text-right border-b border-zinc-100 pb-1.5">
                                {formatDate(selectedDiary.created_at)}
                            </div>
                            
                            {/* 이미지 */}
                            <div className="relative aspect-square w-full overflow-hidden rounded bg-zinc-50 border border-zinc-100 flex items-center justify-center">
                                <Image
                                    src={selectedDiary.image_path}
                                    alt="AI 생성 그림일기 상세"
                                    fill
                                    sizes="(max-w-md) 100vw"
                                    className="object-cover"
                                />
                            </div>

                            {/* 텍스트 */}
                            <div className="mt-6 px-1">
                                <p className="font-semibold text-lg leading-relaxed text-zinc-800 text-center whitespace-pre-wrap font-sans border-b border-dashed border-zinc-200 pb-4">
                                    "{selectedDiary.prompt}"
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

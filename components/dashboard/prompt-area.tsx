"use client"

import { PromptBox } from "@/components/ui/chatgpt-prompt-input"
import { BorderBeam } from "@/components/ui/border-beam"
import DiaryGeneratingState from "@/components/dashboard/diary-generating-state"
import DiaryErrorState from "@/components/dashboard/diary-error-state"
import DiaryResultCard from "@/components/dashboard/diary-result-card"
import { FormEvent, useState } from "react"
import { DiaryEntry } from "@/types/diary"

interface PromptAreaProps {
    /** 새 일기가 생성됐을 때 부모(page)에 알려 갤러리를 갱신 */
    onNewDiary: (diary: DiaryEntry) => void
    diaries: DiaryEntry[]
}

export default function PromptArea({ onNewDiary, diaries }: PromptAreaProps) {
    const [isGenerating, setIsGenerating] = useState(false)
    const [generatedDiary, setGeneratedDiary] = useState<DiaryEntry | null>(null)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setError(null)

        const formData = new FormData(event.currentTarget)
        const message = formData.get("message")
        const images = formData.getAll("image")
        if (!message || typeof message !== "string" || !message.trim()) return

        try {
            setIsGenerating(true)
            setGeneratedDiary(null)
            event.currentTarget.reset()

            const response = await fetch("/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    prompt: message,
                    images: images.filter(img => typeof img === "string" && img.startsWith("data:"))
                }),
            })
            const result = await response.json()

            if (!response.ok) throw new Error(result.error || "일기를 생성하지 못했습니다.")
            if (result.success && result.data) {
                setGeneratedDiary(result.data)
                onNewDiary(result.data) // 사이드바 갤러리 갱신
            }
        } catch (err: any) {
            console.error("Diary generation error:", err)
            setError(err.message || "그림일기를 그리는 도중 오류가 발생했습니다. 다시 시도해 주세요.")
        } finally {
            setIsGenerating(false)
        }
    }

    return (
        <div className="flex min-h-screen w-full flex-col items-center bg-[#0a0a0f] p-6 pt-24 pb-8 overflow-x-hidden">
            {/* 배경 */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full bg-violet-600/10 blur-[120px]" />
                <div className="absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full bg-indigo-600/10 blur-[120px]" />
                <div className="absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/5 blur-[80px]" />
            </div>
            <div
                className="pointer-events-none absolute inset-0 opacity-[0.02]"
                style={{
                    backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
                    backgroundSize: "60px 60px",
                }}
            />

            <div className="relative z-10 w-full max-w-2xl flex flex-col items-center">

                {/* ── 상단 상태 영역 ── */}
                <div className="w-full flex flex-col items-center justify-center transition-all duration-500">

                    {/* 기본 대기 상태 */}
                    {!isGenerating && !generatedDiary && !error && (
                        <div className="text-center mb-10 animate-in fade-in-0 duration-500">
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

                    {isGenerating && <DiaryGeneratingState />}
                    {error && !isGenerating && <DiaryErrorState message={error} onRetry={() => setError(null)} />}
                    {generatedDiary && !isGenerating && (
                        <DiaryResultCard diary={generatedDiary} onReset={() => setGeneratedDiary(null)} />
                    )}
                </div>

                {/* ── 프롬프트 입력창 ── */}
                <div className="w-full">
                    <form onSubmit={handleSubmit} className="relative w-full">
                        <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/5 backdrop-blur-sm shadow-xl">
                            <PromptBox name="message" isGenerating={isGenerating} diaries={diaries} />
                            <BorderBeam duration={8} size={300} borderWidth={1.5} colorFrom="#00E5FF" colorTo="#39FF14" />
                            <BorderBeam duration={8} delay={4} size={300} borderWidth={1.5} colorFrom="#39FF14" colorTo="#00E5FF" />
                        </div>
                        <p className="text-center text-xs text-zinc-600 mt-3">
                            Enter로 전송 · Shift+Enter로 줄바꿈
                        </p>
                    </form>
                </div>
            </div>
        </div>
    )
}

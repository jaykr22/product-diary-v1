"use client"

import Image from "next/image"

interface DiaryEntry {
    id: string
    user_id: string
    image_path: string
    prompt: string
    created_at: string
    updated_at: string
}

interface DiaryResultCardProps {
    diary: DiaryEntry
    onReset?: () => void
    showActionButton?: boolean
}

function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "long",
    })
}

export default function DiaryResultCard({ diary, onReset, showActionButton = true }: DiaryResultCardProps) {
    return (
        <div className="flex flex-col items-center gap-8 w-full mb-8 animate-in zoom-in-95 fade-in-0 duration-500">
            {/* 폴라로이드 카드 */}
            <div className="bg-white text-zinc-900 shadow-2xl p-5 pb-8 rounded-xl border border-zinc-200/80 w-full max-w-md mx-auto transform rotate-1 hover:rotate-0 transition-transform duration-300">
                <div className="text-xs font-semibold text-zinc-400 mb-3 tracking-wider text-right border-b border-zinc-100 pb-1.5">
                    {formatDate(diary.created_at)}
                </div>
                <div className="relative aspect-square w-full overflow-hidden rounded bg-zinc-50 border border-zinc-100">
                    <Image
                        src={diary.image_path}
                        alt="AI 생성 그림일기"
                        fill
                        sizes="(max-width: 448px) 100vw, 448px"
                        priority
                        className="object-cover transition-opacity duration-500"
                    />
                </div>
                <div className="mt-6 px-1">
                    <p className="font-semibold text-lg leading-relaxed text-zinc-800 text-center select-none whitespace-pre-wrap font-sans border-b border-dashed border-zinc-200 pb-4">
                        "{diary.prompt}"
                    </p>
                </div>
            </div>

            {/* 새 일기 버튼 */}
            {showActionButton && onReset && (
                <button
                    onClick={onReset}
                    className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-full px-6 py-3 font-semibold hover:shadow-lg hover:shadow-violet-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                    </svg>
                    새 일기 쓰러가기
                </button>
            )}
        </div>
    )
}

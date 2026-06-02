"use client"

interface DiaryErrorStateProps {
    message: string
    onRetry: () => void
}

export default function DiaryErrorState({ message, onRetry }: DiaryErrorStateProps) {
    return (
        <div className="w-full max-w-2xl mb-8 animate-in fade-in-0 zoom-in-95 duration-400">
            <div className="flex flex-col items-center gap-5 rounded-2xl border border-red-500/20 bg-red-500/5 backdrop-blur-sm px-8 py-10 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-red-500/30 bg-red-500/10">
                    <svg
                        className="h-10 w-10 text-red-400"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </div>
                <div>
                    <h3 className="text-lg font-bold text-red-300 mb-2">일기 생성에 실패했어요</h3>
                    <p className="text-sm text-red-400/80 max-w-sm leading-relaxed">{message}</p>
                </div>
                <button
                    onClick={onRetry}
                    className="mt-2 px-5 py-2 rounded-full text-sm font-semibold text-red-300 border border-red-500/30 hover:bg-red-500/10 transition-colors duration-200"
                >
                    다시 시도하기
                </button>
            </div>
        </div>
    )
}

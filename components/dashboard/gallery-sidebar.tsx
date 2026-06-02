"use client"

import Image from "next/image"
import { useState } from "react"
import { DiaryEntry } from "@/types/diary"
import DiaryResultCard from "@/components/dashboard/diary-result-card"
import { createClient } from "@/lib/supabase/client"

interface GallerySidebarProps {
    diaries: DiaryEntry[]
    loading: boolean
    onDeleteDiary: (id: string, imagePath: string) => Promise<void>
}

export default function GallerySidebar({ diaries, loading, onDeleteDiary }: GallerySidebarProps) {
    const supabase = createClient()
    const [selectedDiary, setSelectedDiary] = useState<DiaryEntry | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)
    const [isDownloading, setIsDownloading] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [deleteError, setDeleteError] = useState<string | null>(null)

    const handleCloseModal = () => {
        setSelectedDiary(null)
        setShowDeleteConfirm(false)
        setDeleteError(null)
    }

    const handleDelete = async () => {
        if (!selectedDiary) return
        try {
            setIsDeleting(true)
            setDeleteError(null)
            await onDeleteDiary(selectedDiary.id, selectedDiary.image_path)
            handleCloseModal()
        } catch (err: any) {
            setDeleteError(err.message || "삭제 도중 오류가 발생했습니다.")
        } finally {
            setIsDeleting(false)
        }
    }

    const handleDownload = async () => {
        if (!selectedDiary) return
        try {
            setIsDownloading(true)
            const parts = selectedDiary.image_path.split("/image_path/")
            if (parts.length <= 1) throw new Error("이미지 경로를 찾을 수 없습니다.")
            const storagePath = parts[parts.length - 1]

            const { data, error } = await supabase.storage
                .from("image_path")
                .download(storagePath)

            if (error) throw error

            const url = window.URL.createObjectURL(data)
            const a = document.createElement("a")
            a.href = url
            const dateStr = new Date(selectedDiary.created_at).toISOString().split("T")[0]
            a.download = `그림일기-${dateStr}.png`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            window.URL.revokeObjectURL(url)
        } catch (err: any) {
            console.error("Download error:", err)
            alert(err.message || "이미지 다운로드에 실패했습니다.")
        } finally {
            setIsDownloading(false)
        }
    }

    return (
        <>
            {/* ── 사이드바 ── */}
            <aside
                className="fixed left-0 top-0 bottom-0 z-30 w-72 flex flex-col"
                style={{
                    paddingTop: "72px", // navbar 높이 보정
                }}
            >
                {/* Liquid Glass 패널 */}
                <div
                    className="relative mx-3 mb-3 flex flex-col flex-1 rounded-2xl overflow-hidden"
                    style={{
                        background: "linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 100%)",
                        backdropFilter: "blur(24px) saturate(180%)",
                        WebkitBackdropFilter: "blur(24px) saturate(180%)",
                        border: "1px solid rgba(255,255,255,0.12)",
                        boxShadow:
                            "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15), inset 0 -1px 0 rgba(0,0,0,0.2)",
                    }}
                >
                    {/* 내부 광택 레이어 */}
                    <div
                        className="pointer-events-none absolute inset-0 rounded-2xl"
                        style={{
                            background:
                                "linear-gradient(160deg, rgba(255,255,255,0.10) 0%, transparent 50%, rgba(255,255,255,0.03) 100%)",
                        }}
                    />

                    {/* 헤더 */}
                    <div
                        className="relative flex items-center justify-between px-4 py-4"
                        style={{
                            borderBottom: "1px solid rgba(255,255,255,0.08)",
                        }}
                    >
                        <div className="flex items-center gap-2.5">
                            <span className="text-base">📚</span>
                            <h2 className="text-sm font-bold text-white tracking-wide">나의 그림일기첩</h2>
                        </div>
                        <span
                            className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                            style={{
                                background: "rgba(139,92,246,0.25)",
                                border: "1px solid rgba(139,92,246,0.35)",
                                color: "#c4b5fd",
                            }}
                        >
                            {diaries.length}개
                        </span>
                    </div>

                    {/* 갤러리 스크롤 영역 */}
                    <div className="relative flex-1 overflow-y-auto px-3 py-3 custom-scrollbar">
                        {loading ? (
                            /* 스켈레톤 */
                            <div className="grid grid-cols-2 gap-2">
                                {[1, 2, 3, 4].map((i) => (
                                    <div
                                        key={i}
                                        className="aspect-square rounded-xl animate-pulse"
                                        style={{ background: "rgba(255,255,255,0.06)" }}
                                    />
                                ))}
                            </div>
                        ) : diaries.length === 0 ? (
                            /* 빈 상태 */
                            <div className="flex flex-col items-center justify-center h-full min-h-[200px] gap-3 text-center px-4">
                                <div
                                    className="flex h-14 w-14 items-center justify-center rounded-2xl"
                                    style={{
                                        background: "rgba(255,255,255,0.05)",
                                        border: "1px solid rgba(255,255,255,0.08)",
                                    }}
                                >
                                    <svg className="h-6 w-6 text-zinc-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                        <circle cx="8.5" cy="8.5" r="1.5" />
                                        <polyline points="21 15 16 10 5 21" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-zinc-400">아직 일기가 없어요</p>
                                    <p className="text-[11px] text-zinc-600 mt-1">첫 그림일기를 완성해 보세요!</p>
                                </div>
                            </div>
                        ) : (
                            /* 갤러리 그리드 */
                            <div className="grid grid-cols-2 gap-2">
                                {diaries.map((diary) => (
                                    <button
                                        key={diary.id}
                                        onClick={() => setSelectedDiary(diary)}
                                        className="group relative aspect-square rounded-xl overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
                                        style={{
                                            border: "1px solid rgba(255,255,255,0.08)",
                                            boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                                        }}
                                    >
                                        <Image
                                            src={diary.image_path}
                                            alt={diary.prompt}
                                            fill
                                            sizes="128px"
                                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                                        />
                                        {/* 호버 오버레이 */}
                                        <div
                                            className="absolute inset-0 flex flex-col items-start justify-end p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                            style={{
                                                background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 60%)",
                                            }}
                                        >
                                            <p className="text-[10px] font-semibold text-white leading-snug line-clamp-2 text-left">
                                                {diary.prompt}
                                            </p>
                                            <span className="text-[9px] text-white/60 mt-0.5">
                                                {new Date(diary.created_at).toLocaleDateString("ko-KR", {
                                                    month: "2-digit",
                                                    day: "2-digit",
                                                })}
                                            </span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 하단 그라디언트 페이드 */}
                    <div
                        className="pointer-events-none absolute bottom-0 left-0 right-0 h-8 rounded-b-2xl"
                        style={{
                            background: "linear-gradient(to top, rgba(10,10,15,0.6), transparent)",
                        }}
                    />
                </div>
            </aside>

            {/* ── 상세 보기 모달 ── */}
            {selectedDiary && (
                <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in-0 duration-300"
                    onClick={handleCloseModal}
                >
                    <button
                        onClick={handleCloseModal}
                        className="absolute top-4 right-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                        aria-label="닫기"
                    >
                        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                    <div
                        className="w-full max-w-md animate-in zoom-in-95 duration-300 flex flex-col items-center gap-4 my-8"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <DiaryResultCard diary={selectedDiary} showActionButton={false} />
                        
                        {/* 삭제 섹션 */}
                        <div 
                            className="w-full max-w-sm flex flex-col items-center justify-center p-5 rounded-2xl backdrop-blur-md transition-all duration-300"
                            style={{
                                background: "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)",
                                border: "1px solid rgba(255,255,255,0.1)",
                                boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
                            }}
                        >
                            {!showDeleteConfirm ? (
                                <div className="flex gap-3 w-full justify-center">
                                    <button
                                        onClick={handleDownload}
                                        disabled={isDownloading}
                                        className="flex-1 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 text-white border border-white/10 hover:border-white/20 rounded-full py-2.5 text-sm font-semibold hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50"
                                    >
                                        {isDownloading ? (
                                            <>
                                                <span className="h-3 w-3 animate-spin rounded-full border border-white/20 border-t-white" />
                                                받는 중...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                                    <polyline points="7 10 12 15 17 10"></polyline>
                                                    <line x1="12" y1="15" x2="12" y2="3"></line>
                                                </svg>
                                                다운로드
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => setShowDeleteConfirm(true)}
                                        className="flex-1 flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 hover:border-red-500/40 rounded-full py-2.5 text-sm font-semibold hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                                    >
                                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="3 6 5 6 21 6"></polyline>
                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                            <line x1="10" y1="11" x2="10" y2="17"></line>
                                            <line x1="14" y1="11" x2="14" y2="17"></line>
                                        </svg>
                                        일기 삭제
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center w-full animate-in fade-in-0 duration-300">
                                    <p className="text-sm font-medium text-zinc-200 mb-3 text-center leading-relaxed">
                                        정말 이 일기를 삭제할까요? <br/>
                                        <span className="text-[11px] text-red-400/80 font-normal">삭제된 일기와 이미지는 복구할 수 없습니다.</span>
                                    </p>
                                    {deleteError && (
                                        <p className="text-xs text-red-400 mb-3 text-center">{deleteError}</p>
                                    )}
                                    <div className="flex gap-3 w-full justify-center">
                                        <button
                                            onClick={() => {
                                                setShowDeleteConfirm(false)
                                                setDeleteError(null)
                                            }}
                                            disabled={isDeleting}
                                            className="flex-1 max-w-[120px] py-2 rounded-full border border-white/10 hover:bg-white/5 text-sm text-zinc-300 transition-all duration-200 disabled:opacity-50"
                                        >
                                            취소
                                        </button>
                                        <button
                                            onClick={handleDelete}
                                            disabled={isDeleting}
                                            className="flex-1 max-w-[120px] py-2 rounded-full bg-red-600 hover:bg-red-700 text-sm font-semibold text-white transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-1.5"
                                        >
                                            {isDeleting ? (
                                                <>
                                                    <span className="h-3 w-3 animate-spin rounded-full border border-white/20 border-t-white" />
                                                    삭제 중
                                                </>
                                            ) : (
                                                "삭제 확인"
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

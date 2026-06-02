"use client"

import LiquidLoading from "@/components/ui/liquid-loading"

export default function DiaryGeneratingState() {
    return (
        <div className="w-full flex flex-col items-center justify-center mb-8 animate-in fade-in-0 slide-in-from-top-4 duration-500">
            <LiquidLoading />
        </div>
    )
}

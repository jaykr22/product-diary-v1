"use client"

import { useEffect } from "react"
import { cn } from "@/lib/utils"

interface BorderBeamProps {
    className?: string
    size?: number
    duration?: number
    delay?: number
    borderWidth?: number
    colorFrom?: string
    colorTo?: string
}

export function BorderBeam({
    className = "",
    size = 300,
    duration = 10,
    delay = 0,
    borderWidth = 1.5,
    colorFrom,
    colorTo,
}: BorderBeamProps) {
    useEffect(() => {
        const style = document.createElement("style")
        style.textContent = `
            @keyframes border-beam-anim {
                100% {
                    offset-distance: 100%;
                }
            }
        `
        document.head.appendChild(style)

        return () => {
            document.head.removeChild(style)
        }
    }, [])

    const gradientStyle =
        colorFrom && colorTo
            ? { background: `linear-gradient(to left, transparent, ${colorFrom}, ${colorTo}, transparent)` }
            : {}

    return (
        <div
            style={{
                "--border-width": `${borderWidth}px`,
            } as React.CSSProperties}
            className="pointer-events-none absolute inset-0 rounded-[inherit] [border:var(--border-width)_solid_transparent] ![mask-clip:padding-box,border-box] ![mask-composite:intersect] [mask-image:linear-gradient(transparent,transparent),linear-gradient(white,white)]"
        >
            <div
                style={{
                    width: `${size}px`,
                    offsetPath: `rect(0 auto auto 0 round ${size}px)`,
                    offsetAnchor: "90% 50%",
                    animation: `border-beam-anim ${duration}s infinite linear`,
                    animationDelay: `-${delay}s`,
                    ...gradientStyle,
                } as any}
                className={cn(
                    "absolute aspect-square",
                    !colorFrom && !colorTo && "bg-gradient-to-l",
                    className
                )}
            />
        </div>
    )
}


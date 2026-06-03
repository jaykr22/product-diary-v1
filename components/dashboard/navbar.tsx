"use client"

import Image from "next/image"
import Link from "next/link"
import { useState, useRef, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import * as PopoverPrimitive from "@radix-ui/react-popover"
import PricingModal from "@/components/dashboard/pricing-modal"
import { createClient } from "@/lib/supabase/client"

function cn(...inputs: (string | boolean | null | undefined)[]): string {
    return inputs.filter(Boolean).join(" ")
}

const Popover = PopoverPrimitive.Root
const PopoverTrigger = PopoverPrimitive.Trigger
const PopoverContent = PopoverPrimitive.Content

export default function DashboardNavbar() {
    const { user, signOut } = useAuth()
    const [isProfileOpen, setIsProfileOpen] = useState(false)
    const [isHovering, setIsHovering] = useState(false)
    const [isPricingOpen, setIsPricingOpen] = useState(false)
    const [profile, setProfile] = useState<{ plan: string | null } | null>(null)
    const popoverRef = useRef<HTMLDivElement>(null)

    // Fetch user profile plan
    useEffect(() => {
        if (!user) {
            setProfile(null)
            return
        }
        const supabase = createClient()
        const fetchProfile = async () => {
            const { data } = await supabase
                .from("users")
                .select("plan")
                .eq("id", user.id)
                .single()
            if (data) {
                setProfile(data)
            }
        }
        fetchProfile()
    }, [user])

    // Close popover when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const handleSignOut = async () => {
        setIsProfileOpen(false)
        await signOut()
    }

    return (
        <>
        <nav className="fixed top-0 left-0 right-0 z-40 bg-transparent backdrop-blur-sm">
            <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
                {/* Left: Logo */}
                <Link href="/dashboard" className="flex items-center gap-2.5 transition-opacity duration-200 hover:opacity-80">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 shadow-lg">
                        <span className="text-lg font-black text-white">J</span>
                    </div>
                    <span className="text-lg font-bold tracking-tight text-white">
                        J
                        <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                            -urnal
                        </span>
                    </span>
                </Link>

                {/* Right: Profile Popover */}
                <Popover open={isProfileOpen} onOpenChange={setIsProfileOpen}>
                    <PopoverTrigger asChild>
                        <button
                            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 shadow-lg backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:bg-white/10 hover:shadow-xl"
                            onMouseEnter={() => setIsHovering(true)}
                            onMouseLeave={() => setIsHovering(false)}
                        >
                            {user?.user_metadata?.avatar_url ? (
                                <Image
                                    src={user.user_metadata.avatar_url}
                                    alt="프로필"
                                    width={40}
                                    height={40}
                                    className="rounded-full"
                                />
                            ) : (
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 text-sm font-bold text-white">
                                    {(user?.user_metadata?.full_name?.[0] ?? user?.email?.[0] ?? "U").toUpperCase()}
                                </div>
                            )}
                        </button>
                    </PopoverTrigger>

                    <PopoverPrimitive.Portal>
                        <PopoverPrimitive.Content
                            ref={popoverRef}
                            align="end"
                            sideOffset={12}
                            className="z-50 w-56 rounded-xl bg-zinc-900/95 border border-white/10 p-3 shadow-2xl backdrop-blur-xl animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
                        >
                            {/* Profile Info */}
                            <div className="mb-3 rounded-lg bg-white/5 p-3">
                                <p className="truncate text-sm font-medium text-white">
                                    {user?.user_metadata?.full_name ?? "사용자"}
                                </p>
                                <p className="truncate text-xs text-zinc-400">
                                    {user?.email}
                                </p>
                            </div>

                            {/* Divider */}
                            <div className="mb-2 h-px bg-white/10" />

                            {/* Pricing Button */}
                            <button
                                onClick={() => { setIsProfileOpen(false); setIsPricingOpen(true) }}
                                className="flex w-full items-center justify-start gap-2.5 rounded-lg bg-white/5 px-3 py-2 text-sm font-medium text-zinc-300 transition-colors duration-200 hover:bg-white/10 hover:text-white"
                            >
                                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                </svg>
                                플랜 업그레이드
                            </button>

                            {/* Manage Subscription Link */}
                            {profile?.plan && profile.plan.toLowerCase() !== "free" && (
                                <a
                                    href="/api/customer-portal"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => setIsProfileOpen(false)}
                                    className="flex w-full items-center justify-start gap-2.5 rounded-lg bg-white/5 px-3 py-2 text-sm font-medium text-zinc-300 transition-colors duration-200 hover:bg-white/10 hover:text-white"
                                >
                                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                        <polyline points="15 3 21 3 21 9" />
                                        <line x1="10" y1="14" x2="21" y2="3" />
                                    </svg>
                                    Manage Subscription
                                </a>
                            )}

                            {/* Sign Out Button */}
                            <button
                                onClick={handleSignOut}
                                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-zinc-400 transition-colors duration-200 hover:bg-white/5 hover:text-white"
                            >
                                <svg
                                    className="h-4 w-4"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                    <polyline points="16 17 21 12 16 7" />
                                    <line x1="21" y1="12" x2="9" y2="12" />
                                </svg>
                                로그아웃
                            </button>
                        </PopoverPrimitive.Content>
                    </PopoverPrimitive.Portal>
                </Popover>
            </div>
        </nav>

        <PricingModal isOpen={isPricingOpen} onClose={() => setIsPricingOpen(false)} />
        </>
    )
}

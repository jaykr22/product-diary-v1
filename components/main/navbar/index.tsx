"use client"

import Image from "next/image"
import Link from "next/link"
import { useState, useRef, useEffect } from "react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "Contact", href: "#contact" },
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const { user, loading, signOut } = useAuth()

  if (pathname === "/auth") return null

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    setDropdownOpen(false)
    await signOut()
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50">

      {/* 글래스모피즘 배경 */}
      <div className="absolute inset-0 border-b border-white/5 bg-zinc-950/80 backdrop-blur-xl" />

      <nav className="relative mx-auto flex h-16 max-w-6xl items-center justify-between px-6">

        {/* ── 왼쪽: 로고 + 서비스명 ── */}
        <Link
          href="/"
          id="nav-logo"
          className="flex items-center gap-2.5 transition-opacity duration-200 hover:opacity-80"
        >
          <Image
            src="/j_logo.png"
            alt="J-urnal 로고"
            width={36}
            height={36}
            className="rounded-lg"
            priority
          />
          <span className="text-lg font-bold tracking-tight text-white">
            J
            <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
              -urnal
            </span>
          </span>
        </Link>

        {/* ── 중앙: 네비게이션 링크 (데스크탑) ── */}
        <ul className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                id={`nav-${link.label.toLowerCase()}`}
                className="group relative px-4 py-2 text-sm font-medium text-zinc-400 transition-colors duration-200 hover:text-white"
              >
                {link.label}
                {/* 호버 언더라인 */}
                <span className="absolute bottom-0 left-1/2 h-px w-0 -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-400 to-indigo-400 transition-all duration-300 group-hover:w-4/5" />
              </Link>
            </li>
          ))}
        </ul>

        {/* ── 우측: 사용자 메뉴 or Get Started + 모바일 햄버거 ── */}
        <div className="flex items-center gap-3">

          {/* 로그인 상태에 따라 분기 (데스크탑) */}
          {!loading && user ? (
            /* ── 로그인된 상태: 아바타 + 드롭다운 ── */
            <div className="relative hidden md:block" ref={dropdownRef}>
              <button
                id="nav-user-menu"
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 py-1.5 pl-1.5 pr-4 text-sm font-medium text-white backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:bg-white/10"
              >
                {user.user_metadata?.avatar_url ? (
                  <Image
                    src={user.user_metadata.avatar_url}
                    alt="프로필"
                    width={28}
                    height={28}
                    className="rounded-full"
                  />
                ) : (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 text-xs font-bold text-white">
                    {(user.user_metadata?.full_name?.[0] ?? user.email?.[0] ?? "U").toUpperCase()}
                  </div>
                )}
                <span className="max-w-[120px] truncate">
                  {user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "사용자"}
                </span>
                <svg
                  className={cn(
                    "h-3.5 w-3.5 text-zinc-400 transition-transform duration-200",
                    dropdownOpen && "rotate-180"
                  )}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {/* 드롭다운 메뉴 */}
              <div
                className={cn(
                  "absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-xl border border-white/10 bg-zinc-900/95 shadow-2xl backdrop-blur-xl transition-all duration-200",
                  dropdownOpen
                    ? "pointer-events-auto translate-y-0 opacity-100"
                    : "pointer-events-none -translate-y-1 opacity-0"
                )}
              >
                {/* 사용자 정보 */}
                <div className="border-b border-white/5 px-4 py-3">
                  <p className="truncate text-sm font-medium text-white">
                    {user.user_metadata?.full_name ?? "사용자"}
                  </p>
                  <p className="truncate text-xs text-zinc-500">
                    {user.email}
                  </p>
                </div>

                {/* 로그아웃 */}
                <div className="p-1.5">
                  <button
                    id="nav-sign-out"
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
                </div>
              </div>
            </div>
          ) : (
            /* ── 비로그인 상태: Get Started 버튼 (데스크탑) ── */
            <Link
              href="/auth"
              id="nav-get-started"
              className="hidden md:inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-violet-500/20 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-violet-500/30"
            >
              Get Started
              <svg
                className="h-3.5 w-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          )}

          {/* 햄버거 버튼 (모바일) */}
          <button
            id="nav-mobile-toggle"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="flex md:hidden items-center justify-center rounded-lg p-2 text-zinc-400 transition-colors duration-200 hover:bg-white/5 hover:text-white"
            aria-label={mobileOpen ? "메뉴 닫기" : "메뉴 열기"}
            aria-expanded={mobileOpen}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="h-5 w-5"
            >
              {mobileOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="7" x2="21" y2="7" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="17" x2="21" y2="17" />
                </>
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* ── 모바일 드롭다운 ── */}
      <div
        className={cn(
          "md:hidden overflow-hidden transition-all duration-300",
          mobileOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0 pointer-events-none"
        )}
      >
        <div className="border-t border-white/5 bg-zinc-950/95 px-6 py-4 backdrop-blur-xl">
          <ul className="mb-4 flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-400 transition-colors duration-200 hover:bg-white/5 hover:text-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {!loading && user ? (
            /* 모바일: 로그인된 상태 */
            <div className="space-y-2 border-t border-white/5 pt-4">
              <div className="flex items-center gap-3 px-3 py-2">
                {user.user_metadata?.avatar_url ? (
                  <Image
                    src={user.user_metadata.avatar_url}
                    alt="프로필"
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 text-sm font-bold text-white">
                    {(user.user_metadata?.full_name?.[0] ?? user.email?.[0] ?? "U").toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">
                    {user.user_metadata?.full_name ?? "사용자"}
                  </p>
                  <p className="truncate text-xs text-zinc-500">{user.email}</p>
                </div>
              </div>
              <button
                onClick={async () => {
                  setMobileOpen(false)
                  await signOut()
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-400 transition-colors duration-200 hover:bg-white/5 hover:text-white"
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
            </div>
          ) : (
            /* 모바일: 비로그인 상태 */
            <Link
              href="/auth"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white"
            >
              Get Started
              <svg
                className="h-3.5 w-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          )}
        </div>
      </div>

    </header>
  )
}

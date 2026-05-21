"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { cn } from "@/lib/utils"

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "Contact", href: "#contact" },
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

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

        {/* ── 우측: Get Started + 모바일 햄버거 ── */}
        <div className="flex items-center gap-3">

          {/* Get Started 버튼 (데스크탑) */}
          <Link
            href="/create"
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
          mobileOpen ? "max-h-72 opacity-100" : "max-h-0 opacity-0 pointer-events-none"
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
          <Link
            href="/create"
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
        </div>
      </div>

    </header>
  )
}

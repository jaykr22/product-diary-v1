import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/"

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // 로그인 성공 → 대시보드로 리다이렉트
      const redirectPath = next === "/" ? "/dashboard" : next
      return NextResponse.redirect(`${origin}${redirectPath}`)
    }
  }

  // 에러 발생 시 auth 페이지로 돌아감
  return NextResponse.redirect(`${origin}/auth?error=auth_callback_error`)
}

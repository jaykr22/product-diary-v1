import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { Polar } from "@polar-sh/sdk"

export async function GET() {
    try {
        const supabase = await createClient()

        // 1. 사용자 인증 확인
        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user || !user.email) {
            return NextResponse.json({ error: "인증되지 않은 사용자입니다." }, { status: 401 })
        }

        // 2. Polar SDK 초기화
        const polar = new Polar({
            accessToken: process.env.POLAR_ACCESS_TOKEN,
            server: process.env.POLAR_SANDBOX === "true" ? "sandbox" : undefined
        })

        // 3. Polar에서 사용자 이메일로 고객 계정 찾기
        const response = await polar.customers.list({ email: user.email })
        const customer = response.result.items[0]

        if (!customer) {
            console.error(`No customer found on Polar for email: ${user.email}`)
            // 고객 정보가 없는 경우 대시보드로 돌아가도록 처리
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"}/dashboard?error=customer_not_found`)
        }

        // 4. 인증된 고객 포털 세션 생성
        const session = await polar.customerSessions.create({
            customerId: customer.id,
            returnUrl: `${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"}/dashboard`
        })

        // 5. 고객 포털 URL로 리다이렉트
        return NextResponse.redirect(session.customerPortalUrl)
    } catch (error: any) {
        console.error("Error creating customer portal session:", error)
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"}/dashboard?error=portal_error`)
    }
}

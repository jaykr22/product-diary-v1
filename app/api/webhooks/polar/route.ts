import { NextResponse } from "next/server"
import { validateEvent, WebhookVerificationError } from "@polar-sh/sdk/webhooks"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const PRO_PRODUCT_ID = process.env.NEXT_PUBLIC_POLAR_PRO_PRODUCT_ID || "3f83bebf-337b-47b4-af99-1af3a57e5868"
const ULTRA_PRODUCT_ID = process.env.NEXT_PUBLIC_POLAR_ULTRA_PRODUCT_ID || "fe8f8926-d880-468a-9484-8f5ab5a8da68"

export async function POST(request: Request) {
    const requestBody = await request.text()
    const webhookHeaders = {
        "webhook-id": request.headers.get("webhook-id") ?? "",
        "webhook-timestamp": request.headers.get("webhook-timestamp") ?? "",
        "webhook-signature": request.headers.get("webhook-signature") ?? ""
    }

    let webhookPayload: any
    const secret = process.env.POLAR_WEBHOOK_SECRET
    
    // Allow bypassing verification in local development for testing convenience
    const bypassValidation = process.env.NODE_ENV === "development" && request.headers.get("x-bypass-webhook-validation") === "true"

    if (!secret || bypassValidation) {
        if (process.env.NODE_ENV === "development") {
            try {
                webhookPayload = JSON.parse(requestBody)
                console.log("Bypassing signature verification in development.")
            } catch (err) {
                return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
            }
        } else {
            return NextResponse.json({ error: "Webhook secret is required in production" }, { status: 500 })
        }
    } else {
        try {
            console.log("Validating real webhook event signature...")
            webhookPayload = validateEvent(requestBody, webhookHeaders, secret)
            console.log("Webhook signature validated successfully. Event type:", webhookPayload.type)
        } catch (error) {
            console.error("Webhook signature verification failed! Details:", error)
            console.log("Configured POLAR_WEBHOOK_SECRET length in .env.local:", secret?.length)
            console.log("Received Webhook Headers:", JSON.stringify(webhookHeaders))
            if (error instanceof WebhookVerificationError) {
                return NextResponse.json({ received: false }, { status: 403 })
            }
            throw error
        }
    }

    try {
        const type = webhookPayload.type
        const data = webhookPayload.data

        // 1. 구독 결제가 완료되었을 때 (첫 결제든 재결제든)
        if (type === "order.paid") {
            const email = data.customer?.email || data.customer_email
            const productId = data.product_id || data.productId
            const amount = (data.total_amount || data.totalAmount) / 100
            const currency = data.currency
            const checkoutId = data.checkout_id || data.checkoutId

            if (!email) {
                console.error("No customer email found in order.paid payload")
                return NextResponse.json({ received: true })
            }

            // 1.1. 데이터베이스에서 사용자 조회
            const { data: user, error: userError } = await supabaseAdmin
                .from("users")
                .select("id, credits")
                .eq("email", email)
                .single()

            if (userError || !user) {
                console.error(`User not found for email ${email}:`, userError)
                return NextResponse.json({ received: true })
            }

            // 플랜에 맞춰 충전할 크레딧 계산 (Pro: 100, Ultra: 300)
            let creditsToAdd = 0
            if (productId === PRO_PRODUCT_ID) {
                creditsToAdd = 100
            } else if (productId === ULTRA_PRODUCT_ID) {
                creditsToAdd = 300
            } else {
                console.warn(`Unknown product ID for order.paid: ${productId}`)
            }

            console.log(`Order paid received for ${email}. Adding ${creditsToAdd} credits.`)

            // 1.2. 사용자 크레딧 충전
            const newCredits = (user.credits || 0) + creditsToAdd
            const { error: updateError } = await supabaseAdmin
                .from("users")
                .update({
                    credits: newCredits,
                    updated_at: new Date().toISOString()
                })
                .eq("id", user.id)

            if (updateError) {
                console.error(`Failed to update user credits:`, updateError)
                return NextResponse.json({ received: true })
            }

            // 1.3. payments 테이블에 결제 로그 추가
            const { error: paymentError } = await supabaseAdmin
                .from("payments")
                .insert({
                    user_id: user.id,
                    amount,
                    currency,
                    status: "succeeded",
                    provider: "polar",
                    checkout_id: checkoutId
                })

            if (paymentError) {
                console.error(`Failed to insert payment record:`, paymentError)
            } else {
                console.log(`Successfully processed order.paid for user ${email}`)
            }
        }
        
        // 2. 사용자의 상태가 변경되었을 때 (첫 구독 시작, 취소, 제거, 만료 등)
        else if (type === "customer.state_changed") {
            const email = data.email
            const activeSubs = data.activeSubscriptions || data.active_subscriptions || []

            if (!email) {
                console.error("No customer email found in customer.state_changed payload")
                return NextResponse.json({ received: true })
            }

            // 활성 구독 여부에 따라 신규 플랜 및 상태 결정
            let planName = "Free"
            let subStatus = "inactive"

            if (activeSubs.length > 0) {
                const sub = activeSubs[0]
                subStatus = sub.status
                const productId = sub.productId || sub.product_id

                if (productId === PRO_PRODUCT_ID) {
                    planName = "Pro"
                } else if (productId === ULTRA_PRODUCT_ID) {
                    planName = "Ultra"
                }
            }

            // 2.1. 데이터베이스에서 현재 플랜 확인
            const { data: user, error: userError } = await supabaseAdmin
                .from("users")
                .select("id, plan, credits")
                .eq("email", email)
                .single()

            if (userError || !user) {
                console.error(`User not found for email ${email}:`, userError)
                return NextResponse.json({ received: true })
            }

            const currentPlan = user.plan || "Free"
            console.log(`customer.state_changed for ${email}. Current plan: ${currentPlan}, New plan: ${planName}, Status: ${subStatus}`)

            let creditsToAdd = 0
            // 3. 업그레이드 처리 (Pro -> Ultra)
            if (currentPlan === "Pro" && planName === "Ultra") {
                creditsToAdd = 200 // 차액 크레딧 (300 - 100) 충전
                console.log(`Upgrade detected (Pro -> Ultra) for ${email}. Adding ${creditsToAdd} credits.`)
            }

            // 2.2. 사용자 구독 정보 갱신 (업그레이드인 경우 크레딧 추가)
            const updates: any = {
                plan: planName,
                subscription_status: subStatus,
                updated_at: new Date().toISOString()
            }

            if (creditsToAdd > 0) {
                updates.credits = (user.credits || 0) + creditsToAdd
            }

            const { data: updatedData, error: updateError } = await supabaseAdmin
                .from("users")
                .update(updates)
                .eq("id", user.id)
                .select()

            if (updateError) {
                console.error(`Failed to update user profile on state change:`, updateError)
            } else {
                console.log(`Successfully updated profile for user ${email} to ${planName} (${subStatus}). Affected rows:`, updatedData?.length, "Data:", JSON.stringify(updatedData))
            }
        }
        
        // 3. 개별 구독 상태 이벤트 (subscription.created, subscription.updated, subscription.active, subscription.revoked 등)
        else if (
            type === "subscription.created" ||
            type === "subscription.updated" ||
            type === "subscription.active" ||
            type === "subscription.revoked" ||
            type === "subscription.canceled" ||
            type === "subscription.uncanceled"
        ) {
            const email = data.customer?.email
            const subStatus = data.status
            const productId = data.product_id || data.productId

            if (!email) {
                console.error(`No customer email found in ${type} payload`)
                return NextResponse.json({ received: true })
            }

            // 활성 구독 여부에 따라 신규 플랜 및 상태 결정
            let planName = "Free"
            if (subStatus === "active" || subStatus === "trialing") {
                if (productId === PRO_PRODUCT_ID) {
                    planName = "Pro"
                } else if (productId === ULTRA_PRODUCT_ID) {
                    planName = "Ultra"
                }
            }

            // 데이터베이스에서 현재 플랜 확인
            const { data: user, error: userError } = await supabaseAdmin
                .from("users")
                .select("id, plan, credits")
                .eq("email", email)
                .single()

            if (userError || !user) {
                console.error(`User not found for email ${email}:`, userError)
                return NextResponse.json({ received: true })
            }

            const currentPlan = user.plan || "Free"
            console.log(`${type} for ${email}. Current plan: ${currentPlan}, New plan: ${planName}, Status: ${subStatus}`)

            let creditsToAdd = 0
            if (currentPlan === "Pro" && planName === "Ultra") {
                creditsToAdd = 200 // 업그레이드 차액 크레딧 충전
            }

            const updates: any = {
                plan: planName,
                subscription_status: subStatus,
                updated_at: new Date().toISOString()
            }

            if (creditsToAdd > 0) {
                updates.credits = (user.credits || 0) + creditsToAdd
            }

            const { data: updatedData, error: updateError } = await supabaseAdmin
                .from("users")
                .update(updates)
                .eq("id", user.id)
                .select()

            if (updateError) {
                console.error(`Failed to update user profile on ${type}:`, updateError)
            } else {
                console.log(`Successfully updated profile for user ${email} to ${planName} (${subStatus}). Affected rows:`, updatedData?.length, "Data:", JSON.stringify(updatedData))
            }
        }
    } catch (err) {
        console.error("Failed to process webhook:", err)
    }

    return NextResponse.json({ received: true })
}

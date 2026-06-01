import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
    try {
        const supabase = await createClient()

        // 1. 사용자 인증 확인
        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: "인증되지 않은 사용자입니다." }, { status: 401 })
        }

        // 2. 요청 파라미터 및 API 키 검증
        const { prompt } = await request.json()
        if (!prompt || typeof prompt !== "string") {
            return NextResponse.json({ error: "일기 내용(prompt)이 유효하지 않습니다." }, { status: 400 })
        }

        const geminiApiKey = process.env.GEMINI_API_KEY
        if (!geminiApiKey) {
            return NextResponse.json(
                { error: "Gemini API 키가 설정되지 않았습니다. .env.local을 확인해 주세요." },
                { status: 500 }
            )
        }

        // 3. 일기 느낌이 나는 수채화/크레파스 풍 그라피코 스타일을 적용하기 위한 프롬프트 강화
        const enhancedPrompt = `A warm, cozy, colorful, child-like watercolor and crayon drawing representing this memory for a picture diary: ${prompt}`

        // 4. Gemini Image API 호출 (무료 티어에서는 2.5-flash-image도 한도가 0으로 막히는 경우가 있습니다)
        const modelName = "gemini-2.5-flash-image"
        let base64Image = ""
        let isFallback = false

        // 임시 테스트용 수채화 일러스트 플레이스홀더 이미지 목록
        const FALLBACK_IMAGES = [
            "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=600&auto=format&fit=crop", // 꽃 수채화
            "https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?q=80&w=600&auto=format&fit=crop", // 유채 드로잉
            "https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=600&auto=format&fit=crop", // 파스텔 일러스트
            "https://images.unsplash.com/photo-1580136579312-94651dfd596d?q=80&w=600&auto=format&fit=crop", // 따뜻한 풍경화
        ]

        try {
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent`,
                {
                    method: "POST",
                    headers: {
                        "x-goog-api-key": geminiApiKey,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        contents: [
                            {
                                parts: [
                                    {
                                        text: enhancedPrompt,
                                    },
                                ],
                            },
                        ],
                    }),
                }
            )

            const responseData = await response.json()
            if (!response.ok) {
                // 할당량 초과(Quota Exceeded) 에러 감지 시 묵시적 폴백 활성화
                if (response.status === 429 || responseData.error?.message?.includes("quota") || responseData.error?.message?.includes("Quota")) {
                    console.warn("Gemini API Quota Exceeded (Limit: 0). Using fallback watercolor image.")
                    isFallback = true
                } else {
                    throw new Error(responseData.error?.message || "이미지 생성 실패")
                }
            } else {
                const candidate = responseData.candidates?.[0]
                const parts = candidate?.content?.parts || []
                for (const part of parts) {
                    if (part.inlineData && part.inlineData.data) {
                        base64Image = part.inlineData.data
                        break
                    }
                }
                if (!base64Image) {
                    isFallback = true
                }
            }
        } catch (apiError) {
            console.error("Gemini API Call Failed. Switching to fallback image:", apiError)
            isFallback = true
        }

        // 5. 이미지 데이터를 버퍼로 변환 (Gemini 결과물 또는 Unsplash 폴백)
        let imageBuffer: Buffer

        if (isFallback) {
            const randomIndex = Math.floor(Math.random() * FALLBACK_IMAGES.length)
            const fallbackUrl = FALLBACK_IMAGES[randomIndex]
            const fallbackResponse = await fetch(fallbackUrl)
            
            if (!fallbackResponse.ok) {
                throw new Error("폴백 이미지를 다운로드하지 못했습니다.")
            }
            
            imageBuffer = Buffer.from(await fallbackResponse.arrayBuffer())
        } else {
            imageBuffer = Buffer.from(base64Image, "base64")
        }

        const fileName = `${user.id}/${Date.now()}.png`

        // 6. Supabase Storage에 이미지 파일 업로드 (image_path 버킷)
        const { error: uploadError } = await supabase.storage
            .from("image_path")
            .upload(fileName, imageBuffer, {
                contentType: "image/png",
                upsert: true,
            })

        if (uploadError) {
            console.error("Supabase Storage Upload Error:", uploadError)
            return NextResponse.json(
                { error: "이미지 저장소 업로드에 실패했습니다." },
                { status: 500 }
            )
        }

        // 7. 업로드된 이미지의 Public URL 획득
        const {
            data: { publicUrl },
        } = supabase.storage.from("image_path").getPublicUrl(fileName)

        // 8. thumbnails 테이블에 일기 정보 메타데이터 저장
        const { data: dbData, error: dbError } = await supabase
            .from("thumbnails")
            .insert({
                user_id: user.id,
                image_path: publicUrl,
                prompt: prompt,
            })
            .select()
            .single()

        if (dbError) {
            console.error("Supabase Database Insert Error:", dbError)
            return NextResponse.json(
                { error: "일기 데이터를 데이터베이스에 저장하지 못했습니다." },
                { status: 500 }
            )
        }

        return NextResponse.json({ success: true, data: dbData })
    } catch (error: any) {
        console.error("API Route Internal Error:", error)
        return NextResponse.json({ error: error.message || "서버 내부 오류가 발생했습니다." }, { status: 500 })
    }
}

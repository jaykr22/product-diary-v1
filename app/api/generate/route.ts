import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { buildDiaryImagePrompt } from "@/lib/prompts/diary-image-prompt"

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
        const { prompt, image, images } = await request.json()
        if (!prompt || typeof prompt !== "string") {
            return NextResponse.json({ error: "일기 내용(prompt)이 유효하지 않습니다." }, { status: 400 })
        }

        const openaiApiKey = process.env.OPENAI_API_KEY
        if (!openaiApiKey) {
            return NextResponse.json(
                { error: "OpenAI API 키가 설정되지 않았습니다. .env.local을 확인해 주세요." },
                { status: 500 }
            )
        }

        // 3. 시스템 프롬프트로 이미지 생성 프롬프트 강화 (lib/prompts/diary-image-prompt.ts)
        const enhancedPrompt = buildDiaryImagePrompt(prompt)

        // 4. OpenAI gpt-image-1 API 호출
        let response: Response

        const hasImages = (Array.isArray(images) && images.length > 0) || (typeof image === "string" && image.startsWith("data:"))
        const targetImage = Array.isArray(images) && images.length > 0 ? images[0] : image

        if (hasImages && targetImage) {
            const base64Data = targetImage.split(",")[1]
            if (!base64Data) {
                return NextResponse.json({ error: "유효하지 않은 이미지 데이터입니다." }, { status: 400 })
            }
            const imageBuffer = Buffer.from(base64Data, "base64")
            const imageBlob = new Blob([imageBuffer], { type: "image/png" })

            const openAiFormData = new FormData()
            openAiFormData.append("model", "gpt-image-1")
            openAiFormData.append("prompt", enhancedPrompt)
            openAiFormData.append("image", imageBlob, "image.png")
            openAiFormData.append("n", "1")
            openAiFormData.append("size", "1024x1024")

            response = await fetch("https://api.openai.com/v1/images/edits", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${openaiApiKey}`,
                },
                body: openAiFormData,
            })
        } else {
            response = await fetch("https://api.openai.com/v1/images/generations", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${openaiApiKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: "gpt-image-1",
                    prompt: enhancedPrompt,
                    n: 1,
                    size: "1024x1024",
                }),
            })
        }

        const responseData = await response.json()

        if (!response.ok) {
            console.error("OpenAI API Error:", responseData)
            throw new Error(responseData.error?.message || "이미지 생성에 실패했습니다.")
        }

        // gpt-image-1은 b64_json 또는 url 형태로 반환
        const imageItem = responseData.data?.[0]
        if (!imageItem) {
            throw new Error("이미지 데이터를 받지 못했습니다.")
        }

        // 5. 이미지 데이터 → Buffer 변환
        let imageBuffer: Buffer
        if (imageItem.b64_json) {
            imageBuffer = Buffer.from(imageItem.b64_json, "base64")
        } else if (imageItem.url) {
            const imgRes = await fetch(imageItem.url)
            if (!imgRes.ok) throw new Error("이미지 URL 다운로드에 실패했습니다.")
            imageBuffer = Buffer.from(await imgRes.arrayBuffer())
        } else {
            throw new Error("이미지 데이터 형식을 알 수 없습니다.")
        }
        const fileName = `${user.id}/${Date.now()}.png`

        // 6. Supabase Storage에 이미지 업로드
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

        // 7. Public URL 획득
        const {
            data: { publicUrl },
        } = supabase.storage.from("image_path").getPublicUrl(fileName)

        // 8. thumbnails 테이블에 메타데이터 저장
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

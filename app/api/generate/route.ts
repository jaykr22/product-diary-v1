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

        const openaiApiKey = process.env.OPENAI_API_KEY
        if (!openaiApiKey) {
            return NextResponse.json(
                { error: "OpenAI API 키가 설정되지 않았습니다. .env.local을 확인해 주세요." },
                { status: 500 }
            )
        }

        // 3. [DEBUG] GPT-4o-mini 분석 단계를 완전히 제거하고 사용자 원본 프롬프트를 직접 사용
        const finalPrompt = prompt

        console.log("=================== FINAL PROMPT (DIRECT) ===================")
        console.log(finalPrompt)
        console.log("=============================================================")

        // 4. OpenAI gpt-image-1 API 호출
        const requestBody = {
            model: "gpt-image-1",
            prompt: finalPrompt,
            n: 1,
            size: "1024x1024",
            quality: "high",
        }

        // [DEBUG 1] 실제 전송할 요청 Body 전체 출력
        console.log("=================== REQUEST BODY ===================")
        console.log(JSON.stringify(requestBody, null, 2))
        console.log("====================================================")

        const response = await fetch("https://api.openai.com/v1/images/generations", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${openaiApiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        })

        // [DEBUG 2] 응답 헤더 전체 출력
        console.log("=================== RESPONSE HEADERS ===================")
        response.headers.forEach((value, key) => {
            console.log(`  ${key}: ${value}`)
        })
        console.log("=========================================================")

        const responseData = await response.json()

        // [DEBUG 3] 응답 데이터 전체 출력 (revised_prompt, 모델 정보, 메타데이터 포함)
        console.log("=================== RESPONSE DATA (FULL) ===================")
        const debugData = {
            status: response.status,
            statusText: response.statusText,
            created: responseData.created,
            usage: responseData.usage,
            background: responseData.background,
            output_format: responseData.output_format,
            data_length: responseData.data?.length,
            first_item_keys: responseData.data?.[0] ? Object.keys(responseData.data[0]) : [],
            revised_prompt: responseData.data?.[0]?.revised_prompt ?? "없음",
            model: responseData.model ?? "응답에 포함 안됨",
        }
        console.log(JSON.stringify(debugData, null, 2))
        console.log("=============================================================")

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

        return NextResponse.json({ success: true, data: dbData, finalPrompt: finalPrompt })
    } catch (error: any) {
        console.error("API Route Internal Error:", error)
        return NextResponse.json({ error: error.message || "서버 내부 오류가 발생했습니다." }, { status: 500 })
    }
}

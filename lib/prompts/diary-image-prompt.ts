/**
 * 그림일기 이미지 생성 시스템 프롬프트
 *
 * Gemini Image Generation Prompt Guide 기반 구성:
 * Image type → Subject → Style → Lighting → Composition → Mood
 *
 * 참고: https://ai.google.dev/gemini-api/docs/image-generation#prompt-guide
 */

/**
 * 사용자의 일기 텍스트를 받아 Gemini 이미지 생성용 프롬프트를 반환합니다.
 * @param userDiary - 사용자가 입력한 오늘의 일기 내용
 */
export function buildDiaryImagePrompt(userDiary: string): string {
    return [
        // 1. Image type & Style
        "A warm and heartfelt picture diary illustration in a hand-painted watercolor and soft crayon style,",
        "reminiscent of a child's cozy sketchbook.",

        // 2. Subject & Context (사용자 입력)
        `The scene depicts: ${userDiary}`,

        // 3. Visual style details
        "Render the scene with loose, expressive brushstrokes, visible paper texture, and slightly uneven ink outlines",
        "as if drawn by hand with love.",

        // 4. Color palette
        "Use a gentle, pastel-leaning palette with pops of warm color — soft yellows, dusty pinks, sky blues, and sage greens.",
        "Keep the overall tone cheerful yet tender.",

        // 5. Lighting & Atmosphere
        "Soft, diffused natural lighting from above, creating gentle shadows without harsh contrasts.",
        "The atmosphere should feel nostalgic, intimate, and emotionally warm — like a cherished childhood memory.",

        // 6. Composition
        "Square format. Center the main subject with ample breathing room.",
        "Keep the composition simple and uncluttered, with meaningful negative space.",
    ].join(" ")
}

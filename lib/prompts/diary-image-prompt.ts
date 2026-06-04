/**
 * 그림일기 이미지 생성 시스템 프롬프트
 *
 * OpenAI DALL-E 이미지 생성 가이드 기반 구성:
 * Subject → Style/Medium → Details/Background → Color/Lighting → Composition
 *
 * 참고: https://platform.openai.com/docs/guides/images
 */

export const GPT_ANALYSIS_SYSTEM_PROMPT = `You are an expert prompt engineer for DALL-E 3 image generation.
Your task is to analyze the user's diary entry and their uploaded photo (if provided) to generate an optimized English image generation prompt.

Follow these rules:
1. If the user has uploaded a photo, carefully inspect the main person in the image. Extract their visual characteristics (e.g., gender, hair style/length/color, facial features, glasses, clothing style) to represent them as the main character in the output prompt. Make sure to describe this character consistently based on the photo.
2. Identify if the user has explicitly mentioned a painting style (e.g., "cyberpunk", "anime style", "pencil sketch", "oil painting", "digital art", "pixel art"), specific colors, or emotional mood in their diary entry.
3. If the user specified a style, color, or mood, prioritize and use it as the primary visual theme of the image. Do NOT force the default style.
4. If the user did NOT specify any style, colors, or mood, apply the default style:
   - "A warm and heartfelt picture diary illustration in a hand-painted watercolor and soft crayon style, reminiscent of a child's cozy sketchbook. Use a gentle, pastel-leaning palette (soft yellows, dusty pinks, sky blues, and sage greens) and soft, diffused natural lighting. The atmosphere should feel nostalgic, intimate, and emotionally warm."
5. Translate the core event/subject of the diary into clear, visual English descriptions, ensuring the character matching the user's photo is participating in the scene.
6. [CRITICAL] Make the prompt extremely detailed and rich in visual vocabulary. Explicitly describe intricate textures (e.g., paper grain, brush stroke details, fabric texture), detailed background decorations, facial expressions, and atmospheric lighting (e.g., cinematic rim lighting, volumetric soft glows) to maximize the rendering quality.
7. Do not use generic quality buzzwords like "photorealistic", "4k", "hyperrealistic".
8. Output MUST be in JSON format: { "enhancedPrompt": "..." }
`;

/**
 * 사용자의 일기 텍스트를 받아 이미지 생성용 프롬프트를 반환합니다. (GPT 분석 실패 시 Fallback 용도로 사용)
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

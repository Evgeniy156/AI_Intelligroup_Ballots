import { NextResponse } from "next/server"
import { GEMINI_RESPONSE_SCHEMA, SYSTEM_PROMPT } from "@/lib/gemini-schema"

const GEMINI_MODEL = "gemini-3-pro-preview"

function getGeminiUrl(apiKey: string, baseUrl: string) {
  const base = baseUrl.replace(/\/$/, "") // remove trailing slash if any
  return `${base}/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { imageBase64, apiKey } = body
    const baseUrl = body.baseUrl || "https://generativelanguage.googleapis.com/v1beta"

    if (!apiKey || typeof apiKey !== "string") {
      return NextResponse.json(
        { error: "API-ключ Gemini не указан" },
        { status: 400 }
      )
    }

    if (!imageBase64 || typeof imageBase64 !== "string") {
      return NextResponse.json(
        { error: "Изображение не предоставлено" },
        { status: 400 }
      )
    }

    const base64Data = imageBase64.includes(",")
      ? imageBase64.split(",")[1]
      : imageBase64

    console.log("[v0] Sending to Gemini model:", GEMINI_MODEL)
    console.log("[v0] Image base64 length:", base64Data.length)

    const geminiBody = {
      contents: [
        {
          parts: [
            { text: SYSTEM_PROMPT },
            {
              inline_data: {
                mime_type: "image/jpeg",
                data: base64Data,
              },
            },
          ],
        },
      ],
      generationConfig: {
        response_mime_type: "application/json",
        response_schema: GEMINI_RESPONSE_SCHEMA,
        temperature: 0.1,
      },
    }

    const url = getGeminiUrl(apiKey, baseUrl)
    console.log("[v0] Gemini URL (without key):", url.replace(apiKey, "***"))

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(geminiBody),
    })

    console.log("[v0] Gemini response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.log("[v0] Gemini error response:", errorText)
      let message = `Ошибка API Gemini (HTTP ${response.status})`

      if (response.status === 401 || response.status === 403) {
        message = "Неверный API-ключ Gemini. Проверьте ключ в настройках."
      } else if (response.status === 429) {
        message = "Превышен лимит запросов Gemini. Подождите минуту и попробуйте снова."
      } else if (response.status === 404) {
        message = `Модель ${GEMINI_MODEL} не найдена. Возможно, она недоступна для вашего ключа.`
      } else if (response.status === 400) {
        try {
          const errJson = JSON.parse(errorText)
          message = `Ошибка запроса: ${errJson?.error?.message || errorText}`
        } catch {
          message = `Ошибка запроса к Gemini: ${errorText.slice(0, 200)}`
        }
      }

      return NextResponse.json(
        { error: message, details: errorText },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log("[v0] Gemini response candidates:", data?.candidates?.length)

    const candidate = data?.candidates?.[0]
    if (candidate?.finishReason && candidate.finishReason !== "STOP") {
      console.log("[v0] Gemini finish reason:", candidate.finishReason)
      return NextResponse.json(
        { error: `Gemini не завершил обработку: ${candidate.finishReason}. Попробуйте снова.` },
        { status: 502 }
      )
    }

    const text = candidate?.content?.parts?.[0]?.text
    if (!text) {
      console.log("[v0] Gemini empty text. Full response:", JSON.stringify(data).slice(0, 500))
      return NextResponse.json(
        { error: "Gemini вернул пустой ответ. Попробуйте загрузить другое изображение." },
        { status: 502 }
      )
    }

    console.log("[v0] Gemini text (first 200 chars):", text.slice(0, 200))

    let parsed: Record<string, unknown>
    try {
      parsed = JSON.parse(text)
    } catch (e) {
      console.log("[v0] JSON parse error:", e)
      return NextResponse.json(
        { error: "Gemini вернул невалидный JSON. Попробуйте снова." },
        { status: 502 }
      )
    }

    return NextResponse.json({
      isStartPage: parsed.isStartPage ?? false,
      lastName: parsed.lastName ?? "",
      firstName: parsed.firstName ?? "",
      middleName: parsed.middleName ?? "",
      roomNo: parsed.roomNo ?? "",
      area: parsed.area ?? "",
      snils: parsed.snils ?? "",
      ownershipShare: parsed.ownershipShare ?? "",
      questions: Array.isArray(parsed.questions)
        ? parsed.questions.map(
          (q: { number?: number; text?: string; vote?: string | null }) => ({
            number: q.number ?? 0,
            text: q.text ?? "",
            vote:
              q.vote === "ЗА" || q.vote === "ПРОТИВ" || q.vote === "ВОЗДЕРЖАЛСЯ"
                ? q.vote
                : null,
          })
        )
        : [],
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Неизвестная ошибка"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

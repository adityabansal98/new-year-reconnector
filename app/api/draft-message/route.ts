import { GoogleGenerativeAI } from "@google/generative-ai"
import { NextRequest, NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
    try {
        const { resolution, name, position, company } = await request.json()

        if (!resolution || typeof resolution !== "string" || !resolution.trim()) {
            return NextResponse.json(
                { error: "Resolution is required" },
                { status: 400 }
            )
        }

        if (!name || typeof name !== "string" || !name.trim()) {
            return NextResponse.json(
                { error: "Contact name is required" },
                { status: 400 }
            )
        }

        const apiKey = process.env.GOOGLE_GEMINI_API_KEY
        if (!apiKey) {
            return NextResponse.json(
                { error: "Google Gemini API key is not configured" },
                { status: 500 }
            )
        }

        const genAI = new GoogleGenerativeAI(apiKey)
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

        const positionText = position || "their role"
        const companyText = company || "their company"

        const systemPrompt = `Draft a casual LinkedIn message to ${name} at ${companyText} (${positionText}). Mention I am working on ${resolution} and would love their perspective. Keep it under 300 characters. No hashtags. Make it friendly, professional, and concise.

IMPORTANT FORMATTING: Use line breaks to format the message properly. For example:
- After the greeting, add a line break
- Between paragraphs, add line breaks
- Keep sentences on separate lines where natural

Example format:
Hi [Name],

Hope you're doing well! I wanted to reach out because...

[rest of message]

Format your response with proper line breaks.`

        const result = await model.generateContent(systemPrompt)
        const response = await result.response
        const message = response.text().trim()

        // Ensure message is under 300 characters
        const finalMessage = message.length > 300 ? message.substring(0, 297) + "..." : message

        return NextResponse.json({ message: finalMessage })
    } catch (error) {
        console.error("Error drafting message:", error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to draft message" },
            { status: 500 }
        )
    }
}


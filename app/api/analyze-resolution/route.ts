import { GoogleGenerativeAI } from "@google/generative-ai"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
    try {
        const { resolution } = await request.json()

        if (!resolution || typeof resolution !== "string" || !resolution.trim()) {
            return NextResponse.json(
                { error: "Resolution is required" },
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
        // Try gemini-1.5-flash first, fallback to gemini-pro if not available
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

        const systemPrompt = `You are a career coach. Given a user's professional goal, return a strict JSON list of 10 keywords (titles, industries, companies) that would appear in a LinkedIn 'Position' or 'Company' column for useful contacts. Do not include markdown formatting. Return only a valid JSON array of strings, like: ["keyword1", "keyword2", ...]`

        const prompt = `${systemPrompt}\n\nUser's professional goal: ${resolution}`

        const result = await model.generateContent(prompt)
        const response = await result.response
        const text = response.text()

        // Parse the JSON response - handle cases where it might be wrapped in markdown code blocks
        let jsonText = text.trim()

        // Remove markdown code blocks if present
        if (jsonText.startsWith("```")) {
            jsonText = jsonText.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "")
        }

        // Parse the JSON array
        let keywords: string[]
        try {
            keywords = JSON.parse(jsonText)
        } catch (parseError) {
            // If parsing fails, try to extract array from the text
            const arrayMatch = jsonText.match(/\[.*\]/s)
            if (arrayMatch) {
                keywords = JSON.parse(arrayMatch[0])
            } else {
                throw new Error("Failed to parse keywords from AI response")
            }
        }

        // Ensure it's an array of strings
        if (!Array.isArray(keywords) || !keywords.every(k => typeof k === "string")) {
            return NextResponse.json(
                { error: "Invalid response format from AI" },
                { status: 500 }
            )
        }

        // Limit to 10 keywords
        const limitedKeywords = keywords.slice(0, 10)

        return NextResponse.json({ keywords: limitedKeywords })
    } catch (error) {
        console.error("Error analyzing resolution:", error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to analyze resolution" },
            { status: 500 }
        )
    }
}


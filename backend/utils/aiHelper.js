import { config } from 'dotenv'

config()

// Gemini Narrative
export const createAINarrative = async (input, fallbackNarrative) => {
    try {
        if (!process.env.GEMINI_API_KEY) {
            return fallbackNarrative
        }

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    text: `Write one short cinematic CineAura narrative. Do not mention AI. Do not ask questions. Keep it under 45 words.\n\n${input}`
                                }
                            ]
                        }
                    ]
                })
            }
        )

        if (!response.ok) {
            return fallbackNarrative
        }

        const data = await response.json()
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text

        return text || fallbackNarrative
    } catch (err) {
        return fallbackNarrative
    }
}

// Gemini Title
export const createAIHomeTitle = async (input, fallbackTitle) => {
    try {
        if (!process.env.GEMINI_API_KEY) {
            return fallbackTitle
        }

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    text: `Create one short movie collection title for CineAura. Return only the title. No quotes. ${input}`
                                }
                            ]
                        }
                    ]
                })
            }
        )

        if (!response.ok) {
            return fallbackTitle
        }

        const data = await response.json()
        const title = data.candidates?.[0]?.content?.parts?.[0]?.text

        return title ? title.trim() : fallbackTitle
    } catch (err) {
        return fallbackTitle
    }
}
